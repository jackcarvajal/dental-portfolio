-- ================================================================
-- PARCHE MÍNIMO Y SEGURO — Referidos (25/26) + Seguimiento público (26/26)
-- Extraído del MAESTRO. 100% IDEMPOTENTE — se puede correr las veces
-- que quieras sin errores (solo CREATE OR REPLACE + GRANT + trigger guardado).
--
-- Úsalo si el MAESTRO ya está aplicado y solo quieres asegurar estos 2 fixes.
-- Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- ── PATCH 25/26: trigger de referidos usaba NEW.doctor (columna inexistente) ──
-- Antes: confirmar el pago de CUALQUIER pedido con codigo_referido fallaba
-- ("record new has no field doctor") y revertía el pago. Ahora usa nombre_doctor.
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

    -- Anti-fraude: bloquear auto-referido
    IF v_ref_id IS NOT NULL AND v_referidor_email = v_email AND v_email <> '' THEN
      INSERT INTO public.logs_incidencias(tipo, severidad, descripcion, resuelta)
      VALUES ('REFERIDO_AUTO_BLOQUEADO', 'WARN',
        '[REFERIDOS] Intento de auto-referido bloqueado — código: ' || v_codigo ||
        ' | email: ' || v_email || ' | pedido: ' || COALESCE(NEW.codigo, NEW.id::text), true);
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
      VALUES ('REFERIDO_PRIMER_PEDIDO', 'INFO',
        '[REFERIDOS] Primer pedido confirmado — código: ' || v_codigo ||
        ' | cupón generado: ' || v_cupon ||
        ' | pedido: ' || COALESCE(NEW.codigo, NEW.id::text), true);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Asegurar que EXISTA un trigger que dispare esta función (sin duplicar).
-- Solo lo crea si NINGÚN trigger usa ya esta función.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_proc p ON t.tgfoid = p.oid
    WHERE p.proname = 'prodigy_detectar_primer_pedido_referido'
      AND NOT t.tgisinternal
  ) THEN
    CREATE TRIGGER trg_detectar_primer_pedido_referido
      AFTER INSERT OR UPDATE ON public.pedidos
      FOR EACH ROW EXECUTE FUNCTION public.prodigy_detectar_primer_pedido_referido();
  END IF;
END $$;

SELECT 'Patch 25/26 (referidos) aplicado' AS status;


-- ── PATCH 26/26: buscar_pedido_publico() usaba columnas inexistentes ──
-- La página pública seguimiento-caso.html nunca pudo mostrar un pedido
-- (fallaba con "column does not exist"). Ahora usa las columnas reales.
CREATE OR REPLACE FUNCTION public.buscar_pedido_publico(
    p_codigo TEXT,
    p_nonce  TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    result JSON;
    v_nonce TEXT;
BEGIN
    SELECT hash_seguridad INTO v_nonce
    FROM pedidos
    WHERE upper(trim(codigo)) = upper(trim(p_codigo))
    LIMIT 1;

    IF v_nonce IS NOT NULL AND p_nonce IS NULL THEN
        RETURN NULL;
    END IF;
    IF v_nonce IS NOT NULL AND p_nonce IS NOT NULL AND v_nonce <> p_nonce THEN
        RETURN NULL;
    END IF;

    SELECT json_build_object(
        'codigo',        p.codigo,
        'servicio',      p.tipo_trabajo,
        'material',      p.material,
        'submaterial',   p.submaterial,
        'color_vita',    p.color_vita,
        'cantidad',      p.cantidad,
        'estado',        p.estado::text,
        'fecha_entrega', p.fecha_entrega,
        'flujo',         p.flujo,
        'created_at',    p.created_at
    )
    INTO result
    FROM pedidos p
    WHERE upper(trim(p.codigo)) = upper(trim(p_codigo))
    LIMIT 1;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.buscar_pedido_publico(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.buscar_pedido_publico(TEXT, TEXT) TO authenticated;

SELECT 'Patch 26/26 (seguimiento publico) aplicado' AS status;
