-- ============================================================
-- PRODIGY LAB — Seguridad Storage: bucket pedidos-archivos
-- Ejecutar en: Supabase > SQL Editor
-- Usado por flujo-uploader.js para subir STLs de pedidos
-- ============================================================

-- 1. Crear/actualizar bucket (público para getPublicUrl, con límite de tamaño)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pedidos-archivos',
    'pedidos-archivos',
    true,  -- público para que getPublicUrl funcione (paths son UUIDs no adivinables)
    524288000,  -- 500 MB en bytes
    ARRAY[
        'model/stl',
        'application/octet-stream',
        'application/zip',
        'application/x-zip-compressed',
        'application/vnd.ms-pki.stl',
        'image/jpeg',
        'image/png',
        'image/webp'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public            = true,
    file_size_limit   = 524288000,
    allowed_mime_types = ARRAY[
        'model/stl',
        'application/octet-stream',
        'application/zip',
        'application/x-zip-compressed',
        'application/vnd.ms-pki.stl',
        'image/jpeg',
        'image/png',
        'image/webp'
    ];

-- 2. Limpiar políticas anteriores
DROP POLICY IF EXISTS "pedidos_upload_auth"  ON storage.objects;
DROP POLICY IF EXISTS "pedidos_read_public"  ON storage.objects;
DROP POLICY IF EXISTS "pedidos_delete_own"   ON storage.objects;
DROP POLICY IF EXISTS "pedidos_admin_all"    ON storage.objects;

-- 3. Upload: solo usuarios autenticados, en su propio path (uid/...)
CREATE POLICY "pedidos_upload_auth" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'pedidos-archivos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 4. Lectura: pública (paths son UUIDs — hard to guess)
CREATE POLICY "pedidos_read_public" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'pedidos-archivos');

-- 5. Eliminación: solo el dueño o admin
CREATE POLICY "pedidos_delete_own" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'pedidos-archivos'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        )
    );

-- ============================================================
-- RESULTADO:
-- ✅ Solo usuarios autenticados pueden subir (no anon)
-- ✅ Cada usuario solo puede subir a su propio uid/
-- ✅ Lectura pública (necesario para getPublicUrl)
-- ✅ Eliminación: solo dueño o admin
-- ✅ Tamaño máximo 500MB por archivo
-- ============================================================
