-- ================================================================
-- PRODIGY + Alejandro CAD/CAM — Pedidos: los cambios de estado y de pago fallaban, y el cliente podía
-- modificar campos internos de su propio pedido.
-- Auditoría del ciclo del pedido, 23-nov-2026 (pruebas dentro de transacciones que se revierten).
--
-- 1) prodigy_notif_pedido (trigger AFTER UPDATE): comparaba pedidos.estado (enum estado_pedido: Pendiente,
--    Pagado, En Producción…) con estados de OPERACIÓN ('CAMBIOS_SOLICITADOS', 'EN_PRODUCCION'…). Postgres
--    convierte el texto al enum, no existe y lanza «invalid input value for enum estado_pedido». Resultado:
--    TODO update que cambie estado o pago_estado fallaba entero: el cliente no podía subir el comprobante
--    (pago_subido), el equipo no podía confirmar pagos y el webhook de Wompi tampoco. Además los avisos de
--    cada etapa nunca se generaban. Ahora mira estado_operativo (texto) y el aviso de pago va aparte.
--
-- 2) prodigy_restrict_client_pedido_updates: era una lista NEGRA (12 campos). Un cliente, actualizando su
--    pedido directo desde el navegador, podía cambiar revisiones_usadas (revisiones gratis), servicios_pagados
--    (marcar fresado/impresión como pagados), diseno_aprobado, cantidad, precio_base, fecha_pago,
--    timestamp_pago_confirmado, factura_*, es_prueba (el limpiador de pruebas lo borraría), negocio,
--    departamento_actual, operador_id, link_diseno… Ahora, para updates DIRECTOS de un cliente
--    (current_user = authenticated/anon) solo se permite la lista blanca de lo que hacen los portales:
--    comprobantes, pago_estado → pago_subido, calificación, fotos de feedback, notas de cambios,
--    revisiones/cambios +1, aprobar el diseño (false → true) y solicitar fabricación. Las RPC SECURITY DEFINER
--    (revisión de diseño, créditos…) corren como su dueño y no pasan por la lista blanca: siguen igual.
--    También se suman los roles de equipo que faltaban (alineadores, secretaria, guias, exocad, blender,
--    operario, staff) y la llave service_role del servidor: los webhooks de Wompi y PayPal no podían confirmar
--    ningún pago porque el trigger los trataba como cliente.
--
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

CREATE OR REPLACE FUNCTION public.prodigy_notif_pedido()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $f$
DECLARE
  _dept       text;
  _uid        uuid := NEW.user_id;
  _url_staff  text := '/app/operario.html';
  _url_client text := '/app/client-panel.html';
  _e          text;
  _eo         text;
BEGIN
  -- ── NUEVO CASO ─────────────────────────────────────────────
  IF TG_OP = 'INSERT' THEN
    _dept := COALESCE(NEW.departamento_actual, 'diseno');
    INSERT INTO public.notificaciones_internas
      (tipo,prioridad,destinatario_dept,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
    VALUES ('nuevo_caso','media',_dept,
      'Nuevo caso: ' || COALESCE(NEW.codigo, NEW.id::text),
      'Tipo: ' || COALESCE(NEW.tipo_trabajo, '—') || ' · Doctor: ' || COALESCE(NEW.nombre_doctor, '—'),
      NEW.id,NEW.codigo,'{}',_url_staff);
    IF _uid IS NOT NULL THEN
      INSERT INTO public.notificaciones_internas
        (tipo,prioridad,destinatario_user_id,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
      VALUES ('nuevo_caso','baja',_uid,
        'Caso recibido: #' || COALESCE(NEW.codigo,'nuevo'),
        'Hemos recibido tu caso. Nuestro equipo comenzará en breve.',
        NEW.id,NEW.codigo,'{}',_url_client);
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP <> 'UPDATE' THEN RETURN NEW; END IF;

  -- ── CAMBIO DE ETAPA (estado_operativo es texto: nunca comparar con el enum `estado`) ──
  _e  := upper(trim(COALESCE(NEW.estado_operativo, '')));
  _eo := upper(trim(COALESCE(OLD.estado_operativo, '')));
  IF _e <> _eo AND _e <> '' THEN
    IF _e = 'CAMBIOS_SOLICITADOS' THEN
      INSERT INTO public.notificaciones_internas
        (tipo,prioridad,destinatario_dept,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
      VALUES ('estado_cambio','alta','diseno',
        'Cambios solicitados: ' || COALESCE(NEW.codigo,'caso'),
        'El doctor revisó y solicitó ajustes. ' || COALESCE(NEW.notas_cambios,''),
        NEW.id,NEW.codigo,'{}',_url_staff);

    ELSIF _e IN ('DISENO_APROBADO','APROBADO','APROBADO_CLIENTE') THEN
      _dept := COALESCE(NEW.departamento_actual,'fresado');
      INSERT INTO public.notificaciones_internas
        (tipo,prioridad,destinatario_dept,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
      VALUES ('estado_cambio','media',_dept,
        'Diseño aprobado — caso #' || COALESCE(NEW.codigo,'—'),
        'El doctor aprobó el diseño. Listo para procesar en ' || _dept,
        NEW.id,NEW.codigo,'{}',_url_staff);
      IF _uid IS NOT NULL THEN
        INSERT INTO public.notificaciones_internas
          (tipo,prioridad,destinatario_user_id,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
        VALUES ('estado_cambio','media',_uid,
          '✅ Diseño aprobado — caso #' || COALESCE(NEW.codigo,'—'),
          'Tu diseño fue aprobado. Estamos preparando la siguiente etapa.',
          NEW.id,NEW.codigo,'{}',_url_client);
      END IF;

    ELSIF _e = 'EN_PRODUCCION' AND _uid IS NOT NULL THEN
      INSERT INTO public.notificaciones_internas
        (tipo,prioridad,destinatario_user_id,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
      VALUES ('estado_cambio','media',_uid,
        '⚙️ Caso en producción — #' || COALESCE(NEW.codigo,'—'),
        'Tu caso está en producción. Te avisamos cuando esté listo.',
        NEW.id,NEW.codigo,'{}',_url_client);

    ELSIF _e = 'QA_APROBADO' AND _uid IS NOT NULL THEN
      INSERT INTO public.notificaciones_internas
        (tipo,prioridad,destinatario_user_id,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
      VALUES ('estado_cambio','media',_uid,
        '🛡️ Control de calidad ✅ — #' || COALESCE(NEW.codigo,'—'),
        'Tu caso pasó control de calidad. Programando entrega.',
        NEW.id,NEW.codigo,'{}',_url_client);

    ELSIF _e IN ('LISTO','LISTO_DESPACHAR','EN_REPARTO') THEN
      INSERT INTO public.notificaciones_internas
        (tipo,prioridad,destinatario_rol,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
      VALUES ('estado_cambio','alta','admin',
        'Caso listo para entrega: ' || COALESCE(NEW.codigo,'—'),
        'Doctor: ' || COALESCE(NEW.nombre_doctor,'—'),
        NEW.id,NEW.codigo,'{}',_url_staff);
      IF _uid IS NOT NULL THEN
        INSERT INTO public.notificaciones_internas
          (tipo,prioridad,destinatario_user_id,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
        VALUES ('estado_cambio','alta',_uid,
          CASE WHEN _e = 'EN_REPARTO' THEN '🏍️ Tu caso está en camino — #' ELSE '📦 Tu caso está listo — #' END || COALESCE(NEW.codigo,'—'),
          CASE WHEN _e = 'EN_REPARTO' THEN 'Nuestro mensajero ya va en camino. Llegará hoy.' ELSE 'Tu caso está empacado y listo para entrega.' END,
          NEW.id,NEW.codigo,'{}',_url_client);
      END IF;

    ELSIF _e = 'ENTREGADO' AND _uid IS NOT NULL THEN
      INSERT INTO public.notificaciones_internas
        (tipo,prioridad,destinatario_user_id,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
      VALUES ('estado_cambio','alta',_uid,
        '🎉 Caso entregado — #' || COALESCE(NEW.codigo,'—'),
        '¡Tu caso fue entregado! Gracias por confiar en nosotros.',
        NEW.id,NEW.codigo,'{}',_url_client);
    END IF;
  END IF;

  -- ── PAGO CONFIRMADO (independiente del cambio de etapa) ──
  IF NEW.pago_estado = 'pago_confirmado' AND OLD.pago_estado IS DISTINCT FROM 'pago_confirmado' THEN
    INSERT INTO public.notificaciones_internas
      (tipo,prioridad,destinatario_rol,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
    VALUES ('pago','media','admin',
      'Pago confirmado: ' || COALESCE(NEW.codigo,'—'),
      'Doctor: ' || COALESCE(NEW.nombre_doctor,'—') || ' · $' || COALESCE(NEW.precio_total::text,'—'),
      NEW.id,NEW.codigo,'{}',_url_staff);
    IF _uid IS NOT NULL THEN
      INSERT INTO public.notificaciones_internas
        (tipo,prioridad,destinatario_user_id,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
      VALUES ('pago','media',_uid,
        '✅ Pago confirmado — #' || COALESCE(NEW.codigo,'—'),
        'Recibimos tu pago. Tu caso entrará en producción muy pronto.',
        NEW.id,NEW.codigo,'{}',_url_client);
    END IF;
  END IF;

  RETURN NEW;
END;
$f$;

CREATE OR REPLACE FUNCTION public.prodigy_restrict_client_pedido_updates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $f$
DECLARE
    _email    text;
    _role     text;
    _is_staff boolean;
    _cambios  text[];
    -- Lo único que un cliente cambia DIRECTO desde los portales (app/client-panel de las dos webs)
    _permitidos constant text[] := ARRAY[
      'updated_at','comprobante_url','comprobante_pago_url','comprobante_abono_url','comprobante_saldo_url',
      'pago_estado','calificacion','calificacion_comentario','fotos_feedback','notas_cambios',
      'revisiones_usadas','cambios_count','diseno_aprobado','diseno_aprobado_at',
      'fabricacion_solicitada','fabricacion_tipo','cotizacion_fab_estado'];
BEGIN
    _email := (current_setting('request.jwt.claims', true)::jsonb ->> 'email');
    _role  := (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role');

    _is_staff := (
        _email IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        OR _role IN ('admin', 'operator', 'operario', 'staff', 'diseno', 'fresado', 'impresion', 'taller', 'calidad',
                     'contabilidad', 'mensajero', 'encargado_inventario', 'alineadores', 'secretaria', 'guias',
                     'exocad', 'blender')
        -- El servidor (webhooks de Wompi y PayPal, cron) usa la llave service_role: antes se le trataba como cliente y
        -- NINGÚN pago en línea podía quedar confirmado («Clientes no pueden modificar el estado / confirmar pago»).
        OR current_user = 'service_role'
        OR (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
    );

    IF _is_staff THEN
        RETURN NEW;
    END IF;

    -- ── Lista blanca: update DIRECTO del cliente (no una RPC SECURITY DEFINER, que corre como su dueño) ──
    IF current_user IN ('authenticated', 'anon') THEN
        SELECT array_agg(k ORDER BY k) INTO _cambios
          FROM jsonb_object_keys(to_jsonb(NEW)) k
         WHERE (to_jsonb(NEW) -> k) IS DISTINCT FROM (to_jsonb(OLD) -> k)
           AND NOT (k = ANY (_permitidos));
        IF _cambios IS NOT NULL THEN
            RAISE EXCEPTION 'PRODIGY_SECURITY: el cliente no puede modificar %', array_to_string(_cambios, ', ');
        END IF;
        IF NEW.pago_estado IS DISTINCT FROM OLD.pago_estado AND NEW.pago_estado IS DISTINCT FROM 'pago_subido' THEN
            RAISE EXCEPTION 'PRODIGY_SECURITY: el cliente solo puede marcar el pago como enviado';
        END IF;
        IF NEW.revisiones_usadas IS DISTINCT FROM OLD.revisiones_usadas
           AND COALESCE(NEW.revisiones_usadas, 0) <> COALESCE(OLD.revisiones_usadas, 0) + 1 THEN
            RAISE EXCEPTION 'PRODIGY_SECURITY: las revisiones solo suben de una en una';
        END IF;
        IF NEW.cambios_count IS DISTINCT FROM OLD.cambios_count
           AND COALESCE(NEW.cambios_count, 0) <> COALESCE(OLD.cambios_count, 0) + 1 THEN
            RAISE EXCEPTION 'PRODIGY_SECURITY: los cambios solo suben de uno en uno';
        END IF;
        IF NEW.diseno_aprobado IS DISTINCT FROM OLD.diseno_aprobado AND NEW.diseno_aprobado IS NOT TRUE THEN
            RAISE EXCEPTION 'PRODIGY_SECURITY: el cliente no puede deshacer la aprobación del diseño';
        END IF;
        IF NEW.fabricacion_solicitada IS DISTINCT FROM OLD.fabricacion_solicitada AND NEW.fabricacion_solicitada IS NOT TRUE THEN
            RAISE EXCEPTION 'PRODIGY_SECURITY: el cliente no puede retirar la solicitud de fabricación';
        END IF;
    END IF;

    -- ── Lista negra (aplica también dentro de las RPC, como antes) ──
    IF NEW.estado IS DISTINCT FROM OLD.estado THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden modificar el estado del pedido (%.estado: % → %)',
            OLD.id, OLD.estado, NEW.estado;
    END IF;
    IF NEW.estado_operativo IS DISTINCT FROM OLD.estado_operativo THEN
        IF current_setting('prodigy.allow_estado_change', true) IS DISTINCT FROM 'true' THEN
            RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden modificar estado_operativo';
        END IF;
    END IF;
    IF NEW.precio_total IS DISTINCT FROM OLD.precio_total THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden modificar precio_total';
    END IF;
    IF NEW.saldo_pendiente_monto IS DISTINCT FROM OLD.saldo_pendiente_monto THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden modificar saldo_pendiente_monto';
    END IF;
    IF NEW.pago_estado = 'pago_confirmado' AND OLD.pago_estado IS DISTINCT FROM 'pago_confirmado'
       AND current_setting('prodigy.pago_por_creditos', true) IS DISTINCT FROM 'true' THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden confirmar pago directamente';
    END IF;
    IF NEW.stl_ruta IS DISTINCT FROM OLD.stl_ruta THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden modificar stl_ruta';
    END IF;
    IF NEW.stl_liberado IS DISTINCT FROM OLD.stl_liberado THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden cambiar stl_liberado';
    END IF;
    IF NEW.doctor_uid IS DISTINCT FROM OLD.doctor_uid THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden reasignar doctor_uid';
    END IF;
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden reasignar user_id';
    END IF;
    IF NEW.fabricacion_pagada IS DISTINCT FROM OLD.fabricacion_pagada THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden marcar la fabricación como pagada';
    END IF;
    IF NEW.cotizacion_fab_monto IS DISTINCT FROM OLD.cotizacion_fab_monto THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden cambiar la cotización de fabricación';
    END IF;
    IF NEW.cotizacion_fab_estado IS DISTINCT FROM OLD.cotizacion_fab_estado
       AND NEW.cotizacion_fab_estado IN ('pago_confirmado','cotizacion_enviada') THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden confirmar el pago de fabricación';
    END IF;

    RETURN NEW;
END;
$f$;

-- Verificación (debe dar: notif_usa_estado_operativo = true · lista_blanca = true)
SELECT position('estado_operativo' in (SELECT prosrc FROM pg_proc WHERE proname = 'prodigy_notif_pedido')) > 0              AS notif_usa_estado_operativo,
       position('_permitidos' in (SELECT prosrc FROM pg_proc WHERE proname = 'prodigy_restrict_client_pedido_updates')) > 0 AS lista_blanca;
