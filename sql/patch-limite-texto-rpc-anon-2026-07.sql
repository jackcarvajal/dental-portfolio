-- ============================================================
-- PRODIGY — Límite de longitud en texto libre de RPCs anon
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Contexto (auditoría validación server-side 2026-07-09):
-- prodigy_rd_solicitar_cambio() y prodigy_rd_enviar_comprobante()
-- son callable por anon (revision-diseno.html, sin sesión — el doctor
-- entra por link directo) y aceptan texto libre sin límite de
-- longitud, riesgo de relleno de BD. Se trunca en vez de rechazar,
-- para no romper el flujo real (nadie legítimo manda 5000 caracteres).
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_rd_solicitar_cambio(p_id uuid, p_texto text, p_fotos text[] DEFAULT '{}')
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _cc int; _texto text := LEFT(COALESCE(p_texto,''), 3000);
BEGIN
  SELECT COALESCE(cambios_count,0)+1 INTO _cc FROM public.pedidos
    WHERE id = p_id AND html_diseno_url IS NOT NULL AND estado_operativo = 'REVISION_CLIENTE';
  IF _cc IS NULL THEN RETURN json_build_object('ok',false,'error','Estado inválido'); END IF;

  UPDATE public.pedidos SET estado_operativo='CAMBIOS_SOLICITADOS', cambios_count=_cc, notas_cambios=_texto
  WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,fotos_urls,metadata)
  VALUES (p_id,'CAMBIO_SOLICITADO','doctor',_texto,p_fotos[1:20],json_build_object('num',_cc,'paga_extra',_cc>2));

  RETURN json_build_object('ok',true,'cambios_count',_cc);
END;
$$;

CREATE OR REPLACE FUNCTION public.prodigy_rd_enviar_comprobante(p_id uuid, p_tipo text, p_monto numeric, p_nota text, p_comp_url text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _codigo text; _nota text := LEFT(COALESCE(p_nota,''), 2000); _comp_url text := LEFT(COALESCE(p_comp_url,''), 1000);
BEGIN
  SELECT codigo INTO _codigo FROM public.pedidos WHERE id = p_id AND html_diseno_url IS NOT NULL;
  IF NOT FOUND THEN RETURN json_build_object('ok',false,'error','Pedido no encontrado'); END IF;

  UPDATE public.pedidos SET
    fabricacion_solicitada = true, fabricacion_tipo = LEFT(COALESCE(p_tipo,''), 100),
    cotizacion_fab_monto = p_monto, cotizacion_fab_estado = 'pago_enviado', cotizacion_fab_nota = _nota
  WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,fotos_urls,metadata)
  VALUES (p_id,'FAB_PAGO_DOCTOR','doctor', _nota||' — '||COALESCE(p_monto,0)::text||' — Comprobante adjunto',
    CASE WHEN _comp_url <> '' THEN ARRAY[_comp_url] ELSE '{}'::text[] END,
    json_build_object('tipo',p_tipo,'monto',p_monto,'svc',_nota));

  INSERT INTO public.logs_incidencias(pedido_id,tipo,severidad,descripcion,resuelta)
  VALUES (p_id,'INFO','INFO','💰 VERIFICAR PAGO: '||_nota||' '||COALESCE(p_monto,0)::text||' — Caso '||COALESCE(_codigo,'')||' — Ver comprobante: '||_comp_url, false);

  RETURN json_build_object('ok',true);
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT prosrc FROM pg_proc WHERE proname IN ('prodigy_rd_solicitar_cambio','prodigy_rd_enviar_comprobante');
--   → ambos deben contener "LEFT("
