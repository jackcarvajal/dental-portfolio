-- =====================================================================
-- COMPLEMENTO del patch de seguridad por rol (ejecutar DESPUÉS de
-- patch-seguridad-roles-pedidos-2026-07.sql)
--
-- Por qué: la vista `pedidos_operacion` inicial era demasiado estrecha y
-- dejaba fuera columnas de flujo que los paneles sí necesitan (calidad,
-- fabricación, pagos). Aquí se amplía con TODO lo operativo, excluyendo
-- solo los datos personales del paciente/cliente:
--     ❌ nombre_paciente, email, telefono, direccion
-- Y se crea una vista aparte para el mensajero, que SÍ necesita teléfono y
-- dirección para poder entregar.
-- =====================================================================


-- ─── Vista operativa para staff de producción y calidad ───────────────
CREATE OR REPLACE VIEW public.pedidos_operacion
WITH (security_invoker = true) AS
SELECT
  id, codigo, doctor_uid,
  tipo_trabajo, material, color_vita, flujo, departamento_actual,
  estado, estado_operativo,
  -- archivos y diseño
  link_diseno, html_diseno_url, stl_urls, stl_ruta, construinfo_url,
  notas_cambios, cambios_count, revisiones_usadas, diseno_disclaimer,
  -- fabricación
  fabricacion_solicitada, fabricacion_pagada, servicios_pagados,
  cotizacion_fab_monto, cotizacion_fab_estado, cotizacion_fab_nota,
  -- calidad / empaque
  nota_calidad, fotos_empaque, timestamp_qa,
  -- estado de pago (SIN montos ni datos bancarios)
  pago_estado,
  -- trazabilidad
  operario_codigo, pais, created_at, timestamp_produccion, nombre_doctor
FROM public.pedidos;

GRANT SELECT ON public.pedidos_operacion TO authenticated;


-- ─── Vista para el MENSAJERO: necesita contacto y dirección ───────────
-- Sin nombre_paciente ni precios; con lo mínimo para entregar.
CREATE OR REPLACE VIEW public.pedidos_entrega
WITH (security_invoker = true) AS
SELECT
  id, codigo, tipo_trabajo, estado, estado_operativo,
  nombre_doctor, nombre_cliente, direccion, telefono,
  created_at, timestamp_produccion
FROM public.pedidos;

GRANT SELECT ON public.pedidos_entrega TO authenticated;


-- ─── Ajuste de la política de staff: incluir mensajero ────────────────
DROP POLICY IF EXISTS "pedidos_select_staff" ON public.pedidos;
CREATE POLICY "pedidos_select_staff" ON public.pedidos
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN
      ('operator','diseno','taller','fresado','impresion','calidad',
       'encargado_inventario','mensajero')
  );

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────
-- SELECT table_name FROM information_schema.views
--  WHERE table_schema='public' AND table_name LIKE 'pedidos_%';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename='pedidos' ORDER BY cmd;
