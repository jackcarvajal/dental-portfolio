-- ================================================================
-- PRODIGY + Alejandro — DIAGNÓSTICO DE ARCHIVOS (solo lectura, no cambia nada)
-- Capacidad usada por bucket, límites, archivos más pesados, permisos de Storage y
-- consistencia entre la base y los archivos reales. Una sola consulta (el editor muestra la última).
-- Copiar TODO → Supabase SQL Editor → Run → copiar la tabla del resultado.
-- ================================================================
WITH
obj AS (
  SELECT bucket_id, name, COALESCE((metadata->>'size')::bigint, 0) AS bytes, created_at
    FROM storage.objects
),
buckets AS (
  SELECT 1 AS o, '1 · Bucket' AS seccion, b.id AS item,
         'público=' || b.public || ' · límite por archivo=' || COALESCE(pg_size_pretty(b.file_size_limit::bigint), 'global del proyecto')
         || ' · tipos=' || COALESCE(array_to_string(b.allowed_mime_types, ','), 'todos') AS valor
    FROM storage.buckets b
),
uso AS (
  SELECT 2, '2 · Uso por bucket', bucket_id,
         count(*) || ' archivos · ' || pg_size_pretty(sum(bytes)) || ' · último: ' || to_char(max(created_at), 'YYYY-MM-DD')
    FROM obj GROUP BY bucket_id
),
total AS (
  SELECT 3, '3 · Total', 'todos los buckets', count(*) || ' archivos · ' || pg_size_pretty(sum(bytes)) FROM obj
),
pesados AS (
  SELECT 4, '4 · Más pesados', bucket_id || '/' || left(name, 70), pg_size_pretty(bytes)
    FROM (SELECT * FROM obj ORDER BY bytes DESC LIMIT 12) t
),
grandes AS (
  SELECT 5, '5 · Mayores a 50 MB', bucket_id, count(*) || ' archivos' FROM obj WHERE bytes > 52428800 GROUP BY bucket_id
),
politicas AS (
  SELECT 6, '6 · Permiso Storage', policyname,
         cmd || ' · ' || array_to_string(roles, ',') || ' · ' || left(regexp_replace(COALESCE(qual, with_check, ''), '\s+', ' ', 'g'), 230)
    FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
),
registro_sin_archivo AS (
  SELECT 7, '7 · Registrado sin archivo', a.bucket || ' · ' || a.etapa, count(*) || ' filas de pedido_archivos cuyo archivo ya no existe'
    FROM public.pedido_archivos a
   WHERE a.estado = 'ok' AND NOT EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id = a.bucket AND o.name = a.ruta)
   GROUP BY a.bucket, a.etapa
),
stl_sin_archivo AS (
  SELECT 8, '8 · STL final sin archivo', 'pedidos.stl_ruta', count(*) || ' pedidos con stl_ruta que no está en dental-cases ni diseno-archivos'
    FROM public.pedidos p
   WHERE p.stl_ruta IS NOT NULL AND p.stl_ruta !~ '^https?://'
     AND NOT EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id IN ('dental-cases','diseno-archivos') AND o.name = p.stl_ruta)
),
huerfanos AS (
  SELECT 9, '9 · Archivo sin registro', o.bucket_id, count(*) || ' archivos · ' || pg_size_pretty(sum(o.bytes)) || ' que ningún pedido registra'
    FROM obj o
   WHERE o.bucket_id = 'pedidos-archivos'
     AND NOT EXISTS (SELECT 1 FROM public.pedido_archivos a WHERE a.bucket = o.bucket_id AND a.ruta = o.name)
   GROUP BY o.bucket_id
)
SELECT seccion, item, valor FROM (
  SELECT * FROM buckets UNION ALL SELECT * FROM uso UNION ALL SELECT * FROM total UNION ALL SELECT * FROM pesados
  UNION ALL SELECT * FROM grandes UNION ALL SELECT * FROM politicas UNION ALL SELECT * FROM registro_sin_archivo
  UNION ALL SELECT * FROM stl_sin_archivo UNION ALL SELECT * FROM huerfanos
) r ORDER BY o, item;
