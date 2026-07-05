-- ============================================================
-- PRODIGY — revision-diseno.html: escritura anon sin filtro por pedido
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-05, cierre del riesgo residual documentado
-- junto con el patch 17 de lectura):
--
-- La política "anon_diseno_review_update" en pedidos solo valida el
-- ESTADO de la fila (html_diseno_url IS NOT NULL AND estado_operativo
-- = 'REVISION_CLIENTE'), no el id — cualquiera con la anon key podía
-- ejecutar un UPDATE sin WHERE de id (solo con el filtro de estado) y
-- modificar TODOS los pedidos actualmente en revisión de un golpe:
-- aprobar diseños ajenos, marcar pagos de fabricación como confirmados,
-- o sobrescribir notas — sin conocer el link/UUID de esos casos.
--
-- El mismo defecto existía en una SEGUNDA política,
-- "anon_diseno_postaprobacion_update" (migrate-fabricacion-flujo.sql),
-- que su propio comentario ya advertía no podía restringir por columna
-- vía RLS — mismo problema, sin filtro por id.
--
-- Fix: 8 RPCs SECURITY DEFINER, una por cada acción que hacía
-- revision-diseno.html vía UPDATE/INSERT directo. Cada una exige el
-- UUID exacto del pedido como parámetro y revalida internamente el
-- estado antes de escribir (mismo criterio que antes tenían las
-- políticas RLS, pero ahora atado al id real). Se eliminan ambas
-- políticas — la escritura ya solo pasa por las RPCs.
-- ============================================================

-- 1. Detectar país (baja severidad, pero mismo patrón por consistencia)
CREATE OR REPLACE FUNCTION public.prodigy_rd_set_pais(p_id uuid, p_pais text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.pedidos SET pais = p_pais
  WHERE id = p_id AND html_diseno_url IS NOT NULL AND pais IS NULL;
END;
$$;

-- 2. Solicitar cambio de diseño
CREATE OR REPLACE FUNCTION public.prodigy_rd_solicitar_cambio(p_id uuid, p_texto text, p_fotos text[] DEFAULT '{}')
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _cc int;
BEGIN
  SELECT COALESCE(cambios_count,0)+1 INTO _cc FROM public.pedidos
    WHERE id = p_id AND html_diseno_url IS NOT NULL AND estado_operativo = 'REVISION_CLIENTE';
  IF _cc IS NULL THEN RETURN json_build_object('ok',false,'error','Estado inválido'); END IF;

  UPDATE public.pedidos SET estado_operativo='CAMBIOS_SOLICITADOS', cambios_count=_cc, observaciones=p_texto
  WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,fotos_urls,metadata)
  VALUES (p_id,'CAMBIO_SOLICITADO','doctor',p_texto,p_fotos,json_build_object('num',_cc,'paga_extra',_cc>2));

  RETURN json_build_object('ok',true,'cambios_count',_cc);
END;
$$;

-- 3. Aprobar diseño
CREATE OR REPLACE FUNCTION public.prodigy_rd_aprobar(p_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _ts timestamptz := now();
BEGIN
  UPDATE public.pedidos
  SET estado_operativo='DISENO_APROBADO', diseno_disclaimer=true, diseno_aprobado_at=_ts, diseno_aprobado_por='doctor'
  WHERE id = p_id AND html_diseno_url IS NOT NULL AND estado_operativo = 'REVISION_CLIENTE';
  IF NOT FOUND THEN RETURN json_build_object('ok',false,'error','Estado inválido'); END IF;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,metadata)
  VALUES (p_id,'APROBACION','doctor','Diseño aprobado. Cliente autoriza fabricación y acepta condiciones.',json_build_object('aprobado_at',_ts));

  RETURN json_build_object('ok',true,'aprobado_at',_ts);
END;
$$;

-- 4. Confirmar pago de fabricación (flujo "cotización ya enviada")
CREATE OR REPLACE FUNCTION public.prodigy_rd_confirmar_pago_doctor(p_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _monto numeric; _codigo text;
BEGIN
  SELECT cotizacion_fab_monto, codigo INTO _monto, _codigo FROM public.pedidos
    WHERE id = p_id AND html_diseno_url IS NOT NULL;
  IF NOT FOUND THEN RETURN json_build_object('ok',false,'error','Pedido no encontrado'); END IF;

  UPDATE public.pedidos SET cotizacion_fab_estado = 'pago_confirmado' WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,metadata)
  VALUES (p_id,'FAB_PAGO_DOCTOR','doctor',
    'Doctor indica haber realizado el pago de fabricación. Monto declarado: '||COALESCE(_monto,0)::text,
    json_build_object('monto',_monto));

  INSERT INTO public.logs_incidencias(pedido_id,tipo,severidad,descripcion,resuelta)
  VALUES (p_id,'INFO','INFO','💰 Doctor confirma pago de fabricación — Caso '||COALESCE(_codigo,'')||' — Verificar y enrutar a producción', false);

  RETURN json_build_object('ok',true);
END;
$$;

-- 5. Solicitar fabricación internacional
CREATE OR REPLACE FUNCTION public.prodigy_rd_solicitar_fab_internacional(p_id uuid, p_tipo text, p_pais text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _codigo text;
BEGIN
  SELECT codigo INTO _codigo FROM public.pedidos WHERE id = p_id AND html_diseno_url IS NOT NULL;
  IF NOT FOUND THEN RETURN json_build_object('ok',false,'error','Pedido no encontrado'); END IF;

  UPDATE public.pedidos SET fabricacion_solicitada = true, fabricacion_tipo = p_tipo || '_internacional' WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,metadata)
  VALUES (p_id,'FAB_SOLICITADA','doctor','Solicitud especial de fabricación internacional: '||p_tipo||' — País: '||COALESCE(p_pais,''),
    json_build_object('tipo',p_tipo,'pais',p_pais,'es_internacional',true));

  INSERT INTO public.logs_incidencias(pedido_id,tipo,severidad,descripcion,resuelta)
  VALUES (p_id,'INFO','INFO','🌎 SOLICITUD INTERNACIONAL: Doctor solicita '||p_tipo||' con envío a '||COALESCE(p_pais,'')||' — Caso '||COALESCE(_codigo,'')||'. Requiere cotización y coordinación de envío.', false);

  RETURN json_build_object('ok',true);
END;
$$;

-- 6. Enviar comprobante de pago (con cotización propia elegida por el doctor)
CREATE OR REPLACE FUNCTION public.prodigy_rd_enviar_comprobante(p_id uuid, p_tipo text, p_monto numeric, p_nota text, p_comp_url text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _codigo text;
BEGIN
  SELECT codigo INTO _codigo FROM public.pedidos WHERE id = p_id AND html_diseno_url IS NOT NULL;
  IF NOT FOUND THEN RETURN json_build_object('ok',false,'error','Pedido no encontrado'); END IF;

  UPDATE public.pedidos SET
    fabricacion_solicitada = true, fabricacion_tipo = p_tipo,
    cotizacion_fab_monto = p_monto, cotizacion_fab_estado = 'pago_enviado', cotizacion_fab_nota = p_nota
  WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,fotos_urls,metadata)
  VALUES (p_id,'FAB_PAGO_DOCTOR','doctor', p_nota||' — '||COALESCE(p_monto,0)::text||' — Comprobante adjunto',
    CASE WHEN p_comp_url IS NOT NULL THEN ARRAY[p_comp_url] ELSE '{}'::text[] END,
    json_build_object('tipo',p_tipo,'monto',p_monto,'svc',p_nota));

  INSERT INTO public.logs_incidencias(pedido_id,tipo,severidad,descripcion,resuelta)
  VALUES (p_id,'INFO','INFO','💰 VERIFICAR PAGO: '||p_nota||' '||COALESCE(p_monto,0)::text||' — Caso '||COALESCE(_codigo,'')||' — Ver comprobante: '||COALESCE(p_comp_url,''), false);

  RETURN json_build_object('ok',true);
END;
$$;

-- 7. Confirmar pago de fabricación (flujo simple, sin cotización previa)
CREATE OR REPLACE FUNCTION public.prodigy_rd_confirmar_pago_fab(p_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _codigo text;
BEGIN
  SELECT codigo INTO _codigo FROM public.pedidos WHERE id = p_id AND html_diseno_url IS NOT NULL;
  IF NOT FOUND THEN RETURN json_build_object('ok',false,'error','Pedido no encontrado'); END IF;

  UPDATE public.pedidos SET fabricacion_solicitada = true WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion)
  VALUES (p_id,'FAB_SOLICITADA','doctor','Cliente indica haber realizado pago de fabricación. Pendiente verificación.');

  INSERT INTO public.logs_incidencias(pedido_id,tipo,severidad,descripcion,resuelta)
  VALUES (p_id,'INFO','INFO','Doctor confirma pago de fabricación — Verificar — Caso '||COALESCE(_codigo,''), false);

  RETURN json_build_object('ok',true);
END;
$$;

-- 8. Nota post-aprobación / descarga / aviso de sistema (solo historial, sin tocar pedidos)
CREATE OR REPLACE FUNCTION public.prodigy_rd_log(p_id uuid, p_tipo text, p_desc text, p_fotos text[] DEFAULT '{}')
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _actor text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.pedidos WHERE id = p_id AND html_diseno_url IS NOT NULL) THEN
    RETURN json_build_object('ok',false,'error','Pedido no encontrado');
  END IF;
  IF p_tipo NOT IN ('NOTA_DOCTOR','DESCARGA','DESCARGA_DISPONIBLE') THEN
    RETURN json_build_object('ok',false,'error','Tipo no permitido');
  END IF;
  _actor := CASE WHEN p_tipo = 'DESCARGA_DISPONIBLE' THEN 'sistema' ELSE 'doctor' END;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,fotos_urls)
  VALUES (p_id, p_tipo, _actor, p_desc, p_fotos);

  IF p_tipo = 'DESCARGA' THEN
    INSERT INTO public.logs_incidencias(pedido_id,tipo,severidad,descripcion,resuelta)
    SELECT p_id,'INFO','INFO','Doctor descargó archivos: '||p_desc||' — Caso '||COALESCE(codigo,''), true
    FROM public.pedidos WHERE id = p_id;
  END IF;

  RETURN json_build_object('ok',true);
END;
$$;

REVOKE ALL ON FUNCTION public.prodigy_rd_set_pais(uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_solicitar_cambio(uuid,text,text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_aprobar(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_confirmar_pago_doctor(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_solicitar_fab_internacional(uuid,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_enviar_comprobante(uuid,text,numeric,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_confirmar_pago_fab(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_log(uuid,text,text,text[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.prodigy_rd_set_pais(uuid,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_solicitar_cambio(uuid,text,text[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_aprobar(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_confirmar_pago_doctor(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_solicitar_fab_internacional(uuid,text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_enviar_comprobante(uuid,text,numeric,text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_confirmar_pago_fab(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_log(uuid,text,text,text[]) TO anon, authenticated;

-- Eliminar las 2 políticas de UPDATE abiertas — toda escritura pasa por las RPCs
DROP POLICY IF EXISTS "anon_diseno_review_update" ON pedidos;
DROP POLICY IF EXISTS "anon_diseno_postaprobacion_update" ON pedidos;

-- Restringir también el INSERT directo de historial_diseno (ya no se usa
-- desde revision-diseno.html, todo pasa por prodigy_rd_log/las RPCs de arriba)
DROP POLICY IF EXISTS "anon_historial_insert" ON historial_diseno;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Con un pedido real en REVISION_CLIENTE: llamar
--   SELECT prodigy_rd_aprobar('<uuid-real>');
-- debe devolver {"ok":true,...} y el pedido debe quedar DISENO_APROBADO.
-- Sin sesión, intentar UPDATE directo a pedidos → debe fallar (RLS).
-- ============================================================

SELECT 'patch-revision-diseno-escritura-rpc-2026 aplicado' AS status;
