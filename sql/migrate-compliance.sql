-- ────────────────────────────────────────────────────────────────
-- PRODIGY — Compliance, Equipos y Citas de Escaneo
-- Ejecutar en Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────

-- ── 1. AUDITORÍA LEGAL + INGRESOS en pedidos ─────────────────────
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS terminos_aceptados_at  TIMESTAMPTZ;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS ip_registro             TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS user_agent              TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS seguro_garantia_activo  BOOLEAN   DEFAULT false;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS costo_envio             INT       DEFAULT 0;

-- ── 2. HOJA DE VIDA DE EQUIPOS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS equipo_mantenimiento (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipo_id  TEXT        NOT NULL,   -- código QR de la máquina
    tecnico    TEXT,                   -- nombre libre (no FK a auth.users)
    accion     TEXT        NOT NULL    CHECK (accion IN ('CAMBIO_FRESA','LIMPIEZA','REPARACION','REVISION')),
    notas      TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE equipo_mantenimiento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_mantenimiento" ON equipo_mantenimiento;
CREATE POLICY "anon_insert_mantenimiento" ON equipo_mantenimiento
    FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_mantenimiento" ON equipo_mantenimiento;
CREATE POLICY "anon_select_mantenimiento" ON equipo_mantenimiento
    FOR SELECT TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_equipo_id ON equipo_mantenimiento(equipo_id);

-- ── 3. CITAS DE ESCANEO INTRAORAL ────────────────────────────────
-- NOTA: doctor identificado por whatsapp TEXT (no FK a auth.users)
CREATE TABLE IF NOT EXISTS citas_escaneo (
    id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    whatsapp   TEXT        NOT NULL,   -- identifica al doctor (igual que pedidos)
    doctor     TEXT,
    direccion  TEXT        NOT NULL,
    fecha_cita TIMESTAMPTZ NOT NULL,
    estado     TEXT        NOT NULL DEFAULT 'PROGRAMADA'
                           CHECK (estado IN ('PROGRAMADA','CONFIRMADA','REALIZADA','CANCELADA')),
    notas      TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE citas_escaneo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_upsert_citas" ON citas_escaneo;
CREATE POLICY "anon_upsert_citas" ON citas_escaneo
    FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_citas_whatsapp  ON citas_escaneo(whatsapp);
CREATE INDEX IF NOT EXISTS idx_citas_fecha     ON citas_escaneo(fecha_cita);
CREATE INDEX IF NOT EXISTS idx_citas_estado    ON citas_escaneo(estado);

DROP TRIGGER IF EXISTS citas_updated_at ON citas_escaneo;
CREATE TRIGGER citas_updated_at
    BEFORE UPDATE ON citas_escaneo
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
