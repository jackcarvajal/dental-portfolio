-- =============================================================
-- FIX SEGURIDAD: corte_mensual(p_whatsapp) — IDOR / autorización faltante
--
-- Problema: la función original (migrate-catalogo-completo.sql) es
-- SECURITY DEFINER y GRANT EXECUTE TO authenticated, pero NO valida
-- que p_whatsapp pertenezca al usuario autenticado. Cualquier doctor
-- con sesión podía pasar el WhatsApp de OTRO doctor y obtener su
-- corte mensual completo (códigos de pedido, servicios, totales/ingresos).
--
-- Fix: exige que p_whatsapp coincida con doctores_perfil.whatsapp del
-- usuario autenticado (auth.uid()), salvo que sea staff/admin
-- (app_metadata.role).
-- =============================================================

CREATE OR REPLACE FUNCTION public.corte_mensual(p_whatsapp TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    es_staff BOOLEAN;
    whatsapp_propio TEXT;
BEGIN
    es_staff := (auth.jwt()->'app_metadata'->>'role') IN ('admin','operario','staff');

    IF NOT es_staff THEN
        SELECT whatsapp INTO whatsapp_propio
        FROM doctores_perfil
        WHERE id = auth.uid();

        IF whatsapp_propio IS NULL OR whatsapp_propio <> p_whatsapp THEN
            RAISE EXCEPTION 'No autorizado para consultar este corte';
        END IF;
    END IF;

    SELECT json_build_object(
        'doctor',     p_whatsapp,
        'periodo',    to_char(date_trunc('month', now()), 'YYYY-MM'),
        'cantidad',   COUNT(*),
        'total',      COALESCE(SUM(total), 0),
        'pedidos',    json_agg(json_build_object(
            'codigo',  codigo,
            'servicio',servicio,
            'total',   total,
            'fecha',   created_at
        ) ORDER BY created_at DESC)
    )
    INTO result
    FROM pedidos
    WHERE whatsapp = p_whatsapp
      AND created_at >= date_trunc('month', now())
      AND estado NOT IN ('Cancelado');

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.corte_mensual(TEXT) TO authenticated;
