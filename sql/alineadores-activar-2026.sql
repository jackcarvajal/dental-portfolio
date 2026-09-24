-- ================================================================
-- PRODIGY — Alineadores: ACTIVAR subida de casos (un solo script)
-- Corrige 3 fallas detectadas el 23-sep-2026:
--  1) La orden del cliente fallaba: faltaban columnas en alineadores_casos
--     (sql/alineadores-orden-cliente-2026.sql nunca se corrió → queda incluido aquí).
--  2) Fotos, radiografías y PDF NO subían: el bucket scanner-uploads solo acepta
--     .stl/.ply/.zip → bucket propio 'alineadores-archivos' (STL, ZIP, JPG, PNG, PDF, DCM).
--  3) Mayra no podía abrir los archivos: scanner-uploads solo lo leen 2 correos admin.
--  + bucket 'alineadores-comprobantes' (pagos del cliente, cada uno en su carpeta).
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- 1) Orden de trabajo del cliente
ALTER TABLE public.alineadores_casos
  ADD COLUMN IF NOT EXISTS motivo_consulta      text,
  ADD COLUMN IF NOT EXISTS indicacion_cliente   text,
  ADD COLUMN IF NOT EXISTS requiere_ipr         boolean,
  ADD COLUMN IF NOT EXISTS requiere_attachments boolean,
  ADD COLUMN IF NOT EXISTS arcada               text,
  ADD COLUMN IF NOT EXISTS archivos             text[] DEFAULT '{}';

DROP POLICY IF EXISTS "cliente_crea_su_caso" ON public.alineadores_casos;
CREATE POLICY "cliente_crea_su_caso" ON public.alineadores_casos
  FOR INSERT TO authenticated
  WITH CHECK (cliente_user_id = auth.uid() AND estado = 'valoracion');

-- 2) Bucket de archivos de casos de alineadores (privado, 150 MB)
--    Tipos: se filtran por extensión en la política (el navegador no siempre manda MIME de .stl/.dcm)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('alineadores-archivos', 'alineadores-archivos', false, 157286400, NULL)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 157286400, allowed_mime_types = NULL;

DROP POLICY IF EXISTS "aln_archivos_insert" ON storage.objects;
CREATE POLICY "aln_archivos_insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'alineadores-archivos'
    AND name LIKE 'alineadores/%'
    AND name ~* '\.(stl|ply|obj|zip|dcm|jpe?g|png|webp|pdf)$'
  );

DROP POLICY IF EXISTS "aln_archivos_staff_read" ON storage.objects;
CREATE POLICY "aln_archivos_staff_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'alineadores-archivos'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','diseno','alineadores','secretaria')
      OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
    )
  );

-- 3) Bucket de comprobantes de pago (privado, 10 MB). Cada cliente sube a SU carpeta <uid>/...
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('alineadores-comprobantes', 'alineadores-comprobantes', false, 10485760, NULL)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760;

DROP POLICY IF EXISTS "aln_comp_insert" ON storage.objects;
CREATE POLICY "aln_comp_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'alineadores-comprobantes'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND name ~* '\.(jpe?g|png|webp|pdf)$'
  );

DROP POLICY IF EXISTS "aln_comp_read" ON storage.objects;
CREATE POLICY "aln_comp_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'alineadores-comprobantes'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad')
      OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
    )
  );

SELECT 'Alineadores activado: orden del cliente + bucket archivos (fotos/RX/PDF) + comprobantes' AS status;
