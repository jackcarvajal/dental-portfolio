-- ============================================================
-- PRODIGY — Corregir RLS de catalogo/config_precios/billeteras
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-03): las políticas de escritura de
-- estas 3 tablas (sql/migrate-catalogo-completo.sql) usan:
--
--   auth.jwt() ->> 'role' = 'admin'
--
-- Pero `role` a nivel raíz del JWT de Supabase Auth es el ROL DE
-- POSTGRES (siempre 'authenticated' para cualquier usuario logueado,
-- admin o no) — NUNCA el rol de negocio. El rol de negocio real vive
-- en `app_metadata.role`, como se usa correctamente en todas las
-- demás policies del proyecto.
--
-- Efecto práctico: esta condición NUNCA es verdadera para ningún
-- usuario real → los 3 UPDATE/INSERT/DELETE en catalogo,
-- config_precios y billeteras están bloqueados por RLS para TODOS,
-- incluido el admin real. app/admin-precios.html:451 no revisa el
-- caso de error (`if (!error) {...}` sin rama else) — el admin no
-- ve ningún mensaje de fallo, el precio simplemente no se actualiza
-- en la base de datos aunque el toast de "guardado" no aparezca.
-- ============================================================

DROP POLICY IF EXISTS "admin_write_catalogo" ON catalogo;
CREATE POLICY "admin_write_catalogo" ON catalogo FOR ALL TO authenticated USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
) WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
);

DROP POLICY IF EXISTS "admin_write_config" ON config_precios;
CREATE POLICY "admin_write_config" ON config_precios FOR ALL TO authenticated USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
) WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
);

-- billeteras: tabla legacy de migrate-catalogo-completo.sql, nunca
-- llegó a crearse en producción (el wallet real vive en
-- creditos_cliente, ver patch-wallet-idor-2026.sql) — se aplica solo
-- si existe, para no abortar el resto del script si no existe.
DO $$
BEGIN
  IF to_regclass('public.billeteras') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "admin_billeteras" ON billeteras';
    EXECUTE $q$CREATE POLICY "admin_billeteras" ON billeteras FOR ALL TO authenticated USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
    ) WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
    )$q$;
  END IF;
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como admin logueado en app/admin-precios.html, cambiar un precio
-- y guardar — debe aparecer el toast "Precio actualizado" Y el
-- cambio debe persistir tras recargar la página (antes del patch,
-- el toast podía no aparecer o el valor volvía al original al
-- recargar, indicando que el UPDATE nunca se aplicó).
-- ============================================================
