-- ═══════════════════════════════════════════════════════════════
-- PROMOCIONES + restaurativos editables en `catalogo` (2026-09-10)
--
-- 1) Agrega columnas de OFERTA a `catalogo`: precio_oferta + ventana [desde, hasta].
--    Cuando precio_oferta está seteado y HOY ∈ [oferta_desde, oferta_hasta], la oferta
--    está activa → el flujo cobra precio_oferta, muestra el precio normal tachado y un
--    conteo regresivo hasta oferta_hasta.
-- 2) Migra los 18 restaurativos de DISEÑO (hoy hardcodeados en flujo-diseno.html) a
--    `catalogo` → se vuelven editables desde admin-precios (los flujos ya sincronizan por id).
--
-- Tabla compartida → una sola corrida cubre PRODIGY (los restaurativos son de negocio PRODIGY).
-- Pegar en Supabase SQL Editor → Run.
-- ═══════════════════════════════════════════════════════════════

-- ── 1) Columnas de oferta ──────────────────────────────────────────────
ALTER TABLE public.catalogo
  ADD COLUMN IF NOT EXISTS precio_oferta integer,
  ADD COLUMN IF NOT EXISTS oferta_desde  timestamptz,
  ADD COLUMN IF NOT EXISTS oferta_hasta  timestamptz;

COMMENT ON COLUMN public.catalogo.precio_oferta IS 'Precio de oferta (COP). NULL = sin oferta.';
COMMENT ON COLUMN public.catalogo.oferta_desde  IS 'Inicio de la ventana de promoción.';
COMMENT ON COLUMN public.catalogo.oferta_hasta  IS 'Fin de la ventana de promoción (para el conteo regresivo).';

-- ── 2) Restaurativos de DISEÑO → catalogo (id = subtipo del flujo, para que sincronice) ──
--    ON CONFLICT: si ya existe la fila, NO piso el precio (respeta lo que ya tengas en admin).
INSERT INTO public.catalogo (id, flujo, categoria, nombre, precio, activo, fast_ready) VALUES
  ('corona',        'diseno','cad_fija',      'Corona Anatómica / Cofia',      15000, true, false),
  ('inlay',         'diseno','cad_fija',      'Inlay / Onlay / Overlay',       15000, true, false),
  ('carilla',       'diseno','cad_fija',      'Carilla Estética (Veneer)',     25000, true, false),
  ('puente',        'diseno','cad_fija',      'Puente (precio por pieza)',     15000, true, false),
  ('encerado',      'diseno','cad_fija',      'Encerado Diagnóstico Digital',  12000, true, false),
  ('endocrown',     'diseno','cad_fija',      'Endocrown / Corona Post-Endo',  15000, true, false),
  ('provisional',   'diseno','cad_fija',      'Provisional CAD (PMMA)',        10000, true, false),
  ('waxup',         'diseno','cad_fija',      'Wax-Up Digital / DSD',          12000, true, false),
  ('corona_ator',   'diseno','cad_implantes', 'Corona Atornillada',            25000, true, false),
  ('pilar_pers',    'diseno','cad_implantes', 'Pilar Personalizado',           25000, true, false),
  ('barra',         'diseno','cad_implantes', 'Barra de Implantes (primaria)', 120000,true, false),
  ('all_on_4',      'diseno','cad_implantes', 'Estructura Híbrida / All-on-4', 150000,true, false),
  ('ferula',        'diseno','cad_removible', 'Férula Miorrelajante',          35000, true, false),
  ('ferula_repo',   'diseno','cad_removible', 'Férula de Reposicionamiento',   40000, true, false),
  ('esqueleto',     'diseno','cad_removible', 'Esqueleto / PPR',               60000, true, false),
  ('sobredentadura','diseno','cad_removible', 'Base de Sobredentadura',        55000, true, false),
  ('cubeta',        'diseno','cad_removible', 'Cubeta Individual',             15000, true, false),
  ('setup_orto',    'diseno','cad_removible', 'Setup Alineadores (por arco)',  80000, true, false)
ON CONFLICT (id) DO NOTHING;

-- ── Verificar ──
-- SELECT id, nombre, precio, precio_oferta, oferta_hasta FROM public.catalogo
--   WHERE flujo='diseno' ORDER BY categoria, precio;
