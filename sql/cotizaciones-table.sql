-- TABLA: cotizaciones guardadas
-- Ejecutar en Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.cotizaciones (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    timestamptz DEFAULT now() NOT NULL,
  updated_at    timestamptz DEFAULT now() NOT NULL,

  -- Identificación del solicitante
  doctor_email  text,
  doctor_nombre text,
  doctor_tel    text,

  -- Detalle del cálculo
  tipo          text NOT NULL,          -- 'diseno'|'fresado'|'impresion'
  items         jsonb NOT NULL,         -- array de unidades con material/tipo
  subtotal      numeric(12,2) NOT NULL,
  descuento_pct numeric(5,2) DEFAULT 0,
  total         numeric(12,2) NOT NULL,
  moneda        text DEFAULT 'COP',     -- 'COP'|'USD'

  -- Estado
  estado        text DEFAULT 'borrador' CHECK (estado IN ('borrador','enviada','aceptada','rechazada','expirada')),
  expira_at     timestamptz DEFAULT (now() + interval '30 days'),
  notas         text,

  -- Vínculo opcional con pedido
  pedido_id     uuid REFERENCES pedidos(id) ON DELETE SET NULL,

  -- Trazabilidad
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_origen     text
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cotiz_email  ON public.cotizaciones(doctor_email);
CREATE INDEX IF NOT EXISTS idx_cotiz_estado ON public.cotizaciones(estado);
CREATE INDEX IF NOT EXISTS idx_cotiz_fecha  ON public.cotizaciones(created_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public._set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS trg_cotiz_upd ON public.cotizaciones;
CREATE TRIGGER trg_cotiz_upd BEFORE UPDATE ON public.cotizaciones
  FOR EACH ROW EXECUTE FUNCTION public._set_updated_at();

-- RLS
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;

-- Anon puede insertar (calculadora pública)
CREATE POLICY "cotiz_anon_insert" ON public.cotizaciones
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Usuario autenticado ve solo sus propias cotizaciones
CREATE POLICY "cotiz_auth_select" ON public.cotizaciones
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR doctor_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Staff ve todas
CREATE POLICY "cotiz_staff_all" ON public.cotizaciones
  FOR ALL TO authenticated
  USING (
    (auth.jwt()->'app_metadata'->>'role') IN ('admin','operario','staff')
  );

-- GRANT requerido desde oct 2026
GRANT ALL ON TABLE public.cotizaciones TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- RPC para obtener cotizaciones de un doctor (panel cliente)
CREATE OR REPLACE FUNCTION public.mis_cotizaciones(p_email text DEFAULT NULL)
RETURNS TABLE (
  id uuid, created_at timestamptz, tipo text, items jsonb,
  subtotal numeric, total numeric, moneda text, estado text, expira_at timestamptz, notas text
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT id, created_at, tipo, items, subtotal, total, moneda, estado, expira_at, notas
  FROM public.cotizaciones
  WHERE
    (p_email IS NOT NULL AND doctor_email = p_email)
    OR user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT 50;
$$;
GRANT EXECUTE ON FUNCTION public.mis_cotizaciones(text) TO authenticated, anon;
