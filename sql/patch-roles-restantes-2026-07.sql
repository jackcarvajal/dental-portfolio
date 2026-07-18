-- =====================================================================
-- COMPLETAR alineación de roles — tablas que quedaron pendientes
-- (ejecutar después de patch-roles-rls-alineacion-2026-07.sql)
--
-- Por qué: estas políticas seguían usando los roles inexistentes
-- 'staff' / 'operario' y NO tenían fallback por email, así que bloqueaban
-- incluso al admin. Era la causa del ❌ en `cotizaciones` dentro del panel
-- de pruebas ("Verificar tablas").
--
-- Se sustituyen por: los roles REALES de la app + el email del admin como
-- respaldo (para que funcione aunque el JWT aún no traiga app_metadata).
-- =====================================================================

-- ── cotizaciones ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cotiz_staff_all" ON public.cotizaciones;
CREATE POLICY "cotiz_staff_all" ON public.cotizaciones
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad')
    OR auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad')
    OR auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  );

-- ── inventario_materiales ─────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_rw_inventario" ON public.inventario_materiales;
CREATE POLICY "admin_rw_inventario" ON public.inventario_materiales
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','encargado_inventario','operator')
    OR auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','encargado_inventario','operator')
    OR auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  );

-- ── waitlist_labs ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "waitlist_staff_all" ON public.waitlist_labs;
CREATE POLICY "waitlist_staff_all" ON public.waitlist_labs
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    OR auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    OR auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  );

-- ── notificaciones_internas ───────────────────────────────────────────
DROP POLICY IF EXISTS "staff_inserta_notifs" ON public.notificaciones_internas;
CREATE POLICY "staff_inserta_notifs" ON public.notificaciones_internas
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN
      ('admin','operator','diseno','taller','fresado','impresion','calidad',
       'contabilidad','mensajero','encargado_inventario')
    OR auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  );

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────
-- Tras ejecutar: en el panel /app/pruebas-carga pulsa "Verificar todas las
-- tablas" — cotizaciones y referidos deben salir en verde.
-- Si siguen en rojo: cierra sesión y vuelve a entrar (el JWT se emite con el
-- app_metadata al iniciar sesión, no se actualiza en caliente).
