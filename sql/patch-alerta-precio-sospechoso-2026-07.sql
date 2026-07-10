-- ============================================================
-- PRODIGY — Alerta de precio sospechosamente bajo en nuevos pedidos
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Contexto (auditoría dinero/archivos 2026-07-09):
-- Los 4 flujos de creación (flujo-diseno.html, flujo-fresado.html,
-- flujo-lab.html, js/flujo-impresion.js) calculan precio_total con
-- calcularTotal() en el navegador y lo insertan directo en `pedidos`
-- sin que nada server-side lo revalide contra el catálogo real. La
-- validación de Stripe (stripe-checkout.js) solo confirma que el monto
-- cobrado coincide con pedidos.precio_total — pero si ese valor ya fue
-- manipulado en el INSERT, la validación "pasa" comparando el fraude
-- contra sí mismo.
--
-- Por qué esto NO es un trigger que bloquea el INSERT:
-- calcularTotal() está marcado INTOCABLE en CLAUDE.md ("sin variables
-- paralelas para precios") — reimplementar su lógica completa en SQL
-- (3 versiones distintas: diseño/fresado/lab-impresión, cada una con
-- sus propios extras de express/envío/DSD/recargos) es un trabajo
-- grande y arriesgado: un error de redondeo o un caso borde no
-- contemplado bloquearía pedidos legítimos y pagados. En su lugar,
-- este trigger NO bloquea nada — solo genera una alerta visible en
-- el panel (tab Incidencias / Torre de Control) cuando el precio de
-- un pedido nuevo es sospechosamente bajo comparado con el precio
-- base real del catálogo para ese material, para que el staff lo
-- revise ANTES de confirmar el pago o iniciar producción. Es fail-open:
-- si no encuentra el material en catalogo, no genera alerta (evita
-- falsos positivos por nombres que no matchean exactamente).
-- ============================================================

CREATE OR REPLACE FUNCTION prodigy_alerta_precio_sospechoso()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_precio_catalogo NUMERIC;
  v_cantidad         NUMERIC;
  v_piso             NUMERIC;
BEGIN
  -- Buscar el precio base real en catalogo, por id o por nombre
  -- (los distintos flujos guardan el catálogo elegido de forma distinta:
  -- unos usan el id del ítem, otros el nombre visible).
  SELECT precio INTO v_precio_catalogo
  FROM catalogo
  WHERE activo = true
    AND (id = NEW.submaterial OR nombre = NEW.submaterial OR id = NEW.material OR nombre = NEW.material)
  ORDER BY (id = NEW.submaterial OR id = NEW.material) DESC  -- preferir match exacto por id
  LIMIT 1;

  -- Si no se encontró match, no hacer nada (fail-open — evita falsos positivos)
  IF v_precio_catalogo IS NULL OR v_precio_catalogo <= 0 THEN
    RETURN NEW;
  END IF;

  v_cantidad := GREATEST(COALESCE(NEW.cantidad, NEW.piezas, NEW.unidades, 1), 1);
  v_piso     := v_precio_catalogo * v_cantidad * 0.4;  -- tolera cupones/descuentos legítimos hasta 60%

  IF NEW.precio_total IS NOT NULL AND NEW.precio_total < v_piso THEN
    INSERT INTO logs_incidencias (pedido_id, tipo, severidad, descripcion, resuelta)
    VALUES (
      NEW.id,
      'PRECIO_SOSPECHOSO',
      'CRITICA',
      format(
        '[AUTO] Pedido %s (%s) creado con precio_total=%s, muy por debajo del precio base del catálogo (%s x %s unidades = %s esperado). Revisar antes de confirmar pago o iniciar producción.',
        COALESCE(NEW.codigo, NEW.id::text), NEW.flujo, NEW.precio_total, v_precio_catalogo, v_cantidad, v_precio_catalogo * v_cantidad
      ),
      false
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_alerta_precio_sospechoso ON pedidos;
CREATE TRIGGER trg_alerta_precio_sospechoso
  AFTER INSERT ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION prodigy_alerta_precio_sospechoso();

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'pedidos'::regclass AND tgname = 'trg_alerta_precio_sospechoso';
--   → debe devolver 1 fila
-- Prueba real (opcional, no destructiva): crea un pedido de prueba desde
-- cualquier flujo con precio normal — NO debe generar ninguna fila nueva
-- en logs_incidencias con tipo='PRECIO_SOSPECHOSO'.
