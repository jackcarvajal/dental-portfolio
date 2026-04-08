-- ────────────────────────────────────────────────────────────────
-- PRODIGY — Módulo de Inventario & Costos
-- Ejecutar en Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────

-- ── 1. Ítems de inventario ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventario_items (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          TEXT        NOT NULL,
    categoria       TEXT        NOT NULL
                                CHECK (categoria IN ('Disco','Resina','Fresa','Consumible','Otro')),
    stock_actual    INT         NOT NULL DEFAULT 0,
    stock_minimo    INT         NOT NULL DEFAULT 3,
    unidad_medida   TEXT        NOT NULL DEFAULT 'unidad',
    costo_promedio  INT         NOT NULL DEFAULT 0,   -- COP, promedio ponderado
    kill_switch     BOOLEAN     NOT NULL DEFAULT false, -- bloquea material en flujo de pedidos
    activo          BOOLEAN     NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inv_items_cat  ON inventario_items(categoria);
CREATE INDEX IF NOT EXISTS idx_inv_items_kill ON inventario_items(kill_switch) WHERE kill_switch = true;

-- ── 2. Lotes de material ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lotes_material (
    id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id            UUID        NOT NULL REFERENCES inventario_items(id) ON DELETE CASCADE,
    numero_lote        TEXT        NOT NULL,
    cantidad_inicial   INT         NOT NULL,
    cantidad_restante  INT         NOT NULL,
    costo_unitario     INT         NOT NULL DEFAULT 0,  -- COP por unidad en este lote
    fecha_vencimiento  DATE,
    qr_interno         TEXT        UNIQUE,              -- generado: LOTE-{id corto}
    factura_url        TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lotes_item ON lotes_material(item_id);

-- ── 3. Movimientos (entradas y salidas) ──────────────────────────
CREATE TABLE IF NOT EXISTS inventario_movimientos (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id         UUID        NOT NULL REFERENCES inventario_items(id),
    lote_id         UUID        REFERENCES lotes_material(id),
    pedido_id       UUID        REFERENCES pedidos(id),
    tipo            TEXT        NOT NULL CHECK (tipo IN ('ENTRADA','SALIDA','AJUSTE')),
    cantidad        INT         NOT NULL,
    costo_unitario  INT         NOT NULL DEFAULT 0,
    factura_url     TEXT,
    notas           TEXT,
    usuario_id      UUID        REFERENCES auth.users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mov_item     ON inventario_movimientos(item_id);
CREATE INDEX IF NOT EXISTS idx_mov_pedido   ON inventario_movimientos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_mov_tipo     ON inventario_movimientos(tipo);
CREATE INDEX IF NOT EXISTS idx_mov_fecha    ON inventario_movimientos(created_at DESC);

-- ── 4. RLS ───────────────────────────────────────────────────────
ALTER TABLE inventario_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes_material         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_movimientos ENABLE ROW LEVEL SECURITY;

-- Lectura pública autenticada (para kill_switch en flujo de pedidos)
DROP POLICY IF EXISTS "inv_read_auth"  ON inventario_items;
CREATE POLICY "inv_read_auth" ON inventario_items
    FOR SELECT TO authenticated USING (true);

-- Escritura solo admin / encargado_inventario (via service_role o RLS check en metadata)
DROP POLICY IF EXISTS "inv_write_admin" ON inventario_items;
CREATE POLICY "inv_write_admin" ON inventario_items
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'encargado_inventario'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'encargado_inventario'
    );

DROP POLICY IF EXISTS "lotes_write_admin" ON lotes_material;
CREATE POLICY "lotes_write_admin" ON lotes_material
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'encargado_inventario'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'encargado_inventario'
    );

DROP POLICY IF EXISTS "lotes_read_auth" ON lotes_material;
CREATE POLICY "lotes_read_auth" ON lotes_material
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "mov_write_admin" ON inventario_movimientos;
CREATE POLICY "mov_write_admin" ON inventario_movimientos
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'encargado_inventario'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'encargado_inventario'
    );

DROP POLICY IF EXISTS "mov_read_auth" ON inventario_movimientos;
CREATE POLICY "mov_read_auth" ON inventario_movimientos
    FOR SELECT TO authenticated USING (true);

-- ── 5. Trigger updated_at en inventario_items ────────────────────
DROP TRIGGER IF EXISTS inv_items_updated_at ON inventario_items;
CREATE TRIGGER inv_items_updated_at
    BEFORE UPDATE ON inventario_items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 6. Función para actualizar stock automáticamente ─────────────
CREATE OR REPLACE FUNCTION actualizar_stock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.tipo = 'ENTRADA' THEN
        UPDATE inventario_items
        SET stock_actual    = stock_actual + NEW.cantidad,
            costo_promedio  = CASE
                WHEN stock_actual = 0 THEN NEW.costo_unitario
                ELSE ((stock_actual * costo_promedio) + (NEW.cantidad * NEW.costo_unitario))
                     / (stock_actual + NEW.cantidad)
            END,
            updated_at = now()
        WHERE id = NEW.item_id;
    ELSIF NEW.tipo IN ('SALIDA','AJUSTE') THEN
        UPDATE inventario_items
        SET stock_actual = GREATEST(0, stock_actual - NEW.cantidad),
            updated_at   = now()
        WHERE id = NEW.item_id;
    END IF;

    -- Kill switch automático si stock llega a 0
    UPDATE inventario_items
    SET kill_switch = (stock_actual = 0)
    WHERE id = NEW.item_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_actualizar_stock ON inventario_movimientos;
CREATE TRIGGER trg_actualizar_stock
    AFTER INSERT ON inventario_movimientos
    FOR EACH ROW EXECUTE FUNCTION actualizar_stock();

-- ── 7. Items de prueba (descomenta si quieres seed inicial) ───────
-- INSERT INTO inventario_items (nombre, categoria, stock_actual, stock_minimo, unidad_medida) VALUES
--   ('Disco Zirconio 98mm', 'Disco', 10, 3, 'unidad'),
--   ('Disco PMMA 98mm',     'Disco',  5, 3, 'unidad'),
--   ('Fresa 1mm Cilíndrica','Fresa',  8, 2, 'unidad'),
--   ('Resina Bisacryl',     'Resina', 4, 2, 'tubo');
