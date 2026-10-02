-- ================================================================
-- PRODIGY — CASOS ATRASADOS POR ETAPA (más del doble de lo normal)
-- casos_atrasados(factor): casos que siguen en una etapa de producción más de `factor` veces la mediana de esa
-- etapa (últimos 60 días, mínimo 4 h). No cuenta las etapas que dependen del doctor (revisión, archivos, pago).
-- La usan Métricas (lista «Atrasados ahora») y el cron de /api/alerta-sla (un resumen diario en la campana).
-- También deja que el cron (service_role) lea tiempos_por_etapa.
-- Solo LEE: no cambia datos. 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

CREATE OR REPLACE FUNCTION public.casos_atrasados(p_factor numeric DEFAULT 2)
RETURNS TABLE (pedido_id uuid, codigo text, doctor text, etapa text, horas_en_etapa numeric, horas_mediana numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH ev AS (
    SELECT b.pedido_id, b.created_at, upper(trim(split_part(b.detalle, '→', 2))) AS etapa,
           lead(b.created_at) OVER (PARTITION BY b.pedido_id ORDER BY b.created_at) AS salida
      FROM pedido_bitacora b
     WHERE (public.es_equipo_lab() OR auth.role() = 'service_role')
       AND b.evento = 'etapa' AND b.tabla = 'pedidos' AND COALESCE(b.negocio, 'prodigy') = 'prodigy'
       AND b.created_at > now() - interval '120 days'
  ), med AS (
    SELECT etapa, percentile_cont(.5) WITHIN GROUP (ORDER BY extract(epoch FROM salida - created_at) / 3600) AS mediana, count(*) AS n
      FROM ev WHERE salida IS NOT NULL AND created_at > now() - interval '60 days'
     GROUP BY etapa
  ), actual AS (
    SELECT DISTINCT ON (pedido_id) pedido_id, etapa, created_at FROM ev ORDER BY pedido_id, created_at DESC
  )
  SELECT p.id, p.codigo, COALESCE(p.nombre_doctor, p.nombre_cliente), a.etapa,
         round((extract(epoch FROM now() - a.created_at) / 3600)::numeric, 1), round(m.mediana::numeric, 1)
    FROM actual a
    JOIN pedidos p ON p.id = a.pedido_id
    JOIN med m ON m.etapa = a.etapa
   WHERE upper(COALESCE(p.estado_operativo, '')) = a.etapa
     AND a.etapa NOT IN ('ENTREGADO', 'CANCELADO_DOCTOR', 'REVISION_CLIENTE', 'ERROR_STL', 'PAGO_NO_CONFIRMADO', 'INCIDENCIA_CLIENTE')
     AND NOT COALESCE(p.es_prueba, false)
     AND m.n >= 3
     AND extract(epoch FROM now() - a.created_at) / 3600 > GREATEST(m.mediana * GREATEST(p_factor, 1.2), 4)
   ORDER BY 5 DESC
   LIMIT 50;
$$;
REVOKE ALL ON FUNCTION public.casos_atrasados(numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.casos_atrasados(numeric) TO authenticated, service_role;

-- Verificación: la función existe (con sesión del equipo devuelve los atrasados; aquí no hay sesión)
SELECT proname AS funcion, pg_get_function_identity_arguments(oid) AS argumentos
  FROM pg_proc WHERE proname IN ('casos_atrasados', 'tiempos_por_etapa', 'envios_transportadora_recientes');
