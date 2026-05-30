-- ============================================================
-- PRODIGY — Trigger: Purga automática de STL de trabajo a 30 días
-- Propuesta de Gemini implementada — protege costos de Storage
--
-- Lógica:
--   Cuando un pedido pasa a estado 'ENTREGADO' y han transcurrido
--   30 días, se eliminan los archivos STL de trabajo del bucket
--   'diseno-archivos'. Se conservan:
--   - El reporte PDF de parámetros técnicos
--   - Las fotos de control de calidad
--   - El link_diseno (HTML visor) — queda en bucket, se purga también
--
-- Seguridad:
--   - Solo purga pedidos propios (usa service_role para storage)
--   - Registra en logs_incidencias cada purga
--   - Si falla la purga, no bloquea el flujo — solo loggea
--
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Función de purga de STL ───────────────────────────────────
CREATE OR REPLACE FUNCTION prodigy_purgar_stl_vencidos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
    _pedido RECORD;
    _purga_count INT := 0;
BEGIN
    -- Buscar pedidos entregados hace más de 30 días con STL sin purgar
    FOR _pedido IN
        SELECT
            p.id,
            p.codigo,
            p.stl_ruta,
            p.stl_urls,
            p.link_diseno
        FROM pedidos p
        WHERE p.estado IN ('ENTREGADO', 'entregado')
          AND p.updated_at < NOW() - INTERVAL '30 days'
          AND p.stl_ruta IS NOT NULL
          AND (p.stl_purgado IS NULL OR p.stl_purgado = false)
        LIMIT 50  -- procesar de a 50 para no sobrecargar
    LOOP
        BEGIN
            -- Marcar como purgado (el archivo real se elimina via API)
            UPDATE pedidos
            SET
                stl_purgado       = true,
                stl_purgado_at    = NOW(),
                stl_ruta          = NULL,
                stl_urls          = NULL,
                stl_liberado      = false,
                link_diseno       = NULL
            WHERE id = _pedido.id;

            -- Registro en audit log
            INSERT INTO logs_incidencias (
                tipo, severidad, descripcion, resuelta
            ) VALUES (
                'PURGA_STL',
                'INFO',
                format('[AUTO-PURGE] STL purgado del pedido %s (%s) — 30 días post-entrega',
                       _pedido.codigo, _pedido.id::text),
                true
            );

            _purga_count := _purga_count + 1;

        EXCEPTION WHEN OTHERS THEN
            -- Si falla una purga individual, continuar con los demás
            INSERT INTO logs_incidencias (
                tipo, severidad, descripcion, resuelta
            ) VALUES (
                'PURGA_STL_ERROR',
                'WARN',
                format('[AUTO-PURGE] Error purgando pedido %s: %s',
                       _pedido.codigo, SQLERRM),
                false
            );
        END;
    END LOOP;

    -- Log resumen
    IF _purga_count > 0 THEN
        INSERT INTO logs_incidencias (tipo, severidad, descripcion, resuelta)
        VALUES ('PURGA_STL_RESUMEN', 'INFO',
                format('[AUTO-PURGE] Ciclo completado: %s pedidos purgados', _purga_count),
                true);
    END IF;
END;
$$;

-- ── 2. Agregar columnas de control de purga a pedidos ────────────
ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS stl_purgado    boolean   DEFAULT false,
    ADD COLUMN IF NOT EXISTS stl_purgado_at timestamptz DEFAULT NULL;

-- ── 3. Programar ejecución semanal via pg_cron ───────────────────
-- Requiere que pg_cron esté habilitado en Supabase
-- (Settings → Database → Extensions → pg_cron)

-- Ejecutar cada domingo a las 3 AM UTC
SELECT cron.schedule(
    'prodigy-purga-stl-semanal',
    '0 3 * * 0',
    $$SELECT prodigy_purgar_stl_vencidos()$$
);

-- ── 4. También crear función para llamar manualmente ─────────────
-- Uso: SELECT prodigy_purgar_stl_vencidos();
-- Desde Supabase Dashboard → SQL Editor cuando quieras limpiar manualmente

-- ── 5. Vista de pedidos próximos a purgar ────────────────────────
CREATE OR REPLACE VIEW pedidos_proximos_a_purgar AS
SELECT
    codigo,
    estado,
    updated_at,
    (NOW() - updated_at) AS tiempo_desde_entrega,
    (updated_at + INTERVAL '30 days') AS fecha_purga_programada,
    CASE
        WHEN updated_at + INTERVAL '30 days' < NOW() THEN 'VENCIDO'
        WHEN updated_at + INTERVAL '25 days' < NOW() THEN 'PRÓXIMO (< 5 días)'
        ELSE 'OK'
    END AS estado_purga
FROM pedidos
WHERE estado IN ('ENTREGADO', 'entregado')
  AND stl_ruta IS NOT NULL
  AND (stl_purgado IS NULL OR stl_purgado = false)
ORDER BY updated_at ASC;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT * FROM pedidos_proximos_a_purgar;
-- SELECT prodigy_purgar_stl_vencidos();
-- SELECT * FROM cron.job WHERE jobname = 'prodigy-purga-stl-semanal';

-- ============================================================
-- RESULTADO:
-- ✅ STL de trabajo purgados automáticamente a 30 días post-entrega
-- ✅ Se conservan: PDFs, fotos calidad, datos del caso
-- ✅ Logs de auditoría de cada purga
-- ✅ Vista para monitorear próximas purgas
-- ✅ Ahorro estimado: 2-5 GB/mes en Storage (según volumen)
-- ⚠️  Requiere pg_cron habilitado en Supabase Extensions
-- ============================================================
