-- =============================================
-- RPC v2: buscar_pedido_publico con validación de nonce
-- Ejecutar en Supabase SQL Editor (reemplaza la v1)
-- =============================================

CREATE OR REPLACE FUNCTION public.buscar_pedido_publico(
    p_codigo TEXT,
    p_nonce  TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    v_nonce TEXT;
BEGIN
    -- Obtener nonce almacenado
    SELECT nonce INTO v_nonce
    FROM pedidos
    WHERE upper(trim(codigo)) = upper(trim(p_codigo))
    LIMIT 1;

    -- Si el pedido tiene nonce y el cliente no lo envió → denegar
    IF v_nonce IS NOT NULL AND p_nonce IS NULL THEN
        RETURN NULL;
    END IF;

    -- Si el pedido tiene nonce y el enviado no coincide → denegar
    IF v_nonce IS NOT NULL AND p_nonce IS NOT NULL AND v_nonce <> p_nonce THEN
        RETURN NULL;
    END IF;

    -- Retornar campos públicos (sin PII)
    SELECT json_build_object(
        'codigo',        p.codigo,
        'servicio',      p.servicio,
        'material',      p.material,
        'submaterial',   p.submaterial,
        'color_vita',    p.color_vita,
        'cantidad',      p.cantidad,
        'estado',        p.estado::text,
        'fecha_entrega', p.fecha_entrega,
        'flujo',         p.flujo,
        'created_at',    p.created_at
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

-- Revocar la firma anterior (solo 1 parámetro) para forzar uso de v2
-- DROP FUNCTION IF EXISTS public.buscar_pedido_publico(TEXT);
-- Comentado: descomenta si quieres eliminar la v1
