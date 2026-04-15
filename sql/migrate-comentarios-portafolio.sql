-- ================================================================
-- PRODIGY — Comentarios del Portafolio
-- Solo clientes/doctores logueados pueden comentar
-- ================================================================

CREATE TABLE IF NOT EXISTS comentarios_portafolio (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id      TEXT NOT NULL,                    -- patient-001, patient-002...
  doctor_id    UUID NOT NULL,                    -- auth.users.id
  doctor_nombre TEXT,                            -- de doctores_perfil.nombre
  texto        TEXT NOT NULL CHECK (char_length(texto) BETWEEN 5 AND 1000),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE comentarios_portafolio ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer (los comentarios son públicos en la ficha del caso)
CREATE POLICY "comentarios_public_read"
  ON comentarios_portafolio FOR SELECT
  USING (true);

-- Solo usuarios autenticados pueden insertar su propio comentario
CREATE POLICY "comentarios_auth_insert"
  ON comentarios_portafolio FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

-- El autor puede borrar su propio comentario
CREATE POLICY "comentarios_auth_delete"
  ON comentarios_portafolio FOR DELETE
  USING (auth.uid() = doctor_id);

-- Index para queries por caso
CREATE INDEX IF NOT EXISTS idx_comentarios_caso ON comentarios_portafolio (caso_id, created_at DESC);
