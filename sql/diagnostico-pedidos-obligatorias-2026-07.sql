-- ================================================================
-- DIAGNÓSTICO (parte final) — columnas OBLIGATORIas de 'pedidos'
-- Correr en: Supabase Dashboard → SQL Editor → pegar → Run
--
-- Lista TODAS las columnas que un INSERT DEBE llenar sí o sí
-- (NOT NULL y sin valor por defecto). El flujo de creación tiene
-- que mandar cada una. Si aparece alguna que el flujo NO manda,
-- esa es la que rompe la creación de pedidos.
-- ================================================================

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'pedidos'
  and is_nullable  = 'NO'
  and column_default is null
order by column_name;
