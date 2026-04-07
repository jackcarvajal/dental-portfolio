-- ================================================================
-- PRODIGY — Migración: agregar columnas faltantes a tabla pedidos
-- Ejecutar en Supabase SQL Editor si pedidos ya existía sin doctor_uid
-- ================================================================

-- Columnas faltantes en pedidos (ALTER seguro con IF NOT EXISTS)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS doctor_uid        uuid        REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS nombre_doctor     text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS email             text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS telefono          text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS nombre_paciente   text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS material          text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS submaterial       text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS color_vita        text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS piezas            text[];
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cantidad          int          DEFAULT 1;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS instrucciones     text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS oclusión          text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS espacio_cemento   text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS proceso           text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS archivo_stl_path  text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS archivo_final_path text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS foto_salida_path  text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS exocad_link       text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS monto_base        numeric(12,2);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS monto_total       numeric(12,2);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS moneda            text         DEFAULT 'COP';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS pasarela          text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS slot_express      boolean      DEFAULT false;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_ingreso     timestamptz;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_entrega     timestamptz;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS notas_operador    text;

-- Índices (IF NOT EXISTS seguro)
CREATE INDEX IF NOT EXISTS idx_pedidos_doctor_uid ON pedidos(doctor_uid);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado     ON pedidos(estado);

-- ----------------------------------------------------------------
-- ENUM estado_pedido (si no existe)
-- ----------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE estado_pedido AS ENUM (
        'Borrador','En Diseño','En Revisión','Aprobado',
        'En Producción','Listo para Entrega','Entregado','Cancelado'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Agregar columna estado si no existe (tipo text primero, luego cast)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS estado text DEFAULT 'Borrador';

-- ----------------------------------------------------------------
-- Función y trigger updated_at
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS trg_pedidos_updated_at ON pedidos;
CREATE TRIGGER trg_pedidos_updated_at
    BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- Función es_admin
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION es_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
    SELECT auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com');
$$;

-- ----------------------------------------------------------------
-- RLS pedidos
-- ----------------------------------------------------------------
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pedidos_select_owner" ON pedidos;
DROP POLICY IF EXISTS "pedidos_select_admin" ON pedidos;
DROP POLICY IF EXISTS "pedidos_insert_owner" ON pedidos;
DROP POLICY IF EXISTS "pedidos_update_admin" ON pedidos;

CREATE POLICY "pedidos_select_owner" ON pedidos
    FOR SELECT TO authenticated USING (doctor_uid = auth.uid());

CREATE POLICY "pedidos_select_admin" ON pedidos
    FOR SELECT TO authenticated USING (es_admin());

CREATE POLICY "pedidos_insert_owner" ON pedidos
    FOR INSERT TO authenticated WITH CHECK (doctor_uid = auth.uid());

CREATE POLICY "pedidos_update_admin" ON pedidos
    FOR UPDATE TO authenticated USING (es_admin());

-- ----------------------------------------------------------------
-- Tabla pagos (si no existe) + columnas faltantes si ya existía
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
    id              uuid        DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

ALTER TABLE pagos ADD COLUMN IF NOT EXISTS pedido_id       uuid        REFERENCES pedidos(id) ON DELETE CASCADE;
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS pedido_codigo   text;
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS referencia      text;
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS pasarela        text;
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS estado_pago     text        DEFAULT 'pendiente';
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS monto_base      numeric(12,2);
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS recargo_pct     numeric(5,4) DEFAULT 0;
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS recargo_amt     numeric(12,2) DEFAULT 0;
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS monto_total     numeric(12,2);
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS moneda          text         DEFAULT 'COP';
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS monto_usd       numeric(12,2);
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS payload_raw     jsonb;

-- Unique constraint en referencia (solo si no existe)
DO $$ BEGIN
    ALTER TABLE pagos ADD CONSTRAINT pagos_referencia_unique UNIQUE (referencia);
EXCEPTION WHEN duplicate_table THEN NULL;
           WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_pagos_pedido_id  ON pagos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pagos_referencia ON pagos(referencia);

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pagos_select_admin" ON pagos;
CREATE POLICY "pagos_select_admin" ON pagos
    FOR SELECT TO authenticated USING (es_admin());

-- ----------------------------------------------------------------
-- Tabla push_subscriptions (si no existe)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          uuid    DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_id     text    NOT NULL,
    endpoint    text    NOT NULL UNIQUE,
    p256dh      text    NOT NULL,
    auth        text    NOT NULL,
    user_agent  text,
    created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_case_id ON push_subscriptions(case_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_insert_any"   ON push_subscriptions;
DROP POLICY IF EXISTS "push_select_admin" ON push_subscriptions;
DROP POLICY IF EXISTS "push_delete_admin" ON push_subscriptions;

CREATE POLICY "push_insert_any" ON push_subscriptions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "push_select_admin" ON push_subscriptions
    FOR SELECT TO authenticated USING (es_admin());

CREATE POLICY "push_delete_admin" ON push_subscriptions
    FOR DELETE TO authenticated USING (es_admin());

-- ----------------------------------------------------------------
-- Storage bucket dental-cases
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('dental-cases', 'dental-cases', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "dc_upload_owner" ON storage.objects;
DROP POLICY IF EXISTS "dc_select_owner" ON storage.objects;
DROP POLICY IF EXISTS "dc_select_admin" ON storage.objects;
DROP POLICY IF EXISTS "dc_delete_admin" ON storage.objects;

CREATE POLICY "dc_upload_owner" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'dental-cases'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "dc_select_owner" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'dental-cases'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "dc_select_admin" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'dental-cases' AND es_admin());

CREATE POLICY "dc_delete_admin" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'dental-cases' AND es_admin());
