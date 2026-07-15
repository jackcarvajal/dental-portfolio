-- ============================================================
-- PRODIGY — Doble gasto de cupón de referido (race condition en el canje)
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Contexto (auditoría 2026-07-14): prodigy_usar_cupon_credito() no era
-- atómica. El SELECT del cupón NO usaba FOR UPDATE y el UPDATE que lo
-- marca usado filtraba solo por `id`, no por `cupon_usado = false`.
-- Bajo dos requests concurrentes con el mismo cupón (callable por anon):
--   T1 SELECT (usado=false) · T2 SELECT (usado=false) — ambos pasan
--   T1 UPDATE id=X (usado=true) · T2 UPDATE id=X (bloquea, luego pasa
--   igual porque el WHERE solo mira id) → AMBOS devuelven ok:true
-- Resultado: el cupón de $30.000 se aplica a DOS pedidos → pérdida real.
--
-- Fix: UPDATE condicional atómico (compare-and-swap) — WHERE incluye
-- `cupon_usado = false`, y si afecta 0 filas significa que otra
-- transacción ya lo usó → se devuelve error. Mismo patrón que la
-- idempotencia del webhook-handler (neq.Pagado).
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_usar_cupon_credito(
  p_cupon text,
  p_pedido_codigo text DEFAULT NULL
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_row  record;
  v_monto numeric;
  v_afectadas int;
BEGIN
  -- Leer datos del cupón (para el monto/log). El candado real es el
  -- UPDATE condicional de abajo, no este SELECT.
  SELECT * INTO v_row FROM public.referidos
  WHERE cupon_credito = p_cupon
    AND cupon_usado = false
    AND estado = 'primer_pedido'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'Cupón inválido o ya usado');
  END IF;

  v_monto := v_row.recompensa_cop;

  -- Marcar como usado SOLO si sigue sin usar (atómico). Si otra
  -- transacción concurrente ya lo tomó, esto afecta 0 filas.
  UPDATE public.referidos SET
    cupon_usado = true,
    estado      = 'recompensado'
  WHERE id = v_row.id
    AND cupon_usado = false;

  GET DIAGNOSTICS v_afectadas = ROW_COUNT;
  IF v_afectadas = 0 THEN
    RETURN json_build_object('ok', false, 'error', 'Cupón ya usado');
  END IF;

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

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT prosrc FROM pg_proc WHERE proname = 'prodigy_usar_cupon_credito';
--   → el UPDATE debe contener "AND cupon_usado = false" y "GET DIAGNOSTICS"
