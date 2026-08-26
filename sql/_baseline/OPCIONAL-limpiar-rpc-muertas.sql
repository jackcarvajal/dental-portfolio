-- ═══════════════════════════════════════════════════════════════
-- OPCIONAL — eliminar 2 RPC de analítica MUERTAS (nadie las llama).
--
-- Verificado con tools/sql-map.mjs + grep: 0 llamadas en código (html/js/edge),
-- 0 referencias en otro SQL, definidas 1 sola vez (sql/analytics-conversion-rpc.sql).
-- Quedaron sin cablear a ningún dashboard.
--
-- Esto es LIMPIEZA opcional (no arregla nada roto). Reversible: la definición
-- sigue en analytics-conversion-rpc.sql por si alguna vez se usan.
-- Si NO quieres tocar la base, ignóralo — no molestan.
-- ═══════════════════════════════════════════════════════════════
DROP FUNCTION IF EXISTS public.prodigy_conversion_por_tipo(timestamptz);
DROP FUNCTION IF EXISTS public.prodigy_tendencia_conversion(text, int);
-- corte_mensual: además de no usarse, está ROTA (selecciona p.whatsapp/p.total/p.servicio,
-- columnas que no existen en pedidos, y filtra estado sin ::text). Nadie la llama → segura de borrar.
DROP FUNCTION IF EXISTS public.corte_mensual(text);

-- Verificar que se fueron:
-- SELECT proname FROM pg_proc WHERE proname IN ('prodigy_conversion_por_tipo','prodigy_tendencia_conversion');
