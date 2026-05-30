-- ============================================================
-- PRODIGY — Tabla revision_tokens para aprobación segura vía email
-- Implementa el flujo OWASP-seguro de revision-express.html
--
-- Cada vez que el diseño se sube a REVISION_CLIENTE, se crea un
-- token de un solo uso. El email lo incluye en el link.
-- La página /revision-express valida el token ANTES de mostrar botones.
-- La mutación SOLO ocurre cuando el doctor presiona [Aprobar].
-- ============================================================

CREATE TABLE IF NOT EXISTS public.revision_tokens (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    token       text UNIQUE NOT NULL,  -- JWT o UUID seguro
    pedido_id   uuid NOT NULL REFERENCES pedidos_doctor(id) ON DELETE CASCADE,
    usado       boolean DEFAULT false,
    usado_at    timestamptz DEFAULT NULL,
    expires_at  timestamptz DEFAULT (NOW() + INTERVAL '7 days'),
    created_at  timestamptz DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_revision_tokens_token    ON revision_tokens(token);
CREATE INDEX IF NOT EXISTS idx_revision_tokens_pedido   ON revision_tokens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_revision_tokens_expires  ON revision_tokens(expires_at) WHERE NOT usado;

-- RLS
ALTER TABLE revision_tokens ENABLE ROW LEVEL SECURITY;

-- Solo el sistema (service_role) puede INSERT tokens
-- Los usuarios pueden SELECT su propio token (para validación)
DROP POLICY IF EXISTS "tokens_select_anon" ON revision_tokens;
CREATE POLICY "tokens_select_anon" ON revision_tokens
    FOR SELECT TO anon, authenticated
    USING (NOT usado AND expires_at > NOW());

-- Actualización (marcar como usado): solo el propio token
DROP POLICY IF EXISTS "tokens_update_used" ON revision_tokens;
CREATE POLICY "tokens_update_used" ON revision_tokens
    FOR UPDATE TO authenticated, anon
    USING (NOT usado)
    WITH CHECK (usado = true);  -- solo puede cambiar a usado=true, no revertir

-- Admin puede ver todo
DROP POLICY IF EXISTS "tokens_admin_all" ON revision_tokens;
CREATE POLICY "tokens_admin_all" ON revision_tokens
    FOR ALL TO authenticated
    USING (
        (current_setting('request.jwt.claims', true)::jsonb ->> 'email')
        IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
    );

-- Limpieza automática de tokens vencidos (requiere pg_cron)
-- SELECT cron.schedule('limpiar-tokens-vencidos', '0 3 * * 1', $$
--     DELETE FROM revision_tokens WHERE expires_at < NOW() - INTERVAL '30 days';
-- $$);

-- ── FUNCIÓN: Crear token al subir diseño ───────────────────────
CREATE OR REPLACE FUNCTION prodigy_crear_revision_token(p_pedido_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    nuevo_token text;
BEGIN
    -- Invalidar tokens anteriores para este pedido
    UPDATE revision_tokens SET usado = true WHERE pedido_id = p_pedido_id AND NOT usado;

    -- Crear nuevo token (UUID v4 como token seguro)
    nuevo_token := gen_random_uuid()::text || '-' || encode(gen_random_bytes(16), 'hex');

    INSERT INTO revision_tokens (token, pedido_id, expires_at)
    VALUES (nuevo_token, p_pedido_id, NOW() + INTERVAL '7 days');

    RETURN nuevo_token;
END;
$$;

GRANT EXECUTE ON FUNCTION prodigy_crear_revision_token(uuid) TO authenticated;
GRANT ALL ON TABLE revision_tokens TO authenticated, anon;

-- ── USO DESDE EL OPERARIO AL SUBIR DISEÑO ──────────────────────
-- const { data: tokenData } = await sb.rpc('prodigy_crear_revision_token', { p_pedido_id: pedidoId });
-- const token = tokenData;
-- const url = `https://prodigylabdental.com/revision-express?token=${token}&pedido=${pedidoId}`;
-- // Incluir `url` en el email que se envía al doctor
