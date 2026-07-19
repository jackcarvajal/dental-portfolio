/**
 * PRODIGY — Modo prueba
 * v1.0 · 2026-07-19
 *
 * Permite recorrer los flujos completos sin pagar de verdad y sin ensuciar
 * los reportes. Se activa solo si hay una sesión iniciada cuyo
 * app_metadata.role sea 'test'.
 *
 * NO se activa con un parámetro en la URL ni con localStorage a secas: eso
 * lo podría encender cualquiera. Exige credenciales reales.
 *
 * El rol se lee de app_metadata — NUNCA de user_metadata, que el propio
 * usuario puede editar desde el navegador.
 *
 * Uso en un flujo:
 *   await ModoPrueba.init(sb);
 *   if (ModoPrueba.activo()) { ...  }
 *   const extra = ModoPrueba.camposPedido();   // { es_prueba:true, ... }
 */
(function () {

    let _activo = false;
    let _email  = null;

    /** Lee el rol del JWT de la sesión activa. */
    async function init(sb) {
        try {
            if (!sb || !sb.auth) return false;
            const { data: { session } } = await sb.auth.getSession();
            if (!session) return false;

            // El rol viaja dentro del access_token (JWT). Se decodifica el payload.
            const payload = JSON.parse(atob(session.access_token.split('.')[1]));
            const rol = payload?.app_metadata?.role;

            _activo = rol === 'test';
            _email  = session.user?.email || null;

            if (_activo) banner();
            return _activo;
        } catch (e) {
            console.warn('[ModoPrueba] No se pudo determinar el rol:', e);
            return false;
        }
    }

    function activo() { return _activo; }
    function email()  { return _email; }

    /**
     * Campos extra para el INSERT del pedido.
     * Devuelve {} si no está en modo prueba — así se puede hacer siempre
     * un spread sin condicionales en el flujo.
     */
    function camposPedido() {
        if (!_activo) return {};
        return {
            es_prueba:   true,
            pago_estado: 'pago_confirmado'   // el trigger solo lo respeta si es_prueba
        };
    }

    /** ¿Se debe saltar el cobro real? */
    function saltaPago() { return _activo; }

    /** Franja permanente. Nadie debe confundir una prueba con un caso real. */
    function banner() {
        if (document.getElementById('mp-banner')) return;
        const b = document.createElement('div');
        b.id = 'mp-banner';
        b.setAttribute('role', 'status');
        b.style.cssText = [
            'position:fixed','top:0','left:0','right:0','z-index:99998',
            'background:repeating-linear-gradient(45deg,#7c2d12,#7c2d12 12px,#9a3412 12px,#9a3412 24px)',
            'color:#fed7aa','text-align:center','padding:7px 12px',
            'font-size:.76rem','font-weight:800','letter-spacing:.5px',
            'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
            'box-shadow:0 2px 10px rgba(0,0,0,.4)'
        ].join(';');
        b.textContent = '🧪 MODO PRUEBA — los pedidos que crees NO son reales y no se cobran';
        document.body.appendChild(b);
        // Empujar el contenido para no tapar el header
        document.body.style.paddingTop =
            (parseInt(getComputedStyle(document.body).paddingTop, 10) || 0) + 30 + 'px';
    }

    window.ModoPrueba = { init, activo, email, camposPedido, saltaPago };
})();
