-- ============================================================
-- PRODIGY — Columna negocio en cotizaciones
-- Ejecutar en Supabase Dashboard → SQL Editor
-- Separa cotizaciones de PRODIGY vs alejandrocadcam
-- ============================================================

-- 1. Añadir columna negocio si no existe
ALTER TABLE public.cotizaciones
  ADD COLUMN IF NOT EXISTS negocio text NOT NULL DEFAULT 'prodigy';

-- 2. Marcar las existentes sin negocio como 'prodigy' (ya cubierto por DEFAULT)
UPDATE public.cotizaciones
  SET negocio = 'prodigy'
  WHERE negocio IS NULL OR negocio = '';

-- 3. Índice para filtrar por negocio eficientemente
CREATE INDEX IF NOT EXISTS idx_cotizaciones_negocio
  ON public.cotizaciones (negocio, created_at DESC);

-- 4. RLS: cada negocio ve solo sus propias cotizaciones
--    (la política existente de autenticación sigue activa)
--    Política de lectura para staff autenticado ya existe;
--    agregamos restricción por negocio si se desea aislamiento total.
--    Por ahora solo el índice — el filtro se hace en la query JS.

-- Verificación
SELECT negocio, count(*) FROM public.cotizaciones GROUP BY negocio ORDER BY count DESC;
