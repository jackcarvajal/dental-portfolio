/* ── Puertas de tren que se abren al deslizar y dejan ver un video (oct-2026) ─────────────────────────────────────
   Reemplaza la intro «MetroHero» (que bloqueaba la página y movía el video cuadro a cuadro: con pocos cuadros clave se
   veían imágenes rotas). Aquí la página se desliza normal: la sección se queda fija mientras las puertas se abren con el
   scroll y, ya abiertas, el video se REPRODUCE (no se busca cuadro a cuadro) → se ve fluido.
     <section class="tren" data-puertas-video> … ver fresado-cam.html (vano, hojas, letrero, luz, textos) </section>
   El video solo se descarga cuando la sección se acerca, y se pausa cuando sale de pantalla.
   «Reducir movimiento»: puertas abiertas desde el inicio y video con controles (sin reproducción automática). */
(function () {
  'use strict';
  var CSS = [
    '.tren{position:relative;height:260vh;background:#06090f}',
    '.tren-fijo{position:sticky;top:var(--tren-top,0px);height:calc(100vh - var(--tren-top,0px));height:calc(100svh - var(--tren-top,0px));overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:clamp(20px,4vw,64px);padding:0 clamp(16px,4vw,64px)}',
    // Carrocería: panel metálico oscuro con la franja de marca a la altura de la cintura
    '.tren-fijo::before{content:"";position:absolute;inset:0;z-index:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.025) 0 1px,transparent 1px 180px),linear-gradient(180deg,#141b26 0%,#0c121b 55%,#080c12 100%)}',
    // La franja de la carrocería va atada al marco de la puerta para que siga a la de las hojas (a la misma altura)
    '.tren-marco{position:relative}',
    '.tren-marco::before{content:"";position:absolute;left:-100vw;right:-100vw;top:64%;height:10px;z-index:-1;background:linear-gradient(90deg,#D946A6,#D4AF37,#00d2ff) center/100vw 100% no-repeat;opacity:.85;box-shadow:0 0 24px rgba(212,175,55,.25)}',
    '.tren-fijo>*{position:relative;z-index:1}',
    '.tren-txt{z-index:2;max-width:420px;opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease}',
    '.tren-movil{display:none}.tren-txt.izq{justify-self:end;text-align:right}.tren-txt.der{justify-self:start}',
    '.tren.abierta .tren-txt{opacity:1;transform:none}',
    '.tren-ceja{font-size:.72rem;font-weight:800;letter-spacing:.24em;text-transform:uppercase;color:#00d2ff;margin-bottom:10px}',
    '.tren-txt h2{font-size:clamp(1.5rem,2.6vw,2.3rem);font-weight:900;line-height:1.12;margin-bottom:12px;text-wrap:balance}',
    '.tren-txt h2 em{font-style:normal;color:#D4AF37}',
    '.tren-txt p{color:#94a3b8;font-size:1rem;line-height:1.6}',
    '.tren-lista{list-style:none;display:flex;flex-direction:column;gap:12px;margin:0 0 20px;padding:0}',
    '.tren-lista li{display:flex;gap:10px;align-items:flex-start;color:#e2e8f0;font-size:.95rem;line-height:1.45}',
    '.tren-lista li i{color:#D946A6;margin-top:3px;width:16px;text-align:center;flex-shrink:0}',
    '.tren-cta{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;font-weight:800;font-size:.92rem;padding:12px 22px;border-radius:999px;text-decoration:none}',
    '.tren-cta:focus-visible{outline:2px solid #00d2ff;outline-offset:3px}',
    // Puerta: vano con marco de goma, letrero LED y luz de estado arriba
    '.tren-puerta{display:flex;flex-direction:column;align-items:center;gap:10px}',
    '.tren-letrero{font-family:"Courier New",ui-monospace,monospace;font-weight:700;font-size:clamp(.66rem,1vw,.8rem);letter-spacing:.14em;color:#ffb000;background:#140d00;border:1px solid #3a2a00;border-radius:6px;padding:6px 14px;text-shadow:0 0 8px rgba(255,176,0,.7);white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis}',
    '.tren-luz{display:flex;gap:6px}.tren-luz span{width:26px;height:6px;border-radius:3px;background:#2a1010;transition:background .3s,box-shadow .3s}',
    '.tren[data-estado="cerrada"] .tren-luz span{background:#e5342e;box-shadow:0 0 10px #e5342e}',
    '.tren[data-estado="abriendo"] .tren-luz span{background:#ffb000;box-shadow:0 0 10px #ffb000}',
    '.tren[data-estado="abierta"] .tren-luz span{background:#00FF41;box-shadow:0 0 10px #00FF41}',
    '.tren-vano{position:relative;height:min(calc((100vh - var(--tren-top,0px)) * .8 - 60px),780px);height:min(calc((100svh - var(--tren-top,0px)) * .8 - 60px),780px);aspect-ratio:9/16;max-width:calc(100vw - 32px);border-radius:20px;overflow:hidden;background:#000;border:9px solid #0b0f14;box-shadow:0 0 0 2px #3b4655,0 30px 80px rgba(0,0,0,.6),inset 0 0 40px rgba(0,0,0,.8)}',
    '.tren-vano video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}',
    '.tren-brillo{position:absolute;inset:0;background:radial-gradient(70% 50% at 50% 40%,rgba(255,236,200,.35),transparent 70%);pointer-events:none;transition:opacity .2s}',
    // Hojas: acero cepillado, ventana de vidrio oscuro y la franja de marca que sigue la de la carrocería
    '.tren-hoja{position:absolute;top:0;bottom:0;width:50%;will-change:transform;background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 3px),linear-gradient(90deg,#9ea8b4,#d5dce4 45%,#aab4bf)}',
    '.tren-hoja.izq{left:0;border-right:4px solid #11161d}.tren-hoja.der{right:0;border-left:4px solid #11161d}',
    '.tren-hoja::before{content:"";position:absolute;left:16%;right:16%;top:9%;height:46%;border-radius:12px;background:linear-gradient(160deg,rgba(255,255,255,.18) 0 18%,transparent 18% 34%,rgba(255,255,255,.08) 34% 40%,transparent 40%),linear-gradient(180deg,#1d2733,#0a0f15);box-shadow:inset 0 0 0 3px #11161d,inset 0 0 22px rgba(0,0,0,.7)}',
    '.tren-hoja::after{content:"";position:absolute;left:0;right:0;top:64%;height:10px;opacity:.9}',
    '.tren-hoja.izq::after{background:linear-gradient(90deg,#d77f86,#D4AF37)}.tren-hoja.der::after{background:linear-gradient(90deg,#D4AF37,#7cc6c4)}',
    '.tren-sello{position:absolute;left:50%;top:31%;transform:translate(-50%,-50%);z-index:1;color:#e2e8f0;font-weight:900;font-size:clamp(.62rem,1.1vw,.82rem);letter-spacing:.2em;text-align:center;line-height:1.5;text-shadow:0 2px 8px rgba(0,0,0,.8)}',
    '.tren-sello b{display:block;font-size:1.6em;letter-spacing:.06em;color:#D4AF37}',
    '.tren-pista{position:absolute;left:50%;top:70%;transform:translateX(-50%);text-shadow:none;color:#1a2230!important;white-space:nowrap;background:rgba(235,240,245,.82);padding:7px 14px;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.25);z-index:2;display:flex;flex-direction:column;align-items:center;gap:6px;color:rgba(226,232,240,.8);font-size:.72rem;font-weight:800;letter-spacing:.24em;text-transform:uppercase;transition:opacity .3s}',
    '.tren.abierta .tren-pista,.tren[data-estado="abriendo"] .tren-pista{opacity:0}',
    // Celular: puerta arriba y textos encima del video (abajo), sin columnas laterales
    '@media(max-width:900px){.tren{height:230vh}.tren-fijo{grid-template-columns:1fr;justify-items:center;padding:0 16px}.tren-txt.izq{display:none}' +
      '.tren-txt.der{position:absolute;left:16px;right:16px;bottom:calc((100svh - var(--tren-top,0px)) * .1 + 30px);margin:0 auto;max-width:calc(min(calc((100svh - var(--tren-top,0px)) * .8 - 60px),780px)*9/16 - 18px);padding:18px 16px 14px;border-radius:0 0 12px 12px;background:linear-gradient(180deg,transparent,rgba(5,8,12,.92) 30%);z-index:3}' +
      '.tren-movil{display:block!important;font-weight:900;font-size:1.05rem;line-height:1.25;margin-bottom:10px}.tren-movil em{font-style:normal;color:#D4AF37}.tren-lista{gap:6px;margin-bottom:12px}.tren-lista li{font-size:.84rem}.tren-cta{font-size:.84rem;padding:10px 18px}}',
    '.tren--quieto{height:auto}.tren--quieto .tren-fijo{position:relative;height:auto;padding-top:48px;padding-bottom:48px}.tren--quieto .tren-hoja,.tren--quieto .tren-brillo,.tren--quieto .tren-pista{display:none}.tren--quieto .tren-txt{opacity:1;transform:none}'
  ].join('');

  function montar(sec) {
    if (sec._puertas) return; sec._puertas = 1;
    var video = sec.querySelector('video'), izq = sec.querySelector('.tren-hoja.izq'), der = sec.querySelector('.tren-hoja.der'), brillo = sec.querySelector('.tren-brillo');
    var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (quieto) { sec.classList.add('tren--quieto', 'abierta'); sec.setAttribute('data-estado', 'abierta'); if (video) { video.controls = true; video.preload = 'metadata'; } return; }

    // Descargar el video solo cuando la sección se acerca; pausarlo si sale de pantalla
    var cerca = false, visible = false;
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !cerca && video) { cerca = true; video.preload = 'auto'; try { video.load(); } catch (e) {} }
      if (!visible && video && !video.paused) video.pause();
      if (visible) programar();
    }, { rootMargin: '600px 0px' }).observe(sec);

    function lim(v) { return Math.max(0, Math.min(1, v)); }
    function suave(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    var raf = 0, estado = '';
    function cuadro() {
      raf = 0;
      var r = sec.getBoundingClientRect(), total = sec.offsetHeight - window.innerHeight;
      var p = total > 0 ? lim(-r.top / total) : 1;
      var o = suave(lim((p - 0.1) / 0.5));                 // las puertas se abren entre el 10 % y el 60 % del recorrido
      izq.style.transform = 'translateX(' + (-o * 100) + '%)';
      der.style.transform = 'translateX(' + (o * 100) + '%)';
      if (brillo) brillo.style.opacity = String(1 - o);
      var e = o <= 0.001 ? 'cerrada' : (o >= 0.999 ? 'abierta' : 'abriendo');
      if (e !== estado) { estado = e; sec.setAttribute('data-estado', e); sec.classList.toggle('abierta', e === 'abierta'); }
      if (video) {
        if (o > 0.35 && video.paused && visible) { var pr = video.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else if (o < 0.15 && !video.paused) { video.pause(); try { video.currentTime = 0; } catch (x) {} }
      }
    }
    // La sección fija queda debajo de la cabecera fija de la web (barra de acceso + menú), no tapada por ella
    function tope() {
      var y = 0;
      try { document.elementsFromPoint(window.innerWidth / 2, 2).forEach(function (el) { var cs = getComputedStyle(el); if ((cs.position === 'fixed' || cs.position === 'sticky') && !sec.contains(el)) { var b = el.getBoundingClientRect().bottom; if (b > y && b < 260) y = b; } }); } catch (e) {}
      document.querySelectorAll('#nav-topbar, .pnav2').forEach(function (el) { var cs = getComputedStyle(el), b = el.getBoundingClientRect().bottom; if ((cs.position === 'fixed' || cs.position === 'sticky') && b > y && b < 260) y = b; });
      sec.style.setProperty('--tren-top', Math.round(y) + 'px');
    }
    function programar() { if (!raf) raf = requestAnimationFrame(cuadro); }
    tope(); window.addEventListener('resize', tope, { passive: true }); setTimeout(tope, 1200);
    window.addEventListener('scroll', programar, { passive: true });
    window.addEventListener('resize', programar, { passive: true });
    programar();
  }

  function arrancar() {
    var secs = document.querySelectorAll('[data-puertas-video]'); if (!secs.length) return;
    if (!document.getElementById('puertas-video-css')) { var s = document.createElement('style'); s.id = 'puertas-video-css'; s.textContent = CSS; document.head.appendChild(s); }
    secs.forEach(montar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
