-- ============================================================
-- PRODIGY — Tablas: doctores_perfil + pedidos_doctor
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Extensión UUID (ya debe existir, pero por si acaso)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PERFIL EXTENDIDO DEL DOCTOR ─────────────────────────
-- Vinculado 1:1 con auth.users. Se crea tras el signUp.
CREATE TABLE IF NOT EXISTS doctores_perfil (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL,
  clinica       TEXT NOT NULL,
  nit           TEXT,
  especialidad  TEXT DEFAULT 'Odontología General',
  whatsapp      TEXT,
  departamento  TEXT,
  municipio     TEXT,
  direccion     TEXT,
  forma_pago    TEXT DEFAULT 'transferencia',  -- transferencia | nequi | tarjeta
  activo        BOOLEAN NOT NULL DEFAULT true,
  notas_admin   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. PEDIDOS DEL DOCTOR ───────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos_doctor (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Snapshot del doctor al momento del pedido
  doctor_nombre         TEXT,
  doctor_clinica        TEXT,
  doctor_whatsapp       TEXT,

  -- Info clínica
  tipo_servicio         TEXT NOT NULL,  -- corona|carilla|puente|modelo|provisional|dsd|ferula
  material              TEXT NOT NULL,  -- zirconio-mono|zirconio-multi|disilicato|pmma|resina3d
  unidades              INTEGER NOT NULL DEFAULT 1,
  dientes               TEXT,           -- "11, 12, 21"
  notas_clinicas        TEXT,
  link_archivo          TEXT,           -- Drive / WeTransfer

  -- Extras
  urgente               BOOLEAN NOT NULL DEFAULT false,
  incluye_dsd           BOOLEAN NOT NULL DEFAULT false,
  incluye_envio         BOOLEAN NOT NULL DEFAULT false,

  -- Precios (calculados por el lab)
  precio_estimado       INTEGER,        -- COP sin decimales
  precio_final          INTEGER,

  -- Estado del pedido (actualizado por operador)
  estado                TEXT NOT NULL DEFAULT 'recibido',
  -- Valores válidos: recibido | en_diseno | en_fresado | control_calidad | listo | enviado | cancelado

  fecha_entrega_estimada DATE,
  notas_lab              TEXT,          -- notas internas del laboratorio

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. TRIGGER: updated_at automático ──────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_pedidos_doctor_updated ON pedidos_doctor;
CREATE TRIGGER trg_pedidos_doctor_updated
  BEFORE UPDATE ON pedidos_doctor
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 4. ROW LEVEL SECURITY ───────────────────────────────────
ALTER TABLE doctores_perfil  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_doctor   ENABLE ROW LEVEL SECURITY;

-- doctores_perfil: el doctor ve y edita su propio perfil
DROP POLICY IF EXISTS "doctor_own_profile"   ON doctores_perfil;
DROP POLICY IF EXISTS "admin_all_profiles"   ON doctores_perfil;

CREATE POLICY "doctor_own_profile" ON doctores_perfil
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "admin_all_profiles" ON doctores_perfil
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- pedidos_doctor: doctor ve/inserta sus propios pedidos; admin/operator ven todos
DROP POLICY IF EXISTS "doctor_own_pedidos"   ON pedidos_doctor;
DROP POLICY IF EXISTS "doctor_insert_pedido" ON pedidos_doctor;
DROP POLICY IF EXISTS "admin_all_pedidos"    ON pedidos_doctor;

CREATE POLICY "doctor_own_pedidos" ON pedidos_doctor
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "doctor_insert_pedido" ON pedidos_doctor
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "admin_all_pedidos" ON pedidos_doctor
  FOR ALL USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin','operator')
  );

-- ── 5. ÍNDICES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pedidos_doctor_id    ON pedidos_doctor(doctor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado       ON pedidos_doctor(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_created      ON pedidos_doctor(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_urgente      ON pedidos_doctor(urgente) WHERE urgente = true;
