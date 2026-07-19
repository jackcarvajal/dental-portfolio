-- =====================================================================
-- EL DOCTOR NO PODÍA VER SUS PROPIOS PEDIDOS
-- 2026-07-19 · proyecto zgihrwqfyvgyapbwzkvw
--
-- ── EL PROBLEMA ──────────────────────────────────────────────────────
-- Tres piezas de la misma cadena apuntaban a columnas distintas:
--
--   1. Los flujos guardaban el pedido SIN `email` ni `user_id`
--      (corregido hoy en el JS: si hay sesión, ahora se guardan ambos).
--
--   2. app/client-panel.html lista los casos con:
--         .eq('email', email)
--
--   3. Pero la ÚNICA política de SELECT para clientes es:
--         pedidos_select_owner → USING (doctor_uid = auth.uid())
--      y `doctor_uid` no lo escribe ningún flujo.
--
-- Resultado: aunque el doctor iniciara sesión, RLS le negaba todas las filas.
-- Su panel salía vacío. Nadie lo notó porque la tabla `pedidos` llevaba
-- vacía desde siempre (ver patch-pedidos-insert-anon-2026-07.sql).
--
-- ── QUÉ HACE ESTE PARCHE ─────────────────────────────────────────────
-- Políticas que reconocen al dueño por CUALQUIERA de las tres vías, para
-- que funcione tanto con los pedidos nuevos como con los que ya existan.
-- =====================================================================

-- ── 1 · Ver sus pedidos ──────────────────────────────────────────────
DROP POLICY IF EXISTS "pedidos_select_cliente" ON public.pedidos;
CREATE POLICY "pedidos_select_cliente" ON public.pedidos
  FOR SELECT TO authenticated
  USING (
    user_id    = auth.uid()
    OR doctor_uid = auth.uid()
    OR (email IS NOT NULL AND email = auth.email())
  );

-- ── 2 · Actuar sobre sus pedidos ─────────────────────────────────────
-- El doctor sube su comprobante de pago (pago_estado='pago_subido') y fotos
-- de feedback desde su panel. Sin UPDATE esas acciones fallaban en silencio.
--
-- Las columnas sensibles siguen protegidas por el trigger
-- trg_restrict_client_pedido_updates (patch-rls-client-column-protection.sql):
-- esta política abre la fila, no las columnas. El doctor no puede darse por
-- pagado ni cambiar el precio.
DROP POLICY IF EXISTS "pedidos_update_cliente" ON public.pedidos;
CREATE POLICY "pedidos_update_cliente" ON public.pedidos
  FOR UPDATE TO authenticated
  USING (
    user_id    = auth.uid()
    OR doctor_uid = auth.uid()
    OR (email IS NOT NULL AND email = auth.email())
  )
  WITH CHECK (
    user_id    = auth.uid()
    OR doctor_uid = auth.uid()
    OR (email IS NOT NULL AND email = auth.email())
  );

-- ── 3 · Sus archivos en pedido_archivos ──────────────────────────────
-- La política pedarch_cliente_select ya contempla email y user_id
-- (ver patch-pedido-archivos-2026-07.sql), así que no hace falta tocarla.

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────
-- 1) Las políticas existen:
--    SELECT policyname, cmd FROM pg_policies
--     WHERE tablename = 'pedidos' AND policyname LIKE '%cliente%';
--    → 2 filas (SELECT y UPDATE)
--
-- 2) PRUEBA REAL — es la que importa:
--    a. Inicia sesión como el usuario de prueba del cliente.
--    b. Crea un caso desde /flujo-diseno (con la sesión abierta, NO en
--       ventana privada — así el pedido queda con tu email).
--    c. Entra a /app/client-panel → el caso debe aparecer.
--       Antes de este parche el panel salía vacío aunque el pedido existiera.
--
-- 3) Si sigue vacío, confirma que el pedido guardó el email:
--    SELECT codigo, email, user_id FROM pedidos ORDER BY created_at DESC LIMIT 3;
--    Si email viene NULL, el JS no detectó la sesión: revisa que hayas
--    entrado al flujo CON la sesión abierta.
-- =====================================================================
