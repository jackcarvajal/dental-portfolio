-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- PUSH — suscripciones a notificaciones del navegador (oct-2026)
-- 100 % IDEMPOTENTE · Copiar TODO → SQL Editor → Run
--
-- Lo detectó el Panel de pruebas (Seguridad → políticas):
--  1. "push_select_own" (anon, USING true): cualquiera sin sesión leía TODAS las suscripciones (direcciones de
--     notificación del navegador, caso y usuario). Nadie la necesita: el envío (send-push) usa service_role.
--  2. "push_insert_anon" / "push_insert_auth" (WITH CHECK true): cualquiera podía guardar una suscripción con el
--     user_id de OTRA persona (p. ej. del admin) y recibir sus notificaciones. Ahora:
--       · sin sesión → solo suscripciones de seguimiento de un caso, sin user_id
--       · con sesión → sin user_id o con el propio
-- El front (seguimiento-caso, ambos repos) ya guarda con insert simple, que no necesita leer la tabla.
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "push_select_own" ON public.push_subscriptions;

DROP POLICY IF EXISTS "push_insert_anon" ON public.push_subscriptions;
CREATE POLICY "push_insert_anon" ON public.push_subscriptions
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "push_insert_auth" ON public.push_subscriptions;
CREATE POLICY "push_insert_auth" ON public.push_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- ── VERIFICACIÓN ─────────────────────────────────────────────────────────────────────────────────
-- Debe dar: select_anon = 0 · insert_anon = "(user_id IS NULL)" · insert_auth = "((user_id IS NULL) OR (user_id = auth.uid()))"
SELECT
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'push_subscriptions'
      AND cmd IN ('SELECT','ALL') AND roles && ARRAY['anon']::name[])                                    AS select_anon,
  (SELECT with_check FROM pg_policies WHERE schemaname = 'public' AND tablename = 'push_subscriptions'
      AND policyname = 'push_insert_anon')                                                              AS insert_anon,
  (SELECT with_check FROM pg_policies WHERE schemaname = 'public' AND tablename = 'push_subscriptions'
      AND policyname = 'push_insert_auth')                                                              AS insert_auth;
