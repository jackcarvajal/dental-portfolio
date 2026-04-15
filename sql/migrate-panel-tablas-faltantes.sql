-- ============================================================
-- PRODIGY — Tablas faltantes para panel-interno-operaciones
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- 1. Tabla clientes (usada en join de pedidos)
CREATE TABLE IF NOT EXISTS clientes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT,
    email       TEXT UNIQUE,
    clinica     TEXT,
    ciudad      TEXT,
    pais        TEXT DEFAULT 'Colombia',
    whatsapp    TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all_clientes" ON clientes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Tabla portfolio (galería de casos publicados)
CREATE TABLE IF NOT EXISTS portfolio (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo      TEXT NOT NULL,
    descripcion TEXT,
    categoria   TEXT,
    imagen_url  TEXT,
    activo      BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_portfolio" ON portfolio
    FOR SELECT TO anon USING (true);
CREATE POLICY "admin_write_portfolio" ON portfolio
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Bucket dental-cases para fotos de portafolio
INSERT INTO storage.buckets (id, name, public)
VALUES ('dental-cases', 'dental-cases', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "dental_cases_upload" ON storage.objects;
CREATE POLICY "dental_cases_upload" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'dental-cases');

DROP POLICY IF EXISTS "dental_cases_read" ON storage.objects;
CREATE POLICY "dental_cases_read" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'dental-cases');
