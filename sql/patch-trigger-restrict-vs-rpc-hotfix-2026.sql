-- ============================================================
-- PRODIGY — HOTFIX: trigger prodigy_restrict_client_pedido_updates
-- bloquea también las RPCs seguras de revision-diseno.html
-- Ejecutar en: Supabase Dashboard → SQL Editor — URGENTE
--
-- Hallazgo (detectado al probar en vivo, 2026-07-05): el trigger
-- "restrict_client_pedido_updates" (BEFORE UPDATE en pedidos) bloquea
-- cambios a estado_operativo para cualquiera que no sea staff, según
-- el JWT de la sesión (current_setting('request.jwt.claims')). Como
-- SECURITY DEFINER NO cambia el JWT visible para el trigger (sigue
-- siendo el del doctor anónimo que llama la RPC), prodigy_rd_aprobar()
-- y prodigy_rd_solicitar_cambio() (patch 18) también quedan bloqueadas
-- — el error real era "PRODIGY_SECURITY: Clientes no pueden modificar
-- estado_operativo", oculto tras el toast genérico "Error" en la UI.
--
-- Este trigger es correcto y NO se debilita en general — solo se le
-- agrega una excepción puntual: si una variable de sesión local
-- (prodigy.allow_estado_change) está en 'true', permite el cambio de
-- estado_operativo específicamente (el resto de columnas protegidas
-- —precio_total, stl_ruta, doctor_uid, etc.— siguen bloqueadas igual).
-- Esa variable solo la activan las 2 RPCs de revision-diseno.html que
-- legítimamente necesitan mover el estado (aprobar / solicitar cambio),
-- y es local a la transacción — no se puede activar desde fuera.
--
-- [Corregido en la 2da pasada: el trigger también referenciaba
--  NEW.precio_saldo, que tampoco existe — la columna real es
--  saldo_pendiente_monto. Mismo patrón de columnas renombradas que
--  no se actualizaron en todo el código (ver hotfixes anteriores).]
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_restrict_client_pedido_updates()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    _email  text;
    _role   text;
    _is_staff boolean;
BEGIN
    _email := (current_setting('request.jwt.claims', true)::jsonb ->> 'email');
    _role  := (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role');

    _is_staff := (
        _email IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        OR _role IN ('admin', 'operator', 'diseno', 'fresado', 'impresion', 'taller', 'calidad', 'contabilidad', 'mensajero', 'encargado_inventario')
    );

    IF _is_staff THEN
        RETURN NEW;
    END IF;

    IF NEW.estado IS DISTINCT FROM OLD.estado THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden modificar el estado del pedido (%.estado: % → %)',
            OLD.id, OLD.estado, NEW.estado;
    END IF;

    -- Estado operativo interno: permitido SOLO si lo activa una RPC de
    -- confianza (prodigy_rd_aprobar / prodigy_rd_solicitar_cambio) vía
    -- set_config local a la transacción — no accesible desde fuera.
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

    IF NEW.pago_estado = 'pago_confirmado' AND OLD.pago_estado != 'pago_confirmado' THEN
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

    RETURN NEW;
END;
$$;

-- Las 2 RPCs que legítimamente mueven estado_operativo activan el flag
-- local antes de su UPDATE.
CREATE OR REPLACE FUNCTION public.prodigy_rd_solicitar_cambio(p_id uuid, p_texto text, p_fotos text[] DEFAULT '{}')
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _cc int;
BEGIN
  SELECT COALESCE(cambios_count,0)+1 INTO _cc FROM public.pedidos
    WHERE id = p_id AND html_diseno_url IS NOT NULL AND estado_operativo = 'REVISION_CLIENTE';
  IF _cc IS NULL THEN RETURN json_build_object('ok',false,'error','Estado inválido'); END IF;

  PERFORM set_config('prodigy.allow_estado_change', 'true', true);
  UPDATE public.pedidos SET estado_operativo='CAMBIOS_SOLICITADOS', cambios_count=_cc, notas_cambios=p_texto
  WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,fotos_urls,metadata)
  VALUES (p_id,'CAMBIO_SOLICITADO','doctor',p_texto,p_fotos,json_build_object('num',_cc,'paga_extra',_cc>2));

  RETURN json_build_object('ok',true,'cambios_count',_cc);
END;
$$;

CREATE OR REPLACE FUNCTION public.prodigy_rd_aprobar(p_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _ts timestamptz := now();
BEGIN
  PERFORM set_config('prodigy.allow_estado_change', 'true', true);
  UPDATE public.pedidos
  SET estado_operativo='DISENO_APROBADO', diseno_disclaimer=true, diseno_aprobado_at=_ts, diseno_aprobado_por='doctor'
  WHERE id = p_id AND html_diseno_url IS NOT NULL AND estado_operativo = 'REVISION_CLIENTE';
  IF NOT FOUND THEN RETURN json_build_object('ok',false,'error','Estado inválido'); END IF;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,metadata)
  VALUES (p_id,'APROBACION','doctor','Diseño aprobado. Cliente autoriza fabricación y acepta condiciones.',json_build_object('aprobado_at',_ts));

  RETURN json_build_object('ok',true,'aprobado_at',_ts);
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT prodigy_rd_aprobar('<uuid-real-en-REVISION_CLIENTE>');
--   → debe devolver {"ok":true,...} sin excepción PRODIGY_SECURITY.
-- ============================================================

SELECT 'patch-trigger-restrict-vs-rpc-hotfix-2026 aplicado' AS status;
