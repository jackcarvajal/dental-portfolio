/* Buscador de la web + IA (ambas webs; archivo gemelo). Se abre desde la lupa del menú (o Ctrl+K / «/») y
   también puede ir dentro de una página con <div data-buscador-inline data-wa="…"><input …></div>.
   Mientras escribes muestra las páginas y artículos que coinciden (buscar-indice.json, todas las palabras, sin
   tildes); con Enter le pregunta a la IA con el orbe (js/orbe-ia.js). Lo carga header.js la primera vez que se usa. */
(function () {
  'use strict';
  if (window.Buscador) return;
  var V = '20261007';
  var indice = null, panel = null, orbe = null, ultimoFoco = null;

  function sinTildes(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function cargarScript(src) {
    return new Promise(function (ok, ko) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  }
  function cargarIndice() {
    if (indice) return Promise.resolve(indice);
    return fetch('/buscar-indice.json').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
      .then(function (j) { indice = (j || []).map(function (x) { x._b = sinTildes(x.t + ' ' + x.d + ' ' + x.u.replace(/[\/?=-]/g, ' ')); x._t = sinTildes(x.t); return x; }); return indice; });
  }
  function necesitaOrbe() { return window.OrbeIA ? Promise.resolve() : cargarScript('/js/orbe-ia.js?v=' + V); }

  function estilos() {
    if (document.getElementById('bsc-css')) return;
    var st = document.createElement('style'); st.id = 'bsc-css';
    st.textContent =
      '.bsc{position:fixed;inset:0;z-index:100000;display:none;align-items:flex-start;justify-content:center;padding:max(64px,10vh) 16px 16px}' +
      '.bsc.abierto{display:flex}' +
      '.bsc-fondo{position:absolute;inset:0;background:rgba(3,6,12,.82);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}' +
      '.bsc-caja{position:relative;width:100%;max-width:640px;max-height:calc(100vh - 80px);overflow:auto;animation:bsc-entra .25s cubic-bezier(.22,1,.36,1)}' +
      '@keyframes bsc-entra{from{opacity:0;transform:translateY(-8px) scale(.98)}to{opacity:1;transform:none}}' +
      '.bsc-cab{display:flex;align-items:center;justify-content:space-between;margin:0 4px 12px;color:#94a3b8;font-size:.78rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}' +
      '.bsc-x{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#e2e8f0;width:40px;height:40px;border-radius:10px;cursor:pointer;font-size:1rem}' +
      '.bsc .oia{margin-bottom:0}' +
      '.bsc-res{margin-top:14px;display:flex;flex-direction:column;gap:8px}' +
      '.bsc-it{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border-radius:14px;background:rgba(26,35,50,.92);border:1px solid rgba(255,255,255,.07);text-decoration:none;color:#e2e8f0;transition:border-color .15s,transform .15s}' +
      '.bsc-it:hover,.bsc-it:focus-visible{border-color:rgba(0,210,255,.5);transform:translateX(2px);outline:0}' +
      '.bsc-k{flex:none;font-size:.62rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px;border-radius:999px;margin-top:2px;color:#00d2ff;background:rgba(0,210,255,.1);border:1px solid rgba(0,210,255,.28)}' +
      '.bsc-k.art{color:#D4AF37;background:rgba(212,175,55,.1);border-color:rgba(212,175,55,.3)}' +
      '.bsc-t{font-weight:700;font-size:.92rem;line-height:1.35}.bsc-d{font-size:.78rem;color:#94a3b8;line-height:1.45;margin-top:2px}' +
      '.bsc-vacio{font-size:.82rem;color:#94a3b8;text-align:center;padding:6px}' +
      '.bsc-sug{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}' +
      '.bsc-sug a{font-size:.8rem;font-weight:700;color:#e2e8f0;text-decoration:none;padding:7px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04)}' +
      '.bsc-sug a:hover{border-color:#D946A6;color:#fff}' +
      '.bsc-inline .bsc-res{margin-top:10px}' +
      '@media(prefers-reduced-motion:reduce){.bsc-caja{animation:none}.bsc-it{transition:none}}';
    document.head.appendChild(st);
  }

  function resultados(q, cont) {
    var palabras = sinTildes(q).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 1; });
    if (!palabras.length) {
      cont.innerHTML = '<div class="bsc-sug">' + ['/portafolio|Portafolio', '/envia-tu-scanner|Envía tu escáner', '/seguimiento-caso|Sigue tu caso', '/preguntas|Preguntas frecuentes', '/calculadora-diseno|Precios de diseño']
        .filter(function (p) { return !indice || indice.some(function (x) { return x.u === p.split('|')[0]; }); })
        .map(function (p) { var a = p.split('|'); return '<a href="' + a[0] + '">' + esc(a[1]) + '</a>'; }).join('') + '</div>';
      return;
    }
    var lista = (indice || []).map(function (x) {
      if (!palabras.every(function (w) { return x._b.indexOf(w) >= 0; })) return null;
      var p = palabras.reduce(function (s, w) { return s + (x._t.indexOf(w) >= 0 ? 3 : 1); }, 0) + (x.k === 'Artículo' ? 0 : 0.5);
      return { x: x, p: p };
    }).filter(Boolean).sort(function (a, b) { return b.p - a.p; }).slice(0, 6);
    cont.innerHTML = lista.length
      ? lista.map(function (r) {
          var x = r.x;
          return '<a class="bsc-it" href="' + esc(x.u) + '"><span class="bsc-k' + (x.k === 'Artículo' ? ' art' : '') + '">' + esc(x.k) + '</span><span><div class="bsc-t">' + esc(x.t) + '</div>' +
            (x.d ? '<div class="bsc-d">' + esc(x.d) + '</div>' : '') + '</span></a>';
        }).join('')
      : '<div class="bsc-vacio">No hay páginas con esas palabras. Presiona <b>Enter</b> y pregúntale a la IA.</div>';
  }

  function montarEn(cont, wa, alto) {
    var res = document.createElement('div'); res.className = 'bsc-res'; res.setAttribute('aria-live', 'polite');
    cont.parentNode.insertBefore(res, cont.nextSibling);
    var o = window.OrbeIA.montar(cont, {
      wa: wa,
      canal: 'buscador',
      placeholder: 'Busca en la web o pregúntale a la IA…',
      ayuda: 'Escribe para <b>buscar páginas y artículos</b> · Enter para <b>preguntarle a la IA</b>',
      alEscribir: function (t) { resultados(t, res); }
    });
    // los resultados se ocultan mientras la IA responde
    new MutationObserver(function () { res.style.display = cont.getAttribute('data-fase') === 'idle' ? '' : 'none'; })
      .observe(cont, { attributes: true, attributeFilter: ['data-fase'] });
    resultados('', res);
    return o;
  }

  function abrir(opts) {
    opts = opts || {};
    ultimoFoco = document.activeElement;
    estilos();
    return Promise.all([necesitaOrbe(), cargarIndice()]).then(function () {
      if (!panel) {
        panel = document.createElement('div'); panel.className = 'bsc';
        panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-label', 'Buscar en la web o preguntar a la IA');
        panel.innerHTML = '<div class="bsc-fondo"></div><div class="bsc-caja"><div class="bsc-cab"><span>Buscar · IA</span>' +
          '<button type="button" class="bsc-x" aria-label="Cerrar búsqueda">✕</button></div>' +
          '<div class="bsc-orbe"><input type="search" id="bsc-q" aria-label="Buscar en la web o preguntar a la IA"></div></div>';
        document.body.appendChild(panel);
        orbe = montarEn(panel.querySelector('.bsc-orbe'), opts.wa || '');
        panel.querySelector('.bsc-fondo').addEventListener('click', cerrar);
        panel.querySelector('.bsc-x').addEventListener('click', cerrar);
        panel.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
          if (e.key === 'Tab') {                                    // el foco no se sale del buscador
            var f = [].filter.call(panel.querySelectorAll('a[href],button,input'), function (el) { return el.offsetParent !== null; });
            if (!f.length) return;
            if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
            else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
          }
        });
      }
      panel.classList.add('abierto');
      document.documentElement.style.overflow = 'hidden';
      setTimeout(function () { var i = document.getElementById('bsc-q'); if (i) { i.focus(); i.select(); } }, 30);
    });
  }
  function cerrar() {
    if (!panel) return;
    panel.classList.remove('abierto');
    document.documentElement.style.overflow = '';
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus({ preventScroll: true });
  }

  window.Buscador = { abrir: abrir, cerrar: cerrar };

  // dentro de una página (p. ej. Soporte)
  var inl = document.querySelector('[data-buscador-inline]');
  if (inl) { estilos(); inl.classList.add('bsc-inline'); Promise.all([necesitaOrbe(), cargarIndice()]).then(function () { montarEn(inl, inl.getAttribute('data-wa') || ''); }); }
})();
