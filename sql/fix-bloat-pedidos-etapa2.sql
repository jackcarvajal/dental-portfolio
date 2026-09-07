-- ═══════════════════════════════════════════════════════════════
-- BLOAT de `pedidos` — ETAPA 2: eliminar columnas muertas del modelo viejo
--   • cliente_id  (0 usos; reemplazada por user_id/doctor_uid)
--   • pieza       (singular, 0 usos; la real es `piezas`)
--
-- Verificado (ago-2026, ver docs/CONTRATO-COLUMNAS-PEDIDOS.md):
--   - Código front+edge: 0 usos de cliente_id/pieza.
--   - Únicos objetos que dependían: 2 VISTAS sin uso en código →
--       · historial_doctor  (legado, apunta al modelo viejo clientes) → se ELIMINA.
--       · pedidos_reales     (proyección) → se RECREA sin esas 2 columnas.
--   - La tabla `clientes` NO se toca (la usa panel-interno-operaciones).
--   - Ninguna función/trigger del repo las referencia.
--
-- ⚠️ IRREVERSIBLE: el DROP COLUMN borra los datos de esas 2 columnas (son legado).
--    Si quieres conservarlos, descomenta el paso 0 (backup) antes de correr.
-- Es transaccional (BEGIN/COMMIT): si algo aún depende de las columnas, el DROP
-- falla y hace ROLLBACK — no queda a medias.
-- Pegar en Supabase SQL Editor → Run.
-- ═══════════════════════════════════════════════════════════════

-- ── Paso 0 (OPCIONAL) — respaldo de los datos viejos antes de borrarlos ──
-- CREATE TABLE public._backup_pedidos_cols_viejas AS
--   SELECT id, codigo, cliente_id, pieza FROM public.pedidos
--   WHERE cliente_id IS NOT NULL OR pieza IS NOT NULL;

BEGIN;

-- 1) Vista legado sin uso (modelo viejo clientes/cliente_id/pieza)
DROP VIEW IF EXISTS public.historial_doctor;

-- 2) Recrear pedidos_reales SIN cliente_id ni pieza
--    (CREATE OR REPLACE VIEW no puede quitar columnas → DROP + CREATE)
DROP VIEW IF EXISTS public.pedidos_reales;
CREATE VIEW public.pedidos_reales AS
 SELECT id, codigo, tipo_trabajo, material, unidades, precio_base, precio_total,
    pasarela, recargo_pct, estado, stl_url, qr_code, notas, fecha_entrega, created_at, updated_at,
    doctor_uid, nombre_doctor, email, telefono, nombre_paciente, submaterial, color_vita, piezas,
    cantidad, instrucciones, "oclusión", espacio_cemento, proceso, archivo_stl_path, archivo_final_path,
    foto_salida_path, exocad_link, monto_base, monto_total, moneda, slot_express, fecha_ingreso,
    notas_operador, estado_operativo, timestamp_validacion, timestamp_produccion, timestamp_qa,
    operador_id, fotos_empaque, calificacion, calificacion_comentario, tracking_mensajero,
    requiere_factura, billing_tipo, billing_nit, billing_razon, billing_email, terminos_aceptados_at,
    ip_registro, user_agent, seguro_garantia_activo, costo_envio, hash_seguridad, total_usd,
    paypal_order_id, paypal_payer, paypal_email, paypal_ref, fecha_pago, numero_guia, pais, negocio,
    link_diseno, diseno_aprobado, notas_cambios, revisiones_usadas, pago_estado, comprobante_url,
    stl_ruta, stl_liberado, fotos_feedback, operario_codigo, user_id, servicios_pagados,
    departamento_actual, pedido_diseno_id, cotizacion_fab_monto, cotizacion_fab_estado,
    cotizacion_fab_at, cotizacion_fab_nota, html_diseno_url, stl_urls, construinfo_url,
    fotos_diseno_urls, cambios_count, diseno_aprobado_at, diseno_aprobado_por, diseno_disclaimer,
    fabricacion_solicitada, fabricacion_pagada, fabricacion_tipo, modalidad_cobro, saldo_pendiente_monto,
    comprobante_abono_url, comprobante_saldo_url, nota_confirmacion_pago, timestamp_pago_confirmado,
    pago_confirmado_por, comprobante_pago_url, factura_estado, factura_alegra_id, factura_numero,
    factura_cufe, factura_pdf_url, factura_emitida_at, factura_error, codigo_referido,
    pago_recordatorio_at, pago_vencido, canal_origen, sla_horas_objetivo, sla_alerta_enviada,
    stl_purgado, stl_purgado_at, flujo, nombre_cliente, nota_calidad, direccion, es_prueba
   FROM public.pedidos
  WHERE es_prueba = false;

-- 2b) La política RLS `pedidos_update_own` referencia cliente_id (modelo viejo:
--     cliente_id -> clientes.user_id). Bloquearía el DROP COLUMN. Se recrea con la
--     columna canónica user_id (auth.uid() del doctor) — misma intención, sin el join legacy.
DROP POLICY IF EXISTS pedidos_update_own ON public.pedidos;
CREATE POLICY pedidos_update_own ON public.pedidos
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3) Eliminar las columnas muertas (falla aquí si quedó alguna dependencia → ROLLBACK seguro)
--    NOTA: si otra política/vista aún referencia cliente_id, este DROP falla y hace ROLLBACK
--    nombrando al objeto dependiente → resolverlo y reintentar (es transaccional, no queda a medias).
ALTER TABLE public.pedidos DROP COLUMN IF EXISTS cliente_id;
ALTER TABLE public.pedidos DROP COLUMN IF EXISTS pieza;

COMMIT;

-- ── Verificar (debe devolver 0 filas) ──
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema='public' AND table_name='pedidos'
--     AND column_name IN ('cliente_id','pieza');
