-- ============================================================
-- PRODIGY — Analytics RPCs para Dashboard de Métricas
-- Punto crítico de Gemini: NO hacer SELECT* pesados en el frontend.
-- Estas funciones calculan los agregados directamente en PostgreSQL
-- y devuelven JSON plano pre-calculado.
--
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Dashboard ejecutivo semanal ──────────────────────────────
CREATE OR REPLACE FUNCTION prodigy_dashboard_semana()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    resultado JSON;
BEGIN
    SELECT json_build_object(
        -- Pedidos esta semana
        'pedidos_semana',    (SELECT COUNT(*) FROM pedidos WHERE created_at >= NOW() - INTERVAL '7 days'),
        'pedidos_mes',       (SELECT COUNT(*) FROM pedidos WHERE created_at >= NOW() - INTERVAL '30 days'),
        'pedidos_total',     (SELECT COUNT(*) FROM pedidos),

        -- Ingresos
        'ingresos_semana',   (SELECT COALESCE(SUM(precio_total),0) FROM pedidos WHERE pago_estado = 'pago_confirmado' AND created_at >= NOW() - INTERVAL '7 days'),
        'ingresos_mes',      (SELECT COALESCE(SUM(precio_total),0) FROM pedidos WHERE pago_estado = 'pago_confirmado' AND created_at >= NOW() - INTERVAL '30 days'),

        -- Estados operativos
        'por_validar',       (SELECT COUNT(*) FROM pedidos WHERE estado_operativo IN ('VALIDACION_PENDIENTE','INCIDENCIA_CLIENTE')),
        'en_produccion',     (SELECT COUNT(*) FROM pedidos WHERE estado_operativo IN ('EN_DISENO','FRESADO_INICIADO','EN_PRODUCCION')),
        'en_revision',       (SELECT COUNT(*) FROM pedidos WHERE estado_operativo = 'REVISION_CLIENTE'),
        'listos_despacho',   (SELECT COUNT(*) FROM pedidos WHERE estado_operativo IN ('QA_APROBADO','LISTO_DESPACHAR')),

        -- Pagos
        'pagos_pendientes',  (SELECT COUNT(*) FROM pedidos WHERE pago_estado IN ('pendiente','pago_subido') AND estado NOT IN ('Cancelado')),
        'saldos_pendientes', (SELECT COALESCE(SUM(saldo_pendiente_monto),0) FROM pedidos WHERE modalidad_cobro='50_50' AND pago_estado='pago_confirmado'),

        -- Calidad
        'tasa_aprobacion_1a', (SELECT ROUND(100.0 * COUNT(*) FILTER(WHERE revisiones_usadas = 0 AND diseno_aprobado = true) / NULLIF(COUNT(*) FILTER(WHERE diseno_aprobado = true),0), 1) FROM pedidos_doctor WHERE created_at >= NOW() - INTERVAL '30 days'),

        -- Timestamp
        'calculado_en',      NOW()
    ) INTO resultado;

    RETURN resultado;
END;
$$;

-- ── 2. Top servicios (últimos 30 días) ──────────────────────────
CREATE OR REPLACE FUNCTION prodigy_top_servicios(limite INT DEFAULT 5)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE resultado JSON;
BEGIN
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
$$;

-- ── 3. Ingresos por semana — últimas 6 semanas ──────────────────
CREATE OR REPLACE FUNCTION prodigy_ingresos_semanas(n_semanas INT DEFAULT 6)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE resultado JSON;
BEGIN
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
$$;

-- ── 4. Tiempo promedio de entrega por tipo de servicio ───────────
CREATE OR REPLACE FUNCTION prodigy_tiempos_entrega()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE resultado JSON;
BEGIN
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
$$;

-- ── 5. Forecast de carga próxima semana ─────────────────────────
-- Basado en promedio de las últimas 4 semanas, día por día
CREATE OR REPLACE FUNCTION prodigy_forecast_semana()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE resultado JSON;
BEGIN
    SELECT json_agg(row_to_json(t)) INTO resultado FROM (
        SELECT
            EXTRACT(DOW FROM created_at)::int AS dia_semana,
            TO_CHAR(created_at, 'Day') AS nombre_dia,
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
$$;

-- ── 6. Equivalente para Alejandro CAD/CAM ───────────────────────
CREATE OR REPLACE FUNCTION alejandro_dashboard()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE resultado JSON;
BEGIN
    SELECT json_build_object(
        'pedidos_semana',     (SELECT COUNT(*) FROM pedidos WHERE negocio='alejandrocadcam' AND created_at >= NOW() - INTERVAL '7 days'),
        'pedidos_mes',        (SELECT COUNT(*) FROM pedidos WHERE negocio='alejandrocadcam' AND created_at >= NOW() - INTERVAL '30 days'),
        'ingresos_mes_usd',   (SELECT COALESCE(SUM(total_usd),0) FROM pedidos WHERE negocio='alejandrocadcam' AND pago_estado='pago_confirmado' AND created_at >= NOW() - INTERVAL '30 days'),
        'en_diseno',          (SELECT COUNT(*) FROM pedidos WHERE negocio='alejandrocadcam' AND estado='En Diseño'),
        'en_revision',        (SELECT COUNT(*) FROM pedidos WHERE negocio='alejandrocadcam' AND estado='En Revisión'),
        'tasa_aprobacion_1a', (SELECT ROUND(100.0 * COUNT(*) FILTER(WHERE revisiones_usadas=0 AND diseno_aprobado=true) / NULLIF(COUNT(*) FILTER(WHERE diseno_aprobado=true),0),1) FROM pedidos WHERE negocio='alejandrocadcam' AND created_at >= NOW() - INTERVAL '30 days'),
        'calculado_en',       NOW()
    ) INTO resultado;
    RETURN resultado;
END;
$$;

-- ── GRANTS: asegurar acceso solo para authenticated ─────────────
GRANT EXECUTE ON FUNCTION prodigy_dashboard_semana() TO authenticated;
GRANT EXECUTE ON FUNCTION prodigy_top_servicios(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION prodigy_ingresos_semanas(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION prodigy_tiempos_entrega() TO authenticated;
GRANT EXECUTE ON FUNCTION prodigy_forecast_semana() TO authenticated;
GRANT EXECUTE ON FUNCTION alejandro_dashboard() TO authenticated;

-- ── USO DESDE EL FRONTEND ────────────────────────────────────────
-- const { data } = await sb.rpc('prodigy_dashboard_semana');
-- const { data } = await sb.rpc('prodigy_top_servicios', { limite: 5 });
-- const { data } = await sb.rpc('prodigy_ingresos_semanas', { n_semanas: 6 });

-- ============================================================
-- PENDIENTE de ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================
