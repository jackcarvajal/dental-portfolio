-- ================================================================
-- ANÁLISIS / EXPORT de logs_incidencias
-- Corre cada bloque por separado (o todo y mira la última tabla).
-- En Supabase SQL Editor puedes DESCARGAR el resultado como CSV
-- con el botón "Download CSV" arriba a la derecha de los resultados.
-- ================================================================

-- 1) Resumen por tipo y severidad (foto general)
SELECT tipo, severidad, count(*) AS total,
       min(created_at) AS primera, max(created_at) AS ultima
FROM public.logs_incidencias
GROUP BY tipo, severidad
ORDER BY total DESC;

-- 2) ¿Siguen llegando? Incidencias por día (últimos 30 días)
SELECT date_trunc('day', created_at)::date AS dia, tipo, count(*) AS total
FROM public.logs_incidencias
WHERE created_at > now() - interval '30 days'
GROUP BY 1, 2
ORDER BY 1 DESC;

-- 3) CSP: agrupado por directiva + recurso bloqueado (qué se está reportando)
SELECT
  split_part(substring(descripcion from '\[CSP\] (.*?) \|'), ' → ', 1) AS directiva,
  split_part(substring(descripcion from '\[CSP\] (.*?) \|'), ' → ', 2) AS bloqueado,
  count(*) AS total
FROM public.logs_incidencias
WHERE tipo = 'CSP_VIOLATION'
GROUP BY 1, 2
ORDER BY total DESC;

-- 4) CSP: agrupado por página donde ocurrió
SELECT trim(split_part(descripcion, '|', 3)) AS pagina, count(*) AS total
FROM public.logs_incidencias
WHERE tipo = 'CSP_VIOLATION'
GROUP BY 1
ORDER BY total DESC;

-- 5) EXPORT COMPLETO (esta es la que conviene descargar como CSV)
SELECT created_at, tipo, severidad, resuelta, descripcion
FROM public.logs_incidencias
ORDER BY created_at DESC;
