-- ============================================================
-- PRODIGY — CRÍTICO: prodigy_detectar_primer_pedido_referido() usa NEW.doctor (no existe)
-- Ejecutar en: Supabase Dashboard → SQL Editor — MÁXIMA PRIORIDAD
--
-- Hallazgo (auditoría 2026-07-05): el trigger que detecta el primer
-- pedido de un referido (se dispara en CADA UPDATE de pago_estado a
-- 'pago_confirmado' Y en cada INSERT con codigo_referido) referencia
-- NEW.doctor, columna que no existe (real: nombre_doctor). Esto
-- significa que CONFIRMAR EL PAGO de cualquier pedido que tenga un
-- codigo_referido asociado falla con "record new has no field doctor"
-- — la actualización completa de pago_estado se revierte, bloqueando
-- la confirmación de pago para casos con referido.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_detectar_primer_pedido_referido()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email       text;
  v_codigo      text;
  v_cupon       text;
  v_ref_id      uuid;
  v_referidor_email text;
BEGIN
  IF NEW.pago_estado = 'pago_confirmado' AND
     (OLD.pago_estado IS DISTINCT FROM 'pago_confirmado') AND
     NEW.codigo_referido IS NOT NULL THEN

    v_codigo := NEW.codigo_referido;
    v_email  := lower(trim(COALESCE(NEW.email, NEW.nombre_doctor, '')));

    SELECT id, lower(trim(referidor_email)) INTO v_ref_id, v_referidor_email
    FROM public.referidos
    WHERE codigo = v_codigo AND estado IN ('pendiente','registrado')
    LIMIT 1;

    -- Auto-referido: el email del pedido referido es el mismo que el
    -- del referidor original — bloquear, no generar cupón ni recompensa.
    IF v_ref_id IS NOT NULL AND v_referidor_email = v_email AND v_email <> '' THEN
      INSERT INTO public.logs_incidencias(tipo, severidad, descripcion, resuelta)
      VALUES (
        'REFERIDO_AUTO_BLOQUEADO', 'WARN',
        '[REFERIDOS] Intento de auto-referido bloqueado — código: ' || v_codigo ||
        ' | email: ' || v_email || ' | pedido: ' || COALESCE(NEW.codigo, NEW.id::text),
        true
      );
      RETURN NEW;
    END IF;

    IF v_ref_id IS NOT NULL THEN
      v_cupon := public._generar_cupon_credito();

      UPDATE public.referidos SET
        estado         = 'primer_pedido',
        referido_email = COALESCE(referido_email, v_email),
        referido_at    = COALESCE(referido_at, NOW()),
        cupon_credito  = v_cupon,
        cupon_at       = NOW()
      WHERE id = v_ref_id;

      INSERT INTO public.logs_incidencias(tipo, severidad, descripcion, resuelta)
      VALUES (
        'REFERIDO_PRIMER_PEDIDO', 'INFO',
        '[REFERIDOS] Primer pedido confirmado — código: ' || v_codigo ||
        ' | cupón generado: ' || v_cupon ||
        ' | pedido: ' || COALESCE(NEW.codigo, NEW.id::text),
        true
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- UPDATE pedidos SET pago_estado='pago_confirmado' WHERE codigo_referido IS NOT NULL ...
-- ya no debe fallar con "record new has no field doctor".
-- ============================================================

SELECT 'patch-referidos-trigger-columna-fantasma-2026 aplicado' AS status;
