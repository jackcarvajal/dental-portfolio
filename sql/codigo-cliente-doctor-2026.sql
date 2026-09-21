-- ================================================================
-- FASE 1 — Código de cliente para cada doctor (CRM).
-- Al registrarse un Dr (por cualquier vía) se le asigna 'DR-0001', 'DR-0002'…
-- La secretaria lo usa para manejar/identificar clientes.
-- Tabla compartida (sin columna negocio) → código global sirve a ambos.
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

ALTER TABLE public.doctores_perfil ADD COLUMN IF NOT EXISTS codigo_cliente TEXT;

CREATE SEQUENCE IF NOT EXISTS public.seq_codigo_cliente START WITH 1;

-- Asigna el código en cada INSERT nuevo si viene vacío
CREATE OR REPLACE FUNCTION public.set_codigo_cliente()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.codigo_cliente IS NULL THEN
    NEW.codigo_cliente := 'DR-' || lpad(nextval('public.seq_codigo_cliente')::text, 4, '0');
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_codigo_cliente ON public.doctores_perfil;
CREATE TRIGGER trg_codigo_cliente
  BEFORE INSERT ON public.doctores_perfil
  FOR EACH ROW EXECUTE FUNCTION public.set_codigo_cliente();

-- Backfill: doctores ya existentes sin código (ordenados por antigüedad)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.doctores_perfil WHERE codigo_cliente IS NULL ORDER BY created_at LOOP
    UPDATE public.doctores_perfil
      SET codigo_cliente = 'DR-' || lpad(nextval('public.seq_codigo_cliente')::text, 4, '0')
    WHERE id = r.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_doctores_codigo ON public.doctores_perfil (codigo_cliente);

-- Asegurar que el staff (admin/operator/contabilidad/secretaria) pueda LEER la lista de doctores
DROP POLICY IF EXISTS "staff_lee_doctores" ON public.doctores_perfil;
CREATE POLICY "staff_lee_doctores" ON public.doctores_perfil
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','secretaria')
    OR (auth.jwt() ->> 'email') IN (
      'jackalejandroc@gmail.com','labdentalprodigy@gmail.com',
      'gerencia@prodigylabdental.com','casos@prodigylabdental.com'
    )
    OR id = auth.uid()   -- cada doctor sigue viendo su propio perfil
  );

SELECT 'Codigo de cliente (DR-####) asignado a todos los doctores' AS status;
