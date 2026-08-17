-- ============================================================
-- PRODIGY — RPCs de reportes admin
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Pedidos por material (último mes)
CREATE OR REPLACE FUNCTION public.prodigy_pedidos_por_material(p_dias int DEFAULT 30)
RETURNS TABLE(material text, total bigint, ingresos numeric, pct_total numeric)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _total bigint;
BEGIN
  SELECT COUNT(*) INTO _total FROM public.pedidos
  WHERE negocio='prodigy' AND created_at > now() - (p_dias||' days')::interval;
  RETURN QUERY
  SELECT
    COALESCE(p.material, p.tipo_trabajo, 'otro') AS material,
    COUNT(*) AS total,
    SUM(COALESCE(p.precio_total::numeric, p.monto_total::numeric, 0)) AS ingresos,
    CASE WHEN _total > 0 THEN ROUND(COUNT(*)::numeric/_total*100,1) ELSE 0 END AS pct_total
  FROM public.pedidos p
  WHERE p.negocio='prodigy'
    AND p.created_at > now() - (p_dias||' days')::interval
  GROUP BY COALESCE(p.material, p.tipo_trabajo, 'otro')
  ORDER BY total DESC LIMIT 15;
END;
$$;

-- 2. Ingresos por día (últimos N días)
CREATE OR REPLACE FUNCTION public.prodigy_ingresos_por_dia(p_dias int DEFAULT 30)
RETURNS TABLE(fecha date, pedidos bigint, ingresos numeric)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(p.created_at) AS fecha,
    COUNT(*) AS pedidos,
    SUM(COALESCE(p.precio_total::numeric, p.monto_total::numeric, 0)) AS ingresos
  FROM public.pedidos p
  WHERE p.negocio='prodigy'
    AND p.created_at > now() - (p_dias||' days')::interval
  GROUP BY DATE(p.created_at)
  ORDER BY fecha DESC;
END;
$$;

-- 3. Tasa de conversión por flujo
CREATE OR REPLACE FUNCTION public.prodigy_conversion_por_flujo(p_dias int DEFAULT 30)
RETURNS TABLE(flujo text, pedidos bigint, entregados bigint, tasa_entrega numeric, ingreso_promedio numeric)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(p.flujo,'otro') AS flujo,
    COUNT(*) AS pedidos,
    COUNT(*) FILTER (WHERE p.estado_operativo IN ('ENTREGADO','LISTO_DESPACHAR')) AS entregados,
    CASE WHEN COUNT(*)>0 THEN ROUND(COUNT(*) FILTER (WHERE p.estado_operativo IN ('ENTREGADO','LISTO_DESPACHAR'))::numeric/COUNT(*)*100,1) ELSE 0 END AS tasa_entrega,
    ROUND(AVG(COALESCE(p.precio_total::numeric, p.monto_total::numeric, 0)),0) AS ingreso_promedio
  FROM public.pedidos p
  WHERE p.negocio='prodigy'
    AND p.created_at > now() - (p_dias||' days')::interval
  GROUP BY COALESCE(p.flujo,'otro')
  ORDER BY pedidos DESC;
END;
$$;

-- 4. Top doctores por volumen
CREATE OR REPLACE FUNCTION public.prodigy_top_doctores(p_dias int DEFAULT 90, p_limit int DEFAULT 10)
RETURNS TABLE(doctor text, pedidos bigint, ingresos numeric, ultimo_pedido date)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(p.nombre_doctor, 'Anónimo') AS doctor,
    COUNT(*) AS pedidos,
    SUM(COALESCE(p.precio_total::numeric, p.monto_total::numeric, 0)) AS ingresos,
    MAX(DATE(p.created_at)) AS ultimo_pedido
  FROM public.pedidos p
  WHERE p.negocio='prodigy'
    AND p.created_at > now() - (p_dias||' days')::interval
  GROUP BY COALESCE(p.nombre_doctor, 'Anónimo')
  ORDER BY ingresos DESC LIMIT p_limit;
END;
$$;

-- GRANTs
GRANT EXECUTE ON FUNCTION public.prodigy_pedidos_por_material(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_ingresos_por_dia(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_conversion_por_flujo(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_top_doctores(int,int) TO authenticated;

SELECT 'RPCs reportes admin OK' AS status;
