-- ────────────────────────────────────────────────────────────────
-- PRODIGY — Evidencias de Entrega (patch despachos)
-- Ejecutar en Supabase SQL Editor DESPUÉS de migrate-despachos.sql
-- ────────────────────────────────────────────────────────────────

ALTER TABLE despachos ADD COLUMN IF NOT EXISTS firma_url TEXT;
ALTER TABLE despachos ADD COLUMN IF NOT EXISTS foto_url  TEXT;

-- ── Bucket evidencias-entrega ────────────────────────────────────
-- Ejecutar en Supabase Dashboard → Storage → New Bucket:
--   Name: evidencias-entrega
--   Public: FALSE (privado — solo lectura con service_role)
--
-- Policy INSERT para mensajeros autenticados:
-- CREATE POLICY "mensajero_upload_evidencias" ON storage.objects
--   FOR INSERT TO authenticated WITH CHECK (bucket_id = 'evidencias-entrega');
--
-- Policy SELECT para admin:
-- CREATE POLICY "admin_read_evidencias" ON storage.objects
--   FOR SELECT USING (bucket_id = 'evidencias-entrega');
