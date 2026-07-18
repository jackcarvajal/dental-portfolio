-- =====================================================================
-- DETECCIÓN DE PRECIOS MANIPULADOS EN PEDIDOS
-- Auditoría de flujos 2026-07-18 · proyecto zgihrwqfyvgyapbwzkvw
--
-- HALLAZGO: los flujos calculan `precio_total` en el NAVEGADOR (STATE.total)
--   y lo insertan tal cual. Alguien con la consola abierta puede modificar
--   STATE.total y guardar un pedido con el precio que quiera.
--
-- POR QUÉ NO SE BLOQUEA RECALCULANDO EN SERVIDOR:
--   El precio real depende de calcularTotal() — cantidades, subtipos, cupones
--   y descuentos. Esa función está marcada INTOCABLE en las reglas del
--   proyecto y duplicar su lógica en SQL sería frágil: un cambio de precios
--   rompería pedidos legítimos.
--
-- QUÉ HACE ESTE PARCHE: un control de DETECCIÓN. Compara el precio guardado
--   contra el precio de catálogo del material y, si está muy por debajo de lo
--   esperado, deja un aviso interno para que el equipo lo revise ANTES de
--   facturar. Los pedidos entran como 'Borrador', así que hay margen.
--   No bloquea nada: no puede romper un pedido legítimo.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.detectar_precio_sospechoso()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_precio_cat numeric;
  v_esperado   numeric;
  v_cant       integer := GREATEST(COALESCE(NEW.cantidad, 1), 1);
BEGIN
  -- Sin precio declarado no hay nada que comparar
  IF NEW.precio_total IS NULL OR NEW.precio_total <= 0 THEN
    RETURN NEW;
  END IF;

  -- Buscar el precio de catálogo del ítem (por submaterial y si no, por material)
  SELECT precio INTO v_precio_cat
  FROM public.catalogo
  WHERE id = COALESCE(NEW.submaterial, NEW.material)
  LIMIT 1;

  -- Si el ítem no está en catálogo, no podemos juzgar: salir sin ruido
  IF v_precio_cat IS NULL OR v_precio_cat <= 0 THEN
    RETURN NEW;
  END IF;

  v_esperado := v_precio_cat * v_cant;

  -- Umbral holgado: solo avisa si paga MENOS DEL 50% de lo esperado.
  -- Así los descuentos y cupones normales (que suelen ser 5-20%) no molestan.
  IF NEW.precio_total < (v_esperado * 0.5) THEN
    INSERT INTO public.notificaciones_internas (
      tipo, prioridad, destinatario_rol, destinatario_dept,
      titulo, mensaje, pedido_id, pedido_codigo, accion_url, leida_por
    ) VALUES (
      'urgente', 'alta', 'admin', NULL,
      'Revisar precio del pedido ' || COALESCE(NEW.codigo, ''),
      'El pedido ' || COALESCE(NEW.codigo, '') || ' se guardó con $' ||
        to_char(NEW.precio_total, 'FM999G999G999') || ' cuando por catálogo se esperaba ~$' ||
        to_char(v_esperado, 'FM999G999G999') || ' (' || v_cant || ' x $' ||
        to_char(v_precio_cat, 'FM999G999G999') || '). Puede ser un cupón grande o un precio ' ||
        'alterado desde el navegador. Verifica ANTES de facturar.',
      NEW.id, NEW.codigo, '/app/panel-interno-operaciones.html', '{}'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_precio_sospechoso ON public.pedidos;
CREATE TRIGGER trg_precio_sospechoso
  AFTER INSERT ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.detectar_precio_sospechoso();

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────
--   SELECT tgname FROM pg_trigger WHERE tgname = 'trg_precio_sospechoso';
--
-- Para probarlo, inserta un pedido con un precio absurdamente bajo respecto
-- al catálogo y revisa la campana de notificaciones del panel interno.
--
-- SI ALGÚN DÍA QUIERES BLOQUEAR EN VEZ DE AVISAR: cambia el INSERT del aviso
-- por  RAISE EXCEPTION 'Precio no válido';  y pásalo a BEFORE INSERT.
-- Ojo: eso SÍ puede rechazar pedidos legítimos si cambia la lógica de precios.
