-- ═══════════════════════════════════════════════════════════════
-- DIAGNÓSTICO (read-only) — privilegios de ESCRITURA del rol `anon`
--
-- Motivo: auditoría 2026-09-07 detectó vía PostgREST que `anon` (la anon key
-- PÚBLICA del frontend) responde 204 a DELETE y UPDATE en tablas sensibles
-- (pedidos, pagos, clientes, casos_portafolio, perfiles, reviews, cotizaciones),
-- mientras INSERT da 401. Eso indica GRANT de UPDATE/DELETE a anon que NO debería
-- existir → un atacante anónimo podría borrar/alterar datos (p. ej. el portafolio).
--
-- Este script NO cambia nada. Sólo lista el alcance real. Pegar en Supabase SQL
-- Editor → Run, y revisar las 3 salidas.
-- ═══════════════════════════════════════════════════════════════

-- 1) Tablas donde `anon` tiene UPDATE o DELETE (el problema)
SELECT table_name, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privilegios_anon
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
  AND table_schema = 'public'
  AND privilege_type IN ('UPDATE', 'DELETE', 'TRUNCATE')
GROUP BY table_name
ORDER BY table_name;

-- 2) Estado de RLS por tabla (rowsecurity=false => tabla TOTALMENTE abierta al grant)
SELECT c.relname AS tabla, c.relrowsecurity AS rls_activo, c.relforcerowsecurity AS rls_forzado
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relrowsecurity ASC, c.relname;  -- las de arriba (rls_activo=false) son las más expuestas

-- 3) Políticas que permiten a anon algo más que SELECT (cmd = ALL/UPDATE/DELETE)
SELECT tablename, policyname, cmd, roles, qual AS using_expr
FROM pg_policies
WHERE schemaname = 'public'
  AND (roles @> ARRAY['anon']::name[] OR roles @> ARRAY['public']::name[])
  AND cmd IN ('ALL', 'UPDATE', 'DELETE')
ORDER BY tablename, cmd;
