/**
 * PRODIGY — Utilidades globales (Single Source of Truth)
 * Funciones compartidas entre calculadora, flujos y pagos.
 * Cargar con: <script src="js/prodigy-utils.js" defer></script>
 */
'use strict';

/* ── FORMATO DE MONEDA ─────────────────────────────────────────────
 * Única implementación COP en toda la web.
 * Uso: ProdigyUtils.fmtCOP(250000) → "$250.000 COP"
 */
window.ProdigyUtils = window.ProdigyUtils || {};

ProdigyUtils.fmtCOP = function(amount) {
  return '$' + Math.round(amount).toLocaleString('es-CO') + ' COP';
};

ProdigyUtils.fmtCOPShort = function(amount) {
  var n = Math.round(amount);
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M COP';
  if (n >= 1000)    return '$' + (n / 1000).toFixed(0) + 'K COP';
  return '$' + n.toLocaleString('es-CO') + ' COP';
};

/* ── ERROR BOUNDARY GLOBAL — Supabase + Network ────────────────────
 * Captura errores asíncronos y ofrece reintentos automáticos.
 * Muestra toast UI al usuario. Loggea en Supabase si está disponible.
 */
ProdigyUtils.ErrorBoundary = {
  _maxRetries: 3,
  _toastEl: null,

  _getToast: function() {
    if (this._toastEl) return this._toastEl;
    var t = document.getElementById('pg-global-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'pg-global-toast';
      t.style.cssText = [
        'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);',
        'background:#1a2332;border:1px solid rgba(255,255,255,0.15);',
        'color:#e2e8f0;padding:12px 22px;border-radius:10px;font-size:.9rem;',
        'z-index:99998;opacity:0;transition:opacity .3s;pointer-events:none;',
        'max-width:360px;text-align:center;font-family:Inter,sans-serif;'
      ].join('');
      document.body.appendChild(t);
    }
    this._toastEl = t;
    return t;
  },

  showToast: function(msg, type) {
    var t = this._getToast();
    var colors = { err: '#F44336', ok: '#00FF41', warn: '#FFD700' };
    t.style.borderColor = 'rgba(' + (type === 'err' ? '244,67,54' : type === 'ok' ? '0,255,65' : '255,215,0') + ',0.4)';
    t.textContent = (type === 'err' ? '⚠ ' : type === 'ok' ? '✓ ' : 'ℹ ') + msg;
    t.style.opacity = '1';
    clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(function() { t.style.opacity = '0'; }, 4000);
  },

  /**
   * Ejecuta fn con reintentos automáticos y feedback UI.
   * Uso: await ProdigyUtils.ErrorBoundary.run(() => sb.from('pedidos').select(), 'Cargando pedidos')
   */
  run: async function(fn, label, retries) {
    var attempts = 0;
    var maxR = retries || this._maxRetries;
    label = label || 'Operación';

    while (attempts <= maxR) {
      try {
        var result = await fn();
        if (result && result.error) throw new Error(result.error.message || 'Error Supabase');
        return result;
      } catch (err) {
        attempts++;
        if (attempts > maxR) {
          this.showToast(label + ' falló. Verifica tu conexión.', 'err');
          this._logError(label, err);
          throw err;
        }
        var wait = Math.pow(2, attempts) * 500; // backoff: 1s, 2s, 4s
        this.showToast('Reintentando ' + label + '... (' + attempts + '/' + maxR + ')', 'warn');
        await new Promise(function(r) { setTimeout(r, wait); });
      }
    }
  },

  _logError: function(label, err) {
    try {
      var sb = window.supabase && window.supabase.createClient
        ? null // ya hay cliente global
        : null;
      // Log en consola estructurado
      console.error('[PRODIGY ErrorBoundary]', { label: label, error: err.message, ts: new Date().toISOString() });
    } catch (_) {}
  }
};

/* ── ABANDONED CART DETECTION ──────────────────────────────────────
 * Detecta cuando el usuario llega al checkout pero no completa el pago.
 * Guarda intento en localStorage y puede enviarlo a Supabase.
 */
ProdigyUtils.AbandonedCart = {
  _key: 'prodigy_checkout_attempt',

  startTracking: function(orderData) {
    var attempt = {
      timestamp: new Date().toISOString(),
      order:     orderData || {},
      page:      window.location.pathname,
      completed: false
    };
    localStorage.setItem(this._key, JSON.stringify(attempt));

    // Listener de cierre de pestaña
    var self = this;
    window.addEventListener('beforeunload', function() {
      var data = JSON.parse(localStorage.getItem(self._key) || '{}');
      if (data && !data.completed) {
        self._saveAbandonment(data);
      }
    });
  },

  markCompleted: function() {
    var data = JSON.parse(localStorage.getItem(this._key) || '{}');
    if (data) {
      data.completed = true;
      localStorage.setItem(this._key, JSON.stringify(data));
    }
    localStorage.removeItem(this._key);
  },

  _saveAbandonment: function(data) {
    try {
      // Beacon API — funciona incluso en beforeunload
      if (navigator.sendBeacon) {
        // Guardar en Supabase via endpoint edge function (si existe)
        // Por ahora: guardar en localStorage para recuperación manual
        var abandoned = JSON.parse(localStorage.getItem('prodigy_abandonments') || '[]');
        abandoned.push(data);
        if (abandoned.length > 20) abandoned = abandoned.slice(-20); // máx 20
        localStorage.setItem('prodigy_abandonments', JSON.stringify(abandoned));
      }
    } catch (_) {}
  },

  // Admin: recuperar abandonments para seguimiento
  getAbandonments: function() {
    return JSON.parse(localStorage.getItem('prodigy_abandonments') || '[]');
  }
};

/* ── SKELETON SCREEN HELPER ────────────────────────────────────────
 * Muestra skeleton mientras carga contenido asíncrono.
 */
ProdigyUtils.Skeleton = {
  show: function(containerId, count, type) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var t = type || 'card';
    var html = '';
    for (var i = 0; i < (count || 3); i++) {
      if (t === 'card') {
        html += '<div style="background:rgba(255,255,255,0.04);border-radius:16px;padding:0;overflow:hidden;animation:skPulse 1.5s ease-in-out infinite;">' +
          '<div style="height:180px;background:rgba(255,255,255,0.06);"></div>' +
          '<div style="padding:18px;">' +
          '<div style="height:12px;background:rgba(255,255,255,0.06);border-radius:6px;margin-bottom:10px;width:60%;"></div>' +
          '<div style="height:10px;background:rgba(255,255,255,0.04);border-radius:6px;width:80%;"></div>' +
          '</div></div>';
      } else {
        html += '<div style="height:60px;background:rgba(255,255,255,0.04);border-radius:10px;animation:skPulse 1.5s ease-in-out infinite ' + (i * 0.1) + 's;margin-bottom:10px;"></div>';
      }
    }
    if (!document.getElementById('sk-style')) {
      var s = document.createElement('style');
      s.id = 'sk-style';
      s.textContent = '@keyframes skPulse{0%,100%{opacity:1}50%{opacity:.5}}';
      document.head.appendChild(s);
    }
    el.innerHTML = html;
  },
  hide: function(containerId) {
    var el = document.getElementById(containerId);
    if (el) el.innerHTML = '';
  }
};

/* ── AUDIO FEEDBACK POR TAMAÑO DE ARCHIVO ──────────────────────────
 * Integra con ProdigyAudio — el drone cambia según el peso del STL.
 */
ProdigyUtils.audioFeedbackForFile = function(fileSizeBytes) {
  if (!window.ProdigyAudio) return;
  var mb = fileSizeBytes / (1024 * 1024);
  if (mb < 5)       ProdigyUtils._applyDroneTone(1.2);  // archivo ligero → tono brillante
  else if (mb < 20) ProdigyUtils._applyDroneTone(1.0);  // normal
  else              ProdigyUtils._applyDroneTone(0.7);  // pesado → más profundo
};

ProdigyUtils._applyDroneTone = function(factor) {
  // Nota: requiere que ProdigyAudio exponga su contexto
  // Por ahora dispara el feedback de upload
  if (window.ProdigyAudio && ProdigyAudio.upload) ProdigyAudio.upload();
};
