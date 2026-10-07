/* ── Intro de lanzamiento con video al deslizar (oct-2026) ───────────────────────────────────────────────────────
   Port a JavaScript simple del componente React «MetroHero» (scroll-locked video hero): mientras la intro está activa
   la página no se mueve; la rueda, el dedo o las flechas avanzan y retroceden el video. Al terminar el video y seguir
   bajando, la página se suelta y baja al contenido; si el visitante vuelve arriba del todo, la intro se vuelve a enganchar.
     <section data-intro-video data-scrub="2400"> <video …> [data-intro-titulo] [data-intro-frase] [data-intro-pista]
              [data-intro-barra] [data-intro-saltar] </section>
   Diferencias con el original (a propósito): botón «Saltar intro», teclado (↓ ↑ Espacio RePág AvPág Inicio), sin bloqueo
   con «reducir movimiento», si el video no carga en 6 s se suelta sola, y en la misma visita ya no vuelve a bloquear. */
(function () {
  'use strict';
  var sec = document.querySelector('[data-intro-video]');
  if (!sec) return;
  var video = sec.querySelector('video'), titulo = sec.querySelector('[data-intro-titulo]'), frase = sec.querySelector('[data-intro-frase]');
  var pista = sec.querySelector('[data-intro-pista]'), barra = sec.querySelector('[data-intro-barra]'), saltar = sec.querySelector('[data-intro-saltar]');
  if (!video) return;
  var SCRUB = +sec.getAttribute('data-scrub') || 2400;
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var visto = false; try { visto = sessionStorage.getItem('prd_intro_visto') === '1'; } catch (e) {}

  var dur = 0, objetivo = 0, actual = 0, empezo = false, buscando = false, pendiente = null, raf = 0;
  var bloqueado = false, yBloqueo = 0, tY = 0, empujeFinal = 0;
  function lim(v) { return Math.min(1, Math.max(0, v)); }

  // ── carga del video (iOS no descarga nada hasta un play(): se reproduce y se pausa al instante) ──
  video.muted = true; video.playsInline = true;
  video.addEventListener('loadeddata', function () {
    dur = video.duration || 0; sec.classList.add('listo');
    if (quieto || visto) { objetivo = actual = 1; pintar(); buscar(dur * 0.98); }
  });
  video.addEventListener('error', soltarPorFalla);
  var tFalla = setTimeout(function () { if (!dur) soltarPorFalla(); }, 6000);
  function soltarPorFalla() { clearTimeout(tFalla); sec.classList.add('sin-video'); objetivo = actual = 1; pintar(); soltar(false); }
  try { var pp = video.play(); if (pp && pp.then) pp.then(function () { video.pause(); }).catch(function () {}); else video.pause(); } catch (e) {}

  video.addEventListener('seeked', function () {
    buscando = false;
    if (pendiente !== null) { var t = pendiente; pendiente = null; buscando = true; video.currentTime = t; }
  });
  function buscar(t) { if (buscando) { pendiente = t; return; } buscando = true; video.currentTime = t; }

  // ── bloqueo del scroll (body fijo: la técnica de los modales; overflow:hidden solo no basta en iOS) ──
  function bloquear() {
    if (bloqueado) return;
    bloqueado = true; yBloqueo = window.scrollY;
    var b = document.body.style;
    b.position = 'fixed'; b.top = -yBloqueo + 'px'; b.left = '0'; b.right = '0'; b.width = '100%'; b.overscrollBehavior = 'none';
    sec.classList.add('activa'); arrancar();
  }
  function soltar(bajar) {
    if (!bloqueado) { if (bajar) irAlContenido(); return; }
    bloqueado = false;
    var b = document.body.style;
    b.position = ''; b.top = ''; b.left = ''; b.right = ''; b.width = ''; b.overscrollBehavior = '';
    window.scrollTo(0, yBloqueo);
    sec.classList.remove('activa');
    try { sessionStorage.setItem('prd_intro_visto', '1'); } catch (e) {}
    if (bajar) irAlContenido();
  }
  function irAlContenido() { window.scrollTo({ top: sec.offsetTop + sec.offsetHeight, behavior: quieto ? 'auto' : 'smooth' }); }

  function sumar(dy) {
    if (objetivo >= 1 && dy > 0) {             // video terminado y sigue empujando hacia abajo → se suelta
      empujeFinal += dy; if (empujeFinal > 160) { empujeFinal = 0; soltar(true); }
      return;
    }
    empujeFinal = 0;
    objetivo = lim(objetivo + dy / SCRUB);
    if (objetivo > 0.001) empezo = true;
    arrancar();
  }

  // ── entrada: rueda, dedo y teclado ──
  window.addEventListener('wheel', function (e) {
    if (bloqueado) { e.preventDefault(); sumar(e.deltaY * (e.deltaMode === 1 ? 32 : 1)); return; }
    if (!quieto && window.scrollY <= 0 && e.deltaY < 0 && dur) { e.preventDefault(); bloquear(); sumar(e.deltaY); }   // volvió arriba: re-engancha
  }, { passive: false });
  window.addEventListener('touchstart', function (e) { tY = e.touches[0] ? e.touches[0].clientY : 0; }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    var y = e.touches[0] ? e.touches[0].clientY : tY, dy = tY - y; tY = y;
    if (bloqueado) { e.preventDefault(); sumar(dy * 2.2); return; }
    if (!quieto && window.scrollY <= 0 && dy < 0 && dur && objetivo > 0) { e.preventDefault(); bloquear(); sumar(dy * 2.2); }
  }, { passive: false });
  window.addEventListener('keydown', function (e) {
    if (!bloqueado || e.altKey || e.ctrlKey || e.metaKey) return;
    var tag = (e.target && e.target.tagName) || ''; if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    var paso = { ArrowDown: 160, PageDown: 600, ' ': 600, ArrowUp: -160, PageUp: -600 }[e.key];
    if (e.key === 'Home') { e.preventDefault(); objetivo = 0; arrancar(); return; }
    if (e.key === 'End') { e.preventDefault(); objetivo = 1; soltar(true); return; }
    if (paso) { e.preventDefault(); sumar(e.shiftKey && e.key === ' ' ? -600 : paso); }
  });
  if (saltar) saltar.addEventListener('click', function () { objetivo = 1; arrancar(); soltar(true); });

  // ── dibujo: el video sigue al progreso con inercia; título y frase con desenfoque ──
  function pintar() {
    var p = actual;
    video.style.transform = 'scale(' + (1 + p * 0.06) + ')';
    if (titulo) { var t = 1 - lim(p / 0.35); titulo.style.opacity = t; titulo.style.transform = 'translateY(' + ((1 - t) * -24) + 'px) scale(' + (0.96 + t * 0.04) + ')'; titulo.style.filter = 'blur(' + ((1 - t) * 10) + 'px)'; }
    if (frase) { var f = lim((p - 0.82) / 0.18); frase.style.opacity = f; frase.style.transform = 'translateY(' + ((1 - f) * 20) + 'px) scale(' + (0.97 + f * 0.03) + ')'; frase.style.filter = 'blur(' + ((1 - f) * 8) + 'px)'; }
    if (pista) pista.style.opacity = empezo || p > 0.001 ? '0' : '1';
    if (barra) barra.style.transform = 'scaleX(' + p + ')';
  }
  var ultimoT = -1;
  function cuadro() {
    raf = 0;
    actual += (objetivo - actual) * 0.18;
    if (Math.abs(objetivo - actual) < 0.0005) actual = objetivo;
    var t = actual * dur * 0.999;
    if (dur > 0 && Math.abs(t - ultimoT) > 0.02) { ultimoT = t; buscar(t); }   // no re-buscar el mismo cuadro
    pintar();
    if (actual !== objetivo) raf = requestAnimationFrame(cuadro);              // en reposo no gasta batería
  }
  function arrancar() { if (!raf) raf = requestAnimationFrame(cuadro); }

  // Solo bloquea si se entra arriba del todo, sin «reducir movimiento» y si no la vio ya en esta visita
  if (!quieto && !visto && window.scrollY < 10 && !location.hash) bloquear();
  else { objetivo = actual = 1; pintar(); }
})();
