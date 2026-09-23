-- ================================================================
-- PRODIGY — Alineadores: portal de facturación del CLIENTE
-- El cliente ve su estado de cuenta en tiempo real, reporta pagos y sube comprobantes.
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- Requiere: sql/alineadores-casos-2026.sql + sql/alineadores-mayra-panel-2026.sql corridos.
-- ================================================================

-- ── 1) Vincular casos a la cuenta del cliente ──
ALTER TABLE public.alineadores_casos ADD COLUMN IF NOT EXISTS cliente_user_id uuid;
CREATE INDEX IF NOT EXISTS idx_aln_casos_cliuser ON public.alineadores_casos(cliente_user_id);

-- ── 2) Pagos reportados por el cliente (comprobantes) ──
CREATE TABLE IF NOT EXISTS public.alineadores_pagos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio         text NOT NULL DEFAULT 'prodigy',
  cliente_user_id uuid,
  mes_corte       text,
  monto           numeric(12,2) NOT NULL DEFAULT 0,
  moneda          text NOT NULL DEFAULT 'USD',
  metodo          text,                                  -- PayPal | Global66 | transferencia
  referencia      text,
  comprobante_url text,                                  -- ruta en bucket 'alineadores-comprobantes'
  estado          text NOT NULL DEFAULT 'reportado',     -- reportado | verificado | rechazado
  nota            text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_aln_pagos_user ON public.alineadores_pagos(cliente_user_id, estado);
ALTER TABLE public.alineadores_pagos ENABLE ROW LEVEL SECURITY;

-- ── 3) RLS ──
-- Cliente lee SUS casos
DROP POLICY IF EXISTS "cliente_lee_sus_casos" ON public.alineadores_casos;
CREATE POLICY "cliente_lee_sus_casos" ON public.alineadores_casos
  FOR SELECT TO authenticated USING (cliente_user_id = auth.uid());

-- Cliente lee SUS cargos (solo parte='cliente' de sus casos — nunca lo de Mayra)
DROP POLICY IF EXISTS "cliente_lee_sus_cargos" ON public.alineadores_cargos;
CREATE POLICY "cliente_lee_sus_cargos" ON public.alineadores_cargos
  FOR SELECT TO authenticated
  USING (
    parte = 'cliente'
    AND EXISTS (SELECT 1 FROM public.alineadores_casos c
                WHERE c.id = alineadores_cargos.caso_id AND c.cliente_user_id = auth.uid())
  );

-- Cliente lee e inserta SUS pagos; finanzas ve/gestiona todo
DROP POLICY IF EXISTS "cliente_sus_pagos" ON public.alineadores_pagos;
CREATE POLICY "cliente_sus_pagos" ON public.alineadores_pagos
  FOR SELECT TO authenticated USING (cliente_user_id = auth.uid());
DROP POLICY IF EXISTS "cliente_inserta_pago" ON public.alineadores_pagos;
CREATE POLICY "cliente_inserta_pago" ON public.alineadores_pagos
  FOR INSERT TO authenticated WITH CHECK (cliente_user_id = auth.uid() AND estado = 'reportado');
DROP POLICY IF EXISTS "fin_all_aln_pagos" ON public.alineadores_pagos;
CREATE POLICY "fin_all_aln_pagos" ON public.alineadores_pagos
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

-- ── 4) RPC admin: vincular TODOS los casos de un cliente (por nombre) a una cuenta ──
-- Úsalo una vez tras crear la cuenta del cliente: SELECT aln_vincular_cliente('Panorámica Digital 3D','<uuid-del-user>');
CREATE OR REPLACE FUNCTION public.aln_vincular_cliente(p_nombre text, p_user_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _n int;
BEGIN
  IF (auth.jwt() -> 'app_metadata' ->> 'role') NOT IN ('admin','operator','contabilidad')
     AND (auth.jwt() ->> 'email') NOT IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  THEN RETURN json_build_object('ok',false,'error','No autorizado'); END IF;
  UPDATE public.alineadores_casos SET cliente_user_id = p_user_id
    WHERE negocio='prodigy' AND cliente ILIKE p_nombre;
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN json_build_object('ok',true,'vinculados',_n);
END;$$;
REVOKE ALL ON FUNCTION public.aln_vincular_cliente(text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.aln_vincular_cliente(text,uuid) TO authenticated;

-- ── 5) Bucket de comprobantes (crear en Dashboard → Storage → New bucket) ──
--   Nombre: alineadores-comprobantes  · Público: NO
--   Política INSERT para authenticated (subir su comprobante) y SELECT para staff.
--   (Si prefieres, se maneja como scanner-uploads: ruta privada, staff firma la URL.)

SELECT 'Portal cliente alineadores: casos.cliente_user_id + alineadores_pagos + RLS + aln_vincular_cliente listos' AS status;
