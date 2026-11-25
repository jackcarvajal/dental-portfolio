-- =====================================================================
-- ALINEADORES AFUERA (dólares) — US$90 EL CASO (decisión de Alejandro, 24-nov-2026: «captar clientes»)
--
-- Problema: la planificación de alineadores tenía tres precios en dólares (US$100 por arco en el flujo y la calculadora de
--   Alejandro, US$85 en la calculadora de PRODIGY y US$30 + US$120 = US$150 en las páginas en inglés).
-- Regla: caso completo (ambas arcadas: valoración + plan + STL por etapa) = US$90; se paga primero la viabilidad de US$30
--   (si el caso no se ejecuta es lo único que se cobra) y US$60 al aprobar. Es el precio que ya paga Panorámica Digital 3D.
-- Solo cambia precio_usd de setup_orto. Los PESOS (Colombia) no se tocan: falta decidir el precio en Colombia.
--
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- =====================================================================

UPDATE public.catalogo
SET precio_usd = 90, updated_at = now()
WHERE id = 'setup_orto' AND flujo = 'diseno' AND precio_usd IS DISTINCT FROM 90;

-- ── VERIFICACIÓN — debe dar 1 fila: setup_orto · precio 80000 (pesos, sin cambio) · precio_usd 90 ──
SELECT id, nombre, precio, precio_usd FROM public.catalogo WHERE id = 'setup_orto';
