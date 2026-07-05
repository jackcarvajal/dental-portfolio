-- ============================================================
-- PRODIGY — Corregir autorización en notificaciones_internas
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgos (auditoría 2026-07-04):
--
-- 1. prodigy_mis_notifs(p_dept, p_rol, p_limit) es SECURITY DEFINER
--    y usa el parámetro p_rol (enviado por el CLIENTE, ej.
--    js/notif-panel.js: rpc('prodigy_mis_notifs',{p_rol:_rol,...}))
--    para decidir si el llamante ve notificaciones admin/superadmin.
--    Cualquier usuario autenticado (doctor u operario de cualquier
--    departamento) podía abrir la consola del navegador y llamar:
--      supabase.rpc('prodigy_mis_notifs', {p_rol:'admin'})
--    y ver notificaciones de tipo 'pago' (con monto y nombre del
--    doctor) y otras internas de admin, sin serlo. Fix: el rol se
--    toma siempre de auth.jwt()->app_metadata, nunca del parámetro.
--
-- 2. Política "sistema_inserta_notifs" (FOR INSERT TO authenticated
--    WITH CHECK (true)) — el comentario dice "solo el sistema" pero
--    en realidad permite a CUALQUIER usuario autenticado insertar
--    notificaciones arbitrarias (títulos/mensajes falsos, prioridad
--    'alta', apuntando a cualquier pedido_id). El trigger real
--    (prodigy_notif_pedido) es SECURITY DEFINER y no necesita esta
--    política para insertar. Fix: restringir a roles de staff.
--
-- 3. Política "staff_marca_leida" (FOR UPDATE TO authenticated
--    USING(true) WITH CHECK(true)) — permite a cualquier usuario
--    autenticado modificar CUALQUIER columna de CUALQUIER fila
--    (no solo leida_por): podía reescribir título/mensaje de alertas
--    operativas de otros o vaciar el leida_por de otro usuario.
--    No hay ningún llamador que use UPDATE directo a la tabla — el
--    panel usa la RPC prodigy_marcar_notifs_leidas (ya segura, usa
--    auth.uid()). Fix: eliminar esta política; la RPC ya cubre el
--    caso de uso real.
-- ============================================================

-- 1. prodigy_mis_notifs: ignorar p_rol del cliente, usar el JWT real
CREATE OR REPLACE FUNCTION public.prodigy_mis_notifs(
  p_dept text DEFAULT NULL,
  p_rol  text DEFAULT NULL,
  p_limit int DEFAULT 15
)
RETURNS TABLE (
  id uuid, created_at timestamptz, tipo text, prioridad text,
  titulo text, mensaje text, pedido_codigo text, accion_url text,
  es_nueva boolean
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _rol_real text := auth.jwt() -> 'app_metadata' ->> 'role';
BEGIN
  IF _uid IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    n.id, n.created_at, n.tipo, n.prioridad,
    n.titulo, n.mensaje, n.pedido_codigo, n.accion_url,
    NOT (_uid = ANY(n.leida_por)) AS es_nueva
  FROM public.notificaciones_internas n
  WHERE
    (n.destinatario_dept IS NULL OR n.destinatario_dept = p_dept)
    AND (n.destinatario_rol IS NULL OR n.destinatario_rol = _rol_real OR _rol_real IN ('admin','superadmin'))
    AND n.created_at > now() - interval '7 days'
  ORDER BY n.prioridad DESC, n.created_at DESC
  LIMIT p_limit;
END;
$$;

-- 2. INSERT: solo staff real (el trigger SECURITY DEFINER no depende de esto)
DROP POLICY IF EXISTS "sistema_inserta_notifs" ON public.notificaciones_internas;
CREATE POLICY "staff_inserta_notifs" ON public.notificaciones_internas
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin','superadmin','operario','operator','staff')
  );

-- 3. UPDATE directo a la tabla: eliminado — el único caso de uso real
--    (marcar como leída) ya pasa por la RPC prodigy_marcar_notifs_leidas,
--    que usa auth.uid() y no necesita ninguna política de UPDATE abierta.
DROP POLICY IF EXISTS "staff_marca_leida" ON public.notificaciones_internas;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Con sesión de un doctor (no admin):
--   SELECT * FROM prodigy_mis_notifs(NULL, 'admin', 15);
-- debe devolver SOLO lo que su rol real permite, ignorando 'admin'.
-- ============================================================

SELECT 'patch-notificaciones-internas-authz-2026 aplicado' AS status;
