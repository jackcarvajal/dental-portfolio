-- ================================================================
-- Número de caso único para leads (escáner + escaneo a domicilio)
-- 100% IDEMPOTENTE — seguro de correr las veces que quieras.
-- Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- Código de caso para solicitudes de escáner (envia-tu-scanner)
ALTER TABLE public.solicitudes_scanner ADD COLUMN IF NOT EXISTS codigo TEXT;
CREATE INDEX IF NOT EXISTS idx_scanner_codigo ON public.solicitudes_scanner (codigo);

-- Código de caso para citas de escaneo a domicilio (escaner-domicilio)
ALTER TABLE public.citas_domicilio ADD COLUMN IF NOT EXISTS codigo TEXT;
CREATE INDEX IF NOT EXISTS idx_citas_domicilio_codigo ON public.citas_domicilio (codigo);

SELECT 'Columnas codigo agregadas (solicitudes_scanner, citas_domicilio)' AS status;
