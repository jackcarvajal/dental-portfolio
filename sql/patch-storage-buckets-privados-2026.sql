-- ============================================================
-- PRODIGY — Privatizar buckets clínicos + desactivar purga incompleta
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Contexto (auditoría 2026-07-02 / 2026-07-03):
-- 1) Los buckets 'diseno-archivos', 'evidencias-entrega',
--    'prodigy-files', 'dental-cases' y 'pedidos-archivos' son
--    PÚBLICOS. Las URLs se generan con getPublicUrl() en varios
--    paneles → cualquiera con la ruta (predecible por convención de
--    nombre/UUID) puede descargar escaneos STL, fotos de evidencia y
--    documentos de clientes SIN autenticación.
-- 2) El cron 'prodigy-purga-stl-semanal' (trigger-purga-stl-30dias.sql)
--    solo limpia columnas en la tabla `pedidos` — NUNCA borra el
--    archivo real en Storage (SQL no puede llamar la API de Storage
--    directamente). Se reemplaza por una Cloudflare Function +
--    GitHub Action que sí borra el archivo real antes de limpiar BD.
-- ============================================================

-- ── 1. Desactivar el cron incompleto (evita doble limpieza/carrera) ──
--    La purga real ahora la hace functions/api/purgar-stl-storage.js
--    vía GitHub Action semanal (ver .github/workflows/purga-stl-semanal.yml)
SELECT cron.unschedule('prodigy-purga-stl-semanal')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'prodigy-purga-stl-semanal');

-- ── 2. Privatizar bucket 'diseno-archivos' (STL de trabajo, más sensible) ──
UPDATE storage.buckets SET public = false WHERE id = 'diseno-archivos';

DROP POLICY IF EXISTS "diseno_archivos_staff_read"   ON storage.objects;
DROP POLICY IF EXISTS "diseno_archivos_staff_write"  ON storage.objects;
DROP POLICY IF EXISTS "diseno_archivos_staff_delete" ON storage.objects;

-- Lectura: staff (admin/operario) vía app_metadata.role — NUNCA user_metadata
CREATE POLICY "diseno_archivos_staff_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'diseno-archivos'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

CREATE POLICY "diseno_archivos_staff_write" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'diseno-archivos'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

CREATE POLICY "diseno_archivos_staff_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'diseno-archivos'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

-- ── 3. Privatizar bucket 'evidencias-entrega' (firmas/fotos de entrega) ──
UPDATE storage.buckets SET public = false WHERE id = 'evidencias-entrega';

DROP POLICY IF EXISTS "evidencias_staff_read"   ON storage.objects;
DROP POLICY IF EXISTS "evidencias_staff_write"  ON storage.objects;

CREATE POLICY "evidencias_staff_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'evidencias-entrega'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff', 'mensajero')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

CREATE POLICY "evidencias_staff_write" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'evidencias-entrega'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff', 'mensajero')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

-- ── 4. Privatizar bucket 'prodigy-files' (archivos de clientes/doctores) ──
UPDATE storage.buckets SET public = false WHERE id = 'prodigy-files';

DROP POLICY IF EXISTS "prodigy_files_staff_read"  ON storage.objects;
DROP POLICY IF EXISTS "prodigy_files_owner_read"  ON storage.objects;
DROP POLICY IF EXISTS "prodigy_files_write"       ON storage.objects;

-- Lectura: staff siempre, o el propio doctor autenticado si la ruta
-- del archivo empieza con su propio user_id (convención: {user_id}/...)
CREATE POLICY "prodigy_files_staff_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'prodigy-files'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
            OR (storage.foldername(name))[1] = auth.uid()::text
        )
    );

CREATE POLICY "prodigy_files_write" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'prodigy-files'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
            OR (storage.foldername(name))[1] = auth.uid()::text
        )
    );

-- ── 5. Privatizar bucket 'dental-cases' (subida masiva operario-diseno) ──
UPDATE storage.buckets SET public = false WHERE id = 'dental-cases';

DROP POLICY IF EXISTS "dental_cases_staff_read"  ON storage.objects;
DROP POLICY IF EXISTS "dental_cases_staff_write" ON storage.objects;

CREATE POLICY "dental_cases_staff_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'dental-cases'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

CREATE POLICY "dental_cases_staff_write" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'dental-cases'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

-- ── 6. Privatizar bucket 'pedidos-archivos' (flujo-diseno.html — subida de doctores) ──
-- ⚠️ A diferencia de los demás, este bucket recibe uploads de doctores/clientes
--    SIN LOGIN OBLIGATORIO (js/flujo-uploader.js usa uid='anon' si no hay sesión).
--    Se replica el patrón de scanner-uploads: INSERT público restringido por
--    extensión, lectura/borrado solo para staff. No se puede exigir
--    app_metadata.role en el INSERT porque el usuario puede ser anon.
UPDATE storage.buckets SET public = false WHERE id = 'pedidos-archivos';

DROP POLICY IF EXISTS "pedidos_archivos_public_upload" ON storage.objects;
DROP POLICY IF EXISTS "pedidos_archivos_staff_read"     ON storage.objects;
DROP POLICY IF EXISTS "pedidos_archivos_staff_delete"   ON storage.objects;

CREATE POLICY "pedidos_archivos_public_upload" ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (
        bucket_id = 'pedidos-archivos'
        AND name ~* '\.(stl|ply|obj|dcm|zip|jpg|jpeg|png|pdf|3oxz|constructionfile)$'
    );

CREATE POLICY "pedidos_archivos_staff_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'pedidos-archivos'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
            OR (storage.foldername(name))[1] = auth.uid()::text
        )
    );

CREATE POLICY "pedidos_archivos_staff_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'pedidos-archivos'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT id, public FROM storage.buckets WHERE id IN ('diseno-archivos','evidencias-entrega','prodigy-files','dental-cases','pedidos-archivos','scanner-uploads');
--   → todos deben mostrar public = false
-- SELECT * FROM cron.job WHERE jobname = 'prodigy-purga-stl-semanal';
--   → debe devolver 0 filas (ya desactivado)

-- ============================================================
-- ⚠️ IMPORTANTE — orden de despliegue:
-- Este SQL debe ejecutarse DESPUÉS de desplegar el código que
-- reemplaza getPublicUrl() por createSignedUrl() en los paneles
-- (operario-diseno.html, operator-panel.html, revision-diseno.html,
-- taller.html, mensajero.html, client-panel.html). Si se ejecuta
-- antes, esos paneles mostrarán enlaces rotos hasta el siguiente
-- deploy de Cloudflare Pages.
-- ============================================================
