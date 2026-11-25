/* PRODIGY — anima el hero de las páginas que no tenían efecto (25-nov-2026, pedido de Alejandro).
   Uso: en el elemento del hero  data-hero-fx="sonar|particulas|cintas"  (+ opcional data-fx-color / data-colors)
        y este script con defer. Carga el efecto en tiempo libre (requestIdleCallback), deja el contenido del
        hero por encima y no bloquea toques (pointer-events:none). Cada efecto ya respeta «reducir movimiento»
        y se pausa con la pestaña oculta. Reutiliza los efectos de siempre: sonar-grid, particle-hero, aether-ribbon. */
(function () {
  'use strict';
  var hero = document.querySelector('[data-hero-fx]');
  if (!hero) return;
  var tipo = hero.getAttribute('data-hero-fx');
  // carpeta js/ tomada de este mismo script (así sirve también en /en/, donde la ruta relativa es ../js/)
  var yo = document.currentScript && document.currentScript.src;
  var JS = yo ? yo.replace(/hero-animado\.js[^/]*$/, '') : '/js/';

  function capa() {
    var d = document.createElement('div');
    d.className = 'hero-fx-capa';
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden';
    hero.insertBefore(d, hero.firstChild);
    return d;
  }
  function preparar() {
    var cs = getComputedStyle(hero);
    if (cs.position === 'static') hero.style.position = 'relative';
    if (cs.overflow === 'visible') hero.style.overflow = 'hidden';
    hero.style.isolation = 'isolate';
    // el contenido del hero va encima del efecto; lo que ya está posicionado (adornos, fotos de fondo) no se toca
    [].forEach.call(hero.children, function (ch) {
      if (ch.classList.contains('hero-fx-capa')) return;
      if (getComputedStyle(ch).position === 'static') { ch.style.position = 'relative'; ch.style.zIndex = '1'; }
    });
  }
  function cargar(src, attrs, cb) {
    var s = document.createElement('script');
    s.src = src;
    if (attrs) for (var k in attrs) s.setAttribute(k, attrs[k]);
    if (cb) s.onload = cb;
    document.body.appendChild(s);
  }
  function arrancar() {
    if (tipo === 'sonar') {
      var c = capa(); preparar();
      cargar(JS + 'sonar-grid.js?v=20261110', null, function () {
        if (window.SonarGrid) window.SonarGrid.mount({ container: c, color: hero.getAttribute('data-fx-color') || '#00d2ff',
          baseOpacity: 0.16, pingEvery: 3.6, ringWidth: 100, interactive: true });
      });
    } else if (tipo === 'particulas') {
      if (document.getElementById('phero')) return; // ya hay uno en la página
      var c2 = capa(); preparar();
      var cv = document.createElement('canvas');
      cv.id = 'phero'; cv.className = 'phero';
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
      c2.appendChild(cv);
      cargar(JS + 'particle-hero.js?v=20260810', { 'data-count': hero.getAttribute('data-fx-cantidad') || '56', 'data-links': '1' });
    } else if (tipo === 'cintas') {
      preparar();
      hero.setAttribute('data-aether', '');
      if (!hero.getAttribute('data-colors')) hero.setAttribute('data-colors', '#D946A6,#D4AF37,#00d2ff');
      cargar(JS + 'aether-ribbon.js?v=20260808');
    }
  }
  if ('requestIdleCallback' in window) window.requestIdleCallback(arrancar, { timeout: 1800 });
  else setTimeout(arrancar, 600);
})();
