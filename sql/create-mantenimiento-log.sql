-- ═══════════════════════════════════════════════════════════════
-- Tabla mantenimiento_log — el código (app/taller, app/operator-panel)
-- registra EVENTOS de mantenimiento/uso (accion, tecnico, duracion),
-- pero los insertaba en `equipo_mantenimiento` que es un REGISTRO de
-- equipos (nombre, estado, horas_uso) → 400, logging roto.
-- Esta tabla separa el log; el registro `equipo_mantenimiento` queda intacto.
-- Pegar en Supabase SQL Editor → Run. Luego el código ya apunta aquí.
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.mantenimiento_log (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    equipo_id    uuid,
    tecnico      text,
    accion       text NOT NULL,
    notas        text,
    foto_url     text,
    duracion_min int DEFAULT 0,
    created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mantenimiento_log_equipo ON public.mantenimiento_log (equipo_id, created_at DESC);

ALTER TABLE public.mantenimiento_log ENABLE ROW LEVEL SECURITY;

-- Staff logueado puede registrar y leer (interno)
DROP POLICY IF EXISTS "mantenimiento_log_staff" ON public.mantenimiento_log;
CREATE POLICY "mantenimiento_log_staff" ON public.mantenimiento_log
    FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

GRANT SELECT, INSERT ON public.mantenimiento_log TO authenticated;

-- Verificar: SELECT * FROM mantenimiento_log LIMIT 1;
