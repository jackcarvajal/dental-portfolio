-- ================================================================
-- PRODIGY — Alineadores: panel de Mayra + lógica de pago sin doble cobro
-- 1) Mayra (rol diseno) puede VER sus cargos de pago (parte='mayra'), NUNCA los del cliente.
-- 2) Al crear un caso se generan sus cargos automáticamente (trigger).
-- 3) Al COMPLETAR: se corrobora que hay modelos y se cobra solo la DIFERENCIA
--    (completo - valoración ya cargada) → si la valoración ya se pagó, no se paga doble.
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- Requiere: sql/alineadores-casos-2026.sql ya corrido.
-- ================================================================

-- ── 1) RLS: Mayra lee SOLO sus cargos (parte='mayra'), jamás los del cliente ──
DROP POLICY IF EXISTS "mayra_lee_sus_cargos" ON public.alineadores_cargos;
CREATE POLICY "mayra_lee_sus_cargos" ON public.alineadores_cargos
  FOR SELECT TO authenticated
  USING (
    parte = 'mayra'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'diseno'
  );

-- ── 2) Trigger: al crear un caso, generar sus cargos automáticamente ──
--    Caso 'valoracion' → cargos de valoración (Mayra 20.000 / cliente 40).
--    Caso creado ya completo → cargos completos (Mayra 60.000 / cliente 120).
CREATE OR REPLACE FUNCTION public.aln_casos_auto_cargos()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _mes text := to_char(COALESCE(NEW.fecha_recepcion, now()::date), 'YYYY-MM');
BEGIN
  -- Precios VIGENTES del cliente: valoración $30 / completo $90 USD (el alza a $40/$120 aún NO aplica).
  IF NEW.estado = 'valoracion' THEN
    INSERT INTO public.alineadores_cargos(negocio,caso_id,parte,tipo,monto,moneda,mes_corte,estado_pago)
    VALUES (NEW.negocio,NEW.id,'mayra','valoracion',20000,'COP',_mes,'pendiente'),
           (NEW.negocio,NEW.id,'cliente','valoracion',30,'USD',_mes,'pendiente');
  ELSE
    INSERT INTO public.alineadores_cargos(negocio,caso_id,parte,tipo,monto,moneda,mes_corte,estado_pago)
    VALUES (NEW.negocio,NEW.id,'mayra','completo',60000,'COP',_mes,'pendiente'),
           (NEW.negocio,NEW.id,'cliente','completo',90,'USD',_mes,'pendiente');
  END IF;
  RETURN NEW;
END;$$;
DROP TRIGGER IF EXISTS trg_aln_casos_cargos ON public.alineadores_casos;
CREATE TRIGGER trg_aln_casos_cargos AFTER INSERT ON public.alineadores_casos
  FOR EACH ROW EXECUTE FUNCTION public.aln_casos_auto_cargos();

-- ── 3) RPC completar caso: corrobora modelos + cobra solo la diferencia ──
CREATE OR REPLACE FUNCTION public.aln_completar_caso(p_caso_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _rol text; _mod boolean; _vm numeric; _vc numeric; _has_comp boolean; _mes text;
BEGIN
  _rol := COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','');
  IF _rol NOT IN ('admin','operator','contabilidad','diseno')
     AND (auth.jwt() ->> 'email') NOT IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  THEN RETURN json_build_object('ok',false,'error','No autorizado'); END IF;

  SELECT modelos INTO _mod FROM public.alineadores_casos WHERE id = p_caso_id;
  IF _mod IS NULL THEN RETURN json_build_object('ok',false,'error','El caso no existe'); END IF;
  IF _mod IS DISTINCT FROM true THEN
    RETURN json_build_object('ok',false,'error','Faltan los modelos: marca "modelos entregados" en el caso antes de completar.');
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.alineadores_cargos
    WHERE caso_id = p_caso_id AND tipo IN ('completo','diferencia_a_completo')) INTO _has_comp;

  UPDATE public.alineadores_casos SET estado = 'terminado' WHERE id = p_caso_id;
  IF _has_comp THEN RETURN json_build_object('ok',true,'nota','Caso terminado (los cargos completos ya existían).'); END IF;

  _mes := to_char(now(),'YYYY-MM');
  SELECT COALESCE(sum(monto),0) INTO _vm FROM public.alineadores_cargos WHERE caso_id=p_caso_id AND parte='mayra'   AND tipo='valoracion';
  SELECT COALESCE(sum(monto),0) INTO _vc FROM public.alineadores_cargos WHERE caso_id=p_caso_id AND parte='cliente' AND tipo='valoracion';

  -- Diferencia = completo (Mayra 60.000 / cliente 120) menos lo ya cargado como valoración.
  -- Diferencia: completo VIGENTE (Mayra 60.000 / cliente 90) menos la valoración ya cargada.
  INSERT INTO public.alineadores_cargos(negocio,caso_id,parte,tipo,monto,moneda,mes_corte,estado_pago,descripcion)
  VALUES ('prodigy',p_caso_id,'mayra','diferencia_a_completo',60000 - _vm,'COP',_mes,'pendiente','Completo menos valoración ya cargada ('||_vm||')'),
         ('prodigy',p_caso_id,'cliente','diferencia_a_completo',90 - _vc,'USD',_mes,'pendiente','Completo menos valoración ya cargada');

  RETURN json_build_object('ok',true,'mayra_diferencia',60000-_vm,'cliente_diferencia',90-_vc);
END;$$;
REVOKE ALL ON FUNCTION public.aln_completar_caso(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.aln_completar_caso(uuid) TO authenticated;

SELECT 'Panel Mayra + trigger cargos + RPC completar (sin doble cobro) listos' AS status;
