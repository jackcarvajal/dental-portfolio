-- ============================================================
-- PRODIGY — HOTFIX: columnas inexistentes en las RPCs de revision-diseno
-- Ejecutar en: Supabase Dashboard → SQL Editor — URGENTE (antes de que
-- un doctor real abra un link de revisión, las RPCs actuales fallan)
--
-- Hallazgo (detectado al probar en vivo, 2026-07-05): la tabla real
-- `pedidos` NO tiene columnas `servicio` ni `flujo` (confirmado con
-- information_schema.columns) — eran heredadas de la query original
-- de revision-diseno.html, que ya estaba rota desde antes de esta
-- sesión (PL/pgSQL no valida columnas hasta ejecutar, así que
-- CREATE FUNCTION no lo detectó). Tampoco existe `observaciones`
-- (usada en prodigy_rd_solicitar_cambio) — el campo real para notas
-- de cambio solicitado es `notas_cambios` (confirmado: ya lo usa
-- prodigy_notif_pedido() para el mismo propósito).
--
-- Fix: quitar servicio/flujo del SELECT de lectura (el frontend ya
-- maneja su ausencia con `||'—'`/fallbacks, no rompe UI) y cambiar
-- observaciones → notas_cambios en la RPC de escritura.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_revision_diseno_get(p_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result json;
BEGIN
  SELECT json_build_object(
    'id', p.id, 'codigo', p.codigo, 'nombre_paciente', p.nombre_paciente,
    'material', p.material, 'color_vita', p.color_vita,
    'estado_operativo', p.estado_operativo,
    'html_diseno_url', p.html_diseno_url, 'stl_urls', p.stl_urls,
    'construinfo_url', p.construinfo_url, 'fotos_diseno_urls', p.fotos_diseno_urls,
    'cambios_count', p.cambios_count, 'diseno_aprobado_at', p.diseno_aprobado_at,
    'diseno_disclaimer', p.diseno_disclaimer, 'fabricacion_solicitada', p.fabricacion_solicitada,
    'fabricacion_pagada', p.fabricacion_pagada, 'fabricacion_tipo', p.fabricacion_tipo,
    'servicios_pagados', p.servicios_pagados, 'departamento_actual', p.departamento_actual,
    'pais', p.pais, 'cotizacion_fab_monto', p.cotizacion_fab_monto,
    'cotizacion_fab_estado', p.cotizacion_fab_estado, 'cotizacion_fab_nota', p.cotizacion_fab_nota
  ) INTO result
  FROM public.pedidos p
  WHERE p.id = p_id AND p.html_diseno_url IS NOT NULL;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.prodigy_rd_solicitar_cambio(p_id uuid, p_texto text, p_fotos text[] DEFAULT '{}')
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _cc int;
BEGIN
  SELECT COALESCE(cambios_count,0)+1 INTO _cc FROM public.pedidos
    WHERE id = p_id AND html_diseno_url IS NOT NULL AND estado_operativo = 'REVISION_CLIENTE';
  IF _cc IS NULL THEN RETURN json_build_object('ok',false,'error','Estado inválido'); END IF;

  UPDATE public.pedidos SET estado_operativo='CAMBIOS_SOLICITADOS', cambios_count=_cc, notas_cambios=p_texto
  WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,fotos_urls,metadata)
  VALUES (p_id,'CAMBIO_SOLICITADO','doctor',p_texto,p_fotos,json_build_object('num',_cc,'paga_extra',_cc>2));

  RETURN json_build_object('ok',true,'cambios_count',_cc);
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT prodigy_revision_diseno_get('<uuid-real-de-un-pedido-con-diseno>');
--   → debe devolver JSON sin error (antes fallaba con "column servicio does not exist").
-- ============================================================

SELECT 'patch-revision-diseno-hotfix-columnas-2026 aplicado' AS status;
