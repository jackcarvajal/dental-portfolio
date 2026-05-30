-- TABLA: Lista de espera para laboratorios (SaaS)
-- Ejecutar en Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.waitlist_labs (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      timestamptz DEFAULT now() NOT NULL,
  nombre_lab      text NOT NULL,
  nombre_contacto text NOT NULL,
  whatsapp        text NOT NULL,
  email           text,
  ciudad          text,
  pedidos_mes     text,      -- 'lt50'|'50-200'|'200-500'|'gt500'
  estado          text DEFAULT 'pendiente' CHECK (estado IN ('pendiente','contactado','demo_agendada','convertido','descartado')),
  notas           text,
  ip_origen       text
);

CREATE INDEX IF NOT EXISTS idx_waitlist_estado ON public.waitlist_labs(estado);
CREATE INDEX IF NOT EXISTS idx_waitlist_fecha  ON public.waitlist_labs(created_at DESC);

ALTER TABLE public.waitlist_labs ENABLE ROW LEVEL SECURITY;

-- Anon puede insertar (formulario público)
CREATE POLICY "waitlist_anon_insert" ON public.waitlist_labs
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Solo staff puede leer/actualizar
CREATE POLICY "waitlist_staff_all" ON public.waitlist_labs
  FOR ALL TO authenticated
  USING ((auth.jwt()->'app_metadata'->>'role') IN ('admin','staff'));

-- GRANT explícito (requerido desde oct 2026)
GRANT ALL ON TABLE public.waitlist_labs TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
