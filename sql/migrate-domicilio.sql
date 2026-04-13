-- ────────────────────────────────────────────────────────────────
-- PRODIGY — Tabla citas_domicilio
-- Servicio de escaneo intraoral a domicilio norte de Bogotá
-- Ejecutar en Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS citas_domicilio (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Datos del solicitante
    nombre              TEXT        NOT NULL,
    clinica             TEXT,                       -- clínica o consultorio (opcional si es particular)
    whatsapp            TEXT        NOT NULL,
    email               TEXT,

    -- Ubicación
    direccion           TEXT        NOT NULL,
    zona                TEXT        NOT NULL,       -- usaquen | chapinero | suba | barrios_unidos | teusaquillo | otro
    referencia          TEXT,                       -- piso, consultorio, indicaciones de acceso

    -- Cita
    fecha_cita          DATE        NOT NULL,
    franja_horaria      TEXT        NOT NULL,       -- manana (8-12) | tarde (13-17)
    servicio            TEXT        NOT NULL,       -- arco_completo | corona_unitaria | implantes | estudio_oclusal | otro
    num_piezas          INTEGER,
    notas               TEXT,

    -- Anticipo
    anticipo_solicitado NUMERIC(10,2) NOT NULL DEFAULT 50000,  -- COP
    anticipo_pagado     BOOLEAN     NOT NULL DEFAULT false,
    metodo_pago         TEXT,                       -- nequi | daviplata | transferencia | efectivo
    comprobante_url     TEXT,                       -- screenshot del pago subido a Storage

    -- Estado del ciclo de vida
    estado              TEXT        NOT NULL DEFAULT 'pendiente',
    -- pendiente → confirmada → en_camino → completada | cancelada | no_show

    -- Operacional
    operador_asignado   TEXT,
    hora_llegada        TIME,
    hora_salida         TIME,
    archivo_stl_url     TEXT,
    observaciones       TEXT,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_citas_domicilio_updated ON citas_domicilio;
CREATE TRIGGER trg_citas_domicilio_updated
    BEFORE UPDATE ON citas_domicilio
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE citas_domicilio ENABLE ROW LEVEL SECURITY;

-- Inserción pública — cualquier cliente puede agendar
DROP POLICY IF EXISTS "public_insert_citas" ON citas_domicilio;
CREATE POLICY "public_insert_citas" ON citas_domicilio
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Solo staff autenticado puede leer y modificar
DROP POLICY IF EXISTS "admin_all_citas" ON citas_domicilio;
CREATE POLICY "admin_all_citas" ON citas_domicilio
    FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_citas_fecha    ON citas_domicilio(fecha_cita);
CREATE INDEX IF NOT EXISTS idx_citas_estado   ON citas_domicilio(estado);
CREATE INDEX IF NOT EXISTS idx_citas_zona     ON citas_domicilio(zona);
CREATE INDEX IF NOT EXISTS idx_citas_whatsapp ON citas_domicilio(whatsapp);
