-- ============================================================
-- PRODIGY — Mass assignment / IDOR en otras tablas (auditoría estilo pentest)
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Contexto (2026-07-10): tras corregir el mass assignment de
-- pedidos.pago_estado/estado_operativo, se auditaron sistemáticamente
-- las demás tablas con INSERT abierto a anon/authenticated. 4 hallazgos:
--
-- 1) newsletter_subscribers: la policy "unsubscribe_self" permitía a
--    CUALQUIERA (sin autenticar, sin token) desactivar la suscripción
--    de CUALQUIER email de la tabla con un simple PATCH — no validaba
--    ownership. Ya existe la RPC segura newsletter_unsubscribe(p_token)
--    que sí valida por token; la policy insegura era redundante y
--    peligrosa (permitía sabotear la lista de marketing completa).
-- 2) cotizaciones: INSERT sin restricción permitía crear una cotización
--    ya con estado='aceptada' y vincularla a un pedido_id ajeno.
-- 3) solicitudes_scanner: INSERT sin restricción permitía marcar la
--    propia solicitud como estado='cerrado'/contactado=true desde el
--    origen, ocultándola de la cola de gestión de leads del staff.
-- 4) waitlist_labs: mismo patrón, estado podía llegar ya en
--    'convertido', contaminando métricas de conversión.
-- ============================================================

-- ── 1. newsletter_subscribers: quitar el UPDATE inseguro sin ownership ──
DROP POLICY IF EXISTS "unsubscribe_self" ON public.newsletter_subscribers;
-- El unsubscribe legítimo sigue funcionando vía newsletter_unsubscribe(p_token),
-- que sí valida el token único de cada suscriptor.

-- ── 2. cotizaciones: forzar estado inicial + bloquear vínculo a pedido ajeno ──
DROP POLICY IF EXISTS "cotiz_anon_insert" ON public.cotizaciones;
CREATE POLICY "cotiz_anon_insert" ON public.cotizaciones
  FOR INSERT TO anon, authenticated
  WITH CHECK (estado = 'borrador' AND pedido_id IS NULL);

-- ── 3. solicitudes_scanner: forzar estado inicial ──
DROP POLICY IF EXISTS "public_insert_scanner" ON solicitudes_scanner;
CREATE POLICY "public_insert_scanner" ON solicitudes_scanner
    FOR INSERT TO anon, authenticated
    WITH CHECK (estado = 'nuevo' AND contactado = false AND cotizacion IS NULL);

-- ── 4. waitlist_labs: forzar estado inicial ──
DROP POLICY IF EXISTS "waitlist_anon_insert" ON public.waitlist_labs;
CREATE POLICY "waitlist_anon_insert" ON public.waitlist_labs
  FOR INSERT TO anon, authenticated
  WITH CHECK (estado = 'pendiente');

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT policyname FROM pg_policies WHERE tablename='newsletter_subscribers' AND policyname='unsubscribe_self';
--   → debe devolver 0 filas
-- SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('cotizaciones','solicitudes_scanner','waitlist_labs') AND cmd='INSERT';
--   → confirmar que las policies existen con los nombres de arriba
