-- =====================================================================
-- ALINEACIÓN DE ROLES: app  <->  políticas RLS
-- Proyecto Supabase compartido: zgihrwqfyvgyapbwzkvw
-- (afecta a PRODIGY y Alejandro CAD/CAM — es la misma base)
--
-- PROBLEMA DETECTADO (auditoría 2026-07-18):
--   1) El admin se identifica por EMAIL en auth-guard.js, pero muchas
--      políticas RLS verifican  app_metadata.role = 'admin'.
--      Si el usuario admin no tiene ese metadato → las políticas lo
--      BLOQUEAN (ej: tabla `referidos` devolvía 403 al panel).
--   2) Varias políticas usan roles que NO existen en la app:
--      'staff' (59 usos) y 'operario' (37 usos). Los roles reales son:
--      admin, operator, mensajero, encargado_inventario, calidad,
--      contabilidad, diseno, taller, fresado, impresion, client.
--      → esas políticas nunca conceden permiso a nadie real.
-- =====================================================================


-- ─────────────────────────────────────────────────────────────────────
-- PARTE 1 — CRÍTICA: dar rol 'admin' en app_metadata a los admins
-- Esto hace que TODAS las políticas que verifican app_metadata.role
-- reconozcan al admin. Es el arreglo de mayor impacto y el más seguro.
-- ─────────────────────────────────────────────────────────────────────
UPDATE auth.users
SET raw_app_meta_data =
      COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
WHERE lower(email) IN (
  'jackalejandroc@gmail.com',
  'labdentalprodigy@gmail.com'
);

-- Verificar (debe listar los admins con "role": "admin")
-- SELECT email, raw_app_meta_data->>'role' AS rol FROM auth.users
--  WHERE lower(email) IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com');

-- IMPORTANTE: tras ejecutarlo, cierra sesión y vuelve a entrar en el panel
-- para que el JWT se emita con el nuevo app_metadata.


-- ─────────────────────────────────────────────────────────────────────
-- PARTE 2 — OPCIONAL: alinear los roles fantasma en políticas clave
-- Ejecutar SOLO cuando existan usuarios de staff (hoy solo usa el admin).
-- Sustituye ('admin','operario','staff') por los roles reales de la app.
-- ─────────────────────────────────────────────────────────────────────

-- casos_portafolio — permitir a staff de diseño/producción publicar casos
DROP POLICY IF EXISTS "portafolio_staff_insert" ON public.casos_portafolio;
CREATE POLICY "portafolio_staff_insert" ON public.casos_portafolio
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN
      ('admin','operator','diseno','taller','fresado','impresion')
    OR auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  );

DROP POLICY IF EXISTS "portafolio_staff_update" ON public.casos_portafolio;
CREATE POLICY "portafolio_staff_update" ON public.casos_portafolio
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN
      ('admin','operator','diseno','taller','fresado','impresion')
    OR auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  );

-- referidos — el panel necesita leer el KPI (daba 403)
DROP POLICY IF EXISTS "ref_staff_all" ON public.referidos;
CREATE POLICY "ref_staff_all" ON public.referidos
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad')
    OR auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad')
    OR auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  );

-- =====================================================================
-- PENDIENTE (no incluido, requiere revisión caso por caso):
--   storage (22 políticas), cotizaciones, inventario_materiales,
--   notificaciones_internas, waitlist_labs — también usan 'staff'/'operario'.
--   Con la PARTE 1 el admin ya pasa en todas; revisar al onboardear staff.
-- =====================================================================
