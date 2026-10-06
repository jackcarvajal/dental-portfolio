/* Orbe IA — buscador del Centro de Ayuda que también le pregunta a la IA (ambas webs; archivo gemelo).
   Inspirado en «AI thinking orb and input» (21st.dev), reescrito en JS puro: el proyecto no usa React,
   Tailwind ni TypeScript (ADR-001), así que no se instala nada.
   - Al escribir: filtra las preguntas frecuentes de la página (lo hace la página con su propio oninput).
   - Enter o el botón ✦: la esfera de puntos aparece y «piensa» (Pensando · Buscando · Analizando · Redactando)
     mientras la IA responde (window._phdrPreguntaIA, definido en header.js → /api/gemini); luego se condensa
     y se despliega la respuesta palabra por palabra. Esc cancela.
   - Con «reducir movimiento» solo hay fundidos. Accesible: estado en aria-live y foco en la respuesta.
   Uso: <div data-orbe-ia data-wa="573212816716"> con un <input> adentro (se respeta su id y su oninput). */
(function () {
  'use strict';
  var raiz = document.querySelector('[data-orbe-ia]');
  if (!raiz || raiz.getAttribute('data-orbe-listo')) return;
  raiz.setAttribute('data-orbe-listo', '1');
  var input = raiz.querySelector('input');
  if (!input) return;

  var ETIQUETAS = ['Pensando', 'Buscando', 'Analizando', 'Redactando'];
  var WA = raiz.getAttribute('data-wa') || '';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── estilos (una vez) ── */
  if (!document.getElementById('oia-css')) {
    var st = document.createElement('style'); st.id = 'oia-css';
    st.textContent =
      '.oia{position:relative;margin-bottom:36px}' +
      '.oia-pill{position:relative;display:flex;align-items:center;gap:8px;background:rgba(13,21,32,.88);border-radius:999px;padding:6px 6px 6px 18px;' +
        'box-shadow:0 0 0 1px rgba(255,255,255,.12),0 10px 40px -12px rgba(217,70,166,.45);transition:opacity .22s,transform .22s,box-shadow .25s}' +
      '.oia-pill:focus-within{box-shadow:0 0 0 1.5px #D946A6,0 0 0 5px rgba(217,70,166,.18),0 14px 50px -10px rgba(0,210,255,.4)}' +
      '.oia-pill>svg{flex:none;width:20px;height:20px;color:#00d2ff}' +
      '.oia-pill input{flex:1;min-width:0;background:transparent!important;border:0!important;outline:0;color:#e2e8f0;font:inherit;font-size:16px;padding:10px 4px!important;box-shadow:none!important}' +
      '.oia-pill input::placeholder{color:#94a3b8}' +
      '.oia-env{flex:none;display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 16px;border:0;border-radius:999px;cursor:pointer;font:inherit;font-weight:800;font-size:.85rem;' +
        'color:#fff;background:linear-gradient(135deg,#B0267F,#0e7490);transition:transform .15s,filter .15s}' +
      '.oia-env:hover{filter:brightness(1.12)}.oia-env:active{transform:scale(.96)}' +
      '.oia-env:focus-visible{outline:2px solid #00d2ff;outline-offset:2px}' +
      '.oia-env svg{width:16px;height:16px}' +
      '@media(max-width:480px){.oia-env span{display:none}.oia-env{width:44px;padding:0;justify-content:center}.oia-pill{padding-left:14px}}' +
      '.oia-ayuda{margin:10px 6px 0;font-size:.78rem;color:#94a3b8;text-align:center}' +
      '.oia-ayuda b{color:#e2e8f0;font-weight:700}' +
      '.oia[data-fase="pensando"] .oia-pill,.oia[data-fase="respuesta"] .oia-pill{opacity:0;transform:scale(.94);pointer-events:none;position:absolute;inset:0 0 auto 0}' +
      '.oia[data-fase="pensando"] .oia-ayuda,.oia[data-fase="respuesta"] .oia-ayuda{display:none}' +
      '.oia[data-agita] .oia-pill{animation:oia-agita .26s}' +
      '@keyframes oia-agita{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}' +
      '.oia-escena{display:none;flex-direction:column;align-items:center;gap:6px;padding:6px 0 4px}' +
      '.oia[data-fase="pensando"] .oia-escena,.oia[data-fase="respuesta"] .oia-escena{display:flex}' +
      '.oia-orbe{width:200px;height:200px;max-width:70vw;max-height:70vw;filter:drop-shadow(0 0 30px rgba(0,210,255,.18))}' +
      '.oia[data-fase="respuesta"] .oia-orbe,.oia[data-fase="respuesta"] .oia-estado{display:none}' +
      '.oia-estado{min-height:24px;font-size:.92rem;font-weight:700;color:#cbd5e1;letter-spacing:.02em;transition:opacity .2s}' +
      '.oia-estado i{display:inline-block;width:4px;height:4px;margin-left:3px;border-radius:50%;background:currentColor;animation:oia-punto 1.2s infinite}' +
      '.oia-estado i:nth-child(2){animation-delay:.15s}.oia-estado i:nth-child(3){animation-delay:.3s}' +
      '@keyframes oia-punto{0%,80%,100%{opacity:.25}40%{opacity:1}}' +
      '.oia-q{font-size:.8rem;color:#94a3b8;max-width:46ch;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
      '.oia-resp{display:none;width:100%;text-align:left;background:linear-gradient(180deg,rgba(26,35,50,.96),rgba(13,21,32,.96));border:1px solid rgba(0,210,255,.28);' +
        'border-radius:18px;padding:18px 20px;box-shadow:0 20px 60px -20px rgba(0,210,255,.35);outline:0}' +
      '.oia[data-fase="respuesta"] .oia-resp{display:block;animation:oia-abre .45s cubic-bezier(.22,1,.36,1)}' +
      '@keyframes oia-abre{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}' +
      '.oia-cab{display:flex;align-items:center;gap:8px;font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#00d2ff;margin-bottom:10px}' +
      '.oia-cab b{width:8px;height:8px;border-radius:50%;background:#00d2ff;box-shadow:0 0 12px #00d2ff}' +
      '.oia-cab span{font-weight:600;letter-spacing:0;text-transform:none;color:#94a3b8}' +
      '.oia-cuerpo{color:#e2e8f0;font-size:.95rem;line-height:1.7;overflow-wrap:anywhere}' +
      '.oia-cuerpo a{color:#00d2ff}.oia-cuerpo strong{color:#fff}' +
      '.oia-w{display:inline;opacity:0;animation:oia-pal .32s cubic-bezier(.22,1,.36,1) forwards}' +
      '@keyframes oia-pal{from{opacity:0;filter:blur(3px)}to{opacity:1;filter:none}}' +
      '.oia-acc{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}' +
      '.oia-acc button,.oia-acc a{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 16px;border-radius:999px;font:inherit;font-size:.82rem;font-weight:700;cursor:pointer;text-decoration:none}' +
      '.oia-acc button{background:transparent;color:#e2e8f0;border:1px solid rgba(255,255,255,.2)}' +
      '.oia-acc a{background:rgba(37,211,102,.12);color:#4ade80;border:1px solid rgba(37,211,102,.35)}' +
      '.oia-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
      '@media(prefers-reduced-motion:reduce){.oia *{animation:none!important;transition:none!important}.oia-w{opacity:1}}';
    document.head.appendChild(st);
  }

  /* ── estructura: el input existente pasa a la píldora (conserva id, oninput y aria-label) ── */
  raiz.classList.add('oia'); raiz.setAttribute('data-fase', 'idle');
  var viejo = input.parentElement;
  var form = document.createElement('form'); form.className = 'oia-pill'; form.setAttribute('role', 'search');
  form.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M10 3.5l1.7 4.8 4.8 1.7-4.8 1.7L10 16.5l-1.7-4.8L3.5 10l4.8-1.7L10 3.5z"/><path d="M18 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z"/></svg>';
  input.removeAttribute('class');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('enterkeyhint', 'search');
  input.setAttribute('maxlength', '300');
  input.placeholder = 'Busca o pregúntale a la IA…';
  form.appendChild(input);
  var env = document.createElement('button'); env.type = 'submit'; env.className = 'oia-env'; env.setAttribute('aria-label', 'Preguntar a la IA');
  env.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5.5 11.5L12 5l6.5 6.5"/></svg><span>Preguntar a la IA</span>';
  form.appendChild(env);
  if (viejo && viejo !== raiz && viejo.parentElement) viejo.replaceWith(raiz);
  raiz.innerHTML = '';
  raiz.appendChild(form);
  raiz.insertAdjacentHTML('beforeend',
    '<p class="oia-ayuda">Escribe para <b>filtrar las preguntas</b> · Enter o el botón para <b>preguntarle a la IA</b></p>' +
    '<div class="oia-escena"><canvas class="oia-orbe" aria-hidden="true"></canvas><div class="oia-estado" aria-hidden="true"></div><div class="oia-q"></div>' +
      '<div class="oia-resp" tabindex="-1" role="group" aria-label="Respuesta de la IA">' +
        '<div class="oia-cab"><b aria-hidden="true"></b>Respuesta de la IA<span>· orientativa, confírmala con el equipo</span></div>' +
        '<div class="oia-cuerpo"></div>' +
        '<div class="oia-acc"><button type="button" class="oia-nueva">Nueva pregunta</button>' +
          (WA ? '<a class="oia-wa" target="_blank" rel="noopener noreferrer">Hablar con una persona</a>' : '') + '</div>' +
      '</div></div>' +
    '<div class="oia-sr" role="status" aria-live="polite"></div>');
  var canvas = raiz.querySelector('.oia-orbe'), estado = raiz.querySelector('.oia-estado'), qEl = raiz.querySelector('.oia-q');
  var resp = raiz.querySelector('.oia-resp'), cuerpo = raiz.querySelector('.oia-cuerpo'), vivo = raiz.querySelector('.oia-sr');
  var wa = raiz.querySelector('.oia-wa');

  /* ── la esfera de puntos (portada del original) ── */
  var C = 220, R = 74, TAU = Math.PI * 2;
  var dots = (function () {
    var out = [], semilla = 7;
    function rnd() { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; }
    for (var k = 0; k < 16; k++) {
      var y = 1 - ((k + 0.5) / 16) * 2, r = Math.sqrt(1 - y * y), m = Math.max(4, Math.round(30 * r));
      for (var j = 0; j < m; j++) { var a = (j / m) * TAU + k * 0.35; out.push([Math.cos(a) * r, y, Math.sin(a) * r, (1 - y) / 2, rnd() * TAU]); }
    }
    return out;
  })();
  var N = dots.length, lit = new Float32Array(N);
  var P = { k: 0, alpha: 0, spin: 0, rot: 0, sweep: 0, pop: 1, vortex: 0, gain: 1, floor: 0, prog: 0 };
  var pw = [1, 0, 0, 0], tiempo = 0, raf = 0, ult = 0;
  var ctx = canvas.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = C * dpr; canvas.height = C * dpr;
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var eOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var eIo = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  function dibujar(dt) {
    if (!ctx) return;
    ctx.clearRect(0, 0, C, C);
    tiempo += dt; P.rot += P.spin * dt;
    var yaw = P.rot + P.vortex, cy = Math.cos(yaw), sy = Math.sin(yaw), paso = dt / 0.35;
    for (var q = 0; q < 4; q++) { var d = (q === P.prog ? 1 : 0) - pw[q]; pw[q] += Math.abs(d) <= paso ? d : d > 0 ? paso : -paso; }
    var decae = Math.exp(-dt / 0.5), h0 = (tiempo * 300) % N, h3 = (tiempo * 480) % N;
    var a1 = tiempo * 0.8, b1 = Math.sin(tiempo * 0.5) * 0.9, f1 = [Math.cos(b1) * Math.cos(a1), Math.sin(b1), Math.cos(b1) * Math.sin(a1)];
    var a2 = tiempo * 0.55 + 2.1, b2 = Math.cos(tiempo * 0.42) * 0.9, f2 = [Math.cos(b2) * Math.cos(a2), Math.sin(b2), Math.cos(b2) * Math.sin(a2)];
    var lat = Math.sin(tiempo * 2.2), giro = P.vortex * 1.5, CP = Math.cos(0.35), SP = Math.sin(0.35), c0 = C / 2;
    var lista = [];
    for (var n = 0; n < N; n++) {
      var D = dots[n], x = D[0], y = D[1], z = D[2], u = D[3], pul = 0, dd, v;
      if (pw[0] > 0.001) { dd = Math.abs(n - h0); if (dd > N - dd) dd = N - dd; v = Math.max(0, 1 - dd / 16); pul = Math.max(pul, v * v * pw[0]); }
      if (pw[1] > 0.001) { v = Math.max(Math.max(0, (x * f1[0] + y * f1[1] + z * f1[2] - 0.72) / 0.28), Math.max(0, (x * f2[0] + y * f2[1] + z * f2[2] - 0.72) / 0.28)); pul = Math.max(pul, v * v * pw[1]); }
      if (pw[2] > 0.001) { var e = y - lat; v = Math.max(0, 1 - (e * e) / 0.02); pul = Math.max(pul, v * v * pw[2]); }
      if (pw[3] > 0.001) { dd = Math.abs(n - h3); if (dd > N - dd) dd = N - dd; v = Math.max(0, 1 - dd / 22); pul = Math.max(pul, v * v * pw[3]); }
      var l = Math.max(lit[n] * decae, pul * P.gain); lit[n] = l;
      var ki = clamp(P.k * 1.6 - 0.6 * u); if (ki <= 0.001) continue;
      var eo = eOut(ki), kk = eo * P.pop;
      var x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y2 = y * CP - z1 * SP, z2 = y * SP + z1 * CP;
      var f = 2.8 / (2.8 - z2), prof = (z2 + 1) / 2, ox = x1 * R * kk * f, oy = -y2 * R * kk * f;
      if (giro > 0.001) { var s = (1 - ki) * giro, cc = Math.cos(s), ss = Math.sin(s), tx = ox * cc - oy * ss; oy = ox * ss + oy * cc; ox = tx; }
      var g = clamp((P.sweep * 1.4 - u) / 0.4);
      var al = 0.1 + 0.035 * Math.sin(D[4] + tiempo * 1.6) * (1 - g) + 0.32 * prof * prof + 0.75 * l * (1 - g) + g * (0.55 + 0.4 * prof) + 2 * g * (1 - g);
      al = Math.min(1, Math.max(al, P.floor * (0.7 + 0.3 * prof))) * eo * P.alpha;
      if (al <= 0.01) continue;
      // de gris claro a cian de marca (barrido de «listo»); los puntos encendidos toman un toque magenta
      var rr = Math.round(235 + (0 - 235) * g + 20 * l * (1 - g)), gg = Math.round(235 + (210 - 235) * g - 120 * l * (1 - g)), bb = Math.round(235 + (255 - 235) * g - 40 * l * (1 - g));
      lista.push([c0 + ox, c0 + oy, (1.15 * (0.45 + 0.75 * prof) * f + 0.9 * l + g * 0.25) * (0.4 + 0.6 * eo), 'rgba(' + rr + ',' + gg + ',' + bb + ',' + al.toFixed(3) + ')', prof]);
    }
    lista.sort(function (A, B) { return A[4] - B[4]; });          // primero los de atrás
    for (var i = 0; i < lista.length; i++) { ctx.fillStyle = lista[i][3]; ctx.beginPath(); ctx.arc(lista[i][0], lista[i][1], lista[i][2], 0, TAU); ctx.fill(); }
  }
  function cuadro(ahora) {
    raf = 0;
    var dt = reduce ? 0 : Math.max(0, Math.min(0.05, (ahora - ult) / 1000)); ult = ahora;
    dibujar(dt);
    if (raiz.getAttribute('data-fase') === 'pensando') raf = requestAnimationFrame(cuadro);   // sigue mientras «piensa»
  }
  function animarOrbe() { if (!raf) { ult = performance.now(); raf = requestAnimationFrame(cuadro); } }

  /* ── tweens ── */
  var vivos = [];
  function tween(clave, de, a, ms, ease) {
    return new Promise(function (ok) {
      if (reduce) ms = Math.min(ms, 120);
      var t0 = performance.now(), obj = { cancel: false };
      vivos.push(obj);
      (function paso(ahora) {
        if (obj.cancel) return ok();
        var p = Math.min(1, (ahora - t0) / ms);
        P[clave] = de + (a - de) * (ease || eIo)(p);
        if (p < 1) requestAnimationFrame(paso); else ok();
      })(t0);
    });
  }
  function esperar(ms) { return new Promise(function (ok) { setTimeout(ok, Math.max(0, ms)); }); }

  /* ── texto de la respuesta: escapado, **negritas**, saltos y enlaces internos; palabra por palabra ── */
  function formatear(t) {
    var esc = String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    esc = esc.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^\s*[*•-]\s+/gm, '• ')
      .replace(/(^|[\s(])(\/[a-z0-9][a-z0-9\-\/]*)/g, '$1<a href="$2">$2</a>')
      .replace(/(https:\/\/[^\s<]+[^\s<.,)])/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
    return esc;
  }
  function revelar(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodos = [], n, i = 0;
    while ((n = w.nextNode())) nodos.push(n);
    nodos.forEach(function (t) {
      var fr = document.createDocumentFragment();
      t.nodeValue.split(/(\s+)/).forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { fr.appendChild(document.createTextNode(p)); return; }
        var s = document.createElement('span'); s.className = 'oia-w'; s.textContent = p;
        s.style.animationDelay = Math.min(i++ * 22, 1400) + 'ms'; fr.appendChild(s);
      });
      t.parentNode.replaceChild(fr, t);
    });
  }

  /* ── flujo ── */
  var turno = 0, ultimaPregunta = '';
  function fase(f) { raiz.setAttribute('data-fase', f); }
  function etiqueta(t, listo) { estado.innerHTML = (t || '') + (listo ? '' : '<i></i><i></i><i></i>'); }
  function reiniciarOrbe() {
    vivos.forEach(function (o) { o.cancel = true; }); vivos = [];
    P.k = 0; P.alpha = 0; P.spin = 0; P.rot = 0; P.sweep = 0; P.pop = 1; P.vortex = 0; P.gain = 1; P.floor = 0; P.prog = 0;
    lit.fill(0); pw = [1, 0, 0, 0]; tiempo = reduce ? 1.2 : 0;
  }
  function volver(enfocar) {
    turno++; reiniciarOrbe(); fase('idle'); cuerpo.innerHTML = ''; estado.textContent = '';
    if (enfocar) input.focus({ preventScroll: true });
  }

  function preguntar(texto) {
    if (typeof window._phdrPreguntaIA === 'function') return window._phdrPreguntaIA(texto);
    return Promise.reject(new Error('sin asistente'));
  }

  async function enviar(texto) {
    var mio = ++turno;
    ultimaPregunta = texto;
    reiniciarOrbe(); fase('pensando');
    qEl.textContent = '«' + texto + '»';
    etiqueta(ETIQUETAS[0]); vivo.textContent = 'Consultando a la IA…';
    // aparece: los puntos de arriba primero, con un leve rebote
    tween('alpha', 0, 1, 700, eOut); tween('k', 0, 1, 800, eOut); tween('spin', 0, 0.9, 800, eOut);
    animarOrbe();
    tween('pop', 1, 1.05, 420, eOut).then(function () { return tween('pop', 1.05, 1, 380); });
    var e = 0, rot = setInterval(function () { e = (e + 1) % ETIQUETAS.length; P.prog = e % 4; etiqueta(ETIQUETAS[e]); }, 1150);
    var t0 = performance.now(), respuesta;
    try { respuesta = await preguntar(texto); }
    catch (err) {
      respuesta = (err && err.status === 429) ? 'Muchas consultas seguidas: espera un minuto e intenta de nuevo.'
        : 'Ahora mismo no pude consultar a la IA. Puedes escribirnos y te respondemos en minutos.';
    }
    await esperar(1500 - (performance.now() - t0));                // que alcance a «pensar»
    clearInterval(rot);
    if (mio !== turno) return;
    // listo: barrido de color y se condensa
    etiqueta('Listo', true);
    await Promise.all([tween('sweep', 0, 1, 700), tween('spin', 0.9, 0.3, 700, eOut), tween('gain', 1, 0, 700, eOut), tween('floor', 0, 0.95, 700, eOut)]);
    if (mio !== turno) return;
    await Promise.all([tween('vortex', 0, 1.6, 520), tween('k', 1, 0, 520), tween('alpha', 1, 0, 600, eOut)]);
    if (mio !== turno) return;
    cuerpo.innerHTML = formatear(respuesta);
    if (!reduce) revelar(cuerpo);
    if (wa) wa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hola, tengo una pregunta: ' + texto);
    fase('respuesta');
    vivo.textContent = 'Respuesta lista.';
    resp.focus({ preventScroll: true });
    var r = resp.getBoundingClientRect();
    if (r.bottom > innerHeight || r.top < 80) resp.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var t = input.value.trim();
    if (!t) { raiz.setAttribute('data-agita', ''); setTimeout(function () { raiz.removeAttribute('data-agita'); }, 280); input.focus(); return; }
    if (raiz.getAttribute('data-fase') !== 'idle') return;
    enviar(t);
  });
  raiz.querySelector('.oia-nueva').addEventListener('click', function () {
    volver(true);
    input.select();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && raiz.getAttribute('data-fase') !== 'idle') { ev.preventDefault(); volver(true); }
  });
})();
