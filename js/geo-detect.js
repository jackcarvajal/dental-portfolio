/**
 * PRODIGY Geo-Detect v1.0
 * ─────────────────────────────────────────────────────────────────────
 * Detecta la ubicación del visitante por IP y:
 *  - Colombia → muestra precios en COP, contenido en español
 *  - Exterior → muestra precios en USD, ofrece versión en inglés
 *
 * Uso: <script src="js/geo-detect.js" defer></script>
 * Expone: window.ProdigyGeo.pais, .esColombia, .esMexico, .moneda
 *
 * Sin cookies. Sin bloqueos. Detección silenciosa best-effort.
 */
'use strict';

window.ProdigyGeo = (function () {

  var _data  = null;
  var _ready = false;
  var _cbs   = [];

  function onReady(cb) {
    if (_ready) { cb(_data); return; }
    _cbs.push(cb);
  }

  function _resolve(d) {
    _data  = d;
    _ready = true;
    _cbs.forEach(function(cb){ try { cb(d); } catch(_){} });
    _cbs = [];
  }

  /* Intenta ipapi.co (gratis, sin key para <1000 req/día) */
  function _detect() {
    // Primero revisa sessionStorage para no hacer dos requests
    try {
      var cached = sessionStorage.getItem('pg_geo');
      if (cached) { _resolve(JSON.parse(cached)); return; }
    } catch(_) {}

    fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
      .then(function(r){ return r.json(); })
      .then(function(d) {
        var result = {
          pais:       d.country_code || 'XX',
          ciudad:     d.city || '',
          moneda:     d.currency || 'USD',
          esColombia: d.country_code === 'CO',
          esMexico:   d.country_code === 'MX',
          esLatam:    ['CO','MX','AR','CL','PE','EC','PA','CR','VE','UY','BO','PY','GT','HN','SV','NI','DO','CU','PR'].includes(d.country_code),
          esEuropa:   ['ES','PT','DE','IT','FR','GB','NL','BE','CH','AT','SE','DK','NO','FI','PL','CZ','HU'].includes(d.country_code)
        };
        try { sessionStorage.setItem('pg_geo', JSON.stringify(result)); } catch(_) {}
        _resolve(result);
      })
      .catch(function() {
        // Fallback: Colombia por defecto si falla la detección
        _resolve({ pais:'CO', moneda:'COP', esColombia:true, esMexico:false, esLatam:true, esEuropa:false });
      });
  }

  /* ── EFECTOS AUTOMÁTICOS ──────────────────────────────────────────── */

  function _applyBanner(geo) {
    // Solo en páginas de diseño/landing: ofrecer versión inglés si es exterior
    var isLanding = window.location.pathname.includes('diseno-remoto') ||
                    window.location.pathname === '/' ||
                    window.location.pathname.includes('global-design');
    if (!isLanding || geo.esColombia || geo.esMexico) return;

    // Crear banner suave "View in English"
    var banner = document.createElement('div');
    banner.id = 'geo-lang-banner';
    banner.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:999;background:rgba(13,21,37,.97);border:1px solid rgba(0,210,255,.3);border-radius:12px;padding:12px 18px;display:flex;align-items:center;gap:12px;font-family:-apple-system,sans-serif;font-size:.82rem;color:#e2e8f0;box-shadow:0 8px 32px rgba(0,0,0,.5);white-space:nowrap;';
    banner.innerHTML = '<span style="font-size:1.1rem;">🌍</span>' +
      '<span>We detected you\'re outside Colombia.</span>' +
      '<a href="/en/global-design" style="background:linear-gradient(135deg,#D946A6,#9333ea);color:#fff;text-decoration:none;padding:6px 14px;border-radius:8px;font-weight:700;font-size:.78rem;">View in English →</a>' +
      '<button onclick="document.getElementById(\'geo-lang-banner\').remove();sessionStorage.setItem(\'geo_dismissed\',\'1\')" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:1rem;padding:0 4px;">✕</button>';

    if (sessionStorage.getItem('geo_dismissed')) return;
    document.body.appendChild(banner);
    setTimeout(function(){ if (banner.parentNode) banner.remove(); }, 8000);
  }

  function _applyPricing(geo) {
    // Elementos con data-price-cop y data-price-usd: mostrar según geo
    document.querySelectorAll('[data-price-cop][data-price-usd]').forEach(function(el) {
      var val = geo.esColombia || geo.esLatam ? el.dataset.priceCop : el.dataset.priceUsd;
      var sym = geo.esColombia || geo.esLatam ? 'COP' : 'USD';
      if (val) el.textContent = (geo.esColombia || geo.esLatam ? '$' : '$') + val + ' ' + sym;
    });
  }

  /* ── INIT ──────────────────────────────────────────────────────────── */
  _detect();

  document.addEventListener('DOMContentLoaded', function () {
    onReady(function(geo) {
      _applyBanner(geo);
      _applyPricing(geo);
      // Exponer en dataLayer para GA4
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'geo_detected', geo_country: geo.pais, geo_currency: geo.moneda });
    });
  });

  return { onReady: onReady, get: function(){ return _data; } };

})();
