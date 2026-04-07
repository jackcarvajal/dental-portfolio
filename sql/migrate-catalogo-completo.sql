-- =============================================
-- PRODIGY — Migración Maestra v4.0
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- ─────────────────────────────────────────────
-- 1. TABLA catalogo (materiales + precios + kill switch)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalogo (
    id          TEXT PRIMARY KEY,
    categoria   TEXT NOT NULL,
    flujo       TEXT NOT NULL DEFAULT 'impresion',  -- 'impresion' | 'fresado'
    nombre      TEXT NOT NULL,
    precio      NUMERIC(12,0) NOT NULL DEFAULT 0,
    activo      BOOLEAN NOT NULL DEFAULT true,
    fast_ready  BOOLEAN NOT NULL DEFAULT false,
    descripcion TEXT,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS: solo admins escriben, anon solo lee activos
ALTER TABLE catalogo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_catalogo" ON catalogo FOR SELECT TO anon USING (activo = true);
CREATE POLICY "auth_read_catalogo" ON catalogo FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_write_catalogo" ON catalogo FOR ALL TO authenticated USING (
    auth.jwt() ->> 'role' = 'admin'
) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 2. TABLA config_precios (extras y recargos)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS config_precios (
    id      TEXT PRIMARY KEY,
    nombre  TEXT NOT NULL,
    precio  NUMERIC(12,0) NOT NULL DEFAULT 0,
    tipo    TEXT NOT NULL DEFAULT 'extra',  -- 'extra' | 'recargo' | 'envio'
    flujo   TEXT NOT NULL DEFAULT 'impresion'
);
ALTER TABLE config_precios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_config" ON config_precios FOR SELECT TO anon USING (true);
CREATE POLICY "admin_write_config" ON config_precios FOR ALL TO authenticated USING (
    auth.jwt() ->> 'role' = 'admin'
) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 3. AMPLIAR pedidos: doctor, whatsapp, total, nonce, link_stl
-- ─────────────────────────────────────────────
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS doctor       TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS whatsapp     TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS total        NUMERIC(12,0);
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS nonce        TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS link_stl     TEXT;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS flujo        TEXT DEFAULT 'impresion';

-- ─────────────────────────────────────────────
-- 4. TABLA billeteras (saldo a favor por doctor)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS billeteras (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp    TEXT NOT NULL UNIQUE,  -- clave: número WA del doctor
    doctor_name TEXT,
    saldo_favor NUMERIC(12,0) NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE billeteras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_billeteras" ON billeteras FOR ALL TO authenticated USING (
    auth.jwt() ->> 'role' = 'admin'
) WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 5. SEED — Impresión 3D
-- ─────────────────────────────────────────────
INSERT INTO catalogo (id, categoria, flujo, nombre, precio, activo, fast_ready) VALUES
  ('mod_base',          'resina_modelo',         'impresion', 'Z-Model Base (Estudio/Trabajo)',              25000,  true, true),
  ('mod_termo',         'resina_modelo',         'impresion', 'Modelo Termoformado (Alineadores)',           35000,  true, true),
  ('mod_gingiva',       'resina_modelo',         'impresion', 'Modelo con Encía Flexible',                  45000,  true, true),
  ('mod_troquel',       'resina_modelo',         'impresion', 'Modelo Troquelado (Dieless)',                40000,  true, true),
  ('mod_geller',        'resina_modelo',         'impresion', 'Modelo Geller (Carillas)',                   50000,  true, true),
  ('mod_mockup',        'resina_modelo',         'impresion', 'Modelo Mock-Up',                             30000,  true, true),
  ('bio_estandar',      'resina_biomodelos',     'impresion', 'Mandíbula / Maxilar / Parte Ósea 1:1',       45000,  true, true),
  ('bio_craneo',        'resina_biomodelos',     'impresion', 'Cráneo Completo / Gran Volumen',             85000,  true, true),
  ('r_temp_standard',   'resina_temporal',       'impresion', 'Resina para Temporal',                       45000,  true, false),
  ('r_temp_largo',      'resina_temporal',       'impresion', 'Temporal Larga Duración',                   120000,  true, false),
  ('r_proto_eco',       'resina_temporal',       'impresion', 'Try-In Prototipo',                           30000,  true, false),
  ('r_barra_test',      'resina_temporal',       'impresion', 'JIG / Barra de Verificación',                50000,  true, false),
  ('r_rodete',          'resina_temporal',       'impresion', 'Rodete para toma de mordida',                60000,  true, false),
  ('def_rodin',         'resina_definitiva',     'impresion', 'Rodin Sculpture',                            50000,  true, false),
  ('def_bego',          'resina_definitiva',     'impresion', 'BEGO Varseo Plus',                           45000,  true, false),
  ('def_saremco',       'resina_definitiva',     'impresion', 'Saremco CROWNTEC',                           42000,  true, false),
  ('def_sprintray',     'resina_definitiva',     'impresion', 'SprintRay OnPoint',                          48000,  true, false),
  ('def_graphy',        'resina_definitiva',     'impresion', 'Graphy TC-80',                               45000,  true, false),
  ('def_estandar',      'resina_definitiva',     'impresion', 'Definitiva Estándar',                        35000,  true, false),
  ('calc_cofia',        'resina_calcinable',     'impresion', 'Coronas, Carillas, Incrustaciones o Abuts',  10000,  true, false),
  ('calc_barra',        'resina_calcinable',     'impresion', 'Barra para Implantes / Sobredentadura',      40000,  true, false),
  ('calc_esqueleto',    'resina_calcinable',     'impresion', 'Estructura Completa PPR',                    65000,  true, false),
  ('ferula_descarga',   'resina_ferulas_guias',  'impresion', 'Férula Miorrelajante / Descarga Rígida',     75000,  true, true),
  ('ferula_quirurgica', 'resina_ferulas_guias',  'impresion', 'Guía Quirúrgica de Alta Precisión',          85000,  true, true),
  ('ferula_cubeta',     'resina_ferulas_guias',  'impresion', 'Cubeta Individual de Impresión',             45000,  true, true)
ON CONFLICT (id) DO UPDATE SET precio = EXCLUDED.precio, activo = EXCLUDED.activo, updated_at = now();

-- ─────────────────────────────────────────────
-- 6. SEED — Fresado Digital
-- ─────────────────────────────────────────────
INSERT INTO catalogo (id, categoria, flujo, nombre, precio, activo, fast_ready) VALUES
  ('z_mono',      'zirc',  'fresado', 'Monocapa XT-PRO',   55000,  true, true),
  ('z_ht',        'zirc',  'fresado', 'HT XT-PRO',          60000,  true, true),
  ('z_shtml',     'zirc',  'fresado', 'SHTML XT-PRO',        70000,  true, true),
  ('z_tt_air',    'zirc',  'fresado', 'TT-AIR XT-PRO',       80000,  true, true),
  ('z_3d',        'zirc',  'fresado', '3D Pro XT-PRO',        95000,  true, false),
  ('z_smile',     'zirc',  'fresado', 'SMILE XT-PRO',        115000,  true, false),
  ('d_glass',     'disi',  'fresado', 'Disilicato XTCERA Nebula', 95000, true, false),
  ('p_mono',      'pmma',  'fresado', 'PMMA Monocromático',  30000,  true, false),
  ('p_multi',     'pmma',  'fresado', 'PMMA Multilayer',     40000,  true, false),
  ('p_clear',     'pmma',  'fresado', 'PMMA Clear',          45000,  true, false),
  ('m_peek',      'pmma',  'fresado', 'PEEK',               120000,  true, false),
  ('m_crco',      'metal', 'fresado', 'Cromo Cobalto',       80000,  true, false),
  ('m_ti_pre',    'metal', 'fresado', 'Pre-milled Titanium',150000,  true, false),
  ('m_ti_disco',  'metal', 'fresado', 'Titanium Abutment',  130000,  true, false),
  ('m_ti_b2',     'metal', 'fresado', 'Barra 2 Implantes',  450000,  true, false),
  ('m_ti_b3',     'metal', 'fresado', 'Barra 3 Implantes',  680000,  true, false),
  ('m_ti_b4',     'metal', 'fresado', 'Barra 4 Implantes',  900000,  true, false),
  ('m_ti_b56',    'metal', 'fresado', 'Barra 5-6 Implantes',1050000, true, false),
  ('m_ti_b78',    'metal', 'fresado', 'Barra 7-8 Implantes',1250000, true, false),
  ('m_ti_b8m',    'metal', 'fresado', 'Barra +8 Implantes', 1450000, true, false),
  ('cera_calc',   'cera',  'fresado', 'Cera Fresada Calcinable', 28000, true, false)
ON CONFLICT (id) DO UPDATE SET precio = EXCLUDED.precio, activo = EXCLUDED.activo, updated_at = now();

-- ─────────────────────────────────────────────
-- 7. SEED — config_precios (extras)
-- ─────────────────────────────────────────────
INSERT INTO config_precios (id, nombre, precio, tipo, flujo) VALUES
  ('postproceso_pulido',    'Postproceso — Pulido',      15000, 'extra',   'impresion'),
  ('postproceso_pintado',   'Postproceso — Pintado',     25000, 'extra',   'impresion'),
  ('acabado_uv',            'Glaseado UV Espejo',        15000, 'extra',   'impresion'),
  ('resolucion_25_micras',  'Recargo Alta Precisión 25µ',15000, 'recargo', 'impresion'),
  ('express_impresion',     'Recargo Express (impresión)',20000, 'recargo', 'impresion'),
  ('express_12h',           'Recargo Express 12h',       40000, 'recargo', 'impresion'),
  ('envio_nacional',        'Envío Nacional (fuera BGA)',15000, 'envio',   'impresion'),
  ('glaze',                 'Glaze Zirconio',            25000, 'extra',   'fresado'),
  ('cristalizado',          'Cristalizado',              20000, 'extra',   'fresado'),
  ('pulido_pmma',           'Pulido PMMA',               15000, 'extra',   'fresado'),
  ('sinter_rapido',         'Sinterizado Rápido',        50000, 'recargo', 'fresado'),
  ('express_fresado',       'Recargo Express (fresado)', 20000, 'recargo', 'fresado')
ON CONFLICT (id) DO UPDATE SET precio = EXCLUDED.precio;

-- ─────────────────────────────────────────────
-- 8. FUNCIÓN: corte mensual por doctor (WA)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.corte_mensual(p_whatsapp TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE result JSON;
BEGIN
    SELECT json_build_object(
        'doctor',     p_whatsapp,
        'periodo',    to_char(date_trunc('month', now()), 'YYYY-MM'),
        'cantidad',   COUNT(*),
        'total',      COALESCE(SUM(total), 0),
        'pedidos',    json_agg(json_build_object(
            'codigo',  codigo,
            'servicio',servicio,
            'total',   total,
            'fecha',   created_at
        ) ORDER BY created_at DESC)
    )
    INTO result
    FROM pedidos
    WHERE whatsapp = p_whatsapp
      AND created_at >= date_trunc('month', now())
      AND estado NOT IN ('Cancelado');

    RETURN result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.corte_mensual(TEXT) TO authenticated;

-- Trigger: actualizar updated_at en catalogo
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS trg_catalogo_updated ON catalogo;
CREATE TRIGGER trg_catalogo_updated
    BEFORE UPDATE ON catalogo
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
