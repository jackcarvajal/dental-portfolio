-- ============================================================
-- PRODIGY LAB — Crear usuario admin: jacklaejandroc@gmail.com
--
-- OPCIÓN A (RECOMENDADA): Supabase Dashboard
-- ─────────────────────────────────────────
-- 1. Ve a: https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw/auth/users
-- 2. Clic en "Add user" → "Create new user"
-- 3. Email: jackalejandroc@gmail.com
-- 4. Password: elige uno seguro (mínimo 12 chars)
-- 5. Marca "Auto confirm user"
-- 6. Clic en "Create user"
--
-- OPCIÓN B: Via SQL (si la opción A falla)
-- ─────────────────────────────────────────
-- Ejecutar en Supabase > SQL Editor:
-- ============================================================

-- Asignar rol admin en tabla perfiles (ejecutar DESPUÉS de crear el usuario por Dashboard)
-- Reemplaza <USER_UUID> con el UUID que aparece en Dashboard > Auth > Users
INSERT INTO perfiles (id, email, rol, nombre_completo, activo)
VALUES (
    '<USER_UUID>',               -- reemplazar con UUID real
    'jackalejandroc@gmail.com',
    'admin',
    'Alejandro Carvajal',
    true
)
ON CONFLICT (id) DO UPDATE SET
    rol    = 'admin',
    activo = true;

-- ============================================================
-- DESPUÉS DE CREAR EL USUARIO:
-- 1. El usuario puede hacer login en: /app/login.html
-- 2. Tendrá acceso completo al panel de admin
-- 3. El email ya está en ADMIN_EMAILS del frontend y en RLS
-- ============================================================
