-- =====================================================================
-- DETECCIÓN DE PRECIOS MANIPULADOS EN PEDIDOS
-- Auditoría de flujos 2026-07-18 · proyecto zgihrwqfyvgyapbwzkvw
-- Definición CANÓNICA de detectar_precio_sospechoso() (editar aquí, no en otro patch).
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
--
-- 20-nov-2026 — ARREGLO DE MONEDA (falsas alarmas en Alejandro CAD/CAM):
--   `catalogo.precio` está en PESOS, pero los diseños de Alejandro CAD/CAM se
--   guardan en DÓLARES (precio_total = 12 → «se esperaba ~$15.000»): cada pedido
--   de Alejandro disparaba la alerta. Ahora:
--     · Pedido en USD (moneda = 'USD', o de Alejandro con precio < 1.000, la
--       misma regla que functions/api/paypal-pedidos.js) → se compara contra
--       catalogo.precio_usd; si el catálogo no tiene precio en dólares (hoy
--       ninguno lo tiene), no se juzga.
--     · Pedido en COP → contra el menor entre `precio` y `precio_oferta`
--       (una oferta vigente ya no dispara la alarma).
--     · Otra moneda → no se juzga.
--     · El aviso dice la moneda y abre el panel del negocio correcto.
--
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.detectar_precio_sospechoso()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_precio_cat numeric;
  v_precio_cop numeric;
  v_precio_usd numeric;
  v_oferta     numeric;
  v_esperado   numeric;
  v_cant       integer := GREATEST(COALESCE(NEW.cantidad, 1), 1);
  v_moneda     text    := upper(btrim(COALESCE(NEW.moneda, '')));
  v_es_ac      boolean := COALESCE(NEW.negocio, '') = 'alejandrocadcam';
  v_usd        boolean;
  v_fmt        text;
  v_simbolo    text;
BEGIN
  -- Sin precio declarado no hay nada que comparar
  IF NEW.precio_total IS NULL OR NEW.precio_total <= 0 THEN
    RETURN NEW;
  END IF;

  -- ¿En qué moneda está precio_total?
  IF v_moneda = 'USD' THEN
    v_usd := true;
  ELSIF v_moneda IN ('', 'COP') THEN
    -- Alejandro guardaba dólares con la moneda por defecto ('COP'): debajo de 1.000 es USD
    v_usd := v_es_ac AND NEW.precio_total < 1000;
  ELSE
    RETURN NEW;   -- otra moneda: no hay catálogo con qué comparar
  END IF;

  -- Buscar el precio de catálogo del ítem (por submaterial y si no, por material)
  SELECT precio, precio_usd, precio_oferta
    INTO v_precio_cop, v_precio_usd, v_oferta
  FROM public.catalogo
  WHERE id = COALESCE(NEW.submaterial, NEW.material)
  LIMIT 1;

  IF v_usd THEN
    v_precio_cat := v_precio_usd;
  ELSE
    -- Con oferta cargada se toma el menor: una oferta vigente no es un precio alterado
    v_precio_cat := CASE WHEN COALESCE(v_oferta, 0) > 0 THEN LEAST(v_precio_cop, v_oferta) ELSE v_precio_cop END;
  END IF;

  -- Si el ítem no está en catálogo (o no tiene precio en esa moneda), no podemos juzgar: salir sin ruido
  IF v_precio_cat IS NULL OR v_precio_cat <= 0 THEN
    RETURN NEW;
  END IF;

  v_esperado := v_precio_cat * v_cant;

  -- Umbral holgado: solo avisa si paga MENOS DEL 50% de lo esperado.
  -- Así los descuentos y cupones normales (que suelen ser 5-20%) no molestan.
  IF NEW.precio_total < (v_esperado * 0.5) THEN
    v_fmt     := CASE WHEN v_usd THEN 'FM999G999G990D00' ELSE 'FM999G999G999' END;
    v_simbolo := CASE WHEN v_usd THEN 'US$' ELSE '$' END;
    INSERT INTO public.notificaciones_internas (
      tipo, prioridad, destinatario_rol, destinatario_dept,
      titulo, mensaje, pedido_id, pedido_codigo, accion_url, leida_por
    ) VALUES (
      'urgente', 'alta', 'admin', NULL,
      'Revisar precio del pedido ' || COALESCE(NEW.codigo, ''),
      'El pedido ' || COALESCE(NEW.codigo, '') || ' se guardó con ' || v_simbolo ||
        to_char(NEW.precio_total, v_fmt) || ' cuando por catálogo se esperaba ~' || v_simbolo ||
        to_char(v_esperado, v_fmt) || ' (' || v_cant || ' x ' || v_simbolo ||
        to_char(v_precio_cat, v_fmt) || CASE WHEN v_usd THEN ' USD' ELSE ' COP' END ||
        '). Puede ser un cupón grande o un precio alterado desde el navegador. Verifica ANTES de facturar.',
      NEW.id, NEW.codigo,
      CASE WHEN v_es_ac THEN '/app/admin-panel.html' ELSE '/app/panel-interno-operaciones.html' END,
      '{}'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Función de trigger: nadie la llama por RPC
REVOKE ALL ON FUNCTION public.detectar_precio_sospechoso() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_precio_sospechoso ON public.pedidos;
CREATE TRIGGER trg_precio_sospechoso
  AFTER INSERT ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.detectar_precio_sospechoso();

-- ── VERIFICACIÓN (debe dar: trigger_activo = true · revisa_moneda = true · anon_puede_ejecutar = false) ──
SELECT
  EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_precio_sospechoso' AND tgenabled = 'O')   AS trigger_activo,
  position('precio_usd' IN pg_get_functiondef('public.detectar_precio_sospechoso()'::regprocedure)) > 0 AS revisa_moneda,
  has_function_privilege('anon', 'public.detectar_precio_sospechoso()', 'EXECUTE')               AS anon_puede_ejecutar;

-- SI ALGÚN DÍA QUIERES BLOQUEAR EN VEZ DE AVISAR: cambia el INSERT del aviso
-- por  RAISE EXCEPTION 'Precio no válido';  y pásalo a BEFORE INSERT.
-- Ojo: eso SÍ puede rechazar pedidos legítimos si cambia la lógica de precios.
