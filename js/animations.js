/**
 * PRODIGY — Animations Engine v1.0
 * GSAP + ScrollTrigger + CSS keyframes
 * Carga diferida: se ejecuta cuando GSAP ya está disponible
 */
(function () {
  'use strict';

  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* ── CONFIGURACIÓN GLOBAL ── */
    gsap.defaults({ ease: 'power2.out', duration: 0.7 });

    /* ── UTILIDAD: ¿elemento existe? ── */
    function q(sel) { return document.querySelectorAll(sel); }

    /* ══════════════════════════════════════════════════════
       1. HERO PRINCIPAL (index.html)
    ══════════════════════════════════════════════════════ */
    var heroTitle = document.querySelector('.section-header');
    if (heroTitle && heroTitle.closest('#hero, section')) {
      gsap.from('.section-header', { y: 40, opacity: 0, duration: 1, delay: 0.2 });
      gsap.from('.section-subtitle', { y: 30, opacity: 0, duration: 0.9, delay: 0.4 });
    }

    /* ══════════════════════════════════════════════════════
       2. ECO-CARDS — entrada al scroll en stagger
    ══════════════════════════════════════════════════════ */
    var ecoSections = q('.eco-section');
    ecoSections.forEach(function (section) {
      var cards = section.querySelectorAll('.eco-card');
      if (!cards.length) return;
      gsap.from(cards, {
        scrollTrigger: {
          trigger: section,
          start: 'top 82%',
          toggleActions: 'play none none none'
        },
        y: 28,
        opacity: 0,
        duration: 0.5,
        stagger: 0.055,
        ease: 'power3.out'
      });
    });

    /* ══════════════════════════════════════════════════════
       3. PORTAFOLIO INDEX — cards en stagger
    ══════════════════════════════════════════════════════ */
    var portGrid = document.getElementById('idx-port-grid');
    if (portGrid) {
      var observer = new MutationObserver(function () {
        var cards = portGrid.querySelectorAll('a');
        if (!cards.length) return;
        gsap.from(cards, {
          scrollTrigger: { trigger: portGrid, start: 'top 85%' },
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'back.out(1.4)'
        });
        observer.disconnect();
      });
      observer.observe(portGrid, { childList: true, subtree: true });
    }

    /* ══════════════════════════════════════════════════════
       4. PORTAFOLIO PAGE — case-cards stagger
    ══════════════════════════════════════════════════════ */
    var casesGrid = document.getElementById('casesGrid');
    if (casesGrid) {
      new MutationObserver(function () {
        var cards = casesGrid.querySelectorAll('.case-card');
        if (!cards.length) return;
        gsap.from(cards, {
          y: 36,
          opacity: 0,
          duration: 0.55,
          stagger: 0.07,
          ease: 'power2.out'
        });
      }).observe(casesGrid, { childList: true });
    }

    /* ══════════════════════════════════════════════════════
       5. FLUJO DE PASOS — entrada secuencial (diseno-remoto, fresado-cam)
    ══════════════════════════════════════════════════════ */
    ['.vflow-step', '.mflow-step', '.proc-step'].forEach(function (sel) {
      var steps = q(sel);
      if (!steps.length) return;
      gsap.from(steps, {
        scrollTrigger: {
          trigger: steps[0].parentElement,
          start: 'top 80%'
        },
        x: -30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      });
    });

    /* ══════════════════════════════════════════════════════
       6. SECCIONES GENÉRICAS — cualquier .section-card, .dark-section
    ══════════════════════════════════════════════════════ */
    q('.section-card, .dark-section, [data-anim="fade"]').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%' },
        y: 24,
        opacity: 0,
        duration: 0.6
      });
    });

    /* ══════════════════════════════════════════════════════
       7. CASO.HTML — secciones del caso
    ══════════════════════════════════════════════════════ */
    q('.caso-hero-card, .viewer-wrap, .gallery-grid, .feedback-box').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%' },
        y: 20,
        opacity: 0,
        duration: 0.65,
        ease: 'power2.out'
      });
    });

    q('.gallery-item').forEach(function (el, i) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 92%' },
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
        delay: i * 0.04,
        ease: 'back.out(1.3)'
      });
    });

    /* ══════════════════════════════════════════════════════
       8. STATS COUNT-UP (IntersectionObserver ya existe,
          solo añadimos el efecto de escala con GSAP)
    ══════════════════════════════════════════════════════ */
    q('[data-stat], .stat-number, .count-num').forEach(function (el) {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 85%' },
        scale: 0.6,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(2)'
      });
    });

    /* ══════════════════════════════════════════════════════
       9. HOVER MAGNÉTICO en tarjetas (eco-card + case-card)
    ══════════════════════════════════════════════════════ */
    q('.eco-card').forEach(function (card) {
      card.addEventListener('mouseenter', function (e) {
        gsap.to(card, { scale: 1.04, duration: 0.25, ease: 'power1.out' });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(card, { scale: 1, duration: 0.3, ease: 'power2.out' });
      });
    });

  } /* fin initGSAP */

  /* Esperar a que GSAP cargue (se inyecta vía footer.js async) */
  var _tries = 0;
  var _check = setInterval(function () {
    _tries++;
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      clearInterval(_check);
      initGSAP();
    }
    if (_tries > 30) clearInterval(_check); /* max 3 seg */
  }, 100);

})();
