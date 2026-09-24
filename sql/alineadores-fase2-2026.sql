-- ================================================================
-- PRODIGY — Alineadores FASE 2: entregas técnica ↔ cliente + avisos + comisión por cliente
-- (reemplaza al borrador alineadores-entregas-2026.sql, que nunca se corrió)
--  1) Comisión de PayPal POR CLIENTE (Panorámica = 12 % acordado; el resto, la de PayPal normal).
--  2) Entregas: la técnica sube viabilidad / planificación (video, PDF, imágenes, enlace) y el
--     cliente APRUEBA o PIDE CAMBIOS desde su portal (planificación incluye 2 revisiones).
--  3) Bucket privado 'alineadores-entregas' (<caso_id>/archivo).
--  4) Avisos en la campana: caso nuevo → técnica · entrega nueva → cliente · respuesta → técnica.
-- Permisos con el mismo criterio endurecido (sin rol 'diseno', COALESCE, multi-rol).
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- ── 1) Comisión de PayPal por cliente ────────────────────────────
ALTER TABLE public.alineadores_clientes
  ADD COLUMN IF NOT EXISTS comision_paypal numeric(5,4);        -- NULL = comisión normal de PayPal
UPDATE public.alineadores_clientes SET comision_paypal = 0.12
  WHERE lower(nombre) LIKE 'panor%mica digital%';

DROP POLICY IF EXISTS "cliente_lee_su_config" ON public.alineadores_clientes;
CREATE POLICY "cliente_lee_su_config" ON public.alineadores_clientes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ── 2) Entregas ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alineadores_entregas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio             text NOT NULL DEFAULT 'prodigy',
  caso_id             uuid NOT NULL REFERENCES public.alineadores_casos(id) ON DELETE CASCADE,
  etapa               text NOT NULL DEFAULT 'planificacion',   -- viabilidad | planificacion
  archivos            text[] NOT NULL DEFAULT '{}',             -- rutas en el bucket alineadores-entregas
  enlace              text,                                     -- enlace externo (visor 3Shape, Drive…)
  nota_mayra          text,                                     -- texto de la viabilidad / notas del plan
  estado              text NOT NULL DEFAULT 'enviado',          -- enviado | aprobado | cambios
  observacion_cliente text,
  revision_num        int NOT NULL DEFAULT 0,                   -- 0 = primera; 1 y 2 = revisiones incluidas
  created_by          uuid DEFAULT auth.uid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  respondido_at       timestamptz
);
ALTER TABLE public.alineadores_entregas ADD COLUMN IF NOT EXISTS enlace text;
ALTER TABLE public.alineadores_entregas ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid();
CREATE INDEX IF NOT EXISTS idx_aln_entregas_caso ON public.alineadores_entregas (caso_id, created_at DESC);
ALTER TABLE public.alineadores_entregas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_all_aln_entregas" ON public.alineadores_entregas;
DROP POLICY IF EXISTS "aln_entregas_ve_equipo" ON public.alineadores_entregas;
DROP POLICY IF EXISTS "aln_entregas_crea_equipo" ON public.alineadores_entregas;
DROP POLICY IF EXISTS "aln_entregas_borra_equipo" ON public.alineadores_entregas;
DROP POLICY IF EXISTS "aln_entregas_edita_admin" ON public.alineadores_entregas;
DROP POLICY IF EXISTS "cliente_lee_sus_entregas" ON public.alineadores_entregas;

CREATE POLICY "aln_entregas_ve_equipo" ON public.alineadores_entregas
  FOR SELECT TO authenticated USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad','secretaria','alineadores')
    OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles','[]'::jsonb) ?| ARRAY['alineadores']
    OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );
CREATE POLICY "aln_entregas_crea_equipo" ON public.alineadores_entregas
  FOR INSERT TO authenticated WITH CHECK (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad','alineadores')
    OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles','[]'::jsonb) ?| ARRAY['alineadores']
    OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );
-- Borrar: solo una entrega que el cliente aún no respondió (para corregir una subida equivocada)
CREATE POLICY "aln_entregas_borra_equipo" ON public.alineadores_entregas
  FOR DELETE TO authenticated USING (
    estado = 'enviado' AND (
      COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad','alineadores')
      OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles','[]'::jsonb) ?| ARRAY['alineadores']
      OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'))
  );
-- Editar a mano (corregir estado/observación): solo admin. La respuesta del cliente va por la RPC.
CREATE POLICY "aln_entregas_edita_admin" ON public.alineadores_entregas
  FOR UPDATE TO authenticated
  USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad')
    OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'))
  WITH CHECK (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad')
    OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'));
-- El cliente ve las entregas de SUS casos
CREATE POLICY "cliente_lee_sus_entregas" ON public.alineadores_entregas
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.alineadores_casos c WHERE c.id = alineadores_entregas.caso_id AND c.cliente_user_id = auth.uid())
  );

-- Al crear: número de revisión calculado en el servidor y campos de respuesta en blanco (no se pueden falsear)
CREATE OR REPLACE FUNCTION public.aln_entregas_antes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.etapa NOT IN ('viabilidad','planificacion') THEN NEW.etapa := 'planificacion'; END IF;
  SELECT count(*) INTO NEW.revision_num FROM public.alineadores_entregas
    WHERE caso_id = NEW.caso_id AND etapa = NEW.etapa;
  NEW.negocio := 'prodigy';
  NEW.estado := 'enviado';
  NEW.observacion_cliente := NULL;
  NEW.respondido_at := NULL;
  NEW.created_by := auth.uid();
  RETURN NEW;
END;$$;
DROP TRIGGER IF EXISTS trg_aln_entregas_antes ON public.alineadores_entregas;
CREATE TRIGGER trg_aln_entregas_antes BEFORE INSERT ON public.alineadores_entregas
  FOR EACH ROW EXECUTE FUNCTION public.aln_entregas_antes();

-- Al crear: aviso al cliente en su campana
CREATE OR REPLACE FUNCTION public.aln_entregas_aviso_cliente()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _c record;
BEGIN
  SELECT paciente, codigo, cliente_user_id INTO _c FROM public.alineadores_casos WHERE id = NEW.caso_id;
  IF _c.cliente_user_id IS NOT NULL THEN
    INSERT INTO public.notificaciones_internas
      (tipo, prioridad, destinatario_rol, destinatario_user_id, titulo, mensaje, pedido_codigo, accion_url, leida_por)
    VALUES ('aln_entrega', 'alta', 'client', _c.cliente_user_id,
            CASE WHEN NEW.etapa = 'viabilidad' THEN 'Viabilidad lista' ELSE 'Planificación lista' END
              || CASE WHEN NEW.revision_num > 0 THEN ' (revisión ' || NEW.revision_num || ')' ELSE '' END,
            'Paciente ' || _c.paciente || ': revísala y apruébala o pide cambios.',
            _c.codigo, '/app/facturacion-alineadores.html#casos', '{}');
  END IF;
  RETURN NEW;
END;$$;
DROP TRIGGER IF EXISTS trg_aln_entregas_aviso ON public.alineadores_entregas;
CREATE TRIGGER trg_aln_entregas_aviso AFTER INSERT ON public.alineadores_entregas
  FOR EACH ROW EXECUTE FUNCTION public.aln_entregas_aviso_cliente();

-- El cliente responde (aprobar / pedir cambios) SOLO por aquí
CREATE OR REPLACE FUNCTION public.aln_entrega_responder(p_entrega_id uuid, p_aprobar boolean, p_observacion text DEFAULT null)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _e record; _c record; _obs text := left(COALESCE(p_observacion,''), 2000);
BEGIN
  SELECT * INTO _e FROM public.alineadores_entregas WHERE id = p_entrega_id;
  IF _e.id IS NULL THEN RETURN json_build_object('ok',false,'error','La entrega no existe'); END IF;
  SELECT id, paciente, codigo, estado, cliente_user_id INTO _c FROM public.alineadores_casos WHERE id = _e.caso_id;

  IF _c.cliente_user_id IS DISTINCT FROM auth.uid()
     AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') NOT IN ('admin','operator','contabilidad')
     AND COALESCE(auth.jwt() ->> 'email','') NOT IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  THEN RETURN json_build_object('ok',false,'error','No autorizado'); END IF;

  IF _e.estado <> 'enviado' THEN RETURN json_build_object('ok',false,'error','Esta entrega ya fue respondida'); END IF;
  IF NOT p_aprobar AND length(trim(_obs)) < 3 THEN
    RETURN json_build_object('ok',false,'error','Escribe qué cambios necesitas');
  END IF;

  UPDATE public.alineadores_entregas
     SET estado = CASE WHEN p_aprobar THEN 'aprobado' ELSE 'cambios' END,
         observacion_cliente = NULLIF(trim(_obs),''), respondido_at = now()
   WHERE id = p_entrega_id;

  -- Avanza el caso al aprobar
  IF p_aprobar AND _e.etapa = 'viabilidad' AND _c.estado = 'valoracion' THEN
    UPDATE public.alineadores_casos SET estado = 'planificacion' WHERE id = _c.id;
  ELSIF p_aprobar AND _e.etapa = 'planificacion' AND _c.estado IN ('valoracion','planificacion') THEN
    UPDATE public.alineadores_casos SET estado = 'en_tratamiento' WHERE id = _c.id;
  END IF;

  -- Aviso a la técnica (campana)
  INSERT INTO public.notificaciones_internas
    (tipo, prioridad, destinatario_rol, titulo, mensaje, pedido_codigo, accion_url, leida_por)
  VALUES ('aln_respuesta', CASE WHEN p_aprobar THEN 'media' ELSE 'alta' END, 'alineadores',
          CASE WHEN p_aprobar THEN '✅ Aprobada: ' ELSE '✏️ Cambios pedidos: ' END || _e.etapa || ' · ' || _c.paciente,
          COALESCE(NULLIF(trim(_obs),''), CASE WHEN _e.etapa='planificacion' THEN 'Enviar modelos a impresión.' ELSE 'Seguir con la planificación.' END),
          _c.codigo, '/app/alineadores.html', '{}');

  IF NOT p_aprobar AND _e.etapa = 'planificacion' AND _e.revision_num >= 2 THEN
    RETURN json_build_object('ok',true,'estado','cambios','aviso','Ya se usaron las 2 revisiones incluidas: esta replaneación puede tener costo adicional.');
  END IF;
  RETURN json_build_object('ok',true,'estado', CASE WHEN p_aprobar THEN 'aprobado' ELSE 'cambios' END);
END;$$;
REVOKE ALL ON FUNCTION public.aln_entrega_responder(uuid,boolean,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aln_entrega_responder(uuid,boolean,text) TO authenticated;

-- ── 3) Bucket privado de entregas (100 MB por archivo) ───────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('alineadores-entregas', 'alineadores-entregas', false, 104857600, NULL)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 104857600;

DROP POLICY IF EXISTS "aln_entregas_sube" ON storage.objects;
CREATE POLICY "aln_entregas_sube" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'alineadores-entregas'
    AND name ~* '\.(mp4|mov|webm|m4v|pdf|jpe?g|png|webp|gif|zip|stl|ply)$'
    AND (
      COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad','alineadores')
      OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles','[]'::jsonb) ?| ARRAY['alineadores']
      OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'))
  );
DROP POLICY IF EXISTS "aln_entregas_lee" ON storage.objects;
CREATE POLICY "aln_entregas_lee" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'alineadores-entregas'
    AND (
      COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad','secretaria','alineadores')
      OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles','[]'::jsonb) ?| ARRAY['alineadores']
      OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
      OR EXISTS (SELECT 1 FROM public.alineadores_casos c
                 WHERE c.id::text = (storage.foldername(name))[1] AND c.cliente_user_id = auth.uid()))
  );
DROP POLICY IF EXISTS "aln_entregas_borra_archivo" ON storage.objects;
CREATE POLICY "aln_entregas_borra_archivo" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'alineadores-entregas'
    AND (
      COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad','alineadores')
      OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles','[]'::jsonb) ?| ARRAY['alineadores']
      OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'))
  );

-- ── 4) Caso nuevo → aviso a la técnica ───────────────────────────
CREATE OR REPLACE FUNCTION public.aln_casos_aviso_tecnica()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notificaciones_internas
    (tipo, prioridad, destinatario_rol, titulo, mensaje, pedido_codigo, accion_url, leida_por)
  VALUES ('nuevo_caso', 'alta', 'alineadores',
          '😁 Caso nuevo para valoración',
          'Paciente ' || NEW.paciente || COALESCE(' · ' || NEW.cliente, '') || '. Revisa los archivos y sube la viabilidad.',
          NEW.codigo, '/app/alineadores.html', '{}');
  RETURN NEW;
END;$$;
DROP TRIGGER IF EXISTS trg_aln_casos_aviso_tecnica ON public.alineadores_casos;
CREATE TRIGGER trg_aln_casos_aviso_tecnica AFTER INSERT ON public.alineadores_casos
  FOR EACH ROW EXECUTE FUNCTION public.aln_casos_aviso_tecnica();

SELECT 'Alineadores fase 2 lista: entregas + aprobaciones + avisos + comisión por cliente' AS status;
