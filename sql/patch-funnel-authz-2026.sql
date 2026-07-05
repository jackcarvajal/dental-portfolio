-- ============================================================
-- PRODIGY — Restringir RPCs de funnel/conversión a staff real
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-04): prodigy_funnel() y
-- prodigy_analytics_conversion() (patch-analytics-fix-columns.sql /
-- patch-analytics-grants.sql) estaban otorgadas a `authenticated, anon`
-- — cualquier visitante sin sesión podía ver el embudo de conversión
-- del sitio (visitas → uso de calculadora → pedidos iniciados/completados)
-- y el desglose de eventos de analítica. Menor severidad que los
-- hallazgos financieros de esta sesión (no expone ingresos ni nombres),
-- pero sigue siendo información de negocio sin razón para ser pública.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_funnel(p_negocio text DEFAULT 'prodigy', p_dias int DEFAULT 30)
RETURNS TABLE(etapa text, total bigint, tasa_conversion numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _visitas bigint; _calculadora bigint; _flujo bigint; _pedido bigint;
BEGIN
  IF NOT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operario','operator','staff')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT COUNT(*) INTO _visitas     FROM public.analytics_events WHERE negocio=p_negocio AND evento='page_view'          AND created_at > now() - (p_dias||' days')::interval;
  SELECT COUNT(*) INTO _calculadora FROM public.analytics_events WHERE negocio=p_negocio AND evento='calculator_use'     AND created_at > now() - (p_dias||' days')::interval;
  SELECT COUNT(*) INTO _flujo       FROM public.analytics_events WHERE negocio=p_negocio AND evento='pedido_creado'      AND created_at > now() - (p_dias||' days')::interval;
  SELECT COUNT(*) INTO _pedido      FROM public.analytics_events WHERE negocio=p_negocio AND evento='pedido_completado'  AND created_at > now() - (p_dias||' days')::interval;
  RETURN QUERY VALUES
    ('Visitas'::text,        _visitas,      100::numeric),
    ('Calculadora'::text,    _calculadora,  CASE WHEN _visitas>0    THEN ROUND(_calculadora::numeric/_visitas*100,1) ELSE 0 END),
    ('Inicia pedido'::text,  _flujo,        CASE WHEN _visitas>0    THEN ROUND(_flujo::numeric/_visitas*100,1)       ELSE 0 END),
    ('Completa pedido'::text,_pedido,       CASE WHEN _flujo>0      THEN ROUND(_pedido::numeric/_flujo*100,1)        ELSE 0 END);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.prodigy_funnel(text,int) FROM anon;

CREATE OR REPLACE FUNCTION public.prodigy_analytics_conversion(p_negocio text DEFAULT 'prodigy', p_dias int DEFAULT 30)
RETURNS TABLE(evento text, total bigint, por_dia numeric, top_pagina text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operario','operator','staff')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN QUERY
  SELECT ae.evento, COUNT(*) AS total,
    ROUND(COUNT(*)::numeric / p_dias, 1) AS por_dia,
    MODE() WITHIN GROUP (ORDER BY ae.pagina) AS top_pagina
  FROM public.analytics_events ae
  WHERE ae.negocio = p_negocio AND ae.created_at > now() - (p_dias||' days')::interval
  GROUP BY ae.evento ORDER BY total DESC LIMIT 20;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.prodigy_analytics_conversion(text,int) FROM anon;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Sin sesión (anon key): SELECT * FROM prodigy_funnel();
-- debe fallar con "permission denied" (revocado).
-- ============================================================
