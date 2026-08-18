-- ============================================================
-- PRODIGY + Alejandro — RPCs de analytics de conversión
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tasa de conversión cotización→pedido por tipo (PRODIGY)
CREATE OR REPLACE FUNCTION public.prodigy_conversion_por_tipo(
  p_desde timestamptz DEFAULT now() - interval '30 days'
)
RETURNS TABLE (
  tipo text,
  cotizaciones_total bigint,
  cotizaciones_aceptadas bigint,
  pedidos_generados bigint,
  tasa_conversion numeric,
  ingreso_promedio numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH cots AS (
    SELECT c.tipo, count(*) AS total,
           count(*) FILTER (WHERE c.estado = 'aceptada') AS aceptadas,
           avg(c.total) AS avg_total
    FROM public.cotizaciones c
    WHERE c.negocio = 'prodigy' AND c.created_at >= p_desde
    GROUP BY c.tipo
  ),
  peds AS (
    SELECT p.servicio AS tipo, count(*) AS cnt
    FROM public.pedidos p
    WHERE p.created_at >= p_desde
      AND p.estado::text NOT IN ('Cancelado','cancelado','CANCELADO')
    GROUP BY p.servicio
  )
  SELECT
    cots.tipo,
    cots.total AS cotizaciones_total,
    cots.aceptadas AS cotizaciones_aceptadas,
    COALESCE(peds.cnt, 0) AS pedidos_generados,
    CASE WHEN cots.total > 0
         THEN round(COALESCE(peds.cnt,0)::numeric / cots.total * 100, 1)
         ELSE 0 END AS tasa_conversion,
    round(cots.avg_total::numeric, 0) AS ingreso_promedio
  FROM cots
  LEFT JOIN peds USING (tipo)
  ORDER BY tasa_conversion DESC;
END;
$$;

-- 2. Tendencia semanal de conversión (ambos proyectos)
CREATE OR REPLACE FUNCTION public.prodigy_tendencia_conversion(
  p_negocio text DEFAULT 'prodigy',
  p_semanas int DEFAULT 8
)
RETURNS TABLE (
  semana text,
  cotizaciones bigint,
  aceptadas bigint,
  tasa_pct numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_char(date_trunc('week', c.created_at), 'DD Mon') AS semana,
    count(*) AS cotizaciones,
    count(*) FILTER (WHERE c.estado IN ('aceptada','borrador')) AS aceptadas,
    CASE WHEN count(*) > 0
         THEN round(count(*) FILTER (WHERE c.estado IN ('aceptada'))::numeric / count(*) * 100, 1)
         ELSE 0 END AS tasa_pct
  FROM public.cotizaciones c
  WHERE c.negocio = p_negocio
    AND c.created_at >= now() - (p_semanas || ' weeks')::interval
  GROUP BY date_trunc('week', c.created_at)
  ORDER BY date_trunc('week', c.created_at);
END;
$$;

-- 3. Alejandro — dashboard semanal extendido con cotizaciones
CREATE OR REPLACE FUNCTION public.alejandro_dashboard_semana_v2()
RETURNS TABLE (
  pedidos_semana bigint,
  pedidos_mes bigint,
  ingresos_semana numeric,
  ingresos_mes numeric,
  en_diseno bigint,
  leads_semana bigint,
  cotizaciones_semana bigint,
  cotizaciones_aceptadas bigint,
  tasa_conversion numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM public.pedidos WHERE created_at >= now()-interval '7 days' AND negocio='alejandrocadcam') AS pedidos_semana,
    (SELECT count(*) FROM public.pedidos WHERE created_at >= now()-interval '30 days' AND negocio='alejandrocadcam') AS pedidos_mes,
    (SELECT COALESCE(sum(precio_total),0) FROM public.pedidos WHERE created_at >= now()-interval '7 days' AND negocio='alejandrocadcam' AND pago_estado='pago_confirmado') AS ingresos_semana,
    (SELECT COALESCE(sum(precio_total),0) FROM public.pedidos WHERE created_at >= now()-interval '30 days' AND negocio='alejandrocadcam' AND pago_estado='pago_confirmado') AS ingresos_mes,
    (SELECT count(*) FROM public.pedidos WHERE negocio='alejandrocadcam' AND estado_operativo IN ('EN_DISENO','REVISION_CLIENTE')) AS en_diseno,
    (SELECT count(*) FROM public.leads_doctores WHERE created_at >= now()-interval '7 days') AS leads_semana,
    (SELECT count(*) FROM public.cotizaciones WHERE negocio='alejandrocadcam' AND created_at >= now()-interval '7 days') AS cotizaciones_semana,
    (SELECT count(*) FROM public.cotizaciones WHERE negocio='alejandrocadcam' AND estado='aceptada' AND created_at >= now()-interval '30 days') AS cotizaciones_aceptadas,
    (SELECT CASE WHEN count(*)>0 THEN round(count(*) FILTER (WHERE estado='aceptada')::numeric/count(*)*100,1) ELSE 0 END
     FROM public.cotizaciones WHERE negocio='alejandrocadcam' AND created_at >= now()-interval '30 days') AS tasa_conversion;
END;
$$;

-- 4. PRODIGY — CLV por doctor (Customer Lifetime Value)
CREATE OR REPLACE FUNCTION public.prodigy_clv_doctores(p_limit int DEFAULT 20)
RETURNS TABLE (
  email text,
  nombre text,
  pedidos_total bigint,
  ingresos_total numeric,
  primer_pedido date,
  ultimo_pedido date,
  dias_activo int,
  clv_mensual numeric
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.email,
    max(p.nombre_doctor) AS nombre,
    count(*) AS pedidos_total,
    sum(COALESCE(p.precio_total,0)) AS ingresos_total,
    min(p.created_at::date) AS primer_pedido,
    max(p.created_at::date) AS ultimo_pedido,
    (max(p.created_at::date) - min(p.created_at::date) + 1)::int AS dias_activo,
    CASE WHEN (max(p.created_at::date) - min(p.created_at::date) + 1) > 0
         THEN round(sum(COALESCE(p.precio_total,0)) / GREATEST((max(p.created_at::date) - min(p.created_at::date) + 1)::numeric / 30, 1), 0)
         ELSE 0 END AS clv_mensual
  FROM public.pedidos p
  WHERE p.email IS NOT NULL
    AND p.pago_estado = 'pago_confirmado'
  GROUP BY p.email
  ORDER BY ingresos_total DESC
  LIMIT p_limit;
END;
$$;

-- Verificación
SELECT 'RPCs de analytics creadas' AS status;
