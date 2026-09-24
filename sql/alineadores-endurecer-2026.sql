-- ================================================================
-- PRODIGY — Alineadores: endurecer permisos (auditoría 24-sep-2026)
-- Hallazgos:
--  1) El rol 'diseno' (TODOS los diseñadores CAD: exocad, guías, blender) seguía viendo los casos
--     de alineadores, los archivos del paciente y el PAGO de la técnica (cargos parte='mayra'),
--     y podía completar casos (genera cargos). Mayra ya tiene rol exclusivo 'alineadores'.
--  2) La política FOR ALL dejaba a la técnica y a secretaría CREAR y BORRAR casos: crear un caso
--     dispara cargos automáticos (pago a la técnica) y borrar arrastra los cargos del cliente.
--  3) GRAVE: las funciones aln_vincular_cliente y aln_completar_caso comparaban el rol con NOT IN sin
--     COALESCE. Para una cuenta SIN rol (NULL), "NULL NOT IN (...)" da NULL y el IF no bloquea:
--     cualquier cuenta sin rol podía vincular a su usuario el nombre de otra clínica (y ver sus casos
--     y cargos) o completar casos. Ahora se compara con COALESCE(...,'').
--  4) El bucket de archivos aceptaba 150 MB (sin sesión) aunque la página solo permite 50 MB.
-- Ahora: ver/editar = admin, operator, contabilidad, secretaría y alineadores.
--        crear/borrar = solo admin, operator, contabilidad (+ el cliente crea SU caso, política aparte).
-- También acepta el arreglo app_metadata.roles (multi-rol) además de app_metadata.role.
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- 1) Casos: separar lectura/edición de creación/borrado
DROP POLICY IF EXISTS "staff_all_aln_casos" ON public.alineadores_casos;
DROP POLICY IF EXISTS "aln_casos_ve_equipo" ON public.alineadores_casos;
DROP POLICY IF EXISTS "aln_casos_edita_equipo" ON public.alineadores_casos;
DROP POLICY IF EXISTS "aln_casos_crea_admin" ON public.alineadores_casos;
DROP POLICY IF EXISTS "aln_casos_borra_admin" ON public.alineadores_casos;

CREATE POLICY "aln_casos_ve_equipo" ON public.alineadores_casos
  FOR SELECT TO authenticated USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','secretaria','alineadores')
    OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| ARRAY['alineadores']
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

CREATE POLICY "aln_casos_edita_equipo" ON public.alineadores_casos
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','secretaria','alineadores')
    OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| ARRAY['alineadores']
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','secretaria','alineadores')
    OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| ARRAY['alineadores']
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

CREATE POLICY "aln_casos_crea_admin" ON public.alineadores_casos
  FOR INSERT TO authenticated WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

CREATE POLICY "aln_casos_borra_admin" ON public.alineadores_casos
  FOR DELETE TO authenticated USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

-- 2) Pago a la técnica: solo el rol alineadores (ya no 'diseno')
DROP POLICY IF EXISTS "mayra_lee_sus_cargos" ON public.alineadores_cargos;
CREATE POLICY "mayra_lee_sus_cargos" ON public.alineadores_cargos
  FOR SELECT TO authenticated USING (
    parte = 'mayra' AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'alineadores'
      OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| ARRAY['alineadores']
    )
  );

-- 3) Mapa de clientes (lectura)
DROP POLICY IF EXISTS "staff_lee_aln_clientes" ON public.alineadores_clientes;
CREATE POLICY "staff_lee_aln_clientes" ON public.alineadores_clientes
  FOR SELECT TO authenticated USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','secretaria','alineadores')
    OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| ARRAY['alineadores']
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

-- 4) Archivos del paciente (bucket alineadores-archivos)
DROP POLICY IF EXISTS "aln_archivos_staff_read" ON storage.objects;
CREATE POLICY "aln_archivos_staff_read" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'alineadores-archivos'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','secretaria','alineadores')
      OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| ARRAY['alineadores']
      OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
    )
  );

-- 5) Entregas técnica ↔ cliente (solo si la tabla ya existe)
DO $do$
BEGIN
  IF to_regclass('public.alineadores_entregas') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "staff_all_aln_entregas" ON public.alineadores_entregas';
    EXECUTE $p$CREATE POLICY "staff_all_aln_entregas" ON public.alineadores_entregas
      FOR ALL TO authenticated
      USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','secretaria','alineadores')
        OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| ARRAY['alineadores']
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
      )
      WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','secretaria','alineadores')
        OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| ARRAY['alineadores']
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
      )$p$;
  END IF;
END
$do$;

-- 6) Completar caso (genera cargos): ya no 'diseno'
CREATE OR REPLACE FUNCTION public.aln_completar_caso(p_caso_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _mod boolean; _vm numeric; _vc numeric; _has_comp boolean; _mes text;
BEGIN
  IF COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') NOT IN ('admin','operator','contabilidad','alineadores')
     AND NOT (COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| ARRAY['alineadores'])
     AND COALESCE(auth.jwt() ->> 'email','') NOT IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
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
REVOKE ALL ON FUNCTION public.aln_completar_caso(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aln_completar_caso(uuid) TO authenticated;

-- 7) Vincular cliente (mapa nombre → cuenta): mismo arreglo del NULL
CREATE OR REPLACE FUNCTION public.aln_vincular_cliente(p_nombre text, p_user_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _n int;
BEGIN
  IF COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') NOT IN ('admin','operator','contabilidad')
     AND COALESCE(auth.jwt() ->> 'email','') NOT IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  THEN RETURN json_build_object('ok',false,'error','No autorizado'); END IF;
  INSERT INTO public.alineadores_clientes(nombre,user_id) VALUES (p_nombre,p_user_id)
    ON CONFLICT (nombre) DO UPDATE SET user_id = EXCLUDED.user_id;
  UPDATE public.alineadores_casos SET cliente_user_id = p_user_id
    WHERE negocio='prodigy' AND lower(trim(cliente)) = lower(trim(p_nombre));
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN json_build_object('ok',true,'vinculados',_n);
END;$$;
REVOKE ALL ON FUNCTION public.aln_vincular_cliente(text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aln_vincular_cliente(text,uuid) TO authenticated;

-- 8) Bucket de archivos: el formulario público deja subir sin sesión; el límite del bucket era 150 MB
--    aunque la página solo acepta 50 MB por archivo → se iguala para que nadie lo use de disco gratis.
UPDATE storage.buckets SET file_size_limit = 52428800 WHERE id = 'alineadores-archivos';

SELECT 'Alineadores endurecido: sin rol diseno, crear/borrar solo admin, multi-rol' AS status;
