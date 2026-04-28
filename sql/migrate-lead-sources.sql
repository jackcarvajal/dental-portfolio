-- ================================================================
-- PRODIGY — Tabla lead_sources (UTM tracking)
-- Ejecutar en Supabase SQL Editor
-- ================================================================

CREATE TABLE IF NOT EXISTS lead_sources (
    id          uuid        DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id  text,
    source      text        NOT NULL DEFAULT 'directo',
    medium      text,
    campaign    text,
    content     text,
    term        text,
    gclid       text,
    fbclid      text,
    landing     text,
    page        text,
    extra       jsonb,
    ts          timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ls_source   ON lead_sources(source);
CREATE INDEX IF NOT EXISTS idx_ls_campaign ON lead_sources(campaign);
CREATE INDEX IF NOT EXISTS idx_ls_ts       ON lead_sources(ts DESC);

ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ls_insert_anon" ON lead_sources;
DROP POLICY IF EXISTS "ls_select_admin" ON lead_sources;

CREATE POLICY "ls_insert_anon" ON lead_sources
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "ls_select_admin" ON lead_sources
    FOR SELECT TO authenticated USING (
        auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin','superadmin')
    );

-- Vista resumen para el Radar de Ventas
CREATE OR REPLACE VIEW v_utm_performance AS
SELECT
    source,
    medium,
    campaign,
    COUNT(*)                                AS visitas,
    COUNT(DISTINCT session_id)              AS sesiones_unicas,
    date_trunc('day', ts)                   AS dia
FROM lead_sources
WHERE ts >= now() - interval '30 days'
GROUP BY source, medium, campaign, date_trunc('day', ts)
ORDER BY dia DESC, visitas DESC;
