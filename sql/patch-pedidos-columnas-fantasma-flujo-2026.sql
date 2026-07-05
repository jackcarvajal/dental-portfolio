-- ============================================================
-- PRODIGY — CRÍTICO: los 4 flujos de creación de pedidos usan columnas
-- que NO EXISTEN — ningún pedido nuevo se ha guardado nunca
-- Ejecutar en: Supabase Dashboard → SQL Editor — MÁXIMA PRIORIDAD
--
-- Hallazgo (auditoría en vivo, 2026-07-05): al confirmar con
--   SELECT count(*) FROM pedidos;  → 0 filas, nunca ha habido ninguna.
--
-- Causa: flujo-diseno.html, flujo-fresado.html, flujo-lab.html y
-- js/flujo-impresion.js (los 4 puntos donde un doctor/cliente crea un
-- pedido nuevo) hacen INSERT usando columnas que nunca existieron en
-- la tabla real: doctor, whatsapp, servicio, total, link_stl, nonce,
-- flujo, fuente_pago, software_diseno. PostgREST rechaza el INSERT
-- completo por columna inexistente, y los 4 archivos atrapan el error
-- con console.warn (o silenciosamente) sin detener ni avisar al
-- cliente — el flujo de checkout continúa mostrando éxito.
--
-- De las 9 columnas usadas incorrectamente:
--   doctor → ya existe como nombre_doctor
--   whatsapp → ya existe como telefono
--   servicio → ya existe como tipo_trabajo (usado por
--     panel-interno-operaciones.html para mostrar el tipo de trabajo)
--   total → ya existe como precio_total (usado por stripe-checkout.js
--     para validar montos)
--   link_stl → ya existe como stl_url
--   nonce → ya existe como hash_seguridad
--   fuente_pago / software_diseno → sin uso en ningún otro lugar del
--     código, se quitan del INSERT sin pérdida funcional
--   flujo → NO tiene equivalente real, pero SÍ se usa extensamente en
--     otras partes ya existentes del código (enrutamiento de
--     departamento en panel-interno-operaciones.html línea ~3148,
--     RPCs de analytics prodigy_pedidos_por_material/ingresos_por_dia,
--     trigger prodigy_notif_pedido). Se agrega como columna real en
--     vez de eliminar sus ~20 usos ya existentes.
-- ============================================================

ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS flujo text;

CREATE INDEX IF NOT EXISTS idx_pedidos_flujo ON public.pedidos(flujo);

-- app/calidad.html (panel de control de calidad) también referencia
-- nombre_cliente y nota_calidad, que tampoco existen y no tienen un
-- equivalente semántico claro entre las columnas ya existentes
-- (nombre_paciente es el paciente, no el cliente/clínica; notas_operador
-- es de otro flujo) — se agregan como columnas reales.
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS nombre_cliente text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS nota_calidad text;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name='pedidos' AND column_name='flujo';
--   → debe devolver 1 fila.
-- ============================================================

SELECT 'patch-pedidos-columnas-fantasma-flujo-2026 aplicado' AS status;
