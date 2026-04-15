-- ============================================================
-- PRODIGY — Estados de pago Lemon Squeezy / PayPal
-- Agrega valores al ENUM y columna fecha_pago
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- 1. Nuevos valores al ENUM (idempotentes en PG 15)
ALTER TYPE estado_pedido ADD VALUE IF NOT EXISTS 'Pendiente_LS';
ALTER TYPE estado_pedido ADD VALUE IF NOT EXISTS 'Pagado_LS';
ALTER TYPE estado_pedido ADD VALUE IF NOT EXISTS 'Pagado_PayPal';

-- 2. Columna fecha de pago confirmado
ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMPTZ;

COMMENT ON COLUMN pedidos.fecha_pago IS
    'Timestamp del pago confirmado: webhook LS o éxito PayPal.';

-- ============================================================
-- RESULTADO:
-- ✅ pedidos.estado puede ser Pendiente_LS / Pagado_LS / Pagado_PayPal
-- ✅ pedidos.fecha_pago registra cuándo se confirmó el cobro
-- ============================================================
