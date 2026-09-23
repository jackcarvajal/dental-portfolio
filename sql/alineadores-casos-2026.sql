-- ================================================================
-- PRODIGY — Alineadores: casos + cargos (DOS cuentas: cobro cliente / pago Mayra)
-- Guarda el control de casos (tipo hoja de Excel) para cuadrar cuentas.
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- Ver docs/PROTOCOLO-ALINEADORES.md
-- ================================================================

-- ── 1. CASOS (parte clínica — visible a staff incl. Mayra, SIN dinero) ──
CREATE TABLE IF NOT EXISTS public.alineadores_casos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio               TEXT NOT NULL DEFAULT 'prodigy',
  codigo                TEXT,                    -- ALN-... si vino de la web (opcional)
  solicitud_id          UUID,                    -- link a solicitudes_scanner (opcional)
  pedido_id             UUID,                    -- link a pedidos (opcional)
  paciente              TEXT NOT NULL,
  cliente               TEXT,                    -- clínica/ortodoncista que envía (ej. Panorámica Digital 3D)
  tecnico               TEXT DEFAULT 'Mayra',
  viabilidad            TEXT,                    -- rango, ej. "8 a 11 inf"
  plan_tratamiento      TEXT,                    -- ej. "5 Superiores-8 Inferiores"
  modelos               BOOLEAN NOT NULL DEFAULT false,
  fecha_valoracion      DATE,                    -- validez 3-4 meses
  fecha_recepcion       DATE,
  fecha_envio           DATE,
  duracion_tratamiento  TEXT,                    -- ej. "6 meses / jul-ago 2026"
  fecha_fin_tratamiento DATE,                    -- para ventana de refinamiento (6 meses)
  estado                TEXT NOT NULL DEFAULT 'valoracion', -- valoracion | planificacion | en_tratamiento | terminado
  notas                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_aln_casos_cliente ON public.alineadores_casos (negocio, cliente);
CREATE INDEX IF NOT EXISTS idx_aln_casos_estado  ON public.alineadores_casos (estado);

ALTER TABLE public.alineadores_casos ENABLE ROW LEVEL SECURITY;

-- STAFF (incl. diseno = Mayra) lee/escribe la parte clínica
DROP POLICY IF EXISTS "staff_all_aln_casos" ON public.alineadores_casos;
CREATE POLICY "staff_all_aln_casos" ON public.alineadores_casos
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','diseno','secretaria')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad','diseno','secretaria')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

-- ── 2. CARGOS (dinero — SOLO admin/operator/contabilidad; Mayra NO ve) ──
CREATE TABLE IF NOT EXISTS public.alineadores_cargos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id           UUID REFERENCES public.alineadores_casos(id) ON DELETE CASCADE,
  negocio           TEXT NOT NULL DEFAULT 'prodigy',
  parte             TEXT NOT NULL DEFAULT 'cliente',  -- 'cliente' (lo que COBRO, USD) | 'mayra' (lo que PAGO, COP)
  tipo              TEXT NOT NULL DEFAULT 'completo',
    -- valoracion | completo | replaneacion_en_tiempo | replaneacion_fuera_tiempo | refinamiento_sin_costo | refinamiento_con_costo | adicional
  descripcion       TEXT,
  monto             NUMERIC(12,2) NOT NULL DEFAULT 0,
  moneda            TEXT NOT NULL DEFAULT 'USD',       -- cobro cliente = 'USD' ($90/$30) · pago Mayra = 'COP' ($60.000/$20.000)
  fecha             DATE NOT NULL DEFAULT CURRENT_DATE,
  mes_corte         TEXT,                              -- ej. "2026-07" (para el cierre mensual)
  estado_pago       TEXT NOT NULL DEFAULT 'pendiente', -- pendiente | facturado | pagado
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_aln_cargos_caso  ON public.alineadores_cargos (caso_id);
CREATE INDEX IF NOT EXISTS idx_aln_cargos_corte ON public.alineadores_cargos (parte, mes_corte, estado_pago);

ALTER TABLE public.alineadores_cargos ENABLE ROW LEVEL SECURITY;

-- SOLO finanzas ven/mueven dinero (NO diseno/Mayra)
DROP POLICY IF EXISTS "fin_all_aln_cargos" ON public.alineadores_cargos;
CREATE POLICY "fin_all_aln_cargos" ON public.alineadores_cargos
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','contabilidad')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

SELECT 'alineadores_casos + alineadores_cargos listas (cobro cliente / pago Mayra separados)' AS status;
