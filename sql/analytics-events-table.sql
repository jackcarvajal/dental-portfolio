-- ============================================================
-- PRODIGY — Tabla analytics_events
-- Analytics propios sin dependencia de Google
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  evento      text NOT NULL,         -- 'page_view','cta_click','pedido_completado'...
  pagina      text,                  -- URL de la página donde ocurrió
  negocio     text DEFAULT 'prodigy', -- 'prodigy','alejandrocadcam','clinica'
  metadata    jsonb DEFAULT '{}',    -- datos extra del evento
  ip_hash     text,                  -- hash anonimizado del IP
  user_agent  text,
  country     text,                  -- código de país (CO, US, MX...)
  session_id  text                   -- ID de sesión anónima (localStorage)
);

-- Índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_ae_evento    ON public.analytics_events (evento, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_negocio   ON public.analytics_events (negocio, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_pagina    ON public.analytics_events (pagina);
CREATE INDEX IF NOT EXISTS idx_ae_country   ON public.analytics_events (country);

-- Solo service_role puede escribir (desde edge function)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.analytics_events TO service_role;

-- Admin puede leer
CREATE POLICY "admin_lee_analytics" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (auth.jwt()->'app_metadata'->>'role' IN ('admin','superadmin'));

-- RPC: métricas de conversión por período
CREATE OR REPLACE FUNCTION public.prodigy_analytics_conversion(
  p_negocio text DEFAULT 'prodigy',
  p_dias    int  DEFAULT 30
)
RETURNS TABLE (
  evento        text,
  total         bigint,
  por_dia       numeric,
  top_pagina    text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    ae.evento,
    COUNT(*) AS total,
    ROUND(COUNT(*)::numeric / p_dias, 1) AS por_dia,
    MODE() WITHIN GROUP (ORDER BY ae.pagina) AS top_pagina
  FROM public.analytics_events ae
  WHERE ae.negocio = p_negocio
    AND ae.created_at > now() - (p_dias || ' days')::interval
  GROUP BY ae.evento
  ORDER BY total DESC
  LIMIT 20;
END;
$$;

-- RPC: funnel completo
CREATE OR REPLACE FUNCTION public.prodigy_funnel(p_negocio text DEFAULT 'prodigy', p_dias int DEFAULT 30)
RETURNS TABLE(etapa text, total bigint, tasa_conversion numeric) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _visitas bigint; _calculadora bigint; _flujo bigint; _pedido bigint;
BEGIN
  SELECT COUNT(*) INTO _visitas     FROM analytics_events WHERE negocio=p_negocio AND evento='page_view' AND created_at > now() - (p_dias||' days')::interval;
  SELECT COUNT(*) INTO _calculadora FROM analytics_events WHERE negocio=p_negocio AND evento='calculator_use' AND created_at > now() - (p_dias||' days')::interval;
  SELECT COUNT(*) INTO _flujo       FROM analytics_events WHERE negocio=p_negocio AND evento='pedido_iniciado' AND created_at > now() - (p_dias||' days')::interval;
  SELECT COUNT(*) INTO _pedido      FROM analytics_events WHERE negocio=p_negocio AND evento='pedido_completado' AND created_at > now() - (p_dias||' days')::interval;
  RETURN QUERY VALUES
    ('Visitas'::text,     _visitas,     100::numeric),
    ('Calculadora'::text, _calculadora, CASE WHEN _visitas>0 THEN ROUND(_calculadora::numeric/_visitas*100,1) ELSE 0 END),
    ('Inicia pedido'::text,_flujo,      CASE WHEN _visitas>0 THEN ROUND(_flujo::numeric/_visitas*100,1) ELSE 0 END),
    ('Completa pedido'::text,_pedido,   CASE WHEN _flujo>0 THEN ROUND(_pedido::numeric/_flujo*100,1) ELSE 0 END);
END;
$$;

SELECT 'analytics_events + RPCs creados' AS status;
