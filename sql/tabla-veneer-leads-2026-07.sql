-- =====================================================================
-- TABLA veneer_leads — leads del servicio internacional de carillas (EE.UU.)
-- Compartida PRODIGY + Alejandro CAD/CAM, separada por columna `negocio`.
-- Ejecutar UNA sola vez en Supabase Dashboard → SQL Editor.
--   Proyecto: zgihrwqfyvgyapbwzkvw
-- Los inserts entran vía edge function con SERVICE_KEY (bypass RLS);
-- anon NO puede insertar directo (sin política INSERT) → anti-spam.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.veneer_leads (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  negocio      text        NOT NULL DEFAULT 'prodigy',
  nombre       text,
  email        text,
  practice     text,
  material     text,
  units        int,
  first_order  boolean     DEFAULT false,
  estimado_usd text,
  shade        text,
  notas        text,
  source       text        DEFAULT 'veneers-landing',
  contactado   boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- RLS: capa de seguridad real
ALTER TABLE public.veneer_leads ENABLE ROW LEVEL SECURITY;

-- GRANT explícito (requerido desde oct 2026)
GRANT ALL ON TABLE public.veneer_leads TO anon, authenticated;

-- Solo staff autenticado puede leer/actualizar. (No hay política INSERT para
-- anon: los leads entran por la edge function con SERVICE_KEY.)
DROP POLICY IF EXISTS "veneer_leads_staff_all" ON public.veneer_leads;
CREATE POLICY "veneer_leads_staff_all" ON public.veneer_leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_veneer_leads_created ON public.veneer_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_veneer_leads_negocio ON public.veneer_leads(negocio);
CREATE INDEX IF NOT EXISTS idx_veneer_leads_email   ON public.veneer_leads(email);
