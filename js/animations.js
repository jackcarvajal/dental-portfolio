/**
 * PRODIGY — Animations Engine v2.0
 * GSAP ScrollTrigger — solo entradas al scroll, sin loops ni distracciones.
 * Principio: las animaciones deben GUIAR la atención, no robarla.
 */
(function () {
  'use strict';

  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* Configuración conservadora */
    gsap.defaults({ ease: 'power2.out', duration: 0.6 });

    /* ── Utilidad ── */
    function reveal(selector, extra) {
      var els = document.querySelectorAll(selector);
      if (!els.length) return;
      els.forEach(function (el) {
        gsap.from(el, Object.assign({
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          y: 22, opacity: 0
        }, extra || {}));
      });
    }

    /* ── SECCIONES genéricas ── */
    reveal('section h2.section-header', { y: 30, duration: 0.7 });
    reveal('section .section-subtitle', { y: 20, delay: 0.1 });

    /* ── PORTAFOLIO index — stagger cuando JS inserta las tarjetas ── */
    var portGrid = document.getElementById('idx-port-grid');
    if (portGrid) {
      new MutationObserver(function (_, obs) {
        var cards = portGrid.querySelectorAll('a');
        if (!cards.length) return;
        obs.disconnect();
        gsap.from(cards, {
          scrollTrigger: { trigger: portGrid, start: 'top 85%' },
          y: 32, opacity: 0, duration: 0.55, stagger: 0.1, ease: 'power2.out'
        });
      }).observe(portGrid, { childList: true });
    }

    /* ── PORTAFOLIO página — stagger cuando JS inserta las tarjetas ── */
    var casesGrid = document.getElementById('casesGrid');
    if (casesGrid) {
      new MutationObserver(function (_, obs) {
        var cards = casesGrid.querySelectorAll('.case-card');
        if (!cards.length) return;
        obs.disconnect();
        gsap.from(cards, { y: 28, opacity: 0, duration: 0.5, stagger: 0.07 });
      }).observe(casesGrid, { childList: true });
    }

    /* ── FLUJOS DE PASOS (diseno-remoto, fresado-cam) ── */
    ['.vflow-step', '.mflow-step', '.proc-step'].forEach(function (sel) {
      var steps = document.querySelectorAll(sel);
      if (!steps.length) return;
      gsap.from(steps, {
        scrollTrigger: { trigger: steps[0].closest('section, div'), start: 'top 80%' },
        x: -20, opacity: 0, duration: 0.45, stagger: 0.08
      });
    });

    /* ── CASO.HTML ── */
    ['.caso-hero-card', '.viewer-wrap', '.gallery-grid', '.feedback-box'].forEach(function (sel) {
      reveal(sel, { y: 18, duration: 0.5 });
    });
    var galItems = document.querySelectorAll('.gallery-item');
    if (galItems.length) {
      gsap.from(galItems, {
        scrollTrigger: { trigger: galItems[0].closest('.gallery-grid'), start: 'top 88%' },
        scale: 0.92, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'back.out(1.2)'
      });
    }

    /* ── STATS ── */
    reveal('[data-stat], .stat-number, .count-num', { scale: 0.8, duration: 0.5, ease: 'back.out(1.4)' });

    /* ── ECO-SECTION labels ── */
    reveal('.eco-section-label', { y: 12, duration: 0.4 });

  }

  /* Esperar GSAP (se carga async vía footer) */
  var _t = 0;
  var _i = setInterval(function () {
    if (++_t > 40) return clearInterval(_i);
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      clearInterval(_i);
      /* Pequeño delay para no bloquear el paint inicial */
      setTimeout(initGSAP, 150);
    }
  }, 100);

})();
