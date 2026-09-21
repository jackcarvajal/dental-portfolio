-- ================================================================
-- Seguimiento FÍSICO de casos: en qué ÁREA está y qué TÉCNICO lo tiene.
-- Alimenta la etiqueta QR + la pantalla /app/mover.html + tablero /app/rastreo.html
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- 1) Dónde está el caso AHORA (última foto, para listar rápido sin joins)
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS area_actual    TEXT;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS tecnico_actual TEXT;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS area_updated_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_pedidos_area ON public.pedidos (negocio, area_actual);

-- 2) Historial de cambios del caso (quién, qué, por qué, cuándo).
--    Sirve de bitácora general: movimientos de área, cambios de estado, notas.
CREATE TABLE IF NOT EXISTS public.pedido_movimientos (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pedido_id  UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  codigo     TEXT,
  negocio    TEXT NOT NULL DEFAULT 'prodigy',
  accion     TEXT NOT NULL DEFAULT 'movimiento',  -- movimiento | estado | nota | otro
  area       TEXT,                                 -- NULL si no aplica (ej. una nota)
  tecnico    TEXT,                                 -- quién lo recibe / responsable
  nota       TEXT,                                 -- el "por qué"
  por_email  TEXT,                                 -- quién registró el cambio (staff logueado)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Si la tabla ya existía sin estas columnas, agregarlas sin romper nada:
ALTER TABLE public.pedido_movimientos ADD COLUMN IF NOT EXISTS accion       TEXT NOT NULL DEFAULT 'movimiento';
-- Cadena de custodia: QUÉ recibe el técnico y en qué estado (llave implante, tornillos, modelo, materiales…)
ALTER TABLE public.pedido_movimientos ADD COLUMN IF NOT EXISTS componentes  TEXT;   -- lista de lo que va con el caso
ALTER TABLE public.pedido_movimientos ADD COLUMN IF NOT EXISTS estado_recibo TEXT;  -- completo | incompleto | con_observaciones
ALTER TABLE public.pedido_movimientos ADD COLUMN IF NOT EXISTS fotos        TEXT[]; -- rutas de fotos en el bucket caso-fotos
CREATE INDEX IF NOT EXISTS idx_pedmov_pedido ON public.pedido_movimientos (pedido_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedmov_codigo ON public.pedido_movimientos (codigo);

ALTER TABLE public.pedido_movimientos ENABLE ROW LEVEL SECURITY;

-- Solo staff (admin/operator o los 4 admin) lee y escribe movimientos
DROP POLICY IF EXISTS "staff_all_pedmov" ON public.pedido_movimientos;
CREATE POLICY "staff_all_pedmov" ON public.pedido_movimientos
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

-- 3) Bucket privado para fotos de cadena de custodia (evidencia en cada entrega)
INSERT INTO storage.buckets (id, name, public)
VALUES ('caso-fotos','caso-fotos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "staff_write_caso_fotos" ON storage.objects;
CREATE POLICY "staff_write_caso_fotos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'caso-fotos' AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
      OR (auth.jwt() ->> 'email') IN (
        'jackalejandroc@gmail.com','labdentalprodigy@gmail.com',
        'gerencia@prodigylabdental.com','casos@prodigylabdental.com'
      )
    )
  );

DROP POLICY IF EXISTS "staff_read_caso_fotos" ON storage.objects;
CREATE POLICY "staff_read_caso_fotos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'caso-fotos' AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
      OR (auth.jwt() ->> 'email') IN (
        'jackalejandroc@gmail.com','labdentalprodigy@gmail.com',
        'gerencia@prodigylabdental.com','casos@prodigylabdental.com'
      )
    )
  );

SELECT 'Seguimiento fisico + cadena de custodia + bucket caso-fotos listos' AS status;
