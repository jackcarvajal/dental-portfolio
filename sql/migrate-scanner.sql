-- ────────────────────────────────────────────────────────────────
-- PRODIGY — Tabla solicitudes_scanner
-- Para clínicas con iTero/Medit/Trios que envían archivos sin lab propio
-- Ejecutar en Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS solicitudes_scanner (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica         TEXT        NOT NULL,
    doctor          TEXT        NOT NULL,
    whatsapp        TEXT        NOT NULL,
    email           TEXT,
    servicio        TEXT        NOT NULL,   -- tipo de trabajo solicitado
    escaner_marca   TEXT,                   -- iTero, Medit, 3Shape Trios, Cerec, Planmeca, Otro
    piezas          TEXT,                   -- cantidad / descripcion piezas
    notas           TEXT,
    archivo_url     TEXT,                   -- URL pública en Storage
    archivo_nombre  TEXT,
    estado          TEXT        NOT NULL DEFAULT 'nuevo',   -- nuevo | en_revision | cotizado | cerrado
    cotizacion      NUMERIC(12,2),
    contactado      BOOLEAN     NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE solicitudes_scanner ENABLE ROW LEVEL SECURITY;

-- INSERT público — cualquier clínica puede enviar solicitud
DROP POLICY IF EXISTS "public_insert_scanner" ON solicitudes_scanner;
CREATE POLICY "public_insert_scanner" ON solicitudes_scanner
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Lectura/gestión solo para staff autenticado
DROP POLICY IF EXISTS "admin_all_scanner" ON solicitudes_scanner;
CREATE POLICY "admin_all_scanner" ON solicitudes_scanner
    FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_scanner_estado    ON solicitudes_scanner(estado);
CREATE INDEX IF NOT EXISTS idx_scanner_created   ON solicitudes_scanner(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scanner_whatsapp  ON solicitudes_scanner(whatsapp);

-- ── Bucket de Storage para archivos de escáner ───────────────────
-- Ejecutar en Supabase Dashboard → Storage → New bucket:
--   Nombre: scanner-uploads
--   Public: NO (privado)
-- Luego añadir política de INSERT para anon en storage.objects:
--   bucket_id = 'scanner-uploads'  AND  role = 'anon'
-- O ejecutar el siguiente INSERT de política si prefieres SQL:
-- (requiere extensión pg_policies de Storage habilitada)
