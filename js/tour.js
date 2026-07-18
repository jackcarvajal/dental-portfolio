/**
 * PRODIGY — Recorrido guiado para clientes
 * v1.0 · 2026-07-18
 *
 * La primera vez que un doctor entra a su panel (o a un flujo de pedido) se
 * le muestra un tour paso a paso: resalta cada zona y explica qué hacer.
 * Se puede saltar, se recuerda que ya lo vio, y queda un botón para repetirlo.
 *
 * Los pasos cuyo elemento no existe en la página se omiten solos, así el
 * mismo archivo sirve para varias pantallas sin romperse.
 *
 * Uso:  <script src="../js/tour.js?v=20260718"></script>   (o js/tour.js en raíz)
 */
(function () {
  'use strict';

  /* ── Guiones por pantalla ─────────────────────────────────────── */
  var TOURS = {
    'panel-interno-operaciones.html': {
      nombre: 'el panel interno',
      pasos: [
        { sel: null, titulo: 'Bienvenido al centro de operaciones',
          texto: 'Desde aquí controlas todo el laboratorio: pedidos, producción, despachos, equipo y portafolio. Te muestro lo esencial en 6 pasos.' },
        { sel: '#midia', titulo: 'Tu resumen de hoy',
          texto: 'Lo primero que ves: cuántos pedidos hay, cuántos están en producción y cuántos listos para despachar. Si todo está en cero es porque aún no hay datos, no es un error.' },
        { sel: '.nav-item[onclick*="pedidos"]', titulo: 'Pedidos — tu vista del día a día',
          texto: 'Todos los casos con su estado, cliente y avance. Desde el menú de la izquierda te mueves entre secciones; cada una tiene su ayuda al pasar el mouse.' },
        { sel: '#bg-side-btn', titulo: 'Buscar un caso (Ctrl+K)',
          texto: 'Busca cualquier caso por código, doctor o cliente desde cualquier pantalla, sin navegar. El atajo Ctrl+K funciona siempre.' },
        { sel: '#hist-side-btn', titulo: 'Actividad reciente',
          texto: 'Quién cambió qué y cuándo. Muy útil si otra persona del equipo usa el panel y quieres saber qué pasó con un caso.' },
        { sel: '.nav-item[onclick*="portafolio"]', titulo: 'Portafolio',
          texto: 'Sube tus casos terminados con fotos. Se publican de inmediato en el portafolio público de la web.' },
        { sel: '#phelp-btn', titulo: 'Ayuda siempre a mano',
          texto: 'Este botón abre la guía de todas las secciones. Además, al pasar el mouse por cualquier botón aparece una nota explicando qué hace.' }
      ]
    },
    'client-panel.html': {
      nombre: 'tu panel',
      pasos: [
        { sel: null, titulo: '¡Bienvenido a tu panel!',
          texto: 'Aquí sigues tus casos, revisas diseños y consultas tu facturación. Te muestro lo principal en 5 pasos — puedes saltarlo cuando quieras.' },
        { sel: '#banner-accion, .nav-item[href*="flujo-diseno"]', titulo: 'Enviar un caso nuevo',
          texto: 'Desde el menú eliges el servicio (Diseño CAD, Fresado, Impresión 3D o Lab Full) y subes tu escaneo. Ahí empieza cada pedido.' },
        { sel: '#historial', titulo: 'Mis Casos',
          texto: 'Todos tus pedidos con su estado en tiempo real: en diseño, en producción, despachado o entregado.' },
        { sel: '#busq-casos-cliente', titulo: 'Buscar un caso',
          texto: 'Si tienes muchos casos, búscalo por código o por paciente sin bajar por toda la lista.' },
        { sel: '#sec-bibliotecas', titulo: 'Mis Bibliotecas',
          texto: 'Sube tus bibliotecas de implantes o preferencias de diseño una sola vez y las usamos en todos tus casos.' },
        { sel: '#sec-facturacion', titulo: 'Facturación',
          texto: 'Tus facturas y pagos. Puedes descargarlas cuando las necesites para tu contabilidad.' }
      ]
    },
    'flujo-diseno.html': {
      nombre: 'el pedido de diseño',
      pasos: [
        { sel: null, titulo: 'Cómo enviar tu caso',
          texto: 'Te guío rápido: subir el escaneo, elegir opciones y confirmar. Toma menos de 2 minutos.' },
        { sel: 'input[type=file], .drop-zone, #dropzone', titulo: '1· Sube tu escaneo',
          texto: 'Arrastra aquí el archivo STL o PLY de tu escáner (iTero, Medit, 3Shape…). También puedes hacer clic para buscarlo.' },
        { sel: 'select, .opciones, #tipo-trabajo', titulo: '2· Elige el trabajo',
          texto: 'Indica el tipo de trabajo y el material. Si tienes dudas, déjalo en automático y lo confirmamos contigo.' },
        { sel: '[type=submit], .btn-enviar, .btn-primary', titulo: '3· Envía el caso',
          texto: 'Al enviarlo recibes el código del pedido y podrás seguir su avance desde tu panel.' }
      ]
    }
  };
  // Los otros flujos comparten el guion de diseño
  ['flujo-fresado.html', 'flujo-impresion.html', 'flujo-lab.html'].forEach(function (f) {
    TOURS[f] = TOURS['flujo-diseno.html'];
  });

  /* ── Estilos ──────────────────────────────────────────────────── */
  var css = ''
    + '#tr-ov{position:fixed;inset:0;z-index:100010;display:none;}'
    + '#tr-ov.show{display:block;}'
    + '#tr-mask{position:absolute;inset:0;background:rgba(0,0,0,.70);transition:clip-path .25s ease;}'
    + '#tr-ring{position:absolute;border:2px solid #D4AF37;border-radius:12px;pointer-events:none;'
    + 'box-shadow:0 0 0 4px rgba(212,175,55,.20);transition:all .25s ease;display:none;}'
    + '#tr-card{position:absolute;max-width:330px;background:#0d0a00;border:1px solid rgba(212,175,55,.4);'
    + 'border-radius:14px;padding:16px 18px;box-shadow:0 16px 44px rgba(0,0,0,.75);transition:all .25s ease;}'
    + '#tr-card h4{margin:0 0 6px;font-size:1rem;color:#D4AF37;}'
    + '#tr-card p{margin:0;font-size:.85rem;color:#cbd5e1;line-height:1.55;}'
    + '#tr-bar{display:flex;align-items:center;gap:10px;margin-top:14px;}'
    + '#tr-bar .n{font-size:.72rem;color:#64748b;flex:1;}'
    + '#tr-bar button{border:none;border-radius:8px;padding:8px 14px;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;}'
    + '.tr-skip{background:none;color:#94a3b8;}'
    + '.tr-prev{background:rgba(255,255,255,.08);color:#cbd5e1;}'
    + '.tr-next{background:linear-gradient(135deg,#D4AF37,#B8860B);color:#000;}'
    + '#tr-replay{position:fixed;right:18px;bottom:70px;z-index:99997;background:rgba(212,175,55,.14);'
    + 'border:1px solid rgba(212,175,55,.4);color:#D4AF37;border-radius:100px;padding:8px 15px;'
    + 'font-size:.76rem;font-weight:700;cursor:pointer;font-family:inherit;}'
    + '@media(max-width:640px){#tr-card{max-width:calc(100vw - 28px);left:14px!important;right:14px;}}'
    + '@media(prefers-reduced-motion:reduce){#tr-mask,#tr-ring,#tr-card{transition:none;}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var ov, mask, ring, card, tour, pasos = [], i = 0;

  function target(sel) {
    if (!sel) return null;
    var partes = sel.split(',');
    for (var k = 0; k < partes.length; k++) {
      var el = document.querySelector(partes[k].trim());
      if (el && el.offsetParent !== null) return el;
    }
    return null;
  }

  function pintar() {
    var p = pasos[i];
    var el = target(p.sel);
    // Resaltado
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setTimeout(function () {
        var r = el.getBoundingClientRect();
        var pad = 6;
        ring.style.display = 'block';
        ring.style.left = (r.left - pad) + 'px'; ring.style.top = (r.top - pad) + 'px';
        ring.style.width = (r.width + pad * 2) + 'px'; ring.style.height = (r.height + pad * 2) + 'px';
        mask.style.clipPath = 'polygon(0 0,100% 0,100% 100%,0 100%,0 0,'
          + (r.left - pad) + 'px ' + (r.top - pad) + 'px,'
          + (r.left - pad) + 'px ' + (r.bottom + pad) + 'px,'
          + (r.right + pad) + 'px ' + (r.bottom + pad) + 'px,'
          + (r.right + pad) + 'px ' + (r.top - pad) + 'px,'
          + (r.left - pad) + 'px ' + (r.top - pad) + 'px)';
        colocar(r);
      }, 260);
    } else {
      ring.style.display = 'none';
      mask.style.clipPath = '';
      colocar(null);
    }
    card.querySelector('h4').textContent = p.titulo;
    card.querySelector('p').textContent = p.texto;
    card.querySelector('.n').textContent = 'Paso ' + (i + 1) + ' de ' + pasos.length;
    card.querySelector('.tr-prev').style.display = i === 0 ? 'none' : '';
    card.querySelector('.tr-next').textContent = (i === pasos.length - 1) ? 'Entendido' : 'Siguiente';
  }

  function colocar(r) {
    var w = 330, h = card.offsetHeight || 170;
    if (!r) {
      card.style.left = Math.max(14, (window.innerWidth - w) / 2) + 'px';
      card.style.top = Math.max(14, (window.innerHeight - h) / 2) + 'px';
      return;
    }
    var top = r.bottom + 14;
    if (top + h > window.innerHeight - 10) top = Math.max(10, r.top - h - 14);
    var left = Math.min(Math.max(14, r.left), window.innerWidth - w - 14);
    card.style.left = left + 'px'; card.style.top = top + 'px';
  }

  function ir(n) {
    i = n;
    if (i < 0) i = 0;
    if (i >= pasos.length) { cerrar(true); return; }
    pintar();
  }
  function abrir() { ov.classList.add('show'); i = 0; pintar(); }
  function cerrar(completado) {
    ov.classList.remove('show');
    try { localStorage.setItem('tour_visto_' + archivo(), completado ? 'ok' : 'skip'); } catch (e) {}
    replayBtn();
  }
  function archivo() { return (location.pathname.split('/').pop() || 'index.html').toLowerCase(); }

  function replayBtn() {
    if (document.getElementById('tr-replay')) return;
    var b = document.createElement('button');
    b.id = 'tr-replay'; b.type = 'button';
    b.textContent = '↺ Ver tutorial';
    b.setAttribute('data-tip', 'Vuelve a mostrar el recorrido guiado de esta pantalla.');
    b.addEventListener('click', abrir);
    document.body.appendChild(b);
  }

  document.addEventListener('DOMContentLoaded', function () {
    tour = TOURS[archivo()];
    if (!tour) return;
    pasos = tour.pasos.filter(function (p) { return !p.sel || target(p.sel); });
    if (!pasos.length) return;

    ov = document.createElement('div'); ov.id = 'tr-ov';
    ov.innerHTML = '<div id="tr-mask"></div><div id="tr-ring"></div>'
      + '<div id="tr-card" role="dialog" aria-label="Recorrido guiado"><h4></h4><p></p>'
      + '<div id="tr-bar"><span class="n"></span>'
      + '<button type="button" class="tr-skip">Saltar</button>'
      + '<button type="button" class="tr-prev">Atrás</button>'
      + '<button type="button" class="tr-next">Siguiente</button></div></div>';
    document.body.appendChild(ov);
    mask = document.getElementById('tr-mask');
    ring = document.getElementById('tr-ring');
    card = document.getElementById('tr-card');

    card.querySelector('.tr-next').addEventListener('click', function () { ir(i + 1); });
    card.querySelector('.tr-prev').addEventListener('click', function () { ir(i - 1); });
    card.querySelector('.tr-skip').addEventListener('click', function () { cerrar(false); });
    document.addEventListener('keydown', function (e) {
      if (!ov.classList.contains('show')) return;
      if (e.key === 'Escape') cerrar(false);
      else if (e.key === 'ArrowRight') ir(i + 1);
      else if (e.key === 'ArrowLeft') ir(i - 1);
    });
    window.addEventListener('resize', function () { if (ov.classList.contains('show')) pintar(); });

    var visto = null;
    try { visto = localStorage.getItem('tour_visto_' + archivo()); } catch (e) {}
    if (!visto) setTimeout(abrir, 900);   // primera visita
    else replayBtn();
  });

  window.TourPRODIGY = { abrir: function () { if (ov) abrir(); } };
})();
