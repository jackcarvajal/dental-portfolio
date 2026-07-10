-- ============================================================
-- PRODIGY — CHECK de formato en billing_email (validación server-side)
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Contexto (auditoría validación server-side 2026-07-09): billing_email
-- en `pedidos` solo se validaba con type="email" del navegador
-- (saltable insertando directo vía API) — un email corrupto ahí rompe
-- el envío del recibo/factura real al cliente. billing_nit ya se
-- valida dentro de functions/api/factura.js (fix de código, no
-- requiere SQL). Este CHECK es defensa adicional a nivel de BD,
-- permisivo (permite NULL, solo valida formato si se envía algo).
-- ============================================================

ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_billing_email_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_billing_email_check
  CHECK (billing_email IS NULL OR billing_email = '' OR billing_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT conname FROM pg_constraint WHERE conrelid = 'pedidos'::regclass AND conname = 'pedidos_billing_email_check';
--   → debe devolver 1 fila
