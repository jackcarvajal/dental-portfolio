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

  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.gal-real .gal-btn') : null;
    if (!b) return;
    if (!visor) crear();
    if (typeof visor.showModal !== 'function') return; // navegador muy viejo: se queda la miniatura
    lista = Array.prototype.slice.call(b.closest('.gal-real').querySelectorAll('.gal-btn'));
    mostrar(lista.indexOf(b));
    if (!visor.open) visor.showModal();
  });
})();
