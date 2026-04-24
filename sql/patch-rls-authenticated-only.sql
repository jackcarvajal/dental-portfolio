-- ────────────────────────────────────────────────────────────────────────────
-- PRODIGY — PATCH: RLS policies sin TO authenticated
-- Bug: mensajeros, despachos y creditos_cliente tenían FOR ALL USING(true)
--      sin cláusula TO → anon podía leer datos sensibles (rutas, direcciones)
-- Fix: restringir a TO authenticated
--
-- ⚠️  EJECUTAR en Supabase SQL Editor DESPUÉS de patch-rls-leads-fix.sql
-- ────────────────────────────────────────────────────────────────────────────

-- mensajeros (nombres y contacto de mensajeros internos)
DROP POLICY IF EXISTS "admin_all_mensajeros" ON mensajeros;
CREATE POLICY "admin_all_mensajeros" ON mensajeros
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- despachos (rutas, direcciones de entrega, coordenadas GPS)
DROP POLICY IF EXISTS "admin_all_despachos" ON despachos;
CREATE POLICY "admin_all_despachos" ON despachos
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- creditos_cliente (whatsapp, saldo, nivel de fidelización)
DROP POLICY IF EXISTS "admin_all_creditos" ON creditos_cliente;
CREATE POLICY "admin_all_creditos" ON creditos_cliente
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Verificación
-- SELECT tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('mensajeros','despachos','creditos_cliente');
