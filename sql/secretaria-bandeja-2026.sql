-- ================================================================
-- PRODIGY — Rol «secretaria»: su panel de entrada es la Bandeja de solicitudes (escáner y domicilio).
-- La página ya la deja entrar; faltaba que la base le dejara VER y ACTUALIZAR esas solicitudes
-- (las políticas actuales solo cubren admin / operator / correos admin). No puede borrar.
-- Políticas ADICIONALES (no toca las existentes). Rol desde app_metadata, nunca user_metadata.
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

DROP POLICY IF EXISTS "secretaria_ve_scanner" ON public.solicitudes_scanner;
CREATE POLICY "secretaria_ve_scanner" ON public.solicitudes_scanner FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'secretaria');
DROP POLICY IF EXISTS "secretaria_actualiza_scanner" ON public.solicitudes_scanner;
CREATE POLICY "secretaria_actualiza_scanner" ON public.solicitudes_scanner FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'secretaria')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'secretaria');

DROP POLICY IF EXISTS "secretaria_ve_citas" ON public.citas_domicilio;
CREATE POLICY "secretaria_ve_citas" ON public.citas_domicilio FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'secretaria');
DROP POLICY IF EXISTS "secretaria_actualiza_citas" ON public.citas_domicilio;
CREATE POLICY "secretaria_actualiza_citas" ON public.citas_domicilio FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'secretaria')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'secretaria');

-- Verificación: deben salir 4 filas
SELECT tablename, policyname, cmd FROM pg_policies
 WHERE schemaname = 'public' AND policyname LIKE 'secretaria_%' AND tablename IN ('solicitudes_scanner','citas_domicilio')
 ORDER BY tablename, policyname;
