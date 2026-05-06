-- PRODIGY — Patch: columna acepta_habeas en formularios de contacto
-- Ley 1581 de 2012 (Habeas Data Colombia) — registro de consentimiento
-- Ejecutar en Supabase SQL Editor

ALTER TABLE solicitudes_scanner
  ADD COLUMN IF NOT EXISTS acepta_habeas boolean DEFAULT false;

ALTER TABLE citas_domicilio
  ADD COLUMN IF NOT EXISTS acepta_habeas boolean DEFAULT false;

COMMENT ON COLUMN solicitudes_scanner.acepta_habeas IS
  'true = usuario aceptó tratamiento de datos personales (Ley 1581/2012)';

COMMENT ON COLUMN citas_domicilio.acepta_habeas IS
  'true = usuario aceptó tratamiento de datos personales (Ley 1581/2012)';
