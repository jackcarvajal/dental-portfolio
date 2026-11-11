/**
 * SonarGrid — campo de puntos que responde a taps/pings con anillos que se expanden.
 * Portado a JS VANILLA para PRODIGY desde un componente React (shadcn). Crédito al autor original.
 * Aquí sin React/shadcn/TS: un <canvas> + este módulo (igual que liquid-hero.js).
 *
 * Uso:
 *   SonarGrid.mount({ container:'#hero-fx', color:'var(--mg)' });
 *
 * - Lee el color resuelto del canvas (pásale 'var(--mg)' y se adapta a tema/marca).
 * - Se apaga cuando no hay anillos vivos, se pausa fuera de pantalla y en pestaña oculta.
 * - Con prefers-reduced-motion dibuja una rejilla quieta (sin anillos).
 * Devuelve un handle: { destroy(), ping(x,y), refresh() }.
 */
(function (global) {
  "use strict";
  var MAX_DPR = 2;
  var TAU = Math.PI * 2;

  function resolveEl(c) {
    if (!c) return null;
    return typeof c === "string" ? document.querySelector(c) : c;
  }

  function mount(options) {
    var o = Object.assign({
      container: null,
      spacing: 26,
      dotRadius: 1.4,
      baseOpacity: 0.28,
      color: "#D946A6",       // pásale 'var(--mg)' para seguir el tema
      pingEvery: 2.4,         // segundos entre pings ambientales (0 = desactiva)
      speed: 260,             // px/seg de expansión del frente
      ringWidth: 90,
      amplitude: 2.2,
      interactive: true,
      maxRings: 6,
      seedPing: true,
      pingArea: [0.15, 0.2, 0.85, 0.8]
    }, options || {});

    var host = resolveEl(o.container);
    if (!host) { return { destroy: function () {}, ping: function () {}, refresh: function () {} }; }

    // El host debe poder contener el canvas en absoluto.
    var cs = getComputedStyle(host);
    if (cs.position === "static") host.style.position = "relative";
    host.style.isolation = host.style.isolation || "isolate";
    host.style.overflow = host.style.overflow || "hidden";

    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:-10;color:" + o.color + ";";
    host.insertBefore(canvas, host.firstChild);

    var ctx = canvas.getContext("2d");
    if (!ctx) { return { destroy: function () { canvas.remove(); }, ping: function () {}, refresh: function () {} }; }

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var width = 0, height = 0, raf = 0, timer = 0, visible = true, seeded = false, stroke = "";
    var rings = [];
    var nextPing = performance.now() + o.pingEvery * 1000;

    function readColor() { stroke = getComputedStyle(canvas).color; }

    function addRing(x, y, born) {
      readColor();
      rings.push({ x: x, y: y, born: born });
      while (rings.length > o.maxRings) rings.shift();
    }

    function draw(now) {
      var lifetime = (Math.hypot(width, height) + o.ringWidth) / o.speed;
      rings = rings.filter(function (r) { return (now - r.born) / 1000 < lifetime; });
      var live = rings.map(function (r) {
        var age = (now - r.born) / 1000;
        var radius = age * o.speed;
        return { x: r.x, y: r.y, radius: radius, reach: radius + o.ringWidth, fade: 1 - age / lifetime };
      });

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = stroke;

      var cols = Math.ceil(width / o.spacing) + 1;
      var rows = Math.ceil(height / o.spacing) + 1;
      var offsetX = (width - (cols - 1) * o.spacing) / 2;
      var offsetY = (height - (rows - 1) * o.spacing) / 2;

      // Paso 1: todos los puntos en reposo en un solo path y un solo fill.
      var hot = [];
      ctx.globalAlpha = o.baseOpacity;
      ctx.beginPath();
      for (var i = 0; i < cols; i++) {
        var cx = offsetX + i * o.spacing;
        for (var j = 0; j < rows; j++) {
          var cy = offsetY + j * o.spacing;
          var energy = 0;
          for (var l = 0; l < live.length; l++) {
            var r = live[l];
            if (Math.abs(cx - r.x) > r.reach || Math.abs(cy - r.y) > r.reach) continue;
            var dist = Math.abs(Math.hypot(cx - r.x, cy - r.y) - r.radius);
            if (dist >= o.ringWidth) continue;
            var t = 1 - dist / o.ringWidth;
            var k = t * t * (3 - 2 * t) * r.fade; // smoothstep, se apaga con la edad
            if (k > energy) energy = k;
          }
          if (energy < 0.01) {
            ctx.moveTo(cx + o.dotRadius, cy);
            ctx.arc(cx, cy, o.dotRadius, 0, TAU);
          } else {
            hot.push(cx, cy, energy);
          }
        }
      }
      ctx.fill();

      // Paso 2: solo los puntos sobre un frente de onda llevan su alpha y radio propios.
      for (var m = 0; m < hot.length; m += 3) {
        var e = hot[m + 2] || 0;
        ctx.globalAlpha = o.baseOpacity + (1 - o.baseOpacity) * e;
        ctx.beginPath();
        ctx.arc(hot[m] || 0, hot[m + 1] || 0, o.dotRadius * (1 + o.amplitude * e), 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function resize() {
      var rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      var dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!seeded) {
        seeded = true;
        var a = o.pingArea;
        if (o.seedPing && !reduceMotion.matches)
          addRing(width * (a[0] + (a[2] - a[0]) * 0.68), height * (a[1] + (a[3] - a[1]) * 0.34), performance.now() - 500);
      }
      draw(performance.now());
    }

    function scheduleIdle(delay) {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { tick(performance.now()); }, Math.max(16, delay));
    }

    function tick(now) {
      raf = 0;
      if (!visible || document.hidden) return;
      if (reduceMotion.matches) { rings = []; draw(now); return; }
      if (o.pingEvery > 0 && now >= nextPing) {
        var a = o.pingArea;
        addRing(width * (a[0] + Math.random() * (a[2] - a[0])), height * (a[1] + Math.random() * (a[3] - a[1])), now);
        nextPing = now + o.pingEvery * 1000;
      }
      draw(now);
      if (rings.length > 0) raf = requestAnimationFrame(tick);
      else if (o.pingEvery > 0) scheduleIdle(nextPing - now);
    }

    function wake() {
      if (!raf) { window.clearTimeout(timer); raf = requestAnimationFrame(tick); }
    }

    function refresh() {
      readColor();
      nextPing = Math.min(nextPing, performance.now() + o.pingEvery * 1000);
      wake();
    }

    function onDown(e) {
      if (!o.interactive || reduceMotion.matches) return;
      var rect = host.getBoundingClientRect();
      addRing(e.clientX - rect.left, e.clientY - rect.top, performance.now());
      wake();
    }
    function onVisibility() { if (!document.hidden) wake(); }

    var ro = new ResizeObserver(resize);
    var io = new IntersectionObserver(function (entries) {
      visible = entries[0] ? entries[0].isIntersecting : true;
      if (visible) wake();
    }, { threshold: 0 });
    var mo = new MutationObserver(refresh); // reacciona al cambio de tema (clase/estilo en <html>)

    readColor();
    resize();
    ro.observe(host);
    io.observe(host);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    host.addEventListener("pointerdown", onDown);
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener("change", wake);
    wake();

    return {
      destroy: function () {
        ro.disconnect(); io.disconnect(); mo.disconnect();
        host.removeEventListener("pointerdown", onDown);
        document.removeEventListener("visibilitychange", onVisibility);
        reduceMotion.removeEventListener("change", wake);
        cancelAnimationFrame(raf); window.clearTimeout(timer);
        canvas.remove();
      },
      ping: function (x, y) { addRing(x, y, performance.now()); wake(); },
      refresh: refresh
    };
  }

  global.SonarGrid = { mount: mount };
})(window);
