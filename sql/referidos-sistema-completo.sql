-- ============================================================
-- PRODIGY — Sistema de Referidos COMPLETO (Opción B: cupones)
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- ── PASO 1: Agregar columna codigo_referido a pedidos ────────
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS codigo_referido text DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_codigo_referido
  ON public.pedidos(codigo_referido)
  WHERE codigo_referido IS NOT NULL;

-- ── PASO 2: Agregar columna cupon_credito a referidos ────────
-- El cupón se genera cuando el referido paga su primer caso
ALTER TABLE public.referidos
  ADD COLUMN IF NOT EXISTS cupon_credito text UNIQUE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cupon_usado   boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cupon_at      timestamptz DEFAULT NULL;

-- Ajustar descuento a 5% y recompensa a 30K si quedaron en 10%/0
UPDATE public.referidos SET descuento_pct = 5   WHERE descuento_pct = 10;
UPDATE public.referidos SET recompensa_cop = 30000 WHERE recompensa_cop = 0;

-- ── PASO 3: Función que genera cupón único ───────────────────
CREATE OR REPLACE FUNCTION public._generar_cupon_credito()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE v_cupon text; v_existe boolean;
BEGIN
  LOOP
    v_cupon := 'CRED-' || upper(substring(md5(random()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM public.referidos WHERE cupon_credito = v_cupon) INTO v_existe;
    EXIT WHEN NOT v_existe;
  END LOOP;
  RETURN v_cupon;
END;
$$;

-- ── PASO 4: Función trigger principal ────────────────────────
CREATE OR REPLACE FUNCTION public.prodigy_detectar_primer_pedido_referido()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email       text;
  v_codigo      text;
  v_cupon       text;
  v_ref_id      uuid;
BEGIN
  -- Solo actuar cuando pago_estado cambia A 'pago_confirmado'
  IF NEW.pago_estado = 'pago_confirmado' AND
     (OLD.pago_estado IS DISTINCT FROM 'pago_confirmado') AND
     NEW.codigo_referido IS NOT NULL THEN

    v_codigo := NEW.codigo_referido;
    v_email  := COALESCE(NEW.email, NEW.nombre_doctor);

    -- Verificar que el referido no haya sido ya procesado
    SELECT id INTO v_ref_id FROM public.referidos
    WHERE codigo = v_codigo AND estado IN ('pendiente','registrado')
    LIMIT 1;

    IF v_ref_id IS NOT NULL THEN
      -- Generar cupón único de crédito para el referidor
      v_cupon := public._generar_cupon_credito();

      -- Actualizar estado del referido
      UPDATE public.referidos SET
        estado         = 'primer_pedido',
        referido_email = COALESCE(referido_email, v_email),
        referido_at    = COALESCE(referido_at, NOW()),
        cupon_credito  = v_cupon,
        cupon_at       = NOW()
      WHERE id = v_ref_id;

      -- Log para auditoría
      INSERT INTO public.logs_incidencias(tipo, severidad, descripcion, resuelta)
      VALUES (
        'REFERIDO_PRIMER_PEDIDO', 'INFO',
        '[REFERIDOS] Primer pedido confirmado — código: ' || v_codigo ||
        ' | cupón generado: ' || v_cupon ||
        ' | pedido: ' || COALESCE(NEW.codigo, NEW.id::text),
        true
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ── PASO 5: Crear los triggers ───────────────────────────────
DROP TRIGGER IF EXISTS trg_referidos_primer_pedido ON public.pedidos;
CREATE TRIGGER trg_referidos_primer_pedido
  AFTER UPDATE OF pago_estado ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.prodigy_detectar_primer_pedido_referido();

DROP TRIGGER IF EXISTS trg_referidos_primer_pedido_insert ON public.pedidos;
CREATE TRIGGER trg_referidos_primer_pedido_insert
  AFTER INSERT ON public.pedidos
  FOR EACH ROW
  WHEN (NEW.pago_estado = 'pago_confirmado' AND NEW.codigo_referido IS NOT NULL)
  EXECUTE FUNCTION public.prodigy_detectar_primer_pedido_referido();

-- ── PASO 6: RPC para validar y usar un cupón de crédito ──────
-- Llamado desde flujo-diseno/fresado/impresion al aplicar cupón
CREATE OR REPLACE FUNCTION public.prodigy_usar_cupon_credito(
  p_cupon text,
  p_pedido_codigo text DEFAULT NULL
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_row  record;
  v_monto numeric;
BEGIN
  SELECT * INTO v_row FROM public.referidos
  WHERE cupon_credito = p_cupon
    AND cupon_usado = false
    AND estado = 'primer_pedido'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'Cupón inválido o ya usado');
  END IF;

  v_monto := v_row.recompensa_cop;

  -- Marcar cupón como usado
  UPDATE public.referidos SET
    cupon_usado = true,
    estado      = 'recompensado'
  WHERE id = v_row.id;

  -- Log
  INSERT INTO public.logs_incidencias(tipo, severidad, descripcion, resuelta)
  VALUES (
    'CUPON_CREDITO_USADO', 'INFO',
    '[REFERIDOS] Cupón ' || p_cupon || ' usado en pedido ' || COALESCE(p_pedido_codigo,'—') ||
    ' por Dr. ' || COALESCE(v_row.referidor_email,'—') || ' — crédito: $' || v_monto,
    true
  );

  RETURN json_build_object(
    'ok', true,
    'monto', v_monto,
    'referidor_email', v_row.referidor_email,
    'referidor_nombre', v_row.referidor_nombre
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.prodigy_usar_cupon_credito(text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public._generar_cupon_credito() TO authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_detectar_primer_pedido_referido() TO authenticated;
