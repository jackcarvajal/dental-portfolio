-- ============================================================
-- Tabla consultas_virtuales — Leads de turismo dental
-- Usada por: dental-concierge (negocio='clinica')
--            PRODIGY para consultas internacionales (negocio='prodigy')
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.consultas_virtuales (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      timestamptz DEFAULT now(),
  negocio         text NOT NULL DEFAULT 'clinica'
                  CHECK (negocio IN ('clinica','prodigy','alejandrocadcam')),
  -- Datos del lead
  nombre          text NOT NULL,
  pais            text,
  whatsapp        text NOT NULL,
  email           text,
  tratamiento     text,
  notas           text,
  -- Archivos médicos (URLs de Supabase Storage)
  archivos_urls   text[],
  -- Seguimiento
  estado          text DEFAULT 'nuevo'
                  CHECK (estado IN ('nuevo','contactado','cotizado','confirmado','perdido')),
  notas_internas  text,
  asignado_a      text,
  -- Marketing
  fuente          text DEFAULT 'landing_b2c',
  acepta_marketing boolean DEFAULT false,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  -- Metadata
  ip_pais         text,
  user_agent      text
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cv_negocio    ON public.consultas_virtuales (negocio, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cv_estado     ON public.consultas_virtuales (estado);
CREATE INDEX IF NOT EXISTS idx_cv_whatsapp   ON public.consultas_virtuales (whatsapp);
CREATE INDEX IF NOT EXISTS idx_cv_created    ON public.consultas_virtuales (created_at DESC);

-- RLS
ALTER TABLE public.consultas_virtuales ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.consultas_virtuales TO anon, authenticated;

-- Anon puede insertar (el lead no está autenticado)
CREATE POLICY "anon_insert_consulta" ON public.consultas_virtuales
  FOR INSERT TO anon
  WITH CHECK (true);

-- Solo admin/staff ven todas las consultas de su negocio
CREATE POLICY "staff_lee_consultas" ON public.consultas_virtuales
  FOR SELECT TO authenticated
  USING (
    auth.jwt()->'app_metadata'->>'role' IN ('admin','superadmin','operator')
  );

-- Admin puede actualizar estado/notas
CREATE POLICY "staff_actualiza_consulta" ON public.consultas_virtuales
  FOR UPDATE TO authenticated
  USING (auth.jwt()->'app_metadata'->>'role' IN ('admin','superadmin','operator'))
  WITH CHECK (true);

-- Verificación
SELECT 'Tabla consultas_virtuales creada' AS status;
SELECT count(*) AS total FROM public.consultas_virtuales;
