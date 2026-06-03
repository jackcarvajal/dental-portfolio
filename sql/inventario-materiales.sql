-- ============================================================
-- PRODIGY — Tabla inventario_materiales
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.inventario_materiales (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  nombre          text NOT NULL,
  categoria       text DEFAULT 'otro',    -- zirconio, emax, pmma, titanio, resina_3d, consumibles, otro
  color           text,                   -- A2, BL1, etc.
  stock_actual    numeric(10,2) DEFAULT 0,
  stock_minimo    numeric(10,2) DEFAULT 5, -- alerta cuando stock <= minimo
  unidad          text DEFAULT 'bloque',  -- bloque, disco, cartucho, litro, kg, unidad, caja
  precio_unitario numeric(12,2) DEFAULT 0, -- COP por unidad
  proveedor       text,
  notas           text,
  activo          boolean DEFAULT true,
  negocio         text DEFAULT 'prodigy'
);

-- Trigger updated_at (sin extensión moddatetime — compatible con cualquier Supabase)
CREATE OR REPLACE FUNCTION public._set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_inv_upd ON public.inventario_materiales;
CREATE TRIGGER trg_inv_upd
  BEFORE UPDATE ON public.inventario_materiales
  FOR EACH ROW EXECUTE FUNCTION public._set_updated_at();

-- Índices
CREATE INDEX IF NOT EXISTS idx_inv_negocio ON public.inventario_materiales (negocio, activo);
CREATE INDEX IF NOT EXISTS idx_inv_cat ON public.inventario_materiales (categoria);
CREATE INDEX IF NOT EXISTS idx_inv_stock ON public.inventario_materiales (stock_actual, stock_minimo);

-- RLS
ALTER TABLE public.inventario_materiales ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.inventario_materiales TO anon, authenticated, service_role;

-- Admin lee y escribe
CREATE POLICY "admin_rw_inventario" ON public.inventario_materiales
  FOR ALL TO authenticated
  USING (auth.jwt()->'app_metadata'->>'role' IN ('admin','superadmin','operario'))
  WITH CHECK (auth.jwt()->'app_metadata'->>'role' IN ('admin','superadmin','operario'));

-- RPC: materiales bajo mínimo
CREATE OR REPLACE FUNCTION public.prodigy_inventario_alertas()
RETURNS TABLE(id uuid, nombre text, stock_actual numeric, stock_minimo numeric, categoria text, proveedor text)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.nombre, m.stock_actual, m.stock_minimo, m.categoria, m.proveedor
  FROM public.inventario_materiales m
  WHERE m.negocio = 'prodigy' AND m.activo = true AND m.stock_actual <= m.stock_minimo
  ORDER BY m.stock_actual ASC LIMIT 20;
END;
$$;

-- Datos de ejemplo para iniciar
INSERT INTO public.inventario_materiales (nombre, categoria, color, stock_actual, stock_minimo, unidad, precio_unitario, proveedor, negocio)
VALUES
  ('Zirconio 3Y-TZP A1', 'zirconio', 'A1', 12, 5, 'bloque', 85000, 'Dentsply Sirona', 'prodigy'),
  ('Zirconio 3Y-TZP A2', 'zirconio', 'A2', 8, 5, 'bloque', 85000, 'Dentsply Sirona', 'prodigy'),
  ('Zirconio 3Y-TZP A3', 'zirconio', 'A3', 6, 5, 'bloque', 85000, 'Dentsply Sirona', 'prodigy'),
  ('Zirconio 3Y-TZP BL1', 'zirconio', 'BL1', 3, 5, 'bloque', 90000, 'Dentsply Sirona', 'prodigy'),
  ('e.max CAD LT A1', 'emax', 'A1', 10, 4, 'bloque', 95000, 'Ivoclar Vivadent', 'prodigy'),
  ('e.max CAD LT A2', 'emax', 'A2', 7, 4, 'bloque', 95000, 'Ivoclar Vivadent', 'prodigy'),
  ('PMMA Temp A2', 'pmma', 'A2', 5, 3, 'disco', 120000, 'Disc-All', 'prodigy'),
  ('Resina 3D Dental White', 'resina_3d', 'Blanco', 2, 3, 'cartucho', 280000, 'Formlabs', 'prodigy'),
  ('Resina 3D Beige Clear', 'resina_3d', 'Beige', 4, 3, 'cartucho', 280000, 'Formlabs', 'prodigy'),
  ('Bur de Titanio 2.0mm', 'consumibles', NULL, 8, 10, 'unidad', 45000, 'Coltene', 'prodigy')
ON CONFLICT DO NOTHING;

SELECT 'inventario_materiales creada con ' || COUNT(*) || ' materiales de ejemplo' AS status
FROM public.inventario_materiales WHERE negocio = 'prodigy';
