-- ================================================================
-- PRODIGY — ENVÍO POR TRANSPORTADORA + ESTADO «TERMINADO Y MAQUILLAJE»
-- 1) Despachos: además del mensajero en moto (Bogotá), un caso puede salir por transportadora (otra ciudad)
--    con su número de guía. Se registra desde el panel interno → Despachos (opción «Transportadora»).
--    Para eso el despacho ya no exige mensajero cuando va por transportadora.
-- 2) Bandeja de WhatsApp: el estado nuevo EN_ACABADO (terminado y maquillaje, lo marca fresado) también avisa.
-- 3) Seguimiento público: devuelve cómo va el envío (vehiculo moto/camion, transportadora y guía) para el
--    laboratorio 3D. Sigue exigiendo la llave del caso.
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- 1) Despachos por transportadora
ALTER TABLE public.despachos ADD COLUMN IF NOT EXISTS tipo_envio text NOT NULL DEFAULT 'mensajero';
ALTER TABLE public.despachos ADD COLUMN IF NOT EXISTS transportadora text;
ALTER TABLE public.despachos ADD COLUMN IF NOT EXISTS guia text;
ALTER TABLE public.despachos ALTER COLUMN mensajero_id DROP NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'despachos_tipo_envio_valido') THEN
    ALTER TABLE public.despachos ADD CONSTRAINT despachos_tipo_envio_valido CHECK (tipo_envio IN ('mensajero','transportadora'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'despachos_mensajero_o_transportadora') THEN
    ALTER TABLE public.despachos ADD CONSTRAINT despachos_mensajero_o_transportadora
      CHECK (mensajero_id IS NOT NULL OR tipo_envio = 'transportadora');
  END IF;
END $$;

-- 2) Cola de WhatsApp: + EN_ACABADO
CREATE OR REPLACE FUNCTION public.encolar_aviso_whatsapp() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _e text := upper(trim(COALESCE(NEW.estado_operativo, '')));
        _neg text := COALESCE(NEW.negocio, 'prodigy');
BEGIN
  IF _e = upper(trim(COALESCE(OLD.estado_operativo, ''))) THEN RETURN NEW; END IF;
  IF _e NOT IN ('ERROR_STL','EN_DISENO','REVISION_CLIENTE','CAMBIOS_SOLICITADOS','EN_PRODUCCION','FRESADO_INICIADO',
                'EN_ACABADO','EN_IMPRESION','QA_APROBADO','LISTO_DESPACHAR','EN_REPARTO','ENTREGADO') THEN RETURN NEW; END IF;
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

-- 3) Seguimiento público con el envío (canónica; reemplaza la de avisos-whatsapp-fase2-2026.sql)
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
                                ORDER BY d.fecha_entrega_real DESC NULLS LAST LIMIT 1) END,
        'vehiculo',         CASE WHEN env.tipo_envio = 'transportadora' THEN 'camion' WHEN env.tipo_envio IS NOT NULL THEN 'moto' END,
        'transportadora',   env.transportadora,
        'guia',             env.guia
    )
    INTO result
    FROM pedidos p
    LEFT JOIN LATERAL (SELECT d.tipo_envio, d.transportadora, d.guia FROM despachos d
                        WHERE d.pedido_id = p.id ORDER BY d.created_at DESC LIMIT 1) env ON true
    WHERE upper(trim(p.codigo)) = upper(trim(p_codigo))
    LIMIT 1;

    RETURN result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.buscar_pedido_publico(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.buscar_pedido_publico(TEXT, TEXT) TO authenticated;

-- Verificación
SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
 WHERE table_schema = 'public' AND table_name = 'despachos'
   AND column_name IN ('tipo_envio','transportadora','guia','mensajero_id')
 ORDER BY 1;
