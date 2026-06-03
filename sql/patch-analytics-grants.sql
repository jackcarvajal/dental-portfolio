-- ============================================================
-- PRODIGY — GRANTs correctos para analytics_events
-- El edge function /api/track-event usa service_role (bypass RLS)
-- pero la tabla necesita GRANT para que PostgREST la exponga
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- GRANTs explícitos (requeridos desde oct 2026)
GRANT ALL ON TABLE public.analytics_events TO service_role;
GRANT SELECT ON TABLE public.analytics_events TO authenticated;
-- anon NO debe insertar directamente (solo vía edge function con service_role)
REVOKE INSERT, UPDATE, DELETE ON TABLE public.analytics_events FROM anon;

-- Política para que admin pueda leer (si no existe ya)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='analytics_events' AND policyname='admin_lee_analytics'
  ) THEN
    CREATE POLICY "admin_lee_analytics" ON public.analytics_events
      FOR SELECT TO authenticated
      USING (auth.jwt()->'app_metadata'->>'role' IN ('admin','superadmin'));
  END IF;
END;
$$;

-- Verificar que las RPCs existen y tienen EXECUTE
GRANT EXECUTE ON FUNCTION public.prodigy_funnel(text,int) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.prodigy_analytics_conversion(text,int) TO authenticated, anon;

SELECT 'analytics grants OK' AS status;
