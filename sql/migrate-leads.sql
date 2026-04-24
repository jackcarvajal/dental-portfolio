-- ────────────────────────────────────────────────────────────────
-- PRODIGY — Tabla leads_doctores (Journal Lead Magnet)
-- Ejecutar en Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads_doctores (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre              TEXT        NOT NULL,
    whatsapp            TEXT        NOT NULL,
    recurso_descargado  TEXT        NOT NULL DEFAULT 'Guía Clínica 2026: Zirconio Multicapa vs Disilicato',
    fecha_descarga      TIMESTAMPTZ NOT NULL DEFAULT now(),
    contactado          BOOLEAN     NOT NULL DEFAULT false,
    notas               TEXT
);

ALTER TABLE leads_doctores ENABLE ROW LEVEL SECURITY;

-- INSERT público (anon key) — cualquier visitante puede registrarse
DROP POLICY IF EXISTS "public_insert_leads" ON leads_doctores;
CREATE POLICY "public_insert_leads" ON leads_doctores
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Solo usuarios autenticados pueden leer y actualizar (anon solo puede INSERT)
DROP POLICY IF EXISTS "admin_read_leads" ON leads_doctores;
CREATE POLICY "admin_read_leads" ON leads_doctores
    FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_leads_fecha      ON leads_doctores(fecha_descarga DESC);
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp   ON leads_doctores(whatsapp);
CREATE INDEX IF NOT EXISTS idx_leads_contactado ON leads_doctores(contactado);
