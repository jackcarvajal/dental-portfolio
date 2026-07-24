-- ================================================================
-- DIAGNÓSTICO RLS — ¿por qué un INSERT anónimo de pedido da 42501?
-- Supabase Dashboard → SQL Editor → pegar → Run
--
-- Contexto (auditoría 2026-07-24): un INSERT como rol `anon` que CUMPLE
-- todas las condiciones de `patch-pedidos-insert-anon-2026-07.sql`
-- (negocio='prodigy', codigo/nombre_doctor válidos, precio_total OK,
-- sin user_id/doctor_uid) igual es rechazado por RLS. Señal de que la
-- policy desplegada NO coincide con el repo (o no existe). El flujo del
-- cliente SIN sesión no podría crear pedidos → bloqueador de lanzamiento.
-- ================================================================

-- 1) ¿RLS está habilitado en pedidos?
select relname, relrowsecurity as rls_habilitado
from pg_class
where relname = 'pedidos';

-- 2) Policies de INSERT desplegadas realmente sobre pedidos.
--    Comparar 'roles' y 'with_check' contra el repo. Debe existir una
--    para el rol {anon} cuyo WITH CHECK permita el flujo público.
select policyname, cmd, roles, with_check
from pg_policies
where schemaname = 'public'
  and tablename  = 'pedidos'
  and cmd = 'INSERT'
order by policyname;

-- Si NO aparece una policy INSERT para {anon} (o su with_check difiere del
-- repo): re-ejecutar sql/patch-pedidos-insert-anon-2026-07.sql para
-- (re)crear 'pedidos_insert_flujo_publico'.
