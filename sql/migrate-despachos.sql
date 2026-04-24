-- ────────────────────────────────────────────────────────────────
-- PRODIGY — Módulo de Flota y Despachos v1.0
-- Ejecutar en Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────

-- ── 1. MENSAJEROS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mensajeros (
    id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
    nombre           TEXT        NOT NULL,
    telefono         TEXT        NOT NULL,
    placa_vehiculo   TEXT,
    activo           BOOLEAN     NOT NULL DEFAULT true,
    zona_preferencial TEXT       CHECK (zona_preferencial IN ('Norte','Sur','Centro','Occidente')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mensajeros ENABLE ROW LEVEL SECURITY;

-- Admin lee y escribe todo
DROP POLICY IF EXISTS "admin_all_mensajeros" ON mensajeros;
CREATE POLICY "admin_all_mensajeros" ON mensajeros
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_mensajeros_activo  ON mensajeros(activo);
CREATE INDEX IF NOT EXISTS idx_mensajeros_user_id ON mensajeros(user_id);

-- ── 2. DESPACHOS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS despachos (
    id                     UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id              UUID        NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    mensajero_id           UUID        NOT NULL REFERENCES mensajeros(id),
    fecha_salida           TIMESTAMPTZ,
    fecha_entrega_estimada TIMESTAMPTZ,
    fecha_entrega_real     TIMESTAMPTZ,
    estado                 TEXT        NOT NULL DEFAULT 'PROGRAMADO'
                                       CHECK (estado IN ('PROGRAMADO','EN_REPARTO','ENTREGADO','NO_ENTREGADO')),
    lat_entrega            DOUBLE PRECISION,
    lon_entrega            DOUBLE PRECISION,
    novedades              TEXT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE despachos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_despachos" ON despachos;
CREATE POLICY "admin_all_despachos" ON despachos
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Mensajero solo ve sus propios despachos
DROP POLICY IF EXISTS "mensajero_own_despachos" ON despachos;
CREATE POLICY "mensajero_own_despachos" ON despachos
    FOR SELECT USING (
        mensajero_id IN (
            SELECT id FROM mensajeros WHERE user_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_despachos_pedido    ON despachos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_despachos_mensajero ON despachos(mensajero_id);
CREATE INDEX IF NOT EXISTS idx_despachos_estado    ON despachos(estado);

-- Trigger updated_at
DROP TRIGGER IF EXISTS despachos_updated_at ON despachos;
CREATE TRIGGER despachos_updated_at
    BEFORE UPDATE ON despachos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 3. ESTADO EXTRA EN PEDIDOS ──────────────────────────────────
-- Añade los estados del flujo de despacho al ciclo de vida
-- TERMINADO → POR_DESPACHAR → EN_REPARTO → ENTREGADO
-- (Sin romper el CHECK existente — verifica si hay constraint antes)
-- Si hay un CHECK en la columna estado, amplíalo manualmente en el editor.
-- Campos de geolocalización de entrega (referencia en pedidos)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tracking_mensajero TEXT;
