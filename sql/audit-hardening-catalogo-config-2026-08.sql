-- ============================================================
-- AUDITORÍA SQL — Endurecimiento (agosto 2026)
-- Hallazgo menor: catalogo y config_plataformas aceptan el comando
-- UPDATE/DELETE de la anon key (HTTP 204) aunque RLS lo neutraliza a 0 filas.
-- Fix (defensa en profundidad): dejarlas SOLO-LECTURA para anon.
--   -> Tras esto, anon recibe 401 en INSERT/UPDATE/DELETE (intención clara).
--   -> service_role (admin) y staff autenticado NO se ven afectados.
-- Tablas compartidas PRODIGY <-> Alejandro: ejecutar UNA vez alcanza para ambos.
-- ============================================================

-- 1) Quitar privilegios de escritura a anon (conserva SELECT)
REVOKE INSERT, UPDATE, DELETE ON public.catalogo            FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.config_plataformas  FROM anon;

-- 2) Confirmar RLS activo (idempotente)
ALTER TABLE public.catalogo            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_plataformas  ENABLE ROW LEVEL SECURITY;

-- 3) Verificación (deben quedar solo SELECT para anon)
--   SELECT grantee, privilege_type FROM information_schema.role_table_grants
--   WHERE table_name IN ('catalogo','config_plataformas') AND grantee='anon';
