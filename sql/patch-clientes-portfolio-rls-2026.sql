-- ============================================================
-- PRODIGY — clientes/portfolio abiertos a cualquier autenticado
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-05):
-- - "admin_all_clientes" (tabla clientes: nombre, email, clínica,
--   ciudad, WhatsApp) es USING(true) WITH CHECK(true) pese al nombre
--   "admin" — cualquier doctor autenticado podía leer/modificar los
--   datos de contacto de TODOS los clientes. Solo tiene un llamador
--   en el código (app/panel-interno-operaciones.html, panel de staff).
-- - "admin_write_portfolio" (galería pública de casos) igual de
--   abierta — cualquier doctor autenticado podía insertar/editar/
--   borrar la galería pública de marketing (defacement).
-- ============================================================

DROP POLICY IF EXISTS "admin_all_clientes" ON clientes;
CREATE POLICY "admin_all_clientes" ON clientes
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

DROP POLICY IF EXISTS "admin_write_portfolio" ON portfolio;
CREATE POLICY "admin_write_portfolio" ON portfolio
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

SELECT 'patch-clientes-portfolio-rls-2026 aplicado' AS status;
