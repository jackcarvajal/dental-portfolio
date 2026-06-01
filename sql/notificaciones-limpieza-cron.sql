-- ============================================================
-- PRODIGY — Limpieza automática de notificaciones antiguas
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Función de limpieza (conserva últimas 30d)
CREATE OR REPLACE FUNCTION public.prodigy_limpiar_notifs()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _deleted integer;
BEGIN
  DELETE FROM public.notificaciones_internas
  WHERE created_at < now() - interval '30 days';
  GET DIAGNOSTICS _deleted = ROW_COUNT;
  RETURN _deleted;
END;
$$;

-- 2. Extensión pg_cron (si está disponible en tu plan Supabase)
-- Si tu plan NO incluye pg_cron, ejecuta la función manualmente o desde una edge function periódica.
-- Para verificar si está disponible:
-- SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- 3. Programar limpieza diaria a las 3 AM UTC (si pg_cron disponible)
-- SELECT cron.schedule('limpiar-notifs-diario','0 3 * * *','SELECT prodigy_limpiar_notifs()');

-- 4. Edge function alternativa (llamar desde Cloudflare Cron Trigger):
--    GET /api/health-check ya tiene un endpoint — agregar limpieza ahí
--    o crear /api/maintenance que llame esta RPC.

-- 5. También limpiar notificaciones leídas de más de 7 días
CREATE OR REPLACE FUNCTION public.prodigy_limpiar_notifs_leidas()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _deleted integer;
BEGIN
  -- Eliminar notificaciones leídas por todos sus destinatarios con >7d
  DELETE FROM public.notificaciones_internas
  WHERE created_at < now() - interval '7 days'
    AND array_length(leida_por, 1) > 0
    AND prioridad = 'baja';
  GET DIAGNOSTICS _deleted = ROW_COUNT;
  RETURN _deleted;
END;
$$;

-- Verificación
SELECT 'Funciones de limpieza creadas' AS status;
SELECT count(*) AS total_notifs_actuales FROM public.notificaciones_internas;
