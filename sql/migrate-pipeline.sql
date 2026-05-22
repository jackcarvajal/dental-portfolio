-- PRODIGY — Pipeline multi-departamento + cotización de fabricación
-- CORREGIDO: no referencia columna "flujo" (no existe en esta tabla)
-- Ejecutar en Supabase SQL Editor

-- ── Columnas de pipeline ──────────────────────────────────────────────────────
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS servicios_pagados    TEXT[]    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS departamento_actual  TEXT,
  ADD COLUMN IF NOT EXISTS pais                 TEXT      DEFAULT 'CO',
  ADD COLUMN IF NOT EXISTS pedido_diseno_id     UUID;     -- vínculo al pedido de diseño origen

-- servicios_pagados se llena manualmente por el admin al crear/editar el pedido
-- o se establece desde el flujo de pedido (flujo-lab.html → ['diseno','fresado'])
-- Para casos existentes se deja vacío; el admin puede actualizarlos si necesita

-- ── Columnas de cotización de fabricación ────────────────────────────────────
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS cotizacion_fab_monto  NUMERIC(12,0),   -- COP sin decimales
  ADD COLUMN IF NOT EXISTS cotizacion_fab_estado TEXT,
  -- 'pendiente_cotizacion' | 'cotizacion_enviada' | 'pago_confirmado' | null
  ADD COLUMN IF NOT EXISTS cotizacion_fab_at     TIMESTAMPTZ,     -- cuando se envió la cotización
  ADD COLUMN IF NOT EXISTS cotizacion_fab_nota   TEXT;            -- nota del admin para el cliente

-- departamento_actual se setea manualmente por el operario via operario.html
-- o cuando el admin hace el handoff. No se rellena aquí para evitar dependencias.

-- ── Índices ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pedidos_depto  ON pedidos(departamento_actual);
CREATE INDEX IF NOT EXISTS idx_pedidos_pais   ON pedidos(pais);
CREATE INDEX IF NOT EXISTS idx_pedidos_svcs   ON pedidos USING GIN(servicios_pagados);
CREATE INDEX IF NOT EXISTS idx_pedidos_cotfab ON pedidos(cotizacion_fab_estado)
  WHERE cotizacion_fab_estado IS NOT NULL;
