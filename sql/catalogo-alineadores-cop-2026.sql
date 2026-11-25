-- =====================================================================
-- ALINEADORES EN COLOMBIA (pesos) — $250.000 EL CASO (decisión de Alejandro, 24-nov-2026: «a ver qué podemos captar»)
--
-- Problema: la planificación salía a $80.000 POR ARCO; ahora el precio es por caso completo, igual que afuera.
-- Regla: caso completo (ambas arcadas: valoración + plan + STL por etapa) = $250.000; se paga primero la viabilidad de
--   $50.000 (si el caso no sigue, es lo único que se cobra) y $200.000 al aprobar. Afuera: US$90 (30 + 60), ya corrido.
-- Cambia `precio` (pesos) y el nombre de setup_orto. precio_usd (90) no se toca.
--
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- =====================================================================

UPDATE public.catalogo
SET precio = 250000,
    nombre = 'Planificación de alineadores — caso completo (ambas arcadas)',
    updated_at = now()
WHERE id = 'setup_orto' AND flujo = 'diseno'
  AND (precio IS DISTINCT FROM 250000 OR nombre IS DISTINCT FROM 'Planificación de alineadores — caso completo (ambas arcadas)');

-- ── VERIFICACIÓN — debe dar 1 fila: setup_orto · 250000 · 90 ──
SELECT id, nombre, precio, precio_usd FROM public.catalogo WHERE id = 'setup_orto';
