-- ================================================================
-- PRODIGY — Portafolio Online
-- Casos clínicos públicos almacenados en Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ================================================================

-- 1. TABLA
CREATE TABLE IF NOT EXISTS casos_portafolio (
  id            TEXT PRIMARY KEY,                  -- "patient-001"
  name          TEXT NOT NULL,
  code          TEXT,
  type          TEXT,
  date          TEXT,
  description   TEXT,
  cover_image   TEXT,                              -- URL pública Storage
  exocad_file   TEXT,                              -- URL pública Storage (opcional)
  drive_link    TEXT,
  gallery       JSONB DEFAULT '[]'::jsonb,         -- array de URLs públicas
  gallery_count INT   DEFAULT 0,
  visible       BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS
ALTER TABLE casos_portafolio ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer casos visibles (portafolio público)
CREATE POLICY "portafolio_public_read"
  ON casos_portafolio FOR SELECT
  USING (visible = TRUE);

-- Solo usuarios autenticados pueden escribir / editar / borrar
CREATE POLICY "portafolio_auth_insert"
  ON casos_portafolio FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "portafolio_auth_update"
  ON casos_portafolio FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "portafolio_auth_delete"
  ON casos_portafolio FOR DELETE
  USING (auth.role() = 'authenticated');

-- ================================================================
-- STORAGE (hazlo desde el Dashboard de Supabase, NO por SQL):
--   Storage → New bucket → nombre: "portafolio" → Public: ✅
-- ================================================================
