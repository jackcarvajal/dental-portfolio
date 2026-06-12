-- =============================================================
-- FIX SEGURIDAD: revocar GRANT a `authenticated` en RPCs internas
-- (solo deben usarlas los crons via service_role)
--
-- Problema: prodigy_marcar_recordatorio, prodigy_marcar_sla_alerta y
-- prodigy_set_sla quedaron con GRANT EXECUTE TO authenticated, service_role.
-- Cualquier doctor con sesion (rol "authenticated") podia llamarlas via
-- /rest/v1/rpc/... y:
--  - prodigy_marcar_recordatorio(p_id) / prodigy_marcar_sla_alerta(p_id):
--    silenciar recordatorios de pago / alertas SLA de CUALQUIER pedido
--    (no solo el propio), ocultando incidencias operativas al equipo.
--  - prodigy_set_sla(p_flujo, p_horas): modificar el SLA objetivo de
--    TODOS los pedidos de un flujo (sin restriccion de propiedad).
--
-- Estas funciones solo son invocadas desde functions/api/recordatorio-pago.js
-- y functions/api/alerta-sla.js usando SUPABASE_SERVICE_KEY (service_role),
-- que no requiere el GRANT a `authenticated`.
-- =============================================================

-- Version idempotente: revoca solo si la funcion existe en esta DB
-- (prodigy_set_sla puede no existir si patch-sla-pedidos.sql no se ha aplicado).
DO $$
BEGIN
  IF to_regprocedure('public.prodigy_marcar_recordatorio(uuid)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.prodigy_marcar_recordatorio(uuid) FROM authenticated';
  END IF;
  IF to_regprocedure('public.prodigy_marcar_sla_alerta(uuid)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.prodigy_marcar_sla_alerta(uuid) FROM authenticated';
  END IF;
  IF to_regprocedure('public.prodigy_set_sla(text, int)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.prodigy_set_sla(text, int) FROM authenticated';
  END IF;
END $$;
