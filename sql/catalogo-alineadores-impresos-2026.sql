-- =====================================================================
-- ALINEADORES IMPRESOS (fabricación en PRODIGY, Colombia) — aprobado por Alejandro el 24-nov-2026
--
-- Problema: PRODIGY imprime modelos pero no vendía el alineador terminado; el flujo de impresión solo tenía el modelo
--   para termoformar ($35.000) y Laboratorio Full un «Por Arco (modelo)» de $115.000 sin detalle.
-- Regla de negocio (pesos, por arcada):
--   · Alineador terminado (modelo impreso + lámina + termoformado + recorte y pulido) ... $55.000 por etapa
--   · Plantilla de attachments ........................................................ $35.000
--   · Retenedor final tipo Essix ...................................................... $55.000
-- Referencia: laboratorios de EE. UU. US$15–20 por alineador (uLab US$19, Sun Dental US$15).
-- Van en el flujo de impresión, categoría «Férulas, guías y alineadores» (resina_ferulas_guias). Con estas filas el
-- aviso de «precio sospechoso» y el panel de precios también los conocen. Afuera no se ofrecen (envío internacional).
--
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- =====================================================================

INSERT INTO public.catalogo AS c (id, categoria, flujo, nombre, precio, precio_usd, activo, fast_ready)
VALUES
  ('ali_impreso',   'resina_ferulas_guias', 'impresion', 'Alineador Terminado (por arcada y por etapa)', 55000, 0, true, false),
  ('ali_plantilla', 'resina_ferulas_guias', 'impresion', 'Plantilla de Attachments (por arcada)',        35000, 0, true, false),
  ('ali_retenedor', 'resina_ferulas_guias', 'impresion', 'Retenedor Final tipo Essix (por arcada)',      55000, 0, true, false)
ON CONFLICT (id) DO UPDATE
SET categoria  = EXCLUDED.categoria,
    flujo      = EXCLUDED.flujo,
    nombre     = EXCLUDED.nombre,
    precio     = EXCLUDED.precio,
    activo     = true,
    updated_at = now();

-- ── VERIFICACIÓN — debe dar 3 filas: ali_impreso 55000 · ali_retenedor 55000 · ali_plantilla 35000 ──
SELECT id, nombre, precio, activo FROM public.catalogo WHERE id IN ('ali_impreso','ali_plantilla','ali_retenedor') ORDER BY precio DESC, id;
