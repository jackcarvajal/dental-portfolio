-- ============================================================
-- PRODIGY — Patch: Protección de columnas sensibles en pedidos para clientes
-- Problema: "pedidos_update_client_calificacion" permite al cliente actualizar
--           CUALQUIER columna de su propio pedido (estado, precio_total, etc.)
-- Fix: Trigger BEFORE UPDATE que bloquea cambios a columnas críticas
--      cuando quien actualiza NO es admin ni staff
-- ============================================================
-- Ejecutar en: Supabase > SQL Editor

-- ── 1. Función que protege columnas críticas de actualizaciones de clientes ─
CREATE OR REPLACE FUNCTION prodigy_restrict_client_pedido_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _email  text;
    _role   text;
    _is_staff boolean;
BEGIN
    -- Obtener email y rol del JWT actual
    _email := (current_setting('request.jwt.claims', true)::jsonb ->> 'email');
    _role  := (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role');

    -- Definir si es staff (admin o cualquier rol operativo)
    _is_staff := (
        _email IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        OR _role IN ('admin', 'operator', 'diseno', 'fresado', 'impresion', 'taller', 'calidad', 'contabilidad', 'mensajero', 'encargado_inventario')
    );

    -- Si es staff, permitir todo
    IF _is_staff THEN
        RETURN NEW;
    END IF;

    -- ── Para clientes: bloquear cambios a campos críticos ──

    -- Estado del pedido (solo admin/staff pueden cambiarlo)
    IF NEW.estado IS DISTINCT FROM OLD.estado THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden modificar el estado del pedido (%.estado: % → %)',
            OLD.id, OLD.estado, NEW.estado;
    END IF;

    -- Estado operativo interno
    IF NEW.estado_operativo IS DISTINCT FROM OLD.estado_operativo THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden modificar estado_operativo';
    END IF;

    -- Precio total
    IF NEW.precio_total IS DISTINCT FROM OLD.precio_total THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden modificar precio_total';
    END IF;

    -- Precio saldo
    IF NEW.precio_saldo IS DISTINCT FROM OLD.precio_saldo THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden modificar precio_saldo';
    END IF;

    -- Pago confirmado (el cliente puede subir comprobante pero no confirmarlo)
    IF NEW.pago_estado = 'pago_confirmado' AND OLD.pago_estado != 'pago_confirmado' THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden confirmar pago directamente';
    END IF;

    -- Ruta STL (solo admin puede asignar el archivo final)
    IF NEW.stl_ruta IS DISTINCT FROM OLD.stl_ruta THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden modificar stl_ruta';
    END IF;

    -- Liberación de STL
    IF NEW.stl_liberado IS DISTINCT FROM OLD.stl_liberado THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden cambiar stl_liberado';
    END IF;

    -- Propietario del pedido (no puede reasignarlo)
    IF NEW.doctor_uid IS DISTINCT FROM OLD.doctor_uid THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden reasignar doctor_uid';
    END IF;
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden reasignar user_id';
    END IF;

    -- Campos que SÍ pueden actualizar los clientes:
    -- fotos_feedback, pago_estado (→ pago_subido), comprobante_pago_url,
    -- calificacion, calificacion_comentario, notas_cambios (revision)

    RETURN NEW;
END;
$$;

-- ── 2. Crear el trigger en la tabla pedidos ─
DROP TRIGGER IF EXISTS trg_restrict_client_pedido_updates ON pedidos;
CREATE TRIGGER trg_restrict_client_pedido_updates
    BEFORE UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION prodigy_restrict_client_pedido_updates();

-- ── 3. Protección equivalente para pedidos_doctor ─
-- El cliente puede aprobar y solicitar cambios en sus propios diseños
-- pero NO puede cambiar datos de precio ni estado del pedido base
CREATE OR REPLACE FUNCTION prodigy_restrict_client_pedido_doctor_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _email  text;
    _role   text;
    _is_staff boolean;
BEGIN
    _email := (current_setting('request.jwt.claims', true)::jsonb ->> 'email');
    _role  := (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role');

    _is_staff := (
        _email IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        OR _role IN ('admin', 'operator', 'diseno', 'fresado', 'impresion', 'taller', 'calidad', 'contabilidad', 'mensajero', 'encargado_inventario')
    );

    IF _is_staff THEN RETURN NEW; END IF;

    -- Clientes NO pueden cambiar:
    IF NEW.precio IS DISTINCT FROM OLD.precio THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden modificar precio en pedidos_doctor';
    END IF;
    IF NEW.doctor_id IS DISTINCT FROM OLD.doctor_id THEN
        RAISE EXCEPTION 'PRODIGY_SECURITY: Clientes no pueden reasignar doctor_id';
    END IF;

    -- Clientes SÍ pueden cambiar: diseno_aprobado, notas_cambios, revisiones_usadas
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_restrict_client_pedido_doctor_updates ON pedidos_doctor;
CREATE TRIGGER trg_restrict_client_pedido_doctor_updates
    BEFORE UPDATE ON pedidos_doctor
    FOR EACH ROW
    EXECUTE FUNCTION prodigy_restrict_client_pedido_doctor_updates();

-- ── VERIFICACIÓN ─
-- Ejecutar después para confirmar que el trigger está activo:
-- SELECT trigger_name, event_manipulation, action_timing
-- FROM information_schema.triggers
-- WHERE event_object_table IN ('pedidos','pedidos_doctor')
--   AND trigger_schema = 'public';

-- ============================================================
-- RESULTADO:
-- ✅ Clientes pueden: subir fotos feedback, subir comprobante (→ pago_subido),
--    calificar, aprobar diseño, solicitar cambios
-- ❌ Clientes NO pueden: cambiar estado, precio, confirmar pago,
--    reasignar propietario, modificar stl_ruta/stl_liberado
-- ✅ Staff (admin, operator, diseno, etc.) conserva acceso total
-- ============================================================
