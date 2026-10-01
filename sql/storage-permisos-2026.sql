-- ================================================================
-- PRODIGY + Alejandro — PERMISOS DE ARCHIVOS (Storage) · cierre de la auditoría de archivos (1-oct-2026)
-- Hallazgos del diagnóstico (sql/diagnostico-archivos-2026.sql):
--  🔴 dental-cases y pedidos-archivos: CUALQUIERA sin sesión podía listar y bajar todos los archivos
--     (políticas dental_cases_read_public / pedidos_read_public). Hoy están vacíos: se cierra antes de que haya datos.
--  🔴 «Admin sube portafolio» decidía con user_metadata (lo edita el propio usuario) → cualquiera podía subir.
--  🔴 evidencias-entrega: cualquier usuario registrado podía ver y subir evidencias (auth_read / auth_upload).
--  🔴 «pedidos-archivos bdw3eu_0» no fijaba el bucket: cualquiera con sesión subía a CUALQUIER bucket
--     (incluido «portafolio», que es público) dentro de una carpeta con su id.
--  🟠 scanner-uploads tenía una política sin filtro de extensión que anulaba la que sí filtra.
--  🟠 Los buckets diseno-archivos y prodigy-files NO EXISTÍAN: fallaban el comprobante y las fotos del
--     portal del cliente, las fotos de la revisión del diseño y la subida masiva del panel de operación.
--  🟠 Varias políticas de equipo usan roles que ya no existen ('operario','staff'): el rol real es 'operator', etc.
-- Lo que NO cambia: el portafolio sigue público; los enlaces firmados ya entregados siguen funcionando
-- (no dependen de estas políticas); el doctor sigue viendo y bajando lo de SUS pedidos.
-- Roles solo de app_metadata (nunca user_metadata). Admins por lista fija de correos.
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- ── 0) Funciones de apoyo ───────────────────────────────────────
-- Equipo del laboratorio (cualquier rol de staff, no clientes ni cuentas de prueba)
CREATE OR REPLACE FUNCTION public.es_equipo_lab() RETURNS boolean
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT COALESCE(
       lower(auth.jwt() ->> 'email') = ANY (ARRAY['jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'])
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = ANY (ARRAY['admin','operator','operario','staff','diseno','fresado','impresion','calidad','taller','secretaria','contabilidad','mensajero','encargado_inventario'])
    OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb)) r
                WHERE r = ANY (ARRAY['admin','operator','operario','staff','diseno','fresado','impresion','calidad','taller','secretaria','contabilidad','mensajero','encargado_inventario'])),
    false);
$$;
-- Solo administración
CREATE OR REPLACE FUNCTION public.es_admin_lab() RETURNS boolean
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT COALESCE(
       lower(auth.jwt() ->> 'email') = ANY (ARRAY['jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'])
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin',
    false);
$$;
-- ¿La carpeta es un pedido de quien pregunta? (dueño por user_id o por correo, igual que el portal)
CREATE OR REPLACE FUNCTION public.es_dueno_pedido(p_carpeta text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.pedidos p
     WHERE p.id::text = p_carpeta
       AND (p.user_id = auth.uid() OR lower(p.email) = lower(auth.jwt() ->> 'email')));
$$;
-- ¿Existe el pedido? (la revisión del diseño se abre con el id del pedido, a veces sin sesión)
CREATE OR REPLACE FUNCTION public.pedido_existe(p_carpeta text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.pedidos p WHERE p.id::text = p_carpeta);
$$;
REVOKE ALL ON FUNCTION public.es_dueno_pedido(text), public.pedido_existe(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.es_equipo_lab(), public.es_admin_lab(), public.es_dueno_pedido(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pedido_existe(text) TO anon, authenticated;

-- ── 1) Buckets que el código usa y no existían (privados) ──────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('diseno-archivos', 'diseno-archivos', false, 52428800, NULL),
  ('prodigy-files',   'prodigy-files',   false, 20971520, ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ── 2) Quitar lo abierto de más ─────────────────────────────────
DROP POLICY IF EXISTS "dental_cases_read_public"    ON storage.objects;
DROP POLICY IF EXISTS "pedidos_read_public"         ON storage.objects;
DROP POLICY IF EXISTS "pedidos_archivos_anon_read"  ON storage.objects;
DROP POLICY IF EXISTS "Admin sube portafolio"       ON storage.objects;
DROP POLICY IF EXISTS "auth_read"                   ON storage.objects;
DROP POLICY IF EXISTS "auth_upload"                 ON storage.objects;
DROP POLICY IF EXISTS "mensajero_upload_evidencias" ON storage.objects;
DROP POLICY IF EXISTS "pedidos-archivos bdw3eu_0"   ON storage.objects;
DROP POLICY IF EXISTS "scanner-uploads 1xo7k5f_0"   ON storage.objects;

-- ── 3) dental-cases (diseños: carpeta = id del pedido) ──────────
DROP POLICY IF EXISTS "dc_doctor_lee_su_pedido" ON storage.objects;
CREATE POLICY "dc_doctor_lee_su_pedido" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'dental-cases' AND public.es_dueno_pedido((storage.foldername(name))[1]));
DROP POLICY IF EXISTS "dc_equipo_todo" ON storage.objects;
CREATE POLICY "dc_equipo_todo" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'dental-cases' AND public.es_equipo_lab())
  WITH CHECK (bucket_id = 'dental-cases' AND public.es_equipo_lab());
DROP POLICY IF EXISTS "dc_admin_sube_portafolio" ON storage.objects;
CREATE POLICY "dc_admin_sube_portafolio" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dental-cases' AND (storage.foldername(name))[1] = 'portafolio' AND public.es_admin_lab());

-- ── 4) pedidos-archivos (lo que sube el doctor al pedir: carpeta = su id, o «anon» sin sesión) ──
DROP POLICY IF EXISTS "pa_dueno_lee" ON storage.objects;
CREATE POLICY "pa_dueno_lee" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'pedidos-archivos' AND (storage.foldername(name))[1] = auth.uid()::text);
-- Sin sesión: solo lo recién subido (el flujo pide su enlace firmado justo después de subir)
DROP POLICY IF EXISTS "pa_recien_subido_lee" ON storage.objects;
CREATE POLICY "pa_recien_subido_lee" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'pedidos-archivos' AND (storage.foldername(name))[1] = 'anon' AND created_at > now() - interval '15 minutes');
DROP POLICY IF EXISTS "pa_equipo_todo" ON storage.objects;
CREATE POLICY "pa_equipo_todo" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'pedidos-archivos' AND public.es_equipo_lab())
  WITH CHECK (bucket_id = 'pedidos-archivos' AND public.es_equipo_lab());

-- ── 5) evidencias-entrega (fotos del mensajero, calidad, taller, inventario) ──
DROP POLICY IF EXISTS "ev_equipo_todo" ON storage.objects;
CREATE POLICY "ev_equipo_todo" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'evidencias-entrega' AND public.es_equipo_lab())
  WITH CHECK (bucket_id = 'evidencias-entrega' AND public.es_equipo_lab());

-- ── 6) diseno-archivos (diseños de operación/producción: carpeta = id del pedido) ──
DROP POLICY IF EXISTS "da_equipo_todo" ON storage.objects;
CREATE POLICY "da_equipo_todo" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'diseno-archivos' AND public.es_equipo_lab())
  WITH CHECK (bucket_id = 'diseno-archivos' AND public.es_equipo_lab());
DROP POLICY IF EXISTS "da_doctor_lee_su_pedido" ON storage.objects;
CREATE POLICY "da_doctor_lee_su_pedido" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'diseno-archivos' AND public.es_dueno_pedido((storage.foldername(name))[1]));
-- Revisión del diseño (revision-diseno.html): el doctor sube fotos de cambios/notas o el comprobante,
-- a veces sin sesión. Solo en un pedido que existe, solo esas subcarpetas y solo imágenes/PDF.
DROP POLICY IF EXISTS "da_revision_sube" ON storage.objects;
CREATE POLICY "da_revision_sube" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'diseno-archivos'
              AND (storage.foldername(name))[2] = ANY (ARRAY['cambios','notas','comprobante'])
              AND name ~* '\.(jpe?g|png|webp|heic|pdf)$'
              AND public.pedido_existe((storage.foldername(name))[1]));
DROP POLICY IF EXISTS "da_revision_recien_subido_lee" ON storage.objects;
CREATE POLICY "da_revision_recien_subido_lee" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'diseno-archivos'
         AND (storage.foldername(name))[2] = ANY (ARRAY['cambios','notas','comprobante'])
         AND created_at > now() - interval '15 minutes');

-- ── 7) prodigy-files (portal del cliente: feedback/<pedido>/… y comprobantes/<pedido>/…) ──
DROP POLICY IF EXISTS "pf_dueno_todo" ON storage.objects;
CREATE POLICY "pf_dueno_todo" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'prodigy-files' AND (storage.foldername(name))[1] = ANY (ARRAY['feedback','comprobantes'])
         AND public.es_dueno_pedido((storage.foldername(name))[2]))
  WITH CHECK (bucket_id = 'prodigy-files' AND (storage.foldername(name))[1] = ANY (ARRAY['feedback','comprobantes'])
              AND public.es_dueno_pedido((storage.foldername(name))[2]));
DROP POLICY IF EXISTS "pf_equipo_todo" ON storage.objects;
CREATE POLICY "pf_equipo_todo" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'prodigy-files' AND public.es_equipo_lab())
  WITH CHECK (bucket_id = 'prodigy-files' AND public.es_equipo_lab());

-- ── Verificación: quién puede LEER cada bucket privado sin sesión (debe quedar solo lo marcado) ──
SELECT policyname AS politica, cmd AS accion, roles::text AS para,
       CASE WHEN qual ILIKE '%15 minutes%' THEN '✓ solo lo recién subido'
            WHEN qual ILIKE '%portafolio%' OR qual ILIKE '%links-media%' THEN '✓ público a propósito'
            ELSE '⚠ REVISAR' END AS lectura_sin_sesion
  FROM pg_policies
 WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd IN ('SELECT','ALL')
   AND (roles::text ILIKE '%anon%' OR roles::text ILIKE '%public%')
 ORDER BY 1;
