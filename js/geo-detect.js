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

  /* País desde Cloudflare (/api/geo): la IP no sale a terceros y no hay tope diario (antes ipapi.co) */
  function _detect() {
    // Primero revisa sessionStorage para no hacer dos requests
    try {
      var cached = sessionStorage.getItem('pg_geo');
      if (cached) { _resolve(JSON.parse(cached)); return; }
    } catch(_) {}

    fetch('/api/geo', { signal: AbortSignal.timeout(4000) })
      .then(function(r){ return r.json(); })
      .then(function(d) {
        var result = {
          pais:       d.country_code || 'XX',
          detectado: true,
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
        _resolve({ pais:'CO', moneda:'COP', detectado:false, esColombia:true, esMexico:false, esLatam:true, esEuropa:false });
      });
  }

  /* ── EFECTOS AUTOMÁTICOS ──────────────────────────────────────────── */

  function _applyBanner() {
    // Ofrecer inglés por IDIOMA del navegador (no por país): si NO está en español ni
    // portugués y no estamos ya en /en/, sugerir la versión en inglés de ESA página.
    var path = window.location.pathname;
    if (path.indexOf('/en/') === 0 || path === '/en') return;          // ya en inglés
    if (document.getElementById('pg-lang-banner')) return;             // sin duplicar
    var lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (/^(es|pt)/.test(lang)) return;                                 // español/portugués: no molestar
    try { if (localStorage.getItem('pg_lang_banner') === 'off') return; } catch (e) {}

    var cfg = window._IDIOMA_CFG || {};
    var key = path.replace(/\/+$/, '') || '/';
    var dest = (cfg.mapaEn && cfg.mapaEn[key]) || cfg.hubEn || '/en/'; // gemela EN o hub

    var banner = document.createElement('div');
    banner.id = 'pg-lang-banner';
    banner.style.cssText = 'position:fixed;bottom:84px;left:50%;transform:translateX(-50%);z-index:9999;max-width:calc(100vw - 24px);background:rgba(13,21,37,.97);border:1px solid rgba(0,210,255,.32);border-radius:12px;padding:11px 14px;display:flex;align-items:center;gap:11px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:.82rem;color:#e2e8f0;box-shadow:0 8px 32px rgba(0,0,0,.5);';
    banner.innerHTML =
      '<span style="font-size:1.1rem;">🌍</span>' +
      '<span>This site is also available in <b>English</b>.</span>' +
      '<a href="' + dest + '" style="background:linear-gradient(135deg,#00a7cc,#9333ea);color:#fff;text-decoration:none;padding:6px 13px;border-radius:8px;font-weight:700;font-size:.78rem;white-space:nowrap;">View in English &rarr;</a>' +
      '<button type="button" aria-label="Close" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:1rem;padding:0 2px;line-height:1;">&times;</button>';
    banner.querySelector('button').onclick = function () { banner.remove(); try { localStorage.setItem('pg_lang_banner', 'off'); } catch (e) {} };
    banner.querySelector('a').addEventListener('click', function () { try { localStorage.setItem('pg_lang_banner', 'off'); } catch (e) {} });
    document.body.appendChild(banner);
  }

  function _applyPricing(geo) {
    // Elementos con data-price-cop y data-price-usd: mostrar según geo
    document.querySelectorAll('[data-price-cop][data-price-usd]').forEach(function(el) {
      var val = geo.esColombia || geo.esLatam ? el.dataset.priceCop : el.dataset.priceUsd;
      var sym = geo.esColombia || geo.esLatam ? 'COP' : 'USD';
      if (val) el.textContent = (geo.esColombia || geo.esLatam ? '$' : '$') + val + ' ' + sym;
    });
  }

  /* ── GEO-GATE DE BLOQUES POR MERCADO ─────────────────────────────────
     Separa ofertas/precios/condiciones LOCAL vs INTERNACIONAL para que un
     mercado no vea el del otro. Convención en el HTML (ambos arrancan `hidden`,
     así NO hay parpadeo y si el JS falla no se filtra ninguno):
        <div data-geo="local" hidden> ... precios/ofertas Colombia+LATAM ... </div>
        <div data-geo="intl"  hidden> ... precios/ofertas exterior (USD) ... </div>
     "local" = Colombia + LATAM · "intl" = resto del mundo.
     OJO: es segmentación de cara al usuario (un local con VPN de USA o viendo el
     código fuente igual puede verlo). Para precios REALMENTE confidenciales van
     en el cotizador / tras login, no en HTML público. */
  function _applyGeoGates(geo) {
    var esLocal = geo.esColombia || geo.esLatam;
    document.querySelectorAll('[data-geo]').forEach(function(el) {
      var scope = el.getAttribute('data-geo');
      var show  = scope === 'local' ? esLocal : scope === 'intl' ? !esLocal : true;
      if (show) { el.hidden = false; el.removeAttribute('hidden'); el.style.display = ''; }
      else      { el.hidden = true;  el.style.display = 'none'; }
    });
    document.documentElement.setAttribute('data-geo-mercado', esLocal ? 'local' : 'intl');
  }

  /* ── INIT ──────────────────────────────────────────────────────────── */
  _detect();

  (function(_run){ if (document.readyState !== 'loading') _run(); else document.addEventListener('DOMContentLoaded', _run); })(function () {
    _applyBanner();                 // idioma del navegador — no depende del geo
    onReady(function(geo) {
      _applyPricing(geo);
      _applyGeoGates(geo);
      // Exponer en dataLayer para GA4
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'geo_detected', geo_country: geo.pais, geo_currency: geo.moneda });
    });
  });

  return { onReady: onReady, get: function(){ return _data; } };

})();
