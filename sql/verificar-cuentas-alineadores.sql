-- ================================================================
-- PRODIGY — Alineadores: VERIFICAR CUENTAS (solo lectura, no cambia nada)
-- Muestra, para la técnica y para el cliente: total, pagado/abonado, saldo y desde qué caso empieza lo pendiente.
-- Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================
WITH may AS (SELECT g.*, c.paciente FROM public.alineadores_cargos g JOIN public.alineadores_casos c ON c.id = g.caso_id
              WHERE g.negocio = 'prodigy' AND g.parte = 'mayra'),
     cli AS (SELECT g.*, c.paciente FROM public.alineadores_cargos g JOIN public.alineadores_casos c ON c.id = g.caso_id
              WHERE g.negocio = 'prodigy' AND g.parte = 'cliente')
SELECT 1 AS orden, 'Mayra · trabajos (COP)' AS que, to_char(COALESCE(sum(monto),0),'FM999G999G999') AS valor FROM may
UNION ALL SELECT 2, 'Mayra · abonado (COP)', to_char(COALESCE(sum(monto),0),'FM999G999G999') FROM public.alineadores_pagos WHERE parte = 'mayra'
UNION ALL SELECT 3, 'Mayra · saldo por pagar (COP)', to_char(COALESCE(sum(monto),0),'FM999G999G999') FROM may WHERE estado_pago <> 'pagado'
UNION ALL SELECT 4, 'Mayra · lo pendiente empieza en', (SELECT paciente || ' (' || COALESCE(mes_corte,'?') || ', ' || to_char(monto,'FM999G999') || ')' FROM may WHERE estado_pago <> 'pagado' ORDER BY COALESCE(mes_corte,'9999-99'), fecha NULLS LAST, created_at LIMIT 1)
UNION ALL SELECT 5, 'Cliente · pagado (USD)', to_char(COALESCE(sum(monto),0),'FM999G990D00') FROM cli WHERE estado_pago = 'pagado'
UNION ALL SELECT 6, 'Cliente · facturado sin pagar (USD)', to_char(COALESCE(sum(monto),0),'FM999G990D00') FROM cli WHERE estado_pago = 'facturado'
UNION ALL SELECT 7, 'Cliente · sin facturar (USD)', to_char(COALESCE(sum(monto),0),'FM999G990D00') FROM cli WHERE estado_pago = 'pendiente'
UNION ALL SELECT 8, 'Cliente · TOTAL por cobrar (USD)', to_char(COALESCE(sum(monto),0),'FM999G990D00') FROM cli WHERE estado_pago <> 'pagado'
UNION ALL SELECT 9, 'Cliente · con PayPal (+ comisión acordada)', to_char(COALESCE(sum(g.monto),0) * (1 + COALESCE((SELECT comision_paypal FROM public.alineadores_clientes WHERE nombre = 'Panorámica Digital 3D'),0)),'FM999G990D00') FROM cli g WHERE g.estado_pago <> 'pagado'
UNION ALL SELECT 10, 'Cliente · el cobro pendiente empieza en', (SELECT paciente || ' (' || COALESCE(mes_corte,'?') || ', $' || to_char(monto,'FM990') || ')' FROM cli WHERE estado_pago <> 'pagado' ORDER BY COALESCE(mes_corte,'9999-99'), fecha NULLS LAST, created_at LIMIT 1)
ORDER BY 1;
-- Esperado hoy: Mayra 900.000 · abonado 400.000 · saldo 500.000 · empieza en Giselle Alvarado (2026-06, 20.000)
--               Cliente pagado 510 · facturado 720 · sin facturar 150 · total 870 · con PayPal 974,40 · empieza en Birmania Soto (2026-03, $30)
