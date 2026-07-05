-- ============================================================
-- PRODIGY — citas_domicilio/solicitudes_scanner/config_plataformas
-- decían "solo staff/admin" pero no verificaban ningún rol
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-05): 3 políticas con nombre "admin_*" y
-- comentario "solo staff autenticado" son en realidad
-- FOR ALL TO authenticated USING(true) — CUALQUIER doctor autenticado
-- (no solo staff) podía leer/modificar:
--   - citas_domicilio: direcciones y datos de citas a domicilio de
--     cualquier cliente.
--   - solicitudes_scanner: solicitudes de escáner intraoral de
--     cualquier clínica.
--   - config_plataformas: comisiones de pago (%) que afectan el
--     cálculo de precios en toda la plataforma — un doctor podía
--     poner su propia comisión en 0.
-- El INSERT público (anon) de las 2 primeras y la lectura pública de
-- la tercera se mantienen intactos (son intencionales).
-- ============================================================

DROP POLICY IF EXISTS "admin_all_citas" ON citas_domicilio;
CREATE POLICY "admin_all_citas" ON citas_domicilio
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

DROP POLICY IF EXISTS "admin_all_scanner" ON solicitudes_scanner;
CREATE POLICY "admin_all_scanner" ON solicitudes_scanner
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

DROP POLICY IF EXISTS "admin_all_config_plataformas" ON config_plataformas;
CREATE POLICY "admin_all_config_plataformas" ON config_plataformas
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

SELECT 'patch-domicilio-scanner-config-rls-2026 aplicado' AS status;
