-- ═══════════════════════════════════════════════════════════════
-- Rutear los leads del escáner por negocio (PRODIGY ↔ Alejandro)
-- Problema: solicitudes_scanner es compartida y NO tiene `negocio`,
--           así que no se sabe de qué marca vino el lead → riesgo de
--           cotizar en la moneda/tarifa equivocada.
-- OJO: en el pasado el front insertaba `negocio` sin que la columna
--      existiera → 400 → se PERDÍAN solicitudes. Por eso esta columna
--      DEBE existir ANTES de desplegar el código que la inserta.
-- Correr UNA sola vez (tabla compartida, alcanza para ambos repos).
-- ═══════════════════════════════════════════════════════════════

-- 1. Agregar la columna (nullable: los leads viejos quedan NULL = "sin marca",
--    se seguirán viendo en ambos paneles; los nuevos vienen etiquetados)
ALTER TABLE public.solicitudes_scanner
  ADD COLUMN IF NOT EXISTS negocio TEXT;

-- 2. Índice para el filtro del panel
CREATE INDEX IF NOT EXISTS idx_solicitudes_scanner_negocio
  ON public.solicitudes_scanner (negocio, created_at DESC);

-- 3. Verificación
SELECT COALESCE(negocio,'(sin marca / legacy)') AS negocio, count(*) AS leads
FROM public.solicitudes_scanner
GROUP BY negocio
ORDER BY negocio;
