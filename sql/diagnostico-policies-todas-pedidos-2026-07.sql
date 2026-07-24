-- ================================================================
-- TODAS las policies de pedidos (2026-07-24) — incluye cmd='ALL' y RESTRICTIVE
-- Supabase Dashboard → SQL Editor → BORRA todo → pega → Run
--
-- La consulta anterior filtró cmd='INSERT' y no mostraría una policy
-- RESTRICTIVE con cmd='ALL', que SÍ aplica a los inserts en modo AND
-- obligatorio y explicaría el 42501 aunque las permissive se cumplan.
-- Busca cualquier fila con permissive = RESTRICTIVE y cmd en (ALL, INSERT).
-- ================================================================

select policyname, permissive, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename  = 'pedidos'
order by permissive, cmd, policyname;
