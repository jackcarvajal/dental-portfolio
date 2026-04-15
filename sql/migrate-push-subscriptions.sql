-- ================================================================
-- PRODIGY — Tabla push_subscriptions
-- Almacena suscripciones Web Push de operadores y mensajeros
-- Seguro de correr múltiples veces (IF NOT EXISTS + DROP IF EXISTS)
-- ================================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint    TEXT        NOT NULL UNIQUE,
    p256dh      TEXT        NOT NULL,
    auth_key    TEXT        NOT NULL,
    rol         TEXT        NOT NULL DEFAULT 'operador',  -- operador | mensajero | admin
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_push_subscriptions_updated ON push_subscriptions;
CREATE TRIGGER trg_push_subscriptions_updated
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Cada usuario gestiona solo sus propias suscripciones
DROP POLICY IF EXISTS "push_own_upsert" ON push_subscriptions;
CREATE POLICY "push_own_upsert" ON push_subscriptions
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admin puede leer todas (para enviar push a rol específico)
DROP POLICY IF EXISTS "push_admin_read" ON push_subscriptions;
CREATE POLICY "push_admin_read" ON push_subscriptions
    FOR SELECT TO authenticated
    USING (auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com'));

-- Índices
CREATE INDEX IF NOT EXISTS idx_push_user   ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_rol    ON push_subscriptions(rol);
CREATE INDEX IF NOT EXISTS idx_push_endpoint ON push_subscriptions(endpoint);
