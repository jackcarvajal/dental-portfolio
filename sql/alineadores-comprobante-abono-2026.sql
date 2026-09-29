-- ================================================================
-- PRODIGY — Alineadores: comprobante de los ABONOS a la técnica
-- · El admin sube el comprobante del pago (captura del banco) al registrar el abono: carpeta 'tecnica/' del
--   bucket privado 'alineadores-comprobantes'.
-- · La técnica (rol alineadores) puede VER los comprobantes de 'tecnica/' (sus abonos). Nada más del bucket.
-- · El cliente sigue igual: solo sube y ve su propia carpeta.
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================
DROP POLICY IF EXISTS "aln_comp_insert" ON storage.objects;
CREATE POLICY "aln_comp_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'alineadores-comprobantes'
    AND name ~* '\.(jpe?g|png|webp|pdf)$'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (
        (storage.foldername(name))[1] = 'tecnica'
        AND (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad')
             OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'))
      )
    )
  );

DROP POLICY IF EXISTS "aln_comp_read" ON storage.objects;
CREATE POLICY "aln_comp_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'alineadores-comprobantes'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad')
      OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
      OR (
        (storage.foldername(name))[1] = 'tecnica'
        AND (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') = 'alineadores'
             OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles','[]'::jsonb) ?| ARRAY['alineadores'])
      )
    )
  );

SELECT 'Comprobantes de abonos a la técnica: el admin sube a tecnica/, la técnica los ve' AS status;
