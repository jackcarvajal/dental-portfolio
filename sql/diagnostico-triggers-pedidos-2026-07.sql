-- ================================================================
-- Triggers de la tabla pedidos (2026-07-24)
-- Supabase Dashboard → SQL Editor → BORRA todo lo que haya → pega esto → Run
--
-- Busca cuál trigger BEFORE INSERT modifica la fila y le pone user_id /
-- doctor_uid / cliente_id no-null (o toca negocio), rompiendo el WITH CHECK
-- de la policy anónima → 42501.
-- ================================================================

select tgname,
       pg_get_triggerdef(oid) as definicion
from pg_trigger
where tgrelid = 'public.pedidos'::regclass
  and not tgisinternal
order by tgname;
