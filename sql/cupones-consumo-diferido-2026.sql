-- ================================================================
-- PRODIGY — Cupones de crédito (referidos): VALIDAR sin gastar · GASTAR solo con el pedido guardado
--
-- Problema (19-nov-2026): en impresión 3D y fresado el botón «Validar» llamaba a
--   prodigy_usar_cupon_credito(), que MARCA el cupón como usado en ese instante, antes de que
--   exista el pedido. Si el doctor abandonaba el formulario (o fallaba el guardado) perdía su
--   crédito de $30.000 sin haberlo aplicado a nada.
--
-- Regla de negocio:
--   · «Validar» solo CONSULTA (no gasta): prodigy_validar_cupon_credito(cupon) → {ok, monto}.
--   · El cupón se GASTA después de que el INSERT del pedido salió bien:
--     prodigy_consumir_cupon_pedido(cupon, codigo_pedido). Exige que el pedido exista y que
--     lleve el cupón en `notas` («Cupón: CRED-…», lo escribe el flujo al guardarlo).
--   · Idempotente: repetir el consumo para el MISMO pedido responde ok y no duplica nada.
--   · Si otro lo gastó entre «validar» y «guardar» (carrera), el pedido ya quedó con el
--     descuento → queda una incidencia ALTA sin resolver para que el staff cobre la diferencia.
--   · prodigy_usar_cupon_credito() NO se toca: el front de impresión/fresado/diseño (PRODIGY) y el
--     diseño de Alejandro caen a ella si este SQL aún no se ha corrido (19-nov: diseño ya portado).
--   · Los flujos funcionan sin sesión (anónimo) → EXECUTE para anon y authenticated.
--     validar solo devuelve ok + monto (nada del referidor).
--
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- 1) Validar SIN gastar
CREATE OR REPLACE FUNCTION public.prodigy_validar_cupon_credito(p_cupon text)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_monto numeric;
BEGIN
  IF p_cupon IS NULL OR p_cupon !~ '^CRED-[A-Z0-9]{8}$' THEN
    RETURN json_build_object('ok', false, 'error', 'Formato inválido. Debe ser CRED-XXXXXXXX');
  END IF;

  SELECT r.recompensa_cop INTO v_monto
    FROM public.referidos r
   WHERE r.cupon_credito = p_cupon
     AND r.cupon_usado = false
     AND r.estado = 'primer_pedido'
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'Cupón inválido o ya usado');
  END IF;

  RETURN json_build_object('ok', true, 'monto', COALESCE(v_monto, 0));
END;$$;

-- 2) Gastar el cupón contra un pedido YA guardado (atómico + idempotente)
CREATE OR REPLACE FUNCTION public.prodigy_consumir_cupon_pedido(p_cupon text, p_pedido_codigo text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ped_id uuid;
  v_notas  text;
  v_ref    record;
BEGIN
  IF p_cupon IS NULL OR p_cupon !~ '^CRED-[A-Z0-9]{8}$' OR COALESCE(trim(p_pedido_codigo), '') = '' THEN
    RETURN json_build_object('ok', false, 'error', 'Datos inválidos');
  END IF;

  -- a) El pedido debe existir y registrar el cupón en sus notas
  SELECT p.id, p.notas INTO v_ped_id, v_notas
    FROM public.pedidos p
   WHERE p.codigo = p_pedido_codigo
   LIMIT 1;
  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'Pedido no encontrado');
  END IF;
  IF position(p_cupon IN COALESCE(v_notas, '')) = 0 THEN
    RETURN json_build_object('ok', false, 'error', 'El pedido no registra este cupón');
  END IF;

  -- b) Idempotencia: ya se gastó en ESTE pedido → ok sin repetir
  IF EXISTS (SELECT 1 FROM public.logs_incidencias l
              WHERE l.tipo = 'CUPON_CREDITO_USADO' AND l.pedido_id = v_ped_id
                AND position(p_cupon IN COALESCE(l.descripcion, '')) > 0) THEN
    RETURN json_build_object('ok', true, 'ya_consumido', true);
  END IF;

  -- c) Gasto atómico (compare-and-swap, mismo patrón que patch-cupon-doble-gasto-2026-07.sql)
  UPDATE public.referidos r
     SET cupon_usado = true,
         estado      = 'recompensado'
   WHERE r.cupon_credito = p_cupon
     AND r.cupon_usado = false
     AND r.estado = 'primer_pedido'
  RETURNING r.id, r.recompensa_cop, r.referidor_email INTO v_ref;

  IF NOT FOUND THEN
    -- Carrera: otro pedido lo gastó entre «validar» y «guardar». Este pedido ya quedó con el descuento.
    IF NOT EXISTS (SELECT 1 FROM public.logs_incidencias l
                    WHERE l.tipo = 'CUPON_NO_CONSUMIDO' AND l.pedido_id = v_ped_id) THEN
      INSERT INTO public.logs_incidencias(pedido_id, tipo, severidad, descripcion, resuelta)
      VALUES (v_ped_id, 'CUPON_NO_CONSUMIDO', 'ALTA',
              '[REFERIDOS] El pedido ' || p_pedido_codigo || ' se guardó con el descuento del cupón ' || p_cupon ||
              ', pero el cupón ya estaba usado o no es válido. Cobrar la diferencia al cliente.',
              false);
    END IF;
    RETURN json_build_object('ok', false, 'error', 'Cupón ya usado o inválido');
  END IF;

  INSERT INTO public.logs_incidencias(pedido_id, tipo, severidad, descripcion, resuelta)
  VALUES (v_ped_id, 'CUPON_CREDITO_USADO', 'INFO',
          '[REFERIDOS] Cupón ' || p_cupon || ' usado en pedido ' || p_pedido_codigo ||
          ' por Dr. ' || COALESCE(v_ref.referidor_email, '—') || ' — crédito: $' || COALESCE(v_ref.recompensa_cop, 0),
          true);

  RETURN json_build_object('ok', true, 'monto', COALESCE(v_ref.recompensa_cop, 0));
END;$$;

-- 3) Permisos: solo EXECUTE explícito (los flujos públicos llaman sin sesión)
REVOKE ALL ON FUNCTION public.prodigy_validar_cupon_credito(text)       FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prodigy_consumir_cupon_pedido(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_validar_cupon_credito(text)       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_consumir_cupon_pedido(text, text) TO anon, authenticated;

-- Que la API (PostgREST) vea las funciones nuevas sin esperar
NOTIFY pgrst, 'reload schema';

-- 4) VERIFICACIÓN — esperado: 2 filas, security_definer = true, anon_puede = true, auth_puede = true,
--    y la prueba con un cupón inexistente devuelve {"ok" : false, ...} (no gasta nada).
SELECT p.proname                                          AS funcion,
       p.prosecdef                                        AS security_definer,
       has_function_privilege('anon', p.oid, 'EXECUTE')          AS anon_puede,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_puede,
       public.prodigy_validar_cupon_credito('CRED-00000000')::text AS prueba_validar
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public'
   AND p.proname IN ('prodigy_validar_cupon_credito', 'prodigy_consumir_cupon_pedido')
 ORDER BY 1;
