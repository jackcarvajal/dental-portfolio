/**
 * PRODIGY UTM-Tracker System v1.0
 * ─────────────────────────────────────────────────────────────────────
 * 1. Captura parámetros UTM de la URL al aterrizar
 * 2. Los persiste en localStorage (sobrevive navegación entre páginas)
 * 3. Inyecta la fuente en TODOS los enlaces de WhatsApp dinámicamente
 * 4. Registra la fuente en Supabase cuando el usuario sube STL o envía form
 * 5. Expone ProdigyUTM.get() para que otros scripts lean la fuente
 *
 * Parámetros estándar soportados:
 *   utm_source   → google | instagram | tiktok | facebook | whatsapp | directo
 *   utm_medium   → cpc | organic | social | referral
 *   utm_campaign → nombre de la campaña de anuncios
 *   utm_content  → variante del anuncio (A/B)
 *   utm_term     → palabra clave (Google Ads)
 */
'use strict';

window.ProdigyUTM = (function () {

  var STORAGE_KEY = 'pg_utm';
  var SESSION_KEY = 'pg_utm_session';

  /* ── CAPTURA ─────────────────────────────────────────────────── */
  function _capture() {
    var p = new URLSearchParams(window.location.search);
    var source   = p.get('utm_source')   || p.get('ref') || '';
    var medium   = p.get('utm_medium')   || '';
    var campaign = p.get('utm_campaign') || '';
    var content  = p.get('utm_content')  || '';
    var term     = p.get('utm_term')     || '';
    var gclid    = p.get('gclid')        || ''; // Google Ads auto-tag
    var fbclid   = p.get('fbclid')       || ''; // Meta Ads auto-tag

    // Auto-detectar fuente por clid si no viene utm_source
    if (!source && gclid)  { source = 'google'; medium = medium || 'cpc'; }
    if (!source && fbclid) { source = 'facebook'; medium = medium || 'cpc'; }
    if (!source) { source = 'directo'; }

    var data = {
      source:    source,
      medium:    medium,
      campaign:  campaign,
      content:   content,
      term:      term,
      gclid:     gclid,
      fbclid:    fbclid,
      landing:   window.location.pathname,
      ts:        new Date().toISOString()
    };

    // Persistencia: si ya hay datos de primera visita, no sobreescribir
    // Solo actualizar si viene de anuncio (tiene utm o clid)
    var hasAd = source !== 'directo' || gclid || fbclid;
    var existing = _load(STORAGE_KEY);
    if (hasAd || !existing) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(_) {}
    }
    // Session UTM siempre se actualiza (para la visita actual)
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch(_) {}

    return data;
  }

  function _load(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch(_) { return null; }
  }

  /* ── API PÚBLICA ─────────────────────────────────────────────── */
  function get() {
    return _load(STORAGE_KEY) || _load(SESSION_KEY) || { source: 'directo', medium: '', campaign: '' };
  }

  function getLabel() {
    var d = get();
    var parts = [d.source];
    if (d.campaign) parts.push(d.campaign);
    if (d.term)     parts.push(d.term);
    return parts.filter(Boolean).join(' › ');
  }

  /* ── WHATSAPP DINÁMICO ───────────────────────────────────────── */
  function _buildWaText(baseText, utm) {
    var label = utm.source !== 'directo' ? '\n[Ref: ' + utm.source +
      (utm.campaign ? '/' + utm.campaign : '') +
      (utm.term     ? ' KW:' + utm.term   : '') + ']' : '';
    return encodeURIComponent(decodeURIComponent(baseText) + label);
  }

  function _patchWaLinks() {
    var links = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com/send"]');
    var utm = get();
    if (utm.source === 'directo') return; // Solo enriquecer si viene de anuncio

    links.forEach(function (a) {
      try {
        var url = new URL(a.href);
        var text = url.searchParams.get('text') || '';
        if (text && !text.includes('[Ref:')) {
          url.searchParams.set('text', decodeURIComponent(_buildWaText(text, utm)));
          a.href = url.toString();
        }
      } catch(_) {}
    });
  }

  /* ── REGISTRO EN SUPABASE ────────────────────────────────────── */
  var _SB_URL  = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
  var _SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhyd3FmeXZneWFwYnd6a3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzczNDksImV4cCI6MjA5MDg1MzM0OX0.9CzmFDQYeQKcbtAZoT1_n_OuJ1qPVJu3jImd938T634';

  function saveLeadSource(extraData) {
    var utm = get();
    var payload = Object.assign({
      session_id: sessionStorage.getItem('pg_sid') || 'unknown',
      page:       window.location.pathname,
      ts:         new Date().toISOString()
    }, utm, extraData || {});

    fetch(_SB_URL + '/rest/v1/lead_sources', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        _SB_ANON,
        'Authorization': 'Bearer ' + _SB_ANON,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify(payload)
    }).catch(function() {});

    // También en ProdigyAnalytics si está cargado
    if (window.ProdigyAnalytics) {
      ProdigyAnalytics.track('lead_source', payload);
    }
  }

  /* ── INIT ────────────────────────────────────────────────────── */
  var _current = _capture();

  document.addEventListener('DOMContentLoaded', function () {
    _patchWaLinks();

    // Reparchear links dinámicos cada vez que el DOM cambia (SPA-friendly)
    if (window.MutationObserver) {
      new MutationObserver(function () { _patchWaLinks(); })
        .observe(document.body, { childList: true, subtree: true });
    }
  });

  // Exponer utm actual en dataLayer para Google Tag Manager
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'utm_captured', utm: _current });

  return {
    get:           get,
    getLabel:      getLabel,
    saveLeadSource: saveLeadSource,
    patchWaLinks:  _patchWaLinks
  };

})();
