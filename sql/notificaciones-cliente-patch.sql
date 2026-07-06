-- ============================================================
-- PRODIGY — Patch: notificaciones para clientes + WA automático
-- Ejecutar en Supabase Dashboard → SQL Editor
--
-- ⚠️ SUPERSEDED (sección 4, prodigy_notif_pedido()): usa columnas
-- fantasma (NEW.departamento, NEW.servicio, NEW.urgente) que ya NO
-- existen. NO reejecutar esa sección — usar
-- sql/patch-notif-pedido-hotfix-columnas-2026.sql (ya aplicado en
-- producción). Las secciones 1-3 (columnas nuevas, RLS de cliente)
-- siguen vigentes.
-- ============================================================

-- 1. Agregar columna destinatario_user_id (cliente específico)
ALTER TABLE public.notificaciones_internas
  ADD COLUMN IF NOT EXISTS destinatario_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_notif_user_id
  ON public.notificaciones_internas (destinatario_user_id, created_at DESC);

-- 2. Columna para WA enviado (audit trail)
ALTER TABLE public.notificaciones_internas
  ADD COLUMN IF NOT EXISTS wa_enviado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS wa_at timestamptz;

-- 3. RLS: el cliente ve solo sus propias notificaciones
DROP POLICY IF EXISTS "cliente_ve_sus_notifs" ON public.notificaciones_internas;
CREATE POLICY "cliente_ve_sus_notifs" ON public.notificaciones_internas
  FOR SELECT TO authenticated
  USING (
    -- admin/superadmin ven todo
    (auth.jwt()->'app_metadata'->>'role' IN ('admin','superadmin'))
    OR
    -- por user_id propio (cliente)
    (destinatario_user_id = auth.uid())
    OR
    -- por rol de staff
    (destinatario_rol = auth.jwt()->'app_metadata'->>'role')
    OR
    -- broadcast (sin destinatario específico, para staff)
    (destinatario_user_id IS NULL AND destinatario_rol IS NULL AND destinatario_dept IS NULL
     AND auth.jwt()->'app_metadata'->>'role' IS NOT NULL)
  );

-- 4. Actualizar trigger para incluir notificaciones al cliente
CREATE OR REPLACE FUNCTION public.prodigy_notif_pedido()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _titulo_staff  text;
  _titulo_client text;
  _msg_staff     text;
  _msg_client    text;
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
    _dept         := COALESCE(NEW.departamento, 'diseno');
    _titulo_staff := 'Nuevo caso: ' || COALESCE(NEW.codigo, NEW.id::text);
    _msg_staff    := 'Tipo: ' || COALESCE(NEW.servicio, '—') || ' · Doctor: ' || COALESCE(NEW.nombre_doctor, '—');
    _prio         := CASE WHEN NEW.urgente = true THEN 'alta' ELSE 'media' END;

    -- Notificación staff
    INSERT INTO public.notificaciones_internas
      (tipo,prioridad,destinatario_dept,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
    VALUES (_tipo,_prio,_dept,_titulo_staff,_msg_staff,NEW.id,NEW.codigo,'{}',_url_staff);

    -- Notificación cliente: confirmación de recepción
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

  -- Urgente
  IF NEW.urgente = true AND (OLD.urgente IS NULL OR OLD.urgente = false) THEN
    INSERT INTO public.notificaciones_internas
      (tipo,prioridad,destinatario_dept,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
    VALUES ('urgente','alta',COALESCE(NEW.departamento,'diseno'),
      '🔴 URGENTE: ' || COALESCE(NEW.codigo,'caso'),
      'Caso marcado urgente — atención inmediata',
      NEW.id,NEW.codigo,'{}',_url_staff);
    RETURN NEW;
  END IF;

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

    -- Notificar al cliente
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
    -- staff
    INSERT INTO public.notificaciones_internas
      (tipo,prioridad,destinatario_rol,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
    VALUES ('estado_cambio','alta','admin',
      'Caso listo para entrega: ' || COALESCE(NEW.codigo,'—'),
      'Doctor: ' || COALESCE(NEW.nombre_doctor,'—'),
      NEW.id,NEW.codigo,'{}',_url_staff);
    -- cliente
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
    -- staff
    INSERT INTO public.notificaciones_internas
      (tipo,prioridad,destinatario_rol,titulo,mensaje,pedido_id,pedido_codigo,leida_por,accion_url)
    VALUES ('pago','media','admin',
      'Pago confirmado: ' || COALESCE(NEW.codigo,'—'),
      'Doctor: ' || COALESCE(NEW.nombre_doctor,'—') || ' · $' || COALESCE(NEW.precio_total::text,'—'),
      NEW.id,NEW.codigo,'{}',_url_staff);
    -- cliente
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

-- Verificación
SELECT 'Trigger notif cliente + WA activo' AS status;
