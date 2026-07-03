-- ============================================================
-- PRODIGY — Convertir revision-express a RPCs seguras (RLS insuficiente)
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-03):
-- 1) Las políticas RLS de `revision_tokens` (tokens_select_anon,
--    tokens_update_used) solo verifican el ESTADO de la fila (no usado,
--    no vencido) — NO exigen que el cliente conozca el valor exacto del
--    token. Cualquiera sin sesión puede hacer:
--      GET /rest/v1/revision_tokens?select=*
--    y obtener TODOS los tokens válidos + pedido_id de TODOS los casos
--    pendientes de aprobación, sin haber recibido el email. Postgres RLS
--    no puede "exigir" que el cliente incluya un filtro — solo evalúa
--    fila por fila, así que la única forma correcta de proteger un
--    "enlace mágico" es NO exponer la tabla directamente.
-- 2) No existe NINGUNA política que permita al rol `anon` hacer UPDATE
--    en `pedidos_doctor` — es decir, cuando un doctor SIN sesión iniciada
--    hace clic en el enlace de aprobación del email (el caso de uso
--    principal de esta función), el UPDATE en revision-express.html
--    probablemente fallaba silenciosamente con error de RLS.
--
-- Este patch reemplaza el acceso directo a las tablas por 3 funciones
-- SECURITY DEFINER que reciben el token como parámetro obligatorio y
-- hacen toda la operación (validar + marcar usado + actualizar pedido +
-- historial + log) en una sola transacción atómica — sin exponer las
-- tablas a SELECT/UPDATE directo desde anon.
-- ============================================================

-- ── 1. Endurecer RLS de revision_tokens — quitar acceso directo anon ──
DROP POLICY IF EXISTS "tokens_select_anon" ON revision_tokens;
DROP POLICY IF EXISTS "tokens_update_used" ON revision_tokens;
-- tokens_admin_all se mantiene (admin sigue pudiendo auditar la tabla)

-- ── 2. RPC: validar token (solo lectura, para mostrar la página) ──
CREATE OR REPLACE FUNCTION public.prodigy_validar_token_revision(
    p_token text,
    p_pedido_id uuid
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_tok record;
    v_ped record;
BEGIN
    SELECT * INTO v_tok FROM revision_tokens
    WHERE token = p_token AND pedido_id = p_pedido_id
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN json_build_object('ok', false, 'error', 'invalido');
    END IF;
    IF v_tok.usado THEN
        RETURN json_build_object('ok', false, 'error', 'usado');
    END IF;
    IF v_tok.expires_at < NOW() THEN
        RETURN json_build_object('ok', false, 'error', 'expirado');
    END IF;

    SELECT id, codigo, nombre_paciente, servicio, revisiones_usadas, html_diseno_url
    INTO v_ped FROM pedidos_doctor WHERE id = p_pedido_id;

    IF NOT FOUND THEN
        RETURN json_build_object('ok', false, 'error', 'pedido_no_encontrado');
    END IF;

    RETURN json_build_object(
        'ok', true,
        'pedido', json_build_object(
            'id', v_ped.id, 'codigo', v_ped.codigo,
            'nombre_paciente', v_ped.nombre_paciente, 'servicio', v_ped.servicio,
            'revisiones_usadas', v_ped.revisiones_usadas, 'html_diseno_url', v_ped.html_diseno_url
        )
    );
END;
$$;
GRANT EXECUTE ON FUNCTION public.prodigy_validar_token_revision(text, uuid) TO anon, authenticated;

-- ── 3. RPC: aprobar diseño (atómico: valida + marca usado + aprueba) ──
CREATE OR REPLACE FUNCTION public.prodigy_aprobar_via_token(
    p_token text,
    p_pedido_id uuid
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_tok record;
BEGIN
    -- Bloquea la fila para evitar doble-submit concurrente (TOCTOU)
    SELECT * INTO v_tok FROM revision_tokens
    WHERE token = p_token AND pedido_id = p_pedido_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('ok', false, 'error', 'invalido');
    END IF;
    IF v_tok.usado THEN
        RETURN json_build_object('ok', false, 'error', 'usado');
    END IF;
    IF v_tok.expires_at < NOW() THEN
        RETURN json_build_object('ok', false, 'error', 'expirado');
    END IF;

    UPDATE revision_tokens SET usado = true, usado_at = NOW() WHERE id = v_tok.id;

    UPDATE pedidos_doctor SET
        diseno_aprobado    = true,
        estado             = 'aprobado',
        diseno_aprobado_at = NOW()
    WHERE id = p_pedido_id;

    INSERT INTO historial_diseno (pedido_id, tipo, actor, descripcion)
    VALUES (p_pedido_id, 'APROBACION_EXPRESS', 'doctor_email',
            'Diseño aprobado vía enlace de email (revision-express)');

    INSERT INTO logs_incidencias (tipo, severidad, descripcion, resuelta)
    VALUES ('REVISION_EXPRESS_APROBADA', 'INFO',
            format('[REVISION-EXPRESS] Diseño aprobado — pedido: %s', p_pedido_id),
            true);

    RETURN json_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.prodigy_aprobar_via_token(text, uuid) TO anon, authenticated;

-- ── 4. RPC: solicitar cambios (atómico: valida + marca usado + registra) ──
CREATE OR REPLACE FUNCTION public.prodigy_solicitar_cambios_via_token(
    p_token text,
    p_pedido_id uuid,
    p_notas text
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_tok record;
    v_rev int;
    v_notas text;
BEGIN
    SELECT * INTO v_tok FROM revision_tokens
    WHERE token = p_token AND pedido_id = p_pedido_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('ok', false, 'error', 'invalido');
    END IF;
    IF v_tok.usado THEN
        RETURN json_build_object('ok', false, 'error', 'usado');
    END IF;
    IF v_tok.expires_at < NOW() THEN
        RETURN json_build_object('ok', false, 'error', 'expirado');
    END IF;

    v_notas := left(trim(COALESCE(p_notas, '')), 500);
    IF v_notas = '' THEN
        RETURN json_build_object('ok', false, 'error', 'notas_vacias');
    END IF;

    UPDATE revision_tokens SET usado = true, usado_at = NOW() WHERE id = v_tok.id;

    SELECT COALESCE(revisiones_usadas, 0) + 1 INTO v_rev FROM pedidos_doctor WHERE id = p_pedido_id;

    UPDATE pedidos_doctor SET
        estado            = 'revision',
        notas_cambios     = v_notas,
        revisiones_usadas = v_rev
    WHERE id = p_pedido_id;

    INSERT INTO historial_diseno (pedido_id, tipo, actor, descripcion)
    VALUES (p_pedido_id, 'CAMBIOS_EXPRESS', 'doctor_email',
            format('Cambios solicitados vía email: %s', left(v_notas, 100)));

    INSERT INTO logs_incidencias (tipo, severidad, descripcion, resuelta)
    VALUES ('REVISION_EXPRESS_CAMBIOS', 'INFO',
            format('[REVISION-EXPRESS] Cambios solicitados — pedido: %s | rev: %s/2', p_pedido_id, v_rev),
            true);

    RETURN json_build_object('ok', true, 'revisiones_usadas', v_rev);
END;
$$;
GRANT EXECUTE ON FUNCTION public.prodigy_solicitar_cambios_via_token(text, uuid, text) TO anon, authenticated;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Sin sesión (anon key), esto ya NO debe devolver filas:
--   SELECT * FROM revision_tokens; -- vía REST: GET /rest/v1/revision_tokens?select=*
-- Debe devolver 0 filas o error de permisos.
--
-- El flujo normal debe seguir funcionando end-to-end tras actualizar
-- revision-express.html (ver commit de código adjunto a este patch).
-- ============================================================
