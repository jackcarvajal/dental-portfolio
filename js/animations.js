/**
 * PRODIGY — Animaciones de entrada v3 (24-nov-2026)
 * Las mismas entradas al hacer scroll de la v2 (subir + aparecer, en cascada en tarjetas y pasos), pero sin GSAP:
 * IntersectionObserver + Web Animations del navegador. GSAP + ScrollTrigger pesaban ~40 KB y 2 descargas a un CDN
 * en cada página solo para esto.
 * Principio: las animaciones GUÍAN la atención, no la roban. Sin loops. Con «reducir movimiento» no se anima nada.
 * Nada queda oculto si este archivo falla: el estado inicial (transparente) lo pone la propia animación al empezar.
 */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}

  var SUAVE = 'cubic-bezier(.25,.46,.45,.94)';      // ≈ power2.out
  var REBOTE = 'cubic-bezier(.34,1.56,.64,1)';      // ≈ back.out

  function animar(el, o, retraso) {
    var desde = { opacity: 0, transform: 'translate(' + (o.x || 0) + 'px,' + (o.y || 0) + 'px) scale(' + (o.scale || 1) + ')' };
    el.animate([desde, { opacity: 1, transform: 'none' }], {
      duration: o.ms || 600, delay: retraso || 0, easing: o.easing || SUAVE, fill: 'backwards'
    });
  }

  // Un elemento se anima una sola vez, cuando su borde superior entra al 88 % de la pantalla. Lo que ya está a la vista
  // cuando carga este archivo no se anima: la persona ya lo vio y hacerlo desaparecer y volver es un parpadeo.
  function alEntrar(el, margen, fn) {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { rootMargin: '0px 0px -' + margen + '% 0px' });
    io.observe(el);
  }

  function reveal(selector, o) {
    document.querySelectorAll(selector).forEach(function (el) {
      alEntrar(el, 12, function () { animar(el, o, o.delay); });
    });
  }

  // Grupo: todos entran juntos en cascada cuando aparece el primero.
  function cascada(els, o) {
    if (!els.length) return;
    alEntrar(els[0], o.margen || 15, function () {
      Array.prototype.forEach.call(els, function (el, i) { animar(el, o, i * (o.paso || 80)); });
    });
  }

  function iniciar() {
    /* ── Secciones genéricas ── */
    reveal('section h2.section-header', { y: 30, ms: 700 });
    reveal('section .section-subtitle', { y: 20, delay: 100 });

    /* ── Portafolio de la portada: las tarjetas llegan después (las pinta otro script) ── */
    var portGrid = document.getElementById('idx-port-grid');
    if (portGrid) {
      var listo = function () { var c = portGrid.querySelectorAll('a'); if (!c.length) return false; cascada(c, { y: 32, ms: 550, paso: 100 }); return true; };
      if (!listo()) new MutationObserver(function (_, obs) { if (listo()) obs.disconnect(); }).observe(portGrid, { childList: true });
    }
    /* Portafolio (página): sus tarjetas ya tienen su propia entrada (.revealed en portafolio.html). No se animan aquí. */

    /* ── Flujos de pasos (diseno-remoto, fresado-cam) ── */
    ['.vflow-step', '.mflow-step', '.proc-step'].forEach(function (sel) {
      cascada(document.querySelectorAll(sel), { x: -20, ms: 450, paso: 80, margen: 20 });
    });

    /* ── caso.html ── */
    ['.caso-hero-card', '.viewer-wrap', '.gallery-grid', '.feedback-box'].forEach(function (sel) { reveal(sel, { y: 18, ms: 500 }); });
    cascada(document.querySelectorAll('.gallery-item'), { scale: 0.92, ms: 400, paso: 50, easing: REBOTE });

    /* ── Cifras ── */
    reveal('[data-stat], .stat-number, .count-num', { scale: 0.8, ms: 500, easing: REBOTE });

    /* ── Etiquetas del ecosistema ── */
    reveal('.eco-section-label', { y: 12, ms: 400 });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
