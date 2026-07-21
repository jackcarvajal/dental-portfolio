-- =====================================================================
-- PANEL DE ENLACES (tipo Beacons) — configuración editable sin código
-- 2026-07-21 · proyecto zgihrwqfyvgyapbwzkvw
--
-- Guarda TODO lo editable de la página /links en una fila JSONB por negocio.
-- El panel /app/editar-links escribe aquí; la página pública /links lee de
-- aquí y se arma sola. Cambiar una reseña o subir una foto NO toca código.
--
-- Supabase es compartido: una sola tabla sirve a PRODIGY y a Alejandro,
-- separados por la columna `negocio` (igual que `pedidos`).
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.links_config (
  negocio     text PRIMARY KEY
              CHECK (negocio IN ('prodigy','alejandrocadcam')),
  config      jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  text
);

ALTER TABLE public.links_config ENABLE ROW LEVEL SECURITY;

-- GRANT explícito (obligatorio para tablas nuevas desde oct-2026)
GRANT SELECT ON public.links_config TO anon, authenticated;
GRANT INSERT, UPDATE ON public.links_config TO authenticated;

-- ── RLS ───────────────────────────────────────────────────────────────
-- Lectura PÚBLICA: la página /links la ven visitantes sin sesión.
DROP POLICY IF EXISTS "links_config_public_read" ON public.links_config;
CREATE POLICY "links_config_public_read" ON public.links_config
  FOR SELECT TO anon, authenticated USING (true);

-- Escritura SOLO admin. El rol sale de app_metadata (NUNCA user_metadata).
DROP POLICY IF EXISTS "links_config_admin_write" ON public.links_config;
CREATE POLICY "links_config_admin_write" ON public.links_config
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "links_config_admin_update" ON public.links_config;
CREATE POLICY "links_config_admin_update" ON public.links_config
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── Storage: bucket público para fotos/videos de la galería ───────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('links-media', 'links-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Cualquiera puede VER las imágenes (la galería es pública).
DROP POLICY IF EXISTS "links_media_public_read" ON storage.objects;
CREATE POLICY "links_media_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'links-media');

-- Solo admin SUBE / BORRA imágenes de la galería.
DROP POLICY IF EXISTS "links_media_admin_write" ON storage.objects;
CREATE POLICY "links_media_admin_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'links-media'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "links_media_admin_delete" ON storage.objects;
CREATE POLICY "links_media_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'links-media'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ── Semillas: una fila por negocio (config vacía = la página usa sus
--    valores por defecto del código) ───────────────────────────────────
INSERT INTO public.links_config (negocio, config) VALUES
  ('prodigy', '{}'::jsonb),
  ('alejandrocadcam', '{}'::jsonb)
ON CONFLICT (negocio) DO NOTHING;

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────
-- SELECT negocio, config FROM public.links_config;                 -- 2 filas
-- SELECT policyname FROM pg_policies WHERE tablename='links_config';-- 3
-- SELECT id, public FROM storage.buckets WHERE id='links-media';   -- public=t
--
-- Prueba (como admin, desde /app/editar-links):
--   editar una reseña -> Guardar -> abrir /links -> debe verse el cambio.
-- =====================================================================
