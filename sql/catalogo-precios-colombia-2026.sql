-- =====================================================================
-- CATÁLOGO DE DISEÑO — PRECIOS EN PESOS PARA COLOMBIA (tabla aprobada por Alejandro, 24-nov-2026)
--
-- Problema: los precios en pesos del diseño estaban por debajo del mínimo (corona $15.000) y la
--   corona sobre implante costaba igual que una cementada. Referencia: Sindekar (diseño + escaneo).
-- Regla de negocio (solo diseño, público colombiano):
--   · Pieza cementada (corona, cofia, carilla, incrustación, póntico, endocrown) .... $30.000
--   · Pieza con conexión a implante (corona atornillada / sobre pilar) ................ $50.000
--   · Pilar personalizado solo ....................................................... $25.000 (igual)
--   · Provisional .................................................................... $20.000
--   · Encerado / mockup (por diente) ................................................. $15.000
--   · Barra .......................................................................... $250.000
-- Solo cambia `precio` (PESOS: PRODIGY y Alejandro cuando navega desde Colombia).
--   `precio_usd` (Alejandro en el exterior) NO se toca.
-- El aviso de «precio sospechoso» compara contra esta columna: un pedido viejo no se ve afectado.
--
-- 100 % IDEMPOTENTE (fija el valor; correrlo dos veces da lo mismo).
-- Copiar TODO → Supabase SQL Editor → Run.
-- =====================================================================

UPDATE public.catalogo AS c
SET precio     = v.cop,
    updated_at = now()
FROM (VALUES
  ('corona',       30000),   -- Corona anatómica / cofia
  ('carilla',      30000),   -- Carilla
  ('inlay',        30000),   -- Inlay / onlay / overlay
  ('puente',       30000),   -- Puente (por pieza / póntico)
  ('endocrown',    30000),   -- Endocrown
  ('corona_ator',  50000),   -- Corona sobre implante (atornillada o sobre pilar)
  ('provisional',  20000),   -- Provisional
  ('encerado',     15000),   -- Encerado diagnóstico (por diente)
  ('waxup',        15000),   -- Wax-up / mockup (por diente)
  ('barra',       250000),   -- Barra de implantes
  ('pilar_pers',   25000)    -- Pilar personalizado (sin cambio, se deja explícito)
) AS v(id, cop)
WHERE c.id = v.id
  AND c.flujo = 'diseno'
  AND c.precio IS DISTINCT FROM v.cop;

-- ── VERIFICACIÓN — debe dar: actualizados = 11 · corona = 30000 · corona_ator = 50000 · barra = 250000 · corona_usd = 12 ──
SELECT
  count(*) FILTER (WHERE (id IN ('corona','carilla','inlay','puente','endocrown') AND precio = 30000)
                      OR (id = 'corona_ator' AND precio = 50000)
                      OR (id = 'provisional' AND precio = 20000)
                      OR (id IN ('encerado','waxup') AND precio = 15000)
                      OR (id = 'barra' AND precio = 250000)
                      OR (id = 'pilar_pers' AND precio = 25000))   AS actualizados,
  max(precio)     FILTER (WHERE id = 'corona')      AS corona,
  max(precio)     FILTER (WHERE id = 'corona_ator') AS corona_ator,
  max(precio)     FILTER (WHERE id = 'barra')       AS barra,
  max(precio_usd) FILTER (WHERE id = 'corona')      AS corona_usd
FROM public.catalogo
WHERE flujo = 'diseno';
