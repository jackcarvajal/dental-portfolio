-- ============================================================
-- PRODIGY LAB — Migración: Habeas Data / acepta_marketing
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- 1. Tabla de doctores (si existe)
ALTER TABLE doctores
  ADD COLUMN IF NOT EXISTS acepta_marketing boolean DEFAULT false;

COMMENT ON COLUMN doctores.acepta_marketing IS
  'Consentimiento explícito para mensajes promocionales (Habeas Data Colombia). false = solo mensajes transaccionales.';

-- 2. Tabla de solicitudes de escáner
ALTER TABLE solicitudes_scanner
  ADD COLUMN IF NOT EXISTS acepta_marketing boolean DEFAULT false;

COMMENT ON COLUMN solicitudes_scanner.acepta_marketing IS
  'Consentimiento explícito para mensajes promocionales. Independiente de notificaciones operativas de caso.';

-- 3. Tabla de leads de calculadora (si existe)
ALTER TABLE leads_doctores
  ADD COLUMN IF NOT EXISTS acepta_marketing boolean DEFAULT false;

COMMENT ON COLUMN leads_doctores.acepta_marketing IS
  'Consentimiento explícito para mensajes promocionales.';

-- ============================================================
-- NOTA DE PRIVACIDAD:
-- acepta_marketing = false → solo notificaciones de caso (Kanban, despachos)
-- acepta_marketing = true  → también puede recibir promos y novedades
-- Para dar de BAJA: UPDATE doctores SET acepta_marketing = false WHERE id = <id>;
-- NUNCA eliminar el registro. NUNCA suspender notificaciones operativas.
-- ============================================================
