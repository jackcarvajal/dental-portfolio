-- ============================================================
-- PRODIGY — Corregir IDOR en consulta de billetera/créditos del cliente
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-03): app/client-panel.html:1167-1169 busca
-- el saldo de crédito del doctor logueado así:
--
--   sb.from('creditos_cliente').select('*')
--     .or(`nombre_doctor.eq.${_nombreDoctor}`)
--
-- donde `_nombreDoctor = user.user_metadata?.nombre || ...`. Dos
-- problemas:
--   1) user_metadata lo edita el propio usuario desde el navegador —
--      cualquiera puede poner su nombre igual al de otro doctor y ver
--      SU saldo/crédito/puntos.
--   2) Aunque nadie lo explote a propósito, nombre_doctor no es único
--      (dos doctores pueden compartir nombre) — riesgo real de mostrar
--      el saldo de la persona equivocada por coincidencia.
--
-- Se agrega una RPC que resuelve la identidad del usuario SOLO a partir
-- de sus propios pedidos ya creados (pedidos.doctor_uid = auth.uid(),
-- protegido por RLS existente) — nunca confía en datos que el cliente
-- pueda editar.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_mi_wallet()
RETURNS TABLE (saldo_cop int, puntos int, nivel text, total_gastado int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_whatsapp text;
BEGIN
    -- Resuelve el whatsapp real del usuario a partir de SUS PROPIOS
    -- pedidos (doctor_uid = auth.uid(), no editable por el cliente)
    SELECT p.whatsapp INTO v_whatsapp
    FROM public.pedidos p
    WHERE p.doctor_uid = auth.uid() AND p.whatsapp IS NOT NULL
    ORDER BY p.created_at DESC
    LIMIT 1;

    IF v_whatsapp IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT c.saldo_cop, c.puntos, c.nivel, c.total_gastado
    FROM public.creditos_cliente c
    WHERE c.whatsapp = v_whatsapp
    LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.prodigy_mi_wallet() TO authenticated;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como doctor A logueado, cambiar user_metadata.nombre para que
-- coincida con el de otro doctor B (con saldo) y confirmar que
-- prodigy_mi_wallet() sigue devolviendo el saldo de A (o vacío si A
-- no tiene wallet), NUNCA el de B.
-- ============================================================
