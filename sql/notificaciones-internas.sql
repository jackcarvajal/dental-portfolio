-- ============================================================
-- PRODIGY — Sistema de notificaciones internas por rol
-- Ejecutar en Supabase Dashboard → SQL Editor
--
-- ⚠️ SUPERSEDED: la función prodigy_notif_pedido() de este archivo
-- (sección 3) usa columnas fantasma (NEW.departamento, NEW.servicio,
-- NEW.urgente) que ya NO existen en pedidos. NO reejecutar esa
-- sección — usar sql/patch-notif-pedido-hotfix-columnas-2026.sql
-- (ya aplicado en producción) que la reemplaza correctamente.
-- El resto de este archivo (tabla, RLS, RPCs de notificaciones) sigue
-- vigente, ya con sus propios hotfixes posteriores aplicados encima.
-- ============================================================

-- 1. Tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones_internas (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  tipo        text NOT NULL,          -- 'nuevo_caso','estado_cambio','urgente','pago','churn','cotizacion'
  prioridad   text DEFAULT 'media'    -- 'alta','media','baja'
              CHECK (prioridad IN ('alta','media','baja')),
  destinatario_rol  text,             -- 'admin','superadmin',NULL=todos staff
  destinatario_dept text,             -- 'diseno','fresado','impresion','taller',NULL=todos
  titulo      text NOT NULL,
  mensaje     text NOT NULL,
  pedido_id   uuid REFERENCES public.pedidos(id) ON DELETE CASCADE,
  pedido_codigo text,
  leida_por   uuid[],                -- array de user_id que ya la leyeron
  accion_url  text                    -- URL relativa para ir directo al recurso
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notif_created   ON public.notificaciones_internas (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_dept      ON public.notificaciones_internas (destinatario_dept);
CREATE INDEX IF NOT EXISTS idx_notif_rol       ON public.notificaciones_internas (destinatario_rol);
CREATE INDEX IF NOT EXISTS idx_notif_prioridad ON public.notificaciones_internas (prioridad);

-- 2. RLS
ALTER TABLE public.notificaciones_internas ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.notificaciones_internas TO anon, authenticated;

-- Staff ve sus notificaciones (por rol o departamento)
CREATE POLICY "staff_ve_sus_notifs" ON public.notificaciones_internas
  FOR SELECT TO authenticated
  USING (
    -- admin y superadmin ven todo
    (auth.jwt()->'app_metadata'->>'role' IN ('admin','superadmin'))
    OR
    -- notificaciones sin destinatario específico (broadcast)
    (destinatario_rol IS NULL AND destinatario_dept IS NULL)
    OR
    -- por rol
    (destinatario_rol = auth.jwt()->'app_metadata'->>'role')
  );

-- Solo el sistema (via service role / trigger) puede insertar
CREATE POLICY "sistema_inserta_notifs" ON public.notificaciones_internas
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Cualquiera puede marcar como leída (update leida_por)
CREATE POLICY "staff_marca_leida" ON public.notificaciones_internas
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Trigger: genera notificación automática en cambios de pedidos
CREATE OR REPLACE FUNCTION public.prodigy_notif_pedido()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _titulo  text;
  _mensaje text;
  _prio    text := 'media';
  _tipo    text;
  _dept    text;
  _url     text;
BEGIN
  -- Nuevo pedido ingresado
  IF TG_OP = 'INSERT' THEN
    _tipo    := 'nuevo_caso';
    _dept    := COALESCE(NEW.departamento, 'diseno');
    _titulo  := 'Nuevo caso: ' || COALESCE(NEW.codigo, NEW.id::text);
    _mensaje := 'Tipo: ' || COALESCE(NEW.servicio, '—') || ' · Doctor: ' || COALESCE(NEW.nombre_doctor, '—');
    _prio    := CASE WHEN NEW.urgente = true THEN 'alta' ELSE 'media' END;
    _url     := '/app/operario.html';

  -- Cambio de estado
  ELSIF TG_OP = 'UPDATE' AND NEW.estado IS DISTINCT FROM OLD.estado THEN
    _tipo    := 'estado_cambio';
    _url     := '/app/operario.html';

    -- Caso urgente
    IF NEW.urgente = true AND (OLD.urgente IS NULL OR OLD.urgente = false) THEN
      _titulo  := '🔴 URGENTE: ' || COALESCE(NEW.codigo,'caso');
      _mensaje := 'Caso marcado como urgente — atención inmediata';
      _prio    := 'alta';
      _dept    := COALESCE(NEW.departamento, 'diseno');

    -- Doctor solicitó cambios
    ELSIF NEW.estado = 'CAMBIOS_SOLICITADOS' THEN
      _titulo  := 'Cambios solicitados: ' || COALESCE(NEW.codigo,'caso');
      _mensaje := 'El doctor revisó el diseño y solicitó ajustes. ' || COALESCE(NEW.notas_cambios,'');
      _prio    := 'alta';
      _dept    := 'diseno';

    -- Doctor aprobó diseño → va a fresado/impresión
    ELSIF NEW.estado IN ('APROBADO','APROBADO_CLIENTE') THEN
      _titulo  := 'Diseño aprobado → ' || COALESCE(NEW.departamento_actual, 'siguiente etapa');
      _mensaje := 'Caso ' || COALESCE(NEW.codigo,'—') || ' aprobado por el doctor. Listo para procesar.';
      _prio    := 'media';
      _dept    := COALESCE(NEW.departamento_actual, 'fresado');

    -- Caso listo para entrega
    ELSIF NEW.estado IN ('LISTO','ENTREGADO') THEN
      _titulo  := 'Caso listo: ' || COALESCE(NEW.codigo,'caso');
      _mensaje := 'Entrega pendiente al doctor ' || COALESCE(NEW.nombre_doctor,'—');
      _prio    := 'media';
      _dept    := NULL; -- admin ve esto
      _titulo  := 'Caso listo para entrega: ' || COALESCE(NEW.codigo,'caso');

    -- Pago confirmado
    ELSIF NEW.pago_estado = 'pago_confirmado' AND OLD.pago_estado IS DISTINCT FROM 'pago_confirmado' THEN
      _tipo    := 'pago';
      _titulo  := 'Pago confirmado: ' || COALESCE(NEW.codigo,'caso');
      _mensaje := 'Doctor: ' || COALESCE(NEW.nombre_doctor,'—') || ' · Total: $' || COALESCE(NEW.precio_total::text,'—');
      _prio    := 'media';
      _dept    := NULL;

    ELSE
      RETURN NEW; -- cambio menor, no notificar
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notificaciones_internas
    (tipo, prioridad, destinatario_dept, titulo, mensaje, pedido_id, pedido_codigo, leida_por, accion_url)
  VALUES
    (_tipo, _prio, _dept, _titulo, _mensaje, NEW.id, NEW.codigo, '{}', _url);

  RETURN NEW;
END;
$$;

-- Asociar trigger
DROP TRIGGER IF EXISTS trg_notif_pedido ON public.pedidos;
CREATE TRIGGER trg_notif_pedido
  AFTER INSERT OR UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.prodigy_notif_pedido();

-- 4. Función RPC para marcar notificaciones como leídas
CREATE OR REPLACE FUNCTION public.prodigy_marcar_notifs_leidas(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.notificaciones_internas
  SET leida_por = array_append(leida_por, p_user_id)
  WHERE NOT (leida_por @> ARRAY[p_user_id])
    AND created_at > now() - interval '7 days';
END;
$$;

-- 5. RPC para obtener notificaciones del usuario (respeta dept y rol)
CREATE OR REPLACE FUNCTION public.prodigy_mis_notifs(
  p_dept text DEFAULT NULL,
  p_rol  text DEFAULT NULL,
  p_limit int DEFAULT 15
)
RETURNS TABLE (
  id uuid, created_at timestamptz, tipo text, prioridad text,
  titulo text, mensaje text, pedido_codigo text, accion_url text,
  es_nueva boolean
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  RETURN QUERY
  SELECT
    n.id, n.created_at, n.tipo, n.prioridad,
    n.titulo, n.mensaje, n.pedido_codigo, n.accion_url,
    NOT (_uid = ANY(n.leida_por)) AS es_nueva
  FROM public.notificaciones_internas n
  WHERE
    (n.destinatario_dept IS NULL OR n.destinatario_dept = p_dept)
    AND (n.destinatario_rol IS NULL OR n.destinatario_rol = p_rol OR p_rol IN ('admin','superadmin'))
    AND n.created_at > now() - interval '7 days'
  ORDER BY n.prioridad DESC, n.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Verificación
SELECT 'Tabla notificaciones_internas creada' AS status;
SELECT 'Trigger trg_notif_pedido activo' AS status;
