-- ════════════════════════════════════════════════════════════════════════════
-- CRÉDITOS DE DISEÑO — PAGO EN LÍNEA CON PAYPAL (Alejandro CAD/CAM)
-- ════════════════════════════════════════════════════════════════════════════
-- Problema: una compra de plan («pendiente de pago») solo se activaba a mano desde el admin
-- (creditos_activar_lote, que exige es_admin_lab()). El servidor de PayPal usa la service role,
-- que no trae claims de admin, así que no puede llamar esa función.
--
-- Qué hace este archivo:
--   1. Regla `recargo_paypal_pct` (7 %, decisión de Alejandro 19-nov-2026 para pagos internacionales): comisión de PayPal que absorbe el cliente. Wise sigue sin recargo.
--      El front la muestra ANTES de pagar y el servidor la usa para fijar el monto. Editable aquí.
--   2. creditos_activar_lote_pago(p_lote, p_referencia, p_monto): activa el lote tras un pago VERIFICADO
--      por el servidor (functions/api/paypal-capture.js y paypal-webhook.js del repo de Alejandro).
--      · Solo la puede ejecutar service_role (ni anon ni authenticated).
--      · Idempotente: si el lote ya está activo con la MISMA referencia devuelve ok (la captura y el
--        webhook pueden llegar los dos, y PayPal reintenta).
--      · Verifica que lo pagado no sea menor que monto del lote + recargo.
--      · Mismo efecto que creditos_activar_lote (sql/creditos-diseno-2026.sql §5): restantes = unidades,
--        activado_at = now(), referencia_pago y movimiento 'compra'. Si cambias uno, cambia el otro.
--
-- Depende de sql/creditos-diseno-2026.sql (tablas creditos_* y creditos_regla).
-- 100 % IDEMPOTENTE · Copiar TODO → SQL Editor → Run
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Regla: recargo por pagar con PayPal (porcentaje) ─────────────────────
INSERT INTO public.creditos_reglas (negocio, clave, valor, nota) VALUES
  ('alejandrocadcam', 'recargo_paypal_pct', 7, 'Recargo (%) al pagar un plan con PayPal; lo absorbe el cliente. Wise sin recargo')
ON CONFLICT (negocio, clave) DO NOTHING;

-- ── 2. Activación automática tras un pago verificado (solo service_role) ────
CREATE OR REPLACE FUNCTION public.creditos_activar_lote_pago(p_lote uuid, p_referencia text, p_monto numeric)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_l creditos_lotes%ROWTYPE; v_ref text := left(trim(COALESCE(p_referencia, '')), 200);
        v_pct numeric; v_esperado numeric;
BEGIN
  -- El orden importa: con p_lote nulo responde «Falta el lote» sin tocar nada (el servidor lo usa como sonda
  -- para saber si este SQL ya se corrió).
  IF p_lote IS NULL THEN RAISE EXCEPTION 'Falta el lote'; END IF;
  IF v_ref = '' THEN RAISE EXCEPTION 'Falta la referencia del pago'; END IF;
  IF p_monto IS NULL OR p_monto <= 0 THEN RAISE EXCEPTION 'Monto inválido'; END IF;

  SELECT * INTO v_l FROM creditos_lotes WHERE id = p_lote FOR UPDATE;   -- bloquea: captura y webhook no activan dos veces
  IF NOT FOUND THEN RAISE EXCEPTION 'Lote no encontrado'; END IF;

  -- Idempotencia: el mismo pago ya lo activó (captura síncrona, webhook o reintento de PayPal).
  IF v_l.estado IN ('activo', 'agotado') AND v_l.referencia_pago = v_ref THEN
    RETURN jsonb_build_object('ok', true, 'ya_activo', true, 'unidades', v_l.unidades);
  END IF;
  IF v_l.estado <> 'pendiente_pago' THEN
    RAISE EXCEPTION 'LOTE_NO_PENDIENTE: el lote ya está % (referencia %)', v_l.estado, COALESCE(v_l.referencia_pago, '—');
  END IF;
  IF v_l.moneda <> 'USD' OR COALESCE(v_l.monto, 0) <= 0 THEN RAISE EXCEPTION 'El lote no tiene un monto en USD'; END IF;

  v_pct      := COALESCE(creditos_regla(v_l.negocio, 'recargo_paypal_pct'), 0);
  v_esperado := round(v_l.monto * (1 + v_pct / 100), 2);
  IF p_monto < v_esperado - 0.01 THEN
    RAISE EXCEPTION 'MONTO_NO_COINCIDE: pagado % y el plan cuesta %', p_monto, v_esperado;
  END IF;

  -- Mismo efecto que creditos_activar_lote. activado_por queda NULL = activación automática (PayPal).
  UPDATE creditos_lotes SET estado = 'activo', restantes = unidades, activado_at = now(), activado_por = NULL,
                            referencia_pago = v_ref
   WHERE id = p_lote;
  INSERT INTO creditos_movimientos (negocio, cliente_id, lote_id, tipo, creditos, referencia, nota, created_by)
  VALUES (v_l.negocio, v_l.cliente_id, p_lote, 'compra', v_l.unidades, 'lote:' || p_lote,
          'Plan ' || v_l.plan_codigo || ' · PayPal US$' || to_char(p_monto, 'FM999999990.00') || ' · ' || left(v_ref, 120), NULL);
  RETURN jsonb_build_object('ok', true, 'unidades', v_l.unidades, 'esperado', v_esperado);
END $$;

-- ── 3. Permisos: SOLO service_role (el servidor, después de verificar el pago con PayPal) ──
REVOKE ALL ON FUNCTION public.creditos_activar_lote_pago(uuid, text, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.creditos_activar_lote_pago(uuid, text, numeric) TO service_role;

-- ── 4. (OPCIONAL) Prueba con un pago real pequeño — NO se ejecuta: está comentado ──
-- a) Crear un plan oculto de 1 crédito a US$1 (no aparece en la web; se pide por código):
--    INSERT INTO public.creditos_planes (negocio, codigo, nombre, unidades, precio_usd, publico, activo, orden, beneficios)
--    VALUES ('alejandrocadcam', 'prueba', 'Prueba', 1, 1, false, true, 99, '[]')
--    ON CONFLICT (negocio, codigo) DO UPDATE SET activo = true;
-- b) Con una cuenta de cliente, en app/client-panel (consola del navegador):
--    await sb.rpc('creditos_solicitar_plan', { p_negocio: 'alejandrocadcam', p_plan: 'prueba' })
--    → recargar el panel → «Pagar con PayPal · $1,05 USD».
-- c) Al terminar, apagar el plan de prueba:
--    UPDATE public.creditos_planes SET activo = false WHERE negocio = 'alejandrocadcam' AND codigo = 'prueba';
--    (y si quieres dejar el saldo en cero: admin → Créditos → Ajuste −1 con nota «prueba PayPal»).

-- ── 5. Verificación ─────────────────────────────────────────────────────────
-- Debe dar: funcion_existe = 1 · es_security_definer = true · anon_puede = false · authenticated_puede = false
--           · service_role_puede = true · recargo_paypal_pct = 7.00
SELECT
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'creditos_activar_lote_pago')                                      AS funcion_existe,
  (SELECT bool_and(p.prosecdef) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'creditos_activar_lote_pago')                                      AS es_security_definer,
  has_function_privilege('anon',          'public.creditos_activar_lote_pago(uuid, text, numeric)', 'EXECUTE')   AS anon_puede,
  has_function_privilege('authenticated', 'public.creditos_activar_lote_pago(uuid, text, numeric)', 'EXECUTE')   AS authenticated_puede,
  has_function_privilege('service_role',  'public.creditos_activar_lote_pago(uuid, text, numeric)', 'EXECUTE')   AS service_role_puede,
  (SELECT valor FROM public.creditos_reglas WHERE negocio = 'alejandrocadcam' AND clave = 'recargo_paypal_pct')   AS recargo_paypal_pct;
