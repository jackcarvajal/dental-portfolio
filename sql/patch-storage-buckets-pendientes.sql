-- ============================================================
-- PRODIGY — PATCH: Buckets dental-cases y portafolio sin políticas
-- ⚠️ EJECUTAR en Supabase SQL Editor
-- ============================================================

-- ── dental-cases (imágenes de casos del portafolio público) ────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('dental-cases','dental-cases',true,20971520,
    ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET public=true, file_size_limit=20971520;

DROP POLICY IF EXISTS "dental_cases_upload_admin"  ON storage.objects;
DROP POLICY IF EXISTS "dental_cases_read_public"   ON storage.objects;
DROP POLICY IF EXISTS "dental_cases_delete_admin"  ON storage.objects;

-- Solo admin puede subir imágenes de casos
CREATE POLICY "dental_cases_upload_admin" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'dental-cases'
        AND auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    );

-- Lectura pública (imágenes del portafolio)
CREATE POLICY "dental_cases_read_public" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'dental-cases');

-- Eliminación solo admin
CREATE POLICY "dental_cases_delete_admin" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'dental-cases'
        AND auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    );

-- ── portafolio (archivos de casos: portada, galería, exocad) ───────
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('portafolio','portafolio',true,524288000)
ON CONFLICT (id) DO UPDATE SET public=true, file_size_limit=524288000;

DROP POLICY IF EXISTS "portafolio_upload_admin"  ON storage.objects;
DROP POLICY IF EXISTS "portafolio_read_public"   ON storage.objects;
DROP POLICY IF EXISTS "portafolio_delete_admin"  ON storage.objects;

-- Solo admin puede subir al portafolio
CREATE POLICY "portafolio_upload_admin" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'portafolio'
        AND auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    );

-- Lectura pública (portafolio es público)
CREATE POLICY "portafolio_read_public" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'portafolio');

-- Eliminación solo admin
CREATE POLICY "portafolio_delete_admin" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'portafolio'
        AND auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    );
