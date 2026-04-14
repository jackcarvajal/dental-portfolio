-- ================================================================
-- PRODIGY — Políticas RLS v1.0
-- Agente 1: Seguridad — Supabase Storage + Tablas
--
-- INSTRUCCIONES:
--   1. Dashboard Supabase → SQL Editor → New Query
--   2. Pega y ejecuta este script completo
--   3. Verifica en Dashboard → Storage → Policies que las
--      políticas aparezcan activas
-- ================================================================

-- ----------------------------------------------------------------
-- 1. STORAGE: Bucket 'casos' — privado, sin URLs públicas
-- ----------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('casos', 'casos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Limpiar políticas previas
DROP POLICY IF EXISTS "casos_upload_owner"  ON storage.objects;
DROP POLICY IF EXISTS "casos_select_owner"  ON storage.objects;
DROP POLICY IF EXISTS "casos_select_admin"  ON storage.objects;
DROP POLICY IF EXISTS "casos_delete_owner"  ON storage.objects;
DROP POLICY IF EXISTS "casos_delete_admin"  ON storage.objects;

-- Subida: el doctor sube solo a su propia carpeta /{uid}/...
CREATE POLICY "casos_upload_owner" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'casos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Lectura: el doctor ve solo sus archivos
CREATE POLICY "casos_select_owner" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'casos'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Lectura: admin ve todo
CREATE POLICY "casos_select_admin" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'casos'
        AND auth.email() IN (
            'jacklaejandroc@gmail.com',
            'jackalejandroc@gmail.com',
            'labdentalprodigy@gmail.com'
        )
    );

-- Eliminación: solo admin
CREATE POLICY "casos_delete_admin" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'casos'
        AND auth.email() IN (
            'jacklaejandroc@gmail.com',
            'jackalejandroc@gmail.com',
            'labdentalprodigy@gmail.com'
        )
    );

-- ----------------------------------------------------------------
-- 2. TABLA pedidos — RLS por doctor / admin
-- ----------------------------------------------------------------

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pedidos_select_owner"  ON pedidos;
DROP POLICY IF EXISTS "pedidos_select_admin"  ON pedidos;
DROP POLICY IF EXISTS "pedidos_insert_owner"  ON pedidos;
DROP POLICY IF EXISTS "pedidos_update_admin"  ON pedidos;

-- Doctor ve solo sus pedidos
CREATE POLICY "pedidos_select_owner" ON pedidos
    FOR SELECT TO authenticated
    USING (doctor_uid = auth.uid());

-- Admin ve todos
CREATE POLICY "pedidos_select_admin" ON pedidos
    FOR SELECT TO authenticated
    USING (
        auth.email() IN (
            'jacklaejandroc@gmail.com',
            'jackalejandroc@gmail.com',
            'labdentalprodigy@gmail.com'
        )
    );

-- Doctor crea sus pedidos
CREATE POLICY "pedidos_insert_owner" ON pedidos
    FOR INSERT TO authenticated
    WITH CHECK (doctor_uid = auth.uid());

-- Solo admin actualiza estado, archivo_final_path, etc.
CREATE POLICY "pedidos_update_admin" ON pedidos
    FOR UPDATE TO authenticated
    USING (
        auth.email() IN (
            'jacklaejandroc@gmail.com',
            'jackalejandroc@gmail.com',
            'labdentalprodigy@gmail.com'
        )
    );

-- ----------------------------------------------------------------
-- 3. TABLA pagos — solo admin puede leer finanzas
-- ----------------------------------------------------------------

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pagos_select_admin" ON pagos;
DROP POLICY IF EXISTS "pagos_insert_fn"    ON pagos;

CREATE POLICY "pagos_select_admin" ON pagos
    FOR SELECT TO authenticated
    USING (
        auth.email() IN (
            'jacklaejandroc@gmail.com',
            'jackalejandroc@gmail.com',
            'labdentalprodigy@gmail.com'
        )
    );

-- Solo funciones de servicio (service_role) insertan pagos vía webhook
-- (No se necesita política INSERT para authenticated — solo service_role la usa)

-- ----------------------------------------------------------------
-- 4. VISTA pedidos_operador — sin PII
-- ----------------------------------------------------------------

CREATE OR REPLACE VIEW pedidos_operador AS
    SELECT
        id,
        codigo,
        servicio,
        material,
        cantidad,
        color_vita,
        piezas,
        instrucciones,
        estado,
        fecha_ingreso,
        fecha_entrega,
        slot_express,
        archivo_stl_path,
        archivo_final_path,
        foto_salida_path
        -- OMITIDOS INTENCIONALMENTE: doctor_uid, email, nombre_doctor,
        --                            telefono, nombre_paciente, customer_*
    FROM pedidos;

-- ----------------------------------------------------------------
-- 5. FUNCIÓN: URL firmada temporal (válida 1 hora)
--    Llamar desde Edge Function con service_role, nunca desde frontend.
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION generar_url_firmada(ruta text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    resultado text;
BEGIN
    -- Solo admin o el propio doctor (verificado por RLS antes de llamar)
    SELECT storage.create_signed_url('casos', ruta, 3600)
    INTO resultado;
    RETURN resultado;
END;
$$;
