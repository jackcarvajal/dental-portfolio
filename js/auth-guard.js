/**
 * PRODIGY — Auth Guard v1.0
 * Verifica sesión Supabase y redirige según rol.
 *
 * Uso en páginas protegidas:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
 *   <script src="../js/auth-guard.js"></script>
 *   <script> ProdigyAuth.require('admin'); </script>
 *
 * En app/ las rutas son ../js/auth-guard.js
 * En raíz las rutas son js/auth-guard.js
 */
(function () {
    const SUPABASE_URL  = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
    const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhyd3FmeXZneWFwYnd6a3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzczNDksImV4cCI6MjA5MDg1MzM0OX0.9CzmFDQYeQKcbtAZoT1_n_OuJ1qPVJu3jImd938T634';
    const ADMIN_EMAILS  = ['jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com'];

    const DEST_MAP = {
        admin:                'panel-interno-operaciones.html',
        operator:             'operator-panel.html',
        mensajero:            'mensajero.html',
        encargado_inventario: 'inventario.html',
        client:               'client-panel.html'
    };

    function getRole(user) {
        // Admin: solo por email — no confiar en user_metadata para admin
        if (ADMIN_EMAILS.includes((user.email || '').toLowerCase())) return 'admin';
        // Roles de staff: app_metadata primero (solo editable via service role),
        // user_metadata como fallback temporal hasta ejecutar migrate-fix-rls-app-metadata.sql
        const appMeta  = user.app_metadata  || {};
        const userMeta = user.user_metadata || {};
        const role = appMeta.role || userMeta.role || 'client';
        if (role === 'operator')             return 'operator';
        if (role === 'mensajero')            return 'mensajero';
        if (role === 'encargado_inventario') return 'encargado_inventario';
        return 'client';
    }

    function getSb() {
        return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    }

    /**
     * Verifica sesión activa. Si no hay sesión → login.
     * Si el rol no coincide → redirige al panel correcto.
     * neededRole: 'admin' | 'operator' | 'client' | null (cualquier rol)
     */
    async function require(neededRole) {
        const sb = getSb();
        const { data: { session } } = await sb.auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return null;
        }
        const role = getRole(session.user);
        const allowed = Array.isArray(neededRole) ? neededRole : (neededRole ? [neededRole] : null);
        if (allowed && !allowed.includes(role)) {
            window.location.href = DEST_MAP[role] || 'login.html';
            return null;
        }
        // Solo exponer lo mínimo — NO el session completo (contiene access_token)
        window.PRODIGY_ROLE    = role;
        window.PRODIGY_EMAIL   = session.user.email;
        window.PRODIGY_UID     = session.user.id;
        document.body.style.visibility = 'visible';
        return session;
    }

    async function signOut() {
        await getSb().auth.signOut();
        window.location.href = 'login.html';
    }

    window.ProdigyAuth = { require, signOut, getRole, getSb };
})();
