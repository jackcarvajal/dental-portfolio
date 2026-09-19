-- ============================================================
-- VERIFICAR AISLAMIENTO DE LA VISTA pedidos_operacion
-- (auditoría 19-sep-2026 — flujo staff)
--
-- Los paneles de staff (taller, inventario) consultan la vista
-- `pedidos_operacion` para contadores SIN filtro de negocio explícito.
-- Si la vista NO filtra `negocio` internamente, el staff de PRODIGY
-- vería contadores que incluyen pedidos de Alejandro CAD/CAM.
--
-- Corre esto (read-only) y revisa la definición:
-- ============================================================

SELECT definition
FROM pg_views
WHERE schemaname = 'public' AND viewname = 'pedidos_operacion';

-- ¿Qué buscar en el resultado?
--   ✅ Si la definición incluye "WHERE ... negocio = 'prodigy'" (o similar)
--      → la vista YA está aislada, no hay que hacer nada.
--   ⚠️ Si NO menciona negocio → los contadores de taller/inventario
--      mezclan ambos negocios. Solución: recrear la vista agregando
--      el filtro de negocio, o filtrar en cada consulta (si la vista
--      expone la columna negocio).
--
-- Nota: es un tema de STAFF (contadores inflados), no una fuga de datos
-- al cliente ni un problema de seguridad. Prioridad baja.
