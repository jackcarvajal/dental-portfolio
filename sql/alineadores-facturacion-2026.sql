-- ================================================================
-- PRODIGY — Alineadores: FECHA DE FACTURACIÓN y bloqueo justo
-- Problema: un cobro aparecía «por facturar» en un mes viejo (p. ej. una valoración de marzo)
-- aunque el cliente ya había pagado meses posteriores, y el bloqueo lo contaba como SALDO VENCIDO
-- solo por ser de un mes anterior — aunque nunca se le hubiera enviado en un estado de cuenta.
-- Regla correcta (política de pago): el estado de cuenta se ENVÍA y se paga dentro de los primeros
-- 10 días del mes SIGUIENTE al envío. Por eso:
--   · Cada cobro guarda cuándo se facturó (facturado_at). Se llena solo al pasar a «facturado».
--   · Saldo vencido = solo lo FACTURADO en un mes anterior y sin pagar. Lo no facturado nunca bloquea.
-- Datos: el estado de cuenta de Panorámica Digital 3D (US$780) se envió el 29-sep-2026 → sus cobros
-- pendientes pasan a «facturado» con esa fecha (vence en octubre: tolerancia al 12, bloqueo desde el 15).
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

ALTER TABLE public.alineadores_cargos ADD COLUMN IF NOT EXISTS facturado_at date;

-- 1) Al pasar a «facturado» se anota la fecha (hora de Bogotá); al volver a pendiente se borra
CREATE OR REPLACE FUNCTION public.aln_cargos_fecha_factura()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.estado_pago = 'facturado' AND NEW.facturado_at IS NULL THEN
    NEW.facturado_at := (now() AT TIME ZONE 'America/Bogota')::date;
  ELSIF NEW.estado_pago = 'pendiente' THEN
    NEW.facturado_at := NULL;
  END IF;
  RETURN NEW;
END;$$;
DROP TRIGGER IF EXISTS trg_aln_cargos_fecha_factura ON public.alineadores_cargos;
CREATE TRIGGER trg_aln_cargos_fecha_factura BEFORE INSERT OR UPDATE OF estado_pago ON public.alineadores_cargos
  FOR EACH ROW EXECUTE FUNCTION public.aln_cargos_fecha_factura();

-- 2) Estado de pago: vencido = facturado en un mes anterior y sin pagar (lo no facturado no cuenta)
CREATE OR REPLACE FUNCTION public.aln_estado_pago_de(p_uid uuid)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _hoy date := (now() AT TIME ZONE 'America/Bogota')::date;
        _dia int := extract(day FROM _hoy)::int;
        _venc numeric; _verif boolean; _exento boolean; _estado text;
BEGIN
  SELECT COALESCE(sum(g.monto),0) INTO _venc
    FROM public.alineadores_cargos g JOIN public.alineadores_casos c ON c.id = g.caso_id
   WHERE c.cliente_user_id = p_uid AND g.parte = 'cliente' AND g.estado_pago = 'facturado'
     AND COALESCE(g.facturado_at, _hoy) < date_trunc('month', _hoy)::date;
  SELECT EXISTS (SELECT 1 FROM public.alineadores_pagos p
                  WHERE p.cliente_user_id = p_uid AND p.parte = 'cliente' AND p.estado = 'reportado') INTO _verif;
  SELECT COALESCE(bool_or(exento_bloqueo), false) INTO _exento FROM public.alineadores_clientes WHERE user_id = p_uid;
  _estado := CASE WHEN _exento OR _venc <= 0 OR _dia <= 12 THEN 'ok'
                  WHEN _dia >= 15 AND NOT _verif THEN 'bloqueado'
                  ELSE 'espera' END;
  RETURN json_build_object('estado', _estado, 'vencido', _venc, 'dia', _dia, 'pago_en_verificacion', _verif, 'exento', _exento);
END;$$;
REVOKE ALL ON FUNCTION public.aln_estado_pago_de(uuid) FROM PUBLIC, anon, authenticated;

-- 3) Datos: el estado de cuenta enviado a Panorámica el 29-sep-2026 (todo lo que tenía sin pagar)
WITH upd AS (
  UPDATE public.alineadores_cargos g
     SET estado_pago = 'facturado', facturado_at = COALESCE(g.facturado_at, DATE '2026-09-29')
    FROM public.alineadores_casos c
   WHERE c.id = g.caso_id AND g.parte = 'cliente' AND g.estado_pago IN ('pendiente','facturado')
     AND c.cliente ILIKE '%panor%'
  RETURNING g.mes_corte, g.monto
)
SELECT COALESCE(mes_corte, '(sin mes)') AS mes, count(*) AS cobros, sum(monto) AS usd FROM upd GROUP BY 1
UNION ALL
SELECT 'TOTAL (debe dar 780)', count(*), sum(monto) FROM upd
ORDER BY 1;
