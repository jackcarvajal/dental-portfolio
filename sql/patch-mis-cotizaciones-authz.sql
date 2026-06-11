-- =============================================================
-- FIX SEGURIDAD: mis_cotizaciones(p_email) — IDOR sin autenticación
--
-- Problema: la función original (cotizaciones-table.sql) es
-- SECURITY DEFINER y GRANT EXECUTE TO authenticated, anon. Si se pasa
-- p_email, retorna TODAS las cotizaciones de ese email sin verificar
-- que pertenezca al usuario autenticado — y al estar otorgado a `anon`,
-- cualquiera (sin sesión) podía llamar
-- /rest/v1/rpc/mis_cotizaciones?p_email=victima@dominio.com
-- y obtener items, totales y notas de la cotización de otro doctor.
--
-- Fix: quita acceso anon, ignora p_email si no coincide con el email
-- de la sesión autenticada (siempre filtra por auth.uid() / email propio).
-- =============================================================

CREATE OR REPLACE FUNCTION public.mis_cotizaciones(p_email text DEFAULT NULL)
RETURNS TABLE (
  id uuid, created_at timestamptz, tipo text, items jsonb,
  subtotal numeric, total numeric, moneda text, estado text, expira_at timestamptz, notas text
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT id, created_at, tipo, items, subtotal, total, moneda, estado, expira_at, notas
  FROM public.cotizaciones
  WHERE
    user_id = auth.uid()
    OR doctor_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ORDER BY created_at DESC
  LIMIT 50;
$$;

REVOKE EXECUTE ON FUNCTION public.mis_cotizaciones(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.mis_cotizaciones(text) TO authenticated;
