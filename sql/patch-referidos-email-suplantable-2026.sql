-- ============================================================
-- PRODIGY — obtener_mi_codigo_referido() confiaba en p_email del cliente
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-05): obtener_mi_codigo_referido(p_email,
-- p_nombre) es SECURITY DEFINER y usa el p_email tal cual lo envía el
-- cliente, sin validar que coincida con la sesión real. Cualquier
-- usuario autenticado (o incluso anon, la función está otorgada a
-- ambos) podía:
--   - Consultar si OTRO doctor (por email conocido/adivinado) ya tiene
--     código de referido, y obtenerlo (enumeración).
--   - Crear una fila de referido a nombre de un email ajeno con un
--     "referidor_nombre" arbitrario (contaminación de datos).
-- Los 4 llamadores reales del frontend (client-panel.html, referidos.html,
-- app/onboarding.html, recibo-caso.html) siempre pasan el email de la
-- sesión autenticada (user.email) — nunca un email ajeno — así que
-- exigir que coincida con auth.jwt() no rompe ningún flujo legítimo.
-- No hay impacto financiero directo (el cupón/recompensa ya está
-- protegido por patch-fraude-cupones-referidos-2026.sql), pero cierra
-- la enumeración y contaminación de datos.
-- ============================================================

CREATE OR REPLACE FUNCTION public.obtener_mi_codigo_referido(p_email text, p_nombre text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_codigo text;
  v_email_real text;
BEGIN
  -- El email SIEMPRE viene de la sesión real (auth.jwt()), nunca del
  -- parámetro del cliente. Sin sesión real (anon puro), se rechaza.
  v_email_real := lower(trim(auth.jwt() ->> 'email'));
  IF v_email_real IS NULL OR v_email_real = '' THEN
    RETURN NULL;
  END IF;

  SELECT codigo INTO v_codigo FROM public.referidos
  WHERE lower(trim(referidor_email)) = v_email_real LIMIT 1;
  IF v_codigo IS NULL THEN
    v_codigo := public.generar_codigo_referido(v_email_real);
    INSERT INTO public.referidos(referidor_email, referidor_nombre, codigo)
    VALUES(v_email_real, p_nombre, v_codigo);
  END IF;
  RETURN v_codigo;
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Logueado como doctor A, llamar:
--   SELECT obtener_mi_codigo_referido('doctorB@ejemplo.com', 'Suplantación');
-- debe devolver/crear el código para el email de la SESIÓN (doctor A),
-- ignorando el p_email enviado — nunca el de doctor B.
-- ============================================================

SELECT 'patch-referidos-email-suplantable-2026 aplicado' AS status;
