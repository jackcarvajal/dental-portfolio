-- PRODIGY LAB — Patch: acepta_marketing en citas_domicilio
-- Ejecutar en Supabase SQL Editor
-- Cumplimiento: Ley 1581 de 2012 (Habeas Data Colombia) + SIC Circular 002/2015

ALTER TABLE citas_domicilio
  ADD COLUMN IF NOT EXISTS acepta_marketing boolean DEFAULT false;

COMMENT ON COLUMN citas_domicilio.acepta_marketing IS
  'true → acepta novedades y promociones (opcional). false → solo notificaciones operativas de la cita.';
