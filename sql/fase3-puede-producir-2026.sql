-- ================================================================
-- FASE 3.2 — Validar pago SIN exponer montos ni estado de pago.
-- El técnico solo sabe "listo para trabajar" (sí/no); nunca ve precio,
-- abono, saldo ni el enum pago_estado.
--   puede_producir(id) = true si hay pago/abono/crédito ('pago_confirmado',
--   'pago_subido','credito_autorizado'). Solo-staff. SECURITY DEFINER.
-- Additivo y reversible (DROP FUNCTION). No modifica RLS existente.
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

CREATE OR REPLACE FUNCTION public.puede_producir(p_pedido_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(bool_or(pago_estado IN ('pago_confirmado','pago_subido','credito_autorizado')), false)
  FROM pedidos
  WHERE id = p_pedido_id
    AND (
      (auth.jwt() -> 'app_metadata' ->> 'role') IN
        ('admin','operator','mensajero','encargado_inventario','calidad','contabilidad','diseno','taller','fresado','impresion','secretaria')
      OR (auth.jwt() ->> 'email') IN
        ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
    );
$$;

REVOKE ALL ON FUNCTION public.puede_producir(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.puede_producir(uuid) TO authenticated;

SELECT 'RPC puede_producir listo (valida pago sin exponer montos)' AS status;
