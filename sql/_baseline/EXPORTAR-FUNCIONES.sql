-- ═══════════════════════════════════════════════════════════════
-- Solo FUNCIONES desplegadas. Corre ESTE archivo solo (una sola consulta)
-- para que el editor te devuelva las funciones (no las vistas).
-- Devuelve UNA celda gigante con TODAS las funciones concatenadas → pégamela
-- o guárdala en sql/_baseline/functions.sql. Con eso hago el dedup de las 36 RPC.
-- ═══════════════════════════════════════════════════════════════
SELECT string_agg(
         pg_get_functiondef(p.oid),
         E'\n\n-- ───────────────────────────────────────────\n\n'
         ORDER BY p.proname
       ) AS functions_ddl
FROM   pg_proc p
JOIN   pg_namespace n ON n.oid = p.pronamespace
WHERE  n.nspname = 'public' AND p.prokind = 'f';
