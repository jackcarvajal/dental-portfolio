-- ================================================================
-- "¿Algo no funciona?" — fase 2: asistente IA (Claude) + separación por negocio
-- Tabla COMPARTIDA PRODIGY ↔ Alejandro CAD/CAM (columna negocio): se corre UNA vez.
-- 1) Columnas del asistente: aviso retenido mientras la IA intenta resolver,
--    marca de "resuelto por la IA", conversación y análisis para el equipo.
-- 2) RLS por negocio: jackalejandroc ve ambos; el resto del equipo PRODIGY solo PRODIGY.
-- 3) Capturas: rutas <negocio>/<yyyy-mm>/<uuid>.jpg con la misma separación.
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

ALTER TABLE public.reportes_web
  ADD COLUMN IF NOT EXISTS aviso_pendiente boolean NOT NULL DEFAULT false,   -- WhatsApp retenido mientras la IA ayuda
  ADD COLUMN IF NOT EXISTS resuelto_por_ia boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS chat_ia         jsonb,                            -- [{role, content}] con la persona
  ADD COLUMN IF NOT EXISTS analisis_ia     text;                             -- diagnóstico para el equipo

CREATE INDEX IF NOT EXISTS idx_reportes_web_negocio ON public.reportes_web (negocio, created_at DESC);

-- Equipo: dueño ve ambos negocios; admins/roles de PRODIGY solo PRODIGY
DROP POLICY IF EXISTS "equipo_gestiona_reportes" ON public.reportes_web;
CREATE POLICY "equipo_gestiona_reportes" ON public.reportes_web
  FOR ALL TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'jackalejandroc@gmail.com'
    OR (negocio = 'prodigy' AND (
         (auth.jwt() ->> 'email') IN ('labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
         OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','secretaria')))
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'jackalejandroc@gmail.com'
    OR (negocio = 'prodigy' AND (
         (auth.jwt() ->> 'email') IN ('labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
         OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','secretaria')))
  );

DROP POLICY IF EXISTS "reportes_capturas_equipo_lee" ON storage.objects;
CREATE POLICY "reportes_capturas_equipo_lee" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'reportes-capturas'
    AND (
      (auth.jwt() ->> 'email') = 'jackalejandroc@gmail.com'
      OR ((storage.foldername(name))[1] = 'prodigy' AND (
           (auth.jwt() ->> 'email') IN ('labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
           OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','secretaria')))
    )
  );

SELECT 'reportes_web fase IA lista: columnas + RLS por negocio' AS status;
