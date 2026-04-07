-- ================================================================
-- PRODIGY — Schema completo v2.0
-- Incluye: pedidos, pagos, push_subscriptions + RLS
--
-- INSTRUCCIONES:
--   Dashboard Supabase → SQL Editor → pegar y ejecutar completo
--   (Ejecutar DESPUÉS de rls-policies.sql si ya existe, o en lugar de él)
-- ================================================================


-- ----------------------------------------------------------------
-- EXTENSIONES
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ----------------------------------------------------------------
-- ENUM: estados del pedido
-- ----------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE estado_pedido AS ENUM (
        'Borrador',
        'En Diseño',
        'En Revisión',
        'Aprobado',
        'En Producción',
        'Listo para Entrega',
        'Entregado',
        'Cancelado'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ----------------------------------------------------------------
-- TABLA: pedidos
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedidos (
    id                  uuid        DEFAULT uuid_generate_v4() PRIMARY KEY,
    codigo              text        NOT NULL UNIQUE,          -- 'PRD-XXXXXX'

    -- Doctor / cliente
    doctor_uid          uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre_doctor       text,
    email               text,
    telefono            text,       -- Con código país: '573001234567'

    -- Paciente
    nombre_paciente     text,

    -- Trabajo
    servicio            text        NOT NULL,                 -- 'Diseño', 'Fresado', 'Impresión'
    material            text,
    submaterial         text,
    color_vita          text,
    piezas              text[],                               -- Array de números de pieza
    cantidad            int         DEFAULT 1,
    instrucciones       text,
    oclusión            text,
    espacio_cemento     text,
    proceso             text,       -- 'crudo', 'terminado', etc.

    -- Archivos
    archivo_stl_path    text,       -- path en bucket dental-cases
    archivo_final_path  text,
    foto_salida_path    text,
    exocad_link         text,

    -- Finanzas
    monto_base          numeric(12,2),
    monto_total         numeric(12,2),
    moneda              text        DEFAULT 'COP',
    pasarela            text,       -- 'wompi','paypal','paddle','transferencia'

    -- Estado y fechas
    estado              estado_pedido DEFAULT 'Borrador',
    slot_express        boolean     DEFAULT false,
    fecha_ingreso       timestamptz,
    fecha_entrega       timestamptz,
    notas_operador      text,

    -- Auditoría
    created_at          timestamptz DEFAULT now(),
    updated_at          timestamptz DEFAULT now()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_pedidos_codigo     ON pedidos(codigo);
CREATE INDEX IF NOT EXISTS idx_pedidos_doctor_uid ON pedidos(doctor_uid);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado     ON pedidos(estado);

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_pedidos_updated_at ON pedidos;
CREATE TRIGGER trg_pedidos_updated_at
    BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ----------------------------------------------------------------
-- TABLA: pagos
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
    id              uuid        DEFAULT uuid_generate_v4() PRIMARY KEY,
    pedido_id       uuid        REFERENCES pedidos(id) ON DELETE CASCADE,
    pedido_codigo   text,       -- Desnormalizado para lookups rápidos

    -- Transacción
    referencia      text        NOT NULL UNIQUE,   -- ID externo de la pasarela
    pasarela        text        NOT NULL,           -- 'wompi','paypal','paddle','transferencia'
    estado_pago     text        DEFAULT 'pendiente', -- 'pendiente','aprobado','rechazado','reembolsado'

    -- Montos
    monto_base      numeric(12,2) NOT NULL,
    recargo_pct     numeric(5,4)  DEFAULT 0,
    recargo_amt     numeric(12,2) DEFAULT 0,
    monto_total     numeric(12,2) NOT NULL,
    moneda          text          DEFAULT 'COP',
    monto_usd       numeric(12,2),            -- Conversión si aplica

    -- Metadata de la pasarela
    payload_raw     jsonb,                    -- Webhook payload completo

    -- Auditoría
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pagos_pedido_id  ON pagos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pagos_referencia ON pagos(referencia);
CREATE INDEX IF NOT EXISTS idx_pagos_estado     ON pagos(estado_pago);

DROP TRIGGER IF EXISTS trg_pagos_updated_at ON pagos;
CREATE TRIGGER trg_pagos_updated_at
    BEFORE UPDATE ON pagos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ----------------------------------------------------------------
-- TABLA: push_subscriptions
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          uuid    DEFAULT uuid_generate_v4() PRIMARY KEY,
    case_id     text    NOT NULL,              -- Código del pedido
    endpoint    text    NOT NULL UNIQUE,       -- URL del push endpoint del browser
    p256dh      text    NOT NULL,              -- Clave pública ECDH (base64)
    auth        text    NOT NULL,              -- Auth secret (base64)
    user_agent  text,
    created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_case_id ON push_subscriptions(case_id);


-- ================================================================
-- RLS — Row Level Security
-- ================================================================

-- pedidos
ALTER TABLE pedidos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Helpers: lista de emails admin
CREATE OR REPLACE FUNCTION es_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
    SELECT auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com');
$$;

-- ---- PEDIDOS ----
DROP POLICY IF EXISTS "pedidos_select_owner"  ON pedidos;
DROP POLICY IF EXISTS "pedidos_select_admin"  ON pedidos;
DROP POLICY IF EXISTS "pedidos_insert_owner"  ON pedidos;
DROP POLICY IF EXISTS "pedidos_update_admin"  ON pedidos;
DROP POLICY IF EXISTS "pedidos_update_owner"  ON pedidos;

CREATE POLICY "pedidos_select_owner" ON pedidos
    FOR SELECT TO authenticated USING (doctor_uid = auth.uid());

CREATE POLICY "pedidos_select_admin" ON pedidos
    FOR SELECT TO authenticated USING (es_admin());

CREATE POLICY "pedidos_insert_owner" ON pedidos
    FOR INSERT TO authenticated WITH CHECK (doctor_uid = auth.uid());

CREATE POLICY "pedidos_update_admin" ON pedidos
    FOR UPDATE TO authenticated USING (es_admin());

-- ---- PAGOS (solo admin + service_role) ----
DROP POLICY IF EXISTS "pagos_select_admin" ON pagos;
DROP POLICY IF EXISTS "pagos_insert_fn"   ON pagos;

CREATE POLICY "pagos_select_admin" ON pagos
    FOR SELECT TO authenticated USING (es_admin());

-- ---- PUSH SUBSCRIPTIONS (cualquier autenticado inserta la suya) ----
DROP POLICY IF EXISTS "push_insert_any"  ON push_subscriptions;
DROP POLICY IF EXISTS "push_select_admin" ON push_subscriptions;
DROP POLICY IF EXISTS "push_delete_admin" ON push_subscriptions;

CREATE POLICY "push_insert_any" ON push_subscriptions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "push_select_admin" ON push_subscriptions
    FOR SELECT TO authenticated USING (es_admin());

CREATE POLICY "push_delete_admin" ON push_subscriptions
    FOR DELETE TO authenticated USING (es_admin());


-- ================================================================
-- VISTA: pedidos_operador (sin PII)
-- ================================================================
CREATE OR REPLACE VIEW pedidos_operador AS
    SELECT
        id, codigo, servicio, material, submaterial,
        cantidad, color_vita, piezas, instrucciones,
        oclusión, espacio_cemento, proceso,
        estado, slot_express,
        fecha_ingreso, fecha_entrega,
        archivo_stl_path, archivo_final_path,
        foto_salida_path, exocad_link,
        notas_operador, created_at, updated_at
        -- OMITIDOS: doctor_uid, nombre_doctor, email, telefono, nombre_paciente
    FROM pedidos;


-- ================================================================
-- STORAGE: bucket dental-cases (privado)
-- ================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('dental-cases', 'dental-cases', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "dc_upload_owner"  ON storage.objects;
DROP POLICY IF EXISTS "dc_select_owner"  ON storage.objects;
DROP POLICY IF EXISTS "dc_select_admin"  ON storage.objects;
DROP POLICY IF EXISTS "dc_delete_admin"  ON storage.objects;

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
