/**
 * PRODIGY — Navbar Compartido v2
 * Inyecta navbar con dropdown en cualquier página pública raíz.
 * Uso: <script src="js/navbar.js"></script> justo después de <body>
 */
(function () {
  'use strict';
  if (document.getElementById('pnav-root')) return;

  /* ── CSS ─────────────────────────────────────────────────── */
  var css = [
    '@keyframes _pnav_sh{0%{background-position:-200% center}100%{background-position:200% center}}',

    /* Barra fija */
    '.pnav{position:fixed;top:0;left:0;right:0;',
      'background:rgba(0,0,0,.96);',
      'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);',
      'border-bottom:1px solid rgba(212,175,55,.15);',
      'z-index:1000;padding:13px 0;',
      'transition:box-shadow .3s,border-color .3s;}',
    '.pnav.scrolled{box-shadow:0 4px 24px rgba(0,0,0,.7);border-bottom-color:rgba(212,175,55,.32);}',

    /* Contenedor simétrico */
    '.pnav-c{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;',
      'max-width:1360px;margin:0 auto;padding:0 80px;gap:16px;}',

    '.pnav-left{display:flex;gap:20px;align-items:center;justify-content:flex-start;}',
    '.pnav-right{display:flex;gap:14px;align-items:center;justify-content:flex-end;}',

    '.pnav-left > a, .pnav-right > a{',
      'color:#cbd5e1;text-decoration:none;font-size:12px;font-weight:700;',
      'letter-spacing:.9px;text-transform:uppercase;white-space:nowrap;transition:color .25s;}',
    '.pnav-left > a:hover,.pnav-right > a:hover{color:#D4AF37;}',
    /* Página activa: verde neón — el usuario sabe exactamente dónde está */
    '.pnav-left > a.pnav-active,.pnav-right > a.pnav-active{',
      'color:#00FF41!important;text-shadow:0 0 10px rgba(0,255,65,.5);}',

    /* Logo */
    '.pnav-logo{text-decoration:none;text-align:center;display:block;}',
    '.pnav-logo strong{display:block;font-size:22px;font-weight:900;letter-spacing:3px;color:#D4AF37;line-height:1.1;}',
    '.pnav-logo em{display:block;font-style:normal;font-size:8.5px;font-weight:700;letter-spacing:3.5px;color:#e2e8f0;text-transform:uppercase;}',

    /* ── DROPDOWN SERVICIOS ── */
    '.pnav-dd{position:relative;display:flex;align-items:center;}',
    /* SERVICIOS: color de atención — magenta siempre visible, invita a explorar */
    '.pnav-dd-trigger{',
      'color:#D946A6;text-decoration:none;font-size:12px;font-weight:800;',
      'letter-spacing:.9px;text-transform:uppercase;white-space:nowrap;',
      'display:inline-flex;align-items:center;gap:5px;cursor:pointer;',
      'transition:color .25s,text-shadow .25s;background:none;border:none;padding:0;',
      'text-shadow:0 0 12px rgba(217,70,166,.35);}',
    '.pnav-dd-trigger:hover,.pnav-dd:hover .pnav-dd-trigger{',
      'color:#D4AF37;text-shadow:0 0 12px rgba(212,175,55,.4);}',
    '.pnav-dd-arrow{font-size:9px;transition:transform .25s;}',
    '.pnav-dd:hover .pnav-dd-arrow,.pnav-dd.open .pnav-dd-arrow{transform:rotate(180deg);}',

    '.pnav-dd-menu{',
      'position:absolute;top:calc(100% + 12px);left:-12px;',
      'background:rgba(5,5,5,.98);backdrop-filter:blur(24px);',
      'border:1px solid rgba(212,175,55,.22);border-radius:12px;',
      'padding:6px 0;min-width:230px;',
      'opacity:0;visibility:hidden;transform:translateY(-6px);',
      'transition:opacity .22s,visibility .22s,transform .22s;',
      'z-index:10;}',
    '.pnav-dd:hover .pnav-dd-menu,.pnav-dd.open .pnav-dd-menu{opacity:1;visibility:visible;transform:translateY(0);}',
    '.pnav-dd-menu a{',
      'display:flex;align-items:center;gap:10px;',
      'padding:10px 18px;color:#cbd5e1;text-decoration:none;',
      'font-size:11.5px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;',
      'transition:background .2s,color .2s;}',
    '.pnav-dd-menu a:first-child{border-radius:10px 10px 0 0;}',
    '.pnav-dd-menu a:last-child{border-radius:0 0 10px 10px;}',
    '.pnav-dd-menu a:hover{background:rgba(212,175,55,.08);color:#D4AF37;}',
    '.pnav-dd-menu a i{color:#D946A6;width:14px;text-align:center;}',
    '.pnav-dd-menu a span.dd-sub{display:block;font-size:9.5px;font-weight:400;letter-spacing:.3px;color:rgba(203,213,225,.5);text-transform:none;margin-top:2px;}',

    /* Botón CONTACTAR */
    '.pnav-btn-wa{display:inline-flex;align-items:center;gap:6px;',
      'background:linear-gradient(135deg,#D4AF37,#F4C430);color:#000!important;',
      'padding:9px 18px;border-radius:50px;font-size:11.5px!important;font-weight:700;',
      'white-space:nowrap;box-shadow:0 3px 12px rgba(212,175,55,.35);',
      'transition:transform .2s,box-shadow .2s;}',
    '.pnav-btn-wa:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(212,175,55,.5);}',

    /* INGRESAR esquina derecha */
    '.pnav-ingresar{position:absolute;right:16px;top:50%;transform:translateY(-50%);',
      'display:inline-flex;align-items:center;gap:6px;padding:8px 16px;',
      'background:linear-gradient(90deg,#D946A6 0%,#B82F8B 35%,#D4AF37 65%,#D946A6 100%);',
      'background-size:200% auto;color:#fff!important;border-radius:30px;',
      'font-size:11px!important;font-weight:800;letter-spacing:.5px;',
      'text-decoration:none;white-space:nowrap;',
      'animation:_pnav_sh 3s linear infinite;',
      'box-shadow:0 3px 12px rgba(217,70,166,.35);}',
    '.pnav-ingresar:hover{transform:translateY(calc(-50% - 1px));',
      'box-shadow:0 6px 22px rgba(217,70,166,.6);animation:_pnav_sh 1.2s linear infinite;}',

    /* Hamburger */
    '.pnav-ham{display:none;flex-direction:column;gap:5px;',
      'background:none;border:none;cursor:pointer;padding:8px;',
      'position:absolute;left:12px;top:50%;transform:translateY(-50%);}',
    '.pnav-ham span{display:block;width:22px;height:2px;background:#fff;border-radius:2px;transition:all .3s;}',
    '.pnav-ham.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px);}',
    '.pnav-ham.open span:nth-child(2){opacity:0;}',
    '.pnav-ham.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px);}',

    /* Overlay móvil */
    '.pnav-ov{display:none;position:fixed;inset:0;top:52px;',
      'background:rgba(0,0,0,.97);backdrop-filter:blur(20px);',
      'flex-direction:column;align-items:center;justify-content:center;',
      'gap:2px;z-index:999;overflow-y:auto;padding:20px 0;}',
    '.pnav-ov.open{display:flex;}',
    '.pnav-ov a{color:#e2e8f0;text-decoration:none;font-size:.95rem;font-weight:700;',
      'letter-spacing:1.2px;text-transform:uppercase;',
      'padding:12px 0;width:80%;max-width:300px;text-align:center;',
      'border-bottom:1px solid rgba(255,255,255,.06);transition:color .2s;}',
    '.pnav-ov a:hover{color:#D4AF37;}',
    '.pnav-ov .ov-sub{font-size:.78rem;color:rgba(203,213,225,.55);',
      'letter-spacing:.5px;font-weight:500;padding:6px 0;',
      'border-bottom:none;text-transform:none;}',
    '.pnav-ov .ov-wa{margin-top:14px;border-bottom:none;border-radius:50px;',
      'background:linear-gradient(135deg,#D4AF37,#F4C430);',
      'color:#000!important;max-width:220px;font-size:.85rem;}',
    '.pnav-ov .ov-ing{border-bottom:none;border-radius:50px;',
      'background:linear-gradient(135deg,#D946A6,#B82F8B);',
      'color:#fff!important;max-width:220px;font-size:.85rem;}',

    /* Responsive */
    '@media(max-width:1100px){',
      '.pnav-left > a,.pnav-right > a,.pnav-dd-trigger{font-size:10.5px;letter-spacing:.3px;}',
      '.pnav-c{gap:8px;padding:0 60px;}',
    '}',
    '@media(max-width:768px){',
      '.pnav-left,.pnav-right{display:none!important;}',
      '.pnav-ham{display:flex!important;}',
      '.pnav-c{grid-template-columns:1fr;padding:0 80px 0 50px;justify-items:center;}',
      '.pnav-logo strong{font-size:18px;}',
      '.pnav-logo em{font-size:7px;}',
      '.pnav-ingresar{font-size:10px!important;padding:7px 12px;right:10px;}',
    '}'
  ].join('');

  var st = document.createElement('style');
  st.id = 'pnav-css';
  st.textContent = css;
  document.head.appendChild(st);

  /* ── HTML ────────────────────────────────────────────────── */
  var nav = document.createElement('nav');
  nav.className = 'pnav';
  nav.id = 'pnav-root';

  nav.innerHTML =
    '<button class="pnav-ham" id="pnav-ham" aria-label="Abrir menú">' +
      '<span></span><span></span><span></span>' +
    '</button>' +

    '<div class="pnav-c">' +
      /* ── IZQUIERDA ── */
      '<div class="pnav-left">' +
        /* Dropdown Servicios */
        '<div class="pnav-dd" id="pnav-dd">' +
          '<button class="pnav-dd-trigger" id="pnav-dd-btn" aria-haspopup="true" aria-expanded="false">' +
            'SERVICIOS <i class="fas fa-chevron-down pnav-dd-arrow"></i>' +
          '</button>' +
          '<div class="pnav-dd-menu" role="menu">' +
            '<a href="flujo-diseno.html" role="menuitem">' +
              '<i class="fas fa-pen-ruler"></i>' +
              '<span>DISEÑOS CAD<span class="dd-sub">Exocad · 3Shape · Archivo STL</span></span>' +
            '</a>' +
            '<a href="flujo-fresado.html" role="menuitem">' +
              '<i class="fas fa-cog"></i>' +
              '<span>CENTRO FRESADO E IMPRESIÓN<span class="dd-sub">Zirconio · Disilicato · Resina</span></span>' +
            '</a>' +
            '<a href="escaner-domicilio.html" role="menuitem">' +
              '<i class="fas fa-mobile-alt"></i>' +
              '<span>ESCÁNER MÓVIL<span class="dd-sub">Norte Bogotá · A domicilio</span></span>' +
            '</a>' +
          '</div>' +
        '</div>' +
        '<a href="portafolio.html">PORTAFOLIO</a>' +
        '<a href="envia-tu-scanner.html">ENVÍA TU ESCÁNER</a>' +
      '</div>' +

      /* ── CENTRO — logo ── */
      '<a href="index.html" class="pnav-logo">' +
        '<strong>PRODIGY</strong>' +
        '<em>Digital Dentistry</em>' +
      '</a>' +

      /* ── DERECHA ── */
      '<div class="pnav-right">' +
        '<a href="journal">BLOG CIENTÍFICO</a>' +
        '<a href="seguimiento-caso">SIGUE TU CASO</a>' +
        '<a href="https://wa.me/573212816716" class="pnav-btn-wa" target="_blank" rel="noopener noreferrer">' +
          '<i class="fab fa-whatsapp"></i> CONTACTAR' +
        '</a>' +
      '</div>' +
    '</div>' +

    /* INGRESAR esquina derecha */
    '<a href="app/login.html" class="pnav-ingresar">' +
      '<i class="fas fa-arrow-right-to-bracket"></i> INGRESAR' +
    '</a>' +

    /* ── OVERLAY MÓVIL ── */
    '<div class="pnav-ov" id="pnav-ov">' +
      '<a href="flujo-diseno.html"><i class="fas fa-pen-ruler" style="margin-right:6px"></i> DISEÑOS CAD</a>' +
      '<a href="flujo-fresado.html"><i class="fas fa-cog" style="margin-right:6px"></i> CENTRO FRESADO E IMPRESIÓN</a>' +
      '<a href="escaner-domicilio.html"><i class="fas fa-mobile-alt" style="margin-right:6px"></i> ESCÁNER MÓVIL</a>' +
      '<a href="portafolio.html">PORTAFOLIO</a>' +
      '<a href="envia-tu-scanner.html">ENVÍA TU ESCÁNER</a>' +
      '<a href="journal">BLOG CIENTÍFICO</a>' +
      '<a href="seguimiento-caso">SIGUE TU CASO</a>' +
      '<a href="https://wa.me/573212816716" class="ov-wa" target="_blank" rel="noopener noreferrer">' +
        '<i class="fab fa-whatsapp"></i> CONTACTAR' +
      '</a>' +
      '<a href="app/login.html" class="ov-ing">' +
        '<i class="fas fa-arrow-right-to-bracket"></i> INGRESAR' +
      '</a>' +
    '</div>';

  document.body.insertBefore(nav, document.body.firstChild);
  document.body.style.paddingTop = '52px';

  /* ── SCROLL SHADOW ──────────────────────────────────────── */
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  /* ── HAMBURGER ──────────────────────────────────────────── */
  var ham = document.getElementById('pnav-ham');
  var ov  = document.getElementById('pnav-ov');
  ham.addEventListener('click', function () {
    var open = ov.classList.toggle('open');
    ham.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  ov.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      ov.classList.remove('open');
      ham.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── DROPDOWN click/hover (mobile/desktop) ────────────── */
  var dd    = document.getElementById('pnav-dd');
  var ddBtn = document.getElementById('pnav-dd-btn');
  /* En móvil usamos click; en desktop el hover ya funciona con CSS */
  ddBtn.addEventListener('click', function (e) {
    if (window.innerWidth <= 768) return; /* en móvil va al overlay */
    e.preventDefault();
    var open = dd.classList.toggle('open');
    ddBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  /* Cerrar al hacer click fuera */
  document.addEventListener('click', function (e) {
    if (!dd.contains(e.target)) {
      dd.classList.remove('open');
      ddBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── ACTIVE PAGE ────────────────────────────────────────── */
  var page = window.location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('.pnav-left > a, .pnav-right > a').forEach(function (a) {
    var href = (a.getAttribute('href') || '').split('#')[0].split('/').pop();
    if (href && href === page) a.classList.add('pnav-active');
  });
})();
