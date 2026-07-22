/* particle-bg.js — fondo de texto en partículas (vanilla, self-contained)
   Uso: <canvas id="pbg"></canvas> + <script src="js/particle-bg.js?v=YYYYMMDD"
        data-words="PRODIGY,DENTAL,CAD/CAM,3D"></script>
   · pointer-events:none → nunca bloquea los toques en los enlaces
   · respeta prefers-reduced-motion · pausa con la pestaña oculta
   · densidad reducida en móvil para no gastar batería */
(function () {
  var cv = document.getElementById('pbg');
  if (!cv) return;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return; // accesibilidad
  var ctx = cv.getContext('2d');
  var script = document.currentScript;
  var WORDS = ((script && script.dataset.words) || 'PRODIGY,DENTAL,CAD/CAM,3D')
    .split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  // paleta de marca (magenta · dorado · cian)
  var COLORS = [[217, 70, 166], [212, 175, 55], [0, 210, 255]];

  var W = 0, H = 0, mobile = false, STEP = 6, SIZE = 2;
  function resize() {
    W = cv.width = cv.clientWidth;
    H = cv.height = cv.clientHeight;
    mobile = W < 700;
    STEP = mobile ? 10 : 6;      // menos partículas en móvil
    SIZE = mobile ? 1.6 : 2.2;
  }

  function Particle() {
    this.pos = rand(); this.vel = { x: 0, y: 0 }; this.acc = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.maxSpeed = Math.random() * 5 + 4;
    this.maxForce = this.maxSpeed * 0.05;
    this.closeEnough = 90;
    this.sc = { r: 0, g: 0, b: 0 }; this.tc = { r: 0, g: 0, b: 0 };
    this.cw = 0; this.cbr = Math.random() * 0.025 + 0.004;
    this.killed = false;
  }
  function rand() {
    var a = Math.random() * Math.PI * 2, m = (W + H) / 2;
    return { x: W / 2 + Math.cos(a) * m, y: H / 2 + Math.sin(a) * m };
  }
  Particle.prototype.move = function () {
    var dx = this.target.x - this.pos.x, dy = this.target.y - this.pos.y;
    var d = Math.hypot(dx, dy), pm = d < this.closeEnough ? d / this.closeEnough : 1;
    if (d > 0) { dx = dx / d * this.maxSpeed * pm; dy = dy / d * this.maxSpeed * pm; }
    var sx = dx - this.vel.x, sy = dy - this.vel.y, sm = Math.hypot(sx, sy);
    if (sm > 0) { sx = sx / sm * this.maxForce; sy = sy / sm * this.maxForce; }
    this.vel.x += sx; this.vel.y += sy;
    this.pos.x += this.vel.x; this.pos.y += this.vel.y;
  };
  Particle.prototype.draw = function () {
    if (this.cw < 1) this.cw = Math.min(this.cw + this.cbr, 1);
    var r = this.sc.r + (this.tc.r - this.sc.r) * this.cw | 0;
    var g = this.sc.g + (this.tc.g - this.sc.g) * this.cw | 0;
    var b = this.sc.b + (this.tc.b - this.sc.b) * this.cw | 0;
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.fillRect(this.pos.x, this.pos.y, SIZE, SIZE);
  };
  Particle.prototype.kill = function () {
    if (this.killed) return;
    this.target = rand();
    this.sc = cur(this); this.tc = { r: 0, g: 0, b: 0 }; this.cw = 0;
    this.killed = true;
  };
  function cur(p) {
    return {
      r: p.sc.r + (p.tc.r - p.sc.r) * p.cw,
      g: p.sc.g + (p.tc.g - p.sc.g) * p.cw,
      b: p.sc.b + (p.tc.b - p.sc.b) * p.cw
    };
  }

  var particles = [], frame = 0, wi = 0, raf = 0, off, octx;
  function build(word) {
    off = off || document.createElement('canvas');
    off.width = W; off.height = H; octx = off.getContext('2d');
    octx.clearRect(0, 0, W, H);
    octx.fillStyle = '#fff';
    var fs = Math.min(W * 0.16, 150);
    octx.font = '800 ' + fs + 'px "Helvetica Neue",Arial,sans-serif';
    octx.textAlign = 'center'; octx.textBaseline = 'middle';
    octx.fillText(word, W / 2, H / 2);
    var px = octx.getImageData(0, 0, W, H).data;
    var col = COLORS[wi % COLORS.length], nc = { r: col[0], g: col[1], b: col[2] };
    var idxs = [];
    for (var i = 0; i < px.length; i += STEP * 4) idxs.push(i);
    for (var k = idxs.length - 1; k > 0; k--) { var j = Math.random() * (k + 1) | 0; var t = idxs[k]; idxs[k] = idxs[j]; idxs[j] = t; }
    var pi = 0;
    for (var c = 0; c < idxs.length; c++) {
      var pix = idxs[c];
      if (px[pix + 3] > 0) {
        var x = (pix / 4) % W, y = (pix / 4 / W) | 0, p;
        if (pi < particles.length) { p = particles[pi]; p.killed = false; pi++; }
        else { p = new Particle(); particles.push(p); }
        p.sc = cur(p); p.tc = nc; p.cw = 0; p.target.x = x; p.target.y = y;
      }
    }
    for (var m = pi; m < particles.length; m++) particles[m].kill();
  }

  function loop() {
    ctx.fillStyle = 'rgba(5,5,5,0.14)';   // motion blur + oscurece (legibilidad)
    ctx.fillRect(0, 0, W, H);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i]; p.move(); p.draw();
      if (p.killed && (p.pos.x < -50 || p.pos.x > W + 50 || p.pos.y < -50 || p.pos.y > H + 50)) particles.splice(i, 1);
    }
    if (++frame % 300 === 0) { wi = (wi + 1) % WORDS.length; build(WORDS[wi]); }
    raf = requestAnimationFrame(loop);
  }

  function start() { resize(); particles = []; frame = 0; wi = 0; build(WORDS[0]); cancelAnimationFrame(raf); loop(); }
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(start, 250); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cancelAnimationFrame(raf); else loop();
  });
  start();
})();
