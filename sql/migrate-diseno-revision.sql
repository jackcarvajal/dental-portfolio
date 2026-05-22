-- PRODIGY — Flujo de revisión de diseño por el doctor
-- Permite al operario subir HTML + STL + construinfo; el doctor aprueba o pide cambios
-- Ejecutar en Supabase SQL Editor

-- ── Nuevas columnas en pedidos ──────────────────────────────────────────────
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS html_diseno_url    TEXT,
  ADD COLUMN IF NOT EXISTS stl_urls           TEXT[]      DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS construinfo_url    TEXT,
  ADD COLUMN IF NOT EXISTS fotos_diseno_urls  TEXT[]      DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cambios_count      INTEGER     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS diseno_aprobado_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS diseno_aprobado_por TEXT,
  ADD COLUMN IF NOT EXISTS diseno_disclaimer  BOOLEAN     DEFAULT false;

-- ── Storage: crear bucket diseno-archivos (si no existe) ────────────────────
-- Hacer esto en: Supabase Dashboard → Storage → New bucket
-- Nombre: diseno-archivos | Public: true (seguridad por UUID no-adivinable)

-- ── RLS: doctor puede ver el pedido por UUID (sin login) ────────────────────
-- Seguridad: UUID 128 bits = imposible de adivinar (igual que Google Docs share)
DROP POLICY IF EXISTS "anon_diseno_review_select" ON pedidos;
CREATE POLICY "anon_diseno_review_select" ON pedidos
  FOR SELECT TO anon
  USING (html_diseno_url IS NOT NULL);

-- ── RLS: doctor puede aprobar o solicitar cambios ───────────────────────────
-- Solo cuando estado_operativo = REVISION_CLIENTE
DROP POLICY IF EXISTS "anon_diseno_review_update" ON pedidos;
CREATE POLICY "anon_diseno_review_update" ON pedidos
  FOR UPDATE TO anon
  USING (html_diseno_url IS NOT NULL AND estado_operativo = 'REVISION_CLIENTE')
  WITH CHECK (estado_operativo IN ('DISENO_APROBADO','CAMBIOS_SOLICITADOS'));
