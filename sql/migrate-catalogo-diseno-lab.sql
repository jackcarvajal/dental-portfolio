-- PRODIGY — Catálogo de precios flujo-diseno y flujo-lab
-- Ejecutar en Supabase SQL Editor
-- Estos valores se leen al cargar cada flujo y se pueden editar desde admin-precios.html

-- ══════════════════════════════════════════════════════
-- FLUJO DISEÑO CAD — tabla catalogo
-- ══════════════════════════════════════════════════════
INSERT INTO catalogo (id, flujo, categoria, nombre, precio, activo) VALUES
  ('corona',      'diseno', 'cad_fija',       'Corona Anatómica / Cofia',            15000,  true),
  ('inlay',       'diseno', 'cad_fija',       'Inlay / Onlay / Overlay',             15000,  true),
  ('carilla',     'diseno', 'cad_fija',       'Carilla Estética (Veneer)',            25000,  true),
  ('puente',      'diseno', 'cad_fija',       'Puente (Precio por pieza)',            15000,  true),
  ('encerado',    'diseno', 'cad_fija',       'Encerado Diagnóstico Digital',        12000,  true),
  ('corona_ator', 'diseno', 'cad_implantes',  'Corona Atornillada',                  25000,  true),
  ('pilar_pers',  'diseno', 'cad_implantes',  'Pilar Personalizado',                 25000,  true),
  ('barra',       'diseno', 'cad_implantes',  'Barra de Implantes (Primaria)',       120000,  true),
  ('all_on_4',    'diseno', 'cad_implantes',  'Estructura Híbrida / All-on-4',      150000,  true),
  ('ferula',      'diseno', 'cad_removible',  'Férula Miorrelajante',                35000,  true),
  ('esqueleto',   'diseno', 'cad_removible',  'Esqueleto / PPR',                     60000,  true),
  ('cubeta',      'diseno', 'cad_removible',  'Cubeta Individual',                   15000,  true),
  ('setup_orto',  'diseno', 'cad_removible',  'Setup Alineadores (Por arco)',         80000,  true),
  ('guia_1_2',    'diseno', 'cad_quirurgica', 'Guía Quirúrgica 1-2 implantes',       90000,  true),
  ('guia_3_4',    'diseno', 'cad_quirurgica', 'Guía Quirúrgica 3-4 implantes',      150000,  true),
  ('guia_5_mas',  'diseno', 'cad_quirurgica', 'Guía Quirúrgica 5+ implantes',       220000,  true),
  ('sonrisa_3d',  'diseno', 'cad_quirurgica', 'Diseño de Sonrisa 3D (Mockup)',       150000,  true)
ON CONFLICT (id) DO UPDATE SET precio = EXCLUDED.precio, activo = EXCLUDED.activo;

-- Extras flujo diseño
INSERT INTO config_precios (id, flujo, nombre, precio) VALUES
  ('express_diseno',  'diseno', 'Entrega Express',    20000),
  ('envio_usb',       'diseno', 'Envío en USB',       15000)
ON CONFLICT (id) DO UPDATE SET precio = EXCLUDED.precio;

-- ══════════════════════════════════════════════════════
-- FLUJO LAB FULL — tabla catalogo
-- ══════════════════════════════════════════════════════
INSERT INTO catalogo (id, flujo, categoria, nombre, precio, activo) VALUES
  ('zr-ht',   'lab', 'zirconia',    'Zirconia High T.',           185000,  true),
  ('zr-ml',   'lab', 'zirconia',    'Zirconia Multilayer',         225000,  true),
  ('zr-fc',   'lab', 'zirconia',    'Zirconia Full Contour',       195000,  true),
  ('dis',     'lab', 'ceramica',    'Disilicato (e.max)',           265000,  true),
  ('pmma',    'lab', 'provisional', 'PMMA Provisional',             90000,  true),
  ('mc',      'lab', 'metal',       'Metal-Cerámica',              155000,  true),
  ('metal',   'lab', 'metal',       'Metal Solo',                  115000,  true),
  ('imp-tb',  'lab', 'implantes',   'Corona Ti-Base',              320000,  true),
  ('imp-mu',  'lab', 'implantes',   'Corona Multi-Unit',           360000,  true),
  ('imp-br',  'lab', 'implantes',   'Puente sobre implantes',      740000,  true),
  ('ali-sup', 'lab', 'ortodoncia',  'Alineadores Superior',        250000,  true),
  ('ali-inf', 'lab', 'ortodoncia',  'Alineadores Inferior',        250000,  true),
  ('ali-ret', 'lab', 'ortodoncia',  'Retenedor Hawley imp.',       131000,  true)
ON CONFLICT (id) DO UPDATE SET precio = EXCLUDED.precio, activo = EXCLUDED.activo;
