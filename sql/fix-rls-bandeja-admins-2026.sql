-- ================================================================
-- Bandeja de Solicitudes — permitir a los 4 admin leer/gestionar
-- solicitudes_scanner y citas_domicilio.
-- Antes solo 2 correos podían (jackalejandroc, labdentalprodigy);
-- gerencia@ y casos@ veían la bandeja vacía.
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

DROP POLICY IF EXISTS "admin_all_citas" ON citas_domicilio;
CREATE POLICY "admin_all_citas" ON citas_domicilio
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN (
            'jackalejandroc@gmail.com','labdentalprodigy@gmail.com',
            'gerencia@prodigylabdental.com','casos@prodigylabdental.com'
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN (
            'jackalejandroc@gmail.com','labdentalprodigy@gmail.com',
            'gerencia@prodigylabdental.com','casos@prodigylabdental.com'
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

DROP POLICY IF EXISTS "admin_all_scanner" ON solicitudes_scanner;
CREATE POLICY "admin_all_scanner" ON solicitudes_scanner
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN (
            'jackalejandroc@gmail.com','labdentalprodigy@gmail.com',
            'gerencia@prodigylabdental.com','casos@prodigylabdental.com'
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN (
            'jackalejandroc@gmail.com','labdentalprodigy@gmail.com',
            'gerencia@prodigylabdental.com','casos@prodigylabdental.com'
        )
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

SELECT 'RLS bandeja: 4 admin habilitados en scanner + domicilio' AS status;
