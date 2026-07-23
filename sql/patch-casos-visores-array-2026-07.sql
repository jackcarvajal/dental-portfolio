-- ═══════════════════════════════════════════════════════════════════
-- PATCH: visores Exocad como ARRAY (escala a 5+ revisiones por caso)
-- Array JSONB: [{ "url": "...", "label": "Propuesta inicial" }, ...]
-- El código lee exocad_visores si existe; si no, cae a exocad_file/_2/_3.
-- Ejecutar UNA vez en Supabase → SQL Editor. Idempotente y sin riesgo.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.casos_portafolio
  ADD COLUMN IF NOT EXISTS exocad_visores jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.casos_portafolio.exocad_visores IS
  'Array de visores Exocad: [{url,label}] — soporta N revisiones por caso';
