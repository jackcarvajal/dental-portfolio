-- =====================================================================
-- CATÁLOGO DE DISEÑO — FULL ARCH POR UNIDAD, ENCÍA Y MODELOS (pedido de Alejandro, 24-nov-2026)
--
-- Problema: el Full Arch / híbrida costaba un valor fijo por arcada ($150.000), MENOS que una barra ($250.000), y no
--   había precio para diseñar la encía ni los modelos (el modelo salía «a cotizar»).
-- Regla de negocio (solo diseño; pesos = PRODIGY y Alejandro en Colombia · dólares = Alejandro en el exterior):
--   · Full Arch / híbrida ........................ por unidad   $30.000   US$12  (= 1 crédito; 15 unidades = US$180 de antes)
--     (la barra interna se cobra aparte, una por arcada, con el precio de «barra»)
--   · Encía ...................................... por diente   $10.000   US$3   (Alejandro: mejor por diente, sin tope)
--   · Modelo sin implantes ....................... por arcada   $20.000   US$4
--   · Modelo con implantes (análogos o encía rem.) por arcada   $30.000   US$8
--   · Troquel .................................... por pieza    $7.500    US$2   (referencia Sindekar: pieza segueteada)
-- Los ids son nuevos y únicos (no chocan con los modelos IMPRESOS del flujo de impresión: mod_*).
--
-- 100 % IDEMPOTENTE (fija los valores; correrlo dos veces da lo mismo).
-- Copiar TODO → Supabase SQL Editor → Run.
-- =====================================================================

INSERT INTO public.catalogo AS c (id, categoria, flujo, nombre, precio, precio_usd, activo)
VALUES
  ('all_on_4',           'cad_implantes', 'diseno', 'Full Arch / Híbrida (por unidad)',                       30000, 12, true),
  ('encia_unidad',       'cad_implantes', 'diseno', 'Encía (por diente)',                                     10000,  3, true),
  ('diseno_modelo',      'cad_modelos',   'diseno', 'Modelo sin implantes (por arcada)',                      20000,  4, true),
  ('diseno_modelo_impl', 'cad_modelos',   'diseno', 'Modelo con implantes — análogos o encía (por arcada)',   30000,  8, true),
  ('diseno_troquel',     'cad_modelos',   'diseno', 'Troquel (por pieza)',                                     7500,  2, true)
ON CONFLICT (id) DO UPDATE
SET categoria  = EXCLUDED.categoria,
    flujo      = EXCLUDED.flujo,
    nombre     = EXCLUDED.nombre,
    precio     = EXCLUDED.precio,
    precio_usd = EXCLUDED.precio_usd,
    activo     = true,
    updated_at = now();

-- Dólares en un solo criterio (24-nov-2026): guía de 1 implante US$60 (decisión de Alejandro) y diseño de sonrisa 3D US$80
UPDATE public.catalogo SET precio_usd = 60, updated_at = now() WHERE id = 'guia_1' AND flujo = 'diseno' AND precio_usd IS DISTINCT FROM 60;
UPDATE public.catalogo SET precio_usd = 80, updated_at = now() WHERE id = 'sonrisa_3d' AND flujo = 'diseno' AND precio_usd IS DISTINCT FROM 80;

-- ── VERIFICACIÓN — debe dar 7 filas: guia_1 180000/60 · sonrisa_3d 150000/80 · all_on_4 30000/12 · diseno_modelo_impl 30000/8 ·
--    diseno_modelo 20000/4 · encia_unidad 10000/3 · diseno_troquel 7500/2 ──
SELECT id, nombre, precio, precio_usd, activo
FROM public.catalogo
WHERE id IN ('all_on_4','encia_unidad','diseno_modelo','diseno_modelo_impl','diseno_troquel','guia_1','sonrisa_3d')
ORDER BY precio DESC;
