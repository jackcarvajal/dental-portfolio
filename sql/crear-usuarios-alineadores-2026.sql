-- ============================================================
-- PRODIGY — Usuarios para el flujo de ALINEADORES (sep-2026)
--
-- Los usuarios de Supabase NO se crean por SQL de forma segura
-- (la contraseña se hashea en el servidor de Auth). Se crean en el
-- Dashboard y AQUÍ solo se les asigna el rol de staff (app_metadata).
--
-- ────────────────────────────────────────────────────────────
-- PASO 1 — Crear los 2 usuarios en el Dashboard
--   https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw/auth/users
--   → "Add user" → "Create new user" → marcar "Auto Confirm User"
--
--   a) MAYRA (técnica de alineadores — STAFF)
--      Email:    mayramireztd@gmail.com
--      Password: (una segura, ella la cambia al entrar)
--
--   b) CLIENTE (Panorámica Digital 3D — quien envía casos)
--      Email:    gestion@panoramicadigital3d.com
--      Password: (una segura, la cambian al entrar)
--      → NO necesita rol: cualquier usuario autenticado sin rol = 'client'.
--        Entra a /app/client-panel.html para aprobar / dejar observaciones.
--
-- ────────────────────────────────────────────────────────────
-- PASO 2 — Asignar a Mayra el rol 'diseno' (staff, NO ve dinero)
--   El rol de staff vive en app_metadata (solo editable por service_role
--   o por SQL aquí). 'diseno' le da: subir el plan/viabilidad, el cliente
--   revisa, aprueba o pide cambios (flujo REVISION_CLIENTE ya existente),
--   y los montos quedan ocultos (Fase 3). Ejecutar DESPUÉS del Paso 1:
-- ============================================================

UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"diseno"}'::jsonb
WHERE email = 'mayramireztd@gmail.com';

-- ── VERIFICACIÓN ────────────────────────────────────────────
-- Debe devolver "diseno":
SELECT email, raw_app_meta_data->>'role' AS rol
FROM auth.users
WHERE email IN ('mayramireztd@gmail.com','gestion@panoramicadigital3d.com');

-- NOTA (opcional, más adelante): si quieres AISLAR a Mayra para que solo
-- vea casos de alineadores y no todos los diseños, se crea un rol
-- 'alineadores' dedicado + su panel. Para el piloto, 'diseno' es suficiente.
-- ============================================================
