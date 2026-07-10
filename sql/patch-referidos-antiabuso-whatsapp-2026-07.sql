-- ============================================================
-- PRODIGY — Anti-abuso de referidos: comparar también WhatsApp, no solo email
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Contexto (auditoría dinero/lógica de negocio 2026-07-09): el trigger
-- prodigy_detectar_primer_pedido_referido() solo bloquea el auto-referido
-- si el email del pedido "referido" es IDÉNTICO al email del referidor.
-- Un doctor podía registrar una segunda cuenta con otro email (mismo
-- WhatsApp/clínica), pedir un caso mínimo pagado con su propio código,
-- y cobrar su propio cupón de $30.000 repetidamente con emails
-- desechables. Este patch agrega una segunda verificación: si el
-- WhatsApp del pedido referido coincide con el WhatsApp registrado del
-- doctor referidor (vía doctores_perfil), también se bloquea.
-- No reemplaza la validación de email existente, la complementa.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_detectar_primer_pedido_referido()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email       text;
  v_telefono    text;
  v_codigo      text;
  v_cupon       text;
  v_ref_id      uuid;
  v_referidor_email text;
  v_referidor_wa    text;
BEGIN
  IF NEW.pago_estado = 'pago_confirmado' AND
     (OLD.pago_estado IS DISTINCT FROM 'pago_confirmado') AND
     NEW.codigo_referido IS NOT NULL THEN

    v_codigo   := NEW.codigo_referido;
    v_email    := lower(trim(COALESCE(NEW.email, NEW.nombre_doctor, '')));
    v_telefono := regexp_replace(COALESCE(NEW.telefono, ''), '\D', '', 'g');

    SELECT id, lower(trim(referidor_email)) INTO v_ref_id, v_referidor_email
    FROM public.referidos
    WHERE codigo = v_codigo AND estado IN ('pendiente','registrado')
    LIMIT 1;

    -- WhatsApp real del referidor (vía su cuenta de auth, no un campo
    -- auto-reportado en el pedido nuevo) — para comparar contra el
    -- teléfono del pedido "referido" sin depender solo del email.
    IF v_ref_id IS NOT NULL THEN
      SELECT regexp_replace(COALESCE(dp.whatsapp, ''), '\D', '', 'g') INTO v_referidor_wa
      FROM auth.users u
      JOIN public.doctores_perfil dp ON dp.id = u.id
      WHERE lower(trim(u.email)) = v_referidor_email
      LIMIT 1;
    END IF;

    -- Auto-referido: mismo email, O mismo WhatsApp real del referidor —
    -- bloquear, no generar cupón ni recompensa.
    IF v_ref_id IS NOT NULL
       AND ((v_referidor_email = v_email AND v_email <> '')
            OR (v_referidor_wa IS NOT NULL AND v_referidor_wa <> '' AND v_referidor_wa = v_telefono)) THEN
      INSERT INTO public.logs_incidencias(tipo, severidad, descripcion, resuelta)
      VALUES (
        'REFERIDO_AUTO_BLOQUEADO', 'WARN',
        '[REFERIDOS] Intento de auto-referido bloqueado — código: ' || v_codigo ||
        ' | email: ' || v_email || ' | telefono: ' || v_telefono ||
        ' | pedido: ' || COALESCE(NEW.codigo, NEW.id::text),
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
-- SELECT prosrc FROM pg_proc WHERE proname = 'prodigy_detectar_primer_pedido_referido';
--   → debe contener "v_referidor_wa"
