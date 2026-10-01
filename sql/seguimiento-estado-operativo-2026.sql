-- ================================================================
-- PRODIGY — Seguimiento público con el estado REAL del caso
-- Problema: buscar_pedido_publico() devolvía solo `estado` (enum grueso: Pendiente/Pagado/En Producción/
-- Despachado). La página /seguimiento-caso lo traducía con nombres que el enum no tiene, así que casi todo
-- caso salía como «Recibido» — incluso uno ya despachado. La máquina de estados real es `estado_operativo`
-- (docs/CONTRATO-ESTADOS.md).
-- Cambio: la función devuelve además `estado_operativo` (y sigue devolviendo `estado` para no romper nada).
-- La llave del caso (hash_seguridad) se sigue exigiendo igual que antes. No toca datos.
-- Esta es ahora la definición canónica (reemplaza la de parche-referidos-seguimiento-2026.sql).
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

CREATE OR REPLACE FUNCTION public.buscar_pedido_publico(
    p_codigo TEXT,
    p_nonce  TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    result JSON;
    v_nonce TEXT;
BEGIN
    SELECT hash_seguridad INTO v_nonce
    FROM pedidos
    WHERE upper(trim(codigo)) = upper(trim(p_codigo))
    LIMIT 1;

    IF v_nonce IS NOT NULL AND p_nonce IS NULL THEN
        RETURN NULL;
    END IF;
    IF v_nonce IS NOT NULL AND p_nonce IS NOT NULL AND v_nonce <> p_nonce THEN
        RETURN NULL;
    END IF;

    SELECT json_build_object(
        'codigo',           p.codigo,
        'servicio',         p.tipo_trabajo,
        'material',         p.material,
        'submaterial',      p.submaterial,
        'color_vita',       p.color_vita,
        'cantidad',         p.cantidad,
        'estado',           p.estado::text,
        'estado_operativo', NULLIF(upper(trim(p.estado_operativo)), ''),
        'fecha_entrega',    p.fecha_entrega,
        'flujo',            p.flujo,
        'created_at',       p.created_at
    )
    INTO result
    FROM pedidos p
    WHERE upper(trim(p.codigo)) = upper(trim(p_codigo))
    LIMIT 1;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.buscar_pedido_publico(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.buscar_pedido_publico(TEXT, TEXT) TO authenticated;

-- Verificación: cuántos casos hay por estado real (debe listar estados como EN_DISENO, ENTREGADO…)
SELECT COALESCE(NULLIF(upper(trim(estado_operativo)), ''), '(vacío = recibido)') AS estado_operativo, count(*) AS casos
FROM pedidos
WHERE negocio = 'prodigy'
GROUP BY 1
ORDER BY 2 DESC;
