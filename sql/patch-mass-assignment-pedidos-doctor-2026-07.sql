-- ============================================================
-- PRODIGY — Mass assignment en INSERT de pedidos_doctor
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Contexto (2026-07-10): pedidos_doctor es la tabla hermana de
-- pedidos (pedidos que un doctor cliente envía desde client-panel).
-- Su policy de INSERT ("doctor_insert_pedido", migrate-doctores.sql:100)
-- solo valida `auth.uid() = doctor_id` — no restringe `estado` ni
-- `precio_final`. Igual que el bug ya corregido en pedidos, un doctor
-- autenticado podía hacer un INSERT directo a PostgREST forzando
-- estado='enviado'/'listo' o precio_final=1, saltándose el flujo JS
-- (que envía estado='recibido' y nunca precio_final).
--
-- El trigger trg_restrict_client_pedido_doctor_updates solo corre en
-- UPDATE, no en INSERT. Este patch clona el fix de
-- patch-mass-assignment-insert-pedidos-2026-07.sql.
--
-- NOTA sobre precios: precio_estimado se calcula client-side (mismo
-- caso que calcularTotal() en pedidos, INTOCABLE) — NO se toca aquí,
-- se deja como está para no romper el flujo. Solo se fuerzan los
-- campos de estado y precio_final, que son propiedad del staff.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_forzar_estado_inicial_pedido_doctor()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.estado       := 'recibido';
  NEW.precio_final := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_forzar_estado_inicial_pedido_doctor ON pedidos_doctor;
CREATE TRIGGER trg_forzar_estado_inicial_pedido_doctor
  BEFORE INSERT ON pedidos_doctor
  FOR EACH ROW
  EXECUTE FUNCTION public.prodigy_forzar_estado_inicial_pedido_doctor();

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'pedidos_doctor'::regclass AND tgname = 'trg_forzar_estado_inicial_pedido_doctor';
--   → debe devolver 1 fila
-- Prueba real (no destructiva): crea un pedido desde client-panel.html
-- (tab "Nuevo pedido") — debe seguir funcionando (estado='recibido').
