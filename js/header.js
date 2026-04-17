/**
 * PRODIGY — Header Maestro Compartido
 * Inyecta topbar + navbar al inicio de <body>.
 * Uso: primer <script> dentro de <body>:
 *   <script src="js/header.js"></script>
 *
 * Config opcional (definir ANTES de cargar este script):
 *   window._headerConfig = {
 *     showLang : true,          // mostrar toggle ES·EN·PT (default: false)
 *     activePath: '/foo.html'   // forzar link activo (default: location.pathname)
 *   }
 */
(function () {
  'use strict';
  if (document.getElementById('topbar')) return; // evitar doble inyección

  var cfg        = window._headerConfig || {};
  var showLang   = !!cfg.showLang;
  var activePath = cfg.activePath || window.location.pathname;

  /* ── CSS ──────────────────────────────────────────────────── */
  var css = [
    /* Topbar */
    '#topbar{position:fixed;top:0;left:0;right:0;height:44px;',
    'background:#0a0a0e;border-bottom:1px solid rgba(217,70,166,0.3);',
    'display:flex;align-items:center;justify-content:space-between;',
    'padding:0 28px;z-index:1001;font-size:12px;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',

    '.tb-left{display:flex;align-items:center;gap:20px;}',
    '.tb-left a{color:#64748b;text-decoration:none;display:flex;align-items:center;gap:6px;transition:color .2s;}',
    '.tb-left a:hover{color:#94a3b8;}',
    '.tb-left i{color:#D946A6;font-size:11px;}',
    '.tb-right{display:flex;align-items:center;gap:8px;}',

    '.tb-btn-in{display:inline-flex;align-items:center;gap:6px;',
    'background:linear-gradient(135deg,#D946A6,#a0186e);color:#fff;',
    'font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;',
    'text-decoration:none;padding:6px 14px;border-radius:6px;',
    'box-shadow:0 2px 10px rgba(217,70,166,0.35);}',

    '.tb-btn-reg{color:#64748b;font-size:11px;font-weight:700;letter-spacing:1px;',
    'text-transform:uppercase;text-decoration:none;padding:5px 12px;',
    'border-radius:6px;border:1px solid rgba(255,255,255,0.1);transition:all .2s;}',
    '.tb-btn-reg:hover{border-color:rgba(255,255,255,0.3);color:#e2e8f0;}',

    /* Lang switcher (solo visible si showLang=true) */
    '.pheader-lang{display:flex;gap:2px;background:rgba(13,21,32,0.85);',
    'border:1px solid rgba(212,175,55,0.25);border-radius:8px;padding:3px;}',
    '.pheader-lang button{background:none;border:none;cursor:pointer;color:#64748b;',
    'font-size:.7rem;font-weight:700;letter-spacing:.5px;padding:4px 8px;',
    'border-radius:5px;transition:all .2s;font-family:inherit;}',
    '.pheader-lang button.active{background:rgba(212,175,55,0.18);color:#D4AF37;}',
    '.pheader-lang button:hover:not(.active){color:#94a3b8;}',

    '@media(max-width:768px){.tb-left{display:none;}#topbar{justify-content:flex-end;}}',

    /* Navbar */
    '#pnav{position:fixed;top:44px;left:0;right:0;',
    'background:rgba(8,8,12,0.97);backdrop-filter:blur(24px);',
    'border-bottom:1px solid rgba(212,175,55,0.2);',
    'padding:14px 0;z-index:1000;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',

    '#pnav .nav-inner{max-width:1260px;margin:0 auto;display:flex;',
    'align-items:center;justify-content:space-between;padding:0 24px;gap:24px;}',

    '#pnav .nav-logo{font-size:1.15rem;font-weight:900;color:#D4AF37;',
    'letter-spacing:3px;text-decoration:none;}',

    '#pnav .nav-links{display:flex;gap:22px;align-items:center;}',
    '#pnav .nav-links a{color:#94a3b8;text-decoration:none;font-size:.8rem;',
    'font-weight:600;letter-spacing:.8px;text-transform:uppercase;transition:color .2s;}',
    '#pnav .nav-links a:hover,#pnav .nav-links a.active{color:#e2e8f0;}',
    '#pnav .nav-cta{background:linear-gradient(135deg,#D946A6,#a0186e)!important;',
    'color:#fff!important;padding:8px 18px;border-radius:100px;',
    'font-weight:700!important;box-shadow:0 4px 16px rgba(217,70,166,0.3);}',

    '@media(max-width:768px){#pnav .nav-links{display:none;}}',

    /* Body offset fijo */
    'body{padding-top:96px!important;}'
  ].join('');

  var st = document.createElement('style');
  st.id = 'pheader-css';
  st.textContent = css;
  document.head.appendChild(st);

  /* ── TOPBAR HTML ─────────────────────────────────────────── */
  var langHtml = showLang
    ? '<div class="pheader-lang">' +
        '<button data-lang-btn="es" onclick="window.i18n&&i18n.set(\'es\')">ES</button>' +
        '<button data-lang-btn="en" onclick="window.i18n&&i18n.set(\'en\')">EN</button>' +
        '<button data-lang-btn="pt" onclick="window.i18n&&i18n.set(\'pt\')">PT</button>' +
      '</div>'
    : '';

  var topbarHtml =
    '<div id="topbar">' +
      '<div class="tb-left">' +
        '<a href="tel:+573212816716"><i class="fas fa-phone-alt"></i> +57 321 281 6716</a>' +
        '<a href="mailto:labdentalprodigy@gmail.com"><i class="fas fa-envelope"></i> labdentalprodigy@gmail.com</a>' +
      '</div>' +
      '<div class="tb-right">' +
        langHtml +
        '<a href="/app/login.html?mode=register" class="tb-btn-reg">Registro</a>' +
        '<a href="/app/login.html" class="tb-btn-in"><i class="fas fa-key"></i> Acceso</a>' +
      '</div>' +
    '</div>';

  /* ── NAVBAR HTML ─────────────────────────────────────────── */
  var links = [
    { href: '/',                label: 'Inicio' },
    { href: '/portafolio.html', label: 'Portafolio' },
    { href: '/nosotros.html',   label: 'Nosotros' },
    { href: '/soporte.html',    label: 'Soporte' },
    { href: '/calculadora.html',label: 'Cotizar', cta: true }
  ];

  var linksHtml = links.map(function (l) {
    var isActive = !l.cta && (
      activePath === l.href ||
      (l.href !== '/' && activePath.indexOf(l.href) !== -1)
    );
    var cls = l.cta ? 'nav-cta' : (isActive ? 'active' : '');
    return '<a href="' + l.href + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + l.label + '</a>';
  }).join('');

  var navHtml =
    '<nav id="pnav">' +
      '<div class="nav-inner">' +
        '<a href="/" class="nav-logo">PRODIGY</a>' +
        '<div class="nav-links">' + linksHtml + '</div>' +
      '</div>' +
    '</nav>';

  /* ── INJECT ──────────────────────────────────────────────── */
  document.body.insertAdjacentHTML('afterbegin', topbarHtml + navHtml);

})();
