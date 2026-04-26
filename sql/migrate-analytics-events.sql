-- ============================================================
-- PRODIGY — Analytics Events Table
-- Captura eventos de comportamiento: pagos, calculadora, audio, artículos
-- Ejecutar en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event       TEXT NOT NULL,
    session_id  TEXT,
    page        TEXT,
    props       JSONB DEFAULT '{}',
    ts          TIMESTAMPTZ DEFAULT now(),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Índices para queries del dashboard
CREATE INDEX IF NOT EXISTS idx_analytics_event   ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_session  ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_ts       ON analytics_events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_ts ON analytics_events(event, ts DESC);

-- RLS: INSERT público (anon puede escribir eventos), SELECT solo autenticados
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_insert_public" ON analytics_events;
CREATE POLICY "analytics_insert_public" ON analytics_events
    FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "analytics_read_admin" ON analytics_events;
CREATE POLICY "analytics_read_admin" ON analytics_events
    FOR SELECT TO authenticated USING (true);

-- Vista para dashboard de abandonamientos (últimos 7 días)
CREATE OR REPLACE VIEW v_checkout_abandoned AS
SELECT
    session_id,
    props->>'pasarela'   AS pasarela,
    (props->>'monto')::numeric AS monto,
    props->>'referencia' AS referencia,
    ts
FROM analytics_events
WHERE event = 'checkout_abandoned'
  AND ts > now() - interval '7 days'
ORDER BY ts DESC;

-- Vista de materiales más cotizados
CREATE OR REPLACE VIEW v_calculator_trends AS
SELECT
    props->>'valor' AS valor,
    props->>'tipo'  AS tipo,
    COUNT(*)        AS veces,
    MAX(ts)         AS ultimo
FROM analytics_events
WHERE event = 'calculator_engagement'
  AND ts > now() - interval '30 days'
GROUP BY props->>'valor', props->>'tipo'
ORDER BY veces DESC;

-- Vista artículos más leídos
CREATE OR REPLACE VIEW v_article_completions AS
SELECT
    props->>'article_id' AS article_id,
    COUNT(*)             AS completions,
    MAX(ts)              AS ultimo
FROM analytics_events
WHERE event = 'article_read_complete'
  AND ts > now() - interval '30 days'
GROUP BY props->>'article_id'
ORDER BY completions DESC;

COMMENT ON TABLE analytics_events IS 'PRODIGY — eventos de comportamiento para inteligencia de ventas';
