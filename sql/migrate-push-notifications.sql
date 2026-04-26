-- ================================================================
-- PRODIGY Push Notifications — migración
-- Ejecutar en Supabase SQL Editor
-- ================================================================

-- 1. Campo numero_guia en pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS numero_guia text;

-- 2. Corregir RLS push_subscriptions: permitir INSERT desde anon
--    (doctores en seguimiento-caso.html no están autenticados)
DROP POLICY IF EXISTS "push_insert_any" ON push_subscriptions;

CREATE POLICY "push_insert_anon" ON push_subscriptions
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "push_insert_auth" ON push_subscriptions
    FOR INSERT TO authenticated WITH CHECK (true);

-- 3. Permitir SELECT propio por endpoint (para no duplicar suscripciones)
DROP POLICY IF EXISTS "push_select_own" ON push_subscriptions;
CREATE POLICY "push_select_own" ON push_subscriptions
    FOR SELECT TO anon USING (true);
