-- ================================================================
-- PRODIGY — "¿Algo no funciona?": reportes de la web (usuarios + errores automáticos)
-- Los reportes ENTRAN solo por la función /api/reportar-problema (service_role):
-- valida, limita por IP, identifica al usuario desde su sesión y avisa por WhatsApp.
-- Aquí: tabla, RLS (el equipo gestiona; cada usuario ve los suyos) y bucket de capturas.
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

CREATE TABLE IF NOT EXISTS public.reportes_web (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  folio        bigint      GENERATED ALWAYS AS IDENTITY,          -- número corto para el usuario: R-<folio>
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  negocio      text        NOT NULL DEFAULT 'prodigy',
  origen       text        NOT NULL DEFAULT 'usuario',            -- usuario | automatico
  tipo         text        NOT NULL DEFAULT 'otro',               -- archivos | pagos | no_carga | datos | sugerencia | otro | error_js
  descripcion  text,
  pagina       text,
  user_id      uuid,
  email        text,
  rol          text,
  contacto     text,                                              -- si no tiene sesión y deja un medio de contacto
  navegador    text,
  dispositivo  text,
  pantalla     text,
  contexto     jsonb       NOT NULL DEFAULT '{}'::jsonb,          -- errores recientes, detalle técnico
  captura_url  text,                                              -- ruta en bucket reportes-capturas
  huella       text,                                              -- agrupa errores automáticos repetidos
  veces        int         NOT NULL DEFAULT 1,
  estado       text        NOT NULL DEFAULT 'nuevo',              -- nuevo | en_revision | resuelto | descartado
  respuesta    text,
  resuelto_at  timestamptz
);
CREATE INDEX IF NOT EXISTS idx_reportes_web_estado ON public.reportes_web (estado, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reportes_web_huella ON public.reportes_web (huella) WHERE huella IS NOT NULL;

ALTER TABLE public.reportes_web ENABLE ROW LEVEL SECURITY;

-- Equipo que atiende los reportes: ve y actualiza todo
DROP POLICY IF EXISTS "equipo_gestiona_reportes" ON public.reportes_web;
CREATE POLICY "equipo_gestiona_reportes" ON public.reportes_web
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','secretaria')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','secretaria')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

-- Cada persona puede ver SUS reportes (para leer la respuesta)
DROP POLICY IF EXISTS "usuario_ve_sus_reportes" ON public.reportes_web;
CREATE POLICY "usuario_ve_sus_reportes" ON public.reportes_web
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Sin política de INSERT: solo entra por la función del servidor (service_role).

-- Bucket privado para capturas de pantalla (lo llena la función; lo lee el equipo)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('reportes-capturas', 'reportes-capturas', false, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp'];

DROP POLICY IF EXISTS "reportes_capturas_equipo_lee" ON storage.objects;
CREATE POLICY "reportes_capturas_equipo_lee" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'reportes-capturas'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','secretaria')
      OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
    )
  );

SELECT 'reportes_web listo: tabla + RLS + bucket reportes-capturas' AS status;
