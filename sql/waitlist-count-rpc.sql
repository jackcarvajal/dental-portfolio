-- ============================================================
-- RPC: contador público de la lista de espera de laboratorios
-- Tabla COMPARTIDA (waitlist_labs) → correr UNA vez sirve para
-- PRODIGY y Alejandro CAD/CAM. Ejecutar en Supabase → SQL Editor.
-- ------------------------------------------------------------
-- Contexto: por RLS, anon puede INSERT en waitlist_labs pero NO
-- SELECT (privacidad de los datos de los labs). Por eso el
-- contador daba 401. Esta función devuelve SOLO el número total
-- (nunca filas ni datos), corriendo con permisos del owner.
-- ============================================================

CREATE OR REPLACE FUNCTION public.waitlist_labs_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::int FROM public.waitlist_labs;
$$;

-- Permitir que el front (anon) ejecute la función; NO expone la tabla
GRANT EXECUTE ON FUNCTION public.waitlist_labs_count() TO anon, authenticated;

-- Verificación
SELECT public.waitlist_labs_count() AS total_en_lista;
