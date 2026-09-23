-- ================================================================
-- PRODIGY — Alineadores: auto-vincular el cliente al crear el caso
-- Mapa nombre_cliente → cuenta (user_id). Un trigger BEFORE INSERT
-- asigna cliente_user_id automáticamente. Ya no hay que correr
-- aln_vincular_cliente cada vez.
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- Requiere: sql/alineadores-portal-cliente-2026.sql corrido.
-- ================================================================

-- ── Mapa de clientes (nombre exacto que se escribe en el caso → su cuenta) ──
CREATE TABLE IF NOT EXISTS public.alineadores_clientes (
  nombre      text PRIMARY KEY,
  user_id     uuid NOT NULL,
  negocio     text NOT NULL DEFAULT 'prodigy',
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.alineadores_clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_lee_aln_clientes" ON public.alineadores_clientes;
CREATE POLICY "staff_lee_aln_clientes" ON public.alineadores_clientes
  FOR SELECT TO authenticated USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','diseno','secretaria')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );
DROP POLICY IF EXISTS "admin_all_aln_clientes" ON public.alineadores_clientes;
CREATE POLICY "admin_all_aln_clientes" ON public.alineadores_clientes
  FOR ALL TO authenticated USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  ) WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

-- ── Cliente del piloto ──
INSERT INTO public.alineadores_clientes(nombre,user_id)
VALUES ('Panorámica Digital 3D','780955da-982c-4645-95e9-e33a6a90492f')
ON CONFLICT (nombre) DO UPDATE SET user_id = EXCLUDED.user_id;

-- ── Trigger BEFORE INSERT: asigna cliente_user_id por nombre (insensible a mayúsculas) ──
CREATE OR REPLACE FUNCTION public.aln_casos_set_cliente()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.cliente_user_id IS NULL AND NEW.cliente IS NOT NULL THEN
    SELECT user_id INTO NEW.cliente_user_id
      FROM public.alineadores_clientes
      WHERE lower(nombre) = lower(trim(NEW.cliente)) LIMIT 1;
  END IF;
  RETURN NEW;
END;$$;
DROP TRIGGER IF EXISTS trg_aln_casos_set_cliente ON public.alineadores_casos;
CREATE TRIGGER trg_aln_casos_set_cliente BEFORE INSERT ON public.alineadores_casos
  FOR EACH ROW EXECUTE FUNCTION public.aln_casos_set_cliente();

-- ── Backfill: ligar los casos que ya existen ──
UPDATE public.alineadores_casos c
SET cliente_user_id = m.user_id
FROM public.alineadores_clientes m
WHERE c.cliente_user_id IS NULL AND lower(trim(c.cliente)) = lower(m.nombre);

-- ── aln_vincular_cliente ahora también guarda el mapa (para próximos casos) ──
CREATE OR REPLACE FUNCTION public.aln_vincular_cliente(p_nombre text, p_user_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _n int;
BEGIN
  IF (auth.jwt() -> 'app_metadata' ->> 'role') NOT IN ('admin','operator','contabilidad')
     AND (auth.jwt() ->> 'email') NOT IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  THEN RETURN json_build_object('ok',false,'error','No autorizado'); END IF;
  INSERT INTO public.alineadores_clientes(nombre,user_id) VALUES (p_nombre,p_user_id)
    ON CONFLICT (nombre) DO UPDATE SET user_id = EXCLUDED.user_id;
  UPDATE public.alineadores_casos SET cliente_user_id = p_user_id
    WHERE negocio='prodigy' AND lower(trim(cliente)) = lower(trim(p_nombre));
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN json_build_object('ok',true,'vinculados',_n);
END;$$;
REVOKE ALL ON FUNCTION public.aln_vincular_cliente(text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.aln_vincular_cliente(text,uuid) TO authenticated;

SELECT 'Auto-vinculación de cliente lista: al crear un caso con cliente conocido se asigna solo' AS status;
