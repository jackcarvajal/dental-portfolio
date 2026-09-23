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
    const ADMIN_EMAILS  = ['jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com', 'gerencia@prodigylabdental.com', 'casos@prodigylabdental.com'];

    const DEST_MAP = {
        admin:                '/app/panel-interno-operaciones.html',
        operator:             '/app/operator-panel.html',
        mensajero:            '/app/mensajero.html',
        encargado_inventario: '/app/inventario.html',
        calidad:              '/app/calidad.html',
        contabilidad:         '/app/contabilidad.html',
        diseno:               '/app/operario-diseno.html',
        alineadores:          '/app/alineadores.html',
        guias:                '/app/operario-diseno.html',
        exocad:               '/app/operario-diseno.html',
        blender:              '/app/operario-diseno.html',
        taller:               '/app/taller.html',
        fresado:              '/app/operario.html',
        impresion:            '/app/operario.html',
        client:               '/app/client-panel.html'
    };
    const KNOWN_ROLES = ['operator','mensajero','encargado_inventario','calidad','contabilidad','diseno','alineadores','guias','exocad','blender','taller','fresado','impresion','secretaria'];

    // Roles del usuario (soporta VARIOS: app_metadata.roles[] o el clásico app_metadata.role).
    // Admin SOLO por email. user_metadata NUNCA para autorización de staff.
    function getRoles(user) {
        if (ADMIN_EMAILS.includes((user.email || '').toLowerCase())) return ['admin'];
        const am = user.app_metadata || {};
        var list = [];
        if (Array.isArray(am.roles)) list = am.roles.slice();
        if (am.role) list.push(am.role);
        list = list.filter(function(r){ return KNOWN_ROLES.indexOf(r) !== -1; });
        // Set (dedup) sin depender de Array.from para navegadores viejos
        var seen = {}, out = [];
        list.forEach(function(r){ if(!seen[r]){ seen[r]=1; out.push(r); } });
        return out.length ? out : ['client'];
    }
    function isActive(user) {
        if (ADMIN_EMAILS.includes((user.email || '').toLowerCase())) return true;
        var a = (user.app_metadata || {}).active;
        return a !== false; // por defecto activo; solo false lo desactiva
    }
    function getRole(user) { return getRoles(user)[0]; }

    // Cliente Supabase ÚNICO (singleton). Crear múltiples instancias con la misma
    // storageKey provoca conflictos de GoTrue y carreras donde la sesión no está
    // lista al hacer una operación → la petición cae a 'anon' y RLS la bloquea.
    let _sbInstance = null;
    function getSb() {
        if (_sbInstance) return _sbInstance;
        _sbInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
        window.sb = _sbInstance;   // reutilizable por las páginas del panel
        return _sbInstance;
    }

    /**
     * Verifica sesión activa. Si no hay sesión → login.
     * Si el rol no coincide → redirige al panel correcto.
     * neededRole: 'admin' | 'operator' | 'client' | null (cualquier rol)
     */
    async function require(neededRole, loginUrl) {
        const sb = getSb();
        const { data: { session } } = await sb.auth.getSession();
        if (!session) {
            window.location.href = loginUrl || 'login.html';
            return null;
        }

        // ── SEGURIDAD: Cambio de contraseña obligatorio en primer acceso ──
        // Se activa cuando el usuario fue creado con registro implícito (primera_vez=true)
        const meta = session.user.user_metadata || {};
        const isPrimerAcceso = meta.primera_vez === true;
        const isChangingPassword = window.location.pathname.includes('cambiar-contrasena') ||
                                    window.location.pathname.includes('reset-password') ||
                                    window.location.pathname.includes('configuracion');
        if (isPrimerAcceso && !isChangingPassword) {
            // Guardar destino para volver después de cambiar contraseña
            const dest = encodeURIComponent(window.location.href);
            window.location.href = 'cambiar-contrasena.html?primera_vez=1&next=' + dest;
            return null;
        }

        // Cuenta desactivada por el admin → fuera
        if (!isActive(session.user)) {
            await getSb().auth.signOut();
            window.location.href = (loginUrl || 'login.html') + '?desactivado=1';
            return null;
        }
        const roles   = getRoles(session.user);
        const primary = roles[0];
        const allowed = Array.isArray(neededRole) ? neededRole : (neededRole ? [neededRole] : null);
        if (allowed && !allowed.some(function(r){ return roles.indexOf(r) !== -1; })) {
            window.location.href = DEST_MAP[primary] || 'login.html';
            return null;
        }
        // Solo exponer lo mínimo — NO el session completo (contiene access_token)
        window.PRODIGY_ROLE    = primary;
        window.PRODIGY_ROLES   = roles;
        window.PRODIGY_EMAIL   = session.user.email;
        window.PRODIGY_UID     = session.user.id;
        document.body.style.visibility = 'visible';
        return session;
    }

    async function signOut() {
        await getSb().auth.signOut();
        window.location.href = 'login.html';
    }

    /* ── SESSION TIMEOUT — cierra sesión tras 30 min de inactividad ──
       Se activa solo en páginas del portal (/app/).
       Reinicia el timer en cada interacción del usuario.
    ─────────────────────────────────────────────────────────────────── */
    (function _sessionTimeout() {
        if (!window.location.pathname.includes('/app/')) return;
        const IDLE_MS = 30 * 60 * 1000; // 30 minutos
        let _timer;

        function _reset() {
            clearTimeout(_timer);
            _timer = setTimeout(function() {
                // Mostrar advertencia 1 minuto antes
                const warn = confirm(
                    '⚠️ Tu sesión expirará en 1 minuto por inactividad.\n\n' +
                    'Haz clic en OK para continuar o Cancelar para cerrar sesión ahora.'
                );
                if (!warn) {
                    signOut();
                    return;
                }
                // Dar 1 minuto más
                _timer = setTimeout(function() {
                    alert('Sesión cerrada por inactividad.');
                    signOut();
                }, 60 * 1000);
            }, IDLE_MS - 60000); // 29 minutos → aviso
        }

        // Reiniciar en interacciones del usuario
        ['mousemove','keydown','click','scroll','touchstart'].forEach(function(ev) {
            document.addEventListener(ev, _reset, { passive: true });
        });

        // Arrancar al cargar
        _reset();
    })();

    window.ProdigyAuth = { require, signOut, getRole, getRoles, getSb };
})();
