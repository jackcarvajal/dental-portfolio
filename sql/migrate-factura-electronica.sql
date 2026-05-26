-- =============================================
-- MIGRACIÓN: Facturación electrónica DIAN (Alegra)
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Columnas de estado y tracking de factura en pedidos
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS factura_estado      TEXT DEFAULT 'no_requerida',
  -- 'no_requerida' | 'pendiente' | 'emitida' | 'error'
  ADD COLUMN IF NOT EXISTS factura_alegra_id   TEXT,
  ADD COLUMN IF NOT EXISTS factura_numero      TEXT,
  ADD COLUMN IF NOT EXISTS factura_cufe        TEXT,
  ADD COLUMN IF NOT EXISTS factura_pdf_url     TEXT,
  ADD COLUMN IF NOT EXISTS factura_emitida_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS factura_error       TEXT;

-- Cuando se registra un pedido con requiere_factura=true, marcar automáticamente
-- (se actualiza desde contabilidad.html al confirmar pago)
-- Índice para buscar facturas pendientes rápido
CREATE INDEX IF NOT EXISTS idx_pedidos_factura_estado
  ON pedidos(factura_estado)
  WHERE factura_estado IN ('pendiente', 'emitida');
