/* ── Ondas de luz con WebGL (oct-2026) ───────────────────────────────────────────────────────────────────────────
   Versión en JS plano del componente «WebGLShader» (three.js + React) que pidió Alejandro: tres ondas de luz que
   se cruzan, con los colores de la marca (magenta · oro · cian) en vez de rojo/verde/azul. WebGL puro, sin three.js.
   Uso:  <canvas data-ondas data-desplazar="0.55" aria-hidden="true"></canvas>  dentro de un contenedor con position:relative.
   · Arranca en reposo (requestIdleCallback), se pausa fuera de pantalla o con la pestaña oculta,
     con «reducir movimiento» se dibuja un solo cuadro, y sin WebGL queda el fondo del contenedor. */
(function () {
  'use strict';
  if (window.OndasShader) return;
  var QUIETO = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = 'precision highp float;uniform vec2 res;uniform float t;uniform float off;' +
    'const vec3 MG=vec3(.851,.275,.651);const vec3 GO=vec3(.831,.686,.216);const vec3 CY=vec3(0.,.824,1.);' +
    'void main(){vec2 p=(gl_FragCoord.xy*2.-res)/min(res.x,res.y);float d=length(p)*.05;' +
    'float y=p.y+off*res.y/min(res.x,res.y);float a=.018/abs(y+sin((p.x*(1.+d)+t)*1.)*.35);float b=.018/abs(y+sin((p.x+t)*1.)*.35);float c=.018/abs(y+sin((p.x*(1.-d)+t)*1.)*.35);' +
    'vec3 col=min(a*MG+b*GO+c*CY,vec3(1.));gl_FragColor=vec4(col+vec3(.02),1.);}';
  function montar(cv) {
    if (cv.__ondas) return; cv.__ondas = 1;
    var gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) { cv.style.display = 'none'; return; }
    function sh(tipo, src) { var s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { cv.style.display = 'none'; return; }
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.style.display = 'none'; return; }
    gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(pr, 'res'), uT = gl.getUniformLocation(pr, 't');
    gl.uniform1f(gl.getUniformLocation(pr, 'off'), +cv.getAttribute('data-desplazar') || 0);   // mueve las ondas (ej. 0.55 = más abajo)
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5), tiempo = 0, raf = 0, visible = true, antes = 0;
    function medir() { var r = cv.getBoundingClientRect(); cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr)); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(uRes, cv.width, cv.height); }
    function dibujar() { gl.uniform1f(uT, tiempo); gl.drawArrays(gl.TRIANGLES, 0, 6); }
    function bucle(ahora) { raf = 0; if (!visible || document.hidden) return; tiempo += Math.min(0.05, (ahora - (antes || ahora)) / 1000 * 0.6); antes = ahora; dibujar(); raf = requestAnimationFrame(bucle); }
    function seguir() { if (!QUIETO && !raf && visible && !document.hidden) { antes = 0; raf = requestAnimationFrame(bucle); } }
    medir(); tiempo = 1.3; dibujar(); cv.style.opacity = '1';
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { medir(); dibujar(); }, 150); });
    if (QUIETO) return;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; seguir(); }).observe(cv);
    document.addEventListener('visibilitychange', seguir);
    seguir();
  }
  function todo() { [].forEach.call(document.querySelectorAll('canvas[data-ondas]'), montar); }
  window.OndasShader = { montar: montar };
  var ya = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(todo); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ya); else ya();
})();
