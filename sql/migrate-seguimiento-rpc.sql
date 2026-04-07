-- =============================================
-- Función pública: buscar pedido por código (sin PII)
-- Permite que el cliente vea su estado sin autenticarse
-- =============================================

CREATE OR REPLACE FUNCTION public.buscar_pedido_publico(p_codigo TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE result JSON;
BEGIN
    SELECT json_build_object(
        'codigo',        p.codigo,
        'servicio',      p.servicio,
        'material',      p.material,
        'submaterial',   p.submaterial,
        'color_vita',    p.color_vita,
        'cantidad',      p.cantidad,
        'estado',        p.estado::text,
        'fecha_entrega', p.fecha_entrega,
        'created_at',    p.created_at
    )
    INTO result
    FROM pedidos p
    WHERE upper(trim(p.codigo)) = upper(trim(p_codigo))
    LIMIT 1;

    RETURN result;
END;
$$;

-- Acceso anónimo (el doctor no está autenticado)
GRANT EXECUTE ON FUNCTION public.buscar_pedido_publico(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.buscar_pedido_publico(TEXT) TO authenticated;
