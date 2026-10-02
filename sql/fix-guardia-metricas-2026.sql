-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- FIX: las 5 funciones de métricas se podían leer SIN sesión (oct-2026)
--
-- Su guardia era  IF NOT (rol IN (...) OR email IN (...)) THEN RAISE.  Sin sesión (o un cliente sin
-- app_metadata.role) las dos comparaciones dan NULL → NOT NULL = NULL → el IF no se cumple → NO se
-- bloquea. Lo detectó el Panel de pruebas (Seguridad): un anónimo recibía prodigy_dashboard_semana con
-- ingresos de la semana y del mes (hoy en 0 porque no hay pedidos, pero se llenaría con los reales).
--
-- Arreglo: guardia a prueba de NULL (mismo grupo de antes: admin + operator + staff) usando
-- public.es_admin_lab() (los 4 correos admin + rol admin), y el anónimo ya ni puede llamarlas.
-- El cuerpo de cada función queda IGUAL; solo cambia la guardia.
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.prodigy_dashboard_semana()
 RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
    resultado JSON;
BEGIN
    IF NOT (public.es_admin_lab()
            OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') IN ('operator','staff'), false)
            OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| array['operator','staff']) THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
    END IF;

    SELECT json_build_object(
        'pedidos_semana',    (SELECT COUNT(*) FROM pedidos WHERE created_at >= NOW() - INTERVAL '7 days'),
        'pedidos_mes',       (SELECT COUNT(*) FROM pedidos WHERE created_at >= NOW() - INTERVAL '30 days'),
        'pedidos_total',     (SELECT COUNT(*) FROM pedidos),
        'ingresos_semana',   (SELECT COALESCE(SUM(precio_total),0) FROM pedidos WHERE pago_estado = 'pago_confirmado' AND created_at >= NOW() - INTERVAL '7 days'),
        'ingresos_mes',      (SELECT COALESCE(SUM(precio_total),0) FROM pedidos WHERE pago_estado = 'pago_confirmado' AND created_at >= NOW() - INTERVAL '30 days'),
        'por_validar',       (SELECT COUNT(*) FROM pedidos WHERE estado_operativo IN ('VALIDACION_PENDIENTE','INCIDENCIA_CLIENTE')),
        'en_produccion',     (SELECT COUNT(*) FROM pedidos WHERE estado_operativo IN ('EN_DISENO','FRESADO_INICIADO','EN_PRODUCCION')),
        'en_revision',       (SELECT COUNT(*) FROM pedidos WHERE estado_operativo = 'REVISION_CLIENTE'),
        'listos_despacho',   (SELECT COUNT(*) FROM pedidos WHERE estado_operativo IN ('QA_APROBADO','LISTO_DESPACHAR')),
        'pagos_pendientes',  (SELECT COUNT(*) FROM pedidos WHERE pago_estado IN ('pendiente','pago_subido') AND estado::text NOT IN ('Cancelado','cancelado','CANCELADO')),
        'saldos_pendientes', (SELECT COALESCE(SUM(saldo_pendiente_monto),0) FROM pedidos WHERE modalidad_cobro='50_50' AND pago_estado='pago_confirmado'),
        'tasa_aprobacion_1a', (SELECT ROUND(100.0 * COUNT(*) FILTER(WHERE revisiones_usadas = 0 AND diseno_aprobado = true) / NULLIF(COUNT(*) FILTER(WHERE diseno_aprobado = true),0), 1) FROM pedidos_doctor WHERE created_at >= NOW() - INTERVAL '30 days'),
        'calculado_en',      NOW()
    ) INTO resultado;

    RETURN resultado;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prodigy_forecast_semana()
 RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE resultado JSON;
BEGIN
    IF NOT (public.es_admin_lab()
            OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') IN ('operator','staff'), false)
            OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| array['operator','staff']) THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
    END IF;

    SELECT json_agg(row_to_json(t)) INTO resultado FROM (
        SELECT
            dow::int AS dia_semana,
            TO_CHAR(dia, 'Day') AS nombre_dia,
            ROUND(AVG(cnt)) AS pedidos_esperados
        FROM (
            SELECT DATE_TRUNC('day', created_at) AS dia, COUNT(*) AS cnt,
                   EXTRACT(DOW FROM created_at) AS dow
            FROM pedidos
            WHERE created_at >= NOW() - INTERVAL '28 days'
            GROUP BY 1, 3
        ) daily
        GROUP BY dia_semana, nombre_dia
        ORDER BY dia_semana
    ) t;
    RETURN COALESCE(resultado, '[]'::JSON);
END;
$function$;

CREATE OR REPLACE FUNCTION public.prodigy_ingresos_semanas(n_semanas integer DEFAULT 6)
 RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE resultado JSON;
BEGIN
    IF NOT (public.es_admin_lab()
            OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') IN ('operator','staff'), false)
            OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| array['operator','staff']) THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
    END IF;

    SELECT json_agg(row_to_json(t)) INTO resultado FROM (
        SELECT
            DATE_TRUNC('week', created_at)::date AS semana,
            COUNT(*) AS pedidos,
            COALESCE(SUM(precio_total) FILTER(WHERE pago_estado='pago_confirmado'), 0) AS ingresos
        FROM pedidos
        WHERE created_at >= NOW() - (n_semanas || ' weeks')::INTERVAL
        GROUP BY 1
        ORDER BY 1 ASC
    ) t;
    RETURN COALESCE(resultado, '[]'::JSON);
END;
$function$;

CREATE OR REPLACE FUNCTION public.prodigy_tiempos_entrega()
 RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE resultado JSON;
BEGIN
    IF NOT (public.es_admin_lab()
            OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') IN ('operator','staff'), false)
            OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| array['operator','staff']) THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
    END IF;

    SELECT json_agg(row_to_json(t)) INTO resultado FROM (
        SELECT
            SPLIT_PART(tipo_trabajo, '(', 1) AS servicio,
            ROUND(AVG(EXTRACT(EPOCH FROM (timestamp_qa - created_at))/3600)) AS horas_promedio,
            COUNT(*) AS total
        FROM pedidos
        WHERE timestamp_qa IS NOT NULL
          AND created_at >= NOW() - INTERVAL '90 days'
          AND tipo_trabajo IS NOT NULL
        GROUP BY 1
        HAVING COUNT(*) >= 3
        ORDER BY horas_promedio ASC
        LIMIT 8
    ) t;
    RETURN COALESCE(resultado, '[]'::JSON);
END;
$function$;

CREATE OR REPLACE FUNCTION public.prodigy_top_servicios(limite integer DEFAULT 5)
 RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE resultado JSON;
BEGIN
    IF NOT (public.es_admin_lab()
            OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') IN ('operator','staff'), false)
            OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| array['operator','staff']) THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501';
    END IF;

    SELECT json_agg(row_to_json(t)) INTO resultado FROM (
        SELECT
            SPLIT_PART(tipo_trabajo, '(', 1) AS servicio,
            COUNT(*) AS total,
            ROUND(AVG(precio_total)) AS ticket_promedio
        FROM pedidos
        WHERE created_at >= NOW() - INTERVAL '30 days'
          AND tipo_trabajo IS NOT NULL
        GROUP BY 1
        ORDER BY total DESC
        LIMIT limite
    ) t;
    RETURN COALESCE(resultado, '[]'::JSON);
END;
$function$;

-- Solo usuarios con sesión pueden llamarlas (la guardia decide quién del equipo)
REVOKE EXECUTE ON FUNCTION public.prodigy_dashboard_semana()        FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.prodigy_forecast_semana()         FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.prodigy_ingresos_semanas(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.prodigy_tiempos_entrega()         FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.prodigy_top_servicios(integer)    FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.prodigy_dashboard_semana()        TO authenticated;
GRANT  EXECUTE ON FUNCTION public.prodigy_forecast_semana()         TO authenticated;
GRANT  EXECUTE ON FUNCTION public.prodigy_ingresos_semanas(integer) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.prodigy_tiempos_entrega()         TO authenticated;
GRANT  EXECUTE ON FUNCTION public.prodigy_top_servicios(integer)    TO authenticated;

-- Verificación: anon = false en las 5
SELECT p.proname,
       has_function_privilege('anon', p.oid, 'execute')          AS anon_puede,
       has_function_privilege('authenticated', p.oid, 'execute') AS con_sesion_puede,
       (p.prosrc LIKE '%es_admin_lab()%')                         AS guardia_nueva
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public'
   AND p.proname IN ('prodigy_dashboard_semana','prodigy_forecast_semana','prodigy_ingresos_semanas','prodigy_tiempos_entrega','prodigy_top_servicios')
 ORDER BY 1;
