/* "¿Algo no funciona?" + asistente IA en vivo.
   Botón para que operarios, doctores y visitantes reporten fallas de la web (subir archivos, pagos,
   algo que no carga…) con captura opcional + detalle técnico automático. Tras enviar, un asistente IA
   (Claude) intenta resolverlo en vivo; si no, la persona toca «Necesito al equipo» y se avisa por WhatsApp.
   También registra en silencio los errores de la página (agrupados, máx. 3 por visita).
   API para las páginas:
     ProdigyReport.abrir({ tipo:'archivos', descripcion:'…', detalle:{…} })  → abre el formulario
     ProdigyReport.log('archivos', 'Falló 1_modelo.stl: Payload too large')   → deja una "miga" técnica
   Backend: /api/reportar-problema + /api/asistente-soporte → tabla reportes_web (compartida, columna negocio).
   Gemelo del archivo del otro repo: solo cambia el bloque CONFIG. Colores y tipografía: CLAUDE.md §5 +
   ESTANDARES-UX-TIPOGRAFIA.md (Inter, magenta/oro/cian/neón, contraste AA). */
(function () {
  'use strict';
  if (window.ProdigyReport) return;

  /* ── CONFIG (único bloque que cambia entre repos) ── */
  var MARCA = 'PRODIGY';
  var WA = '573212816716';
  /* ─────────────────────────────────────────────── */

  var API = '/api/reportar-problema';
  var API_IA = '/api/asistente-soporte';
  var SB_KEY = 'sb-zgihrwqfyvgyapbwzkvw-auth-token';
  var T0 = Date.now();
  var LOG = [];
  var autoSeen = {}, autoSent = 0;
  var _fetch = window.fetch ? window.fetch.bind(window) : null;

  var TIPOS = [
    ['archivos', 'Subir archivos', 'Ej: intenté subir 2 archivos STL, la barra se quedó en 80% y luego salió un aviso rojo.'],
    ['pagos', 'Pagos', 'Ej: pagué pero mi cuenta sigue mostrando el saldo pendiente.'],
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
      var propio = url.indexOf(API) >= 0 || url.indexOf(API_IA) >= 0;
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

  function json(r) {
    return r.json().catch(function () { return {}; }).then(function (j) {
      if (!r.ok) { var e = new Error(j.error || ('Error ' + r.status)); e.status = r.status; throw e; }
      return j;
    });
  }

  function enviar(payload, silencioso) {
    payload.pagina = pagina();
    return token().then(function (t) {
      var h = { 'Content-Type': 'application/json' };
      if (t) h.Authorization = 'Bearer ' + t;
      return _fetch(API, { method: 'POST', headers: h, body: JSON.stringify(payload), keepalive: !!silencioso && !payload.captura_b64 });
    }).then(json);
  }

  /* ── Estilos (marca: magenta · oro · cian · neón sobre #050505; Inter) ── */
  function css() {
    if (document.getElementById('pr-css')) return;
    if (!document.querySelector('link[href*="family=Inter"]')) {
      var f = document.createElement('link');
      f.rel = 'stylesheet';
      f.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap';
      document.head.appendChild(f);
    }
    var s = document.createElement('style');
    s.id = 'pr-css';
    s.textContent = [
      '#pr-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:38px;min-width:38px;padding:0;border-radius:50px;',
      'background:rgba(13,21,32,.9);border:1px solid rgba(255,255,255,.14);color:#f0f0f5;cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
      'font:700 .85rem/1 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;transition:border-color .2s,box-shadow .2s;}',
      '#pr-btn svg{width:18px;height:18px;flex-shrink:0;color:#00d2ff}',
      '#pr-btn:hover{border-color:rgba(217,70,166,.6);box-shadow:0 0 0 3px rgba(217,70,166,.15)}',
      '#pr-btn:focus-visible{outline:2px solid #D946A6;outline-offset:2px}',
      '#prodigy-dock>#pr-btn{order:0}',
      '#pr-btn.pr-float{position:fixed;left:18px;bottom:18px;z-index:9001;padding:0 16px 0 12px;height:42px;box-shadow:0 10px 30px rgba(0,0,0,.5)}',
      '#pr-btn.pr-float.pr-alto{bottom:104px;left:28px}',
      '@media(max-width:768px){#pr-btn.pr-float{padding:0;width:44px;height:44px;left:12px;bottom:16px}#pr-btn.pr-float.pr-alto{bottom:16px;left:12px}#pr-btn.pr-float span{display:none}}',
      '@media print{#pr-btn,#pr-ov{display:none!important}}',

      '#pr-ov{position:fixed;inset:0;z-index:100000;background:rgba(5,5,5,.78);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:flex-start;justify-content:center;padding:5vh 16px 24px;overflow-y:auto}',
      '#pr-m{--mg:#D946A6;--gold:#D4AF37;--cy:#00d2ff;--neon:#00FF41;--tx:#f0f0f5;--mu:#b0b0b8;--line:rgba(255,255,255,.12);',
      'position:relative;width:100%;max-width:540px;background:linear-gradient(165deg,#1a2332,#0d1520 55%,#0a0f18);border:1px solid rgba(217,70,166,.28);border-radius:20px;color:var(--tx);',
      'font:400 1rem/1.6 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.65);padding:26px 24px 20px;overflow:hidden}',
      '#pr-m::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,#D946A6,#D4AF37 50%,#00d2ff)}',
      '#pr-m *{box-sizing:border-box}',
      '#pr-m .hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:6px}',
      '#pr-m h2{font:800 1.3rem/1.15 Inter,sans-serif;letter-spacing:-.01em;margin:0 0 6px;color:var(--tx)}',
      '#pr-m .sub{color:var(--mu);font-size:.92rem;line-height:1.55;margin:0}',
      '#pr-m .x{background:none;border:1px solid var(--line);color:var(--mu);width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1.2rem;line-height:1;flex-shrink:0}',
      '#pr-m .x:hover{color:var(--tx);border-color:rgba(217,70,166,.6)}',
      '#pr-m .lb{display:block;font-size:.88rem;font-weight:700;color:#c0c0c8;margin:18px 0 8px}',
      '#pr-m .chips{display:flex;flex-wrap:wrap;gap:8px}',
      '#pr-m .chip{background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--tx);padding:9px 15px;border-radius:50px;font-family:inherit;font-weight:600;font-size:.88rem;line-height:1;cursor:pointer}',
      '#pr-m .chip:hover{border-color:rgba(217,70,166,.5)}',
      '#pr-m .chip[aria-pressed="true"]{background:rgba(217,70,166,.16);border-color:var(--mg);color:#fff}',
      '#pr-m textarea,#pr-m input[type=text]{width:100%;background:rgba(10,22,40,.85);border:1px solid rgba(255,255,255,.15);border-radius:12px;color:var(--tx);padding:12px 16px;font-family:inherit;font-size:1rem;line-height:1.55;resize:vertical}',
      '#pr-m textarea::placeholder,#pr-m input::placeholder{color:rgba(255,255,255,.5)}',
      '#pr-m textarea{min-height:104px}',
      '#pr-m textarea:focus,#pr-m input[type=text]:focus{outline:2px solid var(--mg);outline-offset:0;box-shadow:0 0 0 4px rgba(217,70,166,.2);border-color:transparent}',
      '#pr-m .drop{display:flex;align-items:center;gap:12px;border:1px dashed rgba(0,210,255,.4);background:rgba(0,210,255,.04);border-radius:12px;padding:12px 16px;color:var(--mu);font-size:.92rem;cursor:pointer}',
      '#pr-m .drop svg{color:var(--cy)}',
      '#pr-m .drop:hover,#pr-m .drop.on{border-color:var(--cy);color:var(--tx)}',
      '#pr-m .drop:focus-visible{outline:2px solid var(--mg);outline-offset:2px}',
      '#pr-m .drop img{width:68px;height:46px;object-fit:cover;border-radius:8px;border:1px solid var(--line)}',
      '#pr-m .drop .q{margin-left:auto;background:none;border:none;color:#ff8080;cursor:pointer;font:inherit;font-size:.88rem;font-weight:600}',
      '#pr-m .chk{display:flex;gap:10px;align-items:flex-start;font-size:.88rem;line-height:1.5;color:var(--mu);margin-top:14px}',
      '#pr-m .chk input{margin-top:3px;accent-color:#D946A6;width:17px;height:17px;flex-shrink:0}',
      '#pr-m .chk a{color:var(--cy)}',
      '#pr-m details{margin-top:8px;font-size:.85rem;color:var(--mu)}',
      '#pr-m summary{cursor:pointer;color:var(--cy)}',
      '#pr-m details pre{white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,.4);border:1px solid var(--line);border-radius:10px;padding:10px;max-height:160px;overflow:auto;font-size:.78rem;margin-top:8px;color:#c0c0c8}',
      '#pr-m .acts{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:20px}',
      '#pr-m .go{flex:1;min-width:200px;background:linear-gradient(135deg,#D946A6,#9c27b0);color:#fff;border:none;border-radius:50px;padding:14px 32px;font-family:inherit;font-weight:800;font-size:1rem;line-height:1;cursor:pointer;box-shadow:0 8px 24px rgba(217,70,166,.3)}',
      '#pr-m .go:hover{filter:brightness(1.08)}',
      '#pr-m .go:focus-visible,#pr-m .ok2:focus-visible,#pr-m .snd:focus-visible,#pr-m .chip:focus-visible,#pr-m .x:focus-visible{outline:2px solid #fff;outline-offset:2px}',
      '#pr-m .go:disabled{opacity:.6;cursor:wait}',
      '#pr-m .wa{display:inline-flex;align-items:center;gap:6px;color:var(--mu);font-size:.92rem;font-weight:600;text-decoration:none;padding:10px 6px}',
      '#pr-m .wa svg{width:16px;height:16px;color:#25D366}',
      '#pr-m .wa:hover{color:var(--tx)}',
      '#pr-m .msg{margin-top:14px;font-size:.92rem;border-radius:12px;padding:12px 14px;display:none}',
      '#pr-m .msg.bad{display:block;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.35);color:#ffb4b4}',
      '#pr-m .folio{display:inline-block;font-weight:800;letter-spacing:.04em;color:var(--gold);border:1px solid rgba(212,175,55,.45);background:rgba(212,175,55,.08);border-radius:50px;padding:4px 14px;font-size:.92rem;font-variant-numeric:tabular-nums}',
      '#pr-m .done{text-align:center;padding:18px 4px 6px}',
      '#pr-m .done .ic{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;margin:0 auto 12px;font-size:1.6rem}',
      '#pr-m .done .ic.ok{background:rgba(0,255,65,.1);color:var(--neon);border:1px solid rgba(0,255,65,.35)}',
      '#pr-m .done .ic.eq{background:rgba(217,70,166,.12);color:var(--mg);border:1px solid rgba(217,70,166,.4)}',
      '#pr-m .done h3{font-size:1.15rem;font-weight:800;margin:0 0 6px}',
      '#pr-m .done .go{max-width:240px;margin:18px auto 0;display:block}',

      /* Asistente IA */
      '#pr-m .ia-top{display:flex;align-items:center;gap:12px;margin:14px 0 12px}',
      '#pr-m .av{width:40px;height:40px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;background:linear-gradient(135deg,#00d2ff,#D946A6);color:#050505}',
      '#pr-m .av svg{width:20px;height:20px}',
      '#pr-m .ia-top b{display:block;font-weight:800;font-size:1rem}',
      '#pr-m .ia-top span{font-size:.85rem;color:var(--mu)}',
      '#pr-m .chat{display:flex;flex-direction:column;gap:10px;max-height:46vh;overflow-y:auto;padding:2px 2px 4px}',
      '#pr-m .bb{max-width:92%;border-radius:16px;padding:12px 16px;font-size:.97rem;line-height:1.6;white-space:pre-wrap;word-break:break-word}',
      '#pr-m .bb.ia{align-self:flex-start;background:rgba(0,210,255,.07);border:1px solid rgba(0,210,255,.25);border-top-left-radius:6px}',
      '#pr-m .bb.yo{align-self:flex-end;background:rgba(217,70,166,.14);border:1px solid rgba(217,70,166,.35);border-top-right-radius:6px}',
      '#pr-m .bb a{color:var(--cy);word-break:break-all}',
      '#pr-m .bb strong{color:#fff}',
      '#pr-m .dots{display:inline-flex;gap:5px;padding:4px 0}',
      '#pr-m .dots i{width:7px;height:7px;border-radius:50%;background:var(--cy);opacity:.4;animation:prdot 1.2s infinite}',
      '#pr-m .dots i:nth-child(2){animation-delay:.2s}#pr-m .dots i:nth-child(3){animation-delay:.4s}',
      '@keyframes prdot{0%,80%,100%{opacity:.25}40%{opacity:1}}',
      '#pr-m .rw{display:flex;gap:8px;margin-top:12px;align-items:flex-end}',
      '#pr-m .rw textarea{min-height:48px;height:48px;resize:none}',
      '#pr-m .snd{width:48px;height:48px;border-radius:50%;border:none;background:#00d2ff;color:#050505;cursor:pointer;flex-shrink:0;display:grid;place-items:center}',
      '#pr-m .snd:disabled{opacity:.4;cursor:default}',
      '#pr-m .snd svg{width:20px;height:20px}',
      '#pr-m .ok2{flex:1;min-width:150px;background:rgba(0,255,65,.08);color:var(--neon);border:1px solid rgba(0,255,65,.45);border-radius:50px;padding:13px 22px;font-family:inherit;font-weight:800;font-size:.95rem;cursor:pointer}',
      '#pr-m .ok2:hover{background:rgba(0,255,65,.14)}',
      '#pr-m .acts .go.eq{min-width:150px;padding:13px 22px;font-size:.95rem}',
      '#pr-m .nota{font-size:.82rem;color:#94a3b8;margin-top:12px;line-height:1.5}',

      '#pr-m .mis{margin-top:20px;border-top:1px solid var(--line);padding-top:14px}',
      '#pr-m .mi{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:.9rem}',
      '#pr-m .mi b{font-variant-numeric:tabular-nums;color:var(--gold);font-weight:800;white-space:nowrap}',
      '#pr-m .mi .r{color:var(--tx);margin-top:3px}',
      '#pr-m .st{display:inline-block;font-size:.75rem;font-weight:700;border-radius:50px;padding:3px 10px;border:1px solid currentColor;white-space:nowrap}',
      '#pr-m .st.nuevo{color:var(--mg)}#pr-m .st.en_revision{color:var(--cy)}#pr-m .st.resuelto{color:var(--neon)}#pr-m .st.descartado{color:#94a3b8}',
      '@media(max-width:480px){#pr-ov{padding:10px 8px}#pr-m{padding:22px 16px 16px}#pr-m .go{min-width:0}}',
      '@media(prefers-reduced-motion:reduce){#pr-btn{transition:none}#pr-m .dots i{animation-duration:.01ms;animation-iteration-count:1}}'
    ].join('');
    document.head.appendChild(s);
  }

  var ICONO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.6"/><path d="M5.7 5.7l3.8 3.8M14.5 14.5l3.8 3.8M18.3 5.7l-3.8 3.8M9.5 14.5l-3.8 3.8"/></svg>';
  var ICO_IA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9z"/><path d="M19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z" opacity=".7"/></svg>';
  var ICO_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var ICO_WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.8 11.9 11.9 0 004.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 001.8-1.3 2.3 2.3 0 00.2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';

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

  /* ── Utilidades de UI ───────────────────────────────────────── */
  var st = { tipo: 'otro', img: null, detalle: null };
  var sesionIA = null;   // { id, clave, folio, msgs:[], ocupado, cerrado }

  function el(tag, attrs, txt) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }
  function escH(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  // Texto de la IA → HTML seguro: se escapa TODO y luego solo **negrita** y enlaces https
  function formatoIA(t) {
    return escH(t)
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/https:\/\/[^\s<]+/g, function (u) {
        var resto = '';
        var m = u.match(/(&quot;.*|[.,;:!?)]+)$/);
        if (m) { resto = m[0]; u = u.slice(0, -resto.length); }
        return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + '</a>' + resto;
      });
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

  // Si la persona se va sin decidir, el equipo igual queda avisado.
  function escalarSilencioso() {
    if (!sesionIA || sesionIA.cerrado) return;
    sesionIA.cerrado = true;
    var body = JSON.stringify({ accion: 'cerrar', id: sesionIA.id, clave: sesionIA.clave, resuelto: false });
    try {
      if (navigator.sendBeacon) navigator.sendBeacon(API, new Blob([body], { type: 'application/json' }));
      else _fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
    } catch (_) {}
  }
  window.addEventListener('pagehide', escalarSilencioso);

  function cerrar() {
    escalarSilencioso();
    sesionIA = null;
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
    if (!it || !document.getElementById('pr-drop')) return;
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
      d.innerHTML = ICONO.replace('<svg', '<svg style="width:22px;height:22px;flex-shrink:0"');
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
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hola ' + MARCA + ', tengo un problema en la web (' + location.pathname + '): ' + (texto || ''));
  }

  /* ── Formulario ─────────────────────────────────────────────── */
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
    ht.appendChild(el('p', { class: 'sub', id: 'pr-sub' }, 'Cuéntanos qué pasó. Un asistente te ayuda al instante y, si hace falta, el equipo de ' + MARCA + ' lo recibe con los datos técnicos para arreglarlo.'));
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

    cuerpo.appendChild(el('label', { class: 'lb', for: 'pr-desc' }, '¿Qué pasó?'));
    var ta = el('textarea', { id: 'pr-desc', maxlength: '2000' });
    ta.placeholder = TIPOS.filter(function (t) { return t[0] === st.tipo; })[0][2];
    if (pre.descripcion) ta.value = pre.descripcion;
    cuerpo.appendChild(ta);

    cuerpo.appendChild(el('span', { class: 'lb' }, 'Captura de pantalla'));
    var drop = el('div', { id: 'pr-drop', class: 'drop', role: 'button', tabindex: '0', 'aria-label': 'Adjuntar captura de pantalla' });
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
    habT.appendChild(el('a', { href: '/terminos-y-legal.html', target: '_blank', rel: 'noopener' }, 'Política de datos'));
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
    var go = el('button', { type: 'button', class: 'go', id: 'pr-go' }, 'Enviar y buscar solución');
    var wa = el('a', { class: 'wa', href: waLink(''), target: '_blank', rel: 'noopener' });
    wa.innerHTML = ICO_WA;
    wa.appendChild(document.createTextNode('WhatsApp'));
    wa.addEventListener('click', function () { wa.href = waLink(ta.value); });
    acts.appendChild(go); acts.appendChild(wa);
    cuerpo.appendChild(acts);
    cuerpo.appendChild(el('div', { class: 'msg', id: 'pr-msg', role: 'alert' }));

    m.appendChild(el('div', { class: 'mis', id: 'pr-mis', hidden: '' }));

    go.addEventListener('click', function () {
      var d = ta.value.trim();
      if (d.length < 3 && !st.img) { mostrarError('Escribe brevemente qué pasó o adjunta una captura.'); ta.focus(); return; }
      var c = ct.value.trim();
      if (!contactoWrap.hidden && c && !habI.checked) { mostrarError('Para guardar tu contacto necesitamos tu autorización de datos (casilla de abajo).'); return; }
      go.disabled = true; go.textContent = 'Enviando…';
      document.getElementById('pr-msg').className = 'msg';
      var payload = {
        origen: 'usuario', tipo: st.tipo, descripcion: d, asistente: true,
        contacto: contactoWrap.hidden ? '' : c,
        contexto: tecI.checked ? contexto({ detalle: st.detalle }) : { navegador: '', pantalla: '' }
      };
      if (st.img) payload.captura_b64 = st.img;
      enviar(payload).then(function (r) {
        var sinSesion = !contactoWrap.hidden;
        if (r.ia && r.id && r.clave) asistente(cuerpo, r, sinSesion, c);
        else listo(cuerpo, r, 'equipo', sinSesion, c);
      }).catch(function (e) {
        go.disabled = false; go.textContent = 'Enviar y buscar solución';
        mostrarError((e && e.message ? e.message.replace(/\.$/, '') + '. ' : '') + 'Si sigue fallando, usa el botón de WhatsApp.');
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

  /* ── Pantalla final ─────────────────────────────────────────── */
  function listo(cuerpo, r, como, sinSesion, contacto) {
    cuerpo.textContent = '';
    var sub = document.getElementById('pr-sub'); if (sub) sub.textContent = '';
    var done = el('div', { class: 'done', role: 'status' });
    done.appendChild(el('div', { class: 'ic ' + (como === 'resuelto' ? 'ok' : 'eq'), 'aria-hidden': 'true' }, como === 'resuelto' ? '✓' : '🛟'));
    done.appendChild(el('h3', null, como === 'resuelto' ? '¡Qué bien que se resolvió!' : 'El equipo ya fue avisado'));
    var p = el('p', { class: 'sub' });
    p.appendChild(document.createTextNode('Tu número de reporte es '));
    p.appendChild(el('span', { class: 'folio' }, 'R-' + r.folio));
    p.appendChild(document.createTextNode(como === 'resuelto'
      ? '. Quedó registrado como resuelto; si vuelve a pasar, repórtalo de nuevo.'
      : (sinSesion
        ? (contacto ? '. Te responderemos a ' + contacto + '.' : '. Si necesitas respuesta, escríbenos por WhatsApp con este número.')
        : '. La respuesta aparecerá aquí mismo, en «Tus reportes».')));
    done.appendChild(p);
    var ok = el('button', { type: 'button', class: 'go' }, 'Listo');
    ok.addEventListener('click', cerrar);
    done.appendChild(ok);
    cuerpo.appendChild(done);
    cargarMis();
  }

  /* ── Asistente IA en vivo ───────────────────────────────────── */
  function asistente(cuerpo, r, sinSesion, contacto) {
    sesionIA = { id: r.id, clave: r.clave, folio: r.folio, msgs: [], ocupado: false, cerrado: false };
    var S = sesionIA;
    cuerpo.textContent = '';
    var sub = document.getElementById('pr-sub');
    if (sub) {
      sub.textContent = '';
      sub.appendChild(document.createTextNode('Reporte guardado '));
      sub.appendChild(el('span', { class: 'folio' }, 'R-' + r.folio));
      sub.appendChild(document.createTextNode('. Mientras tanto, intentemos resolverlo ya.'));
    }

    var top = el('div', { class: 'ia-top' });
    var av = el('div', { class: 'av' }); av.innerHTML = ICO_IA;
    var tt = el('div');
    tt.appendChild(el('b', null, 'Asistente ' + MARCA));
    tt.appendChild(el('span', null, 'Inteligencia artificial · responde en vivo'));
    top.appendChild(av); top.appendChild(tt);
    cuerpo.appendChild(top);

    var chat = el('div', { class: 'chat', 'aria-live': 'polite' });
    cuerpo.appendChild(chat);

    var rw = el('div', { class: 'rw' });
    var inp = el('textarea', { id: 'pr-ia-in', maxlength: '1500', placeholder: 'Escribe tu respuesta…', 'aria-label': 'Mensaje para el asistente' });
    var snd = el('button', { type: 'button', class: 'snd', 'aria-label': 'Enviar mensaje' }); snd.innerHTML = ICO_SEND;
    rw.appendChild(inp); rw.appendChild(snd);
    cuerpo.appendChild(rw);

    var acts = el('div', { class: 'acts' });
    var bOk = el('button', { type: 'button', class: 'ok2' }, '✓ Se resolvió');
    var bEq = el('button', { type: 'button', class: 'go eq' }, 'Necesito al equipo');
    acts.appendChild(bOk); acts.appendChild(bEq);
    cuerpo.appendChild(acts);
    cuerpo.appendChild(el('p', { class: 'nota' }, 'Respuestas generadas por IA (Claude): pueden equivocarse. Nunca te pediremos contraseñas. Si no se resuelve, el equipo recibe tu reporte con esta conversación.'));
    cuerpo.appendChild(el('div', { class: 'msg', id: 'pr-msg', role: 'alert' }));

    function burbuja(quien, texto) {
      var b = el('div', { class: 'bb ' + quien });
      if (texto != null) b.textContent = texto;
      chat.appendChild(b);
      chat.scrollTop = chat.scrollHeight;
      return b;
    }
    function estado(ocupado) {
      S.ocupado = ocupado;
      snd.disabled = ocupado; inp.disabled = ocupado;
      bOk.disabled = ocupado; bEq.disabled = false;
    }

    function pedir() {
      estado(true);
      var b = burbuja('ia');
      b.innerHTML = '<span class="dots" aria-label="Escribiendo"><i></i><i></i><i></i></span>';
      var texto = '';
      _fetch(API_IA, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo: 'usuario', id: S.id, clave: S.clave, mensajes: S.msgs })
      }).then(function (res) {
        if (!res.ok || !res.body) return json(res);
        var rd = res.body.getReader(), dec = new TextDecoder();
        return (function leer() {
          return rd.read().then(function (p) {
            if (p.done) return;
            texto += dec.decode(p.value, { stream: true });
            b.innerHTML = formatoIA(texto);
            chat.scrollTop = chat.scrollHeight;
            return leer();
          });
        })();
      }).then(function () {
        if (S !== sesionIA) return;
        if (!texto.trim()) throw new Error('La IA no respondió');
        S.msgs.push({ role: 'assistant', content: texto });
        estado(false);
        inp.focus();
      }).catch(function (e) {
        if (S !== sesionIA) return;
        if (e && e.status === 503) { b.remove(); decidir(false); return; }   // asistente no configurado → directo al equipo
        b.textContent = (e && e.message ? e.message : 'No pude responder') + ' Toca «Necesito al equipo» y lo revisan.';
        estado(false);
        snd.disabled = true; inp.disabled = true;
      });
    }

    function mandar() {
      var t = inp.value.trim();
      if (!t || S.ocupado) return;
      inp.value = '';
      burbuja('yo', t);
      S.msgs.push({ role: 'user', content: t });
      pedir();
    }
    snd.addEventListener('click', mandar);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mandar(); } });

    function decidir(resuelto) {
      if (S.cerrado) return;
      S.cerrado = true;
      bOk.disabled = true; bEq.disabled = true;
      _fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'cerrar', id: S.id, clave: S.clave, resuelto: resuelto }) })
        .then(json)
        .then(function () { listo(cuerpo, r, resuelto ? 'resuelto' : 'equipo', sinSesion, contacto); })
        .catch(function () { S.cerrado = false; bOk.disabled = false; bEq.disabled = false; mostrarError('No se pudo guardar. Intenta otra vez o escríbenos por WhatsApp.'); });
    }
    bOk.addEventListener('click', function () { decidir(true); });
    bEq.addEventListener('click', function () { decidir(false); });

    pedir();
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
          tx.appendChild(el('div', { style: 'color:#b0b0b8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, (x.descripcion || '').slice(0, 90) || '(con captura)'));
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
