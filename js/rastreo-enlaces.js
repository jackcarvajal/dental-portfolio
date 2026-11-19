/* Rastreo de la página de enlaces (/links), estilo Beacons — datos propios, sin cookies.
 *  - Visita: un 'page_view' por pestaña con metadata.fuente (de ?src= / ?utm_source= o del sitio de origen).
 *    Así /links?src=instagram (bio) y /links?src=tarjeta (QR) se cuentan aparte.
 *  - Clic: 'links_click' con el botón tocado y a dónde va.
 * Va a analytics_events por /api/track-event. Se lee en app/editar-links.html → «Rastreo de enlaces».
 * Uso: <script src="js/rastreo-enlaces.js?v=…" data-negocio="prodigy" defer></script>
 * Gemelo idéntico en alejandro-carvajal-site/js/rastreo-enlaces.js (cambia solo data-negocio en el HTML). */
(function () {
  var s = document.currentScript;
  var NEG = (s && s.getAttribute('data-negocio')) || 'prodigy';
  var PAG = (location.pathname.replace(/\.html$/, '').replace(/\/$/, '')) || '/';

  function limpia(f) {
    return String(f || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  }
  function fuente() {
    try {
      var q = new URLSearchParams(location.search);
      var f = limpia(q.get('src') || q.get('utm_source') || q.get('f'));
      if (f) return f;
    } catch (e) {}
    var r = document.referrer || '';
    if (!r) return 'directo';
    var h = '';
    try { h = new URL(r).hostname.toLowerCase(); } catch (e) { return 'otro'; }
    if (h === location.hostname) return 'web';
    if (/instagram/.test(h)) return 'instagram';
    if (/facebook|^fb\.|messenger/.test(h)) return 'facebook';
    if (/tiktok/.test(h)) return 'tiktok';
    if (/(^|\.)google\./.test(h)) return 'google';
    if (/youtube|youtu\.be/.test(h)) return 'youtube';
    if (/linkedin|lnkd\.in/.test(h)) return 'linkedin';
    if (/whatsapp|wa\.me/.test(h)) return 'whatsapp';
    return limpia(h.replace(/^www\./, '')) || 'otro';
  }
  var F = fuente();

  function enviar(evento, meta) {
    var body = JSON.stringify({ evento: evento, pagina: PAG, negocio: NEG, metadata: meta });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon('/api/track-event', new Blob([body], { type: 'text/plain;charset=UTF-8' }))) return;
    } catch (e) {}
    try { fetch('/api/track-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }); } catch (e) {}
  }

  // Una visita por pestaña: recargar no infla la cifra.
  var yaVino = false;
  try { yaVino = sessionStorage.getItem('rastreo_v_' + PAG) === '1'; sessionStorage.setItem('rastreo_v_' + PAG, '1'); } catch (e) {}
  if (!yaVino) {
    var meta = { fuente: F };
    if (document.referrer) meta.referrer = document.referrer.slice(0, 200);
    enviar('page_view', meta);
  }

  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest && ev.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#' || /^javascript:/i.test(href)) return;
    var destino;
    if (/^data:text\/vcard/i.test(href)) destino = 'guardar-contacto';
    else {
      try {
        var u = new URL(href, location.href);
        var host = u.hostname.replace(/^www\./, '');
        if (host === 'wa.me' || host === 'api.whatsapp.com') destino = 'whatsapp';
        else if (u.hostname === location.hostname) destino = u.pathname.replace(/\.html$/, '') || '/';
        else destino = host + (u.pathname === '/' ? '' : u.pathname);
      } catch (e) { destino = href.slice(0, 80); }
    }
    var txt = (a.getAttribute('aria-label') || a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    enviar('links_click', { boton: txt || destino, destino: String(destino).slice(0, 120), fuente: F });
  }, { capture: true, passive: true });
})();
