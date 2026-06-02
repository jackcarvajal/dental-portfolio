-- ============================================================
-- PARCHE: Corregir tabla analytics_events
-- Ejecutar en Supabase Dashboard → SQL Editor
-- El error "column evento does not exist" indica que la tabla
-- ya existía con esquema diferente. Este parche la recrea.
-- ============================================================

-- Eliminar tabla vieja y sus dependencias (tabla nueva, sin datos críticos)
DROP TABLE IF EXISTS public.analytics_events CASCADE;

-- Recrear con esquema correcto
CREATE TABLE public.analytics_events (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  evento      text NOT NULL,
  pagina      text,
  negocio     text DEFAULT 'prodigy',
  metadata    jsonb DEFAULT '{}',
  ip_hash     text,
  user_agent  text,
  country     text,
  session_id  text
);

-- Índices
CREATE INDEX idx_ae_evento    ON public.analytics_events (evento, created_at DESC);
CREATE INDEX idx_ae_negocio   ON public.analytics_events (negocio, created_at DESC);
CREATE INDEX idx_ae_pagina    ON public.analytics_events (pagina);
CREATE INDEX idx_ae_country   ON public.analytics_events (country);

-- RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.analytics_events TO service_role, anon, authenticated;

-- Admin puede leer
CREATE POLICY "admin_lee_analytics" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (auth.jwt()->'app_metadata'->>'role' IN ('admin','superadmin'));

-- Inserción desde edge function (service_role) — no requiere policy (bypass RLS)

-- RPC funnel
DROP FUNCTION IF EXISTS public.prodigy_funnel(text, int);
CREATE OR REPLACE FUNCTION public.prodigy_funnel(p_negocio text DEFAULT 'prodigy', p_dias int DEFAULT 30)
RETURNS TABLE(etapa text, total bigint, tasa_conversion numeric) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _visitas bigint; _calculadora bigint; _flujo bigint; _pedido bigint;
BEGIN
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

-- RPC conversión por evento
DROP FUNCTION IF EXISTS public.prodigy_analytics_conversion(text, int);
CREATE OR REPLACE FUNCTION public.prodigy_analytics_conversion(p_negocio text DEFAULT 'prodigy', p_dias int DEFAULT 30)
RETURNS TABLE(evento text, total bigint, por_dia numeric, top_pagina text) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT ae.evento, COUNT(*) AS total,
    ROUND(COUNT(*)::numeric / p_dias, 1) AS por_dia,
    MODE() WITHIN GROUP (ORDER BY ae.pagina) AS top_pagina
  FROM public.analytics_events ae
  WHERE ae.negocio = p_negocio AND ae.created_at > now() - (p_dias||' days')::interval
  GROUP BY ae.evento ORDER BY total DESC LIMIT 20;
END;
$$;

SELECT 'analytics_events OK — tabla recreada con esquema correcto' AS status;
