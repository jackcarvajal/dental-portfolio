-- ═══════════════════════════════════════════════════════════════
-- FIX RPCs de métricas / recordatorios (schema drift) — 2026-08
-- Pegar TODO esto en Supabase → SQL Editor → Run.
-- Corrige columnas fantasma y enum inválido (400/42703/22P02).
-- ═══════════════════════════════════════════════════════════════


-- ┌───────────────────────────────────────────────────────────
-- │ patch-analytics-rpc-authz-2026.sql
-- └───────────────────────────────────────────────────────────
-- ============================================================
-- PRODIGY — Restringir RPCs de analytics/dashboard a staff real
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-04): las 6 funciones de
-- sql/prodigy-analytics-rpc.sql estaban otorgadas a `authenticated`
-- SIN ninguna verificación de rol dentro de la función:
--
--   prodigy_dashboard_semana() — pedidos/ingresos semana y mes, saldos
--     pendientes, tasa de aprobación — dashboard ejecutivo completo.
--   prodigy_top_servicios(), prodigy_ingresos_semanas(),
--     prodigy_tiempos_entrega(), prodigy_forecast_semana() —
--     desglose financiero y operativo del negocio.
--   alejandro_dashboard() — el equivalente para el negocio de
--     Alejandro, con las mismas cifras (incluye ingresos_mes_usd).
--
-- Cualquier doctor con sesión (de CUALQUIERA de los 2 negocios, ya que
-- comparten el mismo proyecto Supabase) podía llamar cualquiera de
-- estas 6 funciones vía /rest/v1/rpc/... y ver el dashboard financiero
-- completo de ambos negocios.
-- ============================================================

CREATE OR REPLACE FUNCTION prodigy_dashboard_semana()
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    resultado JSON;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
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
        'pagos_pendientes',  (SELECT COUNT(*) FROM pedidos WHERE pago_estado IN ('pendiente','pago_subido') AND estado NOT IN ('Cancelado')),
        'saldos_pendientes', (SELECT COALESCE(SUM(saldo_pendiente_monto),0) FROM pedidos WHERE modalidad_cobro='50_50' AND pago_estado='pago_confirmado'),
        'tasa_aprobacion_1a', (SELECT ROUND(100.0 * COUNT(*) FILTER(WHERE revisiones_usadas = 0 AND diseno_aprobado = true) / NULLIF(COUNT(*) FILTER(WHERE diseno_aprobado = true),0), 1) FROM pedidos_doctor WHERE created_at >= NOW() - INTERVAL '30 days'),
        'calculado_en',      NOW()
    ) INTO resultado;

    RETURN resultado;
END;
$$;

CREATE OR REPLACE FUNCTION prodigy_top_servicios(limite INT DEFAULT 5)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE resultado JSON;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
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
$$;

CREATE OR REPLACE FUNCTION prodigy_ingresos_semanas(n_semanas INT DEFAULT 6)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE resultado JSON;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
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
$$;

CREATE OR REPLACE FUNCTION prodigy_tiempos_entrega()
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE resultado JSON;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
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
$$;

CREATE OR REPLACE FUNCTION prodigy_forecast_semana()
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE resultado JSON;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

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

CREATE OR REPLACE FUNCTION alejandro_dashboard()
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE resultado JSON;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

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

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como doctor logueado (no admin), esto debe fallar con "No autorizado":
--   SELECT prodigy_dashboard_semana();
--   SELECT alejandro_dashboard();
-- Como admin, debe seguir devolviendo los datos normalmente.
-- ============================================================


-- ┌───────────────────────────────────────────────────────────
-- │ patch-reportes-admin-authz-2026.sql
-- └───────────────────────────────────────────────────────────
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


-- ┌───────────────────────────────────────────────────────────
-- │ patch-canal-origen-authz-2026.sql
-- └───────────────────────────────────────────────────────────
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
    SUM(COALESCE(p.precio_total::numeric, p.monto_total::numeric, 0)) AS ingresos,
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


-- ┌───────────────────────────────────────────────────────────
-- │ patch-pagos-vencidos.sql
-- └───────────────────────────────────────────────────────────
-- ============================================================
-- PRODIGY — Gestión de pagos vencidos y alertas
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Verificar si la columna pago_recordatorio_at existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='pedidos' AND column_name='pago_recordatorio_at'
  ) THEN
    ALTER TABLE public.pedidos ADD COLUMN pago_recordatorio_at timestamptz;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='pedidos' AND column_name='pago_vencido'
  ) THEN
    ALTER TABLE public.pedidos ADD COLUMN pago_vencido boolean DEFAULT false;
  END IF;
END;
$$;

-- 2. RPC: pedidos con pago pendiente > 48h (candidatos a recordatorio)
CREATE OR REPLACE FUNCTION public.prodigy_pagos_pendientes(p_horas int DEFAULT 48)
RETURNS TABLE(
  id uuid, codigo text, doctor text, whatsapp text,
  total numeric, created_at timestamptz, horas_espera numeric,
  pago_recordatorio_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.codigo, p.nombre_doctor, p.telefono,
    COALESCE(p.precio_total::numeric, p.monto_total::numeric, 0) AS total,
    p.created_at,
    ROUND(EXTRACT(EPOCH FROM (now() - p.created_at))/3600, 1) AS horas_espera,
    p.pago_recordatorio_at
  FROM public.pedidos p
  WHERE p.negocio = 'prodigy'
    AND p.pago_estado IN ('pendiente', 'sin_pago')
    AND p.estado NOT IN ('Cancelado', 'Entregado')
    AND p.created_at < now() - (p_horas||' hours')::interval
    AND (p.pago_recordatorio_at IS NULL OR p.pago_recordatorio_at < now() - interval '24 hours')
  ORDER BY p.created_at ASC
  LIMIT 30;
END;
$$;

-- 3. RPC: marcar que se envió recordatorio
CREATE OR REPLACE FUNCTION public.prodigy_marcar_recordatorio(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.pedidos
  SET pago_recordatorio_at = now()
  WHERE id = p_id AND negocio = 'prodigy';
END;
$$;

-- 4. Índice para queries de pago pendiente
CREATE INDEX IF NOT EXISTS idx_pedidos_pago_estado
  ON public.pedidos (pago_estado, negocio, created_at)
  WHERE pago_estado IN ('pendiente','sin_pago');

-- GRANTs
GRANT EXECUTE ON FUNCTION public.prodigy_pagos_pendientes(int) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.prodigy_marcar_recordatorio(uuid) TO authenticated, service_role;

SELECT 'pagos vencidos OK' AS status;


-- ┌───────────────────────────────────────────────────────────
-- │ patch-sla-pedidos.sql
-- └───────────────────────────────────────────────────────────
-- ============================================================
-- PRODIGY — SLA de pedidos (alertas por tiempo)
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Columna sla_horas_objetivo en pedidos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='pedidos' AND column_name='sla_horas_objetivo'
  ) THEN
    ALTER TABLE public.pedidos ADD COLUMN sla_horas_objetivo int DEFAULT 48;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='pedidos' AND column_name='sla_alerta_enviada'
  ) THEN
    ALTER TABLE public.pedidos ADD COLUMN sla_alerta_enviada boolean DEFAULT false;
  END IF;
END;
$$;

-- 2. RPC: pedidos que superan su SLA y no han sido alertados
CREATE OR REPLACE FUNCTION public.prodigy_pedidos_sla_vencido()
RETURNS TABLE(
  id uuid, codigo text, doctor text, whatsapp text,
  estado text, estado_operativo text,
  horas_transcurridas numeric, sla_horas_objetivo int
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.codigo, p.nombre_doctor, p.telefono,
    p.estado, p.estado_operativo,
    ROUND(EXTRACT(EPOCH FROM (now() - p.created_at))/3600, 1) AS horas_transcurridas,
    COALESCE(p.sla_horas_objetivo, 48) AS sla_horas_objetivo
  FROM public.pedidos p
  WHERE p.negocio = 'prodigy'
    AND p.estado NOT IN ('Cancelado', 'Entregado')
    AND p.estado_operativo NOT IN ('ENTREGADO', 'LISTO_DESPACHAR')
    AND (NOT p.sla_alerta_enviada OR p.sla_alerta_enviada IS NULL)
    AND EXTRACT(EPOCH FROM (now() - p.created_at))/3600 > COALESCE(p.sla_horas_objetivo, 48)
  ORDER BY horas_transcurridas DESC
  LIMIT 20;
END;
$$;

-- 3. RPC: marcar alerta SLA enviada
CREATE OR REPLACE FUNCTION public.prodigy_marcar_sla_alerta(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.pedidos SET sla_alerta_enviada = true WHERE id = p_id AND negocio = 'prodigy';
END;
$$;

-- 4. RPC: actualizar SLA objetivo por flujo
CREATE OR REPLACE FUNCTION public.prodigy_set_sla(p_flujo text, p_horas int)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _n int;
BEGIN
  UPDATE public.pedidos SET sla_horas_objetivo = p_horas
  WHERE flujo = p_flujo AND negocio = 'prodigy' AND sla_horas_objetivo IS NULL;
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END;
$$;

-- Default SLA por flujo
SELECT prodigy_set_sla('diseno', 24);
SELECT prodigy_set_sla('fresado', 48);
SELECT prodigy_set_sla('impresion', 24);

GRANT EXECUTE ON FUNCTION public.prodigy_pedidos_sla_vencido() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.prodigy_marcar_sla_alerta(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.prodigy_set_sla(text, int) TO authenticated, service_role;

SELECT 'SLA pedidos OK' AS status;


-- ┌───────────────────────────────────────────────────────────
-- │ patch-wallet-idor-2026.sql
-- └───────────────────────────────────────────────────────────
-- ============================================================
-- PRODIGY — Corregir IDOR en consulta de billetera/créditos del cliente
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-03): app/client-panel.html:1167-1169 busca
-- el saldo de crédito del doctor logueado así:
--
--   sb.from('creditos_cliente').select('*')
--     .or(`nombre_doctor.eq.${_nombreDoctor}`)
--
-- donde `_nombreDoctor = user.user_metadata?.nombre || ...`. Dos
-- problemas:
--   1) user_metadata lo edita el propio usuario desde el navegador —
--      cualquiera puede poner su nombre igual al de otro doctor y ver
--      SU saldo/crédito/puntos.
--   2) Aunque nadie lo explote a propósito, nombre_doctor no es único
--      (dos doctores pueden compartir nombre) — riesgo real de mostrar
--      el saldo de la persona equivocada por coincidencia.
--
-- Se agrega una RPC que resuelve la identidad del usuario SOLO a partir
-- de sus propios pedidos ya creados (pedidos.doctor_uid = auth.uid(),
-- protegido por RLS existente) — nunca confía en datos que el cliente
-- pueda editar.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_mi_wallet()
RETURNS TABLE (saldo_cop int, puntos int, nivel text, total_gastado int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_whatsapp text;
BEGIN
    -- Resuelve el whatsapp real del usuario a partir de SUS PROPIOS
    -- pedidos (doctor_uid = auth.uid(), no editable por el cliente)
    SELECT p.telefono INTO v_whatsapp
    FROM public.pedidos p
    WHERE p.doctor_uid = auth.uid() AND p.telefono IS NOT NULL
    ORDER BY p.created_at DESC
    LIMIT 1;

    IF v_whatsapp IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT c.saldo_cop, c.puntos, c.nivel, c.total_gastado
    FROM public.creditos_cliente c
    WHERE c.whatsapp = v_whatsapp
    LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.prodigy_mi_wallet() TO authenticated;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como doctor A logueado, cambiar user_metadata.nombre para que
-- coincida con el de otro doctor B (con saldo) y confirmar que
-- prodigy_mi_wallet() sigue devolviendo el saldo de A (o vacío si A
-- no tiene wallet), NUNCA el de B.
-- ============================================================

