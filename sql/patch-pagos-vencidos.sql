-- ============================================================
-- PRODIGY — Gestión de pagos vencidos y alertas
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Verificar si la columna pago_recordatorio_at existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='pedidos' AND column_name='pago_recordatorio_at'
  ) THEN
    ALTER TABLE public.pedidos ADD COLUMN pago_recordatorio_at timestamptz;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='pedidos' AND column_name='pago_vencido'
  ) THEN
    ALTER TABLE public.pedidos ADD COLUMN pago_vencido boolean DEFAULT false;
  END IF;
END;
$$;

-- 2. RPC: pedidos con pago pendiente > 48h (candidatos a recordatorio)
CREATE OR REPLACE FUNCTION public.prodigy_pagos_pendientes(p_horas int DEFAULT 48)
RETURNS TABLE(
  id uuid, codigo text, doctor text, whatsapp text,
  total numeric, created_at timestamptz, horas_espera numeric,
  pago_recordatorio_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.codigo, p.nombre_doctor, p.telefono,
    COALESCE(p.precio_total::numeric, p.monto_total::numeric, 0) AS total,
    p.created_at,
    ROUND(EXTRACT(EPOCH FROM (now() - p.created_at))/3600, 1) AS horas_espera,
    p.pago_recordatorio_at
  FROM public.pedidos p
  WHERE p.negocio = 'prodigy'
    AND p.pago_estado IN ('pendiente', 'sin_pago')
    AND p.estado::text NOT IN ('Cancelado','cancelado','CANCELADO','Entregado','entregado','ENTREGADO')
    AND p.created_at < now() - (p_horas||' hours')::interval
    AND (p.pago_recordatorio_at IS NULL OR p.pago_recordatorio_at < now() - interval '24 hours')
  ORDER BY p.created_at ASC
  LIMIT 30;
END;
$$;

-- 3. RPC: marcar que se envió recordatorio
CREATE OR REPLACE FUNCTION public.prodigy_marcar_recordatorio(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.pedidos
  SET pago_recordatorio_at = now()
  WHERE id = p_id AND negocio = 'prodigy';
END;
$$;

-- 4. Índice para queries de pago pendiente
CREATE INDEX IF NOT EXISTS idx_pedidos_pago_estado
  ON public.pedidos (pago_estado, negocio, created_at)
  WHERE pago_estado IN ('pendiente','sin_pago');

-- GRANTs
GRANT EXECUTE ON FUNCTION public.prodigy_pagos_pendientes(int) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.prodigy_marcar_recordatorio(uuid) TO authenticated, service_role;

SELECT 'pagos vencidos OK' AS status;
