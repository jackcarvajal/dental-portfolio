/**
 * PRODIGY — Sistema de Pagos v2.0
 * ─────────────────────────────────────────────────────────────
 * ✅ Claves PÚBLICAS (seguras en frontend):
 *    - Wompi Public Key (test)
 *
 * ❌ Claves PRIVADAS (NUNCA en frontend):
 *    - Wompi Private Key → supabase secrets
 *    - Wompi Integrity Secret → supabase secrets
 * ─────────────────────────────────────────────────────────────
 * Recargos:
 *   Wompi:         +3%  (PSE / tarjeta / Nequi online)
 *   Transferencia: +0%  (prioridad si total > $400.000 COP)
 */

const PAGOS_CONFIG = {
    wompi: {
        publicKey: 'pub_test_zpgtFnjKTnbfCL0pWFRRer7608bTBkii',
        recargo:   0.03,
        label:     'Tarjeta / PSE / Nequi — Wompi',
        icono:     '💳',
        currency:  'COP'
    },
    transferencia: {
        recargo:             0,
        label:               'Transferencia Lulo Bank / Bre-B',
        icono:               '🏦',
        umbralPrioritario:   400000,
        instrucciones:       'Solicita el número de cuenta vía WhatsApp. Sube el comprobante aquí para confirmar tu pedido.'
    }
};

/* ── Calcular total según pasarela ── */
function calcularConPasarela(precioBaseCOP, pasarela) {
    const cfg = PAGOS_CONFIG[pasarela];
    if (!cfg) return { total: precioBaseCOP, recargoAmt: 0, recargo: 0 };

    const recargoAmt = Math.round(precioBaseCOP * cfg.recargo);
    const total      = precioBaseCOP + recargoAmt;

    // PayPal: convertir a USD para el SDK
    const totalUSD = pasarela === 'paypal'
        ? (total / PAGOS_CONFIG.paypal.tasaCOP).toFixed(2)
        : null;

    return { total, recargoAmt, recargo: cfg.recargo, totalUSD, label: cfg.label };
}

/* ── Pasarela prioritaria según monto ── */
function pasarelaPrioritaria(precioBaseCOP) {
    return precioBaseCOP >= PAGOS_CONFIG.transferencia.umbralPrioritario
        ? 'transferencia'
        : 'wompi';
}

/* ═══════════════════════════════════════
   WOMPI
═══════════════════════════════════════ */

/**
 * Abre el checkout de Wompi en popup.
 * Webhook: .../webhook-handler?source=wompi
 * @param {object} opts - { monto, referencia, email, descripcion, onSuccess }
 */
function abrirCheckoutWompi({ monto, referencia, email, descripcion, onSuccess }) {
    const centavos = Math.round(monto * 100);
    const params = new URLSearchParams({
        'public-key':      PAGOS_CONFIG.wompi.publicKey,
        'currency':        'COP',
        'amount-in-cents': centavos,
        'reference':       referencia,
        'redirect-url':    `${window.location.origin}/seguimiento-caso.html?pedido=${referencia}&pago=ok`
    });
    if (email)       params.set('customer-email', email);
    if (descripcion) params.set('checkout[name]', descripcion);

    const popup = window.open(
        `https://checkout.wompi.co/p/?${params.toString()}`,
        'wompi-checkout',
        'width=520,height=700,scrollbars=yes'
    );

    if (popup) {
        const timer = setInterval(() => {
            if (popup.closed) {
                clearInterval(timer);
                if (onSuccess) onSuccess({ referencia });
            }
        }, 800);
    }
}

/* ═══════════════════════════════════════
   UI — Selector de pasarelas
═══════════════════════════════════════ */

/**
 * Renderiza las 3 opciones de pago en un contenedor.
 * @param {string}   containerId  - ID del div contenedor
 * @param {number}   precioBase   - Precio base en COP
 * @param {function} onSelect     - Callback(pasarela, { total, recargoAmt })
 */
function renderSelectorPasarelas(containerId, precioBase, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const prioritaria = pasarelaPrioritaria(precioBase);

    const fmtCOP = (v) => v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    container.innerHTML = `<div class="pasarelas-grid">` +
        Object.entries(PAGOS_CONFIG).map(([key, cfg]) => {
            const { total, recargoAmt } = calcularConPasarela(precioBase, key);
            const esPrioritaria = key === 'transferencia' && precioBase >= cfg.umbralPrioritario;

            return `
            <label class="pasarela-card ${esPrioritaria ? 'pasarela-prioritaria' : ''}" data-pasarela="${key}">
                <input type="radio" name="pasarela" value="${key}" ${key === prioritaria ? 'checked' : ''}>
                <span class="pasarela-icono">${cfg.icono}</span>
                <div class="pasarela-info">
                    <span class="pasarela-nombre">${cfg.label}</span>
                    ${recargoAmt > 0
                        ? `<span class="pasarela-recargo">+${(cfg.recargo * 100).toFixed(0)}% comisión = ${fmtCOP(recargoAmt)}</span>`
                        : `<span class="pasarela-sin-recargo">✅ Sin comisión</span>`}
                    ${esPrioritaria ? `<span class="pasarela-badge">⭐ RECOMENDADO para este monto</span>` : ''}
                </div>
                <span class="pasarela-total">${fmtCOP(total)}</span>
            </label>`;
        }).join('') +
    `</div>`;

    container.querySelectorAll('input[name="pasarela"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (onSelect) onSelect(radio.value, calcularConPasarela(precioBase, radio.value));
        });
    });

    // Trigger inicial
    if (onSelect) onSelect(prioritaria, calcularConPasarela(precioBase, prioritaria));
}

/* ── CSS embebido para el selector de pasarelas ── */
(function inyectarEstilosPasarelas() {
    if (document.getElementById('prodigy-pasarelas-css')) return;
    const style = document.createElement('style');
    style.id = 'prodigy-pasarelas-css';
    style.textContent = `
        .pasarelas-grid { display:flex; flex-direction:column; gap:10px; margin:16px 0; }
        .pasarela-card {
            display:flex; align-items:center; gap:14px; padding:14px 18px;
            border:1.5px solid rgba(212,175,55,0.2); border-radius:12px;
            background:rgba(255,255,255,0.03); cursor:pointer;
            transition:border-color 0.2s, background 0.2s;
        }
        .pasarela-card:has(input:checked),
        .pasarela-card:hover { border-color:#D4AF37; background:rgba(212,175,55,0.07); }
        .pasarela-card input[type="radio"] { accent-color:#D4AF37; width:18px; height:18px; }
        .pasarela-icono { font-size:1.5rem; }
        .pasarela-info  { flex:1; display:flex; flex-direction:column; gap:2px; }
        .pasarela-nombre { color:#f5f5f7; font-weight:700; font-size:14px; }
        .pasarela-recargo { color:#f87171; font-size:12px; }
        .pasarela-sin-recargo { color:#4ade80; font-size:12px; }
        .pasarela-badge { color:#D4AF37; font-size:11px; font-weight:700; }
        .pasarela-total { color:#D4AF37; font-weight:800; font-size:15px; white-space:nowrap; }
        .pasarela-prioritaria { border-color:rgba(74,222,128,0.4); }
    `;
    document.head.appendChild(style);
})();

if (typeof module !== 'undefined') {
    module.exports = {
        PAGOS_CONFIG, calcularConPasarela, pasarelaPrioritaria,
        abrirCheckoutWompi,
        renderSelectorPasarelas
    };
}
