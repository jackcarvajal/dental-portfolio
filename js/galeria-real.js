/* Visor de la galería de trabajo real (css/galeria-real.css).
   Clic en una foto → se amplía en un <dialog> sin salir de la página; flechas para recorrer la misma galería,
   Esc o clic fuera para cerrar. */
(function () {
  'use strict';
  var visor, img, cap, prev, next, lista = [], idx = 0;

  function crear() {
    visor = document.createElement('dialog');
    visor.className = 'gal-visor';
    visor.setAttribute('aria-label', 'Foto ampliada');
    visor.innerHTML =
      '<button type="button" class="gal-cerrar" aria-label="Cerrar">&times;</button>' +
      '<button type="button" class="gal-prev" aria-label="Foto anterior">&#8249;</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="gal-next" aria-label="Foto siguiente">&#8250;</button>';
    document.body.appendChild(visor);
    img = visor.querySelector('img');
    cap = visor.querySelector('figcaption');
    prev = visor.querySelector('.gal-prev');
    next = visor.querySelector('.gal-next');
    visor.querySelector('.gal-cerrar').addEventListener('click', function () { visor.close(); });
    prev.addEventListener('click', function () { mostrar(idx - 1); });
    next.addEventListener('click', function () { mostrar(idx + 1); });
    visor.addEventListener('click', function (e) { if (e.target === visor) visor.close(); });
    visor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') mostrar(idx - 1);
      else if (e.key === 'ArrowRight') mostrar(idx + 1);
    });
  }

  function mostrar(i) {
    idx = (i + lista.length) % lista.length;
    var b = lista[idx];
    var miniatura = b.querySelector('img');
    var fig = b.closest('figure');
    var texto = fig && fig.querySelector('figcaption');
    img.src = b.getAttribute('data-grande') || (miniatura && miniatura.src) || '';
    img.alt = miniatura ? miniatura.alt : '';
    cap.textContent = texto ? texto.textContent : '';
    var varias = lista.length > 1;
    prev.style.display = varias ? '' : 'none';
    next.style.display = varias ? '' : 'none';
  }

  /* Videos cortos (.gal-video): en silencio y en bucle; arrancan cuando se ven y se pausan al salir de pantalla.
     Con «reducir movimiento» o ahorro de datos no arrancan solos: se reproducen con un clic. */
  var quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ahorro = navigator.connection && navigator.connection.saveData;
  var videos = Array.prototype.slice.call(document.querySelectorAll('.gal-video video'));
  function marcar(v) { var f = v.closest('.gal-video'); if (f) f.classList.toggle('pausado', v.paused); }
  function reproducir(v) { var p = v.play(); if (p && p.catch) p.catch(function () { marcar(v); }); }
  videos.forEach(function (v) {
    v.muted = true;
    v.addEventListener('play', function () { marcar(v); });
    v.addEventListener('pause', function () { marcar(v); });
    marcar(v);
  });
  if (videos.length && 'IntersectionObserver' in window && !quieto && !ahorro) {
    /* 1) Precarga: cuando el video está a ~1 pantalla de aparecer, el navegador empieza a bajarlo completo.
          Antes se bajaba recién al verse (preload="none") y con 3 videos a la vez se trababa al arrancar. */
    var pre = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        var v = en.target; pre.unobserve(v);
        v.preload = 'auto';
        try { v.load(); } catch (_) {}
      });
    }, { rootMargin: '900px 0px' });
    /* 2) Reproducción: arranca cuando se ve al menos la mitad; se pausa al salir de pantalla. */
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && en.intersectionRatio >= 0.5) { if (!v.dataset.pausaManual) reproducir(v); }
        else if (!en.isIntersecting && !v.paused) v.pause();
      });
    }, { threshold: [0, 0.5] });
    videos.forEach(function (v) { pre.observe(v); io.observe(v); });
  }

  document.addEventListener('click', function (e) {
    var cv = e.target && e.target.closest ? e.target.closest('.gal-real .gal-vid') : null;
    if (cv) {
      var v = cv.querySelector('video');
      if (!v) return;
      if (v.paused) { delete v.dataset.pausaManual; reproducir(v); }
      else { v.dataset.pausaManual = '1'; v.pause(); }
      return;
    }
    var b = e.target && e.target.closest ? e.target.closest('.gal-real .gal-btn') : null;
    if (!b) return;
    if (!visor) crear();
    if (typeof visor.showModal !== 'function') return; // navegador muy viejo: se queda la miniatura
    lista = Array.prototype.slice.call(b.closest('.gal-real').querySelectorAll('.gal-btn'));
    mostrar(lista.indexOf(b));
    if (!visor.open) visor.showModal();
  });
})();
