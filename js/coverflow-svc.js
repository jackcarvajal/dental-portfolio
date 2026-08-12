/* coverflow-svc.js — coverflow 3D para las tarjetas de servicios (vanilla, self-contained)
   Adaptación a Vanilla del componente React "coverflow-carousel".
   Estructura esperada:
     <div class="svc-coverflow" id="svc-carousel"> <a class="idx-svc-card" data-cat="…">…</a> … </div>
     <button id="svc-prev"> <button id="svc-next">
   · la tarjeta central va al frente y navega al hacer click
   · las laterales rotan/retroceden; click en una lateral la trae al centro
   · flechas prev/next, teclado ←/→, arrastre/swipe
   · FILTRO POR CATEGORÍA (opcional): botones .svc-chip[data-cat] filtran las tarjetas
     por su atributo data-cat (multi-valor separado por espacios). Retro-compatible:
     si no hay chips, se comporta como antes.
   · respeta prefers-reduced-motion (sin transición) */
(function () {
  function init() {
    var stage = document.getElementById('svc-carousel');
    if (!stage) return;
    var all = [].slice.call(stage.querySelectorAll('.idx-svc-card, .svc-card'));
    if (!all.length) return;
    var cards = all;              // vista actual (puede ser un subconjunto filtrado)
    var prev = document.getElementById('svc-prev');
    var next = document.getElementById('svc-next');
    var active = 0;
    var swipedAt = 0;

    function spread() {
      var w = stage.clientWidth || 900;
      return Math.max(120, Math.min(190, w * 0.2));
    }
    function layout() {
      var S = spread();
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i], d = i - active, ad = Math.abs(d);
        if (ad > 3) {
          c.style.opacity = 0;
          c.style.pointerEvents = 'none';
          c.style.transform = 'translate(-50%,-50%) translateX(' + (d * S * 1.25) + 'px) translateZ(-640px)';
          c.classList.remove('cf-active');
          c.setAttribute('aria-hidden', 'true');
          continue;
        }
        var x = d * S;
        var z = -ad * 120;
        var rot = Math.max(-50, Math.min(50, -d * 34));
        var sc = d === 0 ? 1 : 0.86;
        c.style.transform = 'translate(-50%,-50%) translateX(' + x + 'px) translateZ(' + z + 'px) rotateY(' + rot + 'deg) scale(' + sc + ')';
        c.style.opacity = d === 0 ? 1 : (ad === 1 ? 0.72 : 0.42);
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
    function center() { active = cards.length ? Math.floor((cards.length - 1) / 2) : 0; }

    // Filtro por categoría (data-cat multi-valor). cat vacío o 'todos' → todas.
    function setFilter(cat) {
      cards = (!cat || cat === 'todos') ? all : all.filter(function (c) {
        return (' ' + (c.dataset.cat || '') + ' ').indexOf(' ' + cat + ' ') > -1;
      });
      // ocultar las tarjetas fuera de la vista
      all.forEach(function (c) {
        if (cards.indexOf(c) === -1) {
          c.style.opacity = 0;
          c.style.pointerEvents = 'none';
          c.style.transform = 'translate(-50%,-50%) translateZ(-900px)';
          c.setAttribute('aria-hidden', 'true');
          c.classList.remove('cf-active');
        }
      });
      center();
      layout();
    }

    // click: índice dinámico contra la vista actual
    all.forEach(function (c) {
      c.addEventListener('click', function (e) {
        if (Date.now() - swipedAt < 250) { e.preventDefault(); return; } // recién arrastramos
        var i = cards.indexOf(this);
        if (i === -1) { e.preventDefault(); return; } // no visible en el filtro actual
        if (i !== active) { e.preventDefault(); setActive(i); }
      });
    });
    if (prev) prev.addEventListener('click', function () { setActive(active - 1); });
    if (next) next.addEventListener('click', function () { setActive(active + 1); });

    // Chips de categoría (opcional)
    var chips = [].slice.call(document.querySelectorAll('.svc-chip'));
    if (chips.length) {
      var cta = document.getElementById('svc-flow-cta');
      chips.forEach(function (ch) {
        ch.addEventListener('click', function () {
          chips.forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
          ch.classList.add('active'); ch.setAttribute('aria-pressed', 'true');
          setFilter(ch.dataset.cat);
          if (cta) {
            if (ch.dataset.flow) {
              cta.href = ch.dataset.flow;
              var lbl = cta.querySelector('span');
              if (lbl) lbl.textContent = 'Pedir por ' + (ch.dataset.flowlabel || 'este flujo');
              cta.style.display = '';
            } else {
              cta.style.display = 'none';
            }
          }
        });
      });
    }

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
    center();
    layout();
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
