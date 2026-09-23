-- ================================================================
-- PRODIGY — Rol EXCLUSIVO de alineadores (aísla a Mayra de coronas)
-- Mayra pasa de 'diseno' → 'alineadores': solo ve su panel de alineadores,
-- nunca la fábrica de coronas (operario-diseno / pedidos).
-- Las políticas de alineadores aceptan 'diseno' Y 'alineadores' (por si en
-- el futuro hay más técnicos). 100% IDEMPOTENTE → Supabase SQL Editor → Run.
-- ================================================================

-- 1) Rol exclusivo de Mayra
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data,'{}'::jsonb) || '{"role":"alineadores"}'::jsonb
WHERE email = 'mayramireztd@gmail.com';

-- 2) alineadores_casos — staff (agrega 'alineadores')
DROP POLICY IF EXISTS "staff_all_aln_casos" ON public.alineadores_casos;
CREATE POLICY "staff_all_aln_casos" ON public.alineadores_casos
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','diseno','alineadores','secretaria')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','diseno','alineadores','secretaria')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

-- 3) alineadores_cargos — la técnica lee SOLO sus cargos (parte='mayra')
DROP POLICY IF EXISTS "mayra_lee_sus_cargos" ON public.alineadores_cargos;
CREATE POLICY "mayra_lee_sus_cargos" ON public.alineadores_cargos
  FOR SELECT TO authenticated
  USING ( parte='mayra' AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('diseno','alineadores') );

-- 4) alineadores_entregas — staff (SOLO si la tabla existe; se crea aparte con alineadores-entregas-2026.sql)
DO $do$
BEGIN
  IF to_regclass('public.alineadores_entregas') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "staff_all_aln_entregas" ON public.alineadores_entregas';
    EXECUTE $p$CREATE POLICY "staff_all_aln_entregas" ON public.alineadores_entregas
      FOR ALL TO authenticated
      USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','diseno','alineadores','secretaria')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
      )
      WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','diseno','alineadores','secretaria')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
      )$p$;
  END IF;
END
$do$;

-- 5) alineadores_clientes — staff lee (agrega 'alineadores')
DROP POLICY IF EXISTS "staff_lee_aln_clientes" ON public.alineadores_clientes;
CREATE POLICY "staff_lee_aln_clientes" ON public.alineadores_clientes
  FOR SELECT TO authenticated USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','diseno','alineadores','secretaria')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

-- 6) RPC completar caso — aceptar 'alineadores'
CREATE OR REPLACE FUNCTION public.aln_completar_caso(p_caso_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _mod boolean; _vm numeric; _vc numeric; _has_comp boolean; _mes text;
BEGIN
  IF (auth.jwt() -> 'app_metadata' ->> 'role') NOT IN ('admin','operator','contabilidad','diseno','alineadores')
     AND (auth.jwt() ->> 'email') NOT IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  THEN RETURN json_build_object('ok',false,'error','No autorizado'); END IF;

  SELECT modelos INTO _mod FROM public.alineadores_casos WHERE id = p_caso_id;
  IF _mod IS NULL THEN RETURN json_build_object('ok',false,'error','El caso no existe'); END IF;
  IF _mod IS DISTINCT FROM true THEN
    RETURN json_build_object('ok',false,'error','Faltan los modelos: marca "modelos entregados" antes de completar.');
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.alineadores_cargos WHERE caso_id=p_caso_id AND tipo IN ('completo','diferencia_a_completo')) INTO _has_comp;
  UPDATE public.alineadores_casos SET estado='terminado' WHERE id=p_caso_id;
  IF _has_comp THEN RETURN json_build_object('ok',true,'nota','Caso terminado (cargos ya existían).'); END IF;

  _mes := to_char(now(),'YYYY-MM');
  SELECT COALESCE(sum(monto),0) INTO _vm FROM public.alineadores_cargos WHERE caso_id=p_caso_id AND parte='mayra'   AND tipo='valoracion';
  SELECT COALESCE(sum(monto),0) INTO _vc FROM public.alineadores_cargos WHERE caso_id=p_caso_id AND parte='cliente' AND tipo='valoracion';
  INSERT INTO public.alineadores_cargos(negocio,caso_id,parte,tipo,monto,moneda,mes_corte,estado_pago,descripcion)
  VALUES ('prodigy',p_caso_id,'mayra','diferencia_a_completo',60000 - _vm,'COP',_mes,'pendiente','Completo menos valoración ya cargada ('||_vm||')'),
         ('prodigy',p_caso_id,'cliente','diferencia_a_completo',90 - _vc,'USD',_mes,'pendiente','Completo menos valoración ya cargada');
  RETURN json_build_object('ok',true,'mayra_diferencia',60000-_vm,'cliente_diferencia',90-_vc);
END;$$;

SELECT 'Rol alineadores exclusivo listo (Mayra aislada de coronas)' AS status;
