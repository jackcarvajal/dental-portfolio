-- ============================================================
-- PRODIGY — Tabla de configuración de plataformas de pago
-- Permite actualizar comisiones en tiempo real sin tocar código
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS config_plataformas (
    clave        TEXT PRIMARY KEY,          -- 'ls', 'paypal'
    nombre       TEXT NOT NULL,             -- nombre visible al cliente
    descripcion  TEXT,                      -- texto explicativo (sin "recargo" ni "impuesto")
    porcentaje   NUMERIC(5,2) NOT NULL,     -- e.g. 5.00
    fijo_usd     NUMERIC(10,4) DEFAULT 0,  -- cargo fijo en USD e.g. 0.50
    activo       BOOLEAN DEFAULT true,
    updated_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE config_plataformas ENABLE ROW LEVEL SECURITY;

-- Admin puede leer y escribir
CREATE POLICY "admin_all_config_plataformas" ON config_plataformas
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Público puede leer (necesario para la calculadora del cliente)
CREATE POLICY "anon_read_config_plataformas" ON config_plataformas
    FOR SELECT TO anon USING (activo = true);

-- ── SEED: tasas actuales (ajustar cuando cambien) ────────────
INSERT INTO config_plataformas (clave, nombre, descripcion, porcentaje, fijo_usd)
VALUES
    ('ls',
     'Servicio de pago global',
     'Incluye procesamiento seguro de divisas',
     5.00,
     0.50),
    ('paypal',
     'Procesamiento PayPal',
     'Incluye conversión y cobertura de comprador',
     4.40,
     0.49)
ON CONFLICT (clave) DO UPDATE SET
    porcentaje  = EXCLUDED.porcentaje,
    fijo_usd    = EXCLUDED.fijo_usd,
    nombre      = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    updated_at  = now();

-- ============================================================
-- RESULTADO:
-- ✅ Comisiones editables desde Supabase Table Editor
-- ✅ Sin tocar código HTML/JS para actualizar tasas
-- ✅ Acceso público lectura (anon) para la calculadora
-- ============================================================
