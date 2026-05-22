-- PRODIGY — Historial completo del flujo de revisión de diseño
-- Registra cada evento: subidas del operario, cambios del doctor, aprobación, descargas
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS historial_diseno (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id   UUID        NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  tipo        TEXT        NOT NULL,
  -- SUBIDA_DISENO | CAMBIO_SOLICITADO | APROBACION | DESCARGA | NOTA_DOCTOR | NOTA_OPERARIO
  actor       TEXT        NOT NULL DEFAULT 'sistema',
  -- operario | doctor | sistema
  descripcion TEXT,
  fotos_urls  TEXT[]      DEFAULT '{}',
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_historial_pedido ON historial_diseno(pedido_id);
CREATE INDEX IF NOT EXISTS idx_historial_tipo   ON historial_diseno(tipo);

ALTER TABLE historial_diseno ENABLE ROW LEVEL SECURITY;

-- Anon puede ver historial del caso (UUID-secured por pedido_id)
DROP POLICY IF EXISTS "anon_historial_select" ON historial_diseno;
CREATE POLICY "anon_historial_select" ON historial_diseno
  FOR SELECT TO anon
  USING (
    pedido_id IN (SELECT id FROM pedidos WHERE html_diseno_url IS NOT NULL)
  );

-- Anon puede insertar entradas del doctor
DROP POLICY IF EXISTS "anon_historial_insert" ON historial_diseno;
CREATE POLICY "anon_historial_insert" ON historial_diseno
  FOR INSERT TO anon
  WITH CHECK (actor IN ('doctor','sistema'));

-- Autenticados (operario/admin) tienen acceso total
DROP POLICY IF EXISTS "auth_historial_all" ON historial_diseno;
CREATE POLICY "auth_historial_all" ON historial_diseno
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
