-- ============================================================
-- PRODIGY — Mass assignment en INSERT de pedidos (pago_estado/estado_operativo)
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Contexto (auditoría estilo pentest 2026-07-10): la policy RLS de
-- INSERT en `pedidos` ("pedidos_insert_owner") solo valida
-- `doctor_uid = auth.uid()` — no restringe ningún otro campo. El
-- trigger `trg_restrict_client_pedido_updates` (patch-rls-client-
-- column-protection.sql) protege columnas sensibles pero SOLO en
-- UPDATE, nunca corrió en INSERT. El trigger de alerta de precio
-- (patch-alerta-precio-sospechoso-2026-07.sql) tampoco cubre esto,
-- solo mira precio_total.
--
-- Resultado: un doctor autenticado podía hacer un INSERT directo a
-- PostgREST (saltándose el JS del flujo normal, que nunca envía
-- estos campos) con pago_estado='pago_confirmado' y
-- estado_operativo='ENTREGADO' desde la creación del pedido — sin
-- haber pagado nunca. Impacto real: datos de reportes/facturación
-- corruptos con "pagos" y "entregas" falsas desde el origen (no es
-- un problema de precio, es un problema de estado — no toca
-- calcularTotal(), se puede bloquear sin riesgo).
--
-- Fix: trigger BEFORE INSERT que fuerza pago_estado y
-- estado_operativo a sus valores iniciales seguros, sin importar lo
-- que venga en el INSERT. factura_estado se recalcula server-side
-- a partir de requiere_factura (lógica legítima ya existente en el
-- flujo, se preserva).
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_forzar_estado_inicial_pedido()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.pago_estado       := 'pendiente';
  NEW.estado_operativo  := 'VALIDACION_PENDIENTE';
  NEW.factura_estado    := CASE WHEN NEW.requiere_factura THEN 'pendiente' ELSE 'no_requerida' END;
  NEW.pago_confirmado_por := NULL;
  NEW.timestamp_pago_confirmado := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_forzar_estado_inicial_pedido ON pedidos;
CREATE TRIGGER trg_forzar_estado_inicial_pedido
  BEFORE INSERT ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.prodigy_forzar_estado_inicial_pedido();

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'pedidos'::regclass AND tgname = 'trg_forzar_estado_inicial_pedido';
--   → debe devolver 1 fila
-- Prueba real (opcional, no destructiva): crea un pedido de prueba
-- desde cualquier flujo normal — debe seguir funcionando igual
-- (pago_estado='pendiente', estado_operativo='VALIDACION_PENDIENTE'),
-- porque el JS legítimo nunca envía esos campos en el INSERT.
