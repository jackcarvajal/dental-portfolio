-- ============================================================
-- PRODIGY — Patch: RLS en bibliotecas_cliente y diseno_revisiones
-- Tablas no auditadas completamente en sesiones anteriores
-- ============================================================

-- ── 1. bibliotecas_cliente — archivos STL guardados por el cliente ──
ALTER TABLE bibliotecas_cliente ENABLE ROW LEVEL SECURITY;

-- Cliente solo ve sus propias bibliotecas
DROP POLICY IF EXISTS "bib_select_owner" ON bibliotecas_cliente;
CREATE POLICY "bib_select_owner" ON bibliotecas_cliente
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Cliente solo inserta en su propia carpeta
DROP POLICY IF EXISTS "bib_insert_owner" ON bibliotecas_cliente;
CREATE POLICY "bib_insert_owner" ON bibliotecas_cliente
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Cliente solo elimina sus propias bibliotecas
DROP POLICY IF EXISTS "bib_delete_owner" ON bibliotecas_cliente;
CREATE POLICY "bib_delete_owner" ON bibliotecas_cliente
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- Admin ve todo
DROP POLICY IF EXISTS "bib_select_admin" ON bibliotecas_cliente;
CREATE POLICY "bib_select_admin" ON bibliotecas_cliente
    FOR ALL TO authenticated
    USING (
        (current_setting('request.jwt.claims', true)::jsonb ->> 'email')
        IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
    );

-- ── 2. diseno_revisiones — historial de versiones de diseño ──
ALTER TABLE diseno_revisiones ENABLE ROW LEVEL SECURITY;

-- Operario de diseño puede INSERT (registrar nueva revisión)
DROP POLICY IF EXISTS "dr_insert_diseno" ON diseno_revisiones;
CREATE POLICY "dr_insert_diseno" ON diseno_revisiones
    FOR INSERT TO authenticated
    WITH CHECK (
        (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role')
        IN ('admin', 'diseno', 'operator')
        OR (current_setting('request.jwt.claims', true)::jsonb ->> 'email')
        IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
    );

-- Admin ve todo
DROP POLICY IF EXISTS "dr_all_admin" ON diseno_revisiones;
CREATE POLICY "dr_all_admin" ON diseno_revisiones
    FOR ALL TO authenticated
    USING (
        (current_setting('request.jwt.claims', true)::jsonb ->> 'email')
        IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        OR (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role')
        IN ('admin', 'operator', 'diseno')
    );

-- Cliente puede SELECT de sus propias revisiones (por pedido_id)
DROP POLICY IF EXISTS "dr_select_client" ON diseno_revisiones;
CREATE POLICY "dr_select_client" ON diseno_revisiones
    FOR SELECT TO authenticated
    USING (
        pedido_id IN (
            SELECT id FROM pedidos WHERE doctor_uid = auth.uid()
        )
    );

-- ============================================================
-- RESULTADO:
-- ✅ bibliotecas_cliente: cliente solo ve/inserta/elimina las suyas
-- ✅ diseno_revisiones: cliente solo lee sus propias revisiones
-- ✅ Operarios de diseño pueden registrar nuevas versiones
-- ✅ Admin ve todo
-- ============================================================
