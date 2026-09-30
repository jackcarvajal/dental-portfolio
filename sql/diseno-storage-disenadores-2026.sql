-- ================================================================
-- PRODIGY — Diseñadores (rol 'diseno': guías / exocad / blender) pueden trabajar sin ser admin
-- Antes solo admin / operario / staff (y los correos admin) leían y escribían en Storage:
--   · 'pedidos-archivos' → lo que sube el doctor (escaneos, fotos, CBCT): el diseñador NO podía descargarlo.
--   · 'dental-cases'     → donde el panel de diseño sube el visor .html y el STL para el doctor: fallaba al subir.
-- Se AGREGAN políticas solo para el rol 'diseno' (app_metadata, nunca user_metadata); no se tocan las existentes.
-- Los comprobantes de pago no están en estos buckets. 100 % IDEMPOTENTE. Copiar TODO → SQL Editor → Run.
-- ================================================================

-- Descargar lo que subió el doctor
DROP POLICY IF EXISTS "pedidos_archivos_diseno_read" ON storage.objects;
CREATE POLICY "pedidos_archivos_diseno_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'pedidos-archivos' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'diseno');

-- Subir y reemplazar (upsert) el visor y el STL del diseño, y leerlos
DROP POLICY IF EXISTS "dental_cases_diseno_read" ON storage.objects;
CREATE POLICY "dental_cases_diseno_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'dental-cases' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'diseno');

DROP POLICY IF EXISTS "dental_cases_diseno_insert" ON storage.objects;
CREATE POLICY "dental_cases_diseno_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dental-cases' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'diseno');

DROP POLICY IF EXISTS "dental_cases_diseno_update" ON storage.objects;
CREATE POLICY "dental_cases_diseno_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING      (bucket_id = 'dental-cases' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'diseno')
  WITH CHECK (bucket_id = 'dental-cases' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'diseno');

-- Verificación: deben salir las 4 políticas nuevas
SELECT policyname, cmd FROM pg_policies
 WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%diseno%'
 ORDER BY policyname;
