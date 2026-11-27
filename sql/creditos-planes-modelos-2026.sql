-- ════════════════════════════════════════════════════════════════════════════
-- PLANES DE MODELOS (créditos aparte) — Alejandro CAD/CAM · 27-nov-2026
-- ════════════════════════════════════════════════════════════════════════════
-- Problema: los modelos (USD 4 por arcada) se pagaban con los mismos créditos que las carillas y salían
--   fracciones (0,66 crédito por 2 modelos). Además el cobro con créditos NO cobraba los modelos: solo
--   contaba los dientes del pedido.
-- Regla de negocio (Alejandro, 27-nov-2026): planes SOLO de modelos, con su propio saldo:
--   suelto USD 4 · 50 modelos USD 175 (3,50) · 100 modelos USD 300 (3,00) · 200 modelos USD 500 (2,50).
--   Un modelo = una arcada (sólido; en carillas sin troqueles). Modelo con implantes (análogos o encía) = 2 modelos.
--   Troquel = 0,5 modelo. Si al cliente no le alcanzan los créditos de modelos, el resto se paga con créditos
--   de diseño: 1 crédito de diseño = 3 modelos (regla modelos_por_credito).
-- Cómo queda:
--   · creditos_planes.tipo y creditos_lotes.tipo = 'diseno' | 'modelos' (todo lo anterior queda 'diseno').
--   · El saldo de diseño (creditos_estado.disponibles) ya NO cuenta los créditos de modelos.
--   · creditos_consumir_pedido cobra los dientes con créditos de diseño y los modelos con créditos de modelos.
--   · creditos_mi_estado devuelve también 'modelos_disponibles' y el tipo de cada lote.
-- Las definiciones de este archivo son las canónicas (sql/creditos-diseno-2026.sql quedó igual, ver su nota).
--
-- 100 % IDEMPOTENTE. Copiar TODO → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Tipo de crédito ──────────────────────────────────────────────────────
ALTER TABLE public.creditos_planes ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'diseno';
ALTER TABLE public.creditos_lotes  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'diseno';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'creditos_planes_tipo_chk') THEN
    ALTER TABLE public.creditos_planes ADD CONSTRAINT creditos_planes_tipo_chk CHECK (tipo IN ('diseno','modelos'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'creditos_lotes_tipo_chk') THEN
    ALTER TABLE public.creditos_lotes ADD CONSTRAINT creditos_lotes_tipo_chk CHECK (tipo IN ('diseno','modelos'));
  END IF;
END $$;

-- ── 2. Planes de modelos y reglas ───────────────────────────────────────────
INSERT INTO public.creditos_planes (negocio, codigo, nombre, unidades, precio_usd, publico, activo, orden, beneficios, tipo) VALUES
  ('alejandrocadcam','modelos_50' ,'Modelos 50' , 50, 175, true, true, 11, '["Modelos listos para imprimir","Ahorras USD 25","Modelo con implantes = 2 modelos"]', 'modelos'),
  ('alejandrocadcam','modelos_100','Modelos 100',100, 300, true, true, 12, '["Ahorras USD 100"]', 'modelos'),
  ('alejandrocadcam','modelos_200','Modelos 200',200, 500, true, true, 13, '["Ahorras USD 300"]', 'modelos')
ON CONFLICT (negocio, codigo) DO UPDATE SET nombre = EXCLUDED.nombre, unidades = EXCLUDED.unidades, precio_usd = EXCLUDED.precio_usd,
  publico = EXCLUDED.publico, activo = EXCLUDED.activo, orden = EXCLUDED.orden, beneficios = EXCLUDED.beneficios, tipo = EXCLUDED.tipo;

INSERT INTO public.creditos_reglas (negocio, clave, valor, nota) VALUES
  ('alejandrocadcam','precio_modelo_suelto_usd', 4  , 'Modelo (arcada) sin plan'),
  ('alejandrocadcam','modelo_implantes_factor' , 2  , 'Modelo con implantes (análogos o encía) = 2 modelos'),
  ('alejandrocadcam','modelo_troquel'          , 0.5, 'Cada troquel = 0,5 modelo'),
  ('alejandrocadcam','modelos_por_credito'     , 3  , 'Sin créditos de modelos: 1 crédito de diseño cubre 3 modelos')
ON CONFLICT (negocio, clave) DO NOTHING;

-- ── 3. Funciones de apoyo ───────────────────────────────────────────────────
-- Saldo de DISEÑO (los créditos de modelos van aparte). La actividad (para el congelamiento) cuenta las dos clases.
CREATE OR REPLACE FUNCTION public.creditos_estado(p_cliente uuid, p_negocio text)
RETURNS TABLE (disponibles numeric, congelado boolean, ultima_actividad timestamptz,
               congela_el timestamptz, dias_para_congelar integer, plan_actual text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_disp numeric; v_ult timestamptz; v_dias numeric; v_plan text;
BEGIN
  SELECT COALESCE(sum(restantes), 0) INTO v_disp
    FROM creditos_lotes WHERE cliente_id = p_cliente AND negocio = p_negocio AND estado = 'activo' AND tipo = 'diseno';
  SELECT GREATEST(
           (SELECT max(activado_at) FROM creditos_lotes WHERE cliente_id = p_cliente AND negocio = p_negocio AND estado IN ('activo','agotado')),
           (SELECT max(created_at) FROM creditos_movimientos WHERE cliente_id = p_cliente AND negocio = p_negocio AND tipo = 'consumo'))
    INTO v_ult;
  SELECT plan_codigo INTO v_plan FROM creditos_lotes
   WHERE cliente_id = p_cliente AND negocio = p_negocio AND estado IN ('activo','agotado') AND tipo = 'diseno'
   ORDER BY activado_at DESC NULLS LAST LIMIT 1;
  v_dias := COALESCE(creditos_regla(p_negocio, 'dias_congelamiento'), 90);
  disponibles        := v_disp;
  ultima_actividad   := v_ult;
  congela_el         := CASE WHEN v_ult IS NULL THEN NULL ELSE v_ult + make_interval(days => v_dias::int) END;
  congelado          := v_disp > 0 AND v_ult IS NOT NULL AND now() > v_ult + make_interval(days => v_dias::int);
  dias_para_congelar := CASE WHEN v_ult IS NULL THEN NULL
                             ELSE GREATEST(0, ceil(extract(epoch FROM (v_ult + make_interval(days => v_dias::int) - now())) / 86400))::int END;
  plan_actual        := v_plan;
  RETURN NEXT;
END $$;

-- Saldo de MODELOS.
CREATE OR REPLACE FUNCTION public.creditos_modelos_disponibles(p_cliente uuid, p_negocio text)
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(sum(restantes), 0) FROM creditos_lotes
   WHERE cliente_id = p_cliente AND negocio = p_negocio AND estado = 'activo' AND tipo = 'modelos';
$$;

-- Cuántos modelos lleva una orden del odontograma (misma regla que js/odontograma-flujo.js):
-- una arcada por modelo (superior e inferior, o solo las de trabajo si pidió «solo arcada de trabajo»);
-- arcada con implantes y análogos/encía = modelo_implantes_factor; troqueles por pieza cementada = modelo_troquel.
CREATE OR REPLACE FUNCTION public.creditos_modelos_de_orden(p_orden jsonb, p_negocio text)
RETURNS numeric LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_m jsonb; v_piezas jsonb; v_total numeric := 0; v_arc text; v_tiene boolean; v_impl boolean;
        v_conimpl boolean; v_trabajo boolean; v_nt integer;
BEGIN
  v_m := p_orden -> 'modelo';
  IF v_m IS NULL OR jsonb_typeof(v_m) <> 'object' OR NOT COALESCE((v_m ->> 'impreso')::boolean, false) THEN RETURN 0; END IF;
  v_piezas  := CASE WHEN jsonb_typeof(p_orden -> 'piezas') = 'array' THEN p_orden -> 'piezas' ELSE '[]'::jsonb END;
  v_conimpl := COALESCE((v_m -> 'implantes' ->> 'analogos')::boolean, false) OR COALESCE((v_m -> 'implantes' ->> 'encia')::boolean, false);
  v_trabajo := (v_m ->> 'arcadas') = 'trabajo' AND jsonb_array_length(v_piezas) > 0;
  FOREACH v_arc IN ARRAY ARRAY['sup', 'inf'] LOOP
    SELECT count(*) > 0,
           COALESCE(bool_or((p ->> 'implante' IS NOT NULL AND p ->> 'implante' <> 'Post y core')
                            OR p ->> 'barra_interna' IS NOT NULL
                            OR COALESCE(p ->> 'indicacion', '') ~* '(barra|pilar personalizado)'), false)
      INTO v_tiene, v_impl
      FROM jsonb_array_elements(v_piezas) p
     WHERE (CASE WHEN (p ->> 'fdi')::numeric < 30 THEN 'sup' ELSE 'inf' END) = v_arc;
    IF v_trabajo AND NOT v_tiene THEN CONTINUE; END IF;
    v_total := v_total + CASE WHEN v_conimpl AND v_impl THEN COALESCE(creditos_regla(p_negocio, 'modelo_implantes_factor'), 2) ELSE 1 END;
  END LOOP;
  IF COALESCE((v_m -> 'troqueles' ->> 'zanahoria')::boolean, false) OR COALESCE((v_m -> 'troqueles' ->> 'adicionales')::boolean, false) THEN
    SELECT count(*) INTO v_nt FROM jsonb_array_elements(v_piezas) p
     WHERE (p ->> 'implante' IS NULL OR p ->> 'implante' = 'Post y core') AND p ->> 'barra_interna' IS NULL
       AND COALESCE(p ->> 'indicacion', '') ~ '^(Corona|Cofia|Overlay|Incrustación|Inlay|Carilla)';
    v_total := v_total + v_nt * COALESCE(creditos_regla(p_negocio, 'modelo_troquel'), 0.5);
  END IF;
  RETURN v_total;
END $$;

CREATE OR REPLACE FUNCTION public.creditos_modelos_pedido(p_pedido uuid)
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(creditos_modelos_de_orden(odontograma, COALESCE(negocio, 'alejandrocadcam')), 0) FROM pedidos WHERE id = p_pedido;
$$;

-- Cuántos créditos de DISEÑO cuesta un pedido. NULL = se cotiza por caso. Un pedido de solo modelos = 0.
CREATE OR REPLACE FUNCTION public.creditos_cotizar_pedido(p_pedido uuid)
RETURNS numeric LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ped pedidos%ROWTYPE; v_neg text; v_u numeric; v_tipo text; v_factor numeric := 1; v_plan text; v_cli uuid;
BEGIN
  SELECT * INTO v_ped FROM pedidos WHERE id = p_pedido;
  IF NOT FOUND THEN RETURN NULL; END IF;
  v_neg  := COALESCE(v_ped.negocio, 'alejandrocadcam');
  IF jsonb_typeof(v_ped.odontograma -> 'modelo') = 'object'
     AND (jsonb_typeof(v_ped.odontograma -> 'piezas') IS DISTINCT FROM 'array' OR jsonb_array_length(v_ped.odontograma -> 'piezas') = 0)
     AND jsonb_typeof(v_ped.odontograma -> 'guia') IS DISTINCT FROM 'object' THEN
    RETURN 0;                                                    -- solo modelos: se cobran con créditos de modelos
  END IF;
  v_tipo := lower(COALESCE(v_ped.tipo_trabajo, '') || ' ' || COALESCE(v_ped.pieza, '') || ' ' || COALESCE(v_ped.proceso, ''));
  IF v_tipo ~ '(full|all-on|guia|guía|sonrisa|dsd|planific)' THEN RETURN NULL; END IF;
  v_u := COALESCE(NULLIF(v_ped.unidades, 0), NULLIF(v_ped.cantidad, 0), NULLIF(array_length(v_ped.piezas, 1), 0), 1);
  IF v_tipo ~ '(implant|pilar|abutment)' THEN v_factor := COALESCE(creditos_regla(v_neg, 'factor_implante'), 1.5); END IF;
  IF COALESCE(v_ped.slot_express, false) THEN
    v_cli := COALESCE(v_ped.cliente_id, v_ped.doctor_uid, v_ped.user_id);
    SELECT plan_actual INTO v_plan FROM creditos_estado(v_cli, v_neg);
    IF v_factor = 1 AND v_u <= COALESCE(creditos_regla(v_neg, 'max_unidades_simple'), 3) THEN
      IF COALESCE(v_plan, '') NOT IN ('oro','platino') THEN
        v_factor := v_factor * COALESCE(creditos_regla(v_neg, 'factor_urgente'), 1.5);
      END IF;
    ELSE
      v_factor := v_factor * COALESCE(creditos_regla(v_neg, 'factor_urgente_medio'), 2);
    END IF;
  END IF;
  RETURN round(v_u * v_factor, 2);
END $$;

-- Descuenta créditos de una clase ('diseno' | 'modelos') de los lotes más antiguos (uso interno).
CREATE OR REPLACE FUNCTION public.creditos_descontar_fifo_tipo(p_cliente uuid, p_negocio text, p_clase text, p_creditos numeric,
                                                               p_pedido uuid, p_tipo text, p_referencia text, p_nota text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_rest numeric := p_creditos; v_lote record; v_toma numeric;
BEGIN
  FOR v_lote IN
    SELECT id, restantes FROM creditos_lotes
     WHERE cliente_id = p_cliente AND negocio = p_negocio AND estado = 'activo' AND restantes > 0 AND tipo = p_clase
     ORDER BY activado_at, id
     FOR UPDATE
  LOOP
    v_toma := least(v_lote.restantes, v_rest);
    UPDATE creditos_lotes
       SET restantes = restantes - v_toma,
           estado = CASE WHEN restantes - v_toma <= 0 THEN 'agotado' ELSE estado END
     WHERE id = v_lote.id;
    INSERT INTO creditos_movimientos (negocio, cliente_id, lote_id, pedido_id, tipo, creditos, referencia, nota, created_by)
    VALUES (p_negocio, p_cliente, v_lote.id, p_pedido, p_tipo, -v_toma, p_referencia, p_nota, auth.uid());
    v_rest := v_rest - v_toma;
    EXIT WHEN v_rest <= 0;
  END LOOP;
  IF v_rest > 0 THEN RAISE EXCEPTION 'SALDO_INSUFICIENTE'; END IF;
END $$;

-- La de siempre (revisiones, ajustes, consumo de diseño): solo créditos de diseño.
CREATE OR REPLACE FUNCTION public.creditos_descontar_fifo(p_cliente uuid, p_negocio text, p_creditos numeric,
                                                          p_pedido uuid, p_tipo text, p_referencia text, p_nota text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM creditos_descontar_fifo_tipo(p_cliente, p_negocio, 'diseno', p_creditos, p_pedido, p_tipo, p_referencia, p_nota);
END $$;

-- ── 4. RPC para el cliente ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.creditos_mi_estado(p_negocio text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_e record;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sesión requerida'; END IF;
  SELECT * INTO v_e FROM creditos_estado(v_uid, p_negocio);
  RETURN jsonb_build_object(
    'disponibles', v_e.disponibles, 'modelos_disponibles', creditos_modelos_disponibles(v_uid, p_negocio),
    'congelado', v_e.congelado, 'ultima_actividad', v_e.ultima_actividad,
    'congela_el', v_e.congela_el, 'dias_para_congelar', v_e.dias_para_congelar, 'plan_actual', v_e.plan_actual,
    'lotes', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', id, 'plan', plan_codigo, 'tipo', tipo, 'unidades', unidades,
                        'restantes', restantes, 'estado', estado, 'monto', monto, 'moneda', moneda,
                        'solicitado_at', solicitado_at, 'activado_at', activado_at) ORDER BY solicitado_at DESC)
                       FROM creditos_lotes WHERE cliente_id = v_uid AND negocio = p_negocio), '[]'::jsonb),
    'movimientos', COALESCE((SELECT jsonb_agg(m ORDER BY m.created_at DESC) FROM (
                        SELECT mv.tipo, mv.creditos, mv.pedido_id, mv.nota, mv.created_at, l.tipo AS clase
                          FROM creditos_movimientos mv LEFT JOIN creditos_lotes l ON l.id = mv.lote_id
                         WHERE mv.cliente_id = v_uid AND mv.negocio = p_negocio ORDER BY mv.created_at DESC LIMIT 50) m), '[]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION public.creditos_solicitar_plan(p_negocio text, p_plan text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_p creditos_planes%ROWTYPE; v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sesión requerida'; END IF;
  SELECT * INTO v_p FROM creditos_planes WHERE negocio = p_negocio AND codigo = p_plan AND activo;
  IF NOT FOUND THEN RAISE EXCEPTION 'Plan no disponible'; END IF;
  IF (SELECT count(*) FROM creditos_lotes WHERE cliente_id = v_uid AND estado = 'pendiente_pago') >= 3 THEN
    RAISE EXCEPTION 'Ya tienes compras pendientes de pago';
  END IF;
  INSERT INTO creditos_lotes (negocio, cliente_id, plan_codigo, tipo, unidades, restantes, precio_unidad, moneda, monto, estado)
  VALUES (p_negocio, v_uid, v_p.codigo, v_p.tipo, v_p.unidades, 0, round(v_p.precio_usd / v_p.unidades, 2), 'USD', v_p.precio_usd, 'pendiente_pago')
  RETURNING id INTO v_id;
  RETURN jsonb_build_object('lote_id', v_id, 'plan', v_p.codigo, 'tipo', v_p.tipo, 'unidades', v_p.unidades, 'monto_usd', v_p.precio_usd);
END $$;

-- Cobra un pedido: los dientes con créditos de diseño y los modelos con créditos de modelos
-- (si no alcanzan, el resto con créditos de diseño a razón de modelos_por_credito).
CREATE OR REPLACE FUNCTION public.creditos_consumir_pedido(p_pedido uuid, p_creditos numeric DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ped pedidos%ROWTYPE; v_admin boolean := es_admin_lab(); v_cli uuid; v_neg text; v_cred numeric;
        v_e record; v_tipo text; v_u numeric; v_sla numeric;
        v_mod numeric := 0; v_mdisp numeric := 0; v_mtoma numeric := 0; v_extra numeric := 0; v_total numeric;
BEGIN
  SELECT * INTO v_ped FROM pedidos WHERE id = p_pedido FOR UPDATE;   -- bloquea el pedido: evita cobrar dos veces
  IF NOT FOUND THEN RAISE EXCEPTION 'Pedido no encontrado'; END IF;
  v_cli := COALESCE(v_ped.cliente_id, v_ped.doctor_uid, v_ped.user_id);
  IF NOT v_admin AND NOT COALESCE(auth.uid() IN (v_ped.cliente_id, v_ped.doctor_uid, v_ped.user_id), false) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF v_cli IS NULL THEN RAISE EXCEPTION 'El pedido no tiene cliente asociado'; END IF;
  v_neg := COALESCE(v_ped.negocio, 'alejandrocadcam');
  IF EXISTS (SELECT 1 FROM creditos_movimientos WHERE pedido_id = p_pedido AND tipo = 'consumo') THEN
    RETURN jsonb_build_object('ok', true, 'ya_cobrado', true);
  END IF;
  IF p_creditos IS NOT NULL AND NOT v_admin THEN RAISE EXCEPTION 'Solo el administrador fija créditos manuales'; END IF;
  v_cred := COALESCE(p_creditos, creditos_cotizar_pedido(p_pedido));
  IF v_cred IS NULL THEN RAISE EXCEPTION 'COTIZAR: este caso se cotiza por separado'; END IF;
  v_mod := creditos_modelos_pedido(p_pedido);
  IF v_cred < 0 OR v_cred > 1000 OR (v_cred = 0 AND v_mod = 0) THEN RAISE EXCEPTION 'Créditos fuera de rango'; END IF;

  SELECT * INTO v_e FROM creditos_estado(v_cli, v_neg);
  IF v_e.congelado THEN RAISE EXCEPTION 'CONGELADO: tu saldo está congelado por inactividad; se reactiva con cualquier plan'; END IF;
  IF v_mod > 0 THEN
    v_mdisp := creditos_modelos_disponibles(v_cli, v_neg);
    v_mtoma := least(v_mod, v_mdisp);
    v_extra := round((v_mod - v_mtoma) / COALESCE(NULLIF(creditos_regla(v_neg, 'modelos_por_credito'), 0), 3), 2);
  END IF;
  v_total := v_cred + v_extra;
  IF v_e.disponibles < v_total THEN
    RAISE EXCEPTION 'SALDO_INSUFICIENTE: necesitas % créditos y tienes %', v_total, v_e.disponibles;
  END IF;

  IF v_total > 0 THEN
    PERFORM creditos_descontar_fifo(v_cli, v_neg, v_total, p_pedido, 'consumo', p_pedido::text,
                                    'Caso ' || COALESCE(v_ped.codigo, '') || CASE WHEN v_extra > 0 THEN ' (incluye modelos)' ELSE '' END);
  END IF;
  IF v_mtoma > 0 THEN
    PERFORM creditos_descontar_fifo_tipo(v_cli, v_neg, 'modelos', v_mtoma, p_pedido, 'consumo', p_pedido::text,
                                         'Modelos · caso ' || COALESCE(v_ped.codigo, ''));
  END IF;

  -- Plazo (SLA) según complejidad; el reloj arranca ahora (caso completo y pagado).
  v_tipo := lower(COALESCE(v_ped.tipo_trabajo, '') || ' ' || COALESCE(v_ped.pieza, ''));
  v_u    := COALESCE(NULLIF(v_ped.unidades, 0), NULLIF(v_ped.cantidad, 0), NULLIF(array_length(v_ped.piezas, 1), 0), 1);
  IF p_creditos IS NOT NULL THEN
    v_sla := v_ped.sla_horas_objetivo;                       -- cotizado aparte: plazo acordado
  ELSIF v_tipo ~ '(implant|pilar|abutment)' OR v_u > COALESCE(creditos_regla(v_neg, 'max_unidades_simple'), 3) THEN
    v_sla := creditos_regla(v_neg, 'sla_medio_h');
  ELSIF COALESCE(v_ped.slot_express, false) THEN
    v_sla := creditos_regla(v_neg, 'sla_urgente_h');
  ELSE
    v_sla := creditos_regla(v_neg, 'sla_simple_h');
  END IF;

  -- El trigger prodigy_restrict_client_pedido_updates impide que un cliente confirme un pago. Aquí el pago
  -- es real (créditos descontados arriba), así que se le avisa con una marca que vive solo en esta transacción.
  PERFORM set_config('prodigy.pago_por_creditos', 'true', true);
  UPDATE pedidos
     SET modalidad_cobro = 'creditos',
         pago_estado = 'pago_confirmado',
         timestamp_pago_confirmado = now(),
         fecha_ingreso = COALESCE(fecha_ingreso, now()),
         sla_horas_objetivo = COALESCE(v_sla::int, sla_horas_objetivo),
         sla_alerta_enviada = false
   WHERE id = p_pedido;
  PERFORM set_config('prodigy.pago_por_creditos', 'false', true);

  RETURN jsonb_build_object('ok', true, 'creditos', v_total, 'saldo', v_e.disponibles - v_total,
                            'modelos', v_mtoma, 'modelos_saldo', v_mdisp - v_mtoma, 'modelos_en_creditos', v_extra,
                            'sla_horas', v_sla, 'entrega_limite', CASE WHEN v_sla IS NULL THEN NULL ELSE now() + make_interval(hours => v_sla::int) END);
END $$;

-- ── 5. RPC para el administrador ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.creditos_cargar_plan(p_cliente uuid, p_negocio text, p_plan text, p_referencia text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_p creditos_planes%ROWTYPE; v_id uuid;
BEGIN
  IF NOT es_admin_lab() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  SELECT * INTO v_p FROM creditos_planes WHERE negocio = p_negocio AND codigo = p_plan AND activo;
  IF NOT FOUND THEN RAISE EXCEPTION 'Plan no disponible'; END IF;
  INSERT INTO creditos_lotes (negocio, cliente_id, plan_codigo, tipo, unidades, restantes, precio_unidad, moneda, monto, estado)
  VALUES (p_negocio, p_cliente, v_p.codigo, v_p.tipo, v_p.unidades, 0, round(v_p.precio_usd / v_p.unidades, 2), 'USD', v_p.precio_usd, 'pendiente_pago')
  RETURNING id INTO v_id;
  RETURN creditos_activar_lote(v_id, p_referencia);
END $$;

-- ── 6. Permisos de las funciones nuevas (internas: nadie de afuera las ejecuta) ──
REVOKE ALL ON FUNCTION public.creditos_modelos_disponibles(uuid, text)                                       FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_modelos_de_orden(jsonb, text)                                         FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_modelos_pedido(uuid)                                                  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_descontar_fifo_tipo(uuid, text, text, numeric, uuid, text, text, text) FROM PUBLIC, anon, authenticated;

COMMIT;

-- ── 7. Verificación ─────────────────────────────────────────────────────────
-- Debe dar: planes_modelos = 3 · columnas_tipo = 2 · reglas_modelos = 4 · anon_puede_ejecutar = 0 ·
--   prueba_carillas_2_arcadas = 2 · prueba_solo_trabajo = 1 · prueba_con_troqueles = 5 · prueba_implantes = 3 · prueba_sin_modelo = 0
SELECT
  (SELECT count(*) FROM public.creditos_planes WHERE negocio = 'alejandrocadcam' AND tipo = 'modelos')        AS planes_modelos,
  (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public'
     AND table_name IN ('creditos_planes','creditos_lotes') AND column_name = 'tipo')                         AS columnas_tipo,
  (SELECT count(*) FROM public.creditos_reglas WHERE negocio = 'alejandrocadcam'
     AND clave IN ('precio_modelo_suelto_usd','modelo_implantes_factor','modelo_troquel','modelos_por_credito')) AS reglas_modelos,
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname LIKE 'creditos\_%' AND has_function_privilege('anon', p.oid, 'EXECUTE')) AS anon_puede_ejecutar,
  -- 6 carillas superiores, modelos de las 2 arcadas, sólidos → 2
  public.creditos_modelos_de_orden('{"piezas":[{"fdi":13,"indicacion":"Carilla"},{"fdi":12,"indicacion":"Carilla"},{"fdi":11,"indicacion":"Carilla"},{"fdi":21,"indicacion":"Carilla"},{"fdi":22,"indicacion":"Carilla"},{"fdi":23,"indicacion":"Carilla"}],"modelo":{"impreso":true,"arcadas":"ambas","troqueles":{"zanahoria":false,"adicionales":false},"implantes":{"analogos":false,"encia":false}}}'::jsonb, 'alejandrocadcam') AS prueba_carillas_2_arcadas,
  -- lo mismo, solo arcada de trabajo → 1
  public.creditos_modelos_de_orden('{"piezas":[{"fdi":11,"indicacion":"Carilla"},{"fdi":21,"indicacion":"Carilla"}],"modelo":{"impreso":true,"arcadas":"trabajo","troqueles":{},"implantes":{}}}'::jsonb, 'alejandrocadcam') AS prueba_solo_trabajo,
  -- 6 coronas con troqueles y 2 arcadas → 2 + 6 × 0,5 = 5
  public.creditos_modelos_de_orden('{"piezas":[{"fdi":14,"indicacion":"Corona anatómica"},{"fdi":15,"indicacion":"Corona anatómica"},{"fdi":16,"indicacion":"Corona anatómica"},{"fdi":24,"indicacion":"Corona anatómica"},{"fdi":25,"indicacion":"Corona anatómica"},{"fdi":26,"indicacion":"Corona anatómica"}],"modelo":{"impreso":true,"arcadas":"ambas","troqueles":{"zanahoria":true},"implantes":{}}}'::jsonb, 'alejandrocadcam') AS prueba_con_troqueles,
  -- corona atornillada en el 36 con análogos, 2 arcadas → 2 (inferior con implantes) + 1 (superior) = 3
  public.creditos_modelos_de_orden('{"piezas":[{"fdi":36,"indicacion":"Corona","implante":"Atornillada"}],"modelo":{"impreso":true,"arcadas":"ambas","troqueles":{},"implantes":{"analogos":true}}}'::jsonb, 'alejandrocadcam') AS prueba_implantes,
  public.creditos_modelos_de_orden('{"piezas":[{"fdi":11,"indicacion":"Carilla"}]}'::jsonb, 'alejandrocadcam') AS prueba_sin_modelo;
