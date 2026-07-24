-- ================================================================
-- DIAGNÓSTICO — ¿por qué 'pedidos' nunca guarda? (2026-07-23)
-- Correr en: Supabase Dashboard → SQL Editor
-- Proyecto compartido PRODIGY / Alejandro CAD/CAM (zgihrwqfyvgyapbwzkvw)
--
-- Objetivo: el INSERT de los flujos (flujo-diseno.html, etc.) manda
-- 'tipo_trabajo' pero NO manda 'servicio'. Si en la BD real 'servicio'
-- sigue siendo NOT NULL sin default, TODO INSERT de pedido falla y la
-- tabla queda vacía en silencio. Estas 2 consultas lo confirman.
-- ================================================================

-- 1) Columnas NOT NULL SIN default de 'pedidos'.
--    El INSERT del flujo debe llenar TODAS estas. Si aparece alguna que
--    el flujo no manda (p. ej. 'servicio'), ESA rompe la creación.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'pedidos'
  and is_nullable  = 'NO'
  and column_default is null
order by column_name;

-- 2) Estado puntual de las 4 columnas en disputa.
--    Ideal: existe 'tipo_trabajo'; y 'servicio' NO existe, o es nullable,
--    o tiene default. Si 'servicio' = NO / null-default → hay que arreglarlo.
select column_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'pedidos'
  and column_name in ('servicio', 'tipo_trabajo', 'precio_total', 'stl_url')
order by column_name;
