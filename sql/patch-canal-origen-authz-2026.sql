-- ============================================================
-- PRODIGY — Restringir RPC de ingresos por canal a staff real
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Mismo hallazgo que patch-analytics-rpc-authz-2026.sql y
-- patch-reportes-admin-authz-2026.sql: prodigy_ingresos_por_canal()
-- (sql/patch-canal-origen.sql) estaba otorgada a `authenticated` sin
-- verificación de rol — cualquier doctor podía ver el desglose de
-- ingresos por canal de marketing (SEO, WhatsApp, Google Ads, etc.)
-- de todo el negocio.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_ingresos_por_canal(p_dias int DEFAULT 90)
RETURNS TABLE(canal text, pedidos bigint, ingresos numeric, pct_pedidos numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _total bigint;
BEGIN
  IF NOT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

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

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como doctor logueado (no admin): SELECT * FROM prodigy_ingresos_por_canal();
-- debe fallar con "No autorizado".
-- ============================================================
