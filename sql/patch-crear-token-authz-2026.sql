-- ============================================================
-- PRODIGY — Restringir creación de tokens de revisión a staff
-- Ejecutar en: Supabase Dashboard → SQL Editor — URGENTE
--
-- Hallazgo (auditoría 2026-07-04): prodigy_crear_revision_token(uuid)
-- estaba otorgada a CUALQUIER usuario `authenticated`, sin verificar
-- que quien la llama sea staff. Esta función:
--   1) INVALIDA el token vigente de un pedido (UPDATE ... usado=true
--      WHERE pedido_id = p_pedido_id AND NOT usado) — es decir,
--      cualquier doctor podía invalidar el enlace de aprobación real
--      que ya se le envió por email a OTRO doctor.
--   2) Genera un NUEVO token para ESE pedido y lo devuelve al llamador.
--
-- Combinado con prodigy_aprobar_via_token (ya corregida en
-- patch-revision-express-rpc-seguro-2026.sql), esto permitía que
-- cualquier persona con sesión (doctor, o incluso un cliente cualquiera)
-- generara su propio token para el pedido de OTRO doctor y aprobara la
-- fabricación de un diseño que el verdadero doctor nunca revisó.
--
-- Esta función solo debe usarla el operario al subir un diseño nuevo
-- (según su propio comentario de uso en revision-tokens-table.sql).
-- ============================================================

CREATE OR REPLACE FUNCTION prodigy_crear_revision_token(p_pedido_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    nuevo_token text;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operario','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    -- Invalidar tokens anteriores para este pedido
    UPDATE revision_tokens SET usado = true WHERE pedido_id = p_pedido_id AND NOT usado;

    -- Crear nuevo token (UUID v4 como token seguro)
    nuevo_token := gen_random_uuid()::text || '-' || encode(gen_random_bytes(16), 'hex');

    INSERT INTO revision_tokens (token, pedido_id, expires_at)
    VALUES (nuevo_token, p_pedido_id, NOW() + INTERVAL '7 days');

    RETURN nuevo_token;
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como doctor logueado (no operario/admin), esto debe fallar:
--   SELECT prodigy_crear_revision_token('<uuid-de-cualquier-pedido>');
-- Como operario/admin, debe seguir funcionando igual que antes.
-- ============================================================
