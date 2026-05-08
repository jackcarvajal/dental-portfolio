/**
 * PRODIGY Conversion Tracking v1.0
 * ────────────────────────────────────────────────────────────────────
 * Trackea conversiones para Google Ads + GA4 + Meta Pixel
 *
 * Eventos principales:
 *  whatsapp_click   → cualquier enlace wa.me (valor estimado $0)
 *  stl_upload       → archivo STL subido exitosamente (valor $30.000 COP)
 *  cotizacion_sent  → formulario cotización enviado (valor $15.000 COP)
 *  lead_qualified   → click en "videollamada técnica" (valor $50.000 COP)
 *
 * Para Google Ads: reemplaza AW-XXXXXXXXX/YYYYYYYYYY con tu ID real
 * (Settings → Conversions en ads.google.com)
 * Para Meta Pixel: reemplaza TU_PIXEL_ID con el ID de tu Business Manager
 */
'use strict';

window.ProdigyConversions = (function () {

  /* ── CONFIG — completar con IDs reales ─────────────────────── */
  var GA4_ID     = 'G-3N0ZZE5V10';
  var GADS_ID    = 'AW-XXXXXXXXX';   // ← Alejandro: reemplazar con ID real de Google Ads
  var META_PIXEL = '1254573606759925';

  /* ── META PIXEL (cargar si hay consentimiento) ─────────────── */
  function _loadMetaPixel() {
    if (document.getElementById('fb-pixel-script')) return;
    if (typeof META_PIXEL === 'string' && META_PIXEL.startsWith('TU_')) return; // placeholder
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.id='fb-pixel-script';t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL);
    window.fbq('track', 'PageView');
  }

  /* ── GA4 + GADS EVENT ───────────────────────────────────────── */
  function _gtag() {
    if (window.gtag) window.gtag.apply(window, arguments);
    if (!window.dataLayer) window.dataLayer = [];
    window.dataLayer.push(arguments);
  }

  function _sendGA4(eventName, params) {
    _gtag('event', eventName, Object.assign({
      send_to: GA4_ID
    }, params || {}));
  }

  function _sendGAds(conversionLabel, value) {
    if (!GADS_ID || GADS_ID.includes('XXXXXXXXX')) return;
    _gtag('event', 'conversion', {
      send_to:        GADS_ID + '/' + conversionLabel,
      value:          value || 0,
      currency:       'COP',
      transaction_id: Date.now().toString(36)
    });
  }

  function _sendMeta(eventName, params) {
    if (window.fbq) window.fbq('track', eventName, params || {});
  }

  /* ── CONVERSIONES PÚBLICAS ──────────────────────────────────── */
  function trackWhatsAppClick(source) {
    var utm = window.ProdigyUTM ? ProdigyUTM.get() : {};
    _sendGA4('whatsapp_click', {
      event_category: 'engagement',
      event_label:    source || window.location.pathname,
      utm_source:     utm.source || 'directo',
      utm_campaign:   utm.campaign || ''
    });
    _sendGAds('WA_CLICK_LABEL', 0);       // ← reemplazar con label real de Google Ads
    _sendMeta('Contact', { content_name: 'WhatsApp' });
  }

  function trackSTLUpload(fileName, sizeMB) {
    _sendGA4('stl_upload', {
      event_category: 'lead',
      event_label:    fileName || 'archivo',
      value:          30000,
      currency:       'COP'
    });
    _sendGAds('STL_UPLOAD_LABEL', 30000); // ← reemplazar con label real
    _sendMeta('Lead', { content_name: 'STL Upload', value: 30000, currency: 'COP' });
    if (window.ProdigyUTM) ProdigyUTM.saveLeadSource({ tipo: 'stl_upload', archivo: fileName });
  }

  function trackCotizacionSent(servicio, monto) {
    _sendGA4('generate_lead', {
      event_category: 'lead',
      event_label:    servicio || 'cotizacion',
      value:          monto || 15000,
      currency:       'COP'
    });
    _sendGAds('COTI_LABEL', monto || 15000);
    _sendMeta('Lead', { content_name: 'Cotizacion', value: monto || 15000, currency: 'COP' });
    if (window.ProdigyUTM) ProdigyUTM.saveLeadSource({ tipo: 'cotizacion', servicio: servicio });
  }

  function trackLeadQualified(accion) {
    _sendGA4('lead_qualified', {
      event_category: 'conversion',
      event_label:    accion || 'videollamada',
      value:          50000,
      currency:       'COP'
    });
    _sendGAds('LEAD_LABEL', 50000);
    _sendMeta('Schedule', { content_name: accion });
    if (window.ProdigyUTM) ProdigyUTM.saveLeadSource({ tipo: 'lead_qualified', accion: accion });
  }

  /* ── AUTO-TRACKING WHATSAPP CLICKS ─────────────────────────── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    if (!a.href || (!a.href.includes('wa.me') && !a.href.includes('whatsapp.com'))) return;

    // Detectar contexto del botón para saber DESDE QUÉ parte de la página
    var page   = window.location.pathname.replace(/\//g,'') || 'home';
    var label  = a.dataset.source
              || a.getAttribute('aria-label')
              || a.closest('[data-section]')?.dataset.section
              || a.closest('section')?.querySelector('h2,h3')?.textContent?.trim()?.slice(0,30)
              || a.textContent?.trim()?.slice(0,30)
              || 'boton';

    trackWhatsAppClick(page + ' | ' + label);

    // Guardar último click WA en localStorage para correlacionar con visitas futuras
    try {
      localStorage.setItem('prodigy_last_wa', JSON.stringify({
        page: page, label: label, ts: Date.now()
      }));
    } catch(e) {}
  });

  /* ── AUTO-TRACKING EMBUDO DE FORMULARIO ─────────────────────
     Mide abandono: quién llegó → quién empezó → quién completó
  ────────────────────────────────────────────────────────────── */
  var _formStarted = false;
  var _fileSelected = false;

  // 1. form_start — primer campo tocado en páginas de conversión
  document.addEventListener('focusin', function(e) {
    if (_formStarted) return;
    var tag = e.target.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') return;
    var page = window.location.pathname;
    if (!page.match(/envia-tu-scanner|flujo-diseno|flujo-fresado|flujo-impresion|flujo-lab/)) return;
    _formStarted = true;
    _sendGA4('form_start', {
      event_category: 'funnel',
      event_label: page,
      page_title: document.title
    });
    _sendMeta('InitiateCheckout', { content_name: 'form_start' });
  });

  // 2. file_selected — archivo elegido antes de enviarlo
  document.addEventListener('change', function(e) {
    if (e.target.type !== 'file') return;
    if (_fileSelected) return;
    _fileSelected = true;
    var files = e.target.files;
    var name = files && files[0] ? files[0].name : 'desconocido';
    _sendGA4('file_selected', {
      event_category: 'funnel',
      event_label: name,
      file_type: name.split('.').pop().toLowerCase()
    });
    _sendMeta('AddToCart', { content_name: 'file_selected', content_ids: [name] });
  });

  // 3. calculator_interacted — usuario hizo click en servicio de calculadora
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[onclick*="selSrv"], .srv-btn, [data-key]');
    if (!btn) return;
    var key = btn.dataset.key || btn.getAttribute('onclick') || '';
    _sendGA4('calculator_interacted', {
      event_category: 'engagement',
      event_label: key,
      page_title: document.title
    });
  });

  // 4. form_abandoned — salió con formulario iniciado pero sin completar
  window.addEventListener('beforeunload', function() {
    if (!_formStarted) return;
    var submitted = sessionStorage.getItem('prodigy_form_ok');
    if (submitted) return;
    _sendGA4('form_abandoned', {
      event_category: 'funnel',
      event_label: window.location.pathname,
      transport_type: 'beacon'
    });
  });

  /* ── CARGAR META PIXEL CUANDO HAY CONSENTIMIENTO ────────────── */
  if (localStorage.getItem('prodigy_cookies_ok') === '1') _loadMetaPixel();
  document.addEventListener('prodigy_consent_granted', _loadMetaPixel);

  function trackFormSubmitOk() {
    sessionStorage.setItem('prodigy_form_ok', '1');
  }

  return {
    trackWhatsAppClick:   trackWhatsAppClick,
    trackSTLUpload:       trackSTLUpload,
    trackCotizacionSent:  trackCotizacionSent,
    trackLeadQualified:   trackLeadQualified,
    trackFormSubmitOk:    trackFormSubmitOk
  };

})();
