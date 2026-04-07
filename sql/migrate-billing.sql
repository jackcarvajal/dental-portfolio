-- =============================================
-- MIGRACIÓN: Datos de facturación electrónica (DIAN)
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Tabla de perfiles fiscales (reutilizable por cliente)
CREATE TABLE IF NOT EXISTS perfiles_fiscales (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nit_cedula  TEXT NOT NULL,
    tipo_doc    TEXT NOT NULL DEFAULT 'NIT',
    razon_social TEXT NOT NULL,
    email_factura TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Columnas de facturación en pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS requiere_factura BOOLEAN DEFAULT false;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS billing_tipo     TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS billing_nit      TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS billing_razon    TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS billing_email    TEXT;

-- RLS: solo el dueño puede leer sus perfiles fiscales
ALTER TABLE perfiles_fiscales ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "perfil_fiscal_propietario" ON perfiles_fiscales
        FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
