-- ============================================================
-- PRODIGY — Restringir RPCs de reportes admin a staff real
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-03): las 4 funciones de
-- sql/rpc-reportes-admin.sql (nombradas explícitamente "reportes ADMIN")
-- estaban otorgadas a `authenticated` sin ninguna verificación de rol.
-- Cualquier doctor con sesión podía llamar:
--   - prodigy_top_doctores(): ranking de TODOS los doctores por volumen
--     de pedidos e INGRESOS — inteligencia de negocio competitiva real
--     (qué clínicas son las más grandes, cuánto gastan, cuándo compraron
--     por última vez).
--   - prodigy_ingresos_por_dia(): ingresos totales diarios de PRODIGY.
--   - prodigy_pedidos_por_material() / prodigy_conversion_por_flujo():
--     desglose financiero y operativo completo del negocio.
--
-- Se agrega verificación de rol admin/staff DENTRO de cada función
-- (SECURITY DEFINER ya bypassa RLS de `pedidos`, así que la única
-- protección real es esta verificación interna).
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_pedidos_por_material(p_dias int DEFAULT 30)
RETURNS TABLE(material text, total bigint, ingresos numeric, pct_total numeric)
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

CREATE OR REPLACE FUNCTION public.prodigy_ingresos_por_dia(p_dias int DEFAULT 30)
RETURNS TABLE(fecha date, pedidos bigint, ingresos numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

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

CREATE OR REPLACE FUNCTION public.prodigy_conversion_por_flujo(p_dias int DEFAULT 30)
RETURNS TABLE(flujo text, pedidos bigint, entregados bigint, tasa_entrega numeric, ingreso_promedio numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

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

CREATE OR REPLACE FUNCTION public.prodigy_top_doctores(p_dias int DEFAULT 90, p_limit int DEFAULT 10)
RETURNS TABLE(doctor text, pedidos bigint, ingresos numeric, ultimo_pedido date)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

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

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como doctor logueado (no admin), esto debe fallar con "No autorizado":
--   SELECT * FROM prodigy_top_doctores();
-- Como admin, debe seguir funcionando normal (usado en panel-interno-operaciones.html).
-- ============================================================
