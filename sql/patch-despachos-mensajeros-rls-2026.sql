-- ============================================================
-- PRODIGY — mensajeros/despachos abiertos a CUALQUIER autenticado
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-05): "admin_all_mensajeros" y
-- "admin_all_despachos" son FOR ALL TO authenticated USING(true)
-- WITH CHECK(true) pese al nombre "admin" — CUALQUIER usuario
-- autenticado (incluido un doctor cliente) podía leer/modificar
-- TODOS los mensajeros (teléfono, placa) y TODOS los despachos
-- (direcciones de entrega, coordenadas, tracking) de cualquier pedido,
-- no solo los propios.
--
-- app/mensajero.html (panel del mensajero) hace UPDATE directo sobre
-- sus propios despachos (marcar EN_REPARTO/ENTREGADO/NO_ENTREGADO) —
-- la política "mensajero_own_despachos" ya cubría SELECT para esto,
-- se amplía a UPDATE también para no depender de la política abierta.
-- ============================================================

DROP POLICY IF EXISTS "admin_all_mensajeros" ON mensajeros;
CREATE POLICY "admin_all_mensajeros" ON mensajeros
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

DROP POLICY IF EXISTS "admin_all_despachos" ON despachos;
CREATE POLICY "admin_all_despachos" ON despachos
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

-- El mensajero puede ver y actualizar (estado/novedades) solo sus
-- propios despachos asignados.
DROP POLICY IF EXISTS "mensajero_own_despachos" ON despachos;
CREATE POLICY "mensajero_own_despachos" ON despachos
    FOR SELECT TO authenticated
    USING (mensajero_id IN (SELECT id FROM mensajeros WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "mensajero_update_own_despachos" ON despachos;
CREATE POLICY "mensajero_update_own_despachos" ON despachos
    FOR UPDATE TO authenticated
    USING (mensajero_id IN (SELECT id FROM mensajeros WHERE user_id = auth.uid()))
    WITH CHECK (mensajero_id IN (SELECT id FROM mensajeros WHERE user_id = auth.uid()));

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como un doctor cliente (no admin/mensajero): SELECT * FROM despachos;
--   → debe devolver 0 filas.
-- Como el mensajero real de un despacho: sigue pudiendo marcar
--   EN_REPARTO/ENTREGADO/NO_ENTREGADO en sus propios despachos.
-- ============================================================

SELECT 'patch-despachos-mensajeros-rls-2026 aplicado' AS status;
