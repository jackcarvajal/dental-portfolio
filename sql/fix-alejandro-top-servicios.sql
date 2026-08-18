-- ═══════════════════════════════════════════════════════════════
-- FIX alejandro_top_servicios — estaba desplegada pero rota
-- (usaba columna 'servicio' inexistente → 42703/400 en app/metricas
-- de Alejandro). No estaba en el repo. Reconstruida a partir de
-- prodigy_top_servicios + filtro negocio='alejandrocadcam', usando
-- la columna real 'tipo_trabajo'. Pegar en Supabase SQL Editor → Run.
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION alejandro_top_servicios(limite INT DEFAULT 5)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE resultado JSON;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    SELECT json_agg(row_to_json(t)) INTO resultado FROM (
        SELECT
            SPLIT_PART(tipo_trabajo, '(', 1) AS servicio,
            COUNT(*)                          AS total,
            ROUND(AVG(precio_total))          AS ticket_promedio
        FROM pedidos
        WHERE created_at >= NOW() - INTERVAL '30 days'
          AND negocio = 'alejandrocadcam'
          AND tipo_trabajo IS NOT NULL
        GROUP BY 1
        ORDER BY total DESC
        LIMIT limite
    ) t;

    RETURN COALESCE(resultado, '[]'::JSON);
END;
$$;

GRANT EXECUTE ON FUNCTION alejandro_top_servicios(int) TO authenticated;

-- Verificar (como staff): SELECT alejandro_top_servicios(6);
