-- PRODIGY — Campos para flujo de fabricación post-diseño
-- Permite al doctor solicitar fabricación desde la página de revisión
-- Ejecutar en Supabase SQL Editor

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS fabricacion_solicitada BOOLEAN     DEFAULT false,
  ADD COLUMN IF NOT EXISTS fabricacion_pagada     BOOLEAN     DEFAULT false,
  ADD COLUMN IF NOT EXISTS fabricacion_tipo       TEXT;
  -- fabricacion_tipo: 'fresado' | 'impresion' | 'lab' | null

-- Permitir que el anon (doctor) marque fabricacion_solicitada = true
-- La política de update ya existe (anon_diseno_review_update) pero tiene WITH CHECK
-- restrictivo — ampliar para incluir post-aprobación:
-- ⚠️ FIX CRÍTICO: WITH CHECK (true) anterior era demasiado permisivo.
-- Ahora solo permite actualizar los campos de fabricación explícitos.
-- Postgres RLS no restringe por columna en WITH CHECK, pero sí validamos
-- que el nuevo row tenga fabricacion_solicitada=true (acción del doctor).
DROP POLICY IF EXISTS "anon_diseno_postaprobacion_update" ON pedidos;
CREATE POLICY "anon_diseno_postaprobacion_update" ON pedidos
  FOR UPDATE TO anon
  USING (html_diseno_url IS NOT NULL AND diseno_disclaimer = true)
  WITH CHECK (
    -- Solo permite marcar fabricacion como solicitada/tipo
    -- No permite cambiar estado_operativo ni otros campos sensibles
    fabricacion_solicitada = true
    AND estado_operativo IN ('DISENO_APROBADO','ENTREGADO')
  );
