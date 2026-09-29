-- ================================================================
-- PRODIGY — Alineadores: ABONOS a la técnica (pagos parciales)
-- · alineadores_pagos ahora tiene `parte` (igual que alineadores_cargos): 'cliente' = lo que paga el cliente,
--   'mayra' = lo que se le paga a la técnica. El cliente solo ve e inserta lo suyo; la técnica solo lee sus abonos.
-- · aln_registrar_abono_tecnica(): registra el abono y lo aplica a los cargos pendientes MÁS ANTIGUOS;
--   si no alcanza para uno, lo divide (parte pagada + saldo). Solo admin/operator/contabilidad.
-- · Aviso al cliente: «Viabilidad y valoración lista» (antes «Viabilidad lista»).
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- 1) Columna parte
ALTER TABLE public.alineadores_pagos ADD COLUMN IF NOT EXISTS parte text NOT NULL DEFAULT 'cliente';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'aln_pagos_parte_chk') THEN
    ALTER TABLE public.alineadores_pagos ADD CONSTRAINT aln_pagos_parte_chk CHECK (parte IN ('cliente','mayra'));
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_aln_pagos_parte ON public.alineadores_pagos (parte, created_at DESC);

-- 2) RLS: el cliente solo ve/inserta pagos 'cliente' suyos; la técnica lee los abonos 'mayra'
DROP POLICY IF EXISTS "cliente_sus_pagos" ON public.alineadores_pagos;
CREATE POLICY "cliente_sus_pagos" ON public.alineadores_pagos
  FOR SELECT TO authenticated USING (parte = 'cliente' AND cliente_user_id = auth.uid());
DROP POLICY IF EXISTS "cliente_inserta_pago" ON public.alineadores_pagos;
CREATE POLICY "cliente_inserta_pago" ON public.alineadores_pagos
  FOR INSERT TO authenticated WITH CHECK (parte = 'cliente' AND cliente_user_id = auth.uid() AND estado = 'reportado');
DROP POLICY IF EXISTS "tecnica_lee_sus_abonos" ON public.alineadores_pagos;
CREATE POLICY "tecnica_lee_sus_abonos" ON public.alineadores_pagos
  FOR SELECT TO authenticated USING (
    parte = 'mayra' AND (
      COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') = 'alineadores'
      OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles','[]'::jsonb) ?| ARRAY['alineadores'])
  );

-- 3) Lógica del abono (interna: sin permisos para la API; la llama el SQL editor o la función de abajo)
CREATE OR REPLACE FUNCTION public.aln_aplicar_abono_tecnica(p_monto numeric, p_fecha date, p_metodo text, p_referencia text, p_nota text)
RETURNS json LANGUAGE plpgsql SET search_path = public AS $$
DECLARE _rest numeric := p_monto; _f date := COALESCE(p_fecha, current_date); _txt text; r record; _n int := 0; _pago uuid;
BEGIN
  IF p_monto IS NULL OR p_monto <= 0 THEN RETURN json_build_object('ok',false,'error','El monto debe ser mayor que cero'); END IF;
  _txt := to_char(_f, 'DD-MM-YYYY');
  INSERT INTO public.alineadores_pagos (negocio, parte, monto, moneda, metodo, referencia, nota, estado, mes_corte, created_at)
  VALUES ('prodigy', 'mayra', p_monto, 'COP', NULLIF(trim(p_metodo),''), NULLIF(trim(p_referencia),''), NULLIF(trim(p_nota),''),
          'verificado', to_char(_f,'YYYY-MM'), (_f::timestamp + interval '14 hours') AT TIME ZONE 'America/Bogota')
  RETURNING id INTO _pago;

  FOR r IN SELECT id, caso_id, tipo, monto, fecha, mes_corte, descripcion FROM public.alineadores_cargos
            WHERE negocio = 'prodigy' AND parte = 'mayra' AND estado_pago <> 'pagado' AND monto > 0
            ORDER BY COALESCE(mes_corte,'9999-99'), fecha NULLS LAST, created_at
            FOR UPDATE
  LOOP
    EXIT WHEN _rest <= 0;
    IF r.monto <= _rest THEN
      UPDATE public.alineadores_cargos
         SET estado_pago = 'pagado',
             descripcion = COALESCE(NULLIF(r.descripcion,'') || ' · ', '') || 'Pagado con el abono del ' || _txt
       WHERE id = r.id;
      _rest := _rest - r.monto;
    ELSE
      -- No alcanza: el cargo se divide en lo pagado (nuevo, 'pagado') y el saldo (el mismo cargo, 'pendiente')
      UPDATE public.alineadores_cargos
         SET monto = r.monto - _rest,
             descripcion = COALESCE(NULLIF(r.descripcion,'') || ' · ', '') || 'Saldo: el abono del ' || _txt || ' cubrió '
                           || replace(to_char(_rest,'FM999,999,999'),',','.') || ' de ' || replace(to_char(r.monto,'FM999,999,999'),',','.')
       WHERE id = r.id;
      INSERT INTO public.alineadores_cargos (negocio, caso_id, parte, tipo, descripcion, monto, moneda, fecha, mes_corte, estado_pago)
      VALUES ('prodigy', r.caso_id, 'mayra', r.tipo, 'Abono parcial del ' || _txt, _rest, 'COP', r.fecha, r.mes_corte, 'pagado');
      _rest := 0;
    END IF;
    _n := _n + 1;
  END LOOP;
  RETURN json_build_object('ok', true, 'pago_id', _pago, 'aplicado', p_monto - _rest, 'a_favor', _rest, 'cargos', _n);
END;$$;
REVOKE ALL ON FUNCTION public.aln_aplicar_abono_tecnica(numeric, date, text, text, text) FROM PUBLIC, anon, authenticated;

-- 4) Para el tablero (botón «Registrar abono»): solo admin/operator/contabilidad
CREATE OR REPLACE FUNCTION public.aln_registrar_abono_tecnica(p_monto numeric, p_fecha date DEFAULT NULL, p_metodo text DEFAULT NULL, p_referencia text DEFAULT NULL, p_nota text DEFAULT NULL)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad')
          OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'))
  THEN RETURN json_build_object('ok', false, 'error', 'No autorizado'); END IF;
  RETURN public.aln_aplicar_abono_tecnica(p_monto, p_fecha, p_metodo, p_referencia, p_nota);
END;$$;
REVOKE ALL ON FUNCTION public.aln_registrar_abono_tecnica(numeric, date, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aln_registrar_abono_tecnica(numeric, date, text, text, text) TO authenticated;

-- 5) Aviso al cliente con el nombre correcto de la etapa
CREATE OR REPLACE FUNCTION public.aln_entregas_aviso_cliente()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _c record;
BEGIN
  SELECT paciente, codigo, cliente_user_id INTO _c FROM public.alineadores_casos WHERE id = NEW.caso_id;
  IF _c.cliente_user_id IS NOT NULL THEN
    INSERT INTO public.notificaciones_internas
      (tipo, prioridad, destinatario_rol, destinatario_user_id, titulo, mensaje, pedido_codigo, accion_url, leida_por)
    VALUES ('aln_entrega', 'alta', 'client', _c.cliente_user_id,
            CASE WHEN NEW.etapa = 'viabilidad' THEN 'Viabilidad y valoración lista' ELSE 'Planificación lista' END
              || CASE WHEN NEW.revision_num > 0 THEN ' (revisión ' || NEW.revision_num || ')' ELSE '' END,
            'Paciente ' || _c.paciente || ': revísala y apruébala o pide cambios.',
            _c.codigo, '/app/facturacion-alineadores.html#casos', '{}');
  END IF;
  RETURN NEW;
END;$$;

SELECT 'Abonos a la técnica listos: pagos con parte, RLS, registrar/aplicar abono, aviso renombrado' AS status;
