-- ================================================================
-- PRODIGY + Alejandro — BANDEJA DE WHATSAPP fase 2 · campana · foto de entrega
-- 1) La cola de avisos también para Alejandro CAD/CAM (su bandeja: alejandrocadcam.com/app/bandeja-whatsapp.html).
-- 2) Campana del panel: cuando entra un aviso DORADO de PRODIGY (el doctor debe aprobar su diseño o reenviar
--    archivos) le llega una notificación a la secretaría (y a administración) que lleva a la Bandeja.
-- 3) Seguimiento público: si el caso ya se entregó, devuelve la foto de entrega del mensajero (foto_entrega)
--    para mostrarla en el laboratorio 3D. Sigue exigiendo la llave del caso igual que antes.
-- Requiere: sql/avisos-whatsapp-2026.sql y sql/seguimiento-estado-operativo-2026.sql ya corridos.
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- 1 + 2) Encolar (PRODIGY y Alejandro) y avisar en la campana los dorados de PRODIGY
CREATE OR REPLACE FUNCTION public.encolar_aviso_whatsapp() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _e text := upper(trim(COALESCE(NEW.estado_operativo, '')));
        _neg text := COALESCE(NEW.negocio, 'prodigy');
BEGIN
  IF _e = upper(trim(COALESCE(OLD.estado_operativo, ''))) THEN RETURN NEW; END IF;
  IF _e NOT IN ('ERROR_STL','EN_DISENO','REVISION_CLIENTE','CAMBIOS_SOLICITADOS','EN_PRODUCCION','FRESADO_INICIADO',
                'EN_IMPRESION','QA_APROBADO','LISTO_DESPACHAR','EN_REPARTO','ENTREGADO') THEN RETURN NEW; END IF;
  IF _neg NOT IN ('prodigy','alejandrocadcam') OR COALESCE(NEW.es_prueba, false) THEN RETURN NEW; END IF;
  UPDATE public.avisos_whatsapp SET estado_envio = 'reemplazado'
   WHERE pedido_id = NEW.id AND estado_envio = 'pendiente';
  INSERT INTO public.avisos_whatsapp (pedido_id, negocio, estado) VALUES (NEW.id, _neg, _e);
  IF _neg = 'prodigy' AND _e IN ('REVISION_CLIENTE','ERROR_STL') THEN
    INSERT INTO public.notificaciones_internas (tipo, prioridad, destinatario_rol, titulo, mensaje, pedido_id, pedido_codigo, accion_url)
    VALUES ('estado_cambio', 'alta', 'secretaria',
            CASE _e WHEN 'REVISION_CLIENTE' THEN '📨 WhatsApp: el doctor debe aprobar su diseño'
                    ELSE '📨 WhatsApp: el doctor debe reenviar archivos' END,
            'Caso ' || COALESCE(NEW.codigo, '—') || ' — envíale el aviso desde la Bandeja de WhatsApp.',
            NEW.id, NEW.codigo, '/app/bandeja-whatsapp.html');
  END IF;
  RETURN NEW;
END $$;

-- 3) Seguimiento público con la foto de entrega (canónica; reemplaza la de seguimiento-estado-operativo-2026.sql)
CREATE OR REPLACE FUNCTION public.buscar_pedido_publico(
    p_codigo TEXT,
    p_nonce  TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    result JSON;
    v_nonce TEXT;
BEGIN
    SELECT hash_seguridad INTO v_nonce
    FROM pedidos
    WHERE upper(trim(codigo)) = upper(trim(p_codigo))
    LIMIT 1;

    IF v_nonce IS NOT NULL AND p_nonce IS NULL THEN
        RETURN NULL;
    END IF;
    IF v_nonce IS NOT NULL AND p_nonce IS NOT NULL AND v_nonce <> p_nonce THEN
        RETURN NULL;
    END IF;

    SELECT json_build_object(
        'codigo',           p.codigo,
        'servicio',         p.tipo_trabajo,
        'material',         p.material,
        'submaterial',      p.submaterial,
        'color_vita',       p.color_vita,
        'cantidad',         p.cantidad,
        'estado',           p.estado::text,
        'estado_operativo', NULLIF(upper(trim(p.estado_operativo)), ''),
        'fecha_entrega',    p.fecha_entrega,
        'flujo',            p.flujo,
        'created_at',       p.created_at,
        'foto_entrega',     CASE WHEN upper(trim(COALESCE(p.estado_operativo, ''))) = 'ENTREGADO' THEN
                              (SELECT d.foto_url FROM despachos d
                                WHERE d.pedido_id = p.id AND d.foto_url LIKE 'https://%'
                                ORDER BY d.fecha_entrega_real DESC NULLS LAST LIMIT 1) END
    )
    INTO result
    FROM pedidos p
    WHERE upper(trim(p.codigo)) = upper(trim(p_codigo))
    LIMIT 1;

    RETURN result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.buscar_pedido_publico(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.buscar_pedido_publico(TEXT, TEXT) TO authenticated;

-- Verificación
SELECT (SELECT count(*) FROM pg_trigger WHERE tgname = 'trg_encolar_aviso_whatsapp') AS trigger_activo,
       (SELECT count(*) FROM public.avisos_whatsapp WHERE estado_envio = 'pendiente') AS avisos_por_enviar,
       (SELECT count(*) FROM despachos WHERE foto_url LIKE 'https://%') AS entregas_con_foto;
