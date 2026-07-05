-- ============================================================
-- PRODIGY — HOTFIX CRÍTICO: prodigy_notif_pedido() usa columnas inexistentes
-- Ejecutar en: Supabase Dashboard → SQL Editor — MÁXIMA URGENCIA
--
-- Hallazgo (detectado 2026-07-05 al probar un INSERT de prueba en pedidos):
-- el trigger prodigy_notif_pedido() (se ejecuta en CADA INSERT/UPDATE de
-- la tabla pedidos) referencia 3 columnas que NO EXISTEN en la tabla real:
--   - NEW.departamento   → no existe (la real es departamento_actual)
--   - NEW.servicio       → no existe (la real es tipo_trabajo)
--   - NEW.urgente/OLD.urgente → no existe en absoluto (nunca se persistió;
--     "urgente" solo es una variable local de las calculadoras para el
--     cálculo de precio, jamás se insertó como columna en pedidos)
--
-- Efecto: CUALQUIER INSERT o UPDATE a la tabla pedidos falla ahora mismo
-- con "column does not exist" — esto bloquea la creación de pedidos
-- nuevos y cualquier cambio de estado (pagos, aprobaciones, entregas)
-- en TODO el sistema, no solo en revision-diseno.html.
--
-- Fix: corregir departamento→departamento_actual, servicio→tipo_trabajo,
-- y eliminar la lógica de "urgente" (columna inexistente, sin ningún
-- INSERT real que la use — la prioridad por defecto queda en 'media').
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_notif_pedido()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _titulo_staff  text;
  _msg_staff     text;
  _prio          text := 'media';
  _tipo          text;
  _dept          text;
  _url_staff     text := '/app/operario.html';
  _url_client    text;
  _uid           uuid;
BEGIN
  _uid  := NEW.user_id;
  _url_client := '/app/client-panel.html';

  -- ── NUEVO CASO ─────────────────────────────────────────────
  IF TG_OP = 'INSERT' THEN
    _tipo         := 'nuevo_caso';
    _dept         := COALESCE(NEW.departamento_actual, 'diseno');
    _titulo_staff := 'Nuevo caso: ' || COALESCE(NEW.codigo, NEW.id::text);
    _msg_staff    := 'Tipo: ' || COALESCE(NEW.tipo_trabajo, '—') || ' · Doctor: ' || COALESCE(NEW.nombre_doctor, '—');
    _prio         := 'media';

    INSERT INTO public.notificaciones_internas
      (tipo,prioridad,destinatario_dept,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
    VALUES (_tipo,_prio,_dept,_titulo_staff,_msg_staff,NEW.id,NEW.codigo,'{}',_url_staff);

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

  -- ── CAMBIO DE ESTADO ───────────────────────────────────────
  IF TG_OP != 'UPDATE' THEN RETURN NEW; END IF;

  -- Solo procesar si cambió el estado
  IF NEW.estado IS NOT DISTINCT FROM OLD.estado AND NEW.pago_estado IS NOT DISTINCT FROM OLD.pago_estado THEN
    RETURN NEW;
  END IF;

  -- Cambios solicitados por doctor
  IF NEW.estado = 'CAMBIOS_SOLICITADOS' THEN
    INSERT INTO public.notificaciones_internas
      (tipo,prioridad,destinatario_dept,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
    VALUES ('estado_cambio','alta','diseno',
      'Cambios solicitados: ' || COALESCE(NEW.codigo,'caso'),
      'El doctor revisó y solicitó ajustes. ' || COALESCE(NEW.notas_cambios,''),
      NEW.id,NEW.codigo,'{}',_url_staff);

  -- Diseño aprobado → siguiente etapa
  ELSIF NEW.estado IN ('APROBADO','APROBADO_CLIENTE') THEN
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

  -- En producción
  ELSIF NEW.estado = 'EN_PRODUCCION' THEN
    IF _uid IS NOT NULL THEN
      INSERT INTO public.notificaciones_internas
        (tipo,prioridad,destinatario_user_id,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
      VALUES ('estado_cambio','media',_uid,
        '⚙️ Caso en producción — #' || COALESCE(NEW.codigo,'—'),
        'Tu caso está en producción. Te avisamos cuando esté listo.',
        NEW.id,NEW.codigo,'{}',_url_client);
    END IF;

  -- Control de calidad
  ELSIF NEW.estado = 'QA_APROBADO' THEN
    IF _uid IS NOT NULL THEN
      INSERT INTO public.notificaciones_internas
        (tipo,prioridad,destinatario_user_id,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
      VALUES ('estado_cambio','media',_uid,
        '🛡️ Control de calidad ✅ — #' || COALESCE(NEW.codigo,'—'),
        'Tu caso pasó control de calidad. Programando entrega.',
        NEW.id,NEW.codigo,'{}',_url_client);
    END IF;

  -- Listo / en reparto
  ELSIF NEW.estado IN ('LISTO','LISTO_DESPACHAR','EN_REPARTO') THEN
    _prio := 'alta';
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
        CASE NEW.estado
          WHEN 'EN_REPARTO' THEN '🏍️ Tu caso está en camino — #' || COALESCE(NEW.codigo,'—')
          ELSE '📦 Tu caso está listo — #' || COALESCE(NEW.codigo,'—')
        END,
        CASE NEW.estado
          WHEN 'EN_REPARTO' THEN 'Nuestro mensajero ya va en camino. Llegará hoy.'
          ELSE 'Tu caso está empacado y listo para entrega.'
        END,
        NEW.id,NEW.codigo,'{}',_url_client);
    END IF;

  -- Entregado
  ELSIF NEW.estado = 'ENTREGADO' THEN
    IF _uid IS NOT NULL THEN
      INSERT INTO public.notificaciones_internas
        (tipo,prioridad,destinatario_user_id,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
      VALUES ('estado_cambio','alta',_uid,
        '🎉 Caso entregado — #' || COALESCE(NEW.codigo,'—'),
        '¡Tu caso fue entregado exitosamente! Gracias por confiar en PRODIGY.',
        NEW.id,NEW.codigo,'{}',_url_client);
    END IF;

  -- Pago confirmado
  ELSIF NEW.pago_estado = 'pago_confirmado' AND OLD.pago_estado IS DISTINCT FROM 'pago_confirmado' THEN
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

  ELSE
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- INSERT INTO pedidos (codigo, negocio, tipo_trabajo, precio_base, monto_total, precio_total)
--   VALUES ('TEST-TRIGGER-'||floor(random()*100000), 'prodigy', 'Diseño', 0, 0, 0);
-- debe insertar sin error (antes fallaba con "record new has no field departamento").
-- ============================================================

SELECT 'patch-notif-pedido-hotfix-columnas-2026 aplicado' AS status;
