-- =====================================================================
-- CONTABILIDAD — ACCESO DE LECTURA A LOS ARCHIVOS DEL CASO
-- 2026-07-18 · proyecto zgihrwqfyvgyapbwzkvw
--
-- ── EL PROBLEMA ──────────────────────────────────────────────────────
-- Para cuadrar un caso, contabilidad necesita ver el comprobante que subió
-- el doctor, la factura del proveedor y la evidencia de entrega firmada.
-- Pero las políticas de storage listan los roles uno por uno y **'contabilidad'
-- no está en ninguna**:
--
--   evidencias_staff_read  → ('admin', 'operario', 'staff', 'mensajero')
--   prodigy_files_*        → ('admin', 'operario', 'staff')
--   dental_cases_*         → ('admin', 'operario', 'staff')
--
-- Resultado: el panel de contabilidad pedía la URL firmada y Supabase la
-- negaba. No había forma de verificar un pago contra su comprobante sin
-- pedirle a otra persona que lo abriera.
--
-- ── QUÉ HACE ESTE PARCHE ─────────────────────────────────────────────
-- Agrega políticas de SOLO LECTURA para el rol 'contabilidad' sobre los tres
-- buckets que necesita. No se tocan las políticas existentes: se agregan
-- nuevas, así que si esto se revierte nada más se rompe.
--
-- ── POR QUÉ SOLO LECTURA ─────────────────────────────────────────────
-- Contabilidad verifica, no produce. Sin INSERT ni DELETE no puede alterar
-- ni borrar la evidencia que ella misma audita — separación de funciones.
--
-- NOTA: `historial_diseno` NO necesita parche. Su política `auth_historial_all`
-- ya permite SELECT a todo usuario autenticado, así que el tab de
-- Productividad funciona sin cambios en la base.
-- =====================================================================

-- ── 1 · Evidencias de entrega (firmas, fotos, facturas de proveedor) ──
DROP POLICY IF EXISTS "evidencias_contabilidad_read" ON storage.objects;
CREATE POLICY "evidencias_contabilidad_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'evidencias-entrega'
        AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'contabilidad'
    );

-- ── 2 · Archivos de clientes (comprobantes de pago, fotos de feedback) ──
DROP POLICY IF EXISTS "prodigy_files_contabilidad_read" ON storage.objects;
CREATE POLICY "prodigy_files_contabilidad_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'prodigy-files'
        AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'contabilidad'
    );

-- ── 3 · Entregables del caso (STL y diseño), para conciliar qué se entregó ──
DROP POLICY IF EXISTS "dental_cases_contabilidad_read" ON storage.objects;
CREATE POLICY "dental_cases_contabilidad_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'dental-cases'
        AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'contabilidad'
    );

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────
-- 1) Las 3 políticas existen:
--    SELECT policyname FROM pg_policies
--     WHERE schemaname='storage' AND tablename='objects'
--       AND policyname LIKE '%contabilidad%';
--    → deben salir 3 filas.
--
-- 2) Prueba real: entra a /app/contabilidad con un usuario de rol
--    'contabilidad', pestaña "Archivos por caso", busca un código y abre
--    un comprobante. Antes fallaba con "sin permiso sobre ese bucket".
--
-- ── RECORDATORIO ──────────────────────────────────────────────────────
-- El rol se lee de app_metadata.role — NUNCA de user_metadata, que el propio
-- usuario puede editar desde el cliente. Si alguna vez alguien agrega un rol
-- nuevo, hay que sumarlo a estas políticas: están escritas rol por rol.
