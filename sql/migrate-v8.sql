-- ────────────────────────────────────────────────────────────────
-- PRODIGY v8.0 — Workflows, Incidencias, Torre de Control
-- Ejecutar en Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────

-- ── 1. Columnas de flujo operativo en pedidos ────────────────────
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS estado_operativo TEXT DEFAULT 'VALIDACION_PENDIENTE';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS timestamp_validacion TIMESTAMPTZ;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS timestamp_produccion TIMESTAMPTZ;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS timestamp_qa         TIMESTAMPTZ;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS operador_id          UUID REFERENCES auth.users(id);

-- Índice para Torre de Control (urgencia)
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_op ON pedidos(estado_operativo);
CREATE INDEX IF NOT EXISTS idx_pedidos_validacion ON pedidos(timestamp_validacion);

-- ── 2. Tabla de incidencias ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS logs_incidencias (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id   UUID        REFERENCES pedidos(id),
    emisor_id   UUID        REFERENCES auth.users(id),
    tipo        TEXT        NOT NULL
                            CHECK (tipo IN (
                                'ERROR_STL','FALLA_MAQUINA','STOCK_CRITICO',
                                'DIRECCION_INCORRECTA','CLIENTE_AUSENTE',
                                'RETRASO_VALIDACION','OTRO'
                            )),
    descripcion TEXT        NOT NULL,
    severidad   TEXT        NOT NULL DEFAULT 'MEDIA'
                            CHECK (severidad IN ('BAJA','MEDIA','ALTA','CRITICA')),
    resuelta    BOOLEAN     NOT NULL DEFAULT false,
    resolucion  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE logs_incidencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inc_insert_auth" ON logs_incidencias;
CREATE POLICY "inc_insert_auth" ON logs_incidencias
    FOR INSERT TO authenticated WITH CHECK (emisor_id = auth.uid());

DROP POLICY IF EXISTS "inc_read_admin" ON logs_incidencias;
CREATE POLICY "inc_read_admin" ON logs_incidencias
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "inc_update_admin" ON logs_incidencias;
CREATE POLICY "inc_update_admin" ON logs_incidencias
    FOR UPDATE USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    );

CREATE INDEX IF NOT EXISTS idx_inc_pedido   ON logs_incidencias(pedido_id);
CREATE INDEX IF NOT EXISTS idx_inc_resuelta ON logs_incidencias(resuelta) WHERE resuelta = false;
CREATE INDEX IF NOT EXISTS idx_inc_sev      ON logs_incidencias(severidad);

DROP TRIGGER IF EXISTS inc_updated_at ON logs_incidencias;
CREATE TRIGGER inc_updated_at
    BEFORE UPDATE ON logs_incidencias
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 3. Contador de uso en equipos (para semáforo de mantenimiento) ─
ALTER TABLE equipo_mantenimiento ADD COLUMN IF NOT EXISTS horas_uso INT DEFAULT 0;

-- Vista: pedidos en validación con tiempo transcurrido
CREATE OR REPLACE VIEW v_pedidos_urgentes AS
SELECT
    p.id, p.codigo, p.nombre_paciente, p.servicio, p.estado_operativo,
    p.created_at, p.timestamp_validacion,
    EXTRACT(EPOCH FROM (now() - p.created_at)) / 60 AS minutos_desde_creacion,
    CASE
        WHEN p.estado_operativo = 'VALIDACION_PENDIENTE'
             AND EXTRACT(EPOCH FROM (now() - p.created_at)) / 60 > 40
        THEN 'CRITICO'
        WHEN p.estado_operativo = 'VALIDACION_PENDIENTE'
             AND EXTRACT(EPOCH FROM (now() - p.created_at)) / 60 > 25
        THEN 'ALERTA'
        ELSE 'OK'
    END AS urgencia
FROM pedidos p
WHERE p.estado_operativo NOT IN ('ENTREGADO','CANCELADO')
ORDER BY urgencia DESC, p.created_at ASC;
