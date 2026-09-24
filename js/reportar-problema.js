/* PRODIGY — "¿Algo no funciona?"
   Botón para que operarios, doctores y visitantes reporten fallas de la web (subir archivos, pagos,
   algo que no carga…) con captura opcional + detalle técnico automático. Además registra en silencio
   los errores de la página y avisa al equipo (agrupados, máx. 3 por visita).
   API para las páginas:
     ProdigyReport.abrir({ tipo:'archivos', descripcion:'…', detalle:{…} })  → abre el formulario
     ProdigyReport.log('archivos', 'Falló 1_modelo.stl: Payload too large')   → deja una "miga" técnica
   Backend: /api/reportar-problema (functions/api/reportar-problema.js) → tabla reportes_web. */
(function () {
  'use strict';
  if (window.ProdigyReport) return;

  var API = '/api/reportar-problema';
  var WA = '573219581949';
  var SB_KEY = 'sb-zgihrwqfyvgyapbwzkvw-auth-token';
  var T0 = Date.now();
  var LOG = [];
  var autoSeen = {}, autoSent = 0;
  var _fetch = window.fetch ? window.fetch.bind(window) : null;

  var TIPOS = [
    ['archivos', 'Subir archivos', 'Ej: intenté subir 2 archivos STL, la barra se quedó en 80% y luego salió un aviso rojo.'],
    ['pagos', 'Pagos', 'Ej: pagué por PayPal pero mi cuenta sigue mostrando el saldo pendiente.'],
    ['no_carga', 'Algo no carga', 'Ej: el panel se queda en blanco / el botón Guardar no hace nada.'],
    ['datos', 'Datos incorrectos', 'Ej: el caso muestra otra fecha de entrega / un nombre equivocado.'],
    ['sugerencia', 'Sugerencia', 'Ej: sería más fácil si pudiera ver también…'],
    ['otro', 'Otro', 'Cuéntanos qué estabas haciendo y qué pasó.']
  ];

  /* ── Migas técnicas ─────────────────────────────────────────── */
  function clean(u) {
    return String(u || '').replace(/[?#].*$/, '')
      .replace(/^https?:\/\/zgihrwqfyvgyapbwzkvw\.supabase\.co/, 'supabase')
      .replace(location.origin, '').slice(0, 160);
  }
  function miga(k, msg, donde) {
    LOG.push({ t: Math.round((Date.now() - T0) / 1000) + 's', k: k, msg: String(msg || '').slice(0, 300), donde: donde || undefined });
    if (LOG.length > 12) LOG.shift();
  }

  var RUIDO = /Script error\.?$|ResizeObserver loop|extension:\/\/|Non-Error promise rejection|AbortError|operation was aborted|The user aborted/i;

  function auto(msg, donde, pila) {
    if (navigator.webdriver || /^(localhost|127\.|192\.168\.)/.test(location.hostname) || location.protocol === 'file:') return;
    if (navigator.onLine === false) return;
    var k = String(msg).slice(0, 120);
    if (autoSeen[k] || autoSent >= 3) return;
    autoSeen[k] = 1; autoSent++;
    setTimeout(function () {
      enviar({
        origen: 'automatico', tipo: 'error_js', descripcion: String(msg).slice(0, 500),
        contexto: contexto({ donde: donde, pila: String(pila || '').split('\n').slice(0, 6).join('\n').slice(0, 1200) })
      }, true).catch(function () {});
    }, 1500);
  }

  window.addEventListener('error', function (e) {
    var el = e.target;
    if (el && el !== window && (el.src || el.href)) {           // un script/imagen/css que no cargó
      var u = el.src || el.href;
      miga('recurso', 'No cargó ' + (el.tagName || '').toLowerCase() + ': ' + clean(u));
      if (el.tagName === 'SCRIPT' && (u.indexOf(location.origin) === 0 || /cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/.test(u)))
        auto('No cargó el script ' + clean(u), '', '');
      return;
    }
    var msg = e.message || (e.error && e.error.message) || '';
    var file = e.filename || '';
    if (!msg || RUIDO.test(msg) || RUIDO.test(file)) return;
    if (file && file.indexOf(location.origin) !== 0) return;      // errores de terceros (extensiones, anuncios)
    var donde = file ? clean(file) + ':' + (e.lineno || 0) + ':' + (e.colno || 0) : '';
    miga('error', msg, donde);
    auto(msg, donde, e.error && e.error.stack);
  }, true);

  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    var msg = (r && (r.message || (typeof r === 'string' ? r : ''))) || '';
    if (!msg || RUIDO.test(msg)) return;
    miga('promesa', msg);
    auto(msg, '', r && r.stack);
  });

  // Peticiones que fallan (subidas a Storage, consultas…): solo se anotan, no se envían solas.
  if (_fetch) {
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      var propio = url.indexOf(API) >= 0;
      return _fetch(input, init).then(function (res) {
        if (!propio && res.status >= 400) miga('red', method + ' ' + res.status + ' ' + clean(url));
        return res;
      }, function (err) {
        if (!propio) miga('red', method + ' sin respuesta ' + clean(url) + ' — ' + (err && err.message || ''));
        throw err;
      });
    };
  }

  function contexto(extra) {
    var c = {
      errores: LOG.slice(-10),
      navegador: navigator.userAgent,
      pantalla: window.innerWidth + 'x' + window.innerHeight,
      idioma: navigator.language,
      conexion: navigator.onLine === false ? 'sin internet' : ((navigator.connection && navigator.connection.effectiveType) || 'ok'),
      segundos_en_pagina: Math.round((Date.now() - T0) / 1000),
      titulo: document.title.slice(0, 100)
    };
    for (var k in (extra || {})) if (extra[k] != null && extra[k] !== '') c[k] = extra[k];
    return c;
  }

  function pagina() {
    return location.pathname + location.search.replace(/([?&](token|code|access_token|refresh_token|key|t)=)[^&]*/gi, '$1…');
  }

  /* ── Sesión (si la hay) ─────────────────────────────────────── */
  function token() {
    var desdeSb = (window.sb && window.sb.auth && window.sb.auth.getSession)
      ? window.sb.auth.getSession().then(function (r) { return r && r.data && r.data.session && r.data.session.access_token; }).catch(function () { return null; })
      : Promise.resolve(null);
    return desdeSb.then(function (t) {
      if (t) return t;
      try {
        var j = JSON.parse(localStorage.getItem(SB_KEY) || 'null');
        var s = j && (j.currentSession || j);
        if (s && s.access_token && (!s.expires_at || s.expires_at * 1000 > Date.now())) return s.access_token;
      } catch (_) {}
      return null;
    });
  }

  function enviar(payload, silencioso) {
    payload.pagina = pagina();
    return token().then(function (t) {
      var h = { 'Content-Type': 'application/json' };
      if (t) h.Authorization = 'Bearer ' + t;
      return _fetch(API, { method: 'POST', headers: h, body: JSON.stringify(payload), keepalive: !!silencioso && !payload.captura_b64 });
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) throw new Error(j.error || ('Error ' + r.status));
        return j;
      });
    });
  }

  /* ── Estilos ────────────────────────────────────────────────── */
  function css() {
    if (document.getElementById('pr-css')) return;
    var s = document.createElement('style');
    s.id = 'pr-css';
    s.textContent = [
      '#pr-btn{--c:#EADBAE;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:38px;min-width:38px;padding:0;border-radius:100px;',
      'background:rgba(13,15,22,.86);border:1px solid rgba(255,255,255,.1);color:var(--c);cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
      'font:600 .78rem/1 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.01em;transition:border-color .2s,transform .2s;}',
      '#pr-btn:hover{border-color:rgba(234,219,174,.55)}#pr-btn:focus-visible{outline:2px solid #EADBAE;outline-offset:2px}',
      '#pr-btn svg{width:18px;height:18px;flex-shrink:0}',
      '#prodigy-dock>#pr-btn{order:0}',
      '#pr-btn.pr-float{position:fixed;left:18px;bottom:18px;z-index:9001;padding:0 14px 0 11px;box-shadow:0 10px 30px rgba(0,0,0,.45)}',
      '#pr-btn.pr-float.pr-alto{bottom:104px;left:28px}',
      '@media(max-width:768px){#pr-btn.pr-float{padding:0;width:40px;height:40px;left:12px;bottom:16px}#pr-btn.pr-float.pr-alto{bottom:16px;left:12px}#pr-btn.pr-float span{display:none}}',
      '@media print{#pr-btn,#pr-ov{display:none!important}}',

      '#pr-ov{position:fixed;inset:0;z-index:100000;background:rgba(3,4,8,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:flex-start;justify-content:center;padding:6vh 16px 24px;overflow-y:auto}',
      '#pr-m{--bg:#0c0d13;--line:rgba(255,255,255,.08);--gold:#D4AF37;--champ:#EADBAE;--tx:#F3F1EA;--mu:#8E93A3;--ok:#5DF0A6;--bad:#ff7a7a;',
      'width:100%;max-width:520px;background:linear-gradient(180deg,#11131b,var(--bg));border:1px solid rgba(212,175,55,.22);border-radius:18px;color:var(--tx);',
      'font:400 .92rem/1.5 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.6);padding:22px 22px 18px}',
      '#pr-m *{box-sizing:border-box}',
      '#pr-m .hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}',
      '#pr-m h2{font:600 1.18rem/1.25 Sora,Inter,system-ui,sans-serif;letter-spacing:-.01em;margin:0 0 4px;color:var(--tx)}',
      '#pr-m .sub{color:var(--mu);font-size:.83rem;margin:0}',
      '#pr-m .x{background:none;border:1px solid var(--line);color:var(--mu);width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:1.1rem;line-height:1;flex-shrink:0}',
      '#pr-m .x:hover{color:var(--tx);border-color:rgba(234,219,174,.4)}',
      '#pr-m .lb{display:block;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:var(--champ);font-weight:600;margin:14px 0 7px}',
      '#pr-m .chips{display:flex;flex-wrap:wrap;gap:6px}',
      '#pr-m .chip{background:rgba(255,255,255,.035);border:1px solid var(--line);color:var(--tx);padding:7px 12px;border-radius:100px;font-family:inherit;font-weight:500;font-size:.8rem;line-height:1;cursor:pointer}',
      '#pr-m .chip[aria-pressed="true"]{background:rgba(212,175,55,.14);border-color:rgba(212,175,55,.55);color:var(--champ)}',
      '#pr-m textarea,#pr-m input[type=text]{width:100%;background:rgba(255,255,255,.035);border:1px solid var(--line);border-radius:12px;color:var(--tx);padding:11px 13px;font:inherit;font-size:.9rem;resize:vertical}',
      '#pr-m textarea{min-height:96px}',
      '#pr-m textarea:focus,#pr-m input[type=text]:focus{outline:none;border-color:rgba(212,175,55,.5)}',
      '#pr-m .drop{display:flex;align-items:center;gap:12px;border:1px dashed rgba(234,219,174,.28);border-radius:12px;padding:11px 13px;color:var(--mu);font-size:.8rem;cursor:pointer}',
      '#pr-m .drop:hover,#pr-m .drop.on{border-color:rgba(234,219,174,.6);color:var(--tx)}',
      '#pr-m .drop img{width:64px;height:44px;object-fit:cover;border-radius:6px;border:1px solid var(--line)}',
      '#pr-m .drop .q{margin-left:auto;background:none;border:none;color:var(--bad);cursor:pointer;font:inherit;font-size:.78rem}',
      '#pr-m .chk{display:flex;gap:9px;align-items:flex-start;font-size:.78rem;color:var(--mu);margin-top:12px}',
      '#pr-m .chk input{margin-top:2px;accent-color:#D4AF37;width:15px;height:15px;flex-shrink:0}',
      '#pr-m .chk a{color:var(--champ)}',
      '#pr-m details{margin-top:6px;font-size:.74rem;color:var(--mu)}',
      '#pr-m details pre{white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,.35);border:1px solid var(--line);border-radius:8px;padding:8px;max-height:150px;overflow:auto;font-size:.7rem;margin-top:6px}',
      '#pr-m .acts{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:16px}',
      '#pr-m .go{flex:1;min-width:180px;background:linear-gradient(120deg,#EADBAE,#D4AF37);color:#14110a;border:none;border-radius:12px;padding:12px 16px;font-family:inherit;font-weight:700;font-size:.9rem;line-height:1;cursor:pointer}',
      '#pr-m .go:disabled{opacity:.55;cursor:wait}',
      '#pr-m .wa{color:var(--mu);font-size:.8rem;text-decoration:none;padding:10px 6px}',
      '#pr-m .wa:hover{color:var(--champ)}',
      '#pr-m .msg{margin-top:12px;font-size:.84rem;border-radius:10px;padding:10px 12px;display:none}',
      '#pr-m .msg.bad{display:block;background:rgba(255,122,122,.08);border:1px solid rgba(255,122,122,.3);color:#ffb4b4}',
      '#pr-m .done{text-align:center;padding:14px 4px 6px}',
      '#pr-m .done .folio{display:inline-block;font:600 1.5rem/1 Sora,Inter,sans-serif;letter-spacing:.04em;color:var(--champ);border:1px solid rgba(212,175,55,.4);border-radius:12px;padding:10px 16px;margin:10px 0}',
      '#pr-m .mis{margin-top:18px;border-top:1px solid var(--line);padding-top:12px}',
      '#pr-m .mi{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:.8rem}',
      '#pr-m .mi b{font-variant-numeric:tabular-nums;color:var(--champ);font-weight:600;white-space:nowrap}',
      '#pr-m .mi .r{color:var(--tx);margin-top:3px}',
      '#pr-m .st{display:inline-block;font-size:.64rem;letter-spacing:.06em;text-transform:uppercase;border-radius:100px;padding:2px 8px;border:1px solid var(--line);color:var(--mu);white-space:nowrap}',
      '#pr-m .st.resuelto{color:var(--ok);border-color:rgba(93,240,166,.35)}#pr-m .st.en_revision{color:var(--champ);border-color:rgba(234,219,174,.35)}',
      '@media(max-width:480px){#pr-ov{padding:12px 10px}#pr-m{padding:18px 16px 14px}}',
      '@media(prefers-reduced-motion:reduce){#pr-btn{transition:none}}'
    ].join('');
    document.head.appendChild(s);
  }

  var ICONO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.6"/><path d="M5.7 5.7l3.8 3.8M14.5 14.5l3.8 3.8M18.3 5.7l-3.8 3.8M9.5 14.5l-3.8 3.8"/></svg>';

  /* ── Botón ──────────────────────────────────────────────────── */
  function boton() {
    if (document.getElementById('pr-btn') || document.body.hasAttribute('data-no-reportar')) return;
    css();
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'pr-btn';
    b.title = '¿Algo no funciona? Repórtalo';
    b.setAttribute('aria-label', 'Reportar un problema de la web');
    b.innerHTML = ICONO + '<span>¿Algo falla?</span>';
    b.addEventListener('click', function () { abrir(); });
    var dock = document.getElementById('prodigy-dock');
    if (dock) {
      b.querySelector('span').remove();
      dock.appendChild(b);
    } else {
      b.className = 'pr-float';
      if (document.getElementById('pg-chat-bubble')) b.classList.add('pr-alto');
      document.body.appendChild(b);
    }
  }

  /* ── Formulario ─────────────────────────────────────────────── */
  var st = { tipo: 'otro', img: null, detalle: null };

  function el(tag, attrs, txt) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }

  function comprimir(file) {
    return new Promise(function (ok, ko) {
      if (!file || !/^image\//.test(file.type)) return ko(new Error('Eso no es una imagen.'));
      var fr = new FileReader();
      fr.onload = function () {
        var im = new Image();
        im.onload = function () {
          var M = 1600, w = im.width, h = im.height, f = Math.min(1, M / Math.max(w, h));
          var c = document.createElement('canvas');
          c.width = Math.round(w * f); c.height = Math.round(h * f);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          ok(c.toDataURL('image/jpeg', 0.8));
        };
        im.onerror = function () { ko(new Error('No se pudo leer la imagen.')); };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  function cerrar() {
    var o = document.getElementById('pr-ov');
    if (o) o.remove();
    document.removeEventListener('keydown', esc);
    document.removeEventListener('paste', pegar);
    var b = document.getElementById('pr-btn');
    if (b) b.focus();
  }
  function esc(e) { if (e.key === 'Escape') cerrar(); }
  function pegar(e) {
    var it = e.clipboardData && e.clipboardData.items;
    if (!it) return;
    for (var i = 0; i < it.length; i++) {
      if (it[i].type.indexOf('image') === 0) { e.preventDefault(); ponerImg(it[i].getAsFile()); return; }
    }
  }
  function ponerImg(file) {
    comprimir(file).then(function (d) { st.img = d; pintarDrop(); })
      .catch(function (e) { mostrarError(e.message); });
  }
  function pintarDrop() {
    var d = document.getElementById('pr-drop');
    if (!d) return;
    d.textContent = '';
    if (st.img) {
      d.classList.add('on');
      d.appendChild(el('img', { src: st.img, alt: 'Captura adjunta' }));
      d.appendChild(el('span', null, 'Captura adjunta'));
      var q = el('button', { type: 'button', class: 'q' }, 'Quitar');
      q.addEventListener('click', function (e) { e.stopPropagation(); st.img = null; pintarDrop(); });
      d.appendChild(q);
    } else {
      d.classList.remove('on');
      d.innerHTML = ICONO.replace('<svg', '<svg style="width:20px;height:20px;opacity:.6"');
      d.appendChild(el('span', null, window.matchMedia('(pointer:coarse)').matches
        ? 'Toca para adjuntar una captura de pantalla (opcional)'
        : 'Pega una captura con Ctrl+V o haz clic para elegirla (opcional)'));
    }
  }
  function mostrarError(t) {
    var m = document.getElementById('pr-msg');
    if (!m) return;
    m.className = 'msg bad';
    m.textContent = t;
  }
  function waLink(texto) {
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hola, tengo un problema en la web (' + location.pathname + '): ' + (texto || ''));
  }

  function abrir(pre) {
    pre = pre || {};
    cerrar();
    css();
    st = { tipo: pre.tipo && TIPOS.some(function (t) { return t[0] === pre.tipo; }) ? pre.tipo : 'otro', img: null, detalle: pre.detalle || null };
    if (pre.detalle) miga(pre.tipo || 'detalle', typeof pre.detalle === 'string' ? pre.detalle : JSON.stringify(pre.detalle).slice(0, 300));

    var ov = el('div', { id: 'pr-ov' });
    var m = el('div', { id: 'pr-m', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pr-h' });
    ov.appendChild(m);
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) cerrar(); });

    var hd = el('div', { class: 'hd' });
    var ht = el('div');
    ht.appendChild(el('h2', { id: 'pr-h' }, '¿Algo no funciona?'));
    ht.appendChild(el('p', { class: 'sub' }, 'Cuéntanos qué pasó. Tu reporte llega directo al equipo de PRODIGY con los datos técnicos para arreglarlo.'));
    var x = el('button', { type: 'button', class: 'x', 'aria-label': 'Cerrar' }, '×');
    x.addEventListener('click', cerrar);
    hd.appendChild(ht); hd.appendChild(x);
    m.appendChild(hd);

    var cuerpo = el('div', { id: 'pr-body' });
    m.appendChild(cuerpo);

    cuerpo.appendChild(el('span', { class: 'lb' }, '¿Sobre qué es?'));
    var chips = el('div', { class: 'chips', role: 'group', 'aria-label': 'Tipo de problema' });
    TIPOS.forEach(function (t) {
      var c = el('button', { type: 'button', class: 'chip', 'data-t': t[0], 'aria-pressed': String(st.tipo === t[0]) }, t[1]);
      c.addEventListener('click', function () {
        st.tipo = t[0];
        chips.querySelectorAll('.chip').forEach(function (z) { z.setAttribute('aria-pressed', String(z === c)); });
        ta.placeholder = t[2];
      });
      chips.appendChild(c);
    });
    cuerpo.appendChild(chips);

    var lbD = el('label', { class: 'lb', for: 'pr-desc' }, '¿Qué pasó?');
    cuerpo.appendChild(lbD);
    var ta = el('textarea', { id: 'pr-desc', maxlength: '2000' });
    ta.placeholder = TIPOS.filter(function (t) { return t[0] === st.tipo; })[0][2];
    if (pre.descripcion) ta.value = pre.descripcion;
    cuerpo.appendChild(ta);

    cuerpo.appendChild(el('span', { class: 'lb' }, 'Captura de pantalla'));
    var drop = el('div', { id: 'pr-drop', class: 'drop', role: 'button', tabindex: '0' });
    var fi = el('input', { type: 'file', accept: 'image/*', id: 'pr-file', hidden: '' });
    fi.addEventListener('change', function () { if (fi.files[0]) ponerImg(fi.files[0]); fi.value = ''; });
    drop.addEventListener('click', function () { fi.click(); });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fi.click(); } });
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('on'); });
    drop.addEventListener('dragleave', function () { if (!st.img) drop.classList.remove('on'); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); if (e.dataTransfer.files[0]) ponerImg(e.dataTransfer.files[0]); });
    cuerpo.appendChild(drop);
    cuerpo.appendChild(fi);

    var contactoWrap = el('div', { id: 'pr-contacto-w', hidden: '' });
    contactoWrap.appendChild(el('label', { class: 'lb', for: 'pr-contacto' }, 'Tu WhatsApp o correo'));
    var ct = el('input', { type: 'text', id: 'pr-contacto', maxlength: '120', autocomplete: 'email', placeholder: 'Para poder responderte (opcional)' });
    contactoWrap.appendChild(ct);
    var hab = el('label', { class: 'chk', for: 'pr-habeas' });
    var habI = el('input', { type: 'checkbox', id: 'pr-habeas' });
    hab.appendChild(habI);
    var habT = el('span', null, 'Autorizo el tratamiento de mis datos solo para responder este reporte (Ley 1581 de 2012). ');
    var habA = el('a', { href: '/terminos-y-legal.html', target: '_blank', rel: 'noopener' }, 'Política de datos');
    habT.appendChild(habA);
    hab.appendChild(habT);
    contactoWrap.appendChild(hab);
    cuerpo.appendChild(contactoWrap);

    var tec = el('label', { class: 'chk', for: 'pr-tec' });
    var tecI = el('input', { type: 'checkbox', id: 'pr-tec' });
    tecI.checked = true;
    tec.appendChild(tecI);
    tec.appendChild(el('span', null, 'Adjuntar información técnica (página, navegador y errores recientes). No incluye contraseñas.'));
    cuerpo.appendChild(tec);
    var det = el('details');
    det.appendChild(el('summary', null, 'Ver qué se envía'));
    var pre_ = el('pre');
    det.appendChild(pre_);
    det.addEventListener('toggle', function () { if (det.open) pre_.textContent = JSON.stringify(contexto({ detalle: st.detalle }), null, 1); });
    cuerpo.appendChild(det);

    var acts = el('div', { class: 'acts' });
    var go = el('button', { type: 'button', class: 'go', id: 'pr-go' }, 'Enviar reporte');
    var wa = el('a', { class: 'wa', href: waLink(''), target: '_blank', rel: 'noopener' }, 'o escríbenos por WhatsApp');
    wa.addEventListener('click', function () { wa.href = waLink(ta.value); });
    acts.appendChild(go); acts.appendChild(wa);
    cuerpo.appendChild(acts);
    cuerpo.appendChild(el('div', { class: 'msg', id: 'pr-msg', role: 'alert' }));

    var mis = el('div', { class: 'mis', id: 'pr-mis', hidden: '' });
    m.appendChild(mis);

    go.addEventListener('click', function () {
      var d = ta.value.trim();
      if (d.length < 3 && !st.img) { mostrarError('Escribe brevemente qué pasó o adjunta una captura.'); ta.focus(); return; }
      var c = ct.value.trim();
      if (!contactoWrap.hidden && c && !habI.checked) { mostrarError('Para guardar tu contacto necesitamos tu autorización de datos (casilla de abajo).'); return; }
      go.disabled = true; go.textContent = 'Enviando…';
      document.getElementById('pr-msg').className = 'msg';
      var payload = {
        origen: 'usuario', tipo: st.tipo, descripcion: d,
        contacto: contactoWrap.hidden ? '' : c,
        contexto: tecI.checked ? contexto({ detalle: st.detalle }) : { navegador: '', pantalla: '' }
      };
      if (st.img) payload.captura_b64 = st.img;
      enviar(payload).then(function (r) {
        cuerpo.textContent = '';
        var done = el('div', { class: 'done', role: 'status' });
        done.appendChild(el('p', { class: 'sub' }, 'Recibido. Tu número de reporte es'));
        done.appendChild(el('div', { class: 'folio' }, 'R-' + r.folio));
        done.appendChild(el('p', { class: 'sub' }, contactoWrap.hidden
          ? 'El equipo ya fue avisado. La respuesta aparecerá aquí mismo, en "Tus reportes".'
          : (c ? 'El equipo ya fue avisado y te responderemos a ' + c + '.' : 'El equipo ya fue avisado. Si necesitas respuesta, escríbenos por WhatsApp con este número.')));
        var ok = el('button', { type: 'button', class: 'go', style: 'margin-top:16px;max-width:220px' }, 'Listo');
        ok.addEventListener('click', cerrar);
        done.appendChild(ok);
        cuerpo.appendChild(done);
        cargarMis();
      }).catch(function (e) {
        go.disabled = false; go.textContent = 'Enviar reporte';
        mostrarError((e && e.message ? e.message.replace(/\.$/, '') + '. ' : '') + 'Si sigue fallando, usa el enlace de WhatsApp.');
      });
    });

    document.body.appendChild(ov);
    pintarDrop();
    document.addEventListener('keydown', esc);
    document.addEventListener('paste', pegar);
    setTimeout(function () { ta.focus(); }, 30);

    token().then(function (t) {
      if (!t) { contactoWrap.hidden = false; return; }
      cargarMis();
    });
  }

  function cargarMis() {
    token().then(function (t) {
      if (!t) return;
      return _fetch(API, { headers: { Authorization: 'Bearer ' + t } }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
        var mis = document.getElementById('pr-mis');
        if (!mis || !Array.isArray(rows) || !rows.length) return;
        mis.textContent = '';
        mis.hidden = false;
        mis.appendChild(el('span', { class: 'lb', style: 'margin-top:0' }, 'Tus reportes'));
        var NOM = { nuevo: 'Recibido', en_revision: 'En revisión', resuelto: 'Resuelto', descartado: 'Cerrado' };
        rows.slice(0, 5).forEach(function (x) {
          var it = el('div', { class: 'mi' });
          it.appendChild(el('b', null, 'R-' + x.folio));
          var tx = el('div', { style: 'flex:1;min-width:0' });
          tx.appendChild(el('div', { style: 'color:var(--mu);overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, (x.descripcion || '').slice(0, 90) || '(con captura)'));
          if (x.respuesta) tx.appendChild(el('div', { class: 'r' }, 'Respuesta: ' + x.respuesta));
          it.appendChild(tx);
          it.appendChild(el('span', { class: 'st ' + x.estado }, NOM[x.estado] || x.estado));
          mis.appendChild(it);
        });
      });
    }).catch(function () {});
  }

  window.ProdigyReport = {
    abrir: abrir,
    log: function (k, msg) { miga(k || 'nota', msg); }
  };

  // En /app/ el botón va en el dock de arriba (junto a campana y rol); se espera a que la página lo arme.
  // Si no hay dock (login, páginas públicas) queda flotando abajo a la izquierda.
  function init() {
    var enApp = /^\/app\//.test(location.pathname), n = 0;
    (function esperar() {
      if (document.getElementById('prodigy-dock') || !enApp || ++n > 12) {
        boton();
        if (enApp) moverAlDock(0);
        return;
      }
      setTimeout(esperar, 350);
    })();
  }
  function moverAlDock(k) {
    var b = document.getElementById('pr-btn'), d = document.getElementById('prodigy-dock');
    if (!b || !b.classList.contains('pr-float')) return;
    if (d) { b.className = ''; var sp = b.querySelector('span'); if (sp) sp.remove(); d.appendChild(b); return; }
    if (k < 20) setTimeout(function () { moverAlDock(k + 1); }, 500);
  }
  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
