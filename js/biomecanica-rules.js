/**
 * PRODIGY — Matriz de Reglas Biomecánicas
 * Previene pedidos con combinaciones clínicamente inviables.
 *
 * Uso en flujos y calculadoras:
 *   const result = BiomecanicaRules.validate(servicio, material, cantidad, opciones);
 *   if (!result.ok) mostrarAdvertencia(result.mensaje);
 */

window.BiomecanicaRules = (function() {
    'use strict';

    // ── Matriz de incompatibilidades ─────────────────────────────────
    // Estructura: { condición → advertencia o bloqueo }
    const RULES = [
        // PUENTES LARGOS en materiales frágiles
        {
            id: 'puente_resina_larga',
            check: (s, m, qty) =>
                (s.includes('puente') || s.includes('bridge')) &&
                qty >= 4 &&
                (m.includes('resina') || m.includes('pmma') || m.includes('provisional')),
            nivel: 'bloqueo',
            titulo: 'Combinación biomecánicamente inviable',
            mensaje: 'Un puente de 4+ unidades en resina/PMMA no soporta carga oclusal. Selecciona Zirconio multicapa o estructura Cr-Co.',
            alternativas: ['zirconio_multicapa', 'zirconia_3y', 'crco'],
        },
        // CARILLA en zirconio posterior
        {
            id: 'carilla_zirconio_posterior',
            check: (s, m, _qty, opts) =>
                s.includes('carilla') &&
                m.includes('zirconi') &&
                opts?.zona === 'posterior',
            nivel: 'advertencia',
            titulo: 'Carilla en zona posterior',
            mensaje: 'Las carillas en zona posterior tienen alta tasa de fractura. Considera Disilicato e.max o PMMA reforzado para estética posterior.',
            alternativas: ['emax', 'disilicato'],
        },
        // CORONA UNITARIA demasiado delgada para zirconio
        {
            id: 'zirconio_espacio_insuficiente',
            check: (s, m, _qty, opts) =>
                (s.includes('corona') || s.includes('inlay') || s.includes('onlay')) &&
                m.includes('zirconi') &&
                opts?.espacio_mm && parseFloat(opts.espacio_mm) < 0.5,
            nivel: 'advertencia',
            titulo: 'Espacio oclusal insuficiente para zirconio',
            mensaje: `Espacio de ${opts?.espacio_mm}mm detectado. Zirconio requiere mínimo 0.5mm (monolítico) o 1.0mm (con porcelana). Considera Disilicato e.max (mín 0.3mm).`,
            alternativas: ['emax', 'vita_enamic'],
        },
        // FULL ARCH en disilicato (emax)
        {
            id: 'fullarch_emax',
            check: (s, m) =>
                (s.includes('full') || s.includes('arch') || s.includes('completo') || parseInt(s) >= 12) &&
                (m.includes('emax') || m.includes('disilicato')),
            nivel: 'bloqueo',
            titulo: 'Disilicato no apto para Full Arch',
            mensaje: 'Full Arch en e.max/Disilicato presenta riesgo crítico de fractura en carga bilateral. Requiere Zirconio 5Y o estructura metálica (Cr-Co/Titanio).',
            alternativas: ['zirconio_multicapa', 'zirconia_5y', 'titanio', 'crco'],
        },
        // GUÍA QUIRÚRGICA sin CBCT
        {
            id: 'guia_sin_cbct',
            check: (s, _m, _qty, opts) =>
                s.includes('guia') &&
                opts?.tiene_cbct === false,
            nivel: 'bloqueo',
            titulo: 'Guía quirúrgica requiere CBCT',
            mensaje: 'No es posible planificar una guía quirúrgica sin CBCT (tomografía computarizada). Solicita el CBCT antes de continuar.',
            alternativas: [],
        },
        // PROVISIONAL como solución definitiva
        {
            id: 'provisional_largo_plazo',
            check: (s, m, _qty, opts) =>
                (m.includes('pmma') || m.includes('provisional') || m.includes('temp')) &&
                opts?.plazo === 'definitivo',
            nivel: 'advertencia',
            titulo: 'PMMA no recomendado como solución definitiva',
            mensaje: 'PMMA/provisional tiene vida útil de 3-12 meses bajo carga funcional. Para solución definitiva, selecciona Zirconio, Disilicato o cerámica press.',
            alternativas: ['zirconio_multicapa', 'emax', 'ceramica_prensada'],
        },
        // PUENTE IMPLANTE-DIENTE (contraindicado)
        {
            id: 'puente_implante_diente',
            check: (_s, _m, _qty, opts) =>
                opts?.pilares_tipos &&
                opts.pilares_tipos.includes('implante') &&
                opts.pilares_tipos.includes('diente'),
            nivel: 'advertencia',
            titulo: 'Puente mixto implante-diente (contraindicado)',
            mensaje: 'Conectar implantes con dientes naturales en un puente rígido puede llevar a pérdida ósea. Consulta al especialista sobre opciones de diseño seguro.',
            alternativas: [],
        },
    ];

    // Materiales agrupados para el UI
    const MATERIAL_GROUPS = {
        'zirconio_multicapa': 'Zirconio Multicapa ST/HT',
        'zirconia_3y':        'Zirconia 3Y Monolítica',
        'zirconia_5y':        'Zirconia 5Y UltraTranslúcida',
        'emax':               'Disilicato e.max CAD',
        'disilicato':         'Disilicato de Litio',
        'crco':               'Estructura Cr-Co',
        'titanio':            'Titanio Grado 5',
        'vita_enamic':        'Vita Enamic (Cerámica Híbrida)',
        'ceramica_prensada':  'Cerámica Prensada',
        'pmma':               'PMMA Provisional',
    };

    /**
     * Valida una combinación de parámetros clínicos.
     * @param {string} servicio - Tipo de trabajo (corona, puente, carilla, guia, fullarch...)
     * @param {string} material - Material seleccionado (normalizado a lowercase)
     * @param {number} cantidad - Número de unidades
     * @param {Object} opciones - Parámetros adicionales opcionales
     * @returns {{ ok: boolean, reglas: Array }}
     */
    function validate(servicio, material, cantidad = 1, opciones = {}) {
        const srv = (servicio || '').toLowerCase();
        const mat = (material  || '').toLowerCase();
        const qty = parseInt(cantidad) || 1;

        const disparadas = RULES.filter(r => {
            try { return r.check(srv, mat, qty, opciones); }
            catch(e) { return false; }
        });

        const bloqueos    = disparadas.filter(r => r.nivel === 'bloqueo');
        const advertencias = disparadas.filter(r => r.nivel === 'advertencia');

        return {
            ok:          bloqueos.length === 0,
            bloqueado:   bloqueos.length > 0,
            reglas:      disparadas,
            bloqueos,
            advertencias,
        };
    }

    /**
     * Muestra un modal de advertencia en el DOM.
     * @param {Object} result - Resultado de validate()
     * @param {Function} onContinuar - Callback si el usuario acepta advertencia
     */
    function mostrarAlerta(result, onContinuar) {
        // Eliminar alert previo
        document.getElementById('_biomecanica-alert')?.remove();

        if (result.ok && !result.advertencias.length) return;

        const regla = result.bloqueos[0] || result.advertencias[0];
        const esBloqueo = !!result.bloqueos.length;
        const color = esBloqueo ? '#ef4444' : '#fbbf24';
        const icon  = esBloqueo ? '🚫' : '⚠️';

        const alternativasHtml = regla.alternativas.length
            ? `<div style="margin-top:12px;"><p style="font-size:.72rem;color:#94a3b8;margin-bottom:6px;">ALTERNATIVAS RECOMENDADAS:</p>
               <div style="display:flex;flex-wrap:wrap;gap:6px;">
               ${regla.alternativas.map(a =>
                   `<span style="background:rgba(0,210,255,.1);border:1px solid rgba(0,210,255,.3);color:#00d2ff;padding:3px 10px;border-radius:20px;font-size:.7rem;font-weight:700;">${MATERIAL_GROUPS[a] || a}</span>`
               ).join('')}</div></div>`
            : '';

        const continuar = !esBloqueo
            ? `<button type="button" onclick="document.getElementById('_biomecanica-alert').remove();if(window._bioOnContinuar)window._bioOnContinuar();"
               style="background:rgba(251,191,36,.15);border:1px solid rgba(251,191,36,.4);color:#fbbf24;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:700;">
               Entendido, continuar de todas formas</button>`
            : '';

        window._bioOnContinuar = onContinuar;

        const el = document.createElement('div');
        el.id = '_biomecanica-alert';
        el.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);z-index:99999;width:min(460px,94vw);background:#0d1520;border:2px solid ' + color + ';border-radius:16px;padding:20px;box-shadow:0 8px 40px rgba(0,0,0,.7);animation:slideUpAlert .3s ease;';
        el.innerHTML = `
          <style>@keyframes slideUpAlert{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}</style>
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <span style="font-size:1.8rem;flex-shrink:0;">${icon}</span>
            <div style="flex:1;">
              <div style="font-weight:800;color:${color};font-size:.88rem;margin-bottom:4px;">${regla.titulo}</div>
              <p style="font-size:.8rem;color:#e2e8f0;line-height:1.6;">${regla.mensaje}</p>
              ${alternativasHtml}
              <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
                <button type="button" onclick="document.getElementById('_biomecanica-alert').remove();"
                        style="background:${esBloqueo ? color : 'rgba(255,255,255,.06)'};border:none;color:${esBloqueo ? '#fff' : '#e2e8f0'};padding:8px 18px;border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:700;">
                  ${esBloqueo ? 'Entendido, cambiar parámetros' : 'Cambiar selección'}
                </button>
                ${continuar}
              </div>
            </div>
          </div>`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 15000);
    }

    return { validate, mostrarAlerta, RULES, MATERIAL_GROUPS };
})();
