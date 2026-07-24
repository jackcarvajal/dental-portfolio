-- ================================================================
-- Código de la función del trigger BEFORE INSERT de pedidos (2026-07-24)
-- Supabase Dashboard → SQL Editor → BORRA todo → pega → Run
--
-- Es el único BEFORE INSERT (trg_forzar_estado_inicial_pedido). Si setea
-- NEW.user_id / NEW.doctor_uid / NEW.cliente_id a algo no-null, o cambia
-- NEW.negocio, rompe el WITH CHECK de la policy anónima → 42501.
-- Haz clic en la celda del resultado para leerla completa y pásamela.
-- ================================================================

select pg_get_functiondef('public.prodigy_forzar_estado_inicial_pedido'::regproc);
