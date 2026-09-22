-- ================================================================
-- FASE 3.1 — Material consumido por caso SIN COSTO, visible a TODO el staff.
-- Hoy inventario_movimientos solo lo leen admin/operator/inventario (y trae costo).
-- Este RPC (SECURITY DEFINER) devuelve item+cantidad SIN costo y SOLO a staff:
--   - técnicos/calidad → ven QUÉ material se usó (sin precio) ✅
--   - doctores / anónimos → no reciben nada ✅
--   - el COSTO sigue solo en inventario.html (admin/inventario)
-- No modifica ninguna RLS existente → additivo y reversible (DROP FUNCTION).
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

CREATE OR REPLACE FUNCTION public.material_por_caso(p_pedido_id uuid)
RETURNS TABLE(nombre text, cantidad int, unidad text, created_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT i.nombre, m.cantidad, i.unidad_medida, m.created_at
  FROM inventario_movimientos m
  JOIN inventario_items i ON i.id = m.item_id
  WHERE m.pedido_id = p_pedido_id
    AND m.tipo = 'SALIDA'
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') IN
        ('admin','operator','mensajero','encargado_inventario','calidad','contabilidad','diseno','taller','fresado','impresion','secretaria')
      OR (auth.jwt() ->> 'email') IN
        ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
    )
  ORDER BY m.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.material_por_caso(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.material_por_caso(uuid) TO authenticated;

SELECT 'RPC material_por_caso listo (material por caso sin costo, solo staff)' AS status;
