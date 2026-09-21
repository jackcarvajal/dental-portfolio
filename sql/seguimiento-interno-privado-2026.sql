-- ================================================================
-- PRIVACIDAD: mover la ubicación interna (área/técnico) a una tabla
-- SOLO-STAFF, para que el DOCTOR nunca la vea (ni con select('*') ni
-- con consulta directa). Las notas/fotos/custodia ya estaban en
-- pedido_movimientos (solo-staff) — esto cierra el último campo expuesto.
-- IDEMPOTENTE. Correr DESPUÉS de seguimiento-fisico-casos-2026.sql.
-- Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- 1) Tabla de ubicación actual (snapshot rápido), SOLO-STAFF
CREATE TABLE IF NOT EXISTS public.pedido_seguimiento (
  pedido_id      UUID PRIMARY KEY REFERENCES public.pedidos(id) ON DELETE CASCADE,
  codigo         TEXT,
  negocio        TEXT NOT NULL DEFAULT 'prodigy',
  area_actual    TEXT,
  tecnico_actual TEXT,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pedido_seguimiento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_all_pedseg" ON public.pedido_seguimiento;
CREATE POLICY "staff_all_pedseg" ON public.pedido_seguimiento
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    OR (auth.jwt() ->> 'email') IN (
      'jackalejandroc@gmail.com','labdentalprodigy@gmail.com',
      'gerencia@prodigylabdental.com','casos@prodigylabdental.com'
    )
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    OR (auth.jwt() ->> 'email') IN (
      'jackalejandroc@gmail.com','labdentalprodigy@gmail.com',
      'gerencia@prodigylabdental.com','casos@prodigylabdental.com'
    )
  );

-- 2) Migrar lo que ya se hubiera registrado (si algo) antes de borrar columnas
INSERT INTO public.pedido_seguimiento (pedido_id, codigo, negocio, area_actual, tecnico_actual, updated_at)
SELECT id, codigo, negocio, area_actual, tecnico_actual, COALESCE(area_updated_at, now())
FROM public.pedidos
WHERE area_actual IS NOT NULL OR tecnico_actual IS NOT NULL
ON CONFLICT (pedido_id) DO NOTHING;

-- 3) Quitar los campos internos de pedidos (elimina la fuga vía select('*') del cliente)
ALTER TABLE public.pedidos DROP COLUMN IF EXISTS area_actual;
ALTER TABLE public.pedidos DROP COLUMN IF EXISTS tecnico_actual;
ALTER TABLE public.pedidos DROP COLUMN IF EXISTS area_updated_at;

SELECT 'Ubicacion interna movida a pedido_seguimiento (solo-staff). pedidos ya no la expone.' AS status;
