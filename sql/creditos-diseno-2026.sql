-- ════════════════════════════════════════════════════════════════════════════
-- CRÉDITOS DE DISEÑO PREPAGADOS (planes Bronce / Plata / Oro / Platino)
-- ════════════════════════════════════════════════════════════════════════════
-- Para qué: laboratorios y odontólogos compran créditos por adelantado (1 crédito = 1 unidad cementada:
-- corona, unidad de puente, carilla o incrustación) y cada caso enviado descuenta sus créditos.
--
-- Reglas de negocio (Alejandro, 18-nov-2026; también en terminos-y-legal de alejandrocadcam.com):
--   · Pago siempre anticipado. Nada gratis: sin casos de prueba sin cargo.
--   · Corona o pilar sobre implante = 1,5 créditos. Urgencia en caso simple = ×1,5 (sin recargo en Plata/Oro/Platino).
--     Full Arch, guías y diseño de sonrisa se cotizan por caso: el administrador fija los créditos.
--   · Los créditos NO vencen. Si pasan 90 días sin enviar casos, el saldo se CONGELA; se reactiva con la compra
--     de cualquier plan (la compra nueva cuenta como actividad). Se gastan primero los lotes más antiguos (FIFO).
--   · 2 revisiones incluidas por caso; cada revisión adicional cuesta 0,5 crédito.
--   · Plazo (SLA) al cobrar: simple 24 h · simple urgente 6 h · medio (implante o más de 3 unidades) 48 h.
--
-- Diseño:
--   · creditos_planes       catálogo de planes por negocio (precio en USD; COP opcional cuando se decida).
--   · creditos_reglas       factores y plazos editables (una sola fuente de verdad, sin números en el front).
--   · creditos_lotes        cada compra = un lote con unidades, restantes y estado (pendiente_pago/activo/agotado/anulado).
--   · creditos_movimientos  libro contable inmutable: compra, consumo, devolución, revisión extra, ajuste.
--   · El dinero y el saldo se deciden SOLO aquí (RPC SECURITY DEFINER). El navegador no escribe en estas tablas.
--   · El congelamiento se calcula al vuelo (no necesita cron): última actividad = última compra activada o último consumo.
--   · La tabla vieja `creditos_cliente` (saldo en COP por WhatsApp, 0 filas, sin uso en el front) NO se toca aquí;
--     queda como deuda para borrar en una limpieza aparte.
--
-- 100 % IDEMPOTENTE · Copiar TODO → SQL Editor → Run
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Tablas ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.creditos_planes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio     text NOT NULL CHECK (negocio IN ('prodigy','alejandrocadcam')),
  codigo      text NOT NULL,
  nombre      text NOT NULL,
  unidades    numeric(10,2) NOT NULL CHECK (unidades > 0),
  precio_usd  numeric(10,2) NOT NULL CHECK (precio_usd > 0),
  precio_cop  integer,
  publico     boolean NOT NULL DEFAULT true,   -- false = solo se ofrece por WhatsApp (p. ej. Platino)
  activo      boolean NOT NULL DEFAULT true,
  orden       integer NOT NULL DEFAULT 0,
  beneficios  jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (negocio, codigo)
);

CREATE TABLE IF NOT EXISTS public.creditos_reglas (
  negocio  text NOT NULL CHECK (negocio IN ('prodigy','alejandrocadcam')),
  clave    text NOT NULL,
  valor    numeric(10,2) NOT NULL,
  nota     text,
  PRIMARY KEY (negocio, clave)
);

CREATE TABLE IF NOT EXISTS public.creditos_lotes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio         text NOT NULL CHECK (negocio IN ('prodigy','alejandrocadcam')),
  cliente_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan_codigo     text NOT NULL,
  unidades        numeric(10,2) NOT NULL CHECK (unidades > 0),
  restantes       numeric(10,2) NOT NULL DEFAULT 0 CHECK (restantes >= 0),
  precio_unidad   numeric(10,2),
  moneda          text NOT NULL DEFAULT 'USD' CHECK (moneda IN ('USD','COP')),
  monto           numeric(12,2),
  estado          text NOT NULL DEFAULT 'pendiente_pago' CHECK (estado IN ('pendiente_pago','activo','agotado','anulado')),
  referencia_pago text,
  solicitado_at   timestamptz NOT NULL DEFAULT now(),
  activado_at     timestamptz,
  activado_por    uuid,
  CHECK (restantes <= unidades)
);
CREATE INDEX IF NOT EXISTS creditos_lotes_cliente_idx ON public.creditos_lotes (cliente_id, negocio, estado, activado_at);

CREATE TABLE IF NOT EXISTS public.creditos_movimientos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio     text NOT NULL CHECK (negocio IN ('prodigy','alejandrocadcam')),
  cliente_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  lote_id     uuid REFERENCES public.creditos_lotes(id),
  pedido_id   uuid REFERENCES public.pedidos(id) ON DELETE SET NULL,
  tipo        text NOT NULL CHECK (tipo IN ('compra','consumo','devolucion','revision_extra','ajuste')),
  creditos    numeric(10,2) NOT NULL CHECK (creditos <> 0),   -- + entra al saldo · − sale del saldo
  referencia  text,
  nota        text,
  created_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS creditos_mov_cliente_idx ON public.creditos_movimientos (cliente_id, negocio, created_at DESC);
CREATE INDEX IF NOT EXISTS creditos_mov_pedido_idx  ON public.creditos_movimientos (pedido_id, tipo);

-- ── 2. Datos base (Alejandro CAD/CAM) ───────────────────────────────────────
INSERT INTO public.creditos_planes (negocio, codigo, nombre, unidades, precio_usd, publico, orden, beneficios) VALUES
  ('alejandrocadcam','bronce' ,'Bronce' , 50, 500 , true , 1, '["Entrega máximo 24 h en casos simples"]'),
  ('alejandrocadcam','plata'  ,'Plata'  ,100, 950 , true , 2, '["Prioridad","Urgencias simples sin recargo"]'),
  ('alejandrocadcam','oro'    ,'Oro'    ,250, 2250, true , 3, '["Prioridad","Urgencias simples sin recargo","Mismo día en casos simples antes de las 12"]'),
  ('alejandrocadcam','platino','Platino',500, 4000, false, 4, '["Todo lo de Oro","Solo por volumen confirmado"]')
ON CONFLICT (negocio, codigo) DO NOTHING;

INSERT INTO public.creditos_reglas (negocio, clave, valor, nota) VALUES
  ('alejandrocadcam','precio_unidad_suelta_usd', 12  , 'Unidad sin plan'),
  ('alejandrocadcam','factor_implante'        , 1.5 , 'Corona o pilar sobre implante'),
  ('alejandrocadcam','factor_urgente'         , 1.5 , 'Urgencia en caso simple (sin recargo en plata/oro/platino)'),
  ('alejandrocadcam','factor_urgente_medio'   , 2   , 'Urgencia en caso medio, solo con cupo'),
  ('alejandrocadcam','revision_extra'         , 0.5 , 'Desde la tercera revisión'),
  ('alejandrocadcam','revisiones_incluidas'   , 2   , NULL),
  ('alejandrocadcam','dias_congelamiento'     , 90  , 'Días sin enviar casos'),
  ('alejandrocadcam','max_unidades_simple'    , 3   , 'Hasta 3 unidades = caso simple'),
  ('alejandrocadcam','sla_simple_h'           , 24  , NULL),
  ('alejandrocadcam','sla_urgente_h'          , 6   , NULL),
  ('alejandrocadcam','sla_medio_h'            , 48  , NULL)
ON CONFLICT (negocio, clave) DO NOTHING;

-- ── 3. Funciones de apoyo ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.creditos_regla(p_negocio text, p_clave text)
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT valor FROM creditos_reglas WHERE negocio = p_negocio AND clave = p_clave;
$$;

-- Estado del saldo de un cliente: disponibles, si está congelado y la cuenta regresiva al congelamiento.
CREATE OR REPLACE FUNCTION public.creditos_estado(p_cliente uuid, p_negocio text)
RETURNS TABLE (disponibles numeric, congelado boolean, ultima_actividad timestamptz,
               congela_el timestamptz, dias_para_congelar integer, plan_actual text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_disp numeric; v_ult timestamptz; v_dias numeric; v_plan text;
BEGIN
  SELECT COALESCE(sum(restantes), 0) INTO v_disp
    FROM creditos_lotes WHERE cliente_id = p_cliente AND negocio = p_negocio AND estado = 'activo';
  SELECT GREATEST(
           (SELECT max(activado_at) FROM creditos_lotes WHERE cliente_id = p_cliente AND negocio = p_negocio AND estado IN ('activo','agotado')),
           (SELECT max(created_at) FROM creditos_movimientos WHERE cliente_id = p_cliente AND negocio = p_negocio AND tipo = 'consumo'))
    INTO v_ult;
  SELECT plan_codigo INTO v_plan FROM creditos_lotes
   WHERE cliente_id = p_cliente AND negocio = p_negocio AND estado IN ('activo','agotado')
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

-- Cuántos créditos cuesta un pedido. NULL = se cotiza por caso (lo fija el administrador).
CREATE OR REPLACE FUNCTION public.creditos_cotizar_pedido(p_pedido uuid)
RETURNS numeric LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ped pedidos%ROWTYPE; v_neg text; v_u numeric; v_tipo text; v_factor numeric := 1; v_plan text; v_cli uuid;
BEGIN
  SELECT * INTO v_ped FROM pedidos WHERE id = p_pedido;
  IF NOT FOUND THEN RETURN NULL; END IF;
  v_neg  := COALESCE(v_ped.negocio, 'alejandrocadcam');
  v_tipo := lower(COALESCE(v_ped.tipo_trabajo, '') || ' ' || COALESCE(v_ped.pieza, '') || ' ' || COALESCE(v_ped.proceso, ''));
  IF v_tipo ~ '(full|all-on|guia|guía|sonrisa|dsd|planific)' THEN RETURN NULL; END IF;
  v_u := COALESCE(NULLIF(v_ped.unidades, 0), NULLIF(v_ped.cantidad, 0), NULLIF(array_length(v_ped.piezas, 1), 0), 1);
  IF v_tipo ~ '(implant|pilar|abutment)' THEN v_factor := COALESCE(creditos_regla(v_neg, 'factor_implante'), 1.5); END IF;
  IF COALESCE(v_ped.slot_express, false) THEN
    v_cli := COALESCE(v_ped.cliente_id, v_ped.doctor_uid, v_ped.user_id);
    SELECT plan_actual INTO v_plan FROM creditos_estado(v_cli, v_neg);
    IF v_factor = 1 AND v_u <= COALESCE(creditos_regla(v_neg, 'max_unidades_simple'), 3) THEN
      IF COALESCE(v_plan, '') NOT IN ('plata','oro','platino') THEN
        v_factor := v_factor * COALESCE(creditos_regla(v_neg, 'factor_urgente'), 1.5);
      END IF;
    ELSE
      v_factor := v_factor * COALESCE(creditos_regla(v_neg, 'factor_urgente_medio'), 2);
    END IF;
  END IF;
  RETURN round(v_u * v_factor, 2);
END $$;

-- Descuenta créditos de los lotes más antiguos (uso interno; ya validado por quien lo llama).
CREATE OR REPLACE FUNCTION public.creditos_descontar_fifo(p_cliente uuid, p_negocio text, p_creditos numeric,
                                                          p_pedido uuid, p_tipo text, p_referencia text, p_nota text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_rest numeric := p_creditos; v_lote record; v_toma numeric;
BEGIN
  FOR v_lote IN
    SELECT id, restantes FROM creditos_lotes
     WHERE cliente_id = p_cliente AND negocio = p_negocio AND estado = 'activo' AND restantes > 0
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

-- ── 4. RPC para el cliente ──────────────────────────────────────────────────
-- Estado de mi saldo + lotes + últimos movimientos (para el panel: unidades restantes y cuenta regresiva).
CREATE OR REPLACE FUNCTION public.creditos_mi_estado(p_negocio text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_e record;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sesión requerida'; END IF;
  SELECT * INTO v_e FROM creditos_estado(v_uid, p_negocio);
  RETURN jsonb_build_object(
    'disponibles', v_e.disponibles, 'congelado', v_e.congelado, 'ultima_actividad', v_e.ultima_actividad,
    'congela_el', v_e.congela_el, 'dias_para_congelar', v_e.dias_para_congelar, 'plan_actual', v_e.plan_actual,
    'lotes', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', id, 'plan', plan_codigo, 'unidades', unidades,
                        'restantes', restantes, 'estado', estado, 'monto', monto, 'moneda', moneda,
                        'solicitado_at', solicitado_at, 'activado_at', activado_at) ORDER BY solicitado_at DESC)
                       FROM creditos_lotes WHERE cliente_id = v_uid AND negocio = p_negocio), '[]'::jsonb),
    'movimientos', COALESCE((SELECT jsonb_agg(m ORDER BY m.created_at DESC) FROM (
                        SELECT tipo, creditos, pedido_id, nota, created_at FROM creditos_movimientos
                         WHERE cliente_id = v_uid AND negocio = p_negocio ORDER BY created_at DESC LIMIT 50) m), '[]'::jsonb));
END $$;

-- El cliente pide un plan: queda «pendiente de pago» con el precio del catálogo (nunca el que mande el navegador).
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
  INSERT INTO creditos_lotes (negocio, cliente_id, plan_codigo, unidades, restantes, precio_unidad, moneda, monto, estado)
  VALUES (p_negocio, v_uid, v_p.codigo, v_p.unidades, 0, round(v_p.precio_usd / v_p.unidades, 2), 'USD', v_p.precio_usd, 'pendiente_pago')
  RETURNING id INTO v_id;
  RETURN jsonb_build_object('lote_id', v_id, 'plan', v_p.codigo, 'unidades', v_p.unidades, 'monto_usd', v_p.precio_usd);
END $$;

-- Ojo: «x NOT IN (a, NULL)» da NULL y un IF lo trata como falso; por eso se usa COALESCE(… IN …, false).
-- Cobra un pedido con créditos (al enviarlo). Lo puede llamar el dueño del pedido o el administrador.
-- p_creditos solo lo usa el administrador para casos que se cotizan aparte (Full Arch, guías…).
CREATE OR REPLACE FUNCTION public.creditos_consumir_pedido(p_pedido uuid, p_creditos numeric DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ped pedidos%ROWTYPE; v_admin boolean := es_admin_lab(); v_cli uuid; v_neg text; v_cred numeric;
        v_e record; v_tipo text; v_u numeric; v_sla numeric;
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
  IF v_cred <= 0 OR v_cred > 1000 THEN RAISE EXCEPTION 'Créditos fuera de rango'; END IF;

  SELECT * INTO v_e FROM creditos_estado(v_cli, v_neg);
  IF v_e.congelado THEN RAISE EXCEPTION 'CONGELADO: tu saldo está congelado por inactividad; se reactiva con cualquier plan'; END IF;
  IF v_e.disponibles < v_cred THEN RAISE EXCEPTION 'SALDO_INSUFICIENTE: necesitas % créditos y tienes %', v_cred, v_e.disponibles; END IF;

  PERFORM creditos_descontar_fifo(v_cli, v_neg, v_cred, p_pedido, 'consumo', p_pedido::text, 'Caso ' || COALESCE(v_ped.codigo, ''));

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

  RETURN jsonb_build_object('ok', true, 'creditos', v_cred, 'saldo', v_e.disponibles - v_cred,
                            'sla_horas', v_sla, 'entrega_limite', CASE WHEN v_sla IS NULL THEN NULL ELSE now() + make_interval(hours => v_sla::int) END);
END $$;

-- Revisión pedida por el cliente: las 2 primeras van incluidas; desde la tercera cuesta 0,5 crédito.
CREATE OR REPLACE FUNCTION public.creditos_cobrar_revision(p_pedido uuid, p_revision_num integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ped pedidos%ROWTYPE; v_cli uuid; v_neg text; v_incl numeric; v_costo numeric; v_e record; v_ref text;
BEGIN
  SELECT * INTO v_ped FROM pedidos WHERE id = p_pedido FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pedido no encontrado'; END IF;
  IF NOT es_admin_lab() AND NOT COALESCE(auth.uid() IN (v_ped.cliente_id, v_ped.doctor_uid, v_ped.user_id), false) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  v_cli  := COALESCE(v_ped.cliente_id, v_ped.doctor_uid, v_ped.user_id);
  v_neg  := COALESCE(v_ped.negocio, 'alejandrocadcam');
  v_incl := COALESCE(creditos_regla(v_neg, 'revisiones_incluidas'), 2);
  IF p_revision_num IS NULL OR p_revision_num < 1 THEN RAISE EXCEPTION 'Número de revisión inválido'; END IF;
  IF p_revision_num <= v_incl THEN RETURN jsonb_build_object('ok', true, 'cobrada', false); END IF;
  -- Solo aplica a pedidos pagados con créditos (los demás se cobran por fuera, según la política).
  IF NOT EXISTS (SELECT 1 FROM creditos_movimientos WHERE pedido_id = p_pedido AND tipo = 'consumo') THEN
    RETURN jsonb_build_object('ok', true, 'cobrada', false, 'fuera_de_creditos', true);
  END IF;
  v_ref := p_pedido::text || ':rev:' || p_revision_num;
  IF EXISTS (SELECT 1 FROM creditos_movimientos WHERE referencia = v_ref) THEN
    RETURN jsonb_build_object('ok', true, 'cobrada', true, 'ya_cobrada', true);
  END IF;
  v_costo := COALESCE(creditos_regla(v_neg, 'revision_extra'), 0.5);
  SELECT * INTO v_e FROM creditos_estado(v_cli, v_neg);
  IF v_e.disponibles < v_costo THEN RAISE EXCEPTION 'SALDO_INSUFICIENTE: la revisión adicional cuesta % crédito', v_costo; END IF;
  PERFORM creditos_descontar_fifo(v_cli, v_neg, v_costo, p_pedido, 'revision_extra', v_ref, 'Revisión adicional #' || p_revision_num);
  RETURN jsonb_build_object('ok', true, 'cobrada', true, 'creditos', v_costo);
END $$;

-- ── 5. RPC para el administrador ────────────────────────────────────────────
-- Activa una compra cuando llega el pago (Wise / PayPal / transferencia).
-- Gemela automática (pago PayPal verificado, solo service_role): creditos_activar_lote_pago en
-- sql/creditos-pago-paypal-2026.sql. Si cambias el efecto de activar aquí, cámbialo allá también.
CREATE OR REPLACE FUNCTION public.creditos_activar_lote(p_lote uuid, p_referencia text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_l creditos_lotes%ROWTYPE;
BEGIN
  IF NOT es_admin_lab() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF COALESCE(trim(p_referencia), '') = '' THEN RAISE EXCEPTION 'Falta la referencia del pago'; END IF;
  SELECT * INTO v_l FROM creditos_lotes WHERE id = p_lote FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Lote no encontrado'; END IF;
  IF v_l.estado <> 'pendiente_pago' THEN RAISE EXCEPTION 'El lote ya está %', v_l.estado; END IF;
  UPDATE creditos_lotes SET estado = 'activo', restantes = unidades, activado_at = now(), activado_por = auth.uid(),
                            referencia_pago = left(p_referencia, 200)
   WHERE id = p_lote;
  INSERT INTO creditos_movimientos (negocio, cliente_id, lote_id, tipo, creditos, referencia, nota, created_by)
  VALUES (v_l.negocio, v_l.cliente_id, p_lote, 'compra', v_l.unidades, 'lote:' || p_lote, 'Plan ' || v_l.plan_codigo || ' · ' || left(p_referencia, 120), auth.uid());
  RETURN jsonb_build_object('ok', true, 'unidades', v_l.unidades);
END $$;

-- Carga y activa un plan directamente a un cliente (pago recibido por fuera de la plataforma).
CREATE OR REPLACE FUNCTION public.creditos_cargar_plan(p_cliente uuid, p_negocio text, p_plan text, p_referencia text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_p creditos_planes%ROWTYPE; v_id uuid;
BEGIN
  IF NOT es_admin_lab() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  SELECT * INTO v_p FROM creditos_planes WHERE negocio = p_negocio AND codigo = p_plan AND activo;
  IF NOT FOUND THEN RAISE EXCEPTION 'Plan no disponible'; END IF;
  INSERT INTO creditos_lotes (negocio, cliente_id, plan_codigo, unidades, restantes, precio_unidad, moneda, monto, estado)
  VALUES (p_negocio, p_cliente, v_p.codigo, v_p.unidades, 0, round(v_p.precio_usd / v_p.unidades, 2), 'USD', v_p.precio_usd, 'pendiente_pago')
  RETURNING id INTO v_id;
  RETURN creditos_activar_lote(v_id, p_referencia);
END $$;

-- Devuelve los créditos de un pedido cancelado antes de iniciar el diseño (vuelven a sus mismos lotes).
CREATE OR REPLACE FUNCTION public.creditos_devolver_pedido(p_pedido uuid, p_nota text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_m record; v_total numeric := 0;
BEGIN
  IF NOT es_admin_lab() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF EXISTS (SELECT 1 FROM creditos_movimientos WHERE pedido_id = p_pedido AND tipo = 'devolucion') THEN
    RAISE EXCEPTION 'Este pedido ya fue devuelto';
  END IF;
  FOR v_m IN SELECT * FROM creditos_movimientos WHERE pedido_id = p_pedido AND tipo = 'consumo' LOOP
    UPDATE creditos_lotes SET restantes = restantes + (-v_m.creditos), estado = 'activo' WHERE id = v_m.lote_id;
    INSERT INTO creditos_movimientos (negocio, cliente_id, lote_id, pedido_id, tipo, creditos, referencia, nota, created_by)
    VALUES (v_m.negocio, v_m.cliente_id, v_m.lote_id, p_pedido, 'devolucion', -v_m.creditos, p_pedido::text, left(COALESCE(p_nota, ''), 200), auth.uid());
    v_total := v_total + (-v_m.creditos);
  END LOOP;
  IF v_total = 0 THEN RAISE EXCEPTION 'El pedido no tiene créditos cobrados'; END IF;
  UPDATE pedidos SET pago_estado = 'devuelto_creditos' WHERE id = p_pedido;
  RETURN jsonb_build_object('ok', true, 'devueltos', v_total);
END $$;

-- Ajuste manual (corrección o cortesía autorizada por el administrador): + suma un lote, − descuenta FIFO.
CREATE OR REPLACE FUNCTION public.creditos_ajustar(p_cliente uuid, p_negocio text, p_creditos numeric, p_nota text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF NOT es_admin_lab() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF p_creditos IS NULL OR p_creditos = 0 OR abs(p_creditos) > 1000 THEN RAISE EXCEPTION 'Créditos fuera de rango'; END IF;
  IF COALESCE(trim(p_nota), '') = '' THEN RAISE EXCEPTION 'El ajuste necesita una nota'; END IF;
  IF p_creditos > 0 THEN
    INSERT INTO creditos_lotes (negocio, cliente_id, plan_codigo, unidades, restantes, moneda, estado, activado_at, activado_por, referencia_pago)
    VALUES (p_negocio, p_cliente, 'ajuste', p_creditos, p_creditos, 'USD', 'activo', now(), auth.uid(), left(p_nota, 200))
    RETURNING id INTO v_id;
    INSERT INTO creditos_movimientos (negocio, cliente_id, lote_id, tipo, creditos, nota, created_by)
    VALUES (p_negocio, p_cliente, v_id, 'ajuste', p_creditos, left(p_nota, 200), auth.uid());
  ELSE
    PERFORM creditos_descontar_fifo(p_cliente, p_negocio, -p_creditos, NULL, 'ajuste', NULL, left(p_nota, 200));
  END IF;
  RETURN jsonb_build_object('ok', true);
END $$;

-- Resumen para el panel del administrador: saldo, congelamiento y compras pendientes por cliente.
CREATE OR REPLACE FUNCTION public.creditos_resumen(p_negocio text)
RETURNS TABLE (cliente_id uuid, email text, disponibles numeric, congelado boolean, dias_para_congelar integer,
               plan_actual text, pendientes_pago integer, ultima_actividad timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT es_admin_lab() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  RETURN QUERY
    SELECT c.cliente_id, u.email::text, e.disponibles, e.congelado, e.dias_para_congelar, e.plan_actual,
           (SELECT count(*)::int FROM creditos_lotes l WHERE l.cliente_id = c.cliente_id AND l.negocio = p_negocio AND l.estado = 'pendiente_pago'),
           e.ultima_actividad
      FROM (SELECT DISTINCT l.cliente_id FROM creditos_lotes l WHERE l.negocio = p_negocio) c
      JOIN auth.users u ON u.id = c.cliente_id
      CROSS JOIN LATERAL creditos_estado(c.cliente_id, p_negocio) e
     ORDER BY e.ultima_actividad DESC NULLS LAST;
END $$;

-- ── 6. Seguridad: RLS, GRANT y permisos de ejecución ────────────────────────
ALTER TABLE public.creditos_planes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creditos_reglas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creditos_lotes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creditos_movimientos ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.creditos_planes, public.creditos_reglas, public.creditos_lotes, public.creditos_movimientos FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.creditos_planes, public.creditos_reglas TO anon, authenticated;   -- precios y reglas son públicos
GRANT SELECT ON public.creditos_lotes, public.creditos_movimientos TO authenticated;     -- filtrado por RLS
GRANT ALL ON public.creditos_planes, public.creditos_reglas, public.creditos_lotes, public.creditos_movimientos TO service_role;

DROP POLICY IF EXISTS creditos_planes_lectura ON public.creditos_planes;
CREATE POLICY creditos_planes_lectura ON public.creditos_planes FOR SELECT USING (activo AND (publico OR es_admin_lab()));
DROP POLICY IF EXISTS creditos_reglas_lectura ON public.creditos_reglas;
CREATE POLICY creditos_reglas_lectura ON public.creditos_reglas FOR SELECT USING (true);
DROP POLICY IF EXISTS creditos_lotes_propios ON public.creditos_lotes;
CREATE POLICY creditos_lotes_propios ON public.creditos_lotes FOR SELECT TO authenticated USING (cliente_id = auth.uid() OR es_admin_lab());
DROP POLICY IF EXISTS creditos_mov_propios ON public.creditos_movimientos;
CREATE POLICY creditos_mov_propios ON public.creditos_movimientos FOR SELECT TO authenticated USING (cliente_id = auth.uid() OR es_admin_lab());
-- Sin políticas de INSERT/UPDATE/DELETE: nadie escribe directo; todo pasa por las funciones de arriba.

REVOKE ALL ON FUNCTION public.creditos_regla(text, text)                                           FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_estado(uuid, text)                                          FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_cotizar_pedido(uuid)                                        FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_descontar_fifo(uuid, text, numeric, uuid, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_mi_estado(text)                                             FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_solicitar_plan(text, text)                                  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_consumir_pedido(uuid, numeric)                              FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_cobrar_revision(uuid, integer)                              FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_activar_lote(uuid, text)                                    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_cargar_plan(uuid, text, text, text)                         FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_devolver_pedido(uuid, text)                                 FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_ajustar(uuid, text, numeric, text)                          FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.creditos_resumen(text)                                               FROM PUBLIC, anon, authenticated;
-- Solo las que el front llama (las internas quedan sin permiso: creditos_regla, creditos_estado, cotizar, descontar_fifo).
GRANT EXECUTE ON FUNCTION public.creditos_mi_estado(text)                     TO authenticated;
GRANT EXECUTE ON FUNCTION public.creditos_solicitar_plan(text, text)          TO authenticated;
GRANT EXECUTE ON FUNCTION public.creditos_consumir_pedido(uuid, numeric)      TO authenticated;
GRANT EXECUTE ON FUNCTION public.creditos_cobrar_revision(uuid, integer)      TO authenticated;
GRANT EXECUTE ON FUNCTION public.creditos_activar_lote(uuid, text)            TO authenticated;   -- revisa es_admin_lab() adentro
GRANT EXECUTE ON FUNCTION public.creditos_cargar_plan(uuid, text, text, text) TO authenticated;   -- ídem
GRANT EXECUTE ON FUNCTION public.creditos_devolver_pedido(uuid, text)         TO authenticated;   -- ídem
GRANT EXECUTE ON FUNCTION public.creditos_ajustar(uuid, text, numeric, text)  TO authenticated;   -- ídem
GRANT EXECUTE ON FUNCTION public.creditos_resumen(text)                       TO authenticated;   -- ídem

-- ── 7. Ajustes del 19-nov-2026 (volver a correr TODO el archivo: es idempotente) ──────────────────
-- 7a. El trigger de protección de pedidos bloqueaba el cobro con créditos cuando lo hacía el propio cliente
--     («Clientes no pueden confirmar pago directamente»). Cambio puntual sobre la definición viva (mismo método
--     que sql/fabricacion-pago-verificado-2026.sql): deja pasar el pago solo si lo marca creditos_consumir_pedido.
--     De paso, «OLD != 'pago_confirmado'» con OLD nulo daba NULL y no protegía: ahora es IS DISTINCT FROM.
DO $$
DECLARE def text; nuevo text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO def FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'prodigy_restrict_client_pedido_updates';
  IF def IS NULL OR def ~ 'pago_por_creditos' THEN RETURN; END IF;
  nuevo := regexp_replace(def,
    'IF NEW\.pago_estado = ''pago_confirmado'' AND OLD\.pago_estado != ''pago_confirmado'' THEN',
    'IF NEW.pago_estado = ''pago_confirmado'' AND OLD.pago_estado IS DISTINCT FROM ''pago_confirmado''
       AND current_setting(''prodigy.pago_por_creditos'', true) IS DISTINCT FROM ''true'' THEN');
  IF nuevo <> def THEN EXECUTE nuevo; RAISE NOTICE 'actualizada: prodigy_restrict_client_pedido_updates'; END IF;
END $$;

-- 7b. Revisiones adicionales cobradas EN LA BASE: cuando un pedido pagado con créditos pasa la revisión incluida
--     (revisiones_usadas sube más allá de 2), se descuenta 0,5 crédito por cada una. No depende del navegador.
--     Idempotente por referencia «<pedido>:rev:<n>» (la misma que usa creditos_cobrar_revision).
CREATE OR REPLACE FUNCTION public.creditos_trg_revision()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_neg text; v_incl int; v_costo numeric; v_cli uuid; v_e record; v_n int; v_ref text;
BEGIN
  IF COALESCE(NEW.revisiones_usadas, 0) <= COALESCE(OLD.revisiones_usadas, 0) THEN RETURN NEW; END IF;
  IF NOT EXISTS (SELECT 1 FROM creditos_movimientos WHERE pedido_id = NEW.id AND tipo = 'consumo') THEN RETURN NEW; END IF;
  v_neg   := COALESCE(NEW.negocio, 'alejandrocadcam');
  v_incl  := COALESCE(creditos_regla(v_neg, 'revisiones_incluidas'), 2)::int;
  v_costo := COALESCE(creditos_regla(v_neg, 'revision_extra'), 0.5);
  v_cli   := COALESCE(NEW.cliente_id, NEW.doctor_uid, NEW.user_id);
  FOR v_n IN GREATEST(COALESCE(OLD.revisiones_usadas, 0) + 1, v_incl + 1) .. NEW.revisiones_usadas LOOP
    v_ref := NEW.id::text || ':rev:' || v_n;
    CONTINUE WHEN EXISTS (SELECT 1 FROM creditos_movimientos WHERE referencia = v_ref);
    SELECT * INTO v_e FROM creditos_estado(v_cli, v_neg);
    IF v_e.disponibles < v_costo THEN
      RAISE EXCEPTION 'SALDO_INSUFICIENTE: la revisión adicional cuesta % crédito', v_costo;
    END IF;
    PERFORM creditos_descontar_fifo(v_cli, v_neg, v_costo, NEW.id, 'revision_extra', v_ref, 'Revisión adicional #' || v_n);
  END LOOP;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.creditos_trg_revision() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_creditos_revision ON public.pedidos;
CREATE TRIGGER trg_creditos_revision BEFORE UPDATE OF revisiones_usadas ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.creditos_trg_revision();

-- ── 8. Verificación ─────────────────────────────────────────────────────────
-- Debe dar: planes_alejandro = 4 · reglas_alejandro = 11 · funciones = 14 · tablas_con_rls = 4 · anon_puede_ejecutar = 0
--           · cliente_puede_pagar_con_creditos = true · cobro_marca_el_pago = true · revisiones_en_la_base = 1
--           (si ya corriste sql/creditos-pago-paypal-2026.sql: reglas_alejandro = 12 · funciones = 15)
SELECT
  (SELECT count(*) FROM public.creditos_planes WHERE negocio = 'alejandrocadcam')                       AS planes_alejandro,
  (SELECT count(*) FROM public.creditos_reglas WHERE negocio = 'alejandrocadcam')                       AS reglas_alejandro,
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname LIKE 'creditos\_%')                                         AS funciones,
  (SELECT count(*) FROM pg_class WHERE relname IN ('creditos_planes','creditos_reglas','creditos_lotes','creditos_movimientos')
    AND relrowsecurity)                                                                                  AS tablas_con_rls,
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname LIKE 'creditos\_%' AND has_function_privilege('anon', p.oid, 'EXECUTE')) AS anon_puede_ejecutar,
  (SELECT prosrc ~ 'pago_por_creditos' FROM pg_proc WHERE proname = 'prodigy_restrict_client_pedido_updates')     AS cliente_puede_pagar_con_creditos,
  (SELECT prosrc ~ 'pago_por_creditos' FROM pg_proc WHERE proname = 'creditos_consumir_pedido')                   AS cobro_marca_el_pago,
  (SELECT count(*) FROM pg_trigger WHERE tgname = 'trg_creditos_revision' AND NOT tgisinternal)                    AS revisiones_en_la_base;
