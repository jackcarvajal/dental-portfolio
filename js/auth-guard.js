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
    const ADMIN_EMAILS  = ['jacklaejandroc@gmail.com', 'jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com'];

    const DEST_MAP = {
        admin:                'panel-interno-operaciones.html',
        operator:             'operator-panel.html',
        mensajero:            'mensajero.html',
        encargado_inventario: 'inventario.html',
        client:               'client-panel.html'
    };

    function getRole(user) {
        if (ADMIN_EMAILS.includes((user.email || '').toLowerCase())) return 'admin';
        const meta = user.user_metadata || {};
        if (meta.role === 'operator')             return 'operator';
        if (meta.role === 'mensajero')            return 'mensajero';
        if (meta.role === 'encargado_inventario') return 'encargado_inventario';
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
        window.PRODIGY_SESSION = session;
        window.PRODIGY_USER    = session.user;
        window.PRODIGY_ROLE    = role;
        window.PRODIGY_EMAIL   = session.user.email;
        document.body.style.visibility = 'visible';
        return session;
    }

    async function signOut() {
        await getSb().auth.signOut();
        window.location.href = 'login.html';
    }

    window.ProdigyAuth = { require, signOut, getRole, getSb };
})();
