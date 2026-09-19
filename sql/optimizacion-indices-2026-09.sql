-- ============================================================
-- OPTIMIZACIÓN DE ÍNDICES — proyecto Supabase zgihrwqfyvgyapbwzkvw
-- (BD compartida PRODIGY + Alejandro CAD/CAM, separada por columna `negocio`)
-- Fecha: 2026-09-19  ·  Autor: auditoría Claude Opus 4.8
--
-- Basado en los patrones de consulta REALES del front:
--   casos_portafolio: WHERE negocio IN (..) AND visible=true
--                     ORDER BY sort_order NULLS LAST, created_at DESC
--   pedidos:          WHERE negocio=.. [AND estado_operativo IN (..)] ORDER BY created_at DESC
--   solicitudes_scanner / newsletter_subscribers: WHERE negocio=.. ORDER BY created_at DESC
--
-- Todos los índices son IDEMPOTENTES (IF NOT EXISTS). No borran ni modifican datos.
-- ============================================================


-- ── PASO 1 · DIAGNÓSTICO — CORRE ESTO PRIMERO ────────────────
-- Muestra los índices que YA existen. Si alguno de abajo ya está
-- cubierto por las mismas columnas (con otro nombre), sáltalo.
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('casos_portafolio','pedidos','solicitudes_scanner','newsletter_subscribers')
ORDER BY tablename, indexname;


-- ── PASO 2 · ÍNDICES RECOMENDADOS ────────────────────────────
-- Revisa el resultado del PASO 1; ejecuta solo los que falten.

-- casos_portafolio: portafolio público (home, /portafolio, /links, caso relacionados)
-- Índice parcial (solo visibles) que cubre filtro por negocio + orden.
CREATE INDEX IF NOT EXISTS idx_casos_portafolio_negocio_visible_orden
  ON public.casos_portafolio (negocio, sort_order NULLS LAST, created_at DESC)
  WHERE visible = true;

-- pedidos: listados por negocio + orden temporal (paneles internos, métricas)
CREATE INDEX IF NOT EXISTS idx_pedidos_negocio_creado
  ON public.pedidos (negocio, created_at DESC);

-- pedidos: filtros por estado operativo dentro de un negocio (tableros, contadores)
CREATE INDEX IF NOT EXISTS idx_pedidos_negocio_estado_op
  ON public.pedidos (negocio, estado_operativo);

-- solicitudes_scanner: leads por negocio, más recientes primero (admin-panel)
CREATE INDEX IF NOT EXISTS idx_solicitudes_scanner_negocio_creado
  ON public.solicitudes_scanner (negocio, created_at DESC);

-- newsletter_subscribers: suscriptores por negocio (panel interno)
CREATE INDEX IF NOT EXISTS idx_newsletter_negocio_creado
  ON public.newsletter_subscribers (negocio, created_at DESC);


-- ── PASO 3 · (OPCIONAL) VERIFICAR USO ────────────────────────
-- Tras unos días de tráfico, revisa qué índices se usan de verdad:
-- SELECT relname, indexrelname, idx_scan
-- FROM pg_stat_user_indexes
-- WHERE schemaname='public' AND relname IN
--   ('casos_portafolio','pedidos','solicitudes_scanner','newsletter_subscribers')
-- ORDER BY idx_scan ASC;   -- idx_scan = 0 → índice sin uso, candidato a borrar.
