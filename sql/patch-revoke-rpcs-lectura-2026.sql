-- ============================================================
-- PRODIGY — Revocar RPCs de lectura interna que exponían datos a cualquier doctor
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría IDOR 2026-07-03): sql/patch-revoke-rpcs-internas.sql
-- (ejecutado 2026-06-12) ya revocó las funciones de ESCRITURA
-- (prodigy_marcar_recordatorio, prodigy_marcar_sla_alerta, prodigy_set_sla)
-- para `authenticated`, pero dejó pasar las 2 funciones de LECTURA
-- equivalentes, que seguían otorgadas a `authenticated`:
--
--   prodigy_pagos_pendientes(p_horas)  — sql/patch-pagos-vencidos.sql
--   prodigy_pedidos_sla_vencido()      — sql/patch-sla-pedidos.sql
--
-- Cualquier doctor con sesión podía llamar estas RPCs vía
-- /rest/v1/rpc/... y obtener el LISTADO COMPLETO de:
--   - todos los pedidos con pago pendiente de TODOS los doctores
--     (nombre, WhatsApp, monto, tiempo de espera)
--   - todos los pedidos con SLA vencido de TODO el negocio
--
-- Ambas son llamadas únicamente desde functions/api/recordatorio-pago.js
-- y functions/api/alerta-sla.js usando SUPABASE_SERVICE_KEY (service_role),
-- que no requiere el GRANT a `authenticated`.
-- ============================================================

DO $$
BEGIN
  IF to_regprocedure('public.prodigy_pagos_pendientes(int)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.prodigy_pagos_pendientes(int) FROM authenticated';
  END IF;
  IF to_regprocedure('public.prodigy_pedidos_sla_vencido()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.prodigy_pedidos_sla_vencido() FROM authenticated';
  END IF;
END $$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como doctor logueado (no admin), esto debe fallar con "permission denied":
--   SELECT * FROM prodigy_pagos_pendientes(48);
--   SELECT * FROM prodigy_pedidos_sla_vencido();
-- ============================================================
