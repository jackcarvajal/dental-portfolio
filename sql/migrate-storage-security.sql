-- ============================================================
-- PRODIGY LAB — Seguridad Storage: bucket scanner-uploads
-- Ejecutar en: Supabase > SQL Editor
-- Protege contra Denial-of-Wallet (upload masivo de basura)
-- ============================================================

-- 1. Asegurar que el bucket existe y es PRIVADO
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'scanner-uploads',
    'scanner-uploads',
    false,
    157286400,  -- 150 MB en bytes (150 * 1024 * 1024)
    ARRAY[
        'model/stl',
        'application/octet-stream',  -- .stl binario
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/vnd.ms-pki.stl'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public           = false,
    file_size_limit  = 157286400,
    allowed_mime_types = ARRAY[
        'model/stl',
        'application/octet-stream',
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/vnd.ms-pki.stl'
    ];

-- 2. Limpiar políticas anteriores del bucket
DROP POLICY IF EXISTS "scanner_public_upload"   ON storage.objects;
DROP POLICY IF EXISTS "scanner_admin_read"      ON storage.objects;
DROP POLICY IF EXISTS "scanner_admin_delete"    ON storage.objects;

-- 3. INSERT público con restricción de extensión y tamaño
--    Solo .stl, .ply, .zip — el nombre del archivo lo valida el CHECK
CREATE POLICY "scanner_public_upload" ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (
        bucket_id = 'scanner-uploads'
        AND (
            name ~* '\.(stl|ply|zip)$'
        )
        -- El tamaño lo controla file_size_limit del bucket (150MB)
    );

-- 4. Lectura solo para admin autenticado
CREATE POLICY "scanner_admin_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'scanner-uploads'
        AND auth.email() IN (
            'jacklaejandroc@gmail.com',
            'jackalejandroc@gmail.com',
            'labdentalprodigy@gmail.com'
        )
    );

-- 5. Eliminación solo para admin
CREATE POLICY "scanner_admin_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'scanner-uploads'
        AND auth.email() IN (
            'jacklaejandroc@gmail.com',
            'jackalejandroc@gmail.com',
            'labdentalprodigy@gmail.com'
        )
    );

-- ============================================================
-- RESULTADO:
-- ✅ Archivos > 150MB bloqueados automáticamente por Supabase
-- ✅ Solo extensiones .stl, .ply, .zip permitidas
-- ✅ Uploads sin autenticación pero con validación de extensión
-- ✅ Lectura/eliminación solo para admin
-- ============================================================
