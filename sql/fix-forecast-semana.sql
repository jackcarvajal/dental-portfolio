-- ═══════════════════════════════════════════════════════════════
-- FIX prodigy_forecast_semana — el bloque "pedidos por día de semana"
-- usaba `created_at` en el SELECT externo, pero la subconsulta `daily`
-- ya lo había renombrado a `dia`/`dow` → 42703 "column created_at does
-- not exist" → la RPC devolvía 400 (el Dashboard BI fallaba).
-- Corregido: usa `dow` y `dia`. Pegar en Supabase SQL Editor → Run.
-- ═══════════════════════════════════════════════════════════════
DROP FUNCTION IF EXISTS public.prodigy_forecast_semana();

CREATE OR REPLACE FUNCTION public.prodigy_forecast_semana()
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
            dow::int AS dia_semana,
            TO_CHAR(dia, 'Day') AS nombre_dia,
            ROUND(AVG(cnt)) AS pedidos_esperados
        FROM (
            SELECT DATE_TRUNC('day', created_at) AS dia, COUNT(*) AS cnt,
                   EXTRACT(DOW FROM created_at) AS dow
            FROM pedidos
            WHERE created_at >= NOW() - INTERVAL '28 days'
            GROUP BY 1, 3
        ) daily
        GROUP BY dia_semana, nombre_dia
        ORDER BY dia_semana
    ) t;
    RETURN COALESCE(resultado, '[]'::JSON);
END;
$$;

-- Verificar:  SELECT prodigy_forecast_semana();
