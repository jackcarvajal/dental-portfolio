/**
 * PRODIGY — Content Protection
 * Protege imágenes, videos, PDFs y visores del portafolio.
 * No puede bloquear capturas de pantalla del SO — eso es limitación del navegador.
 */
(function () {
  'use strict';

  /* ── 1. DESHABILITAR CLIC DERECHO en contenido protegido ── */
  document.addEventListener('contextmenu', function (e) {
    var protectedEl = e.target.closest(
      '.gallery-item, .viewer-wrap, #lightbox, .lightbox, .card-img, .case-card .card-img, video, iframe'
    );
    if (protectedEl) {
      e.preventDefault();
      showProtectionToast();
      return false;
    }
  });

  /* ── 2. BLOQUEAR TECLAS DE DESCARGA / DEVTOOLS ── */
  document.addEventListener('keydown', function (e) {
    const c = e.ctrlKey || e.metaKey;
    // Ctrl+S (guardar), Ctrl+U (ver fuente), Ctrl+P (imprimir/guardar PDF), Ctrl+Shift+I/J/C (devtools)
    if (c && ['s', 'u', 'p'].includes(e.key.toLowerCase())) {
      e.preventDefault(); return false;
    }
    if (e.key === 'F12') {
      e.preventDefault(); return false;
    }
    if (c && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
      e.preventDefault(); return false;
    }
    // PrintScreen — el SO maneja esto, no se puede bloquear desde el browser
  });

  /* ── 3. BLOQUEAR ARRASTRE DE IMÁGENES ── */
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG' || e.target.closest('.gallery-item, .card-img, #lightbox')) {
      e.preventDefault(); return false;
    }
  });

  /* ── 4. CSS DE PROTECCIÓN ── */
  var style = document.createElement('style');
  style.textContent = [
    /* Imágenes no arrastrables ni seleccionables */
    '.gallery-item img,.card-img img,.cover-img,#lb-img{',
      '-webkit-user-drag:none;user-drag:none;',
      '-webkit-user-select:none;user-select:none;',
      'pointer-events:none;',
    '}',
    /* Contenedor captura clics, no la imagen */
    '.gallery-item,.card-img,.lightbox{',
      '-webkit-user-select:none;user-select:none;',
    '}',
    /* Overlay protector en lightbox — div encima de la imagen */
    '.lb-protect{',
      'position:fixed;inset:0;z-index:9998;',
      'pointer-events:none;',  /* deja pasar clics a botones nav pero bloquea drag */
    '}',
    /* Video sin descarga visual */
    'video::-webkit-media-controls-download-button{display:none!important;}',
    'video::-webkit-media-controls-enclosure{overflow:hidden;}',
    /* PDF iframe: ocultar barra si el navegador la expone */
    '.pdf-wrap iframe{pointer-events:auto;}',
    '.pdf-overlay{',
      'position:absolute;top:0;right:0;width:48px;height:100%;',
      'z-index:10;background:transparent;cursor:default;',
    '}'
  ].join('');
  document.head.appendChild(style);

  /* ── 5. OVERLAY EN LIGHTBOX ── */
  function addLightboxOverlay() {
    const lb = document.getElementById('lightbox');
    if (!lb || lb.querySelector('.lb-protect')) return;
    const ov = document.createElement('div');
    ov.className = 'lb-protect';
    lb.appendChild(ov);
  }

  /* ── 6. TOAST DE PROTECCIÓN ── */
  var toastTimer;
  function showProtectionToast() {
    var t = document.getElementById('prot-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'prot-toast';
      t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
        'background:#0d1520;border:1px solid rgba(212,175,55,.4);color:#D4AF37;' +
        'font-size:.78rem;font-weight:700;padding:10px 20px;border-radius:100px;' +
        'z-index:99999;pointer-events:none;opacity:0;transition:opacity .3s;white-space:nowrap;' +
        'font-family:system-ui,sans-serif;';
      t.textContent = '🔒 © PRODIGY — Contenido protegido';
      document.body.appendChild(t);
    }
    clearTimeout(toastTimer);
    t.style.opacity = '1';
    toastTimer = setTimeout(() => { t.style.opacity = '0'; }, 2000);
  }

  /* ── 7. APLICAR AL LIGHTBOX cuando se abra ── */
  document.addEventListener('click', function () {
    setTimeout(addLightboxOverlay, 100);
  });

  /* DevTools detection eliminado — causaba popup de permisos de portapapeles */

})();
