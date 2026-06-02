-- ============================================================
-- PRODIGY — Patch: Purga STL sin pg_cron
-- Ejecutar en Supabase Dashboard → SQL Editor
--
-- Este archivo reemplaza trigger-purga-stl-30dias.sql
-- para planes Supabase sin pg_cron habilitado.
-- La purga se activa manualmente o via Cloudflare Cron.
-- ============================================================

-- 1. Agregar columnas de control (si no existen)
ALTER TABLE public.pedidos
    ADD COLUMN IF NOT EXISTS stl_purgado     boolean   DEFAULT false,
    ADD COLUMN IF NOT EXISTS stl_purgado_at  timestamptz DEFAULT NULL;

-- 2. Función principal de purga (misma lógica, sin pg_cron)
CREATE OR REPLACE FUNCTION public.prodigy_purgar_stl_vencidos()
RETURNS TABLE(pedido_id uuid, codigo text, archivos_eliminados int)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _row RECORD;
  _count int := 0;
BEGIN
  -- Buscar pedidos entregados hace más de 30 días con STL sin purgar
  FOR _row IN
    SELECT p.id, p.codigo, p.stl_ruta, p.link_diseno
    FROM public.pedidos p
    WHERE p.estado_operativo IN ('ENTREGADO','LISTO','LISTO_DESPACHAR')
      AND p.stl_purgado = false
      AND p.updated_at < now() - interval '30 days'
      AND (p.stl_ruta IS NOT NULL OR p.link_diseno IS NOT NULL)
  LOOP
    -- Marcar como purgado (la eliminación real del storage
    -- se hace desde la edge function /api/health-check o manualmente)
    UPDATE public.pedidos
    SET stl_purgado = true, stl_purgado_at = now()
    WHERE id = _row.id;

    -- Log de auditoría
    INSERT INTO public.logs_incidencias(
      pedido_id, tipo, severidad, descripcion, resuelta
    ) VALUES (
      _row.id, 'PURGA_STL', 'INFO',
      'STL marcado para purga 30d post-entrega. Caso: ' || COALESCE(_row.codigo,'—'),
      true
    );

    _count := _count + 1;
    pedido_id := _row.id;
    codigo    := _row.codigo;
    archivos_eliminados := 1;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- 3. Vista para monitorear pedidos próximos a purga
CREATE OR REPLACE VIEW public.pedidos_proximos_purga AS
SELECT
  p.id, p.codigo, p.nombre_doctor, p.estado,
  p.updated_at AS fecha_entrega,
  (p.updated_at + interval '30 days') AS fecha_purga,
  EXTRACT(DAY FROM (p.updated_at + interval '30 days') - now())::int AS dias_restantes,
  p.stl_purgado,
  p.stl_purgado_at
FROM public.pedidos p
WHERE p.estado_operativo IN ('ENTREGADO','LISTO','LISTO_DESPACHAR')
  AND p.stl_purgado = false
  AND p.updated_at > now() - interval '45 days'
ORDER BY p.updated_at ASC;

-- 4. GRANT para que el panel admin pueda consultarla
GRANT SELECT ON public.pedidos_proximos_purga TO authenticated;

-- ============================================================
-- ACTIVACIÓN ALTERNATIVA SIN pg_cron:
-- Opción A — Llamada manual: SELECT * FROM prodigy_purgar_stl_vencidos();
-- Opción B — Cloudflare Cron Trigger semanal → GET /api/health-check
--            El health-check puede llamar esta RPC internamente.
-- ============================================================

-- Verificación
SELECT 'Purga STL configurada (sin pg_cron)' AS status;
SELECT count(*) AS pedidos_para_purgar FROM public.pedidos_proximos_purga;
