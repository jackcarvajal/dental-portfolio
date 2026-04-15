-- ============================================================
-- PRODIGY — SECURITY FIX: RLS roles de user_metadata → app_metadata
--
-- PROBLEMA: user_metadata es EDITABLE por el usuario desde el cliente
--   await sb.auth.updateUser({ data: { role: 'admin' } })
--   → Cualquier usuario registrado podía escalar privilegios
--
-- SOLUCIÓN: app_metadata solo es editable via Service Role Key
--   (Supabase Dashboard > Authentication > Users > Edit > App Metadata)
--
-- EJECUTAR: Supabase > SQL Editor
-- DESPUÉS: reasignar roles del equipo desde el dashboard:
--   app_metadata = { "role": "operator" }  (o encargado_inventario, etc.)
-- ============================================================

-- ── 1. Helper function: leer rol de app_metadata ─────────────
-- NOTA: auth schema bloqueado en SQL Editor → usar public
CREATE OR REPLACE FUNCTION public.role_from_app_meta()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT coalesce(
        auth.jwt() -> 'app_metadata' ->> 'role',
        'client'
    );
$$;

-- ── 2. Tabla: portfolio ───────────────────────────────────────
DROP POLICY IF EXISTS "portfolio_admin_insert"  ON portfolio;
DROP POLICY IF EXISTS "portfolio_admin_update"  ON portfolio;
DROP POLICY IF EXISTS "portfolio_admin_delete"  ON portfolio;

CREATE POLICY "portfolio_admin_insert" ON portfolio FOR INSERT TO authenticated
    WITH CHECK (
        auth.jwt() ->> 'email' IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR public.role_from_app_meta() = 'admin'
    );

CREATE POLICY "portfolio_admin_update" ON portfolio FOR UPDATE TO authenticated
    USING (
        auth.jwt() ->> 'email' IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR public.role_from_app_meta() = 'admin'
    );

CREATE POLICY "portfolio_admin_delete" ON portfolio FOR DELETE TO authenticated
    USING (
        auth.jwt() ->> 'email' IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR public.role_from_app_meta() = 'admin'
    );

-- ── 3. Tabla: inventario ─────────────────────────────────────
-- Reemplaza las políticas existentes que usan user_metadata
DROP POLICY IF EXISTS "inventario_staff_read"   ON inventario_items;
DROP POLICY IF EXISTS "inventario_staff_write"  ON inventario_items;
DROP POLICY IF EXISTS "inventario_admin_all"    ON inventario_items;

CREATE POLICY "inventario_staff_read" ON inventario_items FOR SELECT TO authenticated
    USING (
        auth.jwt() ->> 'email' IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR public.role_from_app_meta() IN ('admin','encargado_inventario','operator')
    );

CREATE POLICY "inventario_staff_write" ON inventario_items FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'email' IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR public.role_from_app_meta() IN ('admin','encargado_inventario')
    )
    WITH CHECK (
        auth.jwt() ->> 'email' IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR public.role_from_app_meta() IN ('admin','encargado_inventario')
    );

-- ── 3b. Tabla: inventario_movimientos ────────────────────────
DROP POLICY IF EXISTS "inv_mov_staff_read"  ON inventario_movimientos;
DROP POLICY IF EXISTS "inv_mov_staff_write" ON inventario_movimientos;

CREATE POLICY "inv_mov_staff_read" ON inventario_movimientos FOR SELECT TO authenticated
    USING (
        auth.jwt() ->> 'email' IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR public.role_from_app_meta() IN ('admin','encargado_inventario','operator')
    );

CREATE POLICY "inv_mov_staff_write" ON inventario_movimientos FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'email' IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR public.role_from_app_meta() IN ('admin','encargado_inventario')
    )
    WITH CHECK (
        auth.jwt() ->> 'email' IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR public.role_from_app_meta() IN ('admin','encargado_inventario')
    );

-- ── 4. Tabla: equipo / staff ──────────────────────────────────
DROP POLICY IF EXISTS "equipo_admin_all" ON equipo;

CREATE POLICY "equipo_admin_all" ON equipo FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'email' IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR public.role_from_app_meta() = 'admin'
    )
    WITH CHECK (
        auth.jwt() ->> 'email' IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR public.role_from_app_meta() = 'admin'
    );

-- ============================================================
-- ACCIÓN MANUAL REQUERIDA:
-- Para cada miembro del equipo (operadores, mensajeros, etc.):
--   1. Supabase > Authentication > Users > seleccionar usuario
--   2. Raw App Meta Data (NO Raw User Meta Data):
--      { "role": "operator" }   o "mensajero", "encargado_inventario"
--   3. Guardar
-- ============================================================
