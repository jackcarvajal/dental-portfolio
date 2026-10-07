/* ── Robot del asistente IA (oct-2026) ──────────────────────────────────────────────────────────────────────────
   Port a JavaScript simple (three.js, sin React) del componente «RobotHero» (@react-three/fiber): la cabeza y el cuerpo
   siguen el cursor, parpadea y al tocarlo pone ojos de corazón y abre el asistente IA del menú (_phdrToggleIA).
     <button type="button" class="robot-ia" data-robot-ia data-pantalla="#00d2ff" data-antena="#D946A6"
             aria-label="Abrir asistente IA"></button>
     <script src="js/robot-ia.js?v=…" defer></script>
   3D solo en computador (puntero fino, ≥900 px) y sin «reducir movimiento»: three.js se descarga cuando el robot entra en
   pantalla y el navegador está libre; el dibujo corre solo mientras se ve y la pestaña está activa. En celular y mientras
   carga queda la figura fija (SVG). Mismo three que los visores STL (caché compartida). */
(function () {
  'use strict';
  var THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

  function estilos() {
    if (document.getElementById('robot-ia-css')) return;
    var s = document.createElement('style'); s.id = 'robot-ia-css';
    s.textContent = '.robot-ia{display:block;position:relative;width:100%;max-width:380px;height:230px;margin:0 auto 6px;padding:0;border:0;background:none;color:inherit;cursor:pointer;border-radius:20px}' +
      '.robot-ia:focus-visible{outline:2px solid #00d2ff;outline-offset:4px}' +
      '.robot-ia-fijo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:150px;height:140px;filter:drop-shadow(0 0 18px rgba(0,210,255,.3))}' +
      '.robot-ia canvas{position:absolute;inset:0;width:100%!important;height:100%!important;opacity:0;transition:opacity .6s}' +
      '.robot-ia--3d canvas{opacity:1}.robot-ia--3d .robot-ia-fijo{display:none}' +
      '.robot-ia .r-cor{display:none}.robot-ia.amor .r-cor{display:inline}.robot-ia.amor .r-ojo{display:none}' +
      '@media(max-width:899px),(pointer:coarse){.robot-ia{height:118px}.robot-ia-fijo{width:112px;height:104px}}';
    document.head.appendChild(s);
  }

  // Figura fija: celular, «reducir movimiento» y mientras llega three.js
  function svgFijo(o) {
    function cor(cx, cy) { return '<path class="r-cor" fill="' + o.corazon + '" transform="translate(' + cx + ' ' + cy + ') scale(1.5)" d="M0 3C-6-2-5-7-2.5-7-1-7 0-6 0-4.5 0-6 1-7 2.5-7 5-7 6-2 0 3Z"/>'; }
    return '<svg class="robot-ia-fijo" viewBox="0 0 160 150" aria-hidden="true" focusable="false">' +
      '<ellipse cx="80" cy="142" rx="46" ry="6" fill="' + o.pantalla + '" opacity=".28"/>' +
      '<circle cx="80" cy="110" r="34" fill="' + o.chasis + '"/><ellipse cx="80" cy="84" rx="27" ry="6" fill="#d9dcdf"/>' +
      '<line x1="42" y1="46" x2="34" y2="24" stroke="#d0d0d0" stroke-width="2"/><circle cx="33" cy="22" r="3.5" fill="' + o.antena + '"/>' +
      '<line x1="118" y1="46" x2="126" y2="24" stroke="#d0d0d0" stroke-width="2"/><circle cx="127" cy="22" r="3.5" fill="' + o.antena + '"/>' +
      '<rect x="38" y="46" width="9" height="20" rx="3.5" fill="#e8e8e8"/><rect x="113" y="46" width="9" height="20" rx="3.5" fill="#e8e8e8"/>' +
      '<circle cx="80" cy="56" r="35" fill="#0d0f12" stroke="' + o.pantalla + '" stroke-width="2.5"/>' +
      '<rect class="r-ojo" x="63" y="47" width="11" height="17" rx="4.5" fill="none" stroke="#fff" stroke-width="2.6"/>' +
      '<rect class="r-ojo" x="86" y="47" width="11" height="17" rx="4.5" fill="none" stroke="#fff" stroke-width="2.6"/>' +
      cor(68.5, 57) + cor(91.5, 57) + '</svg>';
  }

  function iniciar3D(el, o, estado) {
    return import(THREE_CDN).then(function (T) {
      var W = el.clientWidth || 380, H = el.clientHeight || 230, renderer;
      try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); } catch (e) { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H, false);
      var cv = renderer.domElement; cv.setAttribute('aria-hidden', 'true');

      var scene = new T.Scene();
      var cam = new T.PerspectiveCamera(36, W / H, 0.1, 50);
      cam.position.set(0, 0, 2.55); cam.lookAt(0, -0.13, 0);
      scene.add(new T.AmbientLight(0xffffff, 0.5));
      scene.add(new T.HemisphereLight(0xffffff, 0x1a2332, 0.9));
      var luz = new T.DirectionalLight(0xffffff, 1.7); luz.position.set(-2, 3, 3); scene.add(luz);
      var contra = new T.DirectionalLight(new T.Color(o.pantalla), 1.3); contra.position.set(2.5, 1, -2); scene.add(contra);

      // Textura moteada del chasis (igual que el original: 10.000 puntos en lienzo de 512)
      var N = 512, cc = document.createElement('canvas'), cb = document.createElement('canvas');
      cc.width = cc.height = cb.width = cb.height = N;
      var xc = cc.getContext('2d'), xb = cb.getContext('2d');
      xc.fillStyle = '#dcdcdc'; xc.fillRect(0, 0, N, N); xb.fillStyle = '#808080'; xb.fillRect(0, 0, N, N);
      for (var i = 0; i < 10000; i++) {
        var px = Math.random() * N, py = Math.random() * N, r = 0.5 + Math.random() * 1.5, osc = Math.random() > 0.15;
        xc.beginPath(); xc.arc(px, py, r, 0, 6.2832); xc.fillStyle = osc ? '#222222' : '#dddddd'; xc.fill();
        xb.beginPath(); xb.arc(px, py, r, 0, 6.2832); xb.fillStyle = osc ? '#000000' : '#ffffff'; xb.fill();
      }
      var tc = new T.CanvasTexture(cc), tb = new T.CanvasTexture(cb);
      tc.colorSpace = T.SRGBColorSpace;
      [tc, tb].forEach(function (t) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(6, 3); });
      var chasis = new T.MeshStandardMaterial({ color: o.chasis, map: tc, bumpMap: tb, bumpScale: 0.005, roughness: 1, metalness: 0 });
      var chasisD = chasis.clone(); chasisD.side = T.DoubleSide;

      // Cuerpo: esfera abierta arriba + bisel + cuello torneado
      var cuerpo = new T.Group(); cuerpo.position.y = -0.3; scene.add(cuerpo);
      cuerpo.add(new T.Mesh(new T.SphereGeometry(0.43, 64, 64, 0, Math.PI * 2, Math.PI * 0.15, Math.PI * 0.85), chasisD));
      var bisel = new T.Mesh(new T.TorusGeometry(0.235, 0.025, 32, 64), chasis); bisel.position.y = 0.34; bisel.rotation.x = Math.PI / 2; cuerpo.add(bisel);
      var perfil = [[0.1, -0.05], [0.215, -0.05], [0.28, 0.02], [0.295, 0.045], [0.27, 0.055], [0.1, 0.055]].map(function (p) { return new T.Vector2(p[0], p[1]); });
      var cuello = new T.Mesh(new T.LatheGeometry(perfil, 64), chasisD); cuello.position.y = 0.38; cuerpo.add(cuello);

      // Cabeza: esfera oscura + cápsula de vidrio (fresnel aditivo con el color de pantalla)
      var cabeza = new T.Group(); cabeza.position.y = 0.6; cuerpo.add(cabeza);
      cabeza.add(new T.Mesh(new T.SphereGeometry(0.28, 64, 64), new T.MeshStandardMaterial({ color: 0x0d0f12, roughness: 0.55 })));
      cabeza.add(new T.Mesh(new T.SphereGeometry(0.3, 64, 64), new T.ShaderMaterial({
        uniforms: { color: { value: new T.Color(o.pantalla) }, power: { value: 3.8 }, intensity: { value: 1.2 } },
        vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vV = -mv.xyz; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'uniform vec3 color; uniform float power; uniform float intensity; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - max(dot(normalize(vV), normalize(vN)), 0.0), power); gl_FragColor = vec4(color, f * intensity);\n#include <colorspace_fragment>\n}',
        transparent: true, blending: T.AdditiveBlending, depthWrite: false
      })));

      // Ojos: dos «corchetes» redondeados (arriba/abajo) o un corazón
      var matOjo = new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
      var matCor = new T.MeshBasicMaterial({ color: new T.Color(o.corazon), toneMapped: false });
      var corazon = new T.Curve();
      corazon.getPoint = function (t, v) {
        v = v || new T.Vector3(); t *= Math.PI * 2;
        var x = 16 * Math.pow(Math.sin(t), 3), y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        return v.set(x * 0.002, (y + 6) * 0.002, 0);
      };
      var geoCor = new T.TubeGeometry(corazon, 64, 0.0035, 8, true);
      function V(x, y) { return new T.Vector3(x, y, 0); }
      function trazo(s) {
        var w = 0.025, h = 0.035, rr = 0.02, g = 0.005, p = new T.CurvePath();
        p.add(new T.LineCurve3(V(-w, s * g), V(-w, s * (h - rr))));
        p.add(new T.QuadraticBezierCurve3(V(-w, s * (h - rr)), V(-w, s * h), V(-w + rr, s * h)));
        p.add(new T.LineCurve3(V(-w + rr, s * h), V(w - rr, s * h)));
        p.add(new T.QuadraticBezierCurve3(V(w - rr, s * h), V(w, s * h), V(w, s * (h - rr))));
        p.add(new T.LineCurve3(V(w, s * (h - rr)), V(w, s * g)));
        return new T.TubeGeometry(p, 20, 0.0035, 8, false);
      }
      var geoArriba = trazo(1), geoAbajo = trazo(-1);
      function ojo(x, ry) {
        var g = new T.Group(), normal = new T.Group(), cor = new T.Mesh(geoCor, matCor);
        g.position.x = x; g.rotation.y = ry;
        normal.add(new T.Mesh(geoArriba, matOjo), new T.Mesh(geoAbajo, matOjo));
        cor.visible = false; g.add(normal, cor);
        g.userData = { normal: normal, cor: cor };
        return g;
      }
      var ojos = new T.Group(); ojos.position.set(0, -0.02, 0.29); cabeza.add(ojos);
      var oI = ojo(-0.07, -0.2), oD = ojo(0.07, 0.2); ojos.add(oI, oD);

      // Orejas con antena (la punta con el color de antena)
      var mBase = new T.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.5 }), mAro = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      var mCentro = new T.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 }), mPie = new T.MeshStandardMaterial({ color: 0x999999, roughness: 0.4, metalness: 0.5 });
      var mVara = new T.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.4, metalness: 0.2 }), mPunta = new T.MeshStandardMaterial({ color: new T.Color(o.antena), roughness: 0.2, toneMapped: false });
      function oreja(x, d) {
        var g = new T.Group(); g.position.x = x; g.scale.setScalar(1.3);
        var base = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.025, 32), mBase); base.rotation.z = Math.PI / 2;
        var aro = new T.Mesh(new T.TorusGeometry(0.032, 0.008, 16, 32), mAro); aro.position.x = d * 0.012; aro.rotation.y = Math.PI / 2;
        var centro = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.005, 32), mCentro); centro.position.x = d * 0.012; centro.rotation.z = Math.PI / 2;
        var ant = new T.Group(); ant.position.set(d * 0.015, 0.035, 0); ant.rotation.x = -0.4;
        var pie = new T.Mesh(new T.CylinderGeometry(0.006, 0.008, 0.02, 16), mPie); pie.position.y = 0.01;
        var vara = new T.Mesh(new T.CylinderGeometry(0.003, 0.003, 0.1, 8), mVara); vara.position.y = 0.06;
        var punta = new T.Mesh(new T.SphereGeometry(0.006, 16, 16), mPunta); punta.position.y = 0.11;
        ant.add(pie, vara, punta); g.add(base, aro, centro, ant);
        return g;
      }
      cabeza.add(oreja(-0.29, -1), oreja(0.29, 1));

      // Base luminosa (en fondo oscuro la sombra de contacto del original no se ve)
      var gc = document.createElement('canvas'); gc.width = gc.height = 128;
      var gx = gc.getContext('2d'), gr = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); gx.fillStyle = gr; gx.fillRect(0, 0, 128, 128);
      var base = new T.Mesh(new T.PlaneGeometry(1.5, 1.5), new T.MeshBasicMaterial({ map: new T.CanvasTexture(gc), color: new T.Color(o.pantalla), transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
      base.rotation.x = -Math.PI / 2; base.position.y = -0.79; scene.add(base);

      // Seguir el cursor en toda la ventana (normalizado respecto al centro del robot)
      var tx = 0, ty = 0;
      function lim(v) { return Math.max(-1, Math.min(1, v)); }
      window.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        tx = lim((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2));
        ty = lim(-(e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2));
      }, { passive: true });

      var reloj = new T.Clock(), raf = 0, visible = true, L = T.MathUtils.lerp;
      function cuadro() {
        raf = 0;
        if (!visible || document.hidden) return;
        var dt = Math.min(reloj.getDelta(), 0.1), t = reloj.elapsedTime, kc = Math.min(1, 10 * dt), kh = Math.min(1, 20 * dt);
        cuerpo.position.x = L(cuerpo.position.x, tx * 0.3, 0.35 * dt);
        var rel = tx - cuerpo.position.x / 2.5;
        cuerpo.rotation.y = L(cuerpo.rotation.y, -rel * 0.95, kc);
        cuerpo.rotation.x = L(cuerpo.rotation.x, -ty * 0.25, kc);
        cuerpo.rotation.z = L(cuerpo.rotation.z, -rel * 0.15, kc);
        cabeza.rotation.y = L(cabeza.rotation.y, rel * 1.8, kh);
        cabeza.rotation.x = L(cabeza.rotation.x, -ty * 0.3, kh);
        base.position.x = cuerpo.position.x;
        var amor = performance.now() < estado.corazonHasta, c = t % 3, sy = 1;
        if (c < 0.45 && !amor) sy = Math.max(0.05, 1 - Math.sin(c / 0.45 * Math.PI));
        [oI, oD].forEach(function (g) { g.userData.normal.visible = !amor; g.userData.cor.visible = amor; g.scale.set(1.1, 1.1 * sy, 1.1); });
        renderer.render(scene, cam);
        raf = requestAnimationFrame(cuadro);
      }
      function seguir() { if (!raf && visible && !document.hidden) { reloj.getDelta(); raf = requestAnimationFrame(cuadro); } }
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; seguir(); }).observe(el);
      document.addEventListener('visibilitychange', seguir);
      if ('ResizeObserver' in window) new ResizeObserver(function () {
        var w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
        renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); if (!raf) renderer.render(scene, cam);
      }).observe(el);

      el.appendChild(cv);
      renderer.render(scene, cam);
      el.classList.add('robot-ia--3d');
      estado.tres = true;
      seguir();
    }).catch(function () { /* sin red o sin WebGL: queda la figura fija */ });
  }

  function montar(el) {
    if (el._robotIA) return; el._robotIA = 1;
    var o = {
      pantalla: el.getAttribute('data-pantalla') || '#00d2ff', antena: el.getAttribute('data-antena') || '#D946A6',
      corazon: el.getAttribute('data-corazon') || '#D946A6', chasis: el.getAttribute('data-chasis') || '#c4c4c4'
    };
    var estado = { corazonHasta: 0, tres: false };
    el.innerHTML = svgFijo(o);
    el.addEventListener('click', function () {
      // Ojos de corazón un momento y luego el asistente
      estado.corazonHasta = performance.now() + 2000;
      el.classList.add('amor');
      setTimeout(function () { el.classList.remove('amor'); }, 1200);
      setTimeout(function () { if (window._phdrToggleIA) window._phdrToggleIA(); }, estado.tres ? 650 : 450);
    });
    var pc = window.matchMedia && matchMedia('(min-width: 900px) and (pointer: fine)').matches;
    var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!pc || quieto || !('IntersectionObserver' in window)) return;
    var libre = window.requestIdleCallback ? function (f) { requestIdleCallback(f, { timeout: 2500 }); } : function (f) { setTimeout(f, 300); };
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      libre(function () { iniciar3D(el, o, estado); });
    });
    io.observe(el);
  }

  function arrancar() { estilos(); document.querySelectorAll('[data-robot-ia]').forEach(montar); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
