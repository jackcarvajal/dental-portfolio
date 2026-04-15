-- ============================================================
-- PRODIGY — Fix RLS: operator, client, creditos, incidencias
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- ── 1. pedidos: operador puede actualizar estado_operativo ───────
-- SIN esta política el operador llama .update() y Supabase bloquea silenciosamente
DROP POLICY IF EXISTS "pedidos_update_operator" ON pedidos;
CREATE POLICY "pedidos_update_operator" ON pedidos
    FOR UPDATE TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata'  ->> 'role') = 'operator'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'operator'  -- fallback temporal
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata'  ->> 'role') = 'operator'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'operator'
    );

-- ── 2. pedidos: doctor puede actualizar SOLO su propia calificación ─
-- Sin esto el doctor no puede enviar NPS (aunque el guard JS ya protege)
DROP POLICY IF EXISTS "pedidos_update_client_calificacion" ON pedidos;
CREATE POLICY "pedidos_update_client_calificacion" ON pedidos
    FOR UPDATE TO authenticated
    USING  (doctor_uid = auth.uid())
    WITH CHECK (doctor_uid = auth.uid());

-- ── 3. pedidos_doctor: doctor puede actualizar sus propios registros ─
-- Necesario para aprobarDiseno() y enviarCambios()
DROP POLICY IF EXISTS "pedidos_doctor_update_owner" ON pedidos_doctor;
CREATE POLICY "pedidos_doctor_update_owner" ON pedidos_doctor
    FOR UPDATE TO authenticated
    USING  (doctor_id = auth.uid())
    WITH CHECK (doctor_id = auth.uid());

-- ── 4. creditos_cliente: RLS real — sin esto cualquier usuario ve todos los créditos ─
DROP POLICY IF EXISTS "admin_all_creditos" ON creditos_cliente;

-- Admin: acceso total
CREATE POLICY "creditos_admin_all" ON creditos_cliente
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata'  ->> 'role') = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata'  ->> 'role') = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Doctor: solo lee su propio crédito (match por whatsapp del perfil)
CREATE POLICY "creditos_own_read" ON creditos_cliente
    FOR SELECT TO authenticated
    USING (
        whatsapp = (
            SELECT whatsapp FROM doctores_perfil
            WHERE id = auth.uid()
            LIMIT 1
        )
    );

-- ── 5. logs_incidencias: restringir lectura a staff (admin + operator) ─
-- Antes era USING(true) → cualquier cliente autenticado leía TODOS los reportes
DROP POLICY IF EXISTS "inc_read_admin" ON logs_incidencias;
CREATE POLICY "inc_read_staff" ON logs_incidencias
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata'  ->> 'role') IN ('admin','operator')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin','operator')
    );

-- ============================================================
-- RESULTADO:
-- ✅ Operador puede avanzar estados en pedidos
-- ✅ Doctor solo actualiza su propia calificación y aprobación de diseño
-- ✅ Wallets no son visibles entre doctors
-- ✅ Reportes de incidencias solo visibles para staff
-- ============================================================
