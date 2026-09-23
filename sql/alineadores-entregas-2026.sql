-- ================================================================
-- PRODIGY — Alineadores: entregas de Mayra ↔ aprobación del cliente
-- Mayra sube video/PDF/imágenes por caso (viabilidad o planificación).
-- El cliente aprueba o deja observaciones (2 revisiones en planificación).
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- Requiere: sql/alineadores-portal-cliente-2026.sql corrido.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.alineadores_entregas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio             text NOT NULL DEFAULT 'prodigy',
  caso_id             uuid REFERENCES public.alineadores_casos(id) ON DELETE CASCADE,
  etapa               text NOT NULL DEFAULT 'planificacion',  -- viabilidad | planificacion
  archivos            text[] NOT NULL DEFAULT '{}',            -- rutas en bucket 'alineadores-entregas'
  nota_mayra          text,
  estado              text NOT NULL DEFAULT 'enviado',         -- enviado | aprobado | cambios
  observacion_cliente text,
  revision_num        int NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  respondido_at       timestamptz
);
CREATE INDEX IF NOT EXISTS idx_aln_entregas_caso ON public.alineadores_entregas(caso_id, created_at DESC);
ALTER TABLE public.alineadores_entregas ENABLE ROW LEVEL SECURITY;

-- Staff (incl. Mayra=diseno) gestiona todo
DROP POLICY IF EXISTS "staff_all_aln_entregas" ON public.alineadores_entregas;
CREATE POLICY "staff_all_aln_entregas" ON public.alineadores_entregas
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','diseno','secretaria')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','diseno','secretaria')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

-- Cliente LEE las entregas de SUS casos
DROP POLICY IF EXISTS "cliente_lee_sus_entregas" ON public.alineadores_entregas;
CREATE POLICY "cliente_lee_sus_entregas" ON public.alineadores_entregas
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.alineadores_casos c
                 WHERE c.id = alineadores_entregas.caso_id AND c.cliente_user_id = auth.uid()));

-- Cliente responde (aprobar / pedir cambios) SOLO por RPC (no UPDATE directo)
CREATE OR REPLACE FUNCTION public.aln_entrega_responder(p_entrega_id uuid, p_aprobar boolean, p_observacion text DEFAULT null)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _cid uuid; _etapa text; _rev int; _owner uuid; _rol text;
BEGIN
  SELECT e.caso_id, e.etapa, e.revision_num, c.cliente_user_id
    INTO _cid,_etapa,_rev,_owner
    FROM public.alineadores_entregas e
    JOIN public.alineadores_casos c ON c.id = e.caso_id
    WHERE e.id = p_entrega_id;
  IF _cid IS NULL THEN RETURN json_build_object('ok',false,'error','Entrega no existe'); END IF;

  _rol := COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','');
  IF _owner IS DISTINCT FROM auth.uid()
     AND _rol NOT IN ('admin','operator','contabilidad')
     AND (auth.jwt() ->> 'email') NOT IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  THEN RETURN json_build_object('ok',false,'error','No autorizado'); END IF;

  IF p_aprobar THEN
    UPDATE public.alineadores_entregas
      SET estado='aprobado', observacion_cliente=p_observacion, respondido_at=now()
      WHERE id = p_entrega_id;
    RETURN json_build_object('ok',true,'estado','aprobado');
  ELSE
    UPDATE public.alineadores_entregas
      SET estado='cambios', observacion_cliente=p_observacion, revision_num=_rev+1, respondido_at=now()
      WHERE id = p_entrega_id;
    IF _etapa='planificacion' AND _rev+1 > 2 THEN
      RETURN json_build_object('ok',true,'estado','cambios','revision',_rev+1,'aviso','Supera las 2 revisiones incluidas — puede aplicar costo adicional.');
    END IF;
    RETURN json_build_object('ok',true,'estado','cambios','revision',_rev+1);
  END IF;
END;$$;
REVOKE ALL ON FUNCTION public.aln_entrega_responder(uuid,boolean,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.aln_entrega_responder(uuid,boolean,text) TO authenticated;

-- ── Bucket (crear en Dashboard → Storage → New bucket) ──
--   Nombre: alineadores-entregas  · Público: NO
--   INSERT para staff (Mayra sube) · SELECT para staff y el cliente dueño (URL firmada).

SELECT 'alineadores_entregas + RLS + RPC responder listos' AS status;
