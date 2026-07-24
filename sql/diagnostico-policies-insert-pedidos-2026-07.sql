-- ================================================================
-- DIAGNÓSTICO RLS — ¿por qué un INSERT anónimo de pedido da 42501?
-- Supabase Dashboard → SQL Editor → pegar → Run
--
-- Contexto (auditoría 2026-07-24): un INSERT como rol `anon` que CUMPLE
-- todas las condiciones de `patch-pedidos-insert-anon-2026-07.sql`
-- (negocio='prodigy', codigo/nombre_doctor válidos, precio_total OK,
-- sin user_id/doctor_uid) igual es rechazado por RLS. Señal de que la
-- policy desplegada NO coincide con el repo (o no existe). El flujo del
-- cliente SIN sesión no podría crear pedidos → bloqueador de lanzamiento.
-- ================================================================

-- 1) ¿RLS está habilitado en pedidos?
select relname, relrowsecurity as rls_habilitado
from pg_class
where relname = 'pedidos';

-- 2) Policies de INSERT desplegadas + si son PERMISSIVE o RESTRICTIVE.
--    CLAVE: si 'pedidos_insert_own' (rol public) es RESTRICTIVE, se aplica
--    en modo AND a TODO insert; un anónimo (auth.uid() NULL) nunca cumple
--    su subquery de clientes → bloquea todos los inserts anónimos (42501).
select policyname, permissive, roles, with_check
from pg_policies
where schemaname = 'public'
  and tablename  = 'pedidos'
  and cmd = 'INSERT'
order by permissive, policyname;
-- Haz clic en la celda 'with_check' de pedidos_insert_own para verla completa.


-- 3) *** LA CLAVE *** — WITH CHECK COMPLETO de la policy anónima.
--    Todas son PERMISSIVE, así que un insert anon DEBERÍA pasar si esta se
--    cumple. Como no pasa, esta policy tiene condiciones extra (vs el repo)
--    que ni un payload realista cumple. Este SELECT la muestra entera.
--    Haz clic en la celda del resultado para expandirla y pásame el texto.
select with_check
from pg_policies
where schemaname = 'public'
  and tablename  = 'pedidos'
  and policyname = 'pedidos_insert_flujo_publico';


-- 4) *** MEJOR *** — parte el WITH CHECK en una condición por fila
--    (así la UI no la corta). Pásame TODAS las filas.
select trim(condicion) as condicion
from pg_policies,
     unnest(string_to_array(with_check, ' AND ')) as condicion
where schemaname = 'public'
  and tablename  = 'pedidos'
  and policyname = 'pedidos_insert_flujo_publico';


-- 5) *** CLAVE FINAL *** — el insert cumple la policy pero igual da 42501.
--    Con todas las policies PERMISSIVE, eso solo pasa si un trigger BEFORE
--    INSERT modifica la fila (p.ej. setea user_id/doctor_uid no-null) y así
--    la fila final ya no cumple el WITH CHECK. Estos triggers lo revelan:
select tgname,
       pg_get_triggerdef(oid) as definicion
from pg_trigger
where tgrelid = 'public.pedidos'::regclass
  and not tgisinternal
order by tgname;

-- 6) Defaults de las columnas de identidad (por si un DEFAULT las llena):
select column_name, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'pedidos'
  and column_name in ('doctor_uid','user_id','cliente_id','negocio');

-- Si NO aparece una policy INSERT para {anon} (o su with_check difiere del
-- repo): re-ejecutar sql/patch-pedidos-insert-anon-2026-07.sql para
-- (re)crear 'pedidos_insert_flujo_publico'.
