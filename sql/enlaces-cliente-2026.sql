-- ================================================================
-- PRODIGY — ENLACES PRIVADOS POR CLIENTE (lista de precios y pedido sin cuenta)
-- Problema: la regla es «sin precios en las páginas públicas» (8-oct-2026), pero el doctor necesita
-- ver sus precios y pedir rápido. Idea tomada de Soluciones FE (/precios/:token, /pedido/:token).
-- Solución: un enlace personal, imposible de adivinar (token aleatorio de 40 caracteres), por doctor:
--   · tipo 'precios' → /lista-precios#e=TOKEN muestra la lista de precios con su nombre.
--   · tipo 'pedido'  → /envia-tu-scanner#e=TOKEN abre el envío ya identificado (nombre, clínica, código).
-- Reglas:
--   · Lo crea y lo anula solo el personal comercial (admin, operator, secretaria, contabilidad).
--   · Cualquiera que tenga el enlace lo abre (anon): solo se devuelve nombre, clínica y código del doctor
--     (nunca correo ni teléfono) y se cuenta la apertura. Vence (60 días por defecto) y se puede anular.
--   · La tabla no se expone a anon: solo se usa por las funciones (SECURITY DEFINER).
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- 1) Tabla
CREATE TABLE IF NOT EXISTS public.enlaces_cliente (
  token            text PRIMARY KEY,
  tipo             text NOT NULL DEFAULT 'precios',
  doctor_id        uuid NOT NULL,
  negocio          text NOT NULL DEFAULT 'prodigy',
  creado_por       uuid DEFAULT auth.uid(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  expira_at        timestamptz NOT NULL DEFAULT now() + interval '60 days',
  revocado         boolean NOT NULL DEFAULT false,
  aperturas        integer NOT NULL DEFAULT 0,
  ultima_apertura  timestamptz
);
ALTER TABLE public.enlaces_cliente DROP CONSTRAINT IF EXISTS enlaces_cliente_tipo_check;
ALTER TABLE public.enlaces_cliente ADD CONSTRAINT enlaces_cliente_tipo_check CHECK (tipo IN ('precios', 'pedido'));
CREATE INDEX IF NOT EXISTS enlaces_cliente_doctor_idx ON public.enlaces_cliente (doctor_id, tipo, created_at DESC);
COMMENT ON TABLE public.enlaces_cliente IS 'Enlaces privados por doctor (lista de precios / pedido sin cuenta). Se usan solo por RPC.';

-- 2) ¿Quien llama es personal comercial? (admin por correo o rol + operator/secretaria/contabilidad en app_metadata)
CREATE OR REPLACE FUNCTION public.es_personal_comercial() RETURNS boolean
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT COALESCE(
       public.es_admin_lab()
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = ANY (ARRAY['operator','secretaria','contabilidad'])
    OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb)) r
                WHERE r = ANY (ARRAY['operator','secretaria','contabilidad'])),
    false);
$$;

-- 3) RLS: nadie lee la tabla directo salvo el personal comercial (anon no tiene ni GRANT)
ALTER TABLE public.enlaces_cliente ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.enlaces_cliente FROM anon, authenticated;
GRANT SELECT ON TABLE public.enlaces_cliente TO authenticated;
DROP POLICY IF EXISTS enlaces_cliente_staff_lee ON public.enlaces_cliente;
CREATE POLICY enlaces_cliente_staff_lee ON public.enlaces_cliente FOR SELECT TO authenticated
  USING (public.es_personal_comercial());

-- 4) Crear (o reutilizar el vigente) — devuelve token, vencimiento y aperturas
CREATE OR REPLACE FUNCTION public.crear_enlace_cliente(p_doctor uuid, p_tipo text DEFAULT 'precios', p_dias integer DEFAULT 60)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e public.enlaces_cliente;
BEGIN
  IF NOT public.es_personal_comercial() THEN RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501'; END IF;
  IF p_tipo NOT IN ('precios', 'pedido') THEN RAISE EXCEPTION 'Tipo de enlace inválido: %', p_tipo; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.doctores_perfil WHERE id = p_doctor) THEN RAISE EXCEPTION 'Doctor no encontrado'; END IF;
  -- Si ya tiene uno vigente (con más de 7 días de vida), se reutiliza: no se llena de enlaces
  SELECT * INTO e FROM public.enlaces_cliente
   WHERE doctor_id = p_doctor AND tipo = p_tipo AND NOT revocado AND expira_at > now() + interval '7 days'
   ORDER BY created_at DESC LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.enlaces_cliente (token, tipo, doctor_id, expira_at)
    VALUES (left(replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), 40), p_tipo, p_doctor,
            now() + make_interval(days => GREATEST(1, LEAST(COALESCE(p_dias, 60), 365))))
    RETURNING * INTO e;
  END IF;
  RETURN jsonb_build_object('token', e.token, 'tipo', e.tipo, 'expira_at', e.expira_at,
                            'aperturas', e.aperturas, 'ultima_apertura', e.ultima_apertura, 'created_at', e.created_at);
END;$$;

-- 5) Abrir (cualquiera con el enlace) — cuenta la apertura y devuelve lo mínimo del doctor
CREATE OR REPLACE FUNCTION public.abrir_enlace_cliente(p_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e public.enlaces_cliente; d record;
BEGIN
  IF p_token IS NULL OR length(p_token) <> 40 OR p_token !~ '^[0-9a-f]+$' THEN RETURN NULL; END IF;
  UPDATE public.enlaces_cliente SET aperturas = aperturas + 1, ultima_apertura = now()
   WHERE token = p_token AND NOT revocado AND expira_at > now()
   RETURNING * INTO e;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT nombre, clinica, codigo_cliente INTO d FROM public.doctores_perfil WHERE id = e.doctor_id;
  RETURN jsonb_build_object('tipo', e.tipo, 'negocio', e.negocio, 'expira_at', e.expira_at,
    'doctor', jsonb_build_object('nombre', d.nombre, 'clinica', d.clinica, 'codigo', d.codigo_cliente));
END;$$;

-- 6) Anular
CREATE OR REPLACE FUNCTION public.revocar_enlace_cliente(p_token text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.es_personal_comercial() THEN RAISE EXCEPTION 'No autorizado' USING ERRCODE = '42501'; END IF;
  UPDATE public.enlaces_cliente SET revocado = true WHERE token = p_token;
  RETURN FOUND;
END;$$;

-- 7) Permisos de las funciones
REVOKE ALL ON FUNCTION public.es_personal_comercial() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.crear_enlace_cliente(uuid, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.abrir_enlace_cliente(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revocar_enlace_cliente(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.es_personal_comercial() TO authenticated;
GRANT EXECUTE ON FUNCTION public.crear_enlace_cliente(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revocar_enlace_cliente(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.abrir_enlace_cliente(text) TO anon, authenticated;

-- 8) Verificación — debe dar: tabla_ok = 1 · rls_ok = true · funciones = 4 · anon_lee_tabla = false
SELECT
  (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'enlaces_cliente') AS tabla_ok,
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.enlaces_cliente'::regclass) AS rls_ok,
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('es_personal_comercial','crear_enlace_cliente','abrir_enlace_cliente','revocar_enlace_cliente')) AS funciones,
  has_table_privilege('anon', 'public.enlaces_cliente', 'SELECT') AS anon_lee_tabla;
