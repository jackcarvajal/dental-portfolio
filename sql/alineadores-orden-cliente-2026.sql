-- ================================================================
-- PRODIGY — Alineadores: orden de trabajo del CLIENTE
-- El cliente (logueado) sube el caso llenando la orden → se crea el
-- caso en estado 'valoracion' ligado a su cuenta → le llega a Mayra.
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- Requiere: alineadores-casos + portal-cliente + autovincular corridos.
-- ================================================================

-- Campos de la orden de trabajo (los llena el cliente)
ALTER TABLE public.alineadores_casos
  ADD COLUMN IF NOT EXISTS motivo_consulta      text,
  ADD COLUMN IF NOT EXISTS indicacion_cliente   text,
  ADD COLUMN IF NOT EXISTS requiere_ipr         boolean,
  ADD COLUMN IF NOT EXISTS requiere_attachments boolean,
  ADD COLUMN IF NOT EXISTS arcada               text,          -- superior | inferior | ambas
  ADD COLUMN IF NOT EXISTS archivos             text[] DEFAULT '{}';  -- rutas en bucket scanner-uploads

-- El cliente puede CREAR su propio caso (ligado a su cuenta, en valoración)
DROP POLICY IF EXISTS "cliente_crea_su_caso" ON public.alineadores_casos;
CREATE POLICY "cliente_crea_su_caso" ON public.alineadores_casos
  FOR INSERT TO authenticated
  WITH CHECK (cliente_user_id = auth.uid() AND estado = 'valoracion');

SELECT 'Orden de trabajo del cliente lista: campos + permiso de creación' AS status;
