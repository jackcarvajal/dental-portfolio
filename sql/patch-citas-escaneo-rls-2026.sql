-- ============================================================
-- PRODIGY — citas_escaneo abierta por completo a anon sin sesión
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-05): "anon_upsert_citas" es
-- FOR ALL TO anon USING(true) WITH CHECK(true) — cualquier visitante
-- sin sesión podía leer, modificar o BORRAR cualquier cita de escaneo
-- intraoral de cualquier cliente (whatsapp, dirección, notas). La
-- tabla no tiene ningún llamador en el código actual (ni frontend ni
-- backend) — se restringe a solo staff sin riesgo de romper nada.
-- ============================================================

DROP POLICY IF EXISTS "anon_upsert_citas" ON citas_escaneo;
CREATE POLICY "admin_all_citas_escaneo" ON citas_escaneo
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

SELECT 'patch-citas-escaneo-rls-2026 aplicado' AS status;
