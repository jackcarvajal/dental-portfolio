-- ============================================================
-- PRODIGY — Aprobación de diseño desde portal del doctor
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- ============================================================

ALTER TABLE pedidos_doctor
  ADD COLUMN IF NOT EXISTS link_diseno     TEXT,
  ADD COLUMN IF NOT EXISTS diseno_aprobado BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notas_cambios   TEXT;

-- Índice para filtrar fácilmente los pendientes de aprobación
CREATE INDEX IF NOT EXISTS idx_pd_aprobacion
  ON pedidos_doctor(diseno_aprobado, estado)
  WHERE diseno_aprobado = false AND estado = 'en_diseno';
