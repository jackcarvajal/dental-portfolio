-- TABLA: Sistema de referidos de doctores
-- Ejecutar en Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.referidos (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    timestamptz DEFAULT now() NOT NULL,

  -- Quien refiere
  referidor_email  text NOT NULL,
  referidor_nombre text,
  codigo           text NOT NULL UNIQUE, -- código corto ej. PRODR-ABC123

  -- Quien fue referido
  referido_email   text,
  referido_nombre  text,
  referido_at      timestamptz,

  -- Estado y recompensa
  estado           text DEFAULT 'pendiente' CHECK (estado IN ('pendiente','registrado','primer_pedido','recompensado')),
  descuento_pct    numeric(5,2) DEFAULT 10, -- descuento % para el referido
  recompensa_cop   numeric(12,2) DEFAULT 0, -- recompensa para el referidor
  notas            text
);

CREATE INDEX IF NOT EXISTS idx_ref_referidor ON public.referidos(referidor_email);
CREATE INDEX IF NOT EXISTS idx_ref_codigo     ON public.referidos(codigo);

ALTER TABLE public.referidos ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede crear un referido con su código
CREATE POLICY "ref_anon_insert" ON public.referidos
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Doctor autenticado ve sus propios referidos
CREATE POLICY "ref_auth_select" ON public.referidos
  FOR SELECT TO authenticated
  USING (referidor_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Staff ve todos
CREATE POLICY "ref_staff_all" ON public.referidos
  FOR ALL TO authenticated
  USING ((auth.jwt()->'app_metadata'->>'role') IN ('admin','staff'));

GRANT ALL ON TABLE public.referidos TO anon, authenticated;

-- Función para generar código único
CREATE OR REPLACE FUNCTION public.generar_codigo_referido(p_email text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_codigo text;
  v_existe boolean;
BEGIN
  LOOP
    v_codigo := 'PRODY-' || upper(substring(md5(p_email || random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.referidos WHERE codigo = v_codigo) INTO v_existe;
    EXIT WHEN NOT v_existe;
  END LOOP;
  RETURN v_codigo;
END;
$$;
GRANT EXECUTE ON FUNCTION public.generar_codigo_referido(text) TO authenticated, anon;

-- RPC: obtener o crear código de referido para un doctor
CREATE OR REPLACE FUNCTION public.obtener_mi_codigo_referido(p_email text, p_nombre text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_codigo text;
BEGIN
  SELECT codigo INTO v_codigo FROM public.referidos
  WHERE referidor_email = p_email LIMIT 1;
  IF v_codigo IS NULL THEN
    v_codigo := public.generar_codigo_referido(p_email);
    INSERT INTO public.referidos(referidor_email, referidor_nombre, codigo)
    VALUES(p_email, p_nombre, v_codigo);
  END IF;
  RETURN v_codigo;
END;
$$;
GRANT EXECUTE ON FUNCTION public.obtener_mi_codigo_referido(text, text) TO authenticated, anon;
