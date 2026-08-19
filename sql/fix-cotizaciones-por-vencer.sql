-- ═══════════════════════════════════════════════════════════════
-- FIX prodigy_cotizaciones_por_vencer — la RPC seleccionaba
-- c.codigo / c.doctor / c.whatsapp, que NO existen en `cotizaciones`
-- (error 42703 → la edge function expire-cotizaciones NO enviaba
--  el recordatorio de WhatsApp de cotizaciones por vencer).
-- Reales: doctor_nombre, doctor_tel; no hay codigo → LEFT(id,8).
-- RETURNS TABLE se conserva (la function lee c.codigo/c.doctor/c.whatsapp,
-- que son los nombres de SALIDA, mapeados posicionalmente). No-destructivo.
-- Pegar en Supabase SQL Editor → Run.
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.prodigy_cotizaciones_por_vencer(p_dias int DEFAULT 7)
RETURNS TABLE(id uuid, codigo text, doctor text, whatsapp text, total numeric, expira_at timestamptz, dias_restantes int)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, LEFT(c.id::text, 8), c.doctor_nombre, c.doctor_tel, c.total, c.expira_at,
    EXTRACT(DAY FROM c.expira_at - now())::int AS dias_restantes
  FROM public.cotizaciones c
  WHERE c.estado IN ('borrador','enviada')
    AND c.negocio = 'prodigy'
    AND c.expira_at BETWEEN now() AND now() + (p_dias||' days')::interval
  ORDER BY c.expira_at ASC
  LIMIT 50;
END;
$$;

-- Verificar: SELECT * FROM prodigy_cotizaciones_por_vencer(30);
