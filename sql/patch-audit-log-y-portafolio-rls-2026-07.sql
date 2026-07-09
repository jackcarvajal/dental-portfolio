-- ============================================================
-- PRODIGY — Fix: logs_incidencias CHECK demasiado estricto (audit
-- trail roto en silencio) + casos_portafolio RLS demasiado permisiva
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Contexto (auditoría panel interno 2026-07-09):
-- 1) logs_incidencias.tipo tiene un CHECK con solo 7 valores fijos
--    ('ERROR_STL','FALLA_MAQUINA','STOCK_CRITICO','DIRECCION_INCORRECTA',
--    'CLIENTE_AUSENTE','RETRASO_VALIDACION','OTRO'), pero el código real
--    (panel-interno-operaciones.html, operario.html, operator-panel.html,
--    inventario.html, calidad.html, gestionar-casos.html, contabilidad.html,
--    y ~10 Cloudflare Functions) inserta con más de 20 valores distintos
--    de 'tipo' y con 'severidad' IN ('INFO','WARN','ADVERTENCIA') que
--    tampoco están en el CHECK de severidad ('BAJA','MEDIA','ALTA','CRITICA').
--    Cada INSERT que no matchea el CHECK falla, y como todos los
--    llamadores usan try/catch silencioso, el fallo nunca se ve.
--    Resultado: el audit log de acciones admin (_auditLog en el panel)
--    NUNCA ha dejado rastro real, y la mayoría de logs operativos
--    tampoco (excepto STOCK_CRITICO/ALTA, que sí matchean por casualidad).
-- 2) casos_portafolio permite INSERT/UPDATE/DELETE a CUALQUIER usuario
--    autenticado (auth.role()='authenticated'), no solo staff — un
--    doctor/cliente con cuenta podría borrar o editar casos del
--    portafolio público llamando la API directamente.
-- ============================================================

-- ── 1. logs_incidencias: quitar los CHECK demasiado estrictos ──
-- Se deja como TEXT libre (ya funciona como taxonomía de eventos
-- extensible, no un enum cerrado — seguir agregando valores nuevos
-- vía CHECK solo va a repetir este mismo bug).
ALTER TABLE logs_incidencias DROP CONSTRAINT IF EXISTS logs_incidencias_tipo_check;
ALTER TABLE logs_incidencias DROP CONSTRAINT IF EXISTS logs_incidencias_severidad_check;

-- Válido igual mantener NOT NULL (ya existe) para evitar filas vacías.

-- ── 2. casos_portafolio: restringir escritura a staff/admin ──
DROP POLICY IF EXISTS "portafolio_auth_insert" ON casos_portafolio;
DROP POLICY IF EXISTS "portafolio_auth_update" ON casos_portafolio;
DROP POLICY IF EXISTS "portafolio_auth_delete" ON casos_portafolio;

CREATE POLICY "portafolio_staff_insert" ON casos_portafolio
    FOR INSERT TO authenticated
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
        OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
    );

CREATE POLICY "portafolio_staff_update" ON casos_portafolio
    FOR UPDATE TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
        OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
    );

CREATE POLICY "portafolio_staff_delete" ON casos_portafolio
    FOR DELETE TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
        OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
    );

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT conname FROM pg_constraint WHERE conrelid = 'logs_incidencias'::regclass;
--   → no debe aparecer logs_incidencias_tipo_check ni logs_incidencias_severidad_check
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'casos_portafolio';
--   → insert/update/delete deben ser "portafolio_staff_*", no "portafolio_auth_*"
