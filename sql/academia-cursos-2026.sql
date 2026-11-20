-- ════════════════════════════════════════════════════════════════════════════
-- MI ACADEMIA · cursos en línea de Alejandro CAD/CAM (fase 1)
-- ════════════════════════════════════════════════════════════════════════════
-- Para qué: área de alumnos en alejandrocadcam.com/app/mi-academia.html. La Academia es marca de ALEJANDRO
-- (educacion@), por eso negocio = 'alejandrocadcam' por defecto. PRODIGY no la usa.
--
-- Reglas de negocio (19-nov-2026):
--   · Los videos y los recursos (STL, RAR, PDF…) viven en un bucket R2 PRIVADO (academia-videos). La base solo
--     guarda el nombre del archivo (video_key / recursos[].key) y NUNCA lo entrega al navegador: lo lee la
--     Function /api/academia-video con service_role.
--   · Solo un alumno con inscripción ACTIVA ve las clases y baja los recursos. Las clases «es_muestra» se pueden
--     ver con sesión iniciada aunque no esté inscrito (clase gratis de prueba).
--   · Inscripción MANUAL por el administrador (pago por Wise / PayPal por fuera, como los planes de créditos).
--   · Precio del curso OPCIONAL (COP / USD / precio anterior tachado): los cursos SÍ muestran precio (excepción
--     del dueño a la regla «sin precios en español», solo para la Academia). Sin precio = «Reservar cupo».
--   · Clases agrupadas por módulo (modulo_orden + modulo_titulo en la misma tabla: sin tabla de módulos).
--   · Calificación: una por alumno y curso (1 a 5 estrellas + comentario), solo con inscripción activa.
--     Lo PÚBLICO (20-nov-2026) es solo el promedio y el número de calificaciones de cada curso publicado
--     (academia_calificaciones_publicas, para las estrellas de /curso y la ficha Course de Google). Nunca quién
--     calificó ni el comentario: eso lo escribió el alumno en su área privada y solo lo ve el admin.
--   · Comunidad (p. ej. grupo de WhatsApp): comunidad_url solo la ven los inscritos (permiso por columna).
--   · Certificado digital: se emite al 100 % de las clases publicadas vistas y queda fijo (nombre, horas, fecha):
--     si después se agregan clases, el certificado ya emitido sigue valiendo. Anular la inscripción lo invalida.
--   · Verificación pública: alejandrocadcam.com/verificar-certificado?codigo=AC-XXXX-XXXX-XXXX (RPC para anon que
--     devuelve SOLO nombre, curso, horas y fecha; nunca el correo).
--   · Retracto (20-nov-2026): primer_acceso_at = la 1.ª vez que el alumno pidió el video o un recurso de una clase
--     que NO es de muestra (lo fija /api/academia-video-token). Vacío = no ha abierto ninguna clase → retracto al 100 %
--     (Ley 1480 art. 47). Lo ve el admin en la lista de alumnos.
--
-- Diseño:
--   · academia_cursos         catálogo (slug único, nivel, software, instructor, precio opcional, comunidad).
--   · academia_lecciones      clases (módulo, orden, video_key, duración, recursos, es_muestra, publicado).
--   · academia_inscripciones  quién tiene acceso (activa | anulada), origen y referencia del pago.
--   · academia_progreso       qué clase completó cada alumno (una fila por alumno y clase).
--   · academia_resenas        calificación de cada alumno a cada curso.
--   · El navegador SOLO lee (RLS). Todo lo que escribe pasa por RPC SECURITY DEFINER que revisa sesión,
--     inscripción o es_admin_lab() (roles por app_metadata / lista de correos; nunca user_metadata).
--   · Permisos por columna: anon y authenticated NO pueden leer video_key, recursos ni comunidad_url. El alumno
--     recibe recursos (sin key) y comunidad con academia_curso_detalle(); el admin, con academia_admin_*().
--
-- Después de correrlo: el front (app/mi-academia.html, app/certificado-academia.html, la pestaña «Academia» de
-- app/admin-panel.html y el bloque «Cursos disponibles» de academia.html, repo de Alejandro) deja de mostrar
-- «la academia se está preparando».
--
-- 100 % IDEMPOTENTE · Copiar TODO → SQL Editor → Run
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Tablas ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.academia_cursos (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio                  text NOT NULL DEFAULT 'alejandrocadcam' CHECK (negocio IN ('prodigy','alejandrocadcam')),
  slug                     text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) <= 80),
  titulo                   text NOT NULL CHECK (length(btrim(titulo)) BETWEEN 3 AND 160),
  descripcion              text CHECK (descripcion IS NULL OR length(descripcion) <= 2000),
  nivel                    text NOT NULL DEFAULT 'basico' CHECK (nivel IN ('basico','intermedio','avanzado')),
  software                 text CHECK (software IS NULL OR length(software) <= 80),
  instructor               text NOT NULL DEFAULT 'Alejandro Carvajal' CHECK (length(instructor) <= 120),
  instructor_especialidad  text CHECK (instructor_especialidad IS NULL OR length(instructor_especialidad) <= 160),
  portada_url              text CHECK (portada_url IS NULL OR portada_url ~ '^(https://|/[^/])'),
  horas_certificado        numeric(5,1) CHECK (horas_certificado IS NULL OR horas_certificado > 0),   -- vacío = suma de las clases
  precio_cop               integer CHECK (precio_cop IS NULL OR precio_cop > 0),
  precio_usd               numeric(10,2) CHECK (precio_usd IS NULL OR precio_usd > 0),
  precio_antes_cop         integer CHECK (precio_antes_cop IS NULL OR precio_antes_cop > 0),            -- se muestra tachado
  comunidad_url            text CHECK (comunidad_url IS NULL OR comunidad_url ~ '^https://'),           -- solo inscritos
  publicado                boolean NOT NULL DEFAULT false,
  orden                    integer NOT NULL DEFAULT 0,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS academia_cursos_negocio_idx ON public.academia_cursos (negocio, publicado, orden);

CREATE TABLE IF NOT EXISTS public.academia_lecciones (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id       uuid NOT NULL REFERENCES public.academia_cursos(id) ON DELETE CASCADE,
  modulo_orden   integer NOT NULL DEFAULT 1,
  modulo_titulo  text CHECK (modulo_titulo IS NULL OR length(modulo_titulo) <= 160),
  orden          integer NOT NULL DEFAULT 0,
  titulo         text NOT NULL CHECK (length(btrim(titulo)) BETWEEN 2 AND 160),
  descripcion    text CHECK (descripcion IS NULL OR length(descripcion) <= 2000),
  video_key      text CHECK (video_key IS NULL OR (length(video_key) BETWEEN 1 AND 300 AND video_key !~ '(^/|\.\.|[[:cntrl:]])')),
  duracion_seg   integer NOT NULL DEFAULT 0 CHECK (duracion_seg BETWEEN 0 AND 36000),
  recursos       jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(recursos) = 'array'),   -- [{nombre, key, bytes}]
  es_muestra     boolean NOT NULL DEFAULT false,
  publicado      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS academia_lecciones_curso_idx ON public.academia_lecciones (curso_id, modulo_orden, orden);

CREATE TABLE IF NOT EXISTS public.academia_inscripciones (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id            uuid NOT NULL REFERENCES public.academia_cursos(id) ON DELETE RESTRICT,   -- un curso con alumnos no se borra
  alumno_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  estado              text NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa','anulada')),
  origen              text NOT NULL DEFAULT 'manual' CHECK (origen IN ('manual','wise','paypal','transferencia','cortesia','otro')),
  referencia_pago     text CHECK (referencia_pago IS NULL OR length(referencia_pago) <= 200),
  nombre_certificado  text CHECK (nombre_certificado IS NULL OR length(nombre_certificado) <= 120),   -- vacío = nombre del perfil
  inscrito_por        uuid,
  certificado_at      timestamptz,                    -- fecha de finalización; se fija la 1.ª vez que se emite y no cambia
  certificado_nombre  text,                           -- nombre impreso (copia fija para la verificación pública)
  certificado_horas   numeric(5,1),
  anulada_at          timestamptz,
  anulada_motivo      text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (curso_id, alumno_id)
);
-- Tabla ya creada en una corrida anterior: la columna nueva se agrega aparte (20-nov-2026, ver «Retracto» arriba).
ALTER TABLE public.academia_inscripciones ADD COLUMN IF NOT EXISTS primer_acceso_at timestamptz;
CREATE INDEX IF NOT EXISTS academia_inscripciones_alumno_idx ON public.academia_inscripciones (alumno_id, estado);
-- Búsqueda del código de verificación (AC-XXXX-XXXX-XXXX = 12 primeros hex de md5('academia:' || id)).
CREATE INDEX IF NOT EXISTS academia_inscripciones_codigo_idx
  ON public.academia_inscripciones ((upper(substr(md5('academia:' || id::text), 1, 12))));

CREATE TABLE IF NOT EXISTS public.academia_progreso (
  alumno_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leccion_id     uuid NOT NULL REFERENCES public.academia_lecciones(id) ON DELETE CASCADE,
  completada_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (alumno_id, leccion_id)
);
CREATE INDEX IF NOT EXISTS academia_progreso_leccion_idx ON public.academia_progreso (leccion_id);
CREATE INDEX IF NOT EXISTS academia_progreso_fecha_idx ON public.academia_progreso (alumno_id, completada_at);

CREATE TABLE IF NOT EXISTS public.academia_resenas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id    uuid NOT NULL REFERENCES public.academia_cursos(id) ON DELETE CASCADE,
  alumno_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estrellas   smallint NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
  comentario  text CHECK (comentario IS NULL OR length(comentario) <= 1000),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (curso_id, alumno_id)
);
CREATE INDEX IF NOT EXISTS academia_resenas_alumno_idx ON public.academia_resenas (alumno_id);

-- ── 2. Función de apoyo (la usa RLS) ────────────────────────────────────────
-- ¿El usuario de la sesión tiene inscripción ACTIVA en el curso?
CREATE OR REPLACE FUNCTION public.academia_inscrito(p_curso uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM academia_inscripciones i
     WHERE i.curso_id = p_curso AND i.alumno_id = auth.uid() AND i.estado = 'activa');
$$;

-- ── 3. RPC para el alumno ───────────────────────────────────────────────────
-- Mis cursos activos con su avance (solo cuenta clases publicadas).
DROP FUNCTION IF EXISTS public.academia_mis_cursos(text);
CREATE FUNCTION public.academia_mis_cursos(p_negocio text DEFAULT 'alejandrocadcam')
RETURNS TABLE (curso_id uuid, slug text, titulo text, descripcion text, nivel text, software text, instructor text,
               portada_url text, lecciones integer, completadas integer, porcentaje integer, duracion_seg integer,
               inscrito_at timestamptz, ultima_actividad timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sesión requerida'; END IF;
  RETURN QUERY
    SELECT c.id, c.slug, c.titulo, c.descripcion, c.nivel, c.software, c.instructor, c.portada_url,
           COALESCE(a.total, 0)::int, COALESCE(a.hechas, 0)::int,
           CASE WHEN COALESCE(a.total, 0) = 0 THEN 0 ELSE floor(100.0 * a.hechas / a.total)::int END,
           COALESCE(a.segundos, 0)::int, i.created_at, a.ultima
      FROM academia_inscripciones i
      JOIN academia_cursos c ON c.id = i.curso_id
      LEFT JOIN LATERAL (
        SELECT count(*) AS total, count(p.leccion_id) AS hechas, sum(l.duracion_seg) AS segundos, max(p.completada_at) AS ultima
          FROM academia_lecciones l
          LEFT JOIN academia_progreso p ON p.leccion_id = l.id AND p.alumno_id = v_uid
         WHERE l.curso_id = c.id AND l.publicado
      ) a ON true
     WHERE i.alumno_id = v_uid AND i.estado = 'activa' AND c.negocio = p_negocio
     ORDER BY a.ultima DESC NULLS LAST, c.orden, c.titulo;
END $$;

-- Un curso para la página del alumno: datos, clases (con módulo, «vista» y recursos SIN key), inscripción y su
-- calificación. p_ref = id o slug. NULL si el curso no existe o no está publicado (salvo inscrito o admin).
CREATE OR REPLACE FUNCTION public.academia_curso_detalle(p_ref text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_c public.academia_cursos%ROWTYPE; v_ins boolean; v_admin boolean; v_lec jsonb; v_res jsonb;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sesión requerida'; END IF;
  IF p_ref ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    SELECT * INTO v_c FROM academia_cursos WHERE id = p_ref::uuid;
  ELSE
    SELECT * INTO v_c FROM academia_cursos WHERE slug = lower(btrim(p_ref));
  END IF;
  IF v_c.id IS NULL THEN RETURN NULL; END IF;
  v_admin := es_admin_lab();
  v_ins := EXISTS (SELECT 1 FROM academia_inscripciones WHERE curso_id = v_c.id AND alumno_id = v_uid AND estado = 'activa');
  IF NOT (v_c.publicado OR v_ins OR v_admin) THEN RETURN NULL; END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'id', l.id, 'modulo_orden', l.modulo_orden, 'modulo_titulo', l.modulo_titulo, 'orden', l.orden,
           'titulo', l.titulo, 'descripcion', l.descripcion, 'duracion_seg', l.duracion_seg, 'es_muestra', l.es_muestra,
           'tiene_video', l.video_key IS NOT NULL, 'vista', p.leccion_id IS NOT NULL,
           'recursos', (SELECT COALESCE(jsonb_agg(jsonb_build_object('i', r.n - 1, 'nombre', r.x ->> 'nombre',
                                                                     'bytes', (r.x ->> 'bytes')::bigint) ORDER BY r.n), '[]'::jsonb)
                          FROM jsonb_array_elements(l.recursos) WITH ORDINALITY AS r(x, n))
         ) ORDER BY l.modulo_orden, l.orden, l.created_at), '[]'::jsonb)
    INTO v_lec
    FROM academia_lecciones l
    LEFT JOIN academia_progreso p ON p.leccion_id = l.id AND p.alumno_id = v_uid
   WHERE l.curso_id = v_c.id AND l.publicado;

  SELECT jsonb_build_object('estrellas', r.estrellas, 'comentario', r.comentario) INTO v_res
    FROM academia_resenas r WHERE r.curso_id = v_c.id AND r.alumno_id = v_uid;

  RETURN jsonb_build_object(
    'curso', jsonb_build_object('id', v_c.id, 'slug', v_c.slug, 'titulo', v_c.titulo, 'descripcion', v_c.descripcion,
               'nivel', v_c.nivel, 'software', v_c.software, 'instructor', v_c.instructor,
               'instructor_especialidad', v_c.instructor_especialidad, 'portada_url', v_c.portada_url,
               'horas_certificado', v_c.horas_certificado, 'publicado', v_c.publicado,
               'precio_cop', v_c.precio_cop, 'precio_usd', v_c.precio_usd, 'precio_antes_cop', v_c.precio_antes_cop,
               'comunidad_url', CASE WHEN v_ins OR v_admin THEN v_c.comunidad_url END),
    'inscrito', v_ins, 'admin', v_admin, 'lecciones', v_lec, 'mi_resena', v_res);
END $$;

-- Marcar una clase como vista (exige inscripción activa en su curso). Devuelve el avance del curso.
CREATE OR REPLACE FUNCTION public.academia_marcar_leccion(p_leccion uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_curso uuid; v_total int; v_hechas int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sesión requerida'; END IF;
  SELECT l.curso_id INTO v_curso FROM academia_lecciones l WHERE l.id = p_leccion AND l.publicado;
  IF v_curso IS NULL THEN RAISE EXCEPTION 'Clase no encontrada'; END IF;
  IF NOT EXISTS (SELECT 1 FROM academia_inscripciones i
                  WHERE i.curso_id = v_curso AND i.alumno_id = v_uid AND i.estado = 'activa') THEN
    RAISE EXCEPTION 'NO_INSCRITO: necesitas una inscripción activa en este curso';
  END IF;
  INSERT INTO academia_progreso (alumno_id, leccion_id) VALUES (v_uid, p_leccion)
    ON CONFLICT (alumno_id, leccion_id) DO NOTHING;
  SELECT count(*), count(p.leccion_id) INTO v_total, v_hechas
    FROM academia_lecciones l
    LEFT JOIN academia_progreso p ON p.leccion_id = l.id AND p.alumno_id = v_uid
   WHERE l.curso_id = v_curso AND l.publicado;
  RETURN jsonb_build_object('ok', true, 'curso_id', v_curso, 'lecciones', v_total, 'completadas', v_hechas,
                            'porcentaje', CASE WHEN v_total = 0 THEN 0 ELSE floor(100.0 * v_hechas / v_total)::int END);
END $$;

-- Calificar un curso (una por alumno; volver a calificar la reemplaza). Exige inscripción activa.
CREATE OR REPLACE FUNCTION public.academia_calificar(p_curso uuid, p_estrellas integer, p_comentario text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sesión requerida'; END IF;
  IF p_estrellas IS NULL OR p_estrellas NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'La calificación va de 1 a 5 estrellas'; END IF;
  IF NOT EXISTS (SELECT 1 FROM academia_inscripciones i
                  WHERE i.curso_id = p_curso AND i.alumno_id = v_uid AND i.estado = 'activa') THEN
    RAISE EXCEPTION 'NO_INSCRITO: solo los alumnos inscritos califican el curso';
  END IF;
  INSERT INTO academia_resenas (curso_id, alumno_id, estrellas, comentario)
  VALUES (p_curso, v_uid, p_estrellas, NULLIF(left(btrim(COALESCE(p_comentario, '')), 1000), ''))
  ON CONFLICT (curso_id, alumno_id) DO UPDATE
     SET estrellas = EXCLUDED.estrellas, comentario = EXCLUDED.comentario, updated_at = now();
  RETURN jsonb_build_object('ok', true);
END $$;

-- Certificado: se emite cuando el alumno vio el 100 % de las clases publicadas. La primera vez guarda una copia fija
-- (fecha, nombre, horas) en la inscripción; desde ahí se imprime siempre igual aunque luego se agreguen clases.
-- Código de verificación determinista (sale de la inscripción).
DROP FUNCTION IF EXISTS public.academia_certificado(uuid);
CREATE FUNCTION public.academia_certificado(p_curso uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_i record; v_c record; v_u record;
        v_total int; v_hechas int; v_seg bigint; v_fecha timestamptz; v_nombre text; v_md5 text; v_horas numeric;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Sesión requerida'; END IF;
  SELECT * INTO v_i FROM academia_inscripciones WHERE curso_id = p_curso AND alumno_id = v_uid AND estado = 'activa';
  IF NOT FOUND THEN RAISE EXCEPTION 'NO_INSCRITO: no tienes una inscripción activa en este curso'; END IF;
  SELECT * INTO v_c FROM academia_cursos WHERE id = p_curso;
  SELECT count(*), count(p.leccion_id), COALESCE(sum(l.duracion_seg), 0), max(p.completada_at)
    INTO v_total, v_hechas, v_seg, v_fecha
    FROM academia_lecciones l
    LEFT JOIN academia_progreso p ON p.leccion_id = l.id AND p.alumno_id = v_uid
   WHERE l.curso_id = p_curso AND l.publicado;
  IF v_i.certificado_at IS NULL THEN
    IF v_total = 0 OR v_hechas < v_total THEN
      RETURN jsonb_build_object('disponible', false, 'lecciones', v_total, 'completadas', v_hechas,
                                'porcentaje', CASE WHEN v_total = 0 THEN 0 ELSE floor(100.0 * v_hechas / v_total)::int END);
    END IF;
    SELECT email, raw_user_meta_data AS meta INTO v_u FROM auth.users WHERE id = v_uid;
    -- perfiles se lee como jsonb para no depender del nombre exacto de la columna (nombre / nombre_completo).
    SELECT COALESCE(NULLIF(btrim(to_jsonb(pf) ->> 'nombre_completo'), ''), NULLIF(btrim(to_jsonb(pf) ->> 'nombre'), ''))
      INTO v_nombre FROM perfiles pf WHERE pf.id = v_uid;
    v_nombre := COALESCE(NULLIF(btrim(v_i.nombre_certificado), ''), v_nombre,
                         NULLIF(btrim(v_u.meta ->> 'nombre'), ''), NULLIF(btrim(v_u.meta ->> 'full_name'), ''),
                         split_part(v_u.email, '@', 1));
    v_horas := COALESCE(v_c.horas_certificado, round(v_seg / 3600.0, 1));
    UPDATE academia_inscripciones
       SET certificado_at = COALESCE(v_fecha, now()), certificado_nombre = left(v_nombre, 120), certificado_horas = v_horas
     WHERE id = v_i.id
     RETURNING * INTO v_i;
  END IF;
  v_md5 := upper(md5('academia:' || v_i.id::text));
  RETURN jsonb_build_object('disponible', true, 'nombre', v_i.certificado_nombre, 'curso', v_c.titulo, 'software', v_c.software,
                            'nivel', v_c.nivel, 'instructor', v_c.instructor, 'horas', v_i.certificado_horas, 'lecciones', v_total,
                            'fecha', (v_i.certificado_at AT TIME ZONE 'America/Bogota')::date,
                            'codigo', 'AC-' || substr(v_md5, 1, 4) || '-' || substr(v_md5, 5, 4) || '-' || substr(v_md5, 9, 4));
END $$;

-- Verificación PÚBLICA (anon): con el código impreso devuelve SOLO nombre, curso, horas y fecha. Nunca el correo.
-- Válido = certificado emitido y la inscripción sigue activa (una anulación por reembolso lo invalida).
CREATE OR REPLACE FUNCTION public.academia_verificar_certificado(p_codigo text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_cod text := regexp_replace(upper(COALESCE(p_codigo, '')), '[^0-9A-Z]', '', 'g'); v_r record;
BEGIN
  IF v_cod LIKE 'AC%' THEN v_cod := substr(v_cod, 3); END IF;
  IF v_cod !~ '^[0-9A-F]{12}$' THEN RETURN jsonb_build_object('valido', false); END IF;
  SELECT i.certificado_nombre, i.certificado_horas, i.certificado_at, c.titulo INTO v_r
    FROM academia_inscripciones i JOIN academia_cursos c ON c.id = i.curso_id
   WHERE upper(substr(md5('academia:' || i.id::text), 1, 12)) = v_cod
     AND i.estado = 'activa' AND i.certificado_at IS NOT NULL
   LIMIT 1;
  IF NOT FOUND THEN RETURN jsonb_build_object('valido', false); END IF;
  RETURN jsonb_build_object('valido', true, 'nombre', v_r.certificado_nombre, 'curso', v_r.titulo,
                            'horas', v_r.certificado_horas, 'fecha', (v_r.certificado_at AT TIME ZONE 'America/Bogota')::date);
END $$;

-- Calificación PÚBLICA (anon) de cada curso publicado: SOLO promedio (1 decimal) y número de calificaciones.
-- Cuenta solo alumnos con inscripción ACTIVA: si una inscripción se anula (reembolso), su calificación deja de contar.
-- La usan functions/curso.js (JSON-LD AggregateRating), curso.html y academia.html. Filtrable: ?slug=eq.<slug>.
DROP FUNCTION IF EXISTS public.academia_calificaciones_publicas(text);
CREATE FUNCTION public.academia_calificaciones_publicas(p_negocio text DEFAULT 'alejandrocadcam')
RETURNS TABLE (slug text, calificaciones integer, promedio numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.slug, count(*)::int, round(avg(r.estrellas), 1)
    FROM academia_resenas r
    JOIN academia_cursos c ON c.id = r.curso_id
    JOIN academia_inscripciones i ON i.curso_id = r.curso_id AND i.alumno_id = r.alumno_id AND i.estado = 'activa'
   WHERE c.publicado AND c.negocio = p_negocio
   GROUP BY c.slug;
$$;

-- ── 4. RPC para el administrador (revisan es_admin_lab() adentro) ──────────
-- Inscribir (o reactivar) a un alumno. Pago por fuera: la referencia es obligatoria («cortesia» + nota para pruebas).
CREATE OR REPLACE FUNCTION public.academia_inscribir(p_curso uuid, p_alumno uuid, p_referencia text,
                                                     p_origen text DEFAULT 'manual', p_nombre text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid; v_previa text;
BEGIN
  IF NOT es_admin_lab() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF NOT EXISTS (SELECT 1 FROM academia_cursos WHERE id = p_curso) THEN RAISE EXCEPTION 'Curso no encontrado'; END IF;
  IF p_alumno IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_alumno) THEN RAISE EXCEPTION 'Alumno no encontrado'; END IF;
  IF COALESCE(btrim(p_referencia), '') = '' THEN RAISE EXCEPTION 'Falta la referencia del pago'; END IF;
  IF COALESCE(p_origen, 'manual') NOT IN ('manual','wise','paypal','transferencia','cortesia','otro') THEN
    RAISE EXCEPTION 'Origen no válido';
  END IF;
  SELECT estado INTO v_previa FROM academia_inscripciones WHERE curso_id = p_curso AND alumno_id = p_alumno;
  INSERT INTO academia_inscripciones (curso_id, alumno_id, estado, origen, referencia_pago, nombre_certificado, inscrito_por)
  VALUES (p_curso, p_alumno, 'activa', COALESCE(p_origen, 'manual'), left(btrim(p_referencia), 200),
          NULLIF(left(btrim(COALESCE(p_nombre, '')), 120), ''), auth.uid())
  ON CONFLICT (curso_id, alumno_id) DO UPDATE
     SET estado = 'activa', origen = EXCLUDED.origen, referencia_pago = EXCLUDED.referencia_pago,
         nombre_certificado = COALESCE(EXCLUDED.nombre_certificado, academia_inscripciones.nombre_certificado),
         inscrito_por = EXCLUDED.inscrito_por, anulada_at = NULL, anulada_motivo = NULL, updated_at = now()
  RETURNING id INTO v_id;
  RETURN jsonb_build_object('ok', true, 'inscripcion', v_id, 'ya_estaba_activa', COALESCE(v_previa = 'activa', false),
                            'reactivada', COALESCE(v_previa = 'anulada', false));
END $$;

-- Anular una inscripción (reembolso, error, abuso). El progreso se conserva por si se reactiva.
CREATE OR REPLACE FUNCTION public.academia_anular(p_curso uuid, p_alumno uuid, p_motivo text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT es_admin_lab() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF COALESCE(btrim(p_motivo), '') = '' THEN RAISE EXCEPTION 'La anulación necesita un motivo'; END IF;
  UPDATE academia_inscripciones
     SET estado = 'anulada', anulada_at = now(), anulada_motivo = left(btrim(p_motivo), 300), updated_at = now()
   WHERE curso_id = p_curso AND alumno_id = p_alumno AND estado = 'activa';
  IF NOT FOUND THEN RAISE EXCEPTION 'No hay una inscripción activa para ese alumno en ese curso'; END IF;
  RETURN jsonb_build_object('ok', true);
END $$;

-- Todos los cursos con todas sus columnas (incluida comunidad_url), publicados o en borrador.
DROP FUNCTION IF EXISTS public.academia_admin_cursos(text);
CREATE FUNCTION public.academia_admin_cursos(p_negocio text DEFAULT 'alejandrocadcam')
RETURNS SETOF public.academia_cursos
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT es_admin_lab() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  RETURN QUERY SELECT * FROM academia_cursos WHERE negocio = p_negocio ORDER BY orden, created_at;
END $$;

-- Crear o editar un curso. p_datos: {id?, slug, titulo, descripcion, nivel, software, instructor,
-- instructor_especialidad, portada_url, horas_certificado, precio_cop, precio_usd, precio_antes_cop, comunidad_url,
-- publicado, orden}. Sin id = curso nuevo. Las CHECK de la tabla validan cada campo.
CREATE OR REPLACE FUNCTION public.academia_guardar_curso(p_datos jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid := NULLIF(p_datos ->> 'id', '')::uuid;
        v_txt jsonb := jsonb_build_object(
          'slug', lower(btrim(p_datos ->> 'slug')), 'titulo', btrim(p_datos ->> 'titulo'),
          'descripcion', NULLIF(btrim(p_datos ->> 'descripcion'), ''), 'software', NULLIF(btrim(p_datos ->> 'software'), ''),
          'instructor', COALESCE(NULLIF(btrim(p_datos ->> 'instructor'), ''), 'Alejandro Carvajal'),
          'instructor_especialidad', NULLIF(btrim(p_datos ->> 'instructor_especialidad'), ''),
          'portada_url', NULLIF(btrim(p_datos ->> 'portada_url'), ''), 'comunidad_url', NULLIF(btrim(p_datos ->> 'comunidad_url'), ''));
BEGIN
  IF NOT es_admin_lab() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF v_id IS NULL THEN
    INSERT INTO academia_cursos (negocio, slug, titulo, descripcion, nivel, software, instructor, instructor_especialidad,
                                 portada_url, horas_certificado, precio_cop, precio_usd, precio_antes_cop, comunidad_url, publicado, orden)
    VALUES (COALESCE(NULLIF(p_datos ->> 'negocio', ''), 'alejandrocadcam'),
            v_txt ->> 'slug', v_txt ->> 'titulo', v_txt ->> 'descripcion', COALESCE(NULLIF(p_datos ->> 'nivel', ''), 'basico'),
            v_txt ->> 'software', v_txt ->> 'instructor', v_txt ->> 'instructor_especialidad', v_txt ->> 'portada_url',
            NULLIF(p_datos ->> 'horas_certificado', '')::numeric, NULLIF(p_datos ->> 'precio_cop', '')::int,
            NULLIF(p_datos ->> 'precio_usd', '')::numeric, NULLIF(p_datos ->> 'precio_antes_cop', '')::int,
            v_txt ->> 'comunidad_url', COALESCE((p_datos ->> 'publicado')::boolean, false),
            COALESCE(NULLIF(p_datos ->> 'orden', '')::int, 0))
    RETURNING id INTO v_id;
  ELSE
    UPDATE academia_cursos SET
      slug = v_txt ->> 'slug', titulo = v_txt ->> 'titulo', descripcion = v_txt ->> 'descripcion',
      nivel = COALESCE(NULLIF(p_datos ->> 'nivel', ''), 'basico'), software = v_txt ->> 'software',
      instructor = v_txt ->> 'instructor', instructor_especialidad = v_txt ->> 'instructor_especialidad',
      portada_url = v_txt ->> 'portada_url', horas_certificado = NULLIF(p_datos ->> 'horas_certificado', '')::numeric,
      precio_cop = NULLIF(p_datos ->> 'precio_cop', '')::int, precio_usd = NULLIF(p_datos ->> 'precio_usd', '')::numeric,
      precio_antes_cop = NULLIF(p_datos ->> 'precio_antes_cop', '')::int, comunidad_url = v_txt ->> 'comunidad_url',
      publicado = COALESCE((p_datos ->> 'publicado')::boolean, false),
      orden = COALESCE(NULLIF(p_datos ->> 'orden', '')::int, 0), updated_at = now()
    WHERE id = v_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Curso no encontrado'; END IF;
  END IF;
  RETURN v_id;
END $$;

-- Crear o editar una clase. p_datos: {id?, curso_id, modulo_orden, modulo_titulo, orden, titulo, descripcion,
-- video_key, duracion_seg, recursos:[{nombre, key, bytes}], es_muestra, publicado}.
-- video_key y recursos[].key = nombre EXACTO del archivo en el bucket R2 academia-videos.
CREATE OR REPLACE FUNCTION public.academia_guardar_leccion(p_datos jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid := NULLIF(p_datos ->> 'id', '')::uuid; v_curso uuid := NULLIF(p_datos ->> 'curso_id', '')::uuid;
        v_rec jsonb := '[]'::jsonb; v_x jsonb; v_key text; v_nom text;
BEGIN
  IF NOT es_admin_lab() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF v_curso IS NULL OR NOT EXISTS (SELECT 1 FROM academia_cursos WHERE id = v_curso) THEN RAISE EXCEPTION 'Curso no encontrado'; END IF;
  IF jsonb_typeof(p_datos -> 'recursos') = 'array' THEN
    IF jsonb_array_length(p_datos -> 'recursos') > 20 THEN RAISE EXCEPTION 'Máximo 20 recursos por clase'; END IF;
    FOR v_x IN SELECT value FROM jsonb_array_elements(p_datos -> 'recursos') LOOP
      v_key := btrim(COALESCE(v_x ->> 'key', ''));
      CONTINUE WHEN v_key = '';
      IF length(v_key) > 300 OR v_key ~ '(^/|\.\.|[[:cntrl:]])' THEN RAISE EXCEPTION 'Nombre de archivo no válido: %', v_key; END IF;
      v_nom := left(btrim(COALESCE(v_x ->> 'nombre', '')), 120);
      v_rec := v_rec || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
                 'nombre', COALESCE(NULLIF(v_nom, ''), regexp_replace(v_key, '^.*/', '')), 'key', v_key,
                 'bytes', CASE WHEN (v_x ->> 'bytes') ~ '^\d{1,12}$' THEN (v_x ->> 'bytes')::bigint END)));
    END LOOP;
  END IF;
  IF v_id IS NULL THEN
    INSERT INTO academia_lecciones (curso_id, modulo_orden, modulo_titulo, orden, titulo, descripcion, video_key,
                                    duracion_seg, recursos, es_muestra, publicado)
    VALUES (v_curso, COALESCE(NULLIF(p_datos ->> 'modulo_orden', '')::int, 1), NULLIF(btrim(p_datos ->> 'modulo_titulo'), ''),
            COALESCE(NULLIF(p_datos ->> 'orden', '')::int, 0), btrim(p_datos ->> 'titulo'),
            NULLIF(btrim(p_datos ->> 'descripcion'), ''), NULLIF(btrim(p_datos ->> 'video_key'), ''),
            COALESCE(NULLIF(p_datos ->> 'duracion_seg', '')::int, 0), v_rec,
            COALESCE((p_datos ->> 'es_muestra')::boolean, false), COALESCE((p_datos ->> 'publicado')::boolean, true))
    RETURNING id INTO v_id;
  ELSE
    UPDATE academia_lecciones SET
      curso_id = v_curso, modulo_orden = COALESCE(NULLIF(p_datos ->> 'modulo_orden', '')::int, 1),
      modulo_titulo = NULLIF(btrim(p_datos ->> 'modulo_titulo'), ''),
      orden = COALESCE(NULLIF(p_datos ->> 'orden', '')::int, 0), titulo = btrim(p_datos ->> 'titulo'),
      descripcion = NULLIF(btrim(p_datos ->> 'descripcion'), ''), video_key = NULLIF(btrim(p_datos ->> 'video_key'), ''),
      duracion_seg = COALESCE(NULLIF(p_datos ->> 'duracion_seg', '')::int, 0),
      recursos = CASE WHEN p_datos ? 'recursos' THEN v_rec ELSE recursos END,
      es_muestra = COALESCE((p_datos ->> 'es_muestra')::boolean, false),
      publicado = COALESCE((p_datos ->> 'publicado')::boolean, true), updated_at = now()
    WHERE id = v_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Clase no encontrada'; END IF;
  END IF;
  RETURN v_id;
END $$;

-- Clases de un curso CON video_key y recursos completos (solo admin).
DROP FUNCTION IF EXISTS public.academia_admin_lecciones(uuid);
CREATE FUNCTION public.academia_admin_lecciones(p_curso uuid)
RETURNS SETOF public.academia_lecciones
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT es_admin_lab() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  RETURN QUERY SELECT * FROM academia_lecciones WHERE curso_id = p_curso ORDER BY modulo_orden, orden, created_at;
END $$;

-- Alumnos (de un curso o de todos) con su avance y su calificación.
DROP FUNCTION IF EXISTS public.academia_admin_alumnos(uuid, text);
CREATE FUNCTION public.academia_admin_alumnos(p_curso uuid DEFAULT NULL, p_negocio text DEFAULT 'alejandrocadcam')
RETURNS TABLE (inscripcion_id uuid, curso_id uuid, curso_titulo text, alumno_id uuid, email text, estado text,
               origen text, referencia_pago text, nombre_certificado text, inscrito_at timestamptz,
               lecciones integer, completadas integer, porcentaje integer, ultima_actividad timestamptz,
               estrellas smallint, comentario text, primer_acceso_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
BEGIN
  IF NOT es_admin_lab() THEN RAISE EXCEPTION 'No autorizado'; END IF;
  RETURN QUERY
    SELECT i.id, c.id, c.titulo, i.alumno_id, u.email::text, i.estado, i.origen, i.referencia_pago, i.nombre_certificado,
           i.created_at, COALESCE(a.total, 0)::int, COALESCE(a.hechas, 0)::int,
           CASE WHEN COALESCE(a.total, 0) = 0 THEN 0 ELSE floor(100.0 * a.hechas / a.total)::int END, a.ultima,
           r.estrellas, r.comentario, i.primer_acceso_at
      FROM academia_inscripciones i
      JOIN academia_cursos c ON c.id = i.curso_id
      JOIN auth.users u ON u.id = i.alumno_id
      LEFT JOIN academia_resenas r ON r.curso_id = i.curso_id AND r.alumno_id = i.alumno_id
      LEFT JOIN LATERAL (
        SELECT count(*) AS total, count(p.leccion_id) AS hechas, max(p.completada_at) AS ultima
          FROM academia_lecciones l
          LEFT JOIN academia_progreso p ON p.leccion_id = l.id AND p.alumno_id = i.alumno_id
         WHERE l.curso_id = c.id AND l.publicado
      ) a ON true
     WHERE c.negocio = p_negocio AND (p_curso IS NULL OR i.curso_id = p_curso)
     ORDER BY (i.estado = 'activa') DESC, a.ultima DESC NULLS LAST, i.created_at DESC;
END $$;

-- ── 5. Seguridad: RLS, GRANT y permisos de ejecución ────────────────────────
ALTER TABLE public.academia_cursos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academia_lecciones     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academia_inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academia_progreso      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academia_resenas       ENABLE ROW LEVEL SECURITY;

-- GRANT explícitos (regla Supabase oct-2026). REVOKE ALL también quita los permisos por columna anteriores.
REVOKE ALL ON public.academia_cursos, public.academia_lecciones, public.academia_inscripciones,
              public.academia_progreso, public.academia_resenas FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, negocio, slug, titulo, descripcion, nivel, software, instructor, instructor_especialidad, portada_url,
              horas_certificado, precio_cop, precio_usd, precio_antes_cop, publicado, orden, created_at, updated_at)
  ON public.academia_cursos TO anon, authenticated;                                     -- SIN comunidad_url
GRANT SELECT (id, curso_id, modulo_orden, modulo_titulo, orden, titulo, descripcion, duracion_seg, es_muestra,
              publicado, created_at, updated_at)
  ON public.academia_lecciones TO anon, authenticated;                                  -- SIN video_key ni recursos
GRANT SELECT ON public.academia_inscripciones, public.academia_progreso, public.academia_resenas TO authenticated;   -- solo lo propio (RLS)
GRANT ALL ON public.academia_cursos, public.academia_lecciones, public.academia_inscripciones,
             public.academia_progreso, public.academia_resenas TO service_role;

DROP POLICY IF EXISTS academia_cursos_publicos ON public.academia_cursos;
CREATE POLICY academia_cursos_publicos ON public.academia_cursos FOR SELECT TO anon, authenticated
  USING (publicado);
DROP POLICY IF EXISTS academia_cursos_alumno_admin ON public.academia_cursos;
CREATE POLICY academia_cursos_alumno_admin ON public.academia_cursos FOR SELECT TO authenticated
  USING ((SELECT es_admin_lab()) OR academia_inscrito(id));

DROP POLICY IF EXISTS academia_lecciones_publicas ON public.academia_lecciones;
CREATE POLICY academia_lecciones_publicas ON public.academia_lecciones FOR SELECT TO anon, authenticated
  USING (publicado AND EXISTS (SELECT 1 FROM public.academia_cursos c
                                WHERE c.id = academia_lecciones.curso_id AND c.publicado));
DROP POLICY IF EXISTS academia_lecciones_alumno_admin ON public.academia_lecciones;
CREATE POLICY academia_lecciones_alumno_admin ON public.academia_lecciones FOR SELECT TO authenticated
  USING ((SELECT es_admin_lab()) OR (publicado AND academia_inscrito(curso_id)));

DROP POLICY IF EXISTS academia_inscripciones_propias ON public.academia_inscripciones;
CREATE POLICY academia_inscripciones_propias ON public.academia_inscripciones FOR SELECT TO authenticated
  USING (alumno_id = (SELECT auth.uid()) OR (SELECT es_admin_lab()));

DROP POLICY IF EXISTS academia_progreso_propio ON public.academia_progreso;
CREATE POLICY academia_progreso_propio ON public.academia_progreso FOR SELECT TO authenticated
  USING (alumno_id = (SELECT auth.uid()) OR (SELECT es_admin_lab()));

DROP POLICY IF EXISTS academia_resenas_propias ON public.academia_resenas;
CREATE POLICY academia_resenas_propias ON public.academia_resenas FOR SELECT TO authenticated
  USING (alumno_id = (SELECT auth.uid()) OR (SELECT es_admin_lab()));

REVOKE ALL ON FUNCTION public.academia_inscrito(uuid)                                FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_mis_cursos(text)                              FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_curso_detalle(text)                           FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_marcar_leccion(uuid)                          FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_calificar(uuid, integer, text)                FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_certificado(uuid)                             FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_verificar_certificado(text)                   FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_calificaciones_publicas(text)                 FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_inscribir(uuid, uuid, text, text, text)       FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_anular(uuid, uuid, text)                      FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_admin_cursos(text)                            FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_guardar_curso(jsonb)                          FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_guardar_leccion(jsonb)                        FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_admin_lecciones(uuid)                         FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.academia_admin_alumnos(uuid, text)                     FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.academia_inscrito(uuid)                          TO authenticated;   -- la usa RLS
GRANT EXECUTE ON FUNCTION public.academia_mis_cursos(text)                        TO authenticated;
GRANT EXECUTE ON FUNCTION public.academia_curso_detalle(text)                     TO authenticated;
GRANT EXECUTE ON FUNCTION public.academia_marcar_leccion(uuid)                    TO authenticated;
GRANT EXECUTE ON FUNCTION public.academia_calificar(uuid, integer, text)          TO authenticated;
GRANT EXECUTE ON FUNCTION public.academia_certificado(uuid)                       TO authenticated;
GRANT EXECUTE ON FUNCTION public.academia_verificar_certificado(text)             TO anon, authenticated;   -- página pública de verificación
GRANT EXECUTE ON FUNCTION public.academia_calificaciones_publicas(text)           TO anon, authenticated;   -- solo promedio y cantidad
GRANT EXECUTE ON FUNCTION public.academia_inscribir(uuid, uuid, text, text, text) TO authenticated;   -- revisa es_admin_lab() adentro
GRANT EXECUTE ON FUNCTION public.academia_anular(uuid, uuid, text)                TO authenticated;   -- ídem
GRANT EXECUTE ON FUNCTION public.academia_admin_cursos(text)                      TO authenticated;   -- ídem
GRANT EXECUTE ON FUNCTION public.academia_guardar_curso(jsonb)                    TO authenticated;   -- ídem
GRANT EXECUTE ON FUNCTION public.academia_guardar_leccion(jsonb)                  TO authenticated;   -- ídem
GRANT EXECUTE ON FUNCTION public.academia_admin_lecciones(uuid)                   TO authenticated;   -- ídem
GRANT EXECUTE ON FUNCTION public.academia_admin_alumnos(uuid, text)               TO authenticated;   -- ídem

-- ── 6. Verificación ─────────────────────────────────────────────────────────
-- Debe dar: tablas = 5 · tablas_con_rls = 5 · politicas = 7 · funciones = 15
--           · anon_puede_ejecutar = 2 (academia_verificar_certificado y academia_calificaciones_publicas)
--           · anon_ve_video_key = false · alumno_ve_video_key = false · alumno_ve_recursos = false
--           · anon_ve_comunidad = false · anon_ve_resenas = false · alumno_puede_escribir = false
--           · registra_primer_acceso = true
--           · cursos (0 la primera vez; luego los que hayas creado)
SELECT
  (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname LIKE 'academia\_%')                       AS tablas,
  (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname LIKE 'academia\_%' AND c.relrowsecurity) AS tablas_con_rls,
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename LIKE 'academia\_%')          AS politicas,
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname LIKE 'academia\_%')                                           AS funciones,
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname LIKE 'academia\_%' AND has_function_privilege('anon', p.oid, 'EXECUTE')) AS anon_puede_ejecutar,
  has_column_privilege('anon', 'public.academia_lecciones', 'video_key', 'SELECT')                         AS anon_ve_video_key,
  has_column_privilege('authenticated', 'public.academia_lecciones', 'video_key', 'SELECT')                AS alumno_ve_video_key,
  has_column_privilege('authenticated', 'public.academia_lecciones', 'recursos', 'SELECT')                 AS alumno_ve_recursos,
  has_column_privilege('anon', 'public.academia_cursos', 'comunidad_url', 'SELECT')                        AS anon_ve_comunidad,
  has_table_privilege('anon', 'public.academia_resenas', 'SELECT')                                         AS anon_ve_resenas,
  (has_table_privilege('authenticated', 'public.academia_progreso', 'INSERT')
    OR has_table_privilege('authenticated', 'public.academia_inscripciones', 'INSERT')
    OR has_table_privilege('authenticated', 'public.academia_resenas', 'INSERT')
    OR has_table_privilege('authenticated', 'public.academia_cursos', 'UPDATE'))                            AS alumno_puede_escribir,
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public'
          AND table_name = 'academia_inscripciones' AND column_name = 'primer_acceso_at')                    AS registra_primer_acceso,
  (SELECT count(*) FROM public.academia_cursos)                                                             AS cursos;
