-- ────────────────────────────────────────────────────────────────
-- PRODIGY — Lead Scoring Table
-- Ejecutar en Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leads (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id     TEXT        UNIQUE NOT NULL,
    visitas      INT         NOT NULL DEFAULT 0,
    descargas_stl INT        NOT NULL DEFAULT 0,
    score        INT         NOT NULL DEFAULT 0,
    etiqueta     TEXT        NOT NULL DEFAULT 'cold'
                             CHECK (etiqueta IN ('cold','warm','hot_lead')),
    interes      TEXT        DEFAULT NULL,  -- 'descarga_stl_30s' | NULL
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: anon puede upsert (el cliente registra su propia actividad)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_upsert_leads" ON leads;
CREATE POLICY "anon_upsert_leads" ON leads
    FOR ALL TO anon
    USING (true)
    WITH CHECK (true);

-- Índices para el admin (filtrar hot_leads rápido)
CREATE INDEX IF NOT EXISTS idx_leads_etiqueta ON leads(etiqueta);
CREATE INDEX IF NOT EXISTS idx_leads_score    ON leads(score DESC);

-- Trigger updated_at (reutiliza la función set_updated_at() creada en migrate-catalogo-completo.sql)
DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Vista admin: hot leads ordenados por score
CREATE OR REPLACE VIEW hot_leads_view AS
SELECT
    l.orden_id,
    l.visitas,
    l.descargas_stl,
    l.score,
    l.etiqueta,
    p.doctor,
    p.whatsapp,
    p.servicio,
    p.total,
    l.updated_at
FROM leads l
LEFT JOIN pedidos p ON p.codigo = l.orden_id
WHERE l.etiqueta IN ('warm','hot_lead')
ORDER BY l.score DESC, l.updated_at DESC;
