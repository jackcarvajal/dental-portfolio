/**
 * PRODIGY — Generador QR de Trazabilidad v1.0
 * Etiquetas 50×25 mm para Xprinter 365B (ZPL/EPL via ventana de impresión)
 * Librería: QRCode.js (cargada automáticamente via CDN si no está)
 */

const QR_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';

/* ── Asegurar que QRCode.js esté cargado ── */
function _cargarQRLib() {
    return new Promise((resolve, reject) => {
        if (window.QRCode) { resolve(); return; }
        const s = document.createElement('script');
        s.src     = QR_CDN;
        s.onload  = resolve;
        s.onerror = () => reject(new Error('No se pudo cargar QRCode.js'));
        document.head.appendChild(s);
    });
}

/* ── Construir payload del QR ── */
function _buildPayload(pedido) {
    return JSON.stringify({
        id:       pedido.id       || '',
        codigo:   pedido.codigo   || '',
        tipo:     pedido.tipo_trabajo || '',
        material: pedido.material || '',
        pieza:    pedido.pieza    || '',
        fecha:    new Date(pedido.created_at || Date.now()).toLocaleDateString('es-CO')
    });
}

/* ── Generar imagen QR (base64 PNG) ── */
async function generarQRBase64(pedido) {
    await _cargarQRLib();

    return new Promise((resolve) => {
        const div = document.createElement('div');
        div.style.cssText = 'position:fixed;left:-9999px;top:0;';
        document.body.appendChild(div);

        new QRCode(div, {
            text:           _buildPayload(pedido),
            width:          256,
            height:         256,
            colorDark:      '#000000',
            colorLight:     '#ffffff',
            correctLevel:   QRCode.CorrectLevel.M
        });

        // QRCode.js es síncrono pero usa requestAnimationFrame internamente
        setTimeout(() => {
            const canvas  = div.querySelector('canvas');
            const dataUrl = canvas ? canvas.toDataURL('image/png') : null;
            document.body.removeChild(div);
            resolve(dataUrl);
        }, 80);
    });
}

/* ── HTML de etiqueta 50×25 mm ── */
function _htmlEtiqueta(pedido, qrDataUrl) {
    const fecha = new Date(pedido.created_at || Date.now()).toLocaleDateString('es-CO');
    return `
    <div class="qr-etiqueta" data-pedido="${pedido.id}">
        <img src="${qrDataUrl}" alt="QR ${pedido.codigo}" class="qr-img">
        <div class="qr-datos">
            <div class="qr-codigo">${pedido.codigo || 'PRD-?'}</div>
            <div class="qr-linea">${pedido.tipo_trabajo || ''}</div>
            <div class="qr-linea">${pedido.material || ''}</div>
            <div class="qr-linea">${pedido.pieza || ''}</div>
            <div class="qr-fecha">${fecha}</div>
        </div>
    </div>`;
}

/* ── Mostrar etiqueta en la página ── */
async function mostrarQR(containerId, pedido) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<span style="color:#94a3b8;font-size:12px;">Generando QR…</span>';

    try {
        const qrDataUrl = await generarQRBase64(pedido);

        _inyectarCSS();
        container.innerHTML = `
            ${_htmlEtiqueta(pedido, qrDataUrl)}
            <div class="qr-acciones">
                <button onclick="imprimirEtiqueta('${containerId}')" class="qr-btn-imprimir">
                    🖨️ Imprimir (Xprinter 365B)
                </button>
                <a href="${qrDataUrl}" download="QR_${pedido.codigo}.png" class="qr-btn-descargar">
                    ⬇️ Descargar PNG
                </a>
            </div>`;
    } catch (e) {
        container.innerHTML = `<span style="color:#f87171;">Error generando QR: ${e.message}</span>`;
    }
}

/* ── Imprimir etiqueta 50×25 mm en Xprinter 365B ── */
function imprimirEtiqueta(containerId) {
    const etiqueta = document.getElementById(containerId)?.querySelector('.qr-etiqueta');
    if (!etiqueta) { alert('Etiqueta no encontrada. Genera el QR primero.'); return; }

    const win = window.open('', '_blank', 'width=400,height=300');
    win.document.write(`<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<style>
  @page  { size: 50mm 25mm; margin: 0; }
  body   { margin: 0; padding: 0; background: #fff; }
  .qr-etiqueta {
      width: 50mm; height: 25mm;
      display: flex; align-items: center; gap: 2mm;
      padding: 1.5mm; box-sizing: border-box;
      font-family: 'Courier New', monospace;
  }
  .qr-img   { width: 21mm; height: 21mm; }
  .qr-datos { font-size: 5.5pt; line-height: 1.35; color: #000; }
  .qr-codigo { font-weight: bold; font-size: 7pt; }
  .qr-linea  { }
  .qr-fecha  { margin-top: 1.5mm; font-size: 5pt; color: #444; }
</style>
</head><body>${etiqueta.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 600);
}

/* ── Guardar QR base64 en la tabla pedidos (Supabase) ── */
async function guardarQREnPedido(pedidoId, qrDataUrl) {
    if (!window.getSupabase) return;
    const sb = getSupabase();
    if (!sb) return;

    await sb.from('pedidos').update({ qr_code: qrDataUrl }).eq('id', pedidoId);
}

/* ── Generar + mostrar + guardar (flujo completo) ── */
async function generarYGuardarQR(containerId, pedido) {
    const qrDataUrl = await generarQRBase64(pedido);
    await guardarQREnPedido(pedido.id, qrDataUrl);
    await mostrarQR(containerId, pedido);
    return qrDataUrl;
}

/* ── CSS embebido ── */
function _inyectarCSS() {
    if (document.getElementById('prodigy-qr-css')) return;
    const s = document.createElement('style');
    s.id = 'prodigy-qr-css';
    s.textContent = `
        .qr-etiqueta {
            display: flex; align-items: center; gap: 10px;
            border: 1.5px solid #333; border-radius: 8px;
            padding: 8px 12px; background: #fff;
            width: fit-content; font-family: monospace;
        }
        .qr-img    { width: 80px; height: 80px; }
        .qr-datos  { font-size: 11px; line-height: 1.5; color: #111; }
        .qr-codigo { font-weight: 800; font-size: 13px; }
        .qr-linea  { color: #444; }
        .qr-fecha  { font-size: 9px; color: #888; margin-top: 4px; }
        .qr-acciones { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
        .qr-btn-imprimir, .qr-btn-descargar {
            padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer;
            font-size: 13px; font-weight: 700; text-decoration: none;
            display: inline-flex; align-items: center; gap: 6px;
        }
        .qr-btn-imprimir  { background: #D4AF37; color: #000; }
        .qr-btn-descargar { background: rgba(212,175,55,0.15); color: #D4AF37; border: 1px solid #D4AF37; }
        .qr-btn-imprimir:hover  { background: #c9a227; }
        .qr-btn-descargar:hover { background: rgba(212,175,55,0.25); }
    `;
    document.head.appendChild(s);
}

if (typeof module !== 'undefined') {
    module.exports = { generarQRBase64, mostrarQR, imprimirEtiqueta, guardarQREnPedido, generarYGuardarQR };
}
