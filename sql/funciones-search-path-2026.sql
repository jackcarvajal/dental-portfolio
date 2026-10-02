-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- FUNCIONES — ruta de búsqueda fija (endurecimiento, asesor de Supabase "function_search_path_mutable")
-- 100 % IDEMPOTENTE · Copiar TODO → SQL Editor → Run · Se puede correr antes o después de los otros SQL
--
-- 34 funciones de public no fijan su search_path: usan el de quien las llama. En una función SECURITY DEFINER eso
-- permite, en teoría, que alguien con permiso para crear objetos haga que la función use una tabla "falsa" con el
-- mismo nombre. Riesgo bajo aquí (nadie externo puede crear objetos), pero es la recomendación oficial y limpia el
-- asesor.
--
-- Se les pone `public, extensions` = exactamente lo que ya usaban por defecto (menos "$user"), así que no cambia
-- su comportamiento. No toca funciones que pertenecen a extensiones.
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE f record; n int := 0;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS firma
      FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public' AND p.prokind = 'f'
       AND NOT EXISTS (SELECT 1 FROM unnest(COALESCE(p.proconfig, '{}'::text[])) c WHERE c LIKE 'search_path=%')
       AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions', f.firma);
    n := n + 1;
  END LOOP;
  RAISE NOTICE 'search_path fijado en % funciones', n;
END $$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────────────────────────────────────
-- Debe dar: sin_search_path = 0
SELECT count(*) AS sin_search_path
  FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
 WHERE ns.nspname = 'public' AND p.prokind = 'f'
   AND NOT EXISTS (SELECT 1 FROM unnest(COALESCE(p.proconfig, '{}'::text[])) c WHERE c LIKE 'search_path=%')
   AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e');
