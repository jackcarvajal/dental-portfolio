-- ================================================================
-- Verificar / borrar el PEDIDO DE PRUEBA (2026-07-23)
-- Supabase Dashboard → SQL Editor
-- ================================================================

-- 1) ¿Se guardó? (correr DESPUÉS de generar la orden en flujo-diseno)
--    Si aparece 1 fila con tu 'PRUEBA BORRAR' → el bloqueador #1 está CERRADO.
select codigo, nombre_doctor, tipo_trabajo, precio_base, precio_total,
       estado, negocio, created_at
from pedidos
order by created_at desc
limit 1;


-- 2) BORRAR la prueba (correr solo cuando ya confirmaste que guardó).
--    Descomenta la línea de abajo (quítale el "-- ") y ajústala al codigo real.
-- delete from pedidos where nombre_doctor = 'PRUEBA BORRAR';

-- 2b) BORRAR las filas de prueba que dejó la auditoría automática:
-- delete from pedidos where nombre_doctor = 'AUDIT BOT BORRAR';
-- delete from solicitudes_scanner where doctor = 'AUDIT BOT BORRAR';
-- delete from cotizaciones where doctor_nombre = 'AUDIT BOT BORRAR';
