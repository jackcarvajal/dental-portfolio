-- ============================================================
-- PRODIGY — SLA de pedidos (alertas por tiempo)
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Columna sla_horas_objetivo en pedidos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='pedidos' AND column_name='sla_horas_objetivo'
  ) THEN
    ALTER TABLE public.pedidos ADD COLUMN sla_horas_objetivo int DEFAULT 48;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='pedidos' AND column_name='sla_alerta_enviada'
  ) THEN
    ALTER TABLE public.pedidos ADD COLUMN sla_alerta_enviada boolean DEFAULT false;
  END IF;
END;
$$;

-- 2. RPC: pedidos que superan su SLA y no han sido alertados
CREATE OR REPLACE FUNCTION public.prodigy_pedidos_sla_vencido()
RETURNS TABLE(
  id uuid, codigo text, doctor text, whatsapp text,
  estado text, estado_operativo text,
  horas_transcurridas numeric, sla_horas_objetivo int
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.codigo, p.nombre_doctor, p.telefono,
    p.estado, p.estado_operativo,
    ROUND(EXTRACT(EPOCH FROM (now() - p.created_at))/3600, 1) AS horas_transcurridas,
    COALESCE(p.sla_horas_objetivo, 48) AS sla_horas_objetivo
  FROM public.pedidos p
  WHERE p.negocio = 'prodigy'
    AND p.estado NOT IN ('Cancelado', 'Entregado')
    AND p.estado_operativo NOT IN ('ENTREGADO', 'LISTO_DESPACHAR')
    AND (NOT p.sla_alerta_enviada OR p.sla_alerta_enviada IS NULL)
    AND EXTRACT(EPOCH FROM (now() - p.created_at))/3600 > COALESCE(p.sla_horas_objetivo, 48)
  ORDER BY horas_transcurridas DESC
  LIMIT 20;
END;
$$;

-- 3. RPC: marcar alerta SLA enviada
CREATE OR REPLACE FUNCTION public.prodigy_marcar_sla_alerta(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.pedidos SET sla_alerta_enviada = true WHERE id = p_id AND negocio = 'prodigy';
END;
$$;

-- 4. RPC: actualizar SLA objetivo por flujo
CREATE OR REPLACE FUNCTION public.prodigy_set_sla(p_flujo text, p_horas int)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _n int;
BEGIN
  UPDATE public.pedidos SET sla_horas_objetivo = p_horas
  WHERE flujo = p_flujo AND negocio = 'prodigy' AND sla_horas_objetivo IS NULL;
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END;
$$;

-- Default SLA por flujo
SELECT prodigy_set_sla('diseno', 24);
SELECT prodigy_set_sla('fresado', 48);
SELECT prodigy_set_sla('impresion', 24);

GRANT EXECUTE ON FUNCTION public.prodigy_pedidos_sla_vencido() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.prodigy_marcar_sla_alerta(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.prodigy_set_sla(text, int) TO authenticated, service_role;

SELECT 'SLA pedidos OK' AS status;
