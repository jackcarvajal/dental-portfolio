/* particle-hero.js — campo de partículas anti-gravedad reactivo al cursor (vanilla, self-contained)
   Adaptación a Vanilla del componente React "particle-effect-for-hero".
   Uso: <canvas id="phero" class="phero"></canvas> dentro de un contenedor con position:relative.
        <script src="js/particle-hero.js?v=YYYYMMDD" data-count="70" data-links="1"></script>
   · pointer-events:none → nunca bloquea toques/enlaces del hero
   · respeta prefers-reduced-motion (no arranca)
   · densidad reducida en móvil · pausa con la pestaña oculta
   · colores de marca: magenta · dorado · cian */
(function () {
  var cv = document.getElementById('phero');
  if (!cv) return;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  var ctx = cv.getContext('2d');
  var script = document.currentScript;
  var BASE = parseInt((script && script.dataset.count) || '70', 10);
  var LINKS = !(script && script.dataset.links === '0');
  var COLORS = ['217,70,166', '212,175,55', '0,210,255']; // marca
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var W = 0, H = 0, mobile = false, N = BASE, LINKDIST = 120;
  var mouse = { x: -9999, y: -9999, on: false };
  var REPEL = 110;      // radio de repulsión del cursor
  var parts = [], raf = 0;

  function resize() {
    var r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    mobile = W < 700;
    N = mobile ? Math.round(BASE * 0.5) : BASE;
    LINKDIST = mobile ? 90 : 120;
    build();
  }

  function P() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.25;   // deriva horizontal suave
    this.vy = -(Math.random() * 0.35 + 0.15); // anti-gravedad: sube
    this.r = Math.random() * 1.8 + 1.1;
    this.c = COLORS[(Math.random() * COLORS.length) | 0];
    this.a = Math.random() * 0.4 + 0.35;
  }
  P.prototype.step = function () {
    // repulsión del cursor
    if (mouse.on) {
      var dx = this.x - mouse.x, dy = this.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < REPEL && d > 0.01) {
        var f = (REPEL - d) / REPEL * 0.9;
        this.vx += dx / d * f;
        this.vy += dy / d * f;
      }
    }
    this.x += this.vx;
    this.y += this.vy;
    // fricción para no acelerar sin límite tras la repulsión
    this.vx *= 0.965;
    this.vy = this.vy * 0.965 - 0.006; // mantiene el sesgo hacia arriba
    // reciclado: al salir por arriba/lados reaparece por abajo
    if (this.y < -10) { this.y = H + 10; this.x = Math.random() * W; this.vy = -(Math.random() * 0.35 + 0.15); }
    if (this.x < -10) this.x = W + 10;
    if (this.x > W + 10) this.x = -10;
  };
  P.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 6.283);
    ctx.fillStyle = 'rgba(' + this.c + ',' + this.a + ')';
    ctx.fill();
  };

  function build() { parts = []; for (var i = 0; i < N; i++) parts.push(new P()); }

  function links() {
    for (var i = 0; i < parts.length; i++) {
      for (var j = i + 1; j < parts.length; j++) {
        var a = parts[i], b = parts[j];
        var dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < LINKDIST) {
          var o = (1 - d / LINKDIST) * 0.18;
          ctx.strokeStyle = 'rgba(' + a.c + ',' + o + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < parts.length; i++) { parts[i].step(); parts[i].draw(); }
    if (LINKS && !mobile) links();
    raf = requestAnimationFrame(loop);
  }

  // el cursor se mide relativo al canvas
  function onMove(e) {
    var r = cv.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    mouse.x = t.clientX - r.left; mouse.y = t.clientY - r.top; mouse.on = true;
  }
  function offMove() { mouse.on = false; mouse.x = mouse.y = -9999; }

  var host = cv.parentElement || window;
  host.addEventListener('mousemove', onMove, { passive: true });
  host.addEventListener('mouseleave', offMove, { passive: true });
  host.addEventListener('touchmove', onMove, { passive: true });
  host.addEventListener('touchend', offMove, { passive: true });

  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 250); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cancelAnimationFrame(raf); else { cancelAnimationFrame(raf); loop(); }
  });

  resize(); loop();
})();
