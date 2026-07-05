-- ============================================================
-- PRODIGY + Alejandro — newsletter_subscribers: constraint inconsistente entre repos
-- Ejecutar en: Supabase Dashboard → SQL Editor (tabla compartida)
--
-- Hallazgo (auditoría 2026-07-05): la tabla física newsletter_subscribers
-- es UNA SOLA (compartida entre negocios), pero cada repo la define con
-- una constraint distinta en su propio .sql:
--   - PRODIGY (newsletter-subscribers.sql):  UNIQUE(email)
--   - Alejandro (newsletter-ac.sql):         UNIQUE(email, negocio)
-- Gana la que se creó primero en producción (probablemente PRODIGY,
-- por antigüedad). Efecto:
--   1. alejandro_newsletter_subscribe() hace
--      "ON CONFLICT (email, negocio) DO UPDATE..." — si la constraint
--      real es solo UNIQUE(email), Postgres lanza
--      "no unique or exclusion constraint matching ON CONFLICT" en
--      CADA suscripción de Alejandro, y el EXCEPTION WHEN OTHERS THEN
--      NULL de esa función lo traga en silencio (el doctor nunca
--      queda inscrito, sin ningún error visible).
--   2. newsletter_subscribe() de PRODIGY busca "WHERE email = ..."
--      SIN filtrar por negocio — un doctor que ya está en la lista de
--      PRODIGY nunca se registra en la de Alejandro (se detecta como
--      "ya existe" y no inserta la fila para el otro negocio).
--
-- Fix: unificar a UNIQUE(email, negocio) en ambos, y hacer que la RPC
-- de PRODIGY también filtre por negocio.
-- ============================================================

-- 1. Reemplazar la constraint única por la compuesta (segura: pasar de
--    UNIQUE(email) a UNIQUE(email,negocio) solo AMPLÍA lo permitido,
--    nunca puede chocar con filas existentes)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.newsletter_subscribers'::regclass
      AND contype = 'u'
      AND conkey = (SELECT array_agg(attnum) FROM pg_attribute
                    WHERE attrelid = 'public.newsletter_subscribers'::regclass
                      AND attname = 'email')
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE public.newsletter_subscribers DROP CONSTRAINT ' || quote_ident(conname)
      FROM pg_constraint
      WHERE conrelid = 'public.newsletter_subscribers'::regclass
        AND contype = 'u'
        AND conkey = (SELECT array_agg(attnum) FROM pg_attribute
                      WHERE attrelid = 'public.newsletter_subscribers'::regclass
                        AND attname = 'email')
      LIMIT 1
    );
  END IF;
END;
$$;

ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_email_negocio_key UNIQUE (email, negocio);

-- 2. PRODIGY — newsletter_subscribe() debe filtrar también por negocio
CREATE OR REPLACE FUNCTION public.newsletter_subscribe(
  p_email      text,
  p_nombre     text DEFAULT NULL,
  p_negocio    text DEFAULT 'prodigy',
  p_fuente     text DEFAULT 'web',
  p_tags       text[] DEFAULT '{}'::text[]
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _existing public.newsletter_subscribers;
BEGIN
  IF p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RETURN json_build_object('ok',false,'error','Email inválido');
  END IF;

  SELECT * INTO _existing FROM public.newsletter_subscribers
    WHERE email = lower(p_email) AND negocio = p_negocio;

  IF FOUND THEN
    IF NOT _existing.activo THEN
      UPDATE public.newsletter_subscribers SET activo=true WHERE email=lower(p_email) AND negocio=p_negocio;
    END IF;
    RETURN json_build_object('ok',true,'status','existing');
  END IF;

  INSERT INTO public.newsletter_subscribers(email,nombre,negocio,fuente,tags)
  VALUES(lower(p_email),p_nombre,p_negocio,p_fuente,p_tags);

  RETURN json_build_object('ok',true,'status','new');
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT conname FROM pg_constraint WHERE conrelid='public.newsletter_subscribers'::regclass AND contype='u';
--   → debe mostrar newsletter_subscribers_email_negocio_key
-- Suscribir el mismo email en PRODIGY y luego en Alejandro (RPCs
-- respectivas) → debe crear 2 filas, una por negocio, sin error.
-- ============================================================

SELECT 'patch-newsletter-negocio-unificado-2026 aplicado' AS status;
