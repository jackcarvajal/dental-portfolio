-- ═══════════════════════════════════════════════════════════════
-- Aislar el portafolio por negocio (PRODIGY ↔ Alejandro CAD/CAM)
-- Problema: casos_portafolio es compartida y NO tenía columna `negocio`,
--           así que ambos portafolios mostraban los mismos casos.
-- Fix: agregar `negocio`, backfill de lo existente a 'prodigy'
--      (todos los casos actuales se crearon desde PRODIGY Admin).
-- Correr UNA sola vez. Alcanza para ambos repos (misma tabla física).
-- ═══════════════════════════════════════════════════════════════

-- 1. Agregar la columna con default 'prodigy' (backfillea filas existentes)
ALTER TABLE public.casos_portafolio
  ADD COLUMN IF NOT EXISTS negocio TEXT NOT NULL DEFAULT 'prodigy';

-- 2. Índice para el filtro del portafolio (WHERE negocio = ... AND visible)
CREATE INDEX IF NOT EXISTS idx_casos_portafolio_negocio
  ON public.casos_portafolio (negocio, visible);

-- 3. Verificación
SELECT negocio, count(*) AS casos
FROM public.casos_portafolio
GROUP BY negocio
ORDER BY negocio;
