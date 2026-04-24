-- ============================================================
-- PRODIGY — PATCH: Storage bucket evidencias-entrega
-- Las políticas estaban comentadas en migrate-evidencias.sql
-- ⚠️ EJECUTAR en Supabase SQL Editor
-- ============================================================

-- 1. Crear bucket si no existe (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'evidencias-entrega',
    'evidencias-entrega',
    false,  -- privado — firmadas via service_role
    52428800,  -- 50 MB por archivo
    ARRAY['image/png','image/jpeg','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 52428800;

-- 2. Limpiar políticas previas
DROP POLICY IF EXISTS "mensajero_upload_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "admin_read_evidencias"       ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_evidencias"     ON storage.objects;

-- 3. Upload: mensajeros y admins autenticados (subir firma/foto de entrega)
CREATE POLICY "mensajero_upload_evidencias" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'evidencias-entrega');

-- 4. Lectura: solo admin
CREATE POLICY "admin_read_evidencias" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'evidencias-entrega'
        AND auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    );

-- 5. Eliminación: solo admin
CREATE POLICY "admin_delete_evidencias" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'evidencias-entrega'
        AND auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    );
