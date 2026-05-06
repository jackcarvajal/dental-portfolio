-- PRODIGY — Tabla de departamentos por operario
-- Permite asignar múltiples departamentos a cada usuario desde el admin
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS staff_departamentos (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT        NOT NULL,
  nombre        TEXT,
  departamentos TEXT[]      DEFAULT '{}',
  -- Valores válidos: 'diseno', 'fresado', 'impresion', 'taller', 'mensajeria'
  activo        BOOLEAN     DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_email   ON staff_departamentos(email);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff_departamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_activo  ON staff_departamentos(activo);

ALTER TABLE staff_departamentos ENABLE ROW LEVEL SECURITY;

-- Operario puede leer su propio registro
CREATE POLICY "staff_read_own" ON staff_departamentos
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admin puede leer y escribir todos
CREATE POLICY "admin_all_staff" ON staff_departamentos
  FOR ALL TO authenticated
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin','superadmin')
  )
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin','superadmin')
  );
