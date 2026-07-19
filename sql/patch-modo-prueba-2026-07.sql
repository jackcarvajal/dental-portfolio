-- =====================================================================
-- MODO PRUEBA — pedidos de test con dinero ficticio
-- 2026-07-19 · proyecto zgihrwqfyvgyapbwzkvw
--
-- ── PARA QUÉ ─────────────────────────────────────────────────────────
-- Poder recorrer los flujos de punta a punta (subir archivos, diseñar,
-- aprobar, producir, despachar) sin pagar de verdad y sin ensuciar los
-- reportes. Hoy la única forma de probar es crear un pedido real.
--
-- ── CÓMO FUNCIONA ────────────────────────────────────────────────────
-- Un usuario con  app_metadata.role = 'test'  inicia sesión en el navegador.
-- js/modo-prueba.js detecta esa sesión y marca los pedidos con es_prueba=true.
-- El pago se da por confirmado sin cobrar nada.
--
-- ── POR QUÉ ES SEGURO ────────────────────────────────────────────────
-- · Requiere credenciales reales — no basta un parámetro en la URL.
-- · El rol sale de app_metadata, que el usuario NO puede editar
--   (user_metadata sí es editable desde el cliente: nunca usarlo para esto).
-- · Los pedidos de prueba quedan marcados y excluidos de todo reporte.
-- · Se borran de un comando cuando termines.
-- =====================================================================

-- ── 1 · La marca ─────────────────────────────────────────────────────
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS es_prueba boolean NOT NULL DEFAULT false;

-- Índice parcial: solo indexa las pocas filas de prueba, no las reales
CREATE INDEX IF NOT EXISTS idx_pedidos_es_prueba
  ON public.pedidos(es_prueba) WHERE es_prueba = true;

COMMENT ON COLUMN public.pedidos.es_prueba IS
  'Pedido creado en modo prueba (usuario con role=test). Excluir de todo reporte.';

-- ── 2 · Que el modo prueba pueda marcarlo ────────────────────────────
-- El trigger de estado inicial fuerza pago_estado='pendiente' en TODO insert.
-- En modo prueba eso estorba: el objetivo es recorrer el flujo completo sin
-- pagar. Se respeta el pago dado por confirmado SOLO si es_prueba=true.
CREATE OR REPLACE FUNCTION public.prodigy_forzar_estado_inicial_pedido()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Solo un usuario con role='test' puede crear pedidos de prueba.
  -- Si alguien manda es_prueba=true sin ese rol, se le quita.
  IF NEW.es_prueba AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'test' THEN
    NEW.es_prueba := false;
  END IF;

  IF NEW.es_prueba THEN
    -- Pedido de prueba: se permite arrancar "pagado" para poder recorrer
    -- todas las etapas sin dinero real.
    NEW.pago_estado      := COALESCE(NEW.pago_estado, 'pago_confirmado');
    NEW.estado_operativo := COALESCE(NEW.estado_operativo, 'VALIDACION_PENDIENTE');
  ELSE
    -- Pedido real: comportamiento original intacto — nadie nace pagado.
    NEW.pago_estado       := 'pendiente';
    NEW.estado_operativo  := 'VALIDACION_PENDIENTE';
    NEW.pago_confirmado_por := NULL;
    NEW.timestamp_pago_confirmado := NULL;
  END IF;

  NEW.factura_estado := CASE WHEN NEW.requiere_factura THEN 'pendiente' ELSE 'no_requerida' END;
  RETURN NEW;
END;
$$;

-- El trigger ya existe y apunta a esta función; se recrea por si acaso.
DROP TRIGGER IF EXISTS trg_forzar_estado_inicial_pedido ON public.pedidos;
CREATE TRIGGER trg_forzar_estado_inicial_pedido
  BEFORE INSERT ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.prodigy_forzar_estado_inicial_pedido();

-- ── 3 · El usuario de prueba puede insertar ──────────────────────────
DROP POLICY IF EXISTS "pedidos_insert_test" ON public.pedidos;
CREATE POLICY "pedidos_insert_test" ON public.pedidos
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'test'
    AND negocio IN ('prodigy', 'alejandrocadcam')
    AND codigo IS NOT NULL
  );

-- Y ver/actualizar los suyos, para poder recorrer el flujo completo
DROP POLICY IF EXISTS "pedidos_test_select" ON public.pedidos;
CREATE POLICY "pedidos_test_select" ON public.pedidos
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'test' AND es_prueba = true);

DROP POLICY IF EXISTS "pedidos_test_update" ON public.pedidos;
CREATE POLICY "pedidos_test_update" ON public.pedidos
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'test' AND es_prueba = true);

-- ── 4 · Vista limpia: los reportes NO deben ver las pruebas ──────────
CREATE OR REPLACE VIEW public.pedidos_reales AS
  SELECT * FROM public.pedidos WHERE es_prueba = false;

GRANT SELECT ON public.pedidos_reales TO authenticated;

COMMENT ON VIEW public.pedidos_reales IS
  'Pedidos sin los de prueba. Usar en KPIs, facturación y métricas.';

-- ── 5 · Limpieza ─────────────────────────────────────────────────────
-- Borra TODOS los pedidos de prueba y lo que cuelga de ellos.
-- pedido_archivos cae solo por ON DELETE CASCADE.
CREATE OR REPLACE FUNCTION public.limpiar_pedidos_prueba()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _n integer;
BEGIN
  DELETE FROM public.historial_diseno
    WHERE pedido_id IN (SELECT id FROM public.pedidos WHERE es_prueba = true);
  DELETE FROM public.despachos
    WHERE pedido_id IN (SELECT id FROM public.pedidos WHERE es_prueba = true);
  DELETE FROM public.notificaciones_internas
    WHERE pedido_id IN (SELECT id FROM public.pedidos WHERE es_prueba = true);
  DELETE FROM public.pedidos WHERE es_prueba = true;
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END;
$$;

REVOKE ALL ON FUNCTION public.limpiar_pedidos_prueba() FROM PUBLIC;
-- Solo desde el SQL Editor (rol postgres). No se expone a la API a propósito:
-- una función que borra en masa no debe poder llamarse desde el navegador.

-- =====================================================================
-- ── CREAR EL USUARIO DE PRUEBA ───────────────────────────────────────
--
-- PASO 1 — Dashboard → Authentication → Users → "Add user"
--   Email:    test@prodigylabdental.com
--   Password: (elige una y guárdala en tu gestor, NO en un chat ni en un doc)
--   Marca "Auto Confirm User" para no depender del correo.
--
-- PASO 2 — Asignarle el rol. Ejecuta AQUÍ, cambiando el email si usaste otro:
--
--   UPDATE auth.users
--      SET raw_app_meta_data =
--          COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"test"}'::jsonb
--    WHERE email = 'test@prodigylabdental.com';
--
--   -- Verificar:
--   SELECT email, raw_app_meta_data ->> 'role' AS rol
--     FROM auth.users WHERE email = 'test@prodigylabdental.com';
--   -- debe decir: test
--
-- PASO 3 — El usuario debe CERRAR Y VOLVER A INICIAR SESIÓN.
--   El rol viaja dentro del JWT: mientras no se renueve el token, el rol
--   viejo sigue vigente. Es la causa número uno de "no me funciona".
--
-- ── VERIFICACIÓN ─────────────────────────────────────────────────────
--   SELECT column_name FROM information_schema.columns
--    WHERE table_name='pedidos' AND column_name='es_prueba';
--
--   SELECT policyname FROM pg_policies
--    WHERE tablename='pedidos' AND policyname LIKE '%test%';   -- → 3 filas
--
-- ── PARA BORRAR LAS PRUEBAS ──────────────────────────────────────────
--   SELECT public.limpiar_pedidos_prueba();      -- devuelve cuántos borró
--
-- Los ARCHIVOS de prueba en Storage no se borran solos: revísalos en
-- Dashboard → Storage si subiste archivos pesados durante las pruebas.
-- =====================================================================
