-- ============================================================
-- PRODIGY — Cerrar fraude en sistema de referidos/cupones
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-03):
-- La política "ref_anon_insert" (sql/referidos-table.sql) permite
-- INSERT con WITH CHECK(true) — cualquier usuario anónimo puede
-- insertar una fila en `referidos` fijando DIRECTAMENTE columnas que
-- deberían ser exclusivas del trigger de pago confirmado:
--   cupon_credito, cupon_usado, estado, recompensa_cop
--
-- Ejemplo de explotación (antes de este patch):
--   POST /rest/v1/referidos
--   { "referidor_email":"atacante@x.com", "codigo":"FAKE1",
--     "cupon_credito":"CRED-FALSO1", "cupon_usado":false,
--     "estado":"primer_pedido", "recompensa_cop":999999999 }
--   → luego RPC prodigy_usar_cupon_credito('CRED-FALSO1') devuelve
--     ok:true con un monto de crédito completamente inventado.
--
-- Además: no había verificación de auto-referido (un doctor podía
-- usar su propio código para "referirse a sí mismo" y generar cupón).
-- ============================================================

-- ── 1. Restringir el INSERT a solo los valores "seguros" de fábrica ──
-- Un cliente solo puede crear una fila NUEVA sin cupón, sin usar, en
-- estado inicial. cupon_credito/cupon_usado/recompensa/descuento SOLO
-- los toca el trigger (SECURITY DEFINER, corre con permisos de owner,
-- no pasa por esta policy).
DROP POLICY IF EXISTS "ref_anon_insert" ON public.referidos;
CREATE POLICY "ref_anon_insert" ON public.referidos
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    cupon_credito IS NULL
    AND cupon_usado = false
    AND cupon_at IS NULL
    AND estado IN ('pendiente', 'registrado')
    AND recompensa_cop = 30000
    AND descuento_pct = 5
    AND referido_email IS NULL   -- se completa solo vía trigger al confirmar pago
  );

-- ── 2. Prevenir que un cliente modifique su propia fila directamente ──
-- No existía ninguna policy UPDATE para authenticated no-staff, lo cual
-- ya bloqueaba UPDATE por RLS (implícito) — se agrega explícita y
-- restrictiva por claridad, en caso de que alguna GRANT futura la abra.
DROP POLICY IF EXISTS "ref_client_no_update" ON public.referidos;
CREATE POLICY "ref_client_no_update" ON public.referidos
  FOR UPDATE TO authenticated
  USING (false);

-- ── 3. Prevenir auto-referido en el trigger de primer pedido ──
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
    v_email  := lower(trim(COALESCE(NEW.email, NEW.doctor, '')));

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
-- Intentar (debe FALLAR con violación de policy):
-- INSERT INTO referidos (referidor_email, codigo, estado, cupon_credito, recompensa_cop)
-- VALUES ('test@test.com', 'TEST123', 'primer_pedido', 'CRED-FAKE', 999999999);
--
-- Confirmar que un INSERT "legítimo" sigue funcionando:
-- INSERT INTO referidos (referidor_email, codigo) VALUES ('doctor@test.com', 'TESTOK1');
-- ============================================================
