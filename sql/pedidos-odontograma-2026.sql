-- ═══════════════════════════════════════════════════════════════════════════════════════════════════
-- PEDIDOS: orden por diente estructurada (odontograma estilo exocad DentalDB)  (oct-2026)
-- ═══════════════════════════════════════════════════════════════════════════════════════════════════
-- Problema: el flujo de diseño (PRODIGY y Alejandro) ya toma la orden diente por diente (indicación, material,
-- tono, implante y guía quirúrgica), pero hoy llega solo como texto en tipo_trabajo + las piezas en FDI
-- (pedidos.piezas). Sin el dato estructurado, el panel no puede pintar el odontograma del caso ni exportarlo.
--
-- Regla de negocio (Alejandro, 8-oct-2026):
--   · La orden se guarda tal cual la marcó el doctor, siempre con el diente en FDI (lo que usa el laboratorio).
--   · Forma: { "v":1, "nomenclatura":"fdi|universal|palmer", "proceso":"Diseño CAD",
--              "piezas":[{"fdi":11,"indicacion":"Corona anatómica","material":"Zirconio","tono":null,"implante":null}],
--              "guia": {"tipo":"guia_1","nombre":"…","sistema":"…","soporte":"…","guiado":"…","manga":"…"} | null }
--   · Tabla compartida PRODIGY / Alejandro (columna negocio): una sola columna para ambos.
--   · El front ya está publicado y es tolerante: solo envía la columna cuando existe.
--
-- 100 % IDEMPOTENTE — se puede correr varias veces.   Copiar TODO → SQL Editor → Run.
-- ═══════════════════════════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS odontograma jsonb;

ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS pedidos_odontograma_objeto;
ALTER TABLE public.pedidos ADD CONSTRAINT pedidos_odontograma_objeto
  CHECK (odontograma IS NULL OR (jsonb_typeof(odontograma) = 'object' AND jsonb_typeof(odontograma -> 'piezas') = 'array'));

COMMENT ON COLUMN public.pedidos.odontograma IS
  'Orden por diente del flujo de diseño (estilo exocad DentalDB): {v, nomenclatura, proceso, piezas[{fdi, indicacion, material, tono, implante}], guia}. Diente siempre en FDI.';

-- Los permisos de la tabla cubren la columna nueva (INSERT/SELECT a nivel de tabla, RLS sin cambios).

-- ── VERIFICACIÓN ─────────────────────────────────────────────────────────────────────────────────
-- Esperado: columna_ok = 1 · tipo = jsonb · check_ok = 1
SELECT
  (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'odontograma') AS columna_ok,
  (SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'odontograma') AS tipo,
  (SELECT count(*) FROM pg_constraint WHERE conname = 'pedidos_odontograma_objeto') AS check_ok;
