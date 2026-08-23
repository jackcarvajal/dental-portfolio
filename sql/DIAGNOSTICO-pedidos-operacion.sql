-- ═══════════════════════════════════════════════════════════════
-- DIAGNÓSTICO — la vista public.pedidos_operacion está desfasada del código
--
-- Verificado EN VIVO (anon): estas columnas que el código pide a la vista
-- devuelven 42703 "column does not exist":
--   • operario.html:442 (tablero)  → cotizacion_fab_monto, cotizacion_fab_estado,
--                                     cotizacion_fab_nota
--   • operario.html:459/461 (comprobantes) → fabricacion_tipo, cotizacion_fab_*
--   • calidad.html:396 (panel QA)  → nombre_doctor, pago_estado, fotos_empaque,
--                                     nota_calidad, timestamp_qa
--   • operario cardHTML → nombre_paciente (cosmético)
-- Efecto: esos SELECT fallan ENTEROS (400) → el tablero/panel no carga esos casos.
-- Todas esas columnas SÍ existen en la tabla base `pedidos`.
--
-- NO recreo la vista a ciegas: puede tener un WHERE que es su frontera de
-- seguridad (qué filas ve el operario) y/o correr con privilegios del owner.
-- PASO 1 — corre esto y pega el resultado; con eso genero el CREATE OR REPLACE
-- exacto que solo AÑADE las columnas faltantes al final, sin tocar el filtro.
-- ═══════════════════════════════════════════════════════════════

SELECT pg_get_viewdef('public.pedidos_operacion'::regclass, true) AS definicion_actual;

-- (opcional) confirmar si la vista respeta RLS del invocador o corre como owner:
SELECT c.relname, c.reloptions
FROM pg_class c
WHERE c.relname = 'pedidos_operacion' AND c.relkind = 'v';
