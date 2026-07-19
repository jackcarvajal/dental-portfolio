-- =====================================================================
-- APROBACIÓN DEL DOCTOR → ENRUTADO AUTOMÁTICO A PRODUCCIÓN
-- Auditoría del flujo de archivos · 2026-07-18 · proyecto zgihrwqfyvgyapbwzkvw
--
-- ── EL PROBLEMA ──────────────────────────────────────────────────────
-- Cuando el doctor aprueba el diseño, `prodigy_rd_aprobar()` escribe:
--     estado_operativo = 'DISENO_APROBADO'
--
-- Pero el trigger de avisos (sql/notificaciones-internas.sql, línea 106 y su
-- hotfix patch-notif-pedido-hotfix-columnas-2026.sql línea 80) evalúa:
--     ELSIF NEW.estado IN ('APROBADO','APROBADO_CLIENTE')
--
-- Son COLUMNAS DISTINTAS: el trigger vigila `estado`, la aprobación escribe
-- `estado_operativo`. Nada pone jamás `estado` en 'APROBADO'.
-- => Esa rama NUNCA se ha ejecutado. El aviso "Diseño aprobado → producción"
--    no ha salido ni una vez.
--
-- Y `departamento_actual` solo se escribe en el enrutado MANUAL del panel
-- interno (_doEnrutar). Al aprobar queda NULL, así que el caso aprobado no
-- aparece en la bandeja de ningún área: espera a que alguien lo note a ojo.
--
-- ── QUÉ HACE ESTE PARCHE ─────────────────────────────────────────────
-- Un trigger sobre `estado_operativo` que, al aprobarse el diseño:
--   a) Si hay fabricación solicitada Y PAGADA  → enruta al área y le avisa
--   b) Si hay fabricación solicitada SIN pagar → avisa a admin (no produce)
--   c) Si es solo diseño (sin fabricación)     → avisa que hay que entregar
--
-- ── POR QUÉ NO ENRUTA SIN PAGO ───────────────────────────────────────
-- Mandar a producción algo no pagado consume material y máquina a riesgo.
-- El caso (b) avisa para que administración confirme el pago y enrute; ese
-- paso manual ya existe (_doEnrutar) y se conserva.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.enrutar_diseno_aprobado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _dept    text;
  _pagada  boolean;
  _titulo  text;
  _mensaje text;
  _destrol text;
  _destdep text;
  _prio    text;
BEGIN
  -- Solo al MOMENTO de pasar a aprobado (no en cada update posterior)
  IF NEW.estado_operativo IS DISTINCT FROM 'DISENO_APROBADO'
     OR OLD.estado_operativo IS NOT DISTINCT FROM 'DISENO_APROBADO' THEN
    RETURN NEW;
  END IF;

  -- El área destino sale del tipo de fabricación pedido; si no, del flujo del caso.
  -- 'fresado_internacional' → 'fresado' (mismo vocabulario que TIPO_LBL en el panel).
  _dept := NULLIF(replace(COALESCE(NEW.fabricacion_tipo,''), '_internacional', ''), '');
  _dept := COALESCE(_dept, NULLIF(NEW.flujo, ''), 'fresado');

  _pagada := COALESCE(NEW.fabricacion_pagada, false)
             OR NEW.cotizacion_fab_estado = 'pago_confirmado';

  IF COALESCE(NEW.fabricacion_solicitada, false) AND _pagada THEN
    -- (a) Listo para producir: se enruta de verdad
    NEW.departamento_actual := _dept;
    _titulo  := 'Aprobado → producción (' || _dept || ')';
    _mensaje := 'El doctor aprobó el diseño del caso ' || COALESCE(NEW.codigo,'—') ||
                '. Fabricación pagada. Los STL están listos: puede entrar a producción.';
    _destrol := NULL;
    _destdep := _dept;
    _prio    := 'alta';

  ELSIF COALESCE(NEW.fabricacion_solicitada, false) THEN
    -- (b) Aprobado pero sin pago confirmado: NO se enruta
    _titulo  := 'Aprobado — falta confirmar pago de fabricación';
    _mensaje := 'El doctor aprobó el caso ' || COALESCE(NEW.codigo,'—') ||
                ' y pidió fabricación (' || _dept || '), pero el pago no está confirmado. ' ||
                'Verifica el pago y enruta desde el panel para que entre a producción.';
    _destrol := 'admin';
    _destdep := NULL;
    _prio    := 'alta';

  ELSE
    -- (c) Solo diseño: hay que entregarle los archivos al doctor
    _titulo  := 'Diseño aprobado — entregar archivos';
    _mensaje := 'El doctor aprobó el diseño del caso ' || COALESCE(NEW.codigo,'—') ||
                '. No pidió fabricación: libera el STL para que lo descargue desde su portal.';
    _destrol := 'admin';
    _destdep := NULL;
    _prio    := 'media';
  END IF;

  INSERT INTO public.notificaciones_internas (
    tipo, prioridad, destinatario_rol, destinatario_dept,
    titulo, mensaje, pedido_id, pedido_codigo, accion_url, leida_por
  ) VALUES (
    'nuevo_caso', _prio, _destrol, _destdep,
    _titulo, _mensaje, NEW.id, NEW.codigo,
    '/app/panel-interno-operaciones.html', '{}'
  );

  INSERT INTO public.historial_diseno (pedido_id, tipo, actor, descripcion, metadata)
  VALUES (NEW.id, 'ENRUTADO_AUTO', 'sistema',
          _titulo,
          json_build_object('departamento', _dept, 'pagada', _pagada,
                            'enrutado', (NEW.departamento_actual IS NOT NULL)));

  RETURN NEW;
END;
$$;

-- BEFORE UPDATE: necesita serlo para poder escribir NEW.departamento_actual
-- en la misma operación, sin un UPDATE extra que dispararía el trigger de nuevo.
DROP TRIGGER IF EXISTS trg_enrutar_diseno_aprobado ON public.pedidos;
CREATE TRIGGER trg_enrutar_diseno_aprobado
  BEFORE UPDATE OF estado_operativo ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.enrutar_diseno_aprobado();

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────
-- 1) El trigger existe:
--    SELECT tgname FROM pg_trigger WHERE tgname = 'trg_enrutar_diseno_aprobado';
--
-- 2) Prueba en un caso real (usa uno de prueba, no uno de un doctor):
--    UPDATE public.pedidos SET estado_operativo='REVISION_CLIENTE' WHERE codigo='<CODIGO>';
--    UPDATE public.pedidos SET estado_operativo='DISENO_APROBADO'  WHERE codigo='<CODIGO>';
--    SELECT codigo, estado_operativo, departamento_actual FROM public.pedidos WHERE codigo='<CODIGO>';
--    SELECT titulo, mensaje, destinatario_dept FROM public.notificaciones_internas
--      ORDER BY created_at DESC LIMIT 1;
--
--    Con fabricacion_solicitada=true y fabricacion_pagada=true debe quedar
--    departamento_actual='fresado' (o el que corresponda) y salir el aviso al área.
--
-- ── NOTA SOBRE LA RAMA MUERTA ─────────────────────────────────────────
-- La rama  ELSIF NEW.estado IN ('APROBADO','APROBADO_CLIENTE')  del trigger viejo
-- sigue existiendo y sigue sin dispararse. No se elimina aquí porque ese mismo
-- trigger maneja otros casos que SÍ funcionan (CAMBIOS_SOLICITADOS, pago
-- confirmado, urgente). Limpiarla es tarea aparte, sin urgencia: no hace daño,
-- solo es código que nunca corre.
