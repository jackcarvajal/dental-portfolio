/* Flujo de escaneos — fondo animado del hero de «Envía tu escáner» (ambas webs; archivo gemelo).
   Líneas punteadas que llegan desde los dos costados y convergen abajo al centro (el laboratorio); por cada
   línea viaja un «archivo» de color de marca. Al tocar el fondo se abre una onda que aparta los puntos.
   Inspirado en «Gateway Flow» (21st.dev), reescrito en JS puro (sin React/Tailwind/iframe — ADR-001).
   Uso: <section class="hero" data-flujo data-colors="#D946A6,#00d2ff,#D4AF37,#00FF41"> + este script con defer.
   Rendimiento: las líneas se dibujan UNA vez en una capa aparte (solo se rehacen al cambiar el tamaño); cada
   cuadro solo mueve los puntos. Arranca con el navegador libre, se detiene fuera de la pantalla o con la
   pestaña oculta, y con «reducir movimiento» queda quieto. Menos líneas en celular. */
(function () {
  'use strict';
  var hero = document.querySelector('[data-flujo]');
  if (!hero || hero.getAttribute('data-flujo-listo')) return;
  hero.setAttribute('data-flujo-listo', '1');

  var COLORES = (hero.getAttribute('data-colors') || '#D946A6,#00d2ff,#D4AF37,#00FF41').split(',').map(function (c) { return c.trim(); });
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // capa: el canvas queda detrás del contenido del hero
  if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative';
  hero.style.overflow = 'hidden';
  hero.style.isolation = 'isolate';
  var cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;' +
    // se desvanece arriba (debajo del menú) y en los costados para no competir con el texto
    '-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 22%,#000 100%);mask-image:linear-gradient(to bottom,transparent 0,#000 22%,#000 100%)';
  hero.insertBefore(cv, hero.firstChild);
  var ctx = cv.getContext('2d');
  if (!ctx) return;

  var capa = document.createElement('canvas'), cctx = capa.getContext('2d');
  var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var caminos = [], ondas = [], corriendo = false, visible = false, ultimo = 0;

  function bezier(t, c) {
    var u = 1 - t, a = u * u * u, b = 3 * u * u * t, d = 3 * u * t * t, e = t * t * t;
    return [a * c[0] + b * c[2] + d * c[4] + e * c[6], a * c[1] + b * c[3] + d * c[5] + e * c[7]];
  }

  function armar() {
    w = hero.clientWidth; h = hero.clientHeight;
    if (!w || !h) return;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    capa.width = cv.width; capa.height = cv.height;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.max(14, Math.min(64, Math.round(w / 22)));       // ~17 en celular, ~64 en escritorio
    var cx = w / 2, cy = h * 0.94;                                  // el laboratorio: abajo al centro
    caminos = [];
    for (var i = 0; i < n; i++) {
      var izq = i % 2 === 0, y0 = (i / n) * h * 1.25 - h * 0.15;
      var x0 = izq ? 0 : w;
      caminos.push({
        c: [x0, y0, izq ? cx * 0.5 : w - cx * 0.5, y0, izq ? cx * 0.82 : w - cx * 0.82, cy, cx, cy],
        t: Math.random(), v: 0.0011 + Math.random() * 0.0016,
        color: COLORES[i % COLORES.length]
      });
    }
    // líneas (estáticas): una sola vez
    cctx.clearRect(0, 0, w, h);
    cctx.lineWidth = 1;
    cctx.setLineDash([1, 5]);
    cctx.strokeStyle = 'rgba(255,255,255,.16)';
    caminos.forEach(function (p) {
      var c = p.c;
      cctx.beginPath(); cctx.moveTo(c[0], c[1]); cctx.bezierCurveTo(c[2], c[3], c[4], c[5], c[6], c[7]); cctx.stroke();
    });
    cctx.setLineDash([]);
    // el núcleo donde llegan los archivos
    var g = cctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(140, w * 0.3));
    g.addColorStop(0, 'rgba(217,70,166,.35)'); g.addColorStop(0.45, 'rgba(0,210,255,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    cctx.fillStyle = g; cctx.fillRect(0, 0, w, h);
    dibujar(0);
  }

  function dibujar(dt) {
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(capa, 0, 0, w, h);
    for (var k = ondas.length - 1; k >= 0; k--) { ondas[k].r += 0.9 * dt; ondas[k].vida -= 0.0009 * dt; if (ondas[k].vida <= 0) ondas.splice(k, 1); }
    for (var i = 0; i < caminos.length; i++) {
      var p = caminos[i];
      p.t += p.v * dt * 0.06;
      if (p.t > 1) p.t = 0;
      var pos = bezier(p.t, p.c), x = pos[0], y = pos[1];
      for (var j = 0; j < ondas.length; j++) {
        var o = ondas[j], dx = x - o.x, dy = y - o.y, dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (Math.abs(dist - o.r) < 110) { var f = (1 - Math.abs(dist - o.r) / 110) * o.vida * 60; x += dx / dist * f; y += dy / dist * f; }
      }
      // brilla más al acercarse al laboratorio
      var a = 0.45 + 0.55 * p.t;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      ctx.globalAlpha = a * 0.25;
      ctx.fillRect(x - 3.5, y - 3.5, 7, 7);
    }
    ctx.globalAlpha = 1;
  }

  function cuadro(ahora) {
    if (!corriendo) return;
    var dt = Math.min(64, ahora - (ultimo || ahora)); ultimo = ahora;
    dibujar(dt);
    requestAnimationFrame(cuadro);
  }
  function arrancar() { if (reduce || corriendo || !visible || document.hidden) return; corriendo = true; ultimo = 0; requestAnimationFrame(cuadro); }
  function parar() { corriendo = false; }

  function iniciar() {
    armar();
    if ('ResizeObserver' in window) {
      var anchoPrevio = 0;
      new ResizeObserver(function () { if (hero.clientWidth !== anchoPrevio || Math.abs(hero.clientHeight - h) > 40) { anchoPrevio = hero.clientWidth; armar(); } }).observe(hero);
    } else window.addEventListener('resize', armar);
    document.addEventListener('visibilitychange', function () { if (document.hidden) parar(); else arrancar(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) arrancar(); else parar(); }).observe(hero);
    else { visible = true; arrancar(); }
    // tocar el fondo (no un botón o enlace) abre una onda
    hero.addEventListener('pointerdown', function (e) {
      if (reduce || e.target.closest('a,button,input,select,textarea,label')) return;
      var r = hero.getBoundingClientRect();
      ondas.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 0, vida: 1 });
      if (ondas.length > 4) ondas.shift();
    });
  }
  // solo con el navegador libre (CLAUDE.md §5)
  if (window.requestIdleCallback) requestIdleCallback(iniciar, { timeout: 1500 }); else setTimeout(iniciar, 300);
})();
