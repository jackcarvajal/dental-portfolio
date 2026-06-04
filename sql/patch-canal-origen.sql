-- ============================================================
-- PRODIGY — Columna canal_origen en pedidos
-- Para analítica de qué canal de marketing genera más pedidos
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Agregar columna si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='pedidos' AND column_name='canal_origen'
  ) THEN
    ALTER TABLE public.pedidos ADD COLUMN canal_origen text;
    COMMENT ON COLUMN public.pedidos.canal_origen IS 'Canal de adquisición: seo, whatsapp, referido, directo, instagram, google_ads, etc.';
  END IF;
END;
$$;

-- 2. Índice para analytics por canal
CREATE INDEX IF NOT EXISTS idx_pedidos_canal ON public.pedidos (canal_origen, negocio, created_at DESC)
WHERE canal_origen IS NOT NULL;

-- 3. RPC: ingresos por canal de origen
CREATE OR REPLACE FUNCTION public.prodigy_ingresos_por_canal(p_dias int DEFAULT 90)
RETURNS TABLE(canal text, pedidos bigint, ingresos numeric, pct_pedidos numeric)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _total bigint;
BEGIN
  SELECT COUNT(*) INTO _total FROM public.pedidos
  WHERE negocio='prodigy' AND created_at > now() - (p_dias||' days')::interval;
  RETURN QUERY
  SELECT
    COALESCE(p.canal_origen,'directo') AS canal,
    COUNT(*) AS pedidos,
    SUM(COALESCE(p.total::numeric, p.precio_total::numeric, 0)) AS ingresos,
    CASE WHEN _total>0 THEN ROUND(COUNT(*)::numeric/_total*100,1) ELSE 0 END AS pct_pedidos
  FROM public.pedidos p
  WHERE p.negocio='prodigy'
    AND p.created_at > now() - (p_dias||' days')::interval
  GROUP BY COALESCE(p.canal_origen,'directo')
  ORDER BY pedidos DESC LIMIT 10;
END;
$$;

GRANT EXECUTE ON FUNCTION public.prodigy_ingresos_por_canal(int) TO authenticated;

SELECT 'canal_origen OK' AS status;
