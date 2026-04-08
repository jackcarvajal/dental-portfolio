-- ────────────────────────────────────────────────────────────────
-- PRODIGY v7.0 — Operaciones & Fidelización
-- Ejecutar en Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────

-- ── 1. NPS en pedidos ────────────────────────────────────────────
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS calificacion INT CHECK (calificacion BETWEEN 1 AND 5);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS calificacion_comentario TEXT;

-- ── 2. Foto evidencia en equipo_mantenimiento ────────────────────
ALTER TABLE equipo_mantenimiento ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE equipo_mantenimiento ADD COLUMN IF NOT EXISTS duracion_min INT; -- minutos de uso desde último cambio

-- ── 3. Web Push Subscriptions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint   TEXT        NOT NULL UNIQUE,
    p256dh     TEXT        NOT NULL,
    auth_key   TEXT        NOT NULL,
    rol        TEXT        NOT NULL DEFAULT 'mensajero',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_push_sub" ON push_subscriptions;
CREATE POLICY "own_push_sub" ON push_subscriptions
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Edge Functions usan service_role → bypasan RLS
CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_rol  ON push_subscriptions(rol);

-- ── 4. Créditos & Fidelización (Billetera ProDigy) ───────────────
CREATE TABLE IF NOT EXISTS creditos_cliente (
    id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    whatsapp         TEXT        NOT NULL,         -- identifica al doctor (no FK a auth.users)
    nombre_doctor    TEXT,
    saldo_cop        INT         NOT NULL DEFAULT 0,
    puntos           INT         NOT NULL DEFAULT 0,
    nivel            TEXT        NOT NULL DEFAULT 'Bronce'
                                 CHECK (nivel IN ('Bronce','Plata','Oro','Platino')),
    total_gastado    INT         NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_creditos_whatsapp UNIQUE (whatsapp)
);

ALTER TABLE creditos_cliente ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_creditos" ON creditos_cliente;
CREATE POLICY "admin_all_creditos" ON creditos_cliente
    FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_creditos_whatsapp ON creditos_cliente(whatsapp);

-- Trigger updated_at para creditos_cliente
DROP TRIGGER IF EXISTS creditos_updated_at ON creditos_cliente;
CREATE TRIGGER creditos_updated_at
    BEFORE UPDATE ON creditos_cliente
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
