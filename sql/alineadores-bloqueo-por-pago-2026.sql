-- ================================================================
-- PRODIGY — Alineadores: POLÍTICA DE PAGO con tolerancia y bloqueo
-- El estado de cuenta del mes se paga dentro de los primeros 10 días. Si el cliente tiene SALDO VENCIDO
-- (cargos de meses anteriores sin pagar):
--   · día 1 al 12  → tolerancia: sube casos con normalidad (se le recuerda el saldo).
--   · día 13 y 14  → puede subir, pero el caso queda EN ESPERA DE PAGO (la técnica no lo trabaja).
--   · desde el 15  → NO puede subir casos nuevos hasta ponerse al día.
--     (si ya reportó un pago que falta verificar, en vez de bloquearse el caso queda en espera)
-- Al quedar al día (cargos marcados como pagados) los casos en espera se liberan solos y se avisa a la técnica.
-- Excepciones por cliente: alineadores_clientes.exento_bloqueo = true.
-- Todo se valida en la base (no depende de la página). 100 % IDEMPOTENTE. Copiar TODO → SQL Editor → Run.
-- ================================================================

ALTER TABLE public.alineadores_casos    ADD COLUMN IF NOT EXISTS en_espera_pago boolean NOT NULL DEFAULT false;
ALTER TABLE public.alineadores_clientes ADD COLUMN IF NOT EXISTS exento_bloqueo boolean NOT NULL DEFAULT false;

-- 1) Estado de pago de un cliente (lógica única: la usan el trigger, la página y la liberación)
CREATE OR REPLACE FUNCTION public.aln_estado_pago_de(p_uid uuid)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _mes text := to_char((now() AT TIME ZONE 'America/Bogota')::date, 'YYYY-MM');
        _dia int := extract(day FROM (now() AT TIME ZONE 'America/Bogota'))::int;
        _venc numeric; _verif boolean; _exento boolean; _estado text;
BEGIN
  SELECT COALESCE(sum(g.monto),0) INTO _venc
    FROM public.alineadores_cargos g JOIN public.alineadores_casos c ON c.id = g.caso_id
   WHERE c.cliente_user_id = p_uid AND g.parte = 'cliente' AND g.estado_pago <> 'pagado'
     AND COALESCE(g.mes_corte, to_char(g.fecha,'YYYY-MM')) < _mes;
  SELECT EXISTS (SELECT 1 FROM public.alineadores_pagos p
                  WHERE p.cliente_user_id = p_uid AND p.parte = 'cliente' AND p.estado = 'reportado') INTO _verif;
  SELECT COALESCE(bool_or(exento_bloqueo), false) INTO _exento FROM public.alineadores_clientes WHERE user_id = p_uid;
  _estado := CASE WHEN _exento OR _venc <= 0 OR _dia <= 12 THEN 'ok'
                  WHEN _dia >= 15 AND NOT _verif THEN 'bloqueado'
                  ELSE 'espera' END;
  RETURN json_build_object('estado', _estado, 'vencido', _venc, 'dia', _dia, 'pago_en_verificacion', _verif, 'exento', _exento);
END;$$;
REVOKE ALL ON FUNCTION public.aln_estado_pago_de(uuid) FROM PUBLIC, anon, authenticated;

-- Para la página del cliente: su propio estado
CREATE OR REPLACE FUNCTION public.aln_estado_pago()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.aln_estado_pago_de(auth.uid());
$$;
REVOKE ALL ON FUNCTION public.aln_estado_pago() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aln_estado_pago() TO authenticated;

-- 2) Al subir el caso el propio cliente: bloqueo o espera según el estado de pago
CREATE OR REPLACE FUNCTION public.aln_casos_control_pago()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _e json;
BEGIN
  IF auth.uid() IS NOT NULL AND NEW.cliente_user_id = auth.uid() THEN
    _e := public.aln_estado_pago_de(auth.uid());
    IF _e->>'estado' = 'bloqueado' THEN
      RAISE EXCEPTION 'Tu cuenta tiene un saldo vencido de US$%. Desde el día 15 no se pueden subir casos nuevos hasta ponerse al día. Realiza el pago o repórtalo en «Mi cuenta».', _e->>'vencido';
    ELSIF _e->>'estado' = 'espera' THEN
      NEW.en_espera_pago := true;
    END IF;
  END IF;
  RETURN NEW;
END;$$;
DROP TRIGGER IF EXISTS trg_aln_casos_control_pago ON public.alineadores_casos;
CREATE TRIGGER trg_aln_casos_control_pago BEFORE INSERT ON public.alineadores_casos
  FOR EACH ROW EXECUTE FUNCTION public.aln_casos_control_pago();

-- 3) Solo administración puede cambiar «en espera de pago» (la técnica o el cliente no pueden liberarlo)
CREATE OR REPLACE FUNCTION public.aln_casos_guarda_espera()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.en_espera_pago IS DISTINCT FROM OLD.en_espera_pago AND auth.uid() IS NOT NULL
     AND NOT (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad')
              OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'))
  THEN
    NEW.en_espera_pago := OLD.en_espera_pago;
  END IF;
  RETURN NEW;
END;$$;
DROP TRIGGER IF EXISTS trg_aln_casos_guarda_espera ON public.alineadores_casos;
CREATE TRIGGER trg_aln_casos_guarda_espera BEFORE UPDATE ON public.alineadores_casos
  FOR EACH ROW EXECUTE FUNCTION public.aln_casos_guarda_espera();

-- 4) Al quedar al día (se marcan cargos como pagados): liberar los casos en espera y avisar a la técnica
CREATE OR REPLACE FUNCTION public.aln_cargos_libera_espera()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid; _n int;
BEGIN
  IF NEW.parte <> 'cliente' OR NEW.estado_pago <> 'pagado' THEN RETURN NEW; END IF;
  SELECT cliente_user_id INTO _uid FROM public.alineadores_casos WHERE id = NEW.caso_id;
  IF _uid IS NULL THEN RETURN NEW; END IF;
  IF (public.aln_estado_pago_de(_uid)->>'vencido')::numeric <= 0 THEN
    UPDATE public.alineadores_casos SET en_espera_pago = false WHERE cliente_user_id = _uid AND en_espera_pago;
    GET DIAGNOSTICS _n = ROW_COUNT;
    IF _n > 0 THEN
      INSERT INTO public.notificaciones_internas (tipo, prioridad, destinatario_rol, titulo, mensaje, accion_url, leida_por)
      VALUES ('estado_cambio', 'alta', 'alineadores', '▶️ Casos liberados',
              _n || ' caso(s) que estaban en espera de pago ya se pueden trabajar.', '/app/alineadores.html', '{}');
    END IF;
  END IF;
  RETURN NEW;
END;$$;
DROP TRIGGER IF EXISTS trg_aln_cargos_libera_espera ON public.alineadores_cargos;
CREATE TRIGGER trg_aln_cargos_libera_espera AFTER UPDATE OF estado_pago ON public.alineadores_cargos
  FOR EACH ROW EXECUTE FUNCTION public.aln_cargos_libera_espera();

-- 5) Aviso de caso nuevo: si entra en espera, la técnica lo sabe y no lo trabaja
CREATE OR REPLACE FUNCTION public.aln_casos_aviso_tecnica()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notificaciones_internas
    (tipo, prioridad, destinatario_rol, titulo, mensaje, pedido_codigo, accion_url, leida_por)
  VALUES ('nuevo_caso', 'alta', 'alineadores',
          CASE WHEN NEW.en_espera_pago THEN '⏸️ Caso nuevo EN ESPERA DE PAGO' ELSE '😁 Caso nuevo para valoración' END,
          'Paciente ' || NEW.paciente || COALESCE(' · ' || NEW.cliente, '') ||
            CASE WHEN NEW.en_espera_pago THEN '. El cliente tiene saldo vencido: no lo trabajes hasta que se libere.'
                 ELSE '. Revisa los archivos y sube la viabilidad.' END,
          NEW.codigo, '/app/alineadores.html', '{}');
  RETURN NEW;
END;$$;

SELECT 'Política de pago lista: tolerancia hasta el 12, espera 13-14, bloqueo desde el 15, liberación automática' AS status;
