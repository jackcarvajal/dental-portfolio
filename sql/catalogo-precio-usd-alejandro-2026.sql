-- =====================================================================
-- PRECIOS EN DÓLARES DEL CATÁLOGO (diseños de Alejandro CAD/CAM)
-- 20-nov-2026 · proyecto zgihrwqfyvgyapbwzkvw
--
-- PROBLEMA: catalogo.precio_usd está en 0 en todas las filas. La alerta
--   «Revisar precio del pedido» (detectar_precio_sospechoso, ver
--   sql/patch-deteccion-precio-manipulado-2026-07.sql) compara los pedidos en
--   dólares contra precio_usd; con 0 no puede juzgarlos, así que un pedido de
--   Alejandro con el precio alterado desde el navegador pasaría sin aviso.
--
-- QUÉ HACE: carga en precio_usd EXACTAMENTE la lista que ya cobra hoy
--   flujo-diseno.html de Alejandro (MATERIAL_DATA, «lista única 19-nov-2026»).
--   No cambia ningún precio para los clientes.
--     · 14 servicios que existen en el catálogo con el mismo id.
--     · 4 servicios de Alejandro NO están en el catálogo (guia_1_impl,
--       guia_adicional, guia_full_arch, prov_pmma_guia) → siguen sin vigilarse.
--     · PRODIGY no lee precio_usd en ningún lado (sus precios son COP en «precio»).
--
-- OJO DESDE AHORA: flujo-diseno de Alejandro toma precio_usd de la base cuando
--   es > 0. Para cambiar un precio en dólares de estos 14 servicios hay que
--   cambiarlo AQUÍ (catalogo.precio_usd); cambiarlo solo en el HTML no tendrá efecto.
--
-- 100 % IDEMPOTENTE: solo llena los que están en 0 o vacíos; si alguien ya puso
--   otro valor, no lo pisa. Copiar TODO → Supabase SQL Editor → Run.
-- =====================================================================

UPDATE public.catalogo AS c
SET precio_usd = v.usd,
    updated_at = now()
FROM (VALUES
  ('corona',          12),   -- Corona / Cofia (= 1 crédito)
  ('inlay',           12),   -- Inlay / Onlay / Overlay
  ('carilla',         12),   -- Carilla / Lámina
  ('puente',          12),   -- Puente (por pieza)
  ('encerado',        50),   -- Encerado diagnóstico / DSD
  ('corona_ator',     18),   -- Corona atornillada (= 1,5 créditos)
  ('pilar_pers',      18),   -- Pilar personalizado
  ('barra',          150),   -- Barra de implantes
  ('all_on_4',       180),   -- Full Arch / All-on-4
  ('ferula',          25),   -- Férula miorrelajante
  ('setup_orto',     100),   -- Setup alineadores (por arco)
  ('guia_sobredent', 145),   -- Guía sobredentadura (2 implantes)
  ('guia_hibrida',   170),   -- Guía híbrida (4 implantes)
  ('planif_unit',     70)    -- Planeación preliminar unitario
) AS v(id, usd)
WHERE c.id = v.id
  AND COALESCE(c.precio_usd, 0) = 0;

-- ── VERIFICACIÓN (debe dar: con_precio_usd = 14 · corona = 12 · all_on_4 = 180) ──
SELECT
  count(*) FILTER (WHERE precio_usd > 0)                  AS con_precio_usd,
  max(precio_usd) FILTER (WHERE id = 'corona')            AS corona,
  max(precio_usd) FILTER (WHERE id = 'all_on_4')          AS all_on_4
FROM public.catalogo;
