-- =====================================================================
-- FIX — políticas que consultan auth.users y rompen para usuarios logueados
-- Auditoría 2026-07-18 · proyecto zgihrwqfyvgyapbwzkvw
--
-- SÍNTOMA: en /app/pruebas-carga → "Verificar todas las tablas",
--   `cotizaciones` y `referidos` salían en ❌ SIN mensaje de error, mientras
--   que un visitante anónimo sí podía consultarlas (HTTP 200).
--
-- CAUSA: dos políticas hacen  (SELECT email FROM auth.users WHERE id = auth.uid())
--   El rol `authenticated` NO tiene permiso de lectura sobre el esquema `auth`,
--   así que la política LANZA UN ERROR en vez de simplemente denegar. Como esas
--   políticas son TO authenticated, el fallo aparecía solo al estar logueado.
--   Además `cotiz_auth_select` compara `user_id`, columna que NO existe en
--   `cotizaciones` (el campo real es `doctor_email`).
--
-- SOLUCIÓN: usar  auth.email()  — función oficial de Supabase que devuelve el
--   email del JWT sin tocar la tabla auth.users. Es la forma correcta y además
--   más rápida (no hace subconsulta).
-- =====================================================================

-- ── cotizaciones: el doctor ve sus propias cotizaciones ───────────────
DROP POLICY IF EXISTS "cotiz_auth_select" ON public.cotizaciones;
CREATE POLICY "cotiz_auth_select" ON public.cotizaciones
  FOR SELECT TO authenticated
  USING (doctor_email = auth.email());

-- ── referidos: el referidor ve los referidos que generó ───────────────
DROP POLICY IF EXISTS "ref_auth_select" ON public.referidos;
CREATE POLICY "ref_auth_select" ON public.referidos
  FOR SELECT TO authenticated
  USING (referidor_email = auth.email());


-- ── ¿Hay más políticas con el mismo problema? ─────────────────────────
-- Ejecuta esto para detectarlas (debe devolver 0 filas tras el parche):
--
--   SELECT tablename, policyname
--   FROM pg_policies
--   WHERE schemaname = 'public'
--     AND (qual LIKE '%auth.users%' OR with_check LIKE '%auth.users%');
--
-- Si aparece alguna, reemplaza  (SELECT email FROM auth.users ...)  por
-- auth.email()  y  (SELECT id FROM auth.users ...)  por  auth.uid().

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────
-- En /app/pruebas-carga pulsa "Verificar todas las tablas":
-- cotizaciones y referidos deben salir en verde con su conteo de filas.
