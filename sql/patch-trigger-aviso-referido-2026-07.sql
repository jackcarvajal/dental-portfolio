-- =====================================================================
-- AVISO AUTOMÁTICO CUANDO LLEGA UN PEDIDO POR REFERIDO
-- Auditoría de flujos 2026-07-18 · proyecto zgihrwqfyvgyapbwzkvw
--
-- PROBLEMA: en flujo-diseno.html el navegador llamaba a /api/send-push con
--   la cabecera  x-cron-secret: 'internal'  (un placeholder). El endpoint
--   valida ese secreto contra CRON_SECRET, así que SIEMPRE respondía
--   401 "No autorizado" → el staff NUNCA se enteraba de un pedido por
--   referido. Verificado con curl.
--
--   No se puede arreglar poniendo el secreto real en el navegador: quedaría
--   expuesto a cualquiera y permitiría enviar push masivos.
--
--   Tampoco puede el cliente insertar en notificaciones_internas: esa política
--   solo permite roles de staff (correcto, si no los clientes podrían spamear).
--
-- SOLUCIÓN: un TRIGGER en la base. Se ejecuta del lado del servidor cuando el
--   referido pasa a 'registrado', sin depender del navegador ni de secretos.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.avisar_referido_registrado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER            -- corre con permisos del dueño: puede insertar el aviso
SET search_path = public
AS $$
BEGIN
  -- Solo al momento de pasar a 'registrado' (no en cada update)
  IF NEW.estado = 'registrado'
     AND (TG_OP = 'INSERT' OR OLD.estado IS DISTINCT FROM 'registrado') THEN

    INSERT INTO public.notificaciones_internas (
      tipo, prioridad, destinatario_rol, destinatario_dept,
      titulo, mensaje, pedido_codigo, accion_url, leida_por
    ) VALUES (
      'nuevo_caso',
      'media',
      'admin',                       -- lo ve administración
      NULL,
      'Pedido por referido',
      'Llegó un pedido de un doctor referido con el código ' || COALESCE(NEW.codigo, '—') ||
        COALESCE(' (' || NEW.referido_nombre || ')', '') ||
        '. Revisa el programa de referidos para la recompensa.',
      NEW.codigo,
      '/app/panel-interno-operaciones.html',
      '{}'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_avisar_referido ON public.referidos;
CREATE TRIGGER trg_avisar_referido
  AFTER INSERT OR UPDATE OF estado ON public.referidos
  FOR EACH ROW
  EXECUTE FUNCTION public.avisar_referido_registrado();

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────
-- 1) Que el trigger exista:
--    SELECT tgname FROM pg_trigger WHERE tgname = 'trg_avisar_referido';
--
-- 2) Prueba (crea un aviso y luego limpia):
--    UPDATE public.referidos SET estado = 'registrado'
--     WHERE codigo = '<algun-codigo>' RETURNING codigo;
--    SELECT titulo, mensaje FROM public.notificaciones_internas
--     ORDER BY created_at DESC LIMIT 1;
--
-- El aviso aparece en la campana del panel interno (notif-panel.js).
