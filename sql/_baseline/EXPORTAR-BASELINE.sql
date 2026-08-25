-- ═══════════════════════════════════════════════════════════════
-- EXPORTAR BASELINE — la VERDAD de lo que está desplegado hoy en Supabase.
--
-- El `sql/` son 158 parches sin fuente única de verdad: la misma RPC vive en
-- 4–5 archivos y no se sabe cuál corre. Esto vuelca lo REAL de la base para
-- volverlo el baseline. Corre cada bloque en el SQL Editor y guarda su salida
-- en el archivo indicado (dentro de sql/_baseline/). A partir de ahí, ESO es la verdad.
-- ═══════════════════════════════════════════════════════════════

-- ── 1) FUNCIONES desplegadas (definición exacta) → guarda en _baseline/functions.sql ──
--    Devuelve UNA celda con todas las funciones concatenadas y listas para versionar.
SELECT string_agg(
         pg_get_functiondef(p.oid),
         E'\n\n-- ───────────────────────────────────────────\n\n'
         ORDER BY p.proname
       ) AS functions_ddl
FROM   pg_proc p
JOIN   pg_namespace n ON n.oid = p.pronamespace
WHERE  n.nspname = 'public' AND p.prokind = 'f';

-- ── 2) ENUMS y sus valores → guarda en _baseline/enums.txt ──
SELECT t.typname AS enum,
       string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS valores
FROM   pg_type t
JOIN   pg_enum e       ON e.enumtypid  = t.oid
JOIN   pg_namespace n  ON n.oid        = t.typnamespace
WHERE  n.nspname = 'public'
GROUP  BY t.typname
ORDER  BY 1;

-- ── 3) TABLAS y columnas (contrato de esquema) → guarda en _baseline/schema.csv ──
--    Formato table,"col,col,..." (el mismo que consume tools/audit-schema.mjs --schema-all).
SELECT table_name || ',"' ||
       string_agg(column_name, ',' ORDER BY ordinal_position) || '"' AS csv
FROM   information_schema.columns
WHERE  table_schema = 'public'
GROUP  BY table_name
ORDER  BY 1;

-- ── 4) VISTAS y su definición → guarda en _baseline/views.sql ──
SELECT viewname,
       pg_get_viewdef((quote_ident(schemaname) || '.' || quote_ident(viewname))::regclass, true) AS definicion
FROM   pg_views
WHERE  schemaname = 'public'
ORDER  BY 1;

-- Después: con _baseline/functions.sql podemos comparar cada RPC contra sus copias del repo
-- (tools/sql-map.mjs) y dejar UNA definición canónica por función.
