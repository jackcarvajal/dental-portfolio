-- ═══════════════════════════════════════════════════════════════════════════════════════════════════
-- IA DEL SITIO: registro ANÓNIMO de preguntas + base de conocimiento aprobada por el equipo  (oct-2026)
-- ═══════════════════════════════════════════════════════════════════════════════════════════════════
-- Problema: la IA de las webs (chat, orbe de Preguntas, buscador) no aprende: cada respuesta sale solo del texto
-- fijo de header.js y lo que preguntan los doctores se pierde.
--
-- Regla de negocio (Alejandro, 6-oct-2026):
--   · Se guardan las preguntas y respuestas SIN datos personales: sin IP, sin usuario, sin correo ni teléfono
--     (el servidor los borra del texto antes de guardar). Aviso visible: «no escribas datos de pacientes».
--   · La IA NO aprende sola: el equipo revisa las preguntas en app/ia-conocimiento.html y las convierte en
--     «respuestas oficiales». Solo esas (activas) alimentan a la IA, con prioridad sobre el texto fijo.
--   · Tablas compartidas PRODIGY / Alejandro, separadas por la columna negocio.
--   · Solo el servidor (functions/api/gemini.js con service_role) escribe el registro; solo admin lo lee.
--
-- 100 % IDEMPOTENTE — se puede correr varias veces.   Copiar TODO → SQL Editor → Run.
-- ═══════════════════════════════════════════════════════════════════════════════════════════════════

-- 1) Registro anónimo de preguntas
CREATE TABLE IF NOT EXISTS public.ia_preguntas (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  negocio     text        NOT NULL CHECK (negocio IN ('prodigy','alejandrocadcam')),
  pregunta    text        NOT NULL CHECK (char_length(pregunta) <= 500),
  respuesta   text                 CHECK (char_length(respuesta) <= 4000),
  pagina      text                 CHECK (char_length(pagina) <= 200),
  canal       text                 CHECK (canal IN ('chat','orbe','buscador')),
  revisada    boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ia_preguntas_negocio_fecha_idx ON public.ia_preguntas (negocio, created_at DESC);

-- 2) Base de conocimiento: respuestas oficiales aprobadas por el equipo
CREATE TABLE IF NOT EXISTS public.ia_conocimiento (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  negocio         text        NOT NULL CHECK (negocio IN ('prodigy','alejandrocadcam','ambos')),
  pregunta        text        NOT NULL CHECK (char_length(pregunta) BETWEEN 5 AND 300),
  respuesta       text        NOT NULL CHECK (char_length(respuesta) BETWEEN 5 AND 2000),
  palabras_clave  text                 CHECK (char_length(palabras_clave) <= 300),
  activo          boolean     NOT NULL DEFAULT true,
  veces_usada     integer     NOT NULL DEFAULT 0,
  creado_por      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ia_conocimiento_negocio_activo_idx ON public.ia_conocimiento (negocio, activo);

CREATE OR REPLACE FUNCTION public.ia_conocimiento_touch() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS ia_conocimiento_touch ON public.ia_conocimiento;
CREATE TRIGGER ia_conocimiento_touch BEFORE UPDATE ON public.ia_conocimiento
  FOR EACH ROW EXECUTE FUNCTION public.ia_conocimiento_touch();

-- 3) Seguridad: RLS + permisos explícitos. Anónimo: nada. Admin del laboratorio: leer/editar. Servidor: todo.
ALTER TABLE public.ia_preguntas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_conocimiento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ia_preguntas_admin_select ON public.ia_preguntas;
CREATE POLICY ia_preguntas_admin_select ON public.ia_preguntas FOR SELECT TO authenticated USING (public.es_admin_lab());
DROP POLICY IF EXISTS ia_preguntas_admin_update ON public.ia_preguntas;
CREATE POLICY ia_preguntas_admin_update ON public.ia_preguntas FOR UPDATE TO authenticated USING (public.es_admin_lab()) WITH CHECK (public.es_admin_lab());
DROP POLICY IF EXISTS ia_preguntas_admin_delete ON public.ia_preguntas;
CREATE POLICY ia_preguntas_admin_delete ON public.ia_preguntas FOR DELETE TO authenticated USING (public.es_admin_lab());

DROP POLICY IF EXISTS ia_conocimiento_admin_all ON public.ia_conocimiento;
CREATE POLICY ia_conocimiento_admin_all ON public.ia_conocimiento FOR ALL TO authenticated USING (public.es_admin_lab()) WITH CHECK (public.es_admin_lab());

REVOKE ALL ON public.ia_preguntas, public.ia_conocimiento FROM PUBLIC, anon;
GRANT SELECT, UPDATE, DELETE ON public.ia_preguntas TO authenticated;          -- y la RLS solo deja al admin
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ia_conocimiento TO authenticated;
GRANT ALL ON public.ia_preguntas, public.ia_conocimiento TO service_role;
REVOKE ALL ON FUNCTION public.ia_conocimiento_touch() FROM PUBLIC, anon, authenticated;

-- 4) Contador de uso (lo llama el servidor cuando una respuesta oficial se usó)
CREATE OR REPLACE FUNCTION public.ia_conocimiento_usada(p_ids bigint[]) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.ia_conocimiento SET veces_usada = veces_usada + 1 WHERE id = ANY (p_ids);
$$;
REVOKE ALL ON FUNCTION public.ia_conocimiento_usada(bigint[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ia_conocimiento_usada(bigint[]) TO service_role;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────────────────────────────────────
-- Esperado: tablas_ok = 2 · rls_ok = 2 · anon_puede_leer = false (las dos) · admin_policies = 4
SELECT
  (SELECT count(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('ia_preguntas','ia_conocimiento'))              AS tablas_ok,
  (SELECT count(*) FROM pg_class WHERE relname IN ('ia_preguntas','ia_conocimiento') AND relrowsecurity)                        AS rls_ok,
  has_table_privilege('anon', 'public.ia_preguntas', 'SELECT')                                                                  AS anon_puede_leer_preguntas,
  has_table_privilege('anon', 'public.ia_conocimiento', 'SELECT')                                                               AS anon_puede_leer_conocimiento,
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('ia_preguntas','ia_conocimiento'))            AS admin_policies;
