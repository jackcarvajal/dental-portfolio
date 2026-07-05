-- ============================================================
-- PRODIGY — newsletter_subscribers: UPDATE anónimo sin filtro (mass-unsubscribe)
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-04): la política "unsubscribe_self"
-- (FOR UPDATE TO anon USING(true) WITH CHECK(activo=false)) no filtra
-- por email ni por unsubscribe_token — solo exige que el valor final
-- sea activo=false. Cualquier visitante sin sesión podía ejecutar:
--   supabase.from('newsletter_subscribers').update({activo:false}).neq('id', crypto.randomUUID())
-- y desactivar TODOS los suscriptores de la lista de una sola vez.
-- Ya existe la RPC newsletter_unsubscribe(p_token) (SECURITY DEFINER,
-- filtra por token real) que cubre el caso de uso legítimo — no hay
-- ningún llamador en el código que use UPDATE directo a la tabla.
-- Fix: eliminar la política de UPDATE anónimo directo.
-- ============================================================

DROP POLICY IF EXISTS "unsubscribe_self" ON public.newsletter_subscribers;

SELECT 'patch-newsletter-unsubscribe-idor-2026 aplicado' AS status;
