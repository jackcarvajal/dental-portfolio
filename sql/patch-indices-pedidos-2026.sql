-- ============================================================
-- PRODIGY — Índices faltantes en `pedidos`
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría rendimiento 2026-07-03): 3 columnas muy
-- consultadas en paneles activos no tienen índice de soporte,
-- forzando sequential scan en una tabla que crece con cada pedido:
--
-- 1) pedidos.email — client-panel.html:1151
--    .eq('email', email).order('created_at', ...)
-- 2) pedidos.hash_seguridad — client-panel.html:1121
--    .eq('hash_seguridad', token)  (login por link mágico)
-- 3) pedidos.created_at — panel-interno-operaciones.html:1607,3760
--    .order('created_at', ...) / .gte('created_at', desde) SIN filtro
--    (el único índice existente que toca created_at es un compuesto
--    canal_origen+negocio+created_at, insuficiente para ORDER BY solo)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_pedidos_email
    ON public.pedidos (email);

CREATE INDEX IF NOT EXISTS idx_pedidos_hash_seguridad
    ON public.pedidos (hash_seguridad)
    WHERE hash_seguridad IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_created_at
    ON public.pedidos (created_at DESC);

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT indexname FROM pg_indexes WHERE tablename = 'pedidos' AND indexname LIKE 'idx_pedidos_%';
--   → debe incluir idx_pedidos_email, idx_pedidos_hash_seguridad, idx_pedidos_created_at
-- EXPLAIN ANALYZE SELECT * FROM pedidos WHERE email = 'test@test.com' ORDER BY created_at DESC;
--   → debe mostrar "Index Scan" en vez de "Seq Scan"
