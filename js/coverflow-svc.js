/* coverflow-svc.js — coverflow 3D para las tarjetas de servicios (vanilla, self-contained)
   Adaptación a Vanilla del componente React "coverflow-carousel".
   Estructura esperada:
     <div class="svc-coverflow" id="svc-carousel"> <a class="idx-svc-card">…</a> … </div>
     <button id="svc-prev"> <button id="svc-next">
   · la tarjeta central va al frente y navega al hacer click
   · las laterales rotan/retroceden; click en una lateral la trae al centro
   · flechas prev/next, teclado ←/→, arrastre/swipe
   · respeta prefers-reduced-motion (sin transición) */
(function () {
  function init() {
    var stage = document.getElementById('svc-carousel');
    if (!stage) return;
    var cards = [].slice.call(stage.querySelectorAll('.idx-svc-card, .svc-card'));
    if (!cards.length) return;
    var prev = document.getElementById('svc-prev');
    var next = document.getElementById('svc-next');
    var active = 0;
    var swipedAt = 0;

    function spread() {
      var w = stage.clientWidth || 900;
      return Math.max(92, Math.min(150, w * 0.17));
    }
    function layout() {
      var S = spread();
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i], d = i - active, ad = Math.abs(d);
        if (ad > 3) {
          c.style.opacity = 0;
          c.style.pointerEvents = 'none';
          c.style.transform = 'translate(-50%,-50%) translateX(' + (d * S * 1.25) + 'px) translateZ(-620px)';
          c.classList.remove('cf-active');
          c.setAttribute('aria-hidden', 'true');
          continue;
        }
        var x = d * S;
        var z = -ad * 145;
        var rot = Math.max(-55, Math.min(55, -d * 38));
        var sc = d === 0 ? 1 : 0.8;
        c.style.transform = 'translate(-50%,-50%) translateX(' + x + 'px) translateZ(' + z + 'px) rotateY(' + rot + 'deg) scale(' + sc + ')';
        c.style.opacity = d === 0 ? 1 : (ad === 1 ? 0.6 : 0.32);
        c.style.zIndex = 100 - ad;
        c.style.pointerEvents = 'auto';
        c.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
        c.classList.toggle('cf-active', d === 0);
      }
      if (prev) prev.disabled = active <= 0;
      if (next) next.disabled = active >= cards.length - 1;
    }
    function setActive(i) {
      active = Math.max(0, Math.min(cards.length - 1, i));
      layout();
    }

    cards.forEach(function (c, i) {
      c.addEventListener('click', function (e) {
        // recién arrastramos → no navegar
        if (Date.now() - swipedAt < 250) { e.preventDefault(); return; }
        // no es la central → traerla al centro en vez de navegar
        if (i !== active) { e.preventDefault(); setActive(i); }
      });
    });
    if (prev) prev.addEventListener('click', function () { setActive(active - 1); });
    if (next) next.addEventListener('click', function () { setActive(active + 1); });

    stage.tabIndex = 0;
    stage.setAttribute('role', 'listbox');
    stage.setAttribute('aria-label', 'Servicios de laboratorio digital');
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); setActive(active + 1); }
    });

    // arrastre / swipe
    var sx = 0, drag = false;
    stage.addEventListener('pointerdown', function (e) { drag = true; sx = e.clientX; stage.classList.add('grabbing'); });
    window.addEventListener('pointerup', function (e) {
      if (!drag) return;
      drag = false; stage.classList.remove('grabbing');
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 45) { swipedAt = Date.now(); setActive(active + (dx < 0 ? 1 : -1)); }
    });

    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
    layout();
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
