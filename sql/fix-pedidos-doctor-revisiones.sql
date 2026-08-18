-- ═══════════════════════════════════════════════════════════════
-- FIX pedidos_doctor.revisiones_usadas — la columna no existe en la
-- tabla, pero el panel del cliente (app/client-panel.html) la lee y
-- la escribe para el límite de "2 revisiones sin costo".
-- Sin ella: el UPDATE da 400 (la solicitud de revisión del cliente
-- falla) y el conteo siempre cuenta como 1.
-- Add no-destructivo. Pegar en Supabase SQL Editor → Run.
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.pedidos_doctor
  ADD COLUMN IF NOT EXISTS revisiones_usadas int NOT NULL DEFAULT 0;

-- Verificar: SELECT column_name FROM information_schema.columns
--            WHERE table_name='pedidos_doctor' AND column_name='revisiones_usadas';
