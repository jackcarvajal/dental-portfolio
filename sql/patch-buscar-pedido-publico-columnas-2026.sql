-- ============================================================
-- PRODIGY — CRÍTICO: buscar_pedido_publico() usa nonce/servicio (no existen)
-- Ejecutar en: Supabase Dashboard → SQL Editor — MÁXIMA PRIORIDAD
--
-- Hallazgo (auditoría 2026-07-06): la RPC pública que usa
-- seguimiento-caso.html para que cualquier cliente (sin login) consulte
-- el estado de su pedido por código referencia 2 columnas inexistentes:
--   - "nonce" (bare, sin alias de tabla) — la real es hash_seguridad
--   - "p.servicio" — la real es tipo_trabajo
-- Ambas hacen que la función entera falle con "column does not exist"
-- en cada llamada — la página pública de seguimiento de casos nunca
-- ha podido mostrar un pedido real.
-- ============================================================

CREATE OR REPLACE FUNCTION public.buscar_pedido_publico(
    p_codigo TEXT,
    p_nonce  TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
    v_nonce TEXT;
BEGIN
    -- Obtener nonce almacenado (columna real: hash_seguridad)
    SELECT hash_seguridad INTO v_nonce
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
        'servicio',      p.tipo_trabajo,
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

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT buscar_pedido_publico('PRD-XXXXXX', NULL);
--   → debe devolver JSON con los datos del pedido, no un error de columna.
-- ============================================================

SELECT 'patch-buscar-pedido-publico-columnas-2026 aplicado' AS status;
