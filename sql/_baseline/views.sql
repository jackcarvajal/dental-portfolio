-- ═══════════════════════════════════════════════════════════════
-- BASELINE — VISTAS desplegadas (capturado 2026-08, pg_get_viewdef).
-- Fuente de verdad de las vistas de `public`. Reconstruido como CREATE OR REPLACE.
--
-- ⚠️ `pedidos_operacion` está desplegada con `security_invoker=true` (respeta la
--    RLS del que consulta). Se preserva abajo con WITH (security_invoker=true).
-- Uso por el código (grep front+edge):
--    USADAS  → doctors_inactivos, pedidos_archivos_resumen, pedidos_operacion
--    NO usadas por el código (¿admin/reporte manual o legado?) →
--       historial_doctor, pedidos_proximos_a_purgar, pedidos_reales,
--       pedidos_revision_publica, v_pedidos_urgentes, v_utm_performance
-- ═══════════════════════════════════════════════════════════════

-- USADA (churn) — nota: whatsapp siempre NULL; ticket_promedio = avg(precio_total)
CREATE OR REPLACE VIEW public.doctors_inactivos AS
 WITH doctor_stats AS (
         SELECT pedidos.email, pedidos.nombre_doctor, NULL::text AS whatsapp,
            count(*) FILTER (WHERE pedidos.created_at > (now() - '90 days'::interval)) AS pedidos_90d,
            count(*) FILTER (WHERE pedidos.created_at > (now() - '30 days'::interval)) AS pedidos_30d,
            max(pedidos.created_at) AS ultimo_pedido,
            avg(pedidos.precio_total) AS ticket_promedio
           FROM pedidos
          WHERE pedidos.email IS NOT NULL AND (pedidos.estado::text <> ALL (ARRAY['cancelado'::text, 'CANCELADO'::text, 'Cancelado'::text]))
          GROUP BY pedidos.email, pedidos.nombre_doctor
         HAVING count(*) FILTER (WHERE pedidos.created_at > (now() - '90 days'::interval)) >= 3
        )
 SELECT email, nombre_doctor, whatsapp, pedidos_90d, pedidos_30d, ultimo_pedido, ticket_promedio,
    EXTRACT(day FROM now() - ultimo_pedido) AS dias_inactivo,
        CASE
            WHEN EXTRACT(day FROM now() - ultimo_pedido) >= 30::numeric THEN 'CRITICO'::text
            WHEN EXTRACT(day FROM now() - ultimo_pedido) >= 20::numeric THEN 'ALERTA'::text
            WHEN EXTRACT(day FROM now() - ultimo_pedido) >= 14::numeric THEN 'VIGILAR'::text
            ELSE 'OK'::text
        END AS nivel_riesgo
   FROM doctor_stats
  WHERE EXTRACT(day FROM now() - ultimo_pedido) >= 14::numeric AND pedidos_30d = 0
  ORDER BY (EXTRACT(day FROM now() - ultimo_pedido)) DESC;

-- USADA (operarios/calidad) — PURA PROYECCIÓN de pedidos, sin WHERE. security_invoker.
CREATE OR REPLACE VIEW public.pedidos_operacion
  WITH (security_invoker=true) AS
 SELECT id, codigo, tipo_trabajo, material, color_vita, estado, estado_operativo, flujo,
    departamento_actual, link_diseno, html_diseno_url, stl_urls, stl_ruta, construinfo_url,
    notas_cambios, cambios_count, revisiones_usadas, fabricacion_solicitada, fabricacion_pagada,
    servicios_pagados, operario_codigo, pais, created_at, timestamp_produccion
   FROM pedidos;

-- USADA — resumen de archivos por pedido
CREATE OR REPLACE VIEW public.pedidos_archivos_resumen AS
 SELECT p.id AS pedido_id, p.codigo, count(a.id) AS total_archivos,
    count(*) FILTER (WHERE a.estado = 'fallido'::text) AS fallidos,
    count(*) FILTER (WHERE a.tipo = 'escaneo'::text) AS escaneos,
    count(*) FILTER (WHERE a.tipo = 'cbct'::text) AS cbct,
    count(*) FILTER (WHERE a.tipo = 'foto_clinica'::text) AS fotos,
    count(*) FILTER (WHERE a.tipo = 'radiografia'::text) AS radiografias,
    count(*) FILTER (WHERE a.tipo = 'stl_final'::text) AS entregables,
    max(a.created_at) AS ultimo_archivo
   FROM pedidos p LEFT JOIN pedido_archivos a ON a.pedido_id = p.id
  GROUP BY p.id, p.codigo;

-- ── NO usadas por el código (se preservan como estaban desplegadas) ──

-- historial_doctor — legado: usa clientes/cliente_id, pieza, stl_url, qr_code
CREATE OR REPLACE VIEW public.historial_doctor AS
 SELECT p.id, p.codigo, p.tipo_trabajo, p.material, p.pieza, p.unidades, p.precio_base, p.precio_total,
    p.pasarela, p.recargo_pct, p.estado, p.stl_url, p.qr_code, p.notas, p.fecha_entrega, p.created_at,
    pg.transaction_id, pg.estado AS pago_estado, pg.comprobante_url
   FROM pedidos p LEFT JOIN pagos pg ON pg.pedido_id = p.id
  WHERE (p.cliente_id IN ( SELECT clientes.id FROM clientes WHERE clientes.user_id = auth.uid()))
  ORDER BY p.created_at DESC;

CREATE OR REPLACE VIEW public.pedidos_proximos_a_purgar AS
 SELECT codigo, estado, updated_at, now() - updated_at AS tiempo_desde_entrega,
    updated_at + '30 days'::interval AS fecha_purga_programada,
        CASE
            WHEN (updated_at + '30 days'::interval) < now() THEN 'VENCIDO'::text
            WHEN (updated_at + '25 days'::interval) < now() THEN 'PRÓXIMO (< 5 días)'::text
            ELSE 'OK'::text
        END AS estado_purga
   FROM pedidos
  WHERE estado_operativo = 'ENTREGADO'::text AND stl_ruta IS NOT NULL AND (stl_purgado IS NULL OR stl_purgado = false)
  ORDER BY updated_at;

-- pedidos_reales — pedidos con es_prueba=false (TODAS las columnas de pedidos)
CREATE OR REPLACE VIEW public.pedidos_reales AS
 SELECT id, codigo, cliente_id, tipo_trabajo, material, pieza, unidades, precio_base, precio_total,
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
   FROM pedidos
  WHERE es_prueba = false;

CREATE OR REPLACE VIEW public.pedidos_revision_publica AS
 SELECT id, codigo, tipo_trabajo, material, color_vita, estado_operativo, html_diseno_url,
    diseno_disclaimer, created_at
   FROM pedidos
  WHERE html_diseno_url IS NOT NULL;

CREATE OR REPLACE VIEW public.v_pedidos_urgentes AS
 SELECT id, codigo, nombre_paciente, estado_operativo, created_at, timestamp_validacion,
    EXTRACT(epoch FROM now() - created_at) / 60::numeric AS minutos_desde_creacion,
        CASE
            WHEN estado_operativo = 'VALIDACION_PENDIENTE'::text AND (EXTRACT(epoch FROM now() - created_at) / 60::numeric) > 40::numeric THEN 'CRITICO'::text
            WHEN estado_operativo = 'VALIDACION_PENDIENTE'::text AND (EXTRACT(epoch FROM now() - created_at) / 60::numeric) > 25::numeric THEN 'ALERTA'::text
            ELSE 'OK'::text
        END AS urgencia
   FROM pedidos p
  WHERE estado_operativo <> ALL (ARRAY['ENTREGADO'::text, 'CANCELADO'::text])
  ORDER BY urgencia DESC, created_at;

CREATE OR REPLACE VIEW public.v_utm_performance AS
 SELECT source, medium, campaign, count(*) AS visitas, count(DISTINCT session_id) AS sesiones_unicas,
    date_trunc('day'::text, ts) AS dia
   FROM lead_sources
  WHERE ts >= (now() - '30 days'::interval)
  GROUP BY source, medium, campaign, (date_trunc('day'::text, ts))
  ORDER BY (date_trunc('day'::text, ts)) DESC, (count(*)) DESC;
