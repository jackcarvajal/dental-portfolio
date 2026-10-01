-- ================================================================
-- PRODIGY — BANDEJA DE WHATSAPP (avisos al doctor en cola para la secretaria)
-- Antes: el aviso por WhatsApp dependía de que cada operario abriera su propio WhatsApp desde su panel, y
-- solo diseño y operación lo hacían (fresado, calidad, despacho y reparto nunca avisaban).
-- Ahora: cada vez que un caso de PRODIGY cambia a un estado que el doctor debe saber, queda un aviso en
-- cola. La secretaria los envía desde app/bandeja-whatsapp.html con el WhatsApp de PRODIGY (o salen solos
-- cuando se conecte la API oficial: docs/WHATSAPP-OFICIAL.md).
-- El texto del mensaje NO se guarda aquí: lo arma /api/notify-wa (una sola fuente de los textos).
-- Requiere haber corrido antes sql/storage-permisos-2026.sql (crea es_admin_lab()).
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================
DO $$ BEGIN
  IF to_regprocedure('public.es_admin_lab()') IS NULL THEN
    RAISE EXCEPTION 'Corre primero sql/storage-permisos-2026.sql';
  END IF;
END $$;

-- 1) La cola
CREATE TABLE IF NOT EXISTS public.avisos_whatsapp (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pedido_id    uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  negocio      text NOT NULL DEFAULT 'prodigy',
  estado       text NOT NULL,                     -- estado_operativo que disparó el aviso
  estado_envio text NOT NULL DEFAULT 'pendiente'
               CHECK (estado_envio IN ('pendiente','enviado','descartado','reemplazado')),
  metodo       text CHECK (metodo IN ('manual','oficial')),
  enviado_at   timestamptz,
  enviado_por  uuid,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_avisos_wa_cola ON public.avisos_whatsapp (negocio, estado_envio, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_avisos_wa_pedido ON public.avisos_whatsapp (pedido_id);

-- 2) Quién la ve y la mueve: administración, operación y secretaría (roles de app_metadata)
CREATE OR REPLACE FUNCTION public.es_bandeja_wa() RETURNS boolean
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT public.es_admin_lab()
      OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') = ANY (ARRAY['operator','secretaria']), false)
      OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ?| ARRAY['operator','secretaria'];
$$;
GRANT EXECUTE ON FUNCTION public.es_bandeja_wa() TO authenticated;

ALTER TABLE public.avisos_whatsapp ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "avisos_wa_equipo_lee" ON public.avisos_whatsapp;
CREATE POLICY "avisos_wa_equipo_lee" ON public.avisos_whatsapp FOR SELECT TO authenticated USING (public.es_bandeja_wa());
DROP POLICY IF EXISTS "avisos_wa_equipo_marca" ON public.avisos_whatsapp;
CREATE POLICY "avisos_wa_equipo_marca" ON public.avisos_whatsapp FOR UPDATE TO authenticated
  USING (public.es_bandeja_wa()) WITH CHECK (public.es_bandeja_wa());
REVOKE ALL ON public.avisos_whatsapp FROM anon;
GRANT SELECT, UPDATE ON public.avisos_whatsapp TO authenticated;

-- 3) Encolar al cambiar de estado (solo PRODIGY, sin casos de prueba). Un aviso pendiente anterior del
--    mismo caso queda «reemplazado»: al doctor solo le llega lo último.
CREATE OR REPLACE FUNCTION public.encolar_aviso_whatsapp() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _e text := upper(trim(COALESCE(NEW.estado_operativo, '')));
BEGIN
  IF _e = upper(trim(COALESCE(OLD.estado_operativo, ''))) THEN RETURN NEW; END IF;
  IF _e NOT IN ('ERROR_STL','EN_DISENO','REVISION_CLIENTE','CAMBIOS_SOLICITADOS','EN_PRODUCCION','FRESADO_INICIADO',
                'EN_IMPRESION','QA_APROBADO','LISTO_DESPACHAR','EN_REPARTO','ENTREGADO') THEN RETURN NEW; END IF;
  IF COALESCE(NEW.negocio, 'prodigy') <> 'prodigy' OR COALESCE(NEW.es_prueba, false) THEN RETURN NEW; END IF;
  UPDATE public.avisos_whatsapp SET estado_envio = 'reemplazado'
   WHERE pedido_id = NEW.id AND estado_envio = 'pendiente';
  INSERT INTO public.avisos_whatsapp (pedido_id, negocio, estado) VALUES (NEW.id, 'prodigy', _e);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_encolar_aviso_whatsapp ON public.pedidos;
CREATE TRIGGER trg_encolar_aviso_whatsapp AFTER UPDATE OF estado_operativo ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.encolar_aviso_whatsapp();

-- Verificación: la cola existe y está vacía al empezar (no se encolan casos viejos)
SELECT 'avisos_whatsapp' AS tabla, count(*) AS avisos,
       (SELECT count(*) FROM pg_trigger WHERE tgname = 'trg_encolar_aviso_whatsapp') AS trigger_activo
  FROM public.avisos_whatsapp;
