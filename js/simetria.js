/* ── SIMETRÍA AUTOMÁTICA (oct-2026, igual en PRODIGY y Alejandro CAD/CAM) ─────────────────────────────────────
   Regla de Alejandro: todas las páginas simétricas. Una rejilla de tarjetas del mismo ancho no debe dejar huérfanas
   (5+1, 3+1, 4+2…) ni quedar corrida a un lado. Para cada rejilla/fila de tarjetas iguales:
     1) si caben todas en una fila sin achicarse demasiado → una sola fila (6 → 6);
     2) si no, columnas que repartan filas iguales sin alargar la página (6 → 3+3, 4 → 2+2, 8 → 4+4, 9 → 3+3+3);
     3) si no hay reparto exacto (5, 7…) → la última fila va centrada (3+2 centrado);
     4) bloque más angosto que su contenedor → centrado.
   Lo carga header.js en las páginas públicas (no en /app). Excluir una rejilla: atributo data-no-simetria.
   Se recalcula al cambiar el ancho, al cargar fuentes/imágenes y cuando la página agrega tarjetas (portafolio, blog). */
(function () {
  'use strict';
  if (window._simetria || /^\/app\//.test(location.pathname)) return;
  window._simetria = true;
  var OMITIR = '#nav-topbar,#pheader-v2,#pnav2-mob,#pcta-pedido,#pg-chat-window,.dt,form,table,nav,select,[data-no-simetria],.bsc,#idioma-aviso,dialog,.ux-floaters';
  var tocados = [];                                   // [elemento, propiedad, valor original, prioridad original]
  // Solo se tocan propiedades puntuales (y se devuelven tal cual): no se pisan estilos de animaciones u otros scripts
  function poner(el, prop, val) {
    tocados.push([el, prop, el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)]);
    el.style.setProperty(prop, val, 'important');
  }
  function restaurar() {
    for (var i = tocados.length - 1; i >= 0; i--) { var t = tocados[i]; t[0].style.setProperty(t[1], t[2], t[3]); }
    tocados = [];
  }
  function visibles(el) {
    var out = [];
    for (var i = 0; i < el.children.length; i++) {
      var h = el.children[i];
      if (h.offsetParent === null) continue;
      var s = getComputedStyle(h);
      if (s.position === 'absolute' || s.position === 'fixed' || s.display === 'none') continue;
      if (h.getBoundingClientRect().width < 40) continue;
      out.push(h);
    }
    return out;
  }
  function filas(R) {
    var F = [];
    R.forEach(function (r) {
      for (var i = 0; i < F.length; i++) if (Math.abs(F[i].top - r.top) < 6) { F[i].n++; return; }
      F.push({ top: r.top, n: 1 });
    });
    return F;
  }

  function procesar(el, cs) {
    var esGrid = cs.display === 'grid' || cs.display === 'inline-grid';
    var hijos = visibles(el);
    var C = hijos.length;
    if (C < 3) return;
    var R = hijos.map(function (h) { return h.getBoundingClientRect(); });
    var anchos = R.map(function (r) { return r.width; });
    var max = Math.max.apply(null, anchos), min = Math.min.apply(null, anchos);
    if (max < 90 || min < max * 0.85) return;                       // chips, etiquetas o bento: no son tarjetas iguales
    var F = filas(R), N = Math.max.apply(null, F.map(function (f) { return f.n; }));
    if (N < 2) return;                                              // una columna (celular): ya es simétrico
    var ultima = F[F.length - 1].n, huerfana = F.length > 1 && ultima < N;
    var pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0;
    var c = el.getBoundingClientRect(), W = c.width - pl - pr;
    var izq = Math.min.apply(null, R.map(function (r) { return r.left; })) - (c.left + pl);
    var der = (c.right - pr) - Math.max.apply(null, R.map(function (r) { return r.right; }));
    var descentrado = Math.abs(izq - der) > 16;
    if (!huerfana && !descentrado) return;

    if (!esGrid) {                                                  // fila flexible que se parte: centrar las filas
      poner(el, 'justify-content', 'center');
      return;
    }
    var gap = parseFloat(cs.columnGap) || 0, w = max;
    var ancho = function (n) { return (W - (n - 1) * gap) / n; };
    var filasHoy = F.length, n = 0;
    if (!huerfana) n = C;                                           // una fila corrida: misma fila, centrada
    else if (C <= N + 1 && ancho(C) >= w * 0.8) n = C;              // cabe todo en una fila
    else {
      for (var k = Math.min(C - 1, N + 1); k >= 2; k--) {
        if (C % k) continue;
        if (k > N && ancho(k) < w * 0.72) continue;                 // más columnas solo si no quedan muy angostas
        if (C / k > Math.max(filasHoy, 3)) continue;                // menos columnas solo si no alarga la página
        n = k; break;
      }
    }
    if (n) {
      var X = Math.min(w * 1.5, ancho(n));
      poner(el, 'grid-template-columns', 'repeat(' + n + ', minmax(0, ' + Math.floor(X) + 'px))');
      poner(el, 'justify-content', 'center');
      return;
    }
    // Sin reparto exacto: 2N columnas, cada tarjeta ocupa 2 y la primera de la última fila se corre al centro
    poner(el, 'grid-template-columns', 'repeat(' + (2 * N) + ', minmax(0, 1fr))');
    hijos.forEach(function (h, i) { poner(h, 'grid-column', i === C - ultima ? (N - ultima + 1) + ' / span 2' : 'span 2'); });
  }

  function todo() {
    restaurar();
    var L = document.body.getElementsByTagName('*');
    var cand = [];
    for (var i = 0; i < L.length; i++) {
      var el = L[i];
      if (el.childElementCount < 3 || /^(SCRIPT|STYLE|SVG|svg|SELECT|UL|OL|TABLE|TBODY|TR|P|A|BUTTON|LABEL)$/.test(el.tagName)) continue;
      cand.push(el);
    }
    cand.forEach(function (el) {
      if (el.closest(OMITIR)) return;
      var cs = getComputedStyle(el);
      var grid = cs.display === 'grid' || cs.display === 'inline-grid';
      var flex = (cs.display === 'flex' || cs.display === 'inline-flex') && cs.flexWrap === 'wrap' && cs.flexDirection.indexOf('row') === 0;
      if (grid || flex) procesar(el, cs);
    });
  }

  var t = null;
  function pronto(ms) { clearTimeout(t); t = setTimeout(function () { try { todo(); } catch (e) {} }, ms || 120); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { pronto(0); }); else pronto(0);
  window.addEventListener('load', function () { pronto(50); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { pronto(80); });
  var ancho0 = window.innerWidth;
  window.addEventListener('resize', function () { if (window.innerWidth !== ancho0) { ancho0 = window.innerWidth; pronto(150); } });
  document.addEventListener('click', function () { pronto(350); }, true);       // pestañas, acordeones, filtros
  try {
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) if (ms[i].addedNodes.length && !(ms[i].target.closest && ms[i].target.closest(OMITIR))) { pronto(250); return; }
    }).observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
  window._simetriaRecalcular = function () { pronto(0); };
})();
