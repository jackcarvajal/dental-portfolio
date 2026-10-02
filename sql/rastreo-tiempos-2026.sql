-- ================================================================
-- PRODIGY — TRANSPORTADORA EN EL PANEL DEL MENSAJERO + TIEMPO POR ETAPA
-- 1) envios_transportadora_recientes(): los casos que salieron por transportadora (en camino o enviados en las
--    últimas 24 h), para que el mensajero sepa que NO van en su ruta. Solo equipo (incluye mensajero).
-- 2) tiempos_por_etapa(dias): cuánto dura cada etapa (horas promedio, mediana, máximo) según la bitácora de
--    cambios de etapa (pedido_bitacora). Sirve para ver dónde se atrasa la producción, p. ej. «Terminado y
--    maquillaje». Solo equipo.
-- Requiere: sql/storage-permisos-2026.sql (es_equipo_lab) y sql/envios-transportadora-acabado-2026.sql.
-- Solo LEE: no cambia datos. 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

CREATE OR REPLACE FUNCTION public.envios_transportadora_recientes()
RETURNS TABLE (codigo text, doctor text, transportadora text, guia text, estado text, salida timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.codigo, COALESCE(p.nombre_doctor, p.nombre_cliente), d.transportadora, d.guia, d.estado, d.fecha_salida
    FROM despachos d JOIN pedidos p ON p.id = d.pedido_id
   WHERE public.es_equipo_lab()
     AND d.tipo_envio = 'transportadora'
     AND (d.estado = 'EN_REPARTO' OR d.created_at > now() - interval '24 hours')
   ORDER BY d.created_at DESC
   LIMIT 50;
$$;
REVOKE ALL ON FUNCTION public.envios_transportadora_recientes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.envios_transportadora_recientes() TO authenticated;

CREATE OR REPLACE FUNCTION public.tiempos_por_etapa(p_dias int DEFAULT 30)
RETURNS TABLE (etapa text, casos bigint, horas_promedio numeric, horas_mediana numeric, horas_max numeric, siguen_ahi bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH ev AS (       -- cada cambio de etapa: «Etapa: A → B» → entró a B en created_at
    SELECT pedido_id, created_at, upper(trim(split_part(detalle, '→', 2))) AS etapa
      FROM pedido_bitacora
     WHERE public.es_equipo_lab()
       AND evento = 'etapa' AND tabla = 'pedidos' AND COALESCE(negocio, 'prodigy') = 'prodigy'
       AND created_at > now() - make_interval(days => LEAST(GREATEST(p_dias, 1), 365) + 60)
  ), dur AS (        -- cuánto se quedó: hasta el siguiente cambio de etapa del mismo caso
    SELECT etapa, created_at, lead(created_at) OVER (PARTITION BY pedido_id ORDER BY created_at) AS salida
      FROM ev
  ), h AS (
    SELECT etapa, salida, extract(epoch FROM salida - created_at) / 3600 AS horas
      FROM dur
     WHERE created_at > now() - make_interval(days => LEAST(GREATEST(p_dias, 1), 365))
       AND etapa NOT IN ('', '—')
  )
  SELECT etapa,
         count(salida),
         round(avg(horas)::numeric, 1),
         round((percentile_cont(.5) WITHIN GROUP (ORDER BY horas))::numeric, 1),
         round(max(horas)::numeric, 1),
         count(*) FILTER (WHERE salida IS NULL)
    FROM h
   GROUP BY etapa
   ORDER BY 3 DESC NULLS LAST;
$$;
REVOKE ALL ON FUNCTION public.tiempos_por_etapa(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tiempos_por_etapa(int) TO authenticated;

-- Verificación: cambios de etapa registrados en 90 días (las funciones solo responden con sesión del equipo,
-- por eso aquí se cuenta directo en la bitácora)
SELECT upper(trim(split_part(detalle, '→', 2))) AS etapa, count(*) AS cambios
  FROM pedido_bitacora WHERE evento = 'etapa' AND tabla = 'pedidos' AND created_at > now() - interval '90 days'
 GROUP BY 1 ORDER BY 2 DESC;
