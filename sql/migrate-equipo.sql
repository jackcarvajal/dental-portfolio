-- ────────────────────────────────────────────────────────────────
-- PRODIGY — Tabla perfiles (equipo interno + clientes)
-- Ejecutar en Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS perfiles (
    id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre      TEXT        NOT NULL,
    email       TEXT        NOT NULL,
    rol         TEXT        NOT NULL DEFAULT 'client'
                            CHECK (rol IN ('admin','operator','mensajero','taller','inventario','client')),
    clinica     TEXT,
    ciudad      TEXT,
    telefono    TEXT,
    activo      BOOLEAN     NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Admin ve todo el equipo
DROP POLICY IF EXISTS "perfiles_admin_all" ON perfiles;
CREATE POLICY "perfiles_admin_all" ON perfiles
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Cada usuario ve su propio perfil
DROP POLICY IF EXISTS "perfiles_own" ON perfiles;
CREATE POLICY "perfiles_own" ON perfiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());

-- Trigger updated_at
DROP TRIGGER IF EXISTS perfiles_updated_at ON perfiles;
CREATE TRIGGER perfiles_updated_at
    BEFORE UPDATE ON perfiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índices
CREATE INDEX IF NOT EXISTS idx_perfiles_rol    ON perfiles(rol);
CREATE INDEX IF NOT EXISTS idx_perfiles_activo ON perfiles(activo);
CREATE INDEX IF NOT EXISTS idx_perfiles_email  ON perfiles(email);
