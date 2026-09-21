-- ================================================================
-- FASE 4 — Incidencias / actualizaciones del caso, con control de
-- visibilidad para el Dr. Lo interno (pérdida, reproceso) NO se filtra;
-- lo marcado visible_cliente=true aparece en el portal del doctor.
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.pedido_incidencias (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pedido_id       UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  codigo          TEXT,
  negocio         TEXT NOT NULL DEFAULT 'prodigy',
  tipo            TEXT NOT NULL DEFAULT 'actualizacion',  -- actualizacion | incidencia | nota
  titulo          TEXT NOT NULL,
  detalle         TEXT,
  visible_cliente BOOLEAN NOT NULL DEFAULT false,         -- ¿lo ve el doctor en su portal?
  por_email       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_incid_pedido ON public.pedido_incidencias (pedido_id, created_at DESC);

ALTER TABLE public.pedido_incidencias ENABLE ROW LEVEL SECURITY;

-- STAFF: lee y escribe todo
DROP POLICY IF EXISTS "staff_all_incidencias" ON public.pedido_incidencias;
CREATE POLICY "staff_all_incidencias" ON public.pedido_incidencias
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','mensajero','encargado_inventario','calidad','contabilidad','diseno','taller','fresado','impresion','secretaria')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','mensajero','encargado_inventario','calidad','contabilidad','diseno','taller','fresado','impresion','secretaria')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

-- DOCTOR: solo lee las de SU caso marcadas visibles (nunca las internas)
DROP POLICY IF EXISTS "cliente_lee_incidencias_visibles" ON public.pedido_incidencias;
CREATE POLICY "cliente_lee_incidencias_visibles" ON public.pedido_incidencias
  FOR SELECT TO authenticated
  USING (
    visible_cliente = true
    AND EXISTS (
      SELECT 1 FROM public.pedidos p
      WHERE p.id = pedido_incidencias.pedido_id AND p.user_id = auth.uid()
    )
  );

SELECT 'Tabla pedido_incidencias lista (interna vs visible al Dr)' AS status;
