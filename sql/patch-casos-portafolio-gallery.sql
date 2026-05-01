-- Agregar columnas gallery y exocad_file a casos_portafolio
-- Ejecutar en Supabase SQL Editor

ALTER TABLE casos_portafolio
  ADD COLUMN IF NOT EXISTS gallery      JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS exocad_file  TEXT,
  ADD COLUMN IF NOT EXISTS code         TEXT,
  ADD COLUMN IF NOT EXISTS drive_link   TEXT,
  ADD COLUMN IF NOT EXISTS sort_order   INTEGER,
  ADD COLUMN IF NOT EXISTS material     TEXT;

-- Política de lectura pública (por si no existe)
DROP POLICY IF EXISTS "anon_read_portafolio" ON casos_portafolio;
CREATE POLICY "anon_read_portafolio" ON casos_portafolio
  FOR SELECT TO anon USING (visible = true);
