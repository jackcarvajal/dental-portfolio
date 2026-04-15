/**
 * PRODIGY — Sistema de Pagos v4.0 (Agente 2: Finanzas + Paddle)
 * ─────────────────────────────────────────────────────────────
 * ✅ Claves PÚBLICAS (seguras en frontend):
 *    - Wompi Public Key (test)
 *    - PayPal Client ID (Live)
 *    - Paddle Client Token (Live)
 *    - Paddle Seller ID
 *
 * ❌ Claves PRIVADAS (NUNCA en frontend):
 *    - Wompi Private Key → supabase secrets (WOMPI_INTEGRITY_SECRET)
 *    - Paddle API Key    → supabase secrets (PADDLE_API_KEY)
 * ─────────────────────────────────────────────────────────────
 * Recargos:
 *   Wompi:         +3%  (PSE / tarjeta / Nequi online — Colombia)
 *   PayPal:        +5.4% (checkout internacional)
 *   Paddle:        +7%  (Merchant of Record — internacional)
 *   Transferencia: +0%  (prioridad si total > $400.000 COP)
 */

const PAGOS_CONFIG = {
    wompi: {
        publicKey: 'pub_prod_toFqXMM5Ko9rn6Htt6kiEma7jh19zuN0',
        modoEspera: false,          // ✅ Producción activa
        recargo:   0.03,
        label:     'PSE / Nequi / Tarjeta — Wompi (Colombia)',
        icono:     '💳',
        currency:  'COP',
        paises:    ['CO']
    },
    paypal: {
        clientId:  'AfJ71Yzfk4hmHF_hj6F9sdUqTLCK9tilmCegiXOTpScB81NhLLDuiKX2u37aY_E4swf8UO8QuC7jvaG',
        recargo:   0.054,
        label:     'PayPal / Tarjeta Internacional',
        icono:     '🌎',
        currency:  'USD',
        paises:    ['*']            // Internacional (excluye CO)
    },
    paddle: {
        clientToken: 'Live_0e3ce1326df4e81c783290c5399',
        sellerId:    311800,
        recargo:     0.07,
        label:       'Paddle — Tarjeta / Apple Pay / Google Pay',
        icono:       '💼',
        currency:    'USD',
        // ⏳ PENDIENTE: crear producto en Paddle Dashboard y pegar el priceId aquí
        // dashboard.paddle.com → Catalog → Products → + New product → copiar "pri_..."
        priceId:     null,
        modoEspera:  true,          // activar cuando priceId esté configurado
        paises:      ['*']          // Internacional (excluye CO)
    },
    transferencia: {
        recargo:             0,
        label:               'Transferencia Lulo Bank / Bre-B',
        icono:               '🏦',
        umbralPrioritario:   400000,
        instrucciones:       'Solicita el número de cuenta vía WhatsApp. Sube el comprobante aquí para confirmar tu pedido.',
        paises:              ['CO']
    }
};

/* ── Tasa de cambio referencial COP → USD ── */
const TASA_COP_USD = 4200;

/* ── URLs de Edge Functions ── */
const VERIFY_PRICE_URL    = 'https://zgihrwqfyvgyapbwzkvw.supabase.co/functions/v1/verify-price';
const WOMPI_SIGNATURE_URL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co/functions/v1/wompi-signature';

/* ── Calcular total según pasarela ── */
function calcularConPasarela(precioBaseCOP, pasarela) {
    const cfg = PAGOS_CONFIG[pasarela];
    if (!cfg) return { total: precioBaseCOP, recargoAmt: 0, recargo: 0 };

    const recargoAmt = Math.round(precioBaseCOP * cfg.recargo);
    const total      = precioBaseCOP + recargoAmt;

    // PayPal: convertir a USD para el SDK
    const totalUSD = pasarela === 'paypal'
        ? (total / TASA_COP_USD).toFixed(2)
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
async function abrirCheckoutWompi({ monto, referencia, email, descripcion, onSuccess }) {
    if (PAGOS_CONFIG.wompi.modoEspera) {
        const msg = 'El pago con PSE/Tarjeta estará disponible en 24–48 h.\n\nUsa Transferencia o contacta por WhatsApp.';
        if (confirm(msg + '\n\n¿Abrir WhatsApp ahora?')) {
            const ref = encodeURIComponent('Quiero pagar por transferencia — Ref: ' + referencia);
            window.open('https://wa.me/573212816716?text=' + ref, '_blank');
        }
        return;
    }
    const centavos = Math.round(monto * 100);

    // Obtener firma SHA-256 desde Edge Function (el secreto nunca sale del servidor)
    let signature = '';
    try {
        const sigRes = await fetch(WOMPI_SIGNATURE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referencia, monto_en_centavos: centavos, moneda: 'COP' })
        });
        if (sigRes.ok) {
            const sigData = await sigRes.json();
            signature = sigData.signature ?? '';
        }
    } catch (_e) { /* sin firma — Wompi igual procesa, solo sin validación extra */ }

    const params = new URLSearchParams({
        'public-key':      PAGOS_CONFIG.wompi.publicKey,
        'currency':        'COP',
        'amount-in-cents': String(centavos),
        'reference':       referencia,
        'redirect-url':    `${window.location.origin}/seguimiento-caso.html?pedido=${referencia}&pago=ok`
    });
    if (email)       params.set('customer-email', email);
    if (descripcion) params.set('checkout[name]', descripcion);
    if (signature)   params.set('signature:integrity', signature);

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

/* ═══════════════════════════════════════
   GEOLOCALIZACIÓN — detectar país del cliente
═══════════════════════════════════════ */

/**
 * Detecta el país del visitante vía ipapi.co (gratis, 1000 req/día).
 * Cachea el resultado en sessionStorage para no repetir la llamada.
 * @returns {Promise<string>} código ISO del país, ej: 'CO', 'US', 'MX'
 */
async function detectarPais() {
    const cached = sessionStorage.getItem('prodigy_pais');
    if (cached) return cached;
    try {
        const resp = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        const data = await resp.json();
        const pais = data.country_code || 'CO';
        sessionStorage.setItem('prodigy_pais', pais);
        return pais;
    } catch {
        return 'CO'; // fallback: mostrar Wompi
    }
}

/**
 * Devuelve la pasarela óptima según país y monto.
 * Colombia + monto < 400k → wompi
 * Colombia + monto ≥ 400k → transferencia
 * Internacional           → paypal
 */
async function pasarelaOptimaPorPais(precioBase) {
    const pais = await detectarPais();
    if (pais !== 'CO') return 'paypal';
    return pasarelaPrioritaria(precioBase);
}

/* ═══════════════════════════════════════
   PAYPAL — checkout internacional
═══════════════════════════════════════ */

let _paypalLoaded = false;

/**
 * Carga el SDK de PayPal de forma diferida (solo para usuarios internacionales).
 */
function cargarSDKPayPal() {
    if (_paypalLoaded || document.getElementById('paypal-sdk')) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const s  = document.createElement('script');
        s.id     = 'paypal-sdk';
        // Entorno Live — no agregar &debug=true ni &env=sandbox
        s.src    = `https://www.paypal.com/sdk/js?client-id=${PAGOS_CONFIG.paypal.clientId}&currency=USD&intent=capture&disable-funding=credit,card`;
        s.onload  = () => { _paypalLoaded = true; resolve(); };
        s.onerror = () => reject(new Error('No se pudo cargar PayPal SDK'));
        document.head.appendChild(s);
    });
}

/**
 * Abre el checkout de PayPal en un div contenedor.
 * @param {object} opts - { montoUSD, referencia, descripcion, containerId, onSuccess }
 */
async function abrirCheckoutPayPal({ montoUSD, referencia, descripcion, containerId, onSuccess }) {
    try {
        await cargarSDKPayPal();
    } catch {
        alert('No se pudo conectar con PayPal. Intenta con transferencia internacional o contáctanos.');
        return;
    }
    const container = document.getElementById(containerId || 'paypal-button-container');
    if (!container) return;
    container.innerHTML = '';

    window.paypal.Buttons({
        createOrder: (data, actions) => actions.order.create({
            purchase_units: [{
                reference_id: referencia,
                description:  descripcion || 'PRODIGY Digital Dentistry',
                amount: { value: montoUSD.toFixed(2), currency_code: 'USD' }
            }]
        }),
        onApprove: (data, actions) => actions.order.capture().then(details => {
            if (onSuccess) onSuccess({ referencia, details });
            else window.location.href = `https://prodigylabdental.com/success?pedido=${referencia}`;
        }),
        onError: (err) => {
            console.error('PayPal error:', err);
            alert('Pago PayPal no completado. Intenta de nuevo.');
        }
    }).render(`#${containerId || 'paypal-button-container'}`);
}

/* ═══════════════════════════════════════
   PADDLE — checkout internacional (Merchant of Record)
═══════════════════════════════════════ */

let _paddleLoaded = false;

/**
 * Carga el SDK de Paddle v2 de forma diferida.
 */
function cargarSDKPaddle() {
    if (_paddleLoaded || document.getElementById('paddle-sdk')) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const s   = document.createElement('script');
        s.id      = 'paddle-sdk';
        s.src     = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        s.onload  = () => {
            window.Paddle.Initialize({ token: PAGOS_CONFIG.paddle.clientToken });
            _paddleLoaded = true;
            resolve();
        };
        s.onerror = () => reject(new Error('No se pudo cargar Paddle SDK'));
        document.head.appendChild(s);
    });
}

/**
 * Abre el checkout de Paddle inline.
 * Requiere que PAGOS_CONFIG.paddle.priceId esté configurado.
 * @param {object} opts - { montoUSD, referencia, email, containerId, onSuccess }
 */
async function abrirCheckoutPaddle({ montoUSD, referencia, email, containerId, onSuccess }) {
    const cfg = PAGOS_CONFIG.paddle;

    if (cfg.modoEspera || !cfg.priceId) {
        const msg = 'Paddle estará disponible pronto.\n\n'
                  + 'Por favor usa PayPal para pago internacional o contáctanos por WhatsApp.';
        if (confirm(msg + '\n\n¿Abrir WhatsApp ahora?')) {
            const ref = encodeURIComponent('Quiero pagar por Paddle — Ref: ' + referencia);
            window.open('https://wa.me/573212816716?text=' + ref, '_blank');
        }
        return;
    }

    try {
        await cargarSDKPaddle();
    } catch {
        alert('No se pudo conectar con Paddle. Intenta con PayPal.');
        return;
    }

    window.Paddle.Checkout.open({
        items:      [{ priceId: cfg.priceId, quantity: 1 }],
        customer:   email ? { email } : undefined,
        customData: { referencia, monto_usd: montoUSD.toFixed(2) },
        settings: {
            displayMode: containerId ? 'inline' : 'overlay',
            frameTarget:  containerId || undefined,
            frameInitialHeight: 450,
            frameStyle: 'width: 100%; background: transparent; border: none;',
            theme: 'dark',
            locale: 'es',
            successUrl: `https://prodigylabdental.com/success?pedido=${referencia}`
        }
    });

    // Escuchar evento de completado
    window.Paddle.eventCallback = (data) => {
        if (data.name === 'checkout.completed' && onSuccess) {
            onSuccess({ referencia, details: data.data });
        }
    };
}

/* ═══════════════════════════════════════
   VERIFY PRICE — verificación server-side
═══════════════════════════════════════ */

/**
 * Consulta la Edge Function verify-price para obtener el total verificado.
 * Usar este total (no el del frontend) al abrir el checkout.
 * @param {number} precioBase - Precio base en COP
 * @param {string} pasarela   - 'wompi' | 'paypal' | 'transferencia'
 * @returns {Promise<object>} { total, total_cop, total_usd, moneda, recargo_pct, referencia_pre }
 */
async function verificarPrecioServidor(precioBase, pasarela) {
    const pais = await detectarPais();
    try {
        const resp = await fetch(VERIFY_PRICE_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ precio_base: precioBase, pasarela, pais }),
            signal:  AbortSignal.timeout(5000)
        });
        if (!resp.ok) throw new Error(`verify-price HTTP ${resp.status}`);
        return await resp.json();
    } catch (e) {
        // Fallback: calcular localmente si el servidor no responde
        console.warn('verify-price no disponible, usando cálculo local:', e.message);
        const { total, recargoAmt } = calcularConPasarela(precioBase, pasarela);
        return {
            total, total_cop: total, total_usd: null,
            moneda: 'COP', recargo_pct: PAGOS_CONFIG[pasarela]?.recargo ?? 0,
            referencia_pre: 'PRD-' + Math.random().toString(36).substr(2,8).toUpperCase(),
            _fallback: true
        };
    }
}

/* ═══════════════════════════════════════
   ETIQUETA DIVISA — formato con moneda explícita
═══════════════════════════════════════ */

/**
 * Formatea un monto con la etiqueta de moneda explícita.
 * Ej: formatDivisa(150000, 'COP') → '$150.000 COP'
 *     formatDivisa(35.50,  'USD') → 'US$35.50 USD'
 */
function formatDivisa(amount, moneda = 'COP') {
    if (moneda === 'USD') {
        return 'US$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD';
    }
    return '$' + Math.round(amount).toLocaleString('es-CO') + ' COP';
}

/* ═══════════════════════════════════════
   INICIALIZAR PASARELAS — punto de entrada principal
   Detecta país y muestra opciones correctas.
═══════════════════════════════════════ */

/**
 * Inicializa el selector de pasarelas según el país detectado.
 * Para Colombia: Wompi + Transferencia
 * Para internacional: PayPal + Transferencia (wire)
 *
 * @param {string}   containerId - ID del div contenedor
 * @param {number}   precioBase  - Precio base en COP
 * @param {function} onSelect    - Callback(pasarela, { total, recargoAmt, moneda })
 */
async function inicializarPasarelas(containerId, precioBase, onSelect) {
    const pais = await detectarPais();
    const esInternacional = pais !== 'CO';

    if (esInternacional) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const totalUSD    = parseFloat((precioBase / TASA_COP_USD).toFixed(2));
        const recargoUSD  = parseFloat((totalUSD * PAGOS_CONFIG.paypal.recargo).toFixed(2));
        const totalFinalUSD = parseFloat((totalUSD + recargoUSD).toFixed(2));

        const totalPaddleUSD  = parseFloat((totalUSD * (1 + PAGOS_CONFIG.paddle.recargo)).toFixed(2));
        const recargoPaddleUSD = parseFloat((totalUSD * PAGOS_CONFIG.paddle.recargo).toFixed(2));

        container.innerHTML = `
        <div style="background:rgba(0,97,255,0.06);border:1px solid rgba(0,97,255,0.25);border-radius:12px;padding:14px;margin:12px 0;">
            <div style="font-size:.75rem;color:#60a5fa;font-weight:700;margin-bottom:8px;">
                🌎 PAGO INTERNACIONAL — ${pais}
            </div>
            <div style="font-size:.82rem;color:#e2e8f0;margin-bottom:4px;">
                Precio base:
                <strong style="color:#D4AF37;">${formatDivisa(precioBase,'COP')}</strong>
                ≈ <strong style="color:#60a5fa;">${formatDivisa(totalUSD,'USD')}</strong>
            </div>

            <div style="display:flex;gap:10px;margin:10px 0;">
                <!-- Opción PayPal -->
                <label style="flex:1;border:1.5px solid rgba(212,175,55,0.3);border-radius:10px;padding:12px;cursor:pointer;background:rgba(255,255,255,0.03);" id="opt-paypal">
                    <input type="radio" name="gw-intl" value="paypal" checked style="accent-color:#D4AF37;">
                    <span style="font-size:1.1rem;margin-left:6px;">🌎</span>
                    <div style="font-size:.8rem;font-weight:700;color:#f5f5f7;margin-top:4px;">PayPal</div>
                    <div style="font-size:.72rem;color:#f87171;">+${(PAGOS_CONFIG.paypal.recargo*100).toFixed(1)}% = ${formatDivisa(recargoUSD,'USD')}</div>
                    <div style="font-size:.9rem;font-weight:900;color:#60a5fa;">${formatDivisa(totalFinalUSD,'USD')}</div>
                </label>
                <!-- Opción Paddle -->
                <label style="flex:1;border:1.5px solid rgba(212,175,55,0.3);border-radius:10px;padding:12px;cursor:pointer;background:rgba(255,255,255,0.03);opacity:${PAGOS_CONFIG.paddle.modoEspera ? '.55' : '1'};" id="opt-paddle">
                    <input type="radio" name="gw-intl" value="paddle" ${PAGOS_CONFIG.paddle.modoEspera ? 'disabled' : ''} style="accent-color:#D4AF37;">
                    <span style="font-size:1.1rem;margin-left:6px;">💼</span>
                    <div style="font-size:.8rem;font-weight:700;color:#f5f5f7;margin-top:4px;">Paddle${PAGOS_CONFIG.paddle.modoEspera ? ' <span style="font-size:.65rem;color:#fbbf24;">Próximamente</span>' : ''}</div>
                    <div style="font-size:.72rem;color:#f87171;">+${(PAGOS_CONFIG.paddle.recargo*100).toFixed(1)}% = ${formatDivisa(recargoPaddleUSD,'USD')}</div>
                    <div style="font-size:.9rem;font-weight:900;color:#60a5fa;">${formatDivisa(totalPaddleUSD,'USD')}</div>
                </label>
            </div>

            <div id="paypal-button-container"></div>
            <div id="paddle-checkout-container" style="display:none;min-height:420px;"></div>

            <p style="font-size:.72rem;color:#64748b;margin-top:8px;text-align:center;">
                PayPal: Visa / Mastercard / saldo PayPal. Paddle: Apple Pay, Google Pay, tarjeta.
            </p>
        </div>`;

        // Cambio de pasarela internacional
        container.querySelectorAll('input[name="gw-intl"]').forEach(r => {
            r.addEventListener('change', () => {
                const ppBox  = container.querySelector('#paypal-button-container');
                const pdBox  = container.querySelector('#paddle-checkout-container');
                if (r.value === 'paypal') {
                    ppBox.style.display = ''; pdBox.style.display = 'none';
                    if (onSelect) onSelect('paypal', { total: totalFinalUSD, recargoAmt: recargoUSD, moneda: 'USD' });
                } else {
                    ppBox.style.display = 'none'; pdBox.style.display = '';
                    if (onSelect) onSelect('paddle', { total: totalPaddleUSD, recargoAmt: recargoPaddleUSD, moneda: 'USD' });
                }
            });
        });

        if (onSelect) onSelect('paypal', {
            total:     totalFinalUSD,
            recargoAmt: recargoUSD,
            moneda:    'USD'
        });
    } else {
        // Colombia: flujo normal con Wompi + Transferencia
        renderSelectorPasarelas(containerId, precioBase, (pasarela, info) => {
            if (onSelect) onSelect(pasarela, { ...info, moneda: 'COP' });
        });
    }
}

if (typeof module !== 'undefined') {
    module.exports = {
        PAGOS_CONFIG, calcularConPasarela, pasarelaPrioritaria,
        abrirCheckoutWompi, abrirCheckoutPayPal, abrirCheckoutPaddle,
        renderSelectorPasarelas, inicializarPasarelas,
        detectarPais, verificarPrecioServidor, formatDivisa
    };
}
