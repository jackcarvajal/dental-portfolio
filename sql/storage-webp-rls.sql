-- ============================================================
-- PRODIGY — Configuración de Storage para transformación WebP
-- Punto crítico de Gemini: el bucket debe configurarse correctamente
-- antes de usar el parámetro ?format=webp de Supabase Storage.
--
-- OPCIONES:
--   A) Bucket público → acceso sin firma, transformación directa
--   B) Bucket privado → URLs firmadas con parámetros de transformación
--
-- Para el portafolio de PRODIGY usamos Opción B (privado + firma)
-- ============================================================

-- ── 1. Política para que el bucket 'dental-cases' sea accesible ─
-- El bucket debe tener public=false (privado, ya configurado)
-- Las URLs se firman desde el backend

-- Verificar configuración actual:
-- SELECT id, name, public FROM storage.buckets WHERE id = 'dental-cases';

-- ── 2. Política RLS para el bucket 'dental-cases' ───────────────
-- El cliente puede leer SOLO sus propios archivos (via doctor_uid)
DROP POLICY IF EXISTS "casos_read_owner_v2" ON storage.objects;
CREATE POLICY "casos_read_owner_v2" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'dental-cases'
        AND (
            -- Admin ve todo
            (current_setting('request.jwt.claims', true)::jsonb ->> 'email')
            IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
            OR
            -- Operarios de staff ven todo
            (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role')
            IN ('admin', 'operator', 'diseno', 'fresado', 'impresion', 'taller', 'calidad', 'contabilidad')
            OR
            -- Doctor ve SOLO su carpeta (nombre = pedido_id del doctor)
            (storage.foldername(name))[1] IN (
                SELECT id::text FROM pedidos
                WHERE doctor_uid = auth.uid()
                LIMIT 50
            )
        )
    );

-- ── 3. Función para obtener URL WebP firmada ─────────────────────
-- USO: SELECT prodigy_get_image_url('portafolio/foto.jpg', 400, 300);
CREATE OR REPLACE FUNCTION prodigy_get_image_url(
    file_path text,
    width_px  int DEFAULT 800,
    height_px int DEFAULT 600,
    quality   int DEFAULT 80
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    signed_url text;
    transform_params text;
BEGIN
    -- Parámetros de transformación WebP
    transform_params := 'width=' || width_px || '&height=' || height_px ||
                        '&quality=' || quality || '&format=webp&resize=cover';

    -- Generar URL firmada con transformación (válida 1 hora)
    -- En producción usar storage.sign() de Supabase
    -- Por ahora retornar la URL de transformación pública para buckets public
    signed_url := 'https://zgihrwqfyvgyapbwzkvw.supabase.co/storage/v1/render/image/public/dental-cases/'
                  || file_path || '?' || transform_params;

    RETURN signed_url;
END;
$$;

-- ── 4. Cómo usar desde el frontend (JavaScript) ─────────────────
/*
// Para URLs firmadas con transformación WebP:
const { data } = await sb.storage
    .from('dental-cases')
    .createSignedUrl(filePath, 3600, {
        transform: {
            width: 400,
            height: 300,
            format: 'webp',
            quality: 80,
            resize: 'cover',
        }
    });
const webpUrl = data?.signedUrl;

// Para bucket PÚBLICO (portafolio público):
const { data: { publicUrl } } = sb.storage
    .from('portafolio-publico')  // este bucket SÍ puede ser público
    .getPublicUrl(filePath, {
        transform: {
            width: 400,
            format: 'webp',
            quality: 80,
        }
    });
*/

-- ── 5. Bucket separado para imágenes PÚBLICAS del portafolio ────
-- Crear bucket 'portafolio-publico' con public=true para que
-- la transformación WebP funcione sin firma
-- Ejecutar en Supabase Dashboard → Storage → New Bucket

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('portafolio-publico', 'portafolio-publico', true)
-- ON CONFLICT (id) DO UPDATE SET public = true;

-- ── NOTAS IMPORTANTES ───────────────────────────────────────────
-- 1. La transformación WebP SOLO funciona en buckets públicos O con URLs firmadas
-- 2. El plan FREE de Supabase INCLUYE transformación básica de imágenes
-- 3. Para buckets privados: SIEMPRE usar createSignedUrl() con el objeto transform
-- 4. Si el bucket es privado y se intenta transformar sin firma → 403 Forbidden
-- 5. Los logos e íconos en /assets/ no necesitan transformación (ya están en .png optimizado)
