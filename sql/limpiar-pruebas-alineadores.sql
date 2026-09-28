-- ================================================================
-- LIMPIEZA de las PRUEBAS de alineadores (casos cuyo paciente empieza por "PRUEBA")
-- Paso 1: corre solo el SELECT para ver qué se va a borrar.
-- Paso 2: si la lista es correcta, corre el bloque BEGIN … COMMIT.
-- Borra el caso y, en cascada, sus cargos (cliente y técnica) y sus entregas.
-- Los pagos de prueba se identifican por la palabra PRUEBA en la referencia o la nota.
-- ================================================================

-- Paso 1 — revisar
SELECT 'caso' AS que, id, paciente AS detalle, estado, created_at FROM public.alineadores_casos WHERE paciente ILIKE 'PRUEBA%'
UNION ALL
SELECT 'pago', id, COALESCE(referencia,'') || ' ' || COALESCE(nota,''), estado, created_at FROM public.alineadores_pagos
 WHERE referencia ILIKE '%PRUEBA%' OR nota ILIKE '%PRUEBA%'
UNION ALL
SELECT 'reporte web', id, left(descripcion, 60), estado, created_at FROM public.reportes_web WHERE descripcion ILIKE 'PRUEBA AUTOMÁTICA%'
ORDER BY created_at;

-- Paso 2 — borrar (descomenta y corre)
-- BEGIN;
-- DELETE FROM public.alineadores_casos WHERE paciente ILIKE 'PRUEBA%';
-- DELETE FROM public.alineadores_pagos WHERE referencia ILIKE '%PRUEBA%' OR nota ILIKE '%PRUEBA%';
-- DELETE FROM public.reportes_web WHERE descripcion ILIKE 'PRUEBA AUTOMÁTICA%';
-- COMMIT;
