-- ============================================================
-- PRODIGY — Churn Prevention: Doctor Inactivo
-- Si un doctor habitual lleva 20+ días sin pedidos → alerta WA
--
-- Dos mecanismos:
--   A) SQL View para consultar desde el panel de admin
--   B) Función que se puede llamar desde resumen-semanal.js
--
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

-- ── 1. Vista: doctors_inactivos ──────────────────────────────
CREATE OR REPLACE VIEW doctors_inactivos AS
WITH doctor_stats AS (
    SELECT
        email,
        nombre_doctor,
        NULL::text AS whatsapp,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '90 days') AS pedidos_90d,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS pedidos_30d,
        MAX(created_at) AS ultimo_pedido,
        AVG(precio_total) AS ticket_promedio
    FROM pedidos
    WHERE email IS NOT NULL
      AND estado::text NOT IN ('cancelado','CANCELADO','Cancelado')
    GROUP BY email, nombre_doctor
    HAVING COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '90 days') >= 3
           -- Solo doctores que han sido activos (mín 3 pedidos en 90 días)
)
SELECT
    email,
    nombre_doctor,
    whatsapp,
    pedidos_90d,
    pedidos_30d,
    ultimo_pedido,
    ticket_promedio,
    EXTRACT(DAY FROM NOW() - ultimo_pedido) AS dias_inactivo,
    CASE
        WHEN EXTRACT(DAY FROM NOW() - ultimo_pedido) >= 30 THEN 'CRITICO'
        WHEN EXTRACT(DAY FROM NOW() - ultimo_pedido) >= 20 THEN 'ALERTA'
        WHEN EXTRACT(DAY FROM NOW() - ultimo_pedido) >= 14 THEN 'VIGILAR'
        ELSE 'OK'
    END AS nivel_riesgo
FROM doctor_stats
WHERE EXTRACT(DAY FROM NOW() - ultimo_pedido) >= 14
  AND pedidos_30d = 0
ORDER BY dias_inactivo DESC;

-- ── 2. Función para obtener lista y notificar ────────────────
CREATE OR REPLACE FUNCTION prodigy_detectar_churn(
    dias_umbral int DEFAULT 20,
    limite int DEFAULT 10
)
RETURNS TABLE(
    email text, nombre text, whatsapp text,
    dias_inactivo int, pedidos_90d bigint, ticket_promedio numeric
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.email::text,
        d.nombre_doctor::text,
        d.whatsapp::text,
        EXTRACT(DAY FROM NOW() - d.ultimo_pedido)::int,
        d.pedidos_90d,
        ROUND(d.ticket_promedio::numeric, 0)
    FROM doctors_inactivos d
    WHERE d.dias_inactivo >= dias_umbral
      AND d.nivel_riesgo IN ('ALERTA','CRITICO')
    ORDER BY d.dias_inactivo DESC
    LIMIT limite;
END;
$$;

-- ── VERIFICACIÓN ────────────────────────────────────────────
-- SELECT * FROM doctors_inactivos;
-- SELECT * FROM prodigy_detectar_churn(20, 5);
