-- ============================================================
-- PRODIGY — CRÍTICO: eliminar escalamiento de privilegios vía user_metadata
-- Ejecutar en: Supabase Dashboard → SQL Editor — CON PRIORIDAD MÁXIMA
--
-- Hallazgo (auditoría 2026-07-03): múltiples políticas RLS usan
-- `auth.jwt() -> 'user_metadata' ->> 'role'` (o su equivalente
-- `raw_user_meta_data`) como condición de autorización, casi siempre
-- como fallback con OR junto al chequeo correcto de app_metadata.
--
-- user_metadata es un campo que EL PROPIO USUARIO puede editar desde
-- el navegador, sin ningún control de servidor:
--
--   await supabase.auth.updateUser({ data: { role: 'admin' } })
--
-- Cualquier doctor/cliente autenticado podía ejecutar esa línea desde
-- la consola del navegador y, en su siguiente sesión/refresh de JWT,
-- obtener acceso de:
--   - admin total a `creditos_cliente` (saldo a favor de TODOS los
--     doctores — podía leer y modificar cualquier saldo)
--   - lectura de TODOS los reportes internos en `logs_incidencias`
--   - UPDATE de `estado_operativo` en CUALQUIER pedido (rol 'operator')
--   - admin total a `doctores_perfil` (perfiles de todos los doctores)
--   - admin total a `pedidos_doctor` (todos los pedidos, rol admin/operator)
--   - admin total a `perfiles` (tabla de equipo interno — podía incluso
--     verse a sí mismo con rol admin ahí también)
--   - escritura en `inventario_items`/`lotes_material`/`inventario_movimientos`
--     (rol 'encargado_inventario')
--
-- Este es el hallazgo MÁS GRAVE de toda la auditoría: no requiere
-- ningún exploit sofisticado, solo una línea de JavaScript en la
-- consola del navegador estando logueado como cualquier doctor.
-- ============================================================

-- ── 1. creditos_cliente — admin total (migrate-fix-rls-roles.sql) ──
DROP POLICY IF EXISTS "creditos_admin_all" ON creditos_cliente;
CREATE POLICY "creditos_admin_all" ON creditos_cliente
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- ── 2. logs_incidencias — lectura staff (migrate-fix-rls-roles.sql) ──
DROP POLICY IF EXISTS "inc_read_staff" ON logs_incidencias;
CREATE POLICY "inc_read_staff" ON logs_incidencias
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

-- ── 3. pedidos — UPDATE operator (migrate-fix-rls-roles.sql) ──
DROP POLICY IF EXISTS "pedidos_update_operator" ON pedidos;
CREATE POLICY "pedidos_update_operator" ON pedidos
    FOR UPDATE TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator');

-- ── 4. doctores_perfil — admin (migrate-doctores.sql) ──
DROP POLICY IF EXISTS "admin_all_profiles" ON doctores_perfil;
CREATE POLICY "admin_all_profiles" ON doctores_perfil
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- ── 5. pedidos_doctor — admin/operator (migrate-doctores.sql) ──
DROP POLICY IF EXISTS "admin_all_pedidos" ON pedidos_doctor;
CREATE POLICY "admin_all_pedidos" ON pedidos_doctor
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

-- ── 6. perfiles (equipo interno) — admin (migrate-equipo.sql) ──
DROP POLICY IF EXISTS "perfiles_admin_all" ON perfiles;
CREATE POLICY "perfiles_admin_all" ON perfiles
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- ── 7. inventario_items / lotes_material / inventario_movimientos ──
-- (migrate-inventario.sql)
DROP POLICY IF EXISTS "inv_write_admin" ON inventario_items;
CREATE POLICY "inv_write_admin" ON inventario_items
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'encargado_inventario'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'encargado_inventario'
    );

DROP POLICY IF EXISTS "lotes_write_admin" ON lotes_material;
CREATE POLICY "lotes_write_admin" ON lotes_material
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'encargado_inventario'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'encargado_inventario'
    );

DROP POLICY IF EXISTS "mov_write_admin" ON inventario_movimientos;
CREATE POLICY "mov_write_admin" ON inventario_movimientos
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'encargado_inventario'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'encargado_inventario'
    );

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Ejecutar como cualquier usuario autenticado NO-admin (ej. una cuenta
-- de prueba de doctor) tras correr:
--   await supabase.auth.updateUser({ data: { role: 'admin' } })
-- y luego intentar:
--   await supabase.from('creditos_cliente').select('*')
-- Debe devolver 0 filas o error de permisos — NO debe mostrar los
-- creditos de otros doctores.
--
-- SELECT policyname, qual FROM pg_policies
-- WHERE tablename IN ('creditos_cliente','logs_incidencias','pedidos',
--   'doctores_perfil','pedidos_doctor','perfiles','inventario_items',
--   'lotes_material','inventario_movimientos')
--   AND (qual LIKE '%user_metadata%' OR qual LIKE '%raw_user_meta_data%');
-- → debe devolver 0 filas (ninguna policy activa debe mencionar
--   user_metadata/raw_user_meta_data en su condición)
-- ============================================================
