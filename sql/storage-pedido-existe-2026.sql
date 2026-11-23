-- ================================================================
-- PRODIGY + Alejandro CAD/CAM — Las subidas de archivos desde la web fallan desde el 18-nov-2026
-- Auditoría de flujos de pedido, 23-nov-2026.
--
-- Problema: sql/seguridad-rpc-publicas-2026.sql (corrido el 18-nov) le quitó a anon y authenticated el
-- permiso de ejecutar public.pedido_existe(text). Esa función la usa la política de Storage
-- «da_revision_sube» (INSERT, roles anon y authenticated). Postgres revisa el permiso de TODAS las
-- funciones de las políticas al insertar, aunque el archivo vaya a otro bucket: desde entonces cualquier
-- subida desde la web falla con «permission denied for function pedido_existe». Afecta «Envía tu escáner»
-- (las dos webs), alineadores, los archivos de los flujos, los comprobantes y también las subidas del equipo.
--
-- Comprobado el 23-nov con una prueba que se revierte sola: sin el permiso, 0 de 6 subidas pasan; con el
-- permiso, pasan escáner, alineadores, archivos requeridos, comprobante y PDF.
--
-- pedido_existe solo dice si existe un pedido con ese UUID (no devuelve datos): se devuelve el permiso,
-- tal como estaba en sql/storage-permisos-2026.sql. seguridad-rpc-publicas-2026.sql ya no lo vuelve a quitar.
--
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

GRANT EXECUTE ON FUNCTION public.pedido_existe(text) TO anon, authenticated;

-- Verificación (debe dar: anon_puede = true · authenticated_puede = true)
SELECT has_function_privilege('anon', 'public.pedido_existe(text)', 'execute')          AS anon_puede,
       has_function_privilege('authenticated', 'public.pedido_existe(text)', 'execute') AS authenticated_puede;
