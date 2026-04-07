-- ============================================================
-- PRODIGY — Supabase Schema v1.0
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. BUCKET: dental-cases (STL hasta 200 MB) ──────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dental-cases',
  'dental-cases',
  false,
  209715200,  -- 200 MB
  ARRAY['model/stl','application/octet-stream','application/vnd.ms-pki.stl','application/sla']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit    = 209715200,
  allowed_mime_types = ARRAY['model/stl','application/octet-stream','application/vnd.ms-pki.stl','application/sla'];

-- Políticas de Storage
-- Admin puede subir imágenes de portafolio
CREATE POLICY "Admin sube portafolio" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'dental-cases'
    AND (storage.foldername(name))[1] = 'portafolio'
    AND (
      (auth.jwt()->'user_metadata'->>'role') = 'admin'
      OR auth.jwt()->>'email' IN ('labdentalprodigy@gmail.com','jessica@prodigy.com')
    )
  );

-- Lectura pública de imágenes de portafolio
CREATE POLICY "Portafolio imagenes publicas" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'dental-cases'
    AND (storage.foldername(name))[1] = 'portafolio'
  );

-- Cada doctor solo ve su carpeta
CREATE POLICY "Doctor sube STL propio" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dental-cases'
    AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Doctor lee STL propio" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'dental-cases'
    AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── 2. TIPOS ENUM ────────────────────────────────────────────
CREATE TYPE estado_pedido  AS ENUM ('Pendiente', 'Pagado', 'En Producción', 'Despachado');
CREATE TYPE pasarela_pago  AS ENUM ('paddle', 'paypal', 'transferencia');

-- ── 3. TABLA: clientes (doctores) ───────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nombre     TEXT NOT NULL,
  email      TEXT NOT NULL,
  telefono   TEXT,
  clinica    TEXT,
  ciudad     TEXT,
  pais       TEXT DEFAULT 'Colombia',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cliente_select_own" ON clientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cliente_insert_own" ON clientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cliente_update_own" ON clientes FOR UPDATE USING (auth.uid() = user_id);

-- ── 4. TABLA: pedidos ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedidos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        TEXT UNIQUE NOT NULL
                  DEFAULT 'PRD-' || UPPER(SUBSTR(gen_random_uuid()::TEXT, 1, 8)),
  cliente_id    UUID REFERENCES clientes(id) ON DELETE SET NULL,
  tipo_trabajo  TEXT NOT NULL,
  material      TEXT,
  pieza         TEXT,
  unidades      INT  DEFAULT 1,
  precio_base   NUMERIC(12,2) NOT NULL,
  precio_total  NUMERIC(12,2) NOT NULL,
  pasarela      pasarela_pago,
  recargo_pct   NUMERIC(5,2)  DEFAULT 0,
  estado        estado_pedido DEFAULT 'Pendiente',
  stl_url       TEXT,
  qr_code       TEXT,          -- base64 PNG del QR generado
  notas         TEXT,
  fecha_entrega TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pedidos_select_own" ON pedidos FOR SELECT USING (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
);
CREATE POLICY "pedidos_insert_own" ON pedidos FOR INSERT WITH CHECK (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
);
CREATE POLICY "pedidos_update_own" ON pedidos FOR UPDATE USING (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
);

-- Trigger: actualizar updated_at en cada UPDATE
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ── 5. TABLA: pagos ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pagos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id       UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  pasarela        TEXT NOT NULL,
  transaction_id  TEXT,
  monto           NUMERIC(12,2) NOT NULL,
  moneda          TEXT DEFAULT 'COP',
  estado          TEXT DEFAULT 'pendiente', -- pendiente|completado|fallido|reembolsado
  comprobante_url TEXT,   -- imagen del comprobante de transferencia
  webhook_data    JSONB,  -- payload crudo del webhook Paddle/PayPal
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagos_select_own" ON pagos FOR SELECT USING (
  pedido_id IN (
    SELECT p.id FROM pedidos p
    JOIN clientes c ON p.cliente_id = c.id
    WHERE c.user_id = auth.uid()
  )
);
CREATE POLICY "pagos_insert_own" ON pagos FOR INSERT WITH CHECK (
  pedido_id IN (
    SELECT p.id FROM pedidos p
    JOIN clientes c ON p.cliente_id = c.id
    WHERE c.user_id = auth.uid()
  )
);

-- ── 6. VISTA: historial completo por doctor ──────────────────
CREATE OR REPLACE VIEW historial_doctor AS
SELECT
  p.id, p.codigo, p.tipo_trabajo, p.material, p.pieza, p.unidades,
  p.precio_base, p.precio_total, p.pasarela, p.recargo_pct,
  p.estado, p.stl_url, p.qr_code, p.notas,
  p.fecha_entrega, p.created_at,
  pg.transaction_id,
  pg.estado        AS pago_estado,
  pg.comprobante_url
FROM pedidos p
LEFT JOIN pagos pg ON pg.pedido_id = p.id
WHERE p.cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
ORDER BY p.created_at DESC;

-- ── 7. TABLA: portfolio (casos del catálogo público) ────────
-- Cualquiera puede leer; solo admins pueden insertar/modificar/borrar.
-- El bucket dental-cases/portafolio/ almacena las imágenes.
CREATE TABLE IF NOT EXISTS portfolio (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      TEXT NOT NULL,
  tipo        TEXT,
  material    TEXT,
  software    TEXT,
  descripcion TEXT,
  categoria   TEXT DEFAULT 'Estética',
  destacado   BOOLEAN DEFAULT FALSE,
  imagen_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Lectura pública (catálogo visible para todos)
CREATE POLICY "portfolio_public_read" ON portfolio FOR SELECT USING (true);

-- Escritura solo para admins autenticados
-- (chequea user_metadata->>'role' = 'admin' o email en lista)
CREATE POLICY "portfolio_admin_insert" ON portfolio FOR INSERT TO authenticated
  WITH CHECK (
    auth.jwt()->>'email' IN (
      'labdentalprodigy@gmail.com',
      'jessica@prodigy.com'
    )
    OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

CREATE POLICY "portfolio_admin_update" ON portfolio FOR UPDATE TO authenticated
  USING (
    auth.jwt()->>'email' IN (
      'labdentalprodigy@gmail.com',
      'jessica@prodigy.com'
    )
    OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

CREATE POLICY "portfolio_admin_delete" ON portfolio FOR DELETE TO authenticated
  USING (
    auth.jwt()->>'email' IN (
      'labdentalprodigy@gmail.com',
      'jessica@prodigy.com'
    )
    OR (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );
