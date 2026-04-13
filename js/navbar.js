/**
 * PRODIGY — Navbar Compartido
 * Inyecta el navbar completo en cualquier página pública raíz.
 * Uso: <script src="js/navbar.js"></script> justo después de <body>
 */
(function () {
  'use strict';
  if (document.getElementById('pnav-root')) return;

  /* ── CSS ─────────────────────────────────────────────────── */
  var css = [
    '@keyframes _pnav_sh{0%{background-position:-200% center}100%{background-position:200% center}}',

    '.pnav{',
      'position:fixed;top:0;left:0;right:0;',
      'background:rgba(0,0,0,.96);',
      'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);',
      'border-bottom:1px solid rgba(212,175,55,.15);',
      'z-index:1000;padding:13px 0;',
      'transition:box-shadow .3s,border-color .3s;',
    '}',
    '.pnav.scrolled{box-shadow:0 4px 24px rgba(0,0,0,.7);border-bottom-color:rgba(212,175,55,.32);}',

    /* Container: simétrico 1fr | auto | 1fr */
    '.pnav-c{',
      'display:grid;grid-template-columns:1fr auto 1fr;',
      'align-items:center;',
      'max-width:1360px;margin:0 auto;',
      'padding:0 120px 0 24px;', /* espacio derecho para botón INGRESAR */
      'gap:16px;',
    '}',

    '.pnav-left{display:flex;gap:18px;align-items:center;justify-content:flex-start;}',
    '.pnav-right{display:flex;gap:14px;align-items:center;justify-content:flex-end;}',

    '.pnav-left a,.pnav-right a{',
      'color:#cbd5e1;text-decoration:none;',
      'font-size:12px;font-weight:700;',
      'letter-spacing:.9px;text-transform:uppercase;',
      'white-space:nowrap;transition:color .25s;',
    '}',
    '.pnav-left a:hover,.pnav-right a:hover{color:#D4AF37;}',
    '.pnav-left a.pnav-active,.pnav-right a.pnav-active{color:#D946A6;}',

    /* Logo centro */
    '.pnav-logo{text-decoration:none;text-align:center;display:block;}',
    '.pnav-logo strong{',
      'display:block;font-size:22px;font-weight:900;',
      'letter-spacing:3px;color:#D4AF37;line-height:1.1;',
    '}',
    '.pnav-logo em{',
      'display:block;font-style:normal;font-size:8.5px;',
      'font-weight:700;letter-spacing:3.5px;color:#e2e8f0;',
      'text-transform:uppercase;',
    '}',

    /* Botón CONTACTAR dorado */
    '.pnav-btn-wa{',
      'display:inline-flex;align-items:center;gap:6px;',
      'background:linear-gradient(135deg,#D4AF37,#F4C430);',
      'color:#000!important;padding:9px 18px;border-radius:50px;',
      'font-size:11.5px!important;font-weight:700;white-space:nowrap;',
      'box-shadow:0 3px 12px rgba(212,175,55,.35);',
      'transition:transform .2s,box-shadow .2s;',
    '}',
    '.pnav-btn-wa:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(212,175,55,.5);}',

    /* INGRESAR — esquina derecha absoluta */
    '.pnav-ingresar{',
      'position:absolute;right:16px;top:50%;transform:translateY(-50%);',
      'display:inline-flex;align-items:center;gap:6px;',
      'padding:8px 16px;',
      'background:linear-gradient(90deg,#D946A6 0%,#B82F8B 35%,#D4AF37 65%,#D946A6 100%);',
      'background-size:200% auto;',
      'color:#fff!important;border-radius:30px;',
      'font-size:11px!important;font-weight:800;letter-spacing:.5px;',
      'text-decoration:none;white-space:nowrap;',
      'animation:_pnav_sh 3s linear infinite;',
      'box-shadow:0 3px 12px rgba(217,70,166,.35);',
      'transition:box-shadow .2s;',
    '}',
    '.pnav-ingresar:hover{',
      'transform:translateY(calc(-50% - 1px));',
      'box-shadow:0 6px 22px rgba(217,70,166,.6);',
      'animation:_pnav_sh 1.2s linear infinite;',
    '}',

    /* Hamburger — solo móvil */
    '.pnav-ham{',
      'display:none;flex-direction:column;gap:5px;',
      'background:none;border:none;cursor:pointer;padding:8px;',
      'position:absolute;left:12px;top:50%;transform:translateY(-50%);',
    '}',
    '.pnav-ham span{display:block;width:22px;height:2px;background:#fff;border-radius:2px;transition:all .3s;}',
    '.pnav-ham.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px);}',
    '.pnav-ham.open span:nth-child(2){opacity:0;}',
    '.pnav-ham.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px);}',

    /* Overlay móvil */
    '.pnav-ov{',
      'display:none;position:fixed;inset:0;top:52px;',
      'background:rgba(0,0,0,.97);backdrop-filter:blur(20px);',
      'flex-direction:column;align-items:center;justify-content:center;',
      'gap:4px;z-index:999;',
    '}',
    '.pnav-ov.open{display:flex;}',
    '.pnav-ov a{',
      'color:#e2e8f0;text-decoration:none;',
      'font-size:1rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;',
      'padding:13px 0;width:80%;max-width:300px;text-align:center;',
      'border-bottom:1px solid rgba(255,255,255,.06);',
      'transition:color .2s,background .2s;',
    '}',
    '.pnav-ov a:hover{color:#D4AF37;}',
    '.pnav-ov .ov-wa{',
      'margin-top:16px;border-bottom:none;border-radius:50px;',
      'background:linear-gradient(135deg,#D4AF37,#F4C430);',
      'color:#000!important;max-width:220px;font-size:.9rem;',
    '}',
    '.pnav-ov .ov-ing{',
      'border-bottom:none;border-radius:50px;',
      'background:linear-gradient(135deg,#D946A6,#B82F8B);',
      'color:#fff!important;max-width:220px;font-size:.9rem;',
    '}',

    /* Responsive */
    '@media(max-width:1100px){',
      '.pnav-left a,.pnav-right a{font-size:10.5px;letter-spacing:.4px;}',
      '.pnav-c{gap:10px;padding:0 110px 0 16px;}',
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
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Navegación principal');

  nav.innerHTML =
    /* Hamburger */
    '<button class="pnav-ham" id="pnav-ham" aria-label="Abrir menú">' +
      '<span></span><span></span><span></span>' +
    '</button>' +

    /* Grid */
    '<div class="pnav-c">' +
      /* Izquierda — 4 links */
      '<div class="pnav-left">' +
        '<a href="index.html#servicios">SERVICIOS</a>' +
        '<a href="portafolio.html">PORTAFOLIO</a>' +
        '<a href="envia-tu-scanner.html">ESCÁNER</a>' +
        '<a href="escaner-domicilio.html">DOMICILIO</a>' +
      '</div>' +
      /* Centro — logo */
      '<a href="index.html" class="pnav-logo">' +
        '<strong>PRODIGY</strong>' +
        '<em>Digital Dentistry</em>' +
      '</a>' +
      /* Derecha — 4 links + botón */
      '<div class="pnav-right">' +
        '<a href="journal.html">INSIGHTS</a>' +
        '<a href="seguimiento-caso.html">SEGUIMIENTO</a>' +
        '<a href="index.html#workflow-247">CAD</a>' +
        '<a href="index.html#production">CAM</a>' +
        '<a href="https://wa.me/573212816716" class="pnav-btn-wa" target="_blank" rel="noopener noreferrer">' +
          '<i class="fab fa-whatsapp"></i> CONTACTAR' +
        '</a>' +
      '</div>' +
    '</div>' +

    /* INGRESAR — esquina derecha absoluta */
    '<a href="app/login.html" class="pnav-ingresar">' +
      '<i class="fas fa-arrow-right-to-bracket"></i> INGRESAR' +
    '</a>' +

    /* Overlay móvil */
    '<div class="pnav-ov" id="pnav-ov">' +
      '<a href="index.html#servicios">SERVICIOS</a>' +
      '<a href="portafolio.html">PORTAFOLIO</a>' +
      '<a href="envia-tu-scanner.html">ESCÁNER</a>' +
      '<a href="escaner-domicilio.html">DOMICILIO</a>' +
      '<a href="journal.html">INSIGHTS</a>' +
      '<a href="seguimiento-caso.html">SEGUIMIENTO</a>' +
      '<a href="index.html#workflow-247">CAD</a>' +
      '<a href="index.html#production">CAM</a>' +
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

  /* ── MOBILE TOGGLE ──────────────────────────────────────── */
  var ham = document.getElementById('pnav-ham');
  var ov = document.getElementById('pnav-ov');
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

  /* ── ACTIVE PAGE HIGHLIGHT ─────────────────────────────── */
  var page = window.location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('.pnav-left a, .pnav-right a').forEach(function (a) {
    var href = (a.getAttribute('href') || '').split('#')[0].split('/').pop();
    if (href && href === page) a.classList.add('pnav-active');
  });
})();
