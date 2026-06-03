-- ============================================================
-- PRODIGY — Expiración automática de cotizaciones
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Asegurar que expira_at existe y tiene default 30 días
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='cotizaciones' AND column_name='expira_at'
  ) THEN
    ALTER TABLE public.cotizaciones ADD COLUMN expira_at timestamptz DEFAULT (now() + interval '30 days');
  END IF;
END;
$$;

-- 2. Actualizar cotizaciones que no tienen expira_at (retroactivo)
UPDATE public.cotizaciones
SET expira_at = created_at + interval '30 days'
WHERE expira_at IS NULL AND created_at IS NOT NULL;

-- 3. RPC para expirar cotizaciones vencidas (llamar desde edge function o pg_cron)
CREATE OR REPLACE FUNCTION public.prodigy_expirar_cotizaciones()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _n int;
BEGIN
  UPDATE public.cotizaciones
  SET estado = 'expirada'
  WHERE estado IN ('borrador','enviada')
    AND expira_at < now()
    AND negocio = 'prodigy';
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;  -- devuelve cuántas se expiraron
END;
$$;

-- 4. RPC pública: cotizaciones próximas a vencer (para alertas en admin y WA)
CREATE OR REPLACE FUNCTION public.prodigy_cotizaciones_por_vencer(p_dias int DEFAULT 7)
RETURNS TABLE(id uuid, codigo text, doctor text, whatsapp text, total numeric, expira_at timestamptz, dias_restantes int)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.codigo, c.doctor, c.whatsapp, c.total, c.expira_at,
    EXTRACT(DAY FROM c.expira_at - now())::int AS dias_restantes
  FROM public.cotizaciones c
  WHERE c.estado IN ('borrador','enviada')
    AND c.negocio = 'prodigy'
    AND c.expira_at BETWEEN now() AND now() + (p_dias||' days')::interval
  ORDER BY c.expira_at ASC
  LIMIT 50;
END;
$$;

-- 5. Index para queries de vencimiento
CREATE INDEX IF NOT EXISTS idx_cotiz_expira ON public.cotizaciones (expira_at, estado) WHERE estado IN ('borrador','enviada');

SELECT 'cotizaciones expiracion OK' AS status;
