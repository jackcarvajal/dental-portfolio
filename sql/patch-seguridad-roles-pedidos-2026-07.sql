-- =====================================================================
-- SEGURIDAD POR ROL — tabla `pedidos`
-- Auditoría 2026-07-18 · Proyecto compartido zgihrwqfyvgyapbwzkvw
--
-- CONTEXTO IMPORTANTE:
--   RLS de Postgres es a nivel de FILA, no de COLUMNA. Si un rol puede leer
--   la fila, puede leer TODAS sus columnas (nombre_paciente, email, telefono,
--   precio_total) aunque el frontend solo pida algunas. La única forma de
--   ocultar columnas es una VISTA o GRANT por columna.
--
-- HALLAZGOS:
--   A) 🔴 `anon_diseno_review_select` deja que CUALQUIERA sin autenticar lea
--      pedidos con html_diseno_url IS NOT NULL → con la anon key (que es
--      pública en el frontend) se exponen nombre_paciente, email, telefono y
--      precio de esos pedidos. Hoy no filtra datos porque `pedidos` está
--      vacía, pero es una mina al cargar pedidos reales.
--   B) 🟡 NINGÚN rol de staff (diseno, calidad, taller, fresado, impresion,
--      mensajero, contabilidad, encargado_inventario) puede LEER `pedidos`.
--      Solo el dueño (doctor_uid) y es_admin() (2 emails). Consecuencia:
--      al crear usuarios de staff, sus paneles saldrán VACÍOS.
--      Además `pedidos_update_operator` les deja ESCRIBIR pero no LEER.
-- =====================================================================


-- ─────────────────────────────────────────────────────────────────────
-- PARTE A — Reducir la exposición pública (recomendado ANTES de producción)
-- Mantiene funcionando la revisión de diseño del cliente, pero solo para
-- pedidos que están realmente en revisión (no todo el histórico).
-- ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_diseno_review_select" ON public.pedidos;
CREATE POLICY "anon_diseno_review_select" ON public.pedidos
  FOR SELECT TO anon
  USING (
    html_diseno_url IS NOT NULL
    AND estado_operativo IN ('REVISION_CLIENTE','CAMBIOS_SOLICITADOS','DISENO_APROBADO')
  );

-- NOTA: esto reduce la superficie, no la elimina. La solución completa es que
-- la página de revisión consulte la VISTA de abajo (sin datos personales) en
-- vez de la tabla, y luego quitar del todo el acceso anon a `pedidos`.
-- Vista pública mínima para revisar un diseño:
CREATE OR REPLACE VIEW public.pedidos_revision_publica
WITH (security_invoker = true) AS
SELECT id, codigo, tipo_trabajo, material, color_vita,
       estado_operativo, html_diseno_url, diseno_disclaimer, created_at
FROM public.pedidos
WHERE html_diseno_url IS NOT NULL;

GRANT SELECT ON public.pedidos_revision_publica TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────
-- PARTE B — Dar lectura al STAFF sin exponer datos personales
-- Vista con SOLO columnas operativas: sin nombre_paciente, email, telefono,
-- direccion ni precio_total. Los paneles de staff deben consultar esta vista.
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.pedidos_operacion
WITH (security_invoker = true) AS
SELECT
  id, codigo, tipo_trabajo, material, color_vita,
  estado, estado_operativo, flujo, departamento_actual,
  link_diseno, html_diseno_url, stl_urls, stl_ruta, construinfo_url,
  notas_cambios, cambios_count, revisiones_usadas,
  fabricacion_solicitada, fabricacion_pagada, servicios_pagados,
  operario_codigo, pais, created_at, timestamp_produccion
FROM public.pedidos;

GRANT SELECT ON public.pedidos_operacion TO authenticated;

-- La vista usa security_invoker: hereda el RLS de `pedidos`. Para que el staff
-- vea las filas hay que permitirles LEER la tabla base (solo así la vista
-- devuelve datos). Como la vista NO expone columnas personales, el staff que
-- consulte la vista no las verá — pero OJO: si consultan la TABLA directamente
-- sí las verían. Por eso se limita la lectura de la tabla a lo estrictamente
-- necesario y se instruye a los paneles a usar la vista.
DROP POLICY IF EXISTS "pedidos_select_staff" ON public.pedidos;
CREATE POLICY "pedidos_select_staff" ON public.pedidos
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN
      ('operator','diseno','taller','fresado','impresion','calidad','encargado_inventario')
  );

-- Contabilidad SÍ necesita montos (facturación), por eso va aparte y con
-- acceso a la tabla completa:
DROP POLICY IF EXISTS "pedidos_select_contabilidad" ON public.pedidos;
CREATE POLICY "pedidos_select_contabilidad" ON public.pedidos
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'contabilidad');


-- ─────────────────────────────────────────────────────────────────────
-- PARTE C — Coherencia: 'operator' podía ESCRIBIR pero no LEER
-- (Ya queda resuelto con pedidos_select_staff de la Parte B.)
-- ─────────────────────────────────────────────────────────────────────

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────
-- SELECT policyname, cmd, roles FROM pg_policies
--  WHERE tablename = 'pedidos' ORDER BY cmd, policyname;

-- =====================================================================
-- PENDIENTE DE CÓDIGO (no es SQL): cambiar en los paneles de staff
--   sb.from('pedidos')  ->  sb.from('pedidos_operacion')
-- en: operario.html, operario-diseno.html, calidad.html, mensajero.html,
--     taller.html, inventario.html
-- Así dejan de pedir nombre_paciente / email / telefono / precio_total.
-- =====================================================================
