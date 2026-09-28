-- ================================================================
-- PRODIGY — Alineadores: CANCELAR en la primera hora + AVISOS por WhatsApp (CallMeBot)
-- Requiere: sql/alineadores-fase2-2026.sql ya corrido. 100% IDEMPOTENTE.
-- Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- ── 1) Cancelación por el cliente: máximo 1 HORA después de subir el caso ──
--    (después la técnica pudo iniciar el trabajo y se cobra). Solo si aún no hay entregas.
--    Borra los cargos pendientes de valoración (cliente y técnica) y avisa a la técnica.
CREATE OR REPLACE FUNCTION public.aln_cancelar_caso(p_caso_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _c record; _min int;
BEGIN
  SELECT * INTO _c FROM public.alineadores_casos WHERE id = p_caso_id;
  IF _c.id IS NULL THEN RETURN json_build_object('ok',false,'error','El caso no existe'); END IF;
  IF _c.cliente_user_id IS DISTINCT FROM auth.uid()
     AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') NOT IN ('admin','operator','contabilidad')
     AND COALESCE(auth.jwt() ->> 'email','') NOT IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  THEN RETURN json_build_object('ok',false,'error','No autorizado'); END IF;
  IF _c.estado = 'cancelado' THEN RETURN json_build_object('ok',false,'error','El caso ya estaba cancelado'); END IF;
  _min := floor(EXTRACT(EPOCH FROM (now() - _c.created_at)) / 60);
  IF _c.estado <> 'valoracion' OR _min > 60 THEN
    RETURN json_build_object('ok',false,'error','Pasó la hora para cancelar: la técnica ya pudo iniciar el trabajo. Escríbenos por WhatsApp.');
  END IF;
  IF EXISTS (SELECT 1 FROM public.alineadores_entregas WHERE caso_id = p_caso_id) THEN
    RETURN json_build_object('ok',false,'error','La técnica ya envió una entrega de este caso: ya no se puede cancelar.');
  END IF;
  DELETE FROM public.alineadores_cargos WHERE caso_id = p_caso_id AND estado_pago = 'pendiente';
  UPDATE public.alineadores_casos
     SET estado = 'cancelado', notas = COALESCE(notas,'') || ' · Cancelado por el cliente ' || to_char(now() AT TIME ZONE 'America/Bogota','DD/MM HH24:MI')
   WHERE id = p_caso_id;
  INSERT INTO public.notificaciones_internas (tipo, prioridad, destinatario_rol, titulo, mensaje, pedido_codigo, accion_url, leida_por)
  VALUES ('estado_cambio','alta','alineadores','🛑 Caso cancelado por el cliente',
          'Paciente ' || _c.paciente || ': no lo trabajes (cancelado a los ' || _min || ' min).', _c.codigo, '/app/alineadores.html', '{}');
  RETURN json_build_object('ok',true);
END;$$;
REVOKE ALL ON FUNCTION public.aln_cancelar_caso(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aln_cancelar_caso(uuid) TO authenticated;

-- ── 2) Avisos por WhatsApp (CallMeBot) a la técnica y a cada cliente ──
--    Guarda número + API key de CallMeBot de cada persona. Solo admin lee/escribe (las keys son privadas);
--    la función del servidor las usa con la clave de servicio.
CREATE TABLE IF NOT EXISTS public.alineadores_avisos_wa (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rol        text NOT NULL CHECK (rol IN ('tecnica','cliente')),
  user_id    uuid,                              -- cuenta del cliente (para enviarle SUS avisos)
  nombre     text NOT NULL,
  whatsapp   text NOT NULL,                     -- con indicativo, solo números (ej. 18095551234)
  apikey     text NOT NULL,                     -- la que responde CallMeBot
  activo     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.alineadores_avisos_wa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_avisos_wa" ON public.alineadores_avisos_wa;
CREATE POLICY "admin_avisos_wa" ON public.alineadores_avisos_wa
  FOR ALL TO authenticated
  USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator')
    OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'))
  WITH CHECK (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator')
    OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'));

SELECT 'Cancelación 1 h + avisos WhatsApp listos' AS status;
