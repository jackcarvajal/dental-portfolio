-- ============================================================
-- PRODIGY — Sistema de suscriptores newsletter
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    timestamptz DEFAULT now(),
  email         text NOT NULL UNIQUE,
  nombre        text,
  especialidad  text,
  ciudad        text,
  negocio       text NOT NULL DEFAULT 'prodigy'
                CHECK (negocio IN ('prodigy','alejandrocadcam','clinica')),
  fuente        text DEFAULT 'web',         -- 'web','flujo','escaner','manual'
  activo        boolean DEFAULT true,
  acepta_promo  boolean DEFAULT false,
  unsubscribe_token text DEFAULT encode(gen_random_bytes(24),'hex'),
  last_email_at timestamptz,
  tags          text[] DEFAULT '{}'::text[]  -- ej: ['fresado','diseno','guias']
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_nl_email     ON public.newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_nl_negocio   ON public.newsletter_subscribers (negocio, activo);
CREATE INDEX IF NOT EXISTS idx_nl_fuente    ON public.newsletter_subscribers (fuente);

-- RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.newsletter_subscribers TO anon, authenticated;

-- Inserción anónima (suscripción desde landing)
CREATE POLICY "anon_subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon
  WITH CHECK (true);

-- Solo admin lee todos
CREATE POLICY "admin_lee_suscriptores" ON public.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (auth.jwt()->'app_metadata'->>'role' IN ('admin','superadmin'));

-- Unsubscribe (usuario puede desactivar su propio email)
CREATE POLICY "unsubscribe_self" ON public.newsletter_subscribers
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (activo = false);

-- RPC para suscribir (upsert seguro)
CREATE OR REPLACE FUNCTION public.newsletter_subscribe(
  p_email      text,
  p_nombre     text DEFAULT NULL,
  p_negocio    text DEFAULT 'prodigy',
  p_fuente     text DEFAULT 'web',
  p_tags       text[] DEFAULT '{}'::text[]
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _existing public.newsletter_subscribers;
BEGIN
  IF p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RETURN json_build_object('ok',false,'error','Email inválido');
  END IF;

  SELECT * INTO _existing FROM public.newsletter_subscribers WHERE email = lower(p_email);

  IF FOUND THEN
    -- Ya existe — reactivar si estaba inactivo
    IF NOT _existing.activo THEN
      UPDATE public.newsletter_subscribers SET activo=true WHERE email=lower(p_email);
    END IF;
    RETURN json_build_object('ok',true,'status','existing');
  END IF;

  INSERT INTO public.newsletter_subscribers(email,nombre,negocio,fuente,tags)
  VALUES(lower(p_email),p_nombre,p_negocio,p_fuente,p_tags);

  RETURN json_build_object('ok',true,'status','new');
END;
$$;

-- RPC para unsubscribe por token
CREATE OR REPLACE FUNCTION public.newsletter_unsubscribe(p_token text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.newsletter_subscribers
  SET activo = false
  WHERE unsubscribe_token = p_token;
  RETURN FOUND;
END;
$$;

-- Verificación
SELECT 'newsletter_subscribers creada' AS status;
