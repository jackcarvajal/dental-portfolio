-- ────────────────────────────────────────────────────────────────────────────
-- PRODIGY — PATCH CRÍTICO: RLS leads_doctores
-- Bug: "admin_read_leads" sin cláusula TO → anon podía leer todos los leads
-- Fix: restringir a TO authenticated
--
-- ⚠️  EJECUTAR INMEDIATAMENTE en Supabase SQL Editor
-- Impacto: usuarios anónimos ya no pueden hacer SELECT en leads_doctores
-- Las inserciones públicas (formulario journal) siguen funcionando
-- ────────────────────────────────────────────────────────────────────────────

-- Recrear política con restricción de rol correcta
DROP POLICY IF EXISTS "admin_read_leads" ON leads_doctores;
CREATE POLICY "admin_read_leads" ON leads_doctores
    FOR ALL TO authenticated USING (true);

-- Verificación: listar políticas activas en la tabla
-- SELECT policyname, roles, cmd, qual FROM pg_policies WHERE tablename = 'leads_doctores';
