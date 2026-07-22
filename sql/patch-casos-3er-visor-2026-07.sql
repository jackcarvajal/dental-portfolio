-- ═══════════════════════════════════════════════════════════════════
-- PATCH: 3er visor Exocad por caso (revisiones / propuestas apiladas)
-- casos_portafolio ya tiene exocad_file, exocad_file_2, label_1, label_2, gallery_2.
-- Esto agrega el 3er slot para mostrar hasta 3 diseños/revisiones uno debajo de otro.
-- Ejecutar UNA vez en Supabase → SQL Editor. Idempotente.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.casos_portafolio
  ADD COLUMN IF NOT EXISTS exocad_file_3 text,
  ADD COLUMN IF NOT EXISTS label_3       text,
  ADD COLUMN IF NOT EXISTS gallery_3     jsonb DEFAULT '[]'::jsonb;

-- Sin cambios de RLS/GRANT: son columnas nuevas en una tabla existente
-- (los GRANT explícitos solo aplican a TABLAS nuevas desde oct-2026).

COMMENT ON COLUMN public.casos_portafolio.exocad_file_3 IS 'URL del 3er visor Exocad (3ra revisión/propuesta)';
COMMENT ON COLUMN public.casos_portafolio.label_3       IS 'Etiqueta del 3er diseño (ej. "Revisión 2")';
COMMENT ON COLUMN public.casos_portafolio.gallery_3     IS 'Galería de imágenes del 3er diseño';
