-- =====================================================================
-- 🔴 CRÍTICO — NINGÚN PEDIDO SE ESTABA GUARDANDO
-- 2026-07-19 · proyecto zgihrwqfyvgyapbwzkvw
--
-- ── EL HALLAZGO ──────────────────────────────────────────────────────
--   SELECT negocio, count(*) FROM pedidos GROUP BY negocio;  → 0 filas
--
-- La tabla `pedidos` está VACÍA. Nunca se guardó un pedido.
--
-- ── LA CAUSA ─────────────────────────────────────────────────────────
-- La única política de INSERT sobre `pedidos` es:
--
--   CREATE POLICY "pedidos_insert_owner" ON pedidos
--     FOR INSERT TO authenticated WITH CHECK (doctor_uid = auth.uid());
--
-- Dos problemas, cada uno suficiente para bloquear TODO:
--
--   1. `TO authenticated` — los flujos públicos (flujo-diseno, fresado,
--      lab, impresion) se llenan SIN LOGIN. El rol es `anon`, que no
--      aparece en ninguna política de INSERT → rechazo garantizado.
--
--   2. `WITH CHECK (doctor_uid = auth.uid())` — el JS de los flujos NO
--      envía `doctor_uid` en el INSERT. Así que incluso un doctor que sí
--      hubiera iniciado sesión sería rechazado: NULL = auth.uid() es NULL,
--      y un WITH CHECK que no da TRUE deniega.
--
-- ── POR QUÉ NADIE SE ENTERÓ ──────────────────────────────────────────
-- Los cuatro flujos hacen lo mismo con el error:
--     .then(({ error: _e }) => { if (_e) console.warn('… no guardado:', …) })
-- Solo un console.warn. El doctor ve "¡Orden registrada!", el WhatsApp sale
-- normal, y el pedido nunca existió. El negocio ha funcionado a punta del
-- mensaje de WhatsApp sin que la base tuviera un solo registro.
--
-- Es el mismo patrón que el CBCT que se perdía: el fallo existe, pero es MUDO.
--
-- ── NOTA SOBRE LA AUDITORÍA ANTERIOR ─────────────────────────────────
-- patch-mass-assignment-insert-pedidos-2026-07.sql razonó sobre "un doctor
-- AUTENTICADO podía hacer un INSERT con pago_estado='pago_confirmado'".
-- La premisa era incorrecta: en estos flujos nadie está autenticado. El
-- trigger que creó (trg_forzar_estado_inicial_pedido) sigue siendo correcto
-- y necesario — de hecho es lo que hace SEGURO abrir el INSERT a anon.
--
-- ── QUÉ HACE ESTE PARCHE ─────────────────────────────────────────────
-- Permite el INSERT desde los flujos públicos, con guardas.
-- =====================================================================

-- ── 1 · INSERT desde los flujos públicos (sin sesión) ────────────────
-- Es seguro porque:
--   · trg_forzar_estado_inicial_pedido (ya instalado) sobrescribe
--     pago_estado, estado_operativo y factura_estado con valores iniciales,
--     sin importar lo que venga en el INSERT → no se puede nacer "pagado".
--   · trg_precio_sospechoso (ya instalado) avisa si el precio viene alterado.
--   · Las guardas de abajo impiden reclamar el pedido de otra persona
--     y exigen los campos mínimos para que sea un pedido real, no basura.
DROP POLICY IF EXISTS "pedidos_insert_flujo_publico" ON public.pedidos;
CREATE POLICY "pedidos_insert_flujo_publico" ON public.pedidos
  FOR INSERT TO anon
  WITH CHECK (
    -- No puede atribuirse a ningún usuario: un anónimo no representa a nadie
    doctor_uid IS NULL
    AND user_id IS NULL
    -- Debe declarar a qué negocio pertenece (separa PRODIGY de Alejandro)
    AND negocio IN ('prodigy', 'alejandrocadcam')
    -- Campos mínimos de un pedido real
    AND codigo IS NOT NULL AND length(codigo) BETWEEN 4 AND 60
    AND nombre_doctor IS NOT NULL AND length(nombre_doctor) BETWEEN 2 AND 120
    -- Techo de cordura: bloquea basura y montos absurdos.
    -- No valida el precio correcto (eso lo hace calcularTotal, INTOCABLE);
    -- solo descarta lo que no puede ser un pedido legítimo.
    AND COALESCE(precio_total, 0) >= 0
    AND COALESCE(precio_total, 0) < 100000000
  );

-- ── 2 · INSERT de un doctor con sesión iniciada ──────────────────────
-- La política vieja exigía doctor_uid = auth.uid(), pero el JS de los flujos
-- nunca envía doctor_uid. Se reemplaza por una que acepta ambos casos:
-- que no lo mande (lo normal) o que lo mande correctamente.
DROP POLICY IF EXISTS "pedidos_insert_owner" ON public.pedidos;
CREATE POLICY "pedidos_insert_owner" ON public.pedidos
  FOR INSERT TO authenticated
  WITH CHECK (
    (doctor_uid IS NULL OR doctor_uid = auth.uid())
    AND (user_id    IS NULL OR user_id    = auth.uid())
    AND negocio IN ('prodigy', 'alejandrocadcam')
    AND codigo IS NOT NULL
    AND COALESCE(precio_total, 0) >= 0
    AND COALESCE(precio_total, 0) < 100000000
  );

-- ── 3 · El anónimo NO puede leer pedidos ─────────────────────────────
-- Se abre solo el INSERT. Sin política de SELECT para anon, nadie puede
-- listar ni leer pedidos ajenos: escribe y no ve nada. Se deja explícito
-- para que quede claro que la omisión es deliberada, no un olvido.
--   (El seguimiento público usa hash_seguridad con su propia política.)

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────
-- 1) Las políticas quedaron:
--    SELECT policyname, roles, cmd FROM pg_policies
--     WHERE tablename = 'pedidos' AND cmd = 'INSERT';
--
-- 2) El trigger de estado inicial sigue puesto (es lo que hace seguro el punto 1):
--    SELECT tgname FROM pg_trigger
--     WHERE tgrelid = 'pedidos'::regclass
--       AND tgname = 'trg_forzar_estado_inicial_pedido';
--
-- 3) PRUEBA REAL — la que importa:
--    Abre https://prodigylabdental.com/flujo-diseno en una ventana privada
--    (sin sesión), llena un caso de prueba y envíalo. Luego:
--       SELECT codigo, nombre_doctor, negocio, estado, estado_operativo,
--              pago_estado, created_at
--       FROM pedidos ORDER BY created_at DESC LIMIT 5;
--    Debe aparecer, con estado_operativo='VALIDACION_PENDIENTE' y
--    pago_estado='pendiente' (forzados por el trigger).
--
-- 4) Limpia el pedido de prueba cuando termines:
--    DELETE FROM pedidos WHERE codigo = '<el codigo de la prueba>';
--
-- ── PENDIENTE APARTE ─────────────────────────────────────────────────
-- Este parche desbloquea el guardado. La otra mitad del problema es que el
-- fallo era MUDO: se corrige en el JS de los cuatro flujos, mostrando el
-- error al usuario y registrándolo en logs_incidencias en vez de un
-- console.warn que nadie lee.
