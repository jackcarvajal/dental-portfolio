/**
 * PRODIGY Analytics Bridge v1.0
 * ─────────────────────────────────────────────────────────────
 * Captura eventos de comportamiento para inteligencia de ventas.
 * NO requiere GA ni cookies adicionales — usa Supabase + localStorage.
 *
 * Eventos:
 *  calculator_engagement  → material/servicio cambiado en cotizador
 *  file_validation_success → STL válido subido
 *  checkout_abandoned      → checkout abierto pero no completado
 *  audio_interaction       → sonido activado/desactivado
 *  article_read_complete   → llegó al 80% del artículo
 *  payment_intent          → antes de abrir Wompi/PayPal/Paddle
 *  payment_success         → pago confirmado
 */
'use strict';

window.ProdigyAnalytics = (function() {

  /* ── CONFIG ─────────────────────────────────────────────── */
  var SB_URL  = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
  var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhyd3FmeXZneWFwYnd6a3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzczNDksImV4cCI6MjA5MDg1MzM0OX0.9CzmFDQYeQKcbtAZoT1_n_OuJ1qPVJu3jImd938T634';
  var _queue  = []; // buffer si Supabase no está listo
  var _sid    = _getOrCreateSession();

  /* ── SESSION ID ─────────────────────────────────────────── */
  function _getOrCreateSession() {
    var k = 'pg_sid';
    var s = sessionStorage.getItem(k);
    if (!s) { s = Date.now().toString(36) + Math.random().toString(36).slice(2, 7); sessionStorage.setItem(k, s); }
    return s;
  }

  /* ── TRACK ──────────────────────────────────────────────── */
  function track(event, props) {
    var payload = {
      event:      event,
      session_id: _sid,
      page:       window.location.pathname,
      ts:         new Date().toISOString(),
      props:      props || {}
    };

    // 1. localStorage inmediato (no se pierde si falla red)
    try {
      var log = JSON.parse(localStorage.getItem('pg_events') || '[]');
      log.push(payload);
      if (log.length > 100) log = log.slice(-100);
      localStorage.setItem('pg_events', JSON.stringify(log));
    } catch(_) {}

    // 2. Supabase async (best-effort, no bloquea UI)
    _sendToSupabase(payload);
  }

  function _sendToSupabaseBeacon(payload) {
    // navigator.sendBeacon → funciona en beforeunload, no necesita respuesta
    if (navigator.sendBeacon) {
      var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(SB_URL + '/rest/v1/analytics_events?apikey=' + SB_ANON, blob);
    } else {
      _sendToSupabase(payload);
    }
  }

  function _sendToSupabase(payload) {
    fetch(SB_URL + '/rest/v1/analytics_events', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SB_ANON,
        'Authorization': 'Bearer ' + SB_ANON,
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify(payload)
    }).catch(function() {
      // Silencioso — el evento ya está en localStorage
    });
  }

  /* ── PAYMENT INTENT TRACKING ────────────────────────────── */
  var _intentKey = 'pg_payment_intent';

  function trackPaymentIntent(pasarela, monto, referencia) {
    var intent = {
      pasarela:   pasarela,
      monto:      monto,
      referencia: referencia,
      ts:         new Date().toISOString(),
      completed:  false,
      session_id: _sid
    };
    localStorage.setItem(_intentKey, JSON.stringify(intent));
    track('payment_intent', { pasarela: pasarela, monto: monto, referencia: referencia });

    // Abandonamiento: sendBeacon en beforeunload (funciona al cerrar tab)
    window.addEventListener('beforeunload', function() {
      var d = JSON.parse(localStorage.getItem(_intentKey) || '{}');
      if (d && !d.completed) {
        var payload = { event:'checkout_abandoned', session_id:_sid, page:window.location.pathname, ts:new Date().toISOString(), props:{ pasarela:d.pasarela, monto:d.monto, referencia:d.referencia } };
        _sendToSupabaseBeacon(payload); // Beacon: garantiza envío en cierre de tab
        // Guardar en localStorage también
        var list = JSON.parse(localStorage.getItem('pg_abandonments') || '[]');
        list.push(d);
        if (list.length > 30) list = list.slice(-30);
        localStorage.setItem('pg_abandonments', JSON.stringify(list));
      }
    });
  }

  function markPaymentSuccess(pasarela, referencia) {
    var d = JSON.parse(localStorage.getItem(_intentKey) || '{}');
    if (d) { d.completed = true; localStorage.setItem(_intentKey, JSON.stringify(d)); }
    localStorage.removeItem(_intentKey);
    track('payment_success', { pasarela: pasarela, referencia: referencia });
    // Disparar audio de éxito
    if (window.ProdigyAudio && ProdigyAudio.success) ProdigyAudio.success();
  }

  /* ── CALCULADORA ENGAGEMENT ─────────────────────────────── */
  function initCalculadoraTracking() {
    // Escuchar cambios de servicio/material con debounce
    var _debounce = null;
    function onCalcChange(tipo, valor) {
      clearTimeout(_debounce);
      _debounce = setTimeout(function() {
        track('calculator_engagement', { tipo: tipo, valor: valor });
      }, 800);
    }

    // Hook en selServicio global
    var orig_selServicio = window.selServicio;
    if (orig_selServicio) {
      window.selServicio = function(btn) {
        orig_selServicio(btn);
        onCalcChange('servicio', btn ? btn.dataset.key : '');
      };
    }

    // Hook en selMaterial global
    var orig_selMaterial = window.selMaterial;
    if (orig_selMaterial) {
      window.selMaterial = function(btn) {
        orig_selMaterial(btn);
        onCalcChange('material', btn ? btn.dataset.mat : '');
      };
    }

    // También: qty changes
    document.addEventListener('click', function(e) {
      if (e.target && e.target.closest && e.target.closest('.qty-btn')) {
        var num = document.getElementById('qtyNum');
        if (num) onCalcChange('cantidad', num.textContent);
      }
    });
  }

  /* ── FILE VALIDATION SUCCESS ────────────────────────────── */
  function trackFileSuccess(fileName, fileSizeMB) {
    track('file_validation_success', {
      nombre: fileName,
      size_mb: Math.round(fileSizeMB * 10) / 10,
      ext: fileName.split('.').pop().toLowerCase()
    });
    if (window.ProdigyUtils) ProdigyUtils.audioFeedbackForFile(fileSizeMB * 1024 * 1024);
    if (window.ProdigyConversions) ProdigyConversions.trackSTLUpload(fileName, fileSizeMB);
  }

  /* ── AUDIO INTERACTION ──────────────────────────────────── */
  function trackAudioToggle(estado) {
    track('audio_interaction', { estado: estado }); // 'on' | 'off'
  }

  /* ── ARTICLE READ COMPLETE ──────────────────────────────── */
  function initArticleTracking(articleId) {
    if (!articleId || !('IntersectionObserver' in window)) return;
    var tracked = false;
    var sentinel = document.querySelector('.refs-section, .faq-section, footer');
    if (!sentinel) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting && !tracked) {
          tracked = true;
          track('article_read_complete', { article_id: articleId });
          obs.disconnect();
        }
      });
    }, { threshold: 0.5 });
    obs.observe(sentinel);
  }

  /* ── DASHBOARD DE RECUPERACIÓN ──────────────────────────── */
  // Recuperar abandonamientos para admin
  function getAbandonments() {
    return JSON.parse(localStorage.getItem('pg_abandonments') || '[]');
  }

  function getLocalEvents(limit) {
    var evts = JSON.parse(localStorage.getItem('pg_events') || '[]');
    return evts.slice(-(limit || 50));
  }

  /* ── AUTO-INIT ──────────────────────────────────────────── */
  // Track pageview
  track('pageview', { referrer: document.referrer || '' });

  // Calculadora auto-init (si la página tiene selServicio)
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof selServicio !== 'undefined' || document.querySelector('.servicio-btn')) {
      setTimeout(initCalculadoraTracking, 500);
    }
    // Article tracking
    var urlParams = new URLSearchParams(window.location.search);
    var artId = urlParams.get('id');
    if (artId && window.location.pathname.includes('article')) {
      initArticleTracking(artId);
    }
  });

  // Exponer API pública
  return {
    track:              track,
    trackPaymentIntent: trackPaymentIntent,
    markPaymentSuccess: markPaymentSuccess,
    trackFileSuccess:   trackFileSuccess,
    trackAudioToggle:   trackAudioToggle,
    initArticleTracking: initArticleTracking,
    getAbandonments:    getAbandonments,
    getLocalEvents:     getLocalEvents
  };

})();
