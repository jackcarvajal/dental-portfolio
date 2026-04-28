-- ================================================================
-- PRODIGY — Migración: implantes + trazabilidad + tracking
-- Ejecutar en Supabase SQL Editor
-- ================================================================

-- 1. Campos adicionales en inventario_items
ALTER TABLE inventario_items ADD COLUMN IF NOT EXISTS marca               text;
ALTER TABLE inventario_items ADD COLUMN IF NOT EXISTS numero_lote_inicial text;
ALTER TABLE inventario_items ADD COLUMN IF NOT EXISTS referencia_implante text;

-- 2. Campo número de guía en pedidos (si no existe ya)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS numero_guia text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS pais        text DEFAULT 'CO';

-- 3. Índices para búsquedas de trazabilidad
CREATE INDEX IF NOT EXISTS idx_inv_marca    ON inventario_items(marca);
CREATE INDEX IF NOT EXISTS idx_inv_categoria ON inventario_items(categoria);
CREATE INDEX IF NOT EXISTS idx_pedidos_guia ON pedidos(numero_guia);
