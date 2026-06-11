-- =============================================================
-- FIX SEGURIDAD: prodigy_marcar_notifs_leidas(p_user_id) — IDOR
--
-- Problema: la función original (notificaciones-internas.sql) es
-- SECURITY DEFINER y confía ciegamente en p_user_id sin verificar que
-- coincida con el usuario autenticado. Cualquier usuario con sesión
-- podía llamar /rest/v1/rpc/prodigy_marcar_notifs_leidas con el UUID
-- de OTRO usuario y marcar sus notificaciones como leídas (oculta
-- alertas operativas a otro miembro del equipo).
--
-- Fix: ignora p_user_id, usa siempre auth.uid().
-- =============================================================

CREATE OR REPLACE FUNCTION public.prodigy_marcar_notifs_leidas(p_user_id uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.notificaciones_internas
  SET leida_por = array_append(leida_por, _uid)
  WHERE NOT (leida_por @> ARRAY[_uid])
    AND created_at > now() - interval '7 days';
END;
$$;
