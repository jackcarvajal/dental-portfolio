/**
 * PRODIGY — Pedido Guard
 * v1.0 · 2026-07-19
 *
 * POR QUÉ EXISTE
 * Los cuatro flujos guardaban el pedido así:
 *     .then(({ error }) => { if (error) console.warn('… no guardado:', error.message) })
 *
 * Un console.warn que nadie lee. El doctor veía "¡Orden registrada!", el
 * WhatsApp salía normal, y el pedido NUNCA se guardaba. Así estuvo la tabla
 * `pedidos` completamente vacía sin que nadie lo notara: la política RLS de
 * INSERT exigía un usuario autenticado y los flujos corren sin sesión.
 *
 * Este módulo hace que ese fallo se vea:
 *   · Aviso en pantalla al doctor, sin alarmarlo de más — su pedido SÍ va a
 *     ser atendido, porque el WhatsApp sí sale. Lo que falla es el registro.
 *   · Se guarda en localStorage para que el staff pueda recuperarlo después.
 *   · Se intenta dejar rastro en logs_incidencias (si el anónimo puede).
 *
 * Uso:
 *   PedidoGuard.verificar(error, { codigo, flujo, sb });
 */
(function () {

    const LS_KEY = 'prodigy_pedidos_no_guardados';

    function escH(s) {
        return String(s == null ? '' : s)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /** Guarda localmente el pedido que no se registró, para no perderlo. */
    function guardarLocal(datos) {
        try {
            const prev = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
            prev.push({ ...datos, cuando: new Date().toISOString() });
            // Máximo 20: es un salvavidas, no un archivo histórico
            localStorage.setItem(LS_KEY, JSON.stringify(prev.slice(-20)));
        } catch (_) { /* modo privado o storage lleno: no es crítico */ }
    }

    /** Deja rastro en la base para que el staff lo vea sin depender del navegador. */
    async function registrarIncidencia(sb, codigo, flujo, motivo) {
        if (!sb) return;
        try {
            await sb.from('logs_incidencias').insert({
                tipo: 'PEDIDO_NO_GUARDADO',
                severidad: 'CRITICO',
                descripcion: `El pedido ${codigo || '(sin código)'} del flujo ${flujo || '?'} `
                           + `NO se guardó en la base. Motivo: ${motivo}. `
                           + `El doctor sí envió su WhatsApp — hay que crear el pedido a mano.`,
                resuelta: false
            });
        } catch (_) {
            // Si el anónimo tampoco puede escribir aquí, queda el localStorage
            // y el aviso en pantalla. No hay más que hacer desde el navegador.
        }
    }

    /** Aviso visible. No dice "error" a secas: explica qué pasó y qué hacer. */
    function mostrarAviso(codigo) {
        if (document.getElementById('pg-aviso-nog')) return;
        const d = document.createElement('div');
        d.id = 'pg-aviso-nog';
        d.setAttribute('role', 'alert');
        d.style.cssText = [
            'position:fixed','left:50%','bottom:20px','transform:translateX(-50%)',
            'background:#1a0c00','border:1px solid #f97316','color:#fdba74',
            'padding:14px 18px','border-radius:12px','z-index:99999',
            'max-width:min(520px,92vw)','font-size:.84rem','line-height:1.6',
            'box-shadow:0 8px 30px rgba(0,0,0,.5)','font-family:inherit'
        ].join(';');
        d.innerHTML =
            '<strong style="color:#fb923c;">⚠️ Guarda tu número de orden</strong><br>' +
            'Tu solicitud <strong>sí fue enviada por WhatsApp</strong> y la vamos a atender. ' +
            'Pero no quedó registrada en el sistema: ' +
            (codigo ? 'anota el código <strong style="color:#fff;font-family:monospace;">' + escH(codigo) + '</strong> y ' : '') +
            'menciónalo en el chat para que la asociemos.' +
            '<button type="button" id="pg-aviso-x" style="display:block;margin-top:10px;background:rgba(255,255,255,.08);' +
            'border:1px solid rgba(255,255,255,.2);color:#fdba74;padding:8px 16px;border-radius:8px;' +
            'cursor:pointer;font-size:.78rem;min-height:38px;font-family:inherit;">Entendido</button>';
        document.body.appendChild(d);
        document.getElementById('pg-aviso-x').addEventListener('click', () => d.remove());
    }

    /**
     * Punto de entrada. Llamar SIEMPRE tras el insert del pedido.
     * @param {object|null} error   el error de supabase (null si todo bien)
     * @param {object} ctx          { codigo, flujo, sb, datos }
     * @returns {boolean}           true si se guardó bien
     */
    function verificar(error, ctx) {
        ctx = ctx || {};
        if (!error) return true;

        const motivo = error.message || 'desconocido';
        console.error('[PRODIGY] ❌ PEDIDO NO GUARDADO —', ctx.codigo || '(sin código)', '·', motivo);

        guardarLocal({ codigo: ctx.codigo, flujo: ctx.flujo, motivo, datos: ctx.datos || null });
        registrarIncidencia(ctx.sb, ctx.codigo, ctx.flujo, motivo);
        mostrarAviso(ctx.codigo);
        return false;
    }

    /** Devuelve los pedidos que no se guardaron en este navegador. */
    function pendientes() {
        try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
        catch (_) { return []; }
    }

    function limpiar() {
        try { localStorage.removeItem(LS_KEY); } catch (_) {}
    }

    window.PedidoGuard = { verificar, pendientes, limpiar };
})();
