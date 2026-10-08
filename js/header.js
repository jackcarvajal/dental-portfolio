/**
 * PRODIGY — Header Maestro v2
 * Inyecta topbar (mini-login) + navbar completo + CTA flotante en todas las páginas.
 * Uso: primer <script> dentro de <body>
 */

/* ── AVISO DE COOKIES: uno solo, el de footer.js (oct-2026). Antes header.js mostraba otro encima (en Alejandro,
   en inglés). La decisión que alguien tomó en el aviso viejo («pg_cookies_decision») se sigue respetando. */

/* ── MANTENIMIENTO GLOBAL ──────────────────────────────────────────
   Bloquea acceso a todas las páginas públicas si no hay cookie pg_admin=1.
   Para activar bypass: visita /?preview=prodigy (cookie 30 días).
   Excluye: /mantenimiento, /app/*, /404
──────────────────────────────────────────────────────────────────── */
(function(){
  // Activar bypass con ?preview=prodigy → cookie 30 días
  if (new URLSearchParams(location.search).get('preview') === 'prodigy') {
    var exp = new Date(Date.now() + 30*24*60*60*1000).toUTCString();
    document.cookie = 'pg_admin=1; path=/; expires=' + exp;
    window.location.replace(location.pathname); // quita el param de la URL
    return;
  }
  var path = window.location.pathname;
  // ── Páginas SIEMPRE PÚBLICAS (Google las indexa, visitantes las ven) ──
  // Servicios y landings principales ya terminados:
  var publicPages = [
    '/',
    '/diseno-remoto','/diseno-cad','/fresado-cam','/guias-quirurgicas',
    '/calculadora','/calculadora-diseno','/calculadora-fresado','/calculadora-impresion',
    '/portafolio','/journal','/article','/nosotros','/soporte','/catalogo',
    '/escaner-domicilio','/envia-tu-scanner','/envia-alineadores','/escaneo-fotogrametria','/soporte-exocad','/guia-tecnica','/calidad',
    '/instalar-app','/terminos-y-legal','/seguimiento-caso','/mapa-sitio',
    '/para-laboratorios','/referidos','/flujo-diseno','/flujo-fresado',
    '/flujo-impresion','/flujo-lab','/caso','/patient',
    '/preguntas','/impresion-3d','/alineadores-cad',
    '/en/dental-aligners','/en/surgical-guides','/en/zirconia-crowns',   // inglés: solo diseño
  ];
  var skip = path.startsWith('/mantenimiento') ||
             path.startsWith('/app/') ||
             path.startsWith('/404') ||
             path.startsWith('/en/global-design') ||
             path.startsWith('/revision-express') ||
             path.startsWith('/recibo-caso') ||
             path.startsWith('/offline') ||
             publicPages.some(function(p){ return path === p || path.startsWith(p+'.') || path.startsWith(p+'?'); });
  if (skip) return;
  var hasCookie = document.cookie.split(';').some(function(c){
    return c.trim().startsWith('pg_admin=1');
  });
  if (!hasCookie) {
    document.documentElement.style.visibility = 'hidden';
    window.location.replace('/mantenimiento');
  }
})();

/* ── MICROSOFT CLARITY — se carga junto con GA, después del evento load ──
   Mapas de calor + grabaciones de sesión. No es crítico para el render.
─────────────────────────────────────────────────────────────────────── */
(function(){
  function _loadClarity() {
    var CLARITY_ID = 'wo8ivp56qd';
    if (document.getElementById('prodigy-clarity')) return;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.id='prodigy-clarity';
      t.src='https://www.clarity.ms/tag/'+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,'clarity','script',CLARITY_ID);
  }
  // Clarity graba la sesión y pone cookies: solo con las cookies analíticas aceptadas (Ley 1581 / el aviso lo promete).
  // La llama el cargador de GA tras el evento load (si ya aceptó) o el botón «Aceptar» del aviso.
  window._clarityPermitida = function () {
    try { return localStorage.getItem('pg_cookies_decision') === 'accepted' || localStorage.getItem('prodigy_cookies_ok') === '1'; } catch (e) { return false; }
  };
  window._loadClarity = function () { if (window._clarityPermitida()) _loadClarity(); };
})();

window._IDIOMA_CFG = {"hubEn": "/en/global-design", "paginasEn": ["/envia-tu-scanner", "/preguntas", "/soporte", "/portafolio", "/flujo-diseno"], "mapaEn": {"/": "/en/global-design", "/diseno-remoto": "/en/global-design", "/diseno-cad": "/en/global-design", "/calculadora-diseno": "/en/global-design", "/alineadores-cad": "/en/dental-aligners", "/envia-alineadores": "/en/dental-aligners", "/guias-quirurgicas": "/en/surgical-guides", "/fresado-cam": "/en/zirconia-crowns", "/calculadora-fresado": "/en/zirconia-crowns", "/terminos-y-legal": "/en/veneer-terms"}, "esDe": {"/en/global-design": "/diseno-remoto", "/en/dental-aligners": "/alineadores-cad", "/en/surgical-guides": "/guias-quirurgicas", "/en/zirconia-crowns": "/fresado-cam", "/en/veneers": "/", "/en/veneer-terms": "/terminos-y-legal"}};
/* ── IDIOMA: ES · EN · PT (oct-2026, igual en ambas webs; solo cambia _IDIOMA_CFG) ─────────────────────────
   · ES: el sitio está escrito en español.
   · EN: traducción TÉCNICA hecha a mano (odontología digital / CAD-CAM) de las páginas de /i18n/en.json → se
     traducen en la misma página. En las demás, EN lleva a su versión en inglés (/en/…) o a la portada en inglés:
     nunca una página mitad español, mitad inglés.
   · PT: traducción automática de Google de la página completa (para el cliente que la quiera en cualquier página).
   Estado: localStorage 'prd_lang' (es | en | pt). */
(function () {
  var C = window._IDIOMA_CFG;
  function ruta() { return location.pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/+$/, '') || '/'; }
  function guardado() { try { return localStorage.getItem('prd_lang') || 'es'; } catch (e) { return 'es'; } }
  function guardar(l) { try { localStorage.setItem('prd_lang', l); } catch (e) {} }
  var enIngles = ruta().indexOf('/en/') === 0;
  var enCompleta = C.paginasEn.indexOf(ruta()) >= 0;
  // idioma del texto de ESTA página (lo usan el menú, el pie e i18n.js)
  window._phdrIdiomaPagina = function () { return enIngles || (guardado() === 'en' && enCompleta) ? 'en' : 'es'; };

  function cookieGT(v) {
    var d = location.hostname.replace(/^www\./, ''), fin = v ? '' : ';expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'googtrans=' + (v || '') + ';path=/' + fin;
    document.cookie = 'googtrans=' + (v || '') + ';path=/;domain=.' + d + fin;
  }
  // las marcas no se traducen («ALEJANDRO» → «ALEXANDRE», «PRODIGY» → «PRODÍGIO»)
  function protegerMarcas() {
    var re = /\b(PRODIGY|Prodigy|ProDigy|Alejandro Carvajal|ALEJANDRO CARVAJAL|ALEJANDRO|Alejandro|Exocad|exocad|3Shape|CoDiagnostiX|coDiagnostiX)\b/;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), lista = [], n;
    while ((n = w.nextNode())) if (re.test(n.nodeValue) && n.parentElement && !n.parentElement.closest('script,style,[translate=no]')) lista.push(n);
    lista.forEach(function (t) {
      var fr = document.createDocumentFragment();
      t.nodeValue.split(new RegExp(re.source, 'g')).forEach(function (p, i) {
        if (!p) return;
        if (i % 2) { var s = document.createElement('span'); s.setAttribute('translate', 'no'); s.className = 'notranslate'; s.textContent = p; fr.appendChild(s); }
        else fr.appendChild(document.createTextNode(p));
      });
      t.parentNode.replaceChild(fr, t);
    });
  }
  function activarPT() {
    cookieGT('/es/pt');
    if (document.getElementById('gt-script')) return;
    protegerMarcas();
    var st = document.createElement('style');
    st.textContent = 'iframe.skiptranslate,.goog-te-banner-frame,#goog-gt-tt,.goog-te-balloon-frame,.VIpgJd-ZVi9od-ORHb-OEVmcd{display:none!important}' +
      'body{top:0!important;position:static!important}.goog-text-highlight{background:none!important;box-shadow:none!important}#gt-oculto{display:none}';
    document.head.appendChild(st);
    var h = document.createElement('div'); h.id = 'gt-oculto'; document.body.appendChild(h);
    window._phdrGT = function () { new window.google.translate.TranslateElement({ pageLanguage: 'es', includedLanguages: 'pt', autoDisplay: false }, 'gt-oculto'); };
    var s = document.createElement('script'); s.id = 'gt-script'; s.async = true;
    s.src = 'https://translate.google.com/translate_a/element.js?cb=_phdrGT';
    document.body.appendChild(s);
  }

  // EN en la misma página: diccionario técnico; sigue traduciendo lo que aparezca después (filtros, IA, paginador)
  function traducirEN() {
    fetch('/i18n/en.json').then(function (r) { return r.json(); }).then(function (D) {
      var PAT = (D.patrones || []).map(function (p) { return [new RegExp(p[0]), p[1]]; });   // textos que cambian (precio, fecha, paso)
      var T = D.textos || {}, OMITIR = '[translate=no],.notranslate,script,style,textarea,#pg-msgs,.pg-chat-msgs,.oia-cuerpo,.oia-q,#casesGrid h3,#casesGrid .card-body p';
      var traducir = function (raiz) {
        if (!raiz || raiz.nodeType !== 1 || raiz.closest(OMITIR)) return;
        var w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT), n, k, m;
        while ((n = w.nextNode())) {
          if (!n.parentElement || n.parentElement.closest(OMITIR)) continue;
          k = n.nodeValue.replace(/\s+/g, ' ').trim();
          if (k && T[k]) { m = n.nodeValue.match(/^(\s*)[\s\S]*?(\s*)$/); n.nodeValue = m[1] + T[k] + m[2]; }
          else if (k) for (var pi = 0; pi < PAT.length; pi++) if (PAT[pi][0].test(k)) { m = n.nodeValue.match(/^(\s*)[\s\S]*?(\s*)$/); n.nodeValue = m[1] + k.replace(PAT[pi][0], PAT[pi][1]) + m[2]; break; }
        }
        [raiz].concat([].slice.call(raiz.querySelectorAll('[placeholder],[aria-label],[title]'))).forEach(function (e) {
          ['placeholder', 'aria-label', 'title'].forEach(function (a) { var v = e.getAttribute && e.getAttribute(a); if (v && T[v.trim()]) e.setAttribute(a, T[v.trim()]); });
        });
      };
      traducir(document.body);
      document.title = T[document.title] || document.title;
      new MutationObserver(function (ms) {
        ms.forEach(function (x) { [].forEach.call(x.addedNodes, function (nd) { traducir(nd.nodeType === 3 ? nd.parentElement : nd); }); });
      }).observe(document.body, { childList: true, subtree: true });
    }).catch(function () {});
  }

  function marcarBotones() {
    var activo = guardado() === 'pt' && !enIngles ? 'pt' : window._phdrIdiomaPagina();
    [].forEach.call(document.querySelectorAll('[data-lang-btn]'), function (b) {
      var si = b.getAttribute('data-lang-btn') === activo;
      b.classList.toggle('active', si); b.setAttribute('aria-pressed', si ? 'true' : 'false');
    });
  }
  window._phdrMarcarIdioma = marcarBotones;

  window._phdrIdioma = function (l) {
    var antes = guardado();
    guardar(l);
    if (l !== 'pt' && antes === 'pt') cookieGT(null);
    if (l === 'en') {
      if (enIngles) return marcarBotones();
      if (enCompleta) return location.reload();
      location.href = C.mapaEn[ruta()] || C.hubEn; return;
    }
    // ES o PT: siempre desde la página en español (PT la traduce Google)
    if (enIngles) { location.href = C.esDe[ruta()] || '/'; return; }
    location.reload();
  };

  // EN elegido en una página que solo existe en español: aviso discreto con enlace a su versión en inglés
  function avisoSoloEs() {
    var clave = 'prd_aviso_es' + ruta();
    try { if (sessionStorage.getItem(clave)) return; } catch (e) {}
    var a = document.createElement('div');
    a.id = 'idioma-aviso'; a.setAttribute('role', 'status'); a.setAttribute('translate', 'no');
    a.innerHTML = '<span>This page is only available in Spanish.</span> <a href="' + (C.mapaEn[ruta()] || C.hubEn) + '">English version →</a>' +
      '<button type="button" aria-label="Close">×</button>';
    var st = document.createElement('style');
    st.textContent = '#idioma-aviso{position:fixed;top:calc(var(--alto-menu,130px) + 10px);left:50%;transform:translateX(-50%);z-index:998;display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;max-width:calc(100% - 32px);background:#0d1520;border:1px solid rgba(0,210,255,.35);color:#e2e8f0;font:600 13px/1.4 Inter,system-ui,sans-serif;padding:8px 10px 8px 16px;border-radius:999px;box-shadow:0 8px 30px rgba(0,0,0,.45)}' +
      '#idioma-aviso a{color:#00d2ff;text-decoration:none}#idioma-aviso a:hover{text-decoration:underline}' +
      '#idioma-aviso button{background:rgba(255,255,255,.08);border:0;color:#cbd5e1;width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:15px;line-height:1}' +
      '@media(max-width:520px){#idioma-aviso{border-radius:14px;top:auto;bottom:86px}}';
    document.head.appendChild(st);
    a.querySelector('button').addEventListener('click', function () { a.remove(); try { sessionStorage.setItem(clave, '1'); } catch (e) {} });
    var hd = document.getElementById('pheader-v2');   // justo debajo del menú (su alto cambia por página)
    if (hd && window.innerWidth > 520) a.style.top = Math.round(hd.getBoundingClientRect().bottom + 10) + 'px';
    document.body.appendChild(a);
  }

  function alCargar() {
    marcarBotones();
    if (!enIngles && guardado() === 'pt') activarPT();
    else if (!enIngles && window._phdrIdiomaPagina() === 'en') traducirEN();
    else if (!enIngles && guardado() === 'en' && ruta().indexOf('/app/') !== 0) avisoSoloEs();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', alCargar); else alCargar();
})();

/* Simetría automática de rejillas de tarjetas (js/simetria.js): sin huérfanas ni bloques corridos. Solo páginas públicas. */
if (location.pathname.indexOf('/app/') !== 0) { (function () { var s = document.createElement('script'); s.src = '/js/simetria.js?v=20261008'; s.async = true; document.head.appendChild(s); })(); }

/* ── GA4 (y Clarity) — DESPUÉS de cargar la página ─────────────────────────
   La cola de gtag (consentimiento + config) se crea YA, sin red, para que «Aceptar cookies» funcione
   aunque el script no haya bajado. gtag.js (190 KB) se pide tras el evento load y con el navegador libre:
   antes competía con el contenido. Es el ÚNICO cargador de GA: las páginas no deben traer su propio
   <script> de GA (con los dos, cada visita contaba dos page_view). Respeta Consent Mode v2 y reaplica
   el consentimiento ya dado (antes volvía a quedar «denied» en cada página).
─────────────────────────────────────────────────────────────────────── */
(function(){
  var GA_ID = 'G-3N0ZZE5V10';
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function(){ window.dataLayer.push(arguments); };
    gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',wait_for_update:500});
    try { if (localStorage.getItem('pg_cookies_decision') === 'accepted' || localStorage.getItem('prodigy_cookies_ok') === '1') gtag('consent','update',{analytics_storage:'granted'}); } catch (e) {}
    gtag('js', new Date());
    gtag('config', GA_ID, {anonymize_ip:true});
  }
  function _cargar() {
    if (!document.getElementById('prodigy-ga4-script')) {
      var s = document.createElement('script');
      s.id = 'prodigy-ga4-script'; s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(s);
    }
    if (window._loadClarity) window._loadClarity();
  }
  function _luego() { if (window.requestIdleCallback) requestIdleCallback(_cargar, { timeout: 4000 }); else setTimeout(_cargar, 1500); }
  if (document.readyState === 'complete') _luego(); else window.addEventListener('load', _luego);
})();

(function () {
  'use strict';
  if (document.getElementById('nav-topbar') || document.getElementById('pheader-v2')) return;

  var cfg        = window._headerConfig || {};
  var showLang   = true; // siempre visible en todas las páginas
  var noCta      = !!cfg.noCta;   // suprimir CTA flotante (ej: portal.html ya tiene el suyo)
  var activePath = cfg.activePath || window.location.pathname;

  /* Auto-inject Font Awesome si la página no lo carga ya */
  if (!document.querySelector('link[href*="font-awesome"]') && !document.querySelector('link[href*="fontawesome"]')) {
    var _faLink = document.createElement('link');
    _faLink.rel = 'stylesheet';
    _faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    _faLink.crossOrigin = 'anonymous';
    document.head.appendChild(_faLink);
  }

  /* ── CSS ────────────────────────────────────────────────── */
  var css = [
    /* Body offset */
    'body{padding-top:114px!important;}',

    /* TOPBAR */
    '#nav-topbar{position:fixed;top:0;left:0;right:0;height:56px;',
    'background:#0a0a0e;border-bottom:1px solid rgba(217,70,166,0.35);',
    'display:flex;align-items:center;justify-content:center;',
    'padding:0 24px;z-index:1001;gap:8px;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}',

    '#tb-form{display:flex;align-items:center;gap:8px;}',
    '.tb-input-wrap{position:relative;display:flex;align-items:center;}',
    '.tb-input-wrap i{position:absolute;left:11px;color:#94a3b8;font-size:13px;pointer-events:none;}',
    '.tb-input{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);',
    'border-radius:6px;color:#e2e8f0;font-size:16px;height:44px;',
    'padding:0 12px 0 34px;width:190px;outline:none;',
    'transition:border-color .2s,background .2s;font-family:inherit;}',
    '.tb-input::placeholder{color:#94a3b8;}',
    '.tb-input:focus{border-color:rgba(217,70,166,0.55);background:rgba(217,70,166,0.06);}',
    '.tb-sep{width:1px;height:26px;background:rgba(255,255,255,0.1);margin:0 4px;}',
    '.tb-acceso{height:44px;padding:0 20px;background:#e2e8f0;color:#0a0a0e;',
    'font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;',
    'border:none;border-radius:6px;cursor:pointer;transition:background .2s;',
    'white-space:nowrap;font-family:inherit;}',
    '.tb-acceso:hover{background:#fff;}',
    '.tb-registro{height:44px;padding:0 20px;background:transparent;color:#94a3b8;',
    'font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;',
    'border:1px solid rgba(255,255,255,0.18);border-radius:6px;cursor:pointer;',
    'transition:border-color .2s,color .2s;white-space:nowrap;text-decoration:none;',
    'display:inline-flex;align-items:center;font-family:inherit;}',
    '.tb-registro:hover{border-color:rgba(255,255,255,0.4);color:#fff;}',

    /* Lang switcher */
    '.pheader-lang{display:flex;gap:2px;background:rgba(13,21,32,0.85);',
    'border:1px solid rgba(212,175,55,0.25);border-radius:8px;padding:3px;margin-left:12px;}',
    '.pheader-lang button{background:none;border:none;cursor:pointer;color:#94a3b8;',
    'font-size:.7rem;font-weight:700;letter-spacing:.5px;padding:4px 8px;',
    'border-radius:5px;transition:all .2s;font-family:inherit;}',
    '.pheader-lang button.active{background:rgba(212,175,55,0.18);color:#D4AF37;}',
    '.pheader-lang button:hover:not(.active){color:#94a3b8;}',

    '@media(max-width:768px){',
    '#tb-form .tb-input-wrap,#tb-form .tb-sep{display:none;}',
    '#nav-topbar{justify-content:center;gap:8px;}}',
    '@media(max-width:480px){',
    '#nav-topbar{height:46px;}',
    '.tb-acceso,.tb-registro{padding:0 14px;font-size:13px;}}',

    /* NAVBAR */
    '#pheader-v2{position:fixed;top:56px;left:0;right:0;width:100%;',
    'background:rgba(8,8,12,0.97);backdrop-filter:blur(24px);',
    'border-bottom:1px solid rgba(212,175,55,0.2);',
    'padding:18px 0;z-index:1000;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
    'transition:box-shadow .3s;}',
    '#pheader-v2.nav-scrolled{box-shadow:0 4px 40px rgba(217,70,166,0.18);',
    'border-bottom-color:rgba(217,70,166,0.35);}',

    '.pnav2-c{max-width:1400px;margin:0 auto;display:flex;align-items:center;',
    'padding:0 24px;gap:0;}',
    '.pnav2-left,.pnav2-right{display:flex;gap:14px;flex-wrap:nowrap;align-items:center;flex:1;}',
    '.pnav2-left{justify-content:flex-end;}',
    '.pnav2-right{justify-content:flex-start;}',
    '.pnav2-left>a,.pnav2-right>a{color:#cbd5e1;text-decoration:none;font-size:13.5px;',
    'font-weight:700;text-transform:uppercase;letter-spacing:.8px;white-space:nowrap;',
    'transition:color .25s;}',
    '.pnav2-left>a:hover,.pnav2-right>a:hover{color:#fff;}',
    '.pnav2-left>a.pnav2-active,.pnav2-right>a.pnav2-active{color:#00FF41!important;}',

    /* Logo centrado — flex real, no absoluto */
    '.pnav2-logo{flex-shrink:0;padding:0 20px;',
    'text-decoration:none;text-align:center;pointer-events:auto;}',
    '.pnav2-logo strong{display:block;font-size:24px;font-weight:900;',
    'letter-spacing:3px;color:#D4AF37;line-height:1.1;}',
    '.pnav2-logo em{display:block;font-style:normal;font-size:11px;font-weight:700;',
    'letter-spacing:4px;color:#f5f5f7;text-transform:uppercase;}',

    /* Dropdown SERVICIOS */
    '.pnav2-dd{position:relative;display:flex;align-items:center;}',
    '.pnav2-dd-btn{color:#D946A6;text-decoration:none;font-size:13.5px;font-weight:800;',
    'letter-spacing:.8px;text-transform:uppercase;white-space:nowrap;',
    'display:inline-flex;align-items:center;gap:5px;cursor:pointer;',
    'transition:color .25s;background:none;border:none;padding:0;font-family:inherit;}',
    '.pnav2-dd-btn:hover{color:#D4AF37;}',
    '.pnav2-dd-arrow{font-size:11px;transition:transform .25s;}',
    '.pnav2-dd:hover .pnav2-dd-arrow,.pnav2-dd.open .pnav2-dd-arrow{transform:rotate(180deg);}',
    '.pnav2-dd-menu{position:absolute;top:calc(100% + 12px);left:0;',
    'background:rgba(5,5,5,0.98);backdrop-filter:blur(24px);',
    'border:1px solid rgba(212,175,55,0.22);border-radius:12px;',
    'padding:6px 0;min-width:240px;z-index:10;',
    'opacity:0;visibility:hidden;transform:translateY(-6px);',
    'transition:opacity .22s,visibility .22s,transform .22s;}',
    '.pnav2-dd:hover .pnav2-dd-menu,.pnav2-dd.open .pnav2-dd-menu{opacity:1;visibility:visible;transform:translateY(0);}',
    '.pnav2-dd-menu a,.pnav2-dd-menu>button{display:flex;align-items:center;gap:10px;width:100%;',
    'padding:11px 18px;background:none;border:0;cursor:pointer;text-align:left;font-family:inherit;color:#cbd5e1;text-decoration:none;',
    'font-size:12px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;',
    'transition:background .2s,color .2s;}',
    '.pnav2-dd-menu a:hover,.pnav2-dd-menu>button:hover{background:rgba(212,175,55,0.08);color:#D4AF37;}',
    '.pnav2-dd-menu a i,.pnav2-dd-menu>button i{color:#D946A6;width:16px;text-align:center;flex-shrink:0;}',
    '.pnav2-dd-menu span.dd-sub{display:block;font-size:12px;font-weight:400;',
    'letter-spacing:.3px;color:rgba(203,213,225,.5);text-transform:none;margin-top:2px;}',

    /* HAZ TU PEDIDO */
    '.pnav2-ped-wrap{position:relative;display:inline-block;}',
    '.pnav2-ped-btn{background:linear-gradient(135deg,#B0267F 0%,#a0186e 100%);',
    'color:#fff;padding:10px 22px;border-radius:6px;font-size:12px;font-weight:800;',
    'letter-spacing:1px;text-transform:uppercase;border:none;cursor:pointer;',
    'white-space:nowrap;display:inline-flex;align-items:center;gap:6px;',
    'box-shadow:0 4px 20px rgba(217,70,166,0.4);font-family:inherit;',
    'transition:box-shadow .2s,transform .2s;}',
    '.pnav2-ped-btn:hover{box-shadow:0 6px 28px rgba(217,70,166,0.6);transform:translateY(-1px);}',
    '.pnav2-ped-drop{position:absolute;top:calc(100% + 4px);right:0;',
    'background:rgba(8,8,12,0.98);backdrop-filter:blur(20px);',
    'border:1px solid rgba(217,70,166,0.3);border-radius:14px;',
    'padding:8px;min-width:260px;z-index:2000;',
    'box-shadow:0 16px 48px rgba(0,0,0,0.6);',
    'opacity:0;pointer-events:none;transform:translateY(8px);',
    'transition:opacity .2s,transform .2s;}',
    '.pnav2-ped-drop.open,.pnav2-ped-wrap:hover .pnav2-ped-drop{opacity:1;pointer-events:auto;transform:translateY(0);}',
    '.pnav2-ped-card{display:flex;align-items:center;gap:12px;',
    'padding:12px 14px;border-radius:10px;text-decoration:none;',
    'color:#e2e8f0;transition:background .15s;}',
    '.pnav2-ped-card:hover{background:rgba(255,255,255,0.05);}',
    '.pnav2-ped-card div{display:flex;flex-direction:column;}',
    '.pnav2-ped-card strong{font-size:.85rem;font-weight:800;}',
    '.pnav2-ped-card span{font-size:.72rem;color:#94a3b8;margin-top:1px;}',

    /* HAMBURGER */
    '.pnav2-ham{display:none;background:none;border:none;cursor:pointer;',
    'padding:10px;color:#D4AF37;font-size:1.4rem;min-width:44px;min-height:44px;}',

    /* MOBILE NAV */
    '.pnav2-mob{display:none;position:fixed;top:108px;left:0;right:0;',
    'background:rgba(0,0,0,0.97);backdrop-filter:blur(20px);',
    'border-bottom:1px solid rgba(212,175,55,0.2);',
    'padding:20px 30px;z-index:999;',
    'flex-direction:column;gap:14px;}',
    '.pnav2-mob.open{display:flex;}',
    '.pnav2-mob a{color:#f5f5f7;text-decoration:none;font-size:1rem;',
    'font-weight:700;text-transform:uppercase;letter-spacing:1px;',
    'padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);}',
    '.pnav2-mob a:hover{color:#D4AF37;}',
    '.pnav2-mob a:last-child{border-bottom:none;}',

    /* Responsive */
    '@media(max-width:1024px){',
    '.pnav2-left>a:not(.pnav2-dd *){display:none;}',
    '.pnav2-right>a{display:none;}',
    '.pnav2-ham{display:block!important;}}',
    /* Celular/tablet (oct-2026): lo que no cabe ya está en el menú ☰ y en el botón flotante «Haz tu pedido».
       Antes, a 390 px SOPORTE, tema, IA y HAZ TU PEDIDO quedaban fuera de la pantalla (cortados). */
    '@media(max-width:900px){.pnav2-dd,.pnav2-theme-btn,.pnav2-ia-btn{display:none!important;}}',
    '@media(max-width:640px){.pnav2-ped-wrap,#urgencia-widget{display:none!important;}.pnav2-c{padding:0 12px;}.pnav2-logo{padding:0 8px;}}',
    /* Botones flotantes de utilidad (subir / tema / WhatsApp): ~25 páginas los tienen sin estilos y quedaban como
       3 botoncitos de 14 px al final de la página. :where() = sin peso, si la página trae los suyos ganan esos.
       En celular se ocultan: tema y WhatsApp están en el menú ☰ y hay botón flotante propio (oct-2026). */
    /* Imágenes con width/height (reservan su espacio al cargar): que sigan escalando bien. :where() = sin peso */
    ':where(img[width][height]){height:auto;}',
    // opciones de listas desplegables legibles (en Windows la lista nativa se abría blanca con letra blanca)
    ':where(select) option,:where(select) optgroup{background-color:#121a26;color:#e5e7eb;}',
    ':where(.ux-floaters){position:fixed;bottom:28px;right:24px;z-index:900;display:flex;flex-direction:column;gap:10px;}',
    ':where(.ux-btn){width:44px;height:44px;border-radius:50%;background:rgba(13,21,32,.92);border:1px solid rgba(255,255,255,.15);color:#cbd5e1;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;text-decoration:none;}',
    '@media(max-width:640px){.ux-floaters{display:none!important;}.pheader-lang button{padding:6px 9px;}}',

    /* CTA FLOTANTE — se omite si noCta:true */
    '@keyframes _ppulse{0%{box-shadow:0 0 0 0 rgba(0,255,65,.7)}',
    '70%{box-shadow:0 0 0 8px rgba(0,255,65,0)}100%{box-shadow:0 0 0 0 rgba(0,255,65,0)}}',
    '#pcta-pedido{position:fixed;bottom:32px;left:50%;',
    'transform:translateX(-50%) translateY(100px);',
    'z-index:998;opacity:0;',
    'transition:opacity .4s ease,transform .4s cubic-bezier(.34,1.56,.64,1);',
    'pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:12px;}',
    '#pcta-pedido.visible{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto;}',
    '#pcta-menu{display:grid;grid-template-columns:1fr 1fr;gap:8px;opacity:0;transform:translateY(16px);pointer-events:none;',
    'transition:opacity .3s ease,transform .3s cubic-bezier(.34,1.56,.64,1);}',
    '#pcta-menu.open{opacity:1;transform:translateY(0);pointer-events:auto;}',
    '.pcta-card{display:flex;flex-direction:column;align-items:center;gap:8px;',
    'background:rgba(10,10,16,0.96);border:1px solid rgba(217,70,166,0.35);',
    'border-radius:14px;padding:16px 18px;text-decoration:none;color:#e2e8f0;',
    'min-width:90px;text-align:center;backdrop-filter:blur(16px);',
    'box-shadow:0 8px 32px rgba(0,0,0,0.5);',
    'transition:border-color .2s,transform .2s,box-shadow .2s;}',
    '.pcta-card:hover{transform:translateY(-5px);color:#fff;}',
    '.pcta-card i{font-size:1.6rem;margin-bottom:2px;}',
    '.pcta-card-cad{border-color:rgba(0,210,255,0.35);}',
    '.pcta-card-cad i{color:#00d2ff;}',
    '.pcta-card-cad:hover{border-color:rgba(0,210,255,0.8);box-shadow:0 12px 40px rgba(0,0,0,0.6),0 0 20px rgba(0,210,255,0.3);}',
    '.pcta-card-cam{border-color:rgba(212,175,55,0.35);}',
    '.pcta-card-cam i{color:#D4AF37;}',
    '.pcta-card-cam:hover{border-color:rgba(212,175,55,0.8);box-shadow:0 12px 40px rgba(0,0,0,0.6),0 0 20px rgba(212,175,55,0.3);}',
    '.pcta-card-lab{border-color:rgba(217,70,166,0.35);}',
    '.pcta-card-lab i{color:#D946A6;}',
    '.pcta-card-lab:hover{border-color:rgba(217,70,166,0.8);box-shadow:0 12px 40px rgba(0,0,0,0.6),0 0 20px rgba(217,70,166,0.3);}',
    '.pcta-card-scan{border-color:rgba(0,255,65,0.35);}',
    '.pcta-card-scan i{color:#00FF41;}',
    '.pcta-card-scan:hover{border-color:rgba(0,255,65,0.8);box-shadow:0 12px 40px rgba(0,0,0,0.6),0 0 20px rgba(0,255,65,0.3);}',
    '.pcta-card-title{font-size:11px;font-weight:900;letter-spacing:1px;',
    'text-transform:uppercase;color:#e2e8f0;line-height:1.2;}',
    '.pcta-card-sub{font-size:9px;font-weight:600;letter-spacing:.5px;',
    'color:#94a3b8;line-height:1.2;text-transform:none;}',
    '.pcta-card:hover .pcta-card-sub{color:#94a3b8;}',
    '#pcta-label{transition:opacity .3s;text-align:center;',
    'font-size:.65rem;font-weight:700;letter-spacing:2px;',
    'text-transform:uppercase;color:#94a3b8;margin-bottom:2px;}',
    '#pcta-btn{display:inline-flex;align-items:center;gap:10px;',
    'background:linear-gradient(135deg,#B0267F 0%,#a0186e 100%);',
    'color:#fff;font-weight:800;font-size:.95rem;letter-spacing:1.5px;',
    'padding:14px 32px;border-radius:100px;',
    'border:1px solid rgba(255,255,255,0.15);',
    'box-shadow:0 8px 32px rgba(217,70,166,0.45),0 2px 8px rgba(0,0,0,0.4);',
    'cursor:pointer;white-space:nowrap;',
    'transition:box-shadow .2s,transform .2s;font-family:inherit;}',
    '#pcta-btn:hover{box-shadow:0 12px 48px rgba(217,70,166,0.65),0 2px 8px rgba(0,0,0,0.4);transform:scale(1.04);}',
    '#pcta-btn .ppulse{width:8px;height:8px;background:#00FF41;border-radius:50%;',
    'animation:_ppulse 2s infinite;flex-shrink:0;}',
    '#pcta-btn .pcta-chev{transition:transform .3s;font-size:12px;}',
    '#pcta-btn.active .pcta-chev{transform:rotate(180deg);}',
    '@media(max-width:520px){',
    '.pcta-card{min-width:72px;padding:12px 10px;}',
    '.pcta-card i{font-size:1.2rem;}',
    '#pcta-btn{font-size:.82rem;padding:12px 22px;}',
    '#pcta-menu{gap:7px;}}',

    /* IA BUTTON en navbar */
    '.pnav2-ia-btn{background:rgba(0,255,65,0.08);border:1.5px solid rgba(0,255,65,0.3);',
    'color:#00FF41;width:44px;height:44px;border-radius:8px;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;font-size:1rem;',
    'flex-shrink:0;transition:all .2s;font-family:inherit;',
    'animation:_pia-glow 3s ease-in-out infinite;}',
    '@keyframes _pia-glow{0%,100%{box-shadow:0 0 0 0 rgba(0,255,65,0)}',
    '50%{box-shadow:0 0 14px 3px rgba(0,255,65,0.22)}}',
    '.pnav2-ia-btn:hover{background:rgba(0,255,65,0.2);border-color:#00FF41;',
    'box-shadow:0 0 22px rgba(0,255,65,0.45);animation:none;transform:scale(1.1);}',

    /* SOPORTE dropdown alineado a la derecha */
    '.pnav2-dd-menu.r{left:auto;right:0;}',

    /* CHATBOT GLOBAL — bubble flotante */
    '#pg-chat-bubble{position:fixed;bottom:28px;left:28px;right:auto;z-index:9000;',
    'width:64px;height:64px;border-radius:50%;',
    'background:linear-gradient(135deg,#00d2ff 0%,#006699 100%);',
    'border:2px solid rgba(0,210,255,0.55);cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;',
    'font-size:1.55rem;color:#fff;',
    'box-shadow:0 8px 32px rgba(0,210,255,0.45);',
    'transition:transform .2s,box-shadow .2s;',
    'animation:_pbot-pulse 2.5s ease-in-out infinite;}',
    '@keyframes _pbot-pulse{0%,100%{box-shadow:0 8px 32px rgba(0,210,255,0.45)}',
    '50%{box-shadow:0 8px 48px rgba(0,210,255,0.75),0 0 0 10px rgba(0,210,255,0.06)}}',
    '#pg-chat-bubble:hover{transform:scale(1.1);animation:none;',
    'box-shadow:0 12px 48px rgba(0,210,255,0.7);}',
    '#pg-chat-bubble .pg-notif{position:absolute;top:-1px;right:-1px;',
    'width:15px;height:15px;background:#00FF41;border-radius:50%;',
    'border:2px solid #050505;animation:_ppulse 2s infinite;}',

    /* Chat window */
    '#pg-chat-window{position:fixed;bottom:102px;left:28px;right:auto;z-index:9000;',
    'width:360px;max-height:540px;background:#0a0f18;',
    'border:1px solid rgba(0,210,255,0.28);border-radius:20px;',
    'display:flex;flex-direction:column;',
    'box-shadow:0 24px 80px rgba(0,0,0,0.7);',
    'transform:scale(0.92) translateY(20px);opacity:0;pointer-events:none;',
    'transition:transform .3s cubic-bezier(.34,1.56,.64,1),opacity .25s ease;}',
    '#pg-chat-window.open{transform:scale(1) translateY(0);opacity:1;pointer-events:auto;}',
    '@media(max-width:420px){#pg-chat-window{width:calc(100vw - 24px);left:12px;right:auto;bottom:88px;}}',
    '@media(max-width:768px){#pg-chat-bubble{display:none!important;}}',
    '.pg-chat-header{display:flex;align-items:center;gap:12px;',
    'padding:16px 18px;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;}',
    '.pg-chat-avatar{width:38px;height:38px;border-radius:50%;',
    'background:linear-gradient(135deg,#00d2ff,#006699);',
    'display:flex;align-items:center;justify-content:center;font-size:1.15rem;flex-shrink:0;}',
    '.pg-chat-info h4{font-size:.9rem;font-weight:700;color:#e2e8f0;margin:0;}',
    '.pg-chat-info p{font-size:.72rem;color:#00FF41;display:flex;align-items:center;gap:4px;margin:0;}',
    '.pg-chat-info p::before{content:"";width:6px;height:6px;background:#00FF41;',
    'border-radius:50%;display:inline-block;}',
    '.pg-chat-close{margin-left:auto;background:none;border:none;color:#94a3b8;',
    'cursor:pointer;font-size:1rem;padding:4px;transition:color .2s;font-family:inherit;}',
    '.pg-chat-close:hover{color:#e2e8f0;}',
    '.pg-chat-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;',
    'gap:12px;scroll-behavior:smooth;}',
    '.pg-chat-msgs::-webkit-scrollbar{width:4px;}',
    '.pg-chat-msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}',
    '.pg-msg{display:flex;gap:8px;max-width:88%;}',
    '.pg-msg.user{align-self:flex-end;flex-direction:row-reverse;}',
    '.pg-msg-av{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.08);',
    'display:flex;align-items:center;justify-content:center;font-size:.75rem;flex-shrink:0;margin-top:2px;}',
    '.pg-msg.user .pg-msg-av{background:rgba(217,70,166,0.3);}',
    '.pg-msg-bbl{background:rgba(255,255,255,0.06);border-radius:14px 14px 14px 4px;',
    'padding:10px 14px;font-size:.87rem;line-height:1.6;color:#e2e8f0;}',
    '.pg-msg.user .pg-msg-bbl{background:rgba(217,70,166,0.18);',
    'border-radius:14px 14px 4px 14px;}',
    '.pg-msg-bbl a{color:#00d2ff;text-decoration:none;}',
    '.pg-msg-bbl a:hover{text-decoration:underline;}',
    '.pg-typing{display:none;align-self:flex-start;}',
    '.pg-typing.visible{display:flex;}',
    '.pg-tdots{display:flex;gap:4px;padding:12px 16px;',
    'background:rgba(255,255,255,0.06);border-radius:14px 14px 14px 4px;}',
    '.pg-tdots span{width:7px;height:7px;background:#00d2ff;border-radius:50%;',
    'animation:bounce 1.2s ease-in-out infinite;}',
    '.pg-tdots span:nth-child(2){animation-delay:.2s;}',
    '.pg-tdots span:nth-child(3){animation-delay:.4s;}',
    '.pg-chat-sugs{padding:0 12px 10px;display:flex;flex-wrap:wrap;gap:6px;}',
    '.pg-sug-btn{background:rgba(0,210,255,0.08);border:1px solid rgba(0,210,255,0.2);',
    'color:#00d2ff;font-size:.72rem;font-weight:600;padding:5px 12px;',
    'border-radius:100px;cursor:pointer;transition:background .2s;white-space:nowrap;',
    'font-family:inherit;}',
    '.pg-sug-btn:hover{background:rgba(0,210,255,0.15);}',
    '.pg-chat-aviso{padding:6px 14px 0;font-size:.7rem;line-height:1.4;color:#94a3b8;flex-shrink:0;}',
    '.pg-chat-input-area{padding:12px 14px;border-top:1px solid rgba(255,255,255,0.06);',
    'display:flex;gap:8px;align-items:flex-end;flex-shrink:0;}',
    '#pg-chat-input{flex:1;background:rgba(255,255,255,0.05);',
    'border:1px solid rgba(255,255,255,0.1);border-radius:12px;',
    'color:#e2e8f0;font-size:16px;font-family:inherit;',
    'padding:10px 14px;outline:none;resize:none;min-height:40px;max-height:100px;',
    'transition:border-color .2s;}',
    '#pg-chat-input:focus{border-color:rgba(0,210,255,0.4);}',
    '#pg-chat-input::placeholder{color:#94a3b8;}',
    '#pg-chat-send{width:44px;height:44px;border-radius:10px;',
    'background:linear-gradient(135deg,#00d2ff,#006699);border:none;cursor:pointer;',
    'color:#fff;font-size:.9rem;display:flex;align-items:center;justify-content:center;',
    'flex-shrink:0;transition:opacity .2s;font-family:inherit;}',
    '#pg-chat-send:hover{opacity:.85;}',
    '#pg-chat-send:disabled{opacity:.4;cursor:not-allowed;}',

    /* THEME TOGGLE BTN */
    '.pnav2-theme-btn{background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.15);',
    'color:#e2e8f0;width:44px;height:44px;border-radius:8px;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;font-size:1rem;',
    'flex-shrink:0;transition:all .2s;font-family:inherit;}',
    '.pnav2-theme-btn:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.35);}',
    /* Lupa: buscador de la web + IA (js/buscador-web.js). Visible también en celular (a la derecha). */
    '.pnav2-buscar-btn{background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.15);color:#e2e8f0;width:44px;height:44px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;transition:all .2s;font-family:inherit;}',
    '.pnav2-buscar-btn:hover{background:rgba(0,210,255,.12);border-color:rgba(0,210,255,.5);color:#fff;}',
    '@media(max-width:1024px){.pnav2-right{justify-content:flex-end!important;}}',
    /* Simetría (oct-2026): el logo queda en el eje central exacto y la barra de arriba se alinea con él.
       Izquierda (de afuera hacia el logo): tema · IA · SERVICIOS · … · BLOG  ·  Derecha: SIGUE TU CASO · SOPORTE · … · lupa · HAZ TU PEDIDO.
       Entre 1025 y 1260 px no cabía todo (se salía de la pantalla): ese rango pasa al menú ☰. La barra de arriba ya
       va centrada como grupo (flex). */
    '@media(min-width:1261px){.pnav2-c{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);}}',
    '@media(min-width:1261px) and (max-width:1340px){.pnav2-theme-btn,.pnav2-ia-btn{display:none!important;}.pnav2-left,.pnav2-right{gap:10px;}.pnav2-logo{padding:0 14px;}.pnav2-left>a,.pnav2-right>a,.pnav2-dd-btn{font-size:12.5px;letter-spacing:.5px;}.pnav2-ped-btn{padding-left:16px;padding-right:16px;}}',
    '@media(max-width:1260px){.pnav2-left>a:not(.pnav2-dd *){display:none;}.pnav2-right>a{display:none;}.pnav2-ham{display:block!important;}.pnav2-right{justify-content:flex-end!important;}}',
    ':focus-visible{outline:2px solid #D946A6;outline-offset:2px;border-radius:3px;}',
  ].join('');

  var st = document.createElement('style');
  st.id = 'pheader-v2-css';
  st.textContent = css;
  document.head.appendChild(st);

  /* ── LANG ────────────────────────────────────────────────── */
  var langHtml = showLang
    ? '<div class="pheader-lang" role="group" aria-label="Idioma" translate="no">' +
        '<button type="button" data-lang-btn="es" onclick="_phdrIdioma(\'es\')">ES</button>' +
        '<button type="button" data-lang-btn="en" onclick="_phdrIdioma(\'en\')">EN</button>' +
        '<button type="button" data-lang-btn="pt" onclick="_phdrIdioma(\'pt\')">PT</button>' +
      '</div>'
    : '';

  /* ── TOPBAR ──────────────────────────────────────────────── */
  var topbarHtml =
    '<div id="nav-topbar">' +
      '<form id="tb-form" onsubmit="_phdrLogin(event)">' +
        '<div class="tb-input-wrap">' +
          '<i class="far fa-user"></i>' +
          '<input id="tb-email" type="email" class="tb-input" placeholder="Correo electrónico" autocomplete="email">' +
        '</div>' +
        '<div class="tb-input-wrap">' +
          '<i class="fas fa-lock"></i>' +
          '<input id="tb-pass" type="password" class="tb-input" placeholder="Contraseña" autocomplete="current-password">' +
        '</div>' +
        '<div class="tb-sep"></div>' +
        '<button type="submit" class="tb-acceso">ACCESO</button>' +
        '<a href="/app/login.html?mode=register" class="tb-registro">REGISTRO</a>' +
      '</form>' +
      '<div id="urgencia-widget" style="display:none;align-items:center;gap:6px;background:rgba(217,70,166,.12);border:1px solid rgba(217,70,166,.3);border-radius:100px;padding:4px 12px 4px 8px;font-size:.72rem;font-weight:700;color:#e2e8f0;margin-left:8px;white-space:nowrap;cursor:pointer;text-decoration:none;" onclick="window.location.href=\'/calculadora\'">' +
        '<span style="font-size:.88rem;">⚡</span>' +
        '<span id="urgencia-text">Cargando…</span>' +
      '</div>' +
      langHtml +
    '</div>';

  /* ── NAVBAR ──────────────────────────────────────────────── */
  var page = activePath.split('/').pop() || 'index.html';
  function ac(href) {
    var h = href.split('/').pop().split('#')[0];
    return (h === page || (h === '' && (page === '' || page === 'index.html'))) ? ' class="pnav2-active" aria-current="page"' : '';
  }

  var navHtml =
    '<nav id="pheader-v2" aria-label="Navegación principal">' +
      '<div class="pnav2-c">' +

        /* Hamburger */
        '<button type="button" class="pnav2-ham" id="pnav2-ham" aria-label="Abrir menú" aria-expanded="false" aria-controls="pnav2-mob">' +
          '<i class="fas fa-bars" id="pnav2-ham-ico"></i>' +
        '</button>' +

        /* Izquierda */
        '<div class="pnav2-left">' +
          '<button type="button" class="pnav2-theme-btn" id="pnav2-theme-btn" onclick="_phdrToggleTheme()" aria-label="Cambiar tema" title="Modo claro / oscuro">🌙</button>' +
          '<button type="button" class="pnav2-ia-btn" id="pnav2-ia-btn" onclick="_phdrToggleIA()" aria-label="Asistente IA" aria-expanded="false" aria-controls="pg-chat-window">' +
            '<i class="fas fa-robot"></i>' +
          '</button>' +
          '<div class="pnav2-dd" id="pnav2-dd">' +
            '<button type="button" class="pnav2-dd-btn" aria-haspopup="true" aria-expanded="false">' +
              'SERVICIOS <i class="fas fa-chevron-down pnav2-dd-arrow"></i>' +
            '</button>' +
            '<div class="pnav2-dd-menu">' +
              '<a href="/diseno-remoto" style="background:rgba(217,70,166,.08);border-left:2px solid #D946A6;">' +
                '<i class="fas fa-globe" style="color:#D946A6"></i>' +
                '<span>DISEÑO CAD REMOTO<span class="dd-sub">🌍 Internacional · Exocad · entrega 24h</span></span>' +
              '</a>' +
              '<a href="/calculadora-diseno">' +
                '<i class="fas fa-calculator"></i>' +
                '<span>COTIZADOR DISEÑO<span class="dd-sub">Cotiza tu caso en 1 minuto</span></span>' +
              '</a>' +
              '<a href="/diseno-cad">' +
                '<i class="fas fa-drafting-compass"></i>' +
                '<span>DISEÑO CAD — INFO<span class="dd-sub">Exocad · 3Shape · Archivo STL</span></span>' +
              '</a>' +
              '<a href="/fresado-cam">' +
                '<i class="fas fa-cog"></i>' +
                '<span>FRESADO &amp; IMPRESIÓN<span class="dd-sub">Zirconio · Disilicato · Resina</span></span>' +
              '</a>' +
              '<a href="/escaner-domicilio">' +
                '<i class="fas fa-mobile-alt"></i>' +
                '<span>ESCANEOS A DOMICILIO<span class="dd-sub">Norte Bogotá · 2 h hábiles</span></span>' +
              '</a>' +
              '<a href="/guias-quirurgicas" style="background:rgba(0,210,255,.06);border-left:2px solid #00d2ff;">' +
                '<i class="fas fa-crosshairs" style="color:#00d2ff"></i>' +
                '<span>CIRUGÍA GUIADA<span class="dd-sub">🎯 Planificación digital · guía impresa · desde 4h</span></span>' +
              '</a>' +
            '</div>' +
          '</div>' +
          '<a href="/portafolio"' + ac('/portafolio') + '>PORTAFOLIO</a>' +
          '<a href="/envia-tu-scanner"' + ac('/envia-tu-scanner') + '>ENVÍA TU ESCANEO</a>' +
          '<a href="/journal"' + ac('/journal') + '>BLOG</a>' +
        '</div>' +

        /* Logo centrado */
        '<a href="/" class="pnav2-logo" translate="no">' +
          '<strong>PRODIGY</strong>' +
          '<em>Digital Dentistry</em>' +
        '</a>' +

        /* Derecha */
        '<div class="pnav2-right">' +
          '<a href="/seguimiento-caso"' + ac('/seguimiento-caso') + '>SIGUE TU CASO</a>' +
          '<div class="pnav2-dd" id="pnav2-dd-sop">' +
            '<button type="button" class="pnav2-dd-btn" aria-haspopup="true" aria-expanded="false">' +
              'SOPORTE <i class="fas fa-chevron-down pnav2-dd-arrow"></i>' +
            '</button>' +
            '<div class="pnav2-dd-menu r">' +
              '<a href="/soporte">' +
                '<i class="fas fa-headset"></i>' +
                '<span>Centro de Soporte<span class="dd-sub">FAQs · guías · materiales</span></span>' +
              '</a>' +
              '<button type="button" onclick="_phdrToggleIA()" aria-label="Abrir asistente IA">' +
                '<i class="fas fa-robot" style="color:#00FF41"></i>' +
                '<span>Solución IA<span class="dd-sub">Gemini 2.0 · respuesta 24/7</span></span>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<a href="/nosotros"' + ac('/nosotros') + '>NOSOTROS</a>' +
          '<button type="button" class="pnav2-buscar-btn" id="pnav2-buscar-btn" onclick="_phdrBuscar()" aria-label="Buscar en la web o preguntar a la IA" title="Buscar (Ctrl+K)">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
          '</button>' +
          '<div class="pnav2-ped-wrap" id="pnav2-ped-wrap" onmouseenter="_phdrPedHover(true)" onmouseleave="_phdrPedHover(false)">' +
            '<button type="button" class="pnav2-ped-btn">' +
              'HAZ TU PEDIDO <i class="fas fa-chevron-down" style="font-size:9px;margin-left:4px;transition:transform .2s;" id="pnav2-ped-arrow"></i>' +
            '</button>' +
            '<div class="pnav2-ped-drop" id="pnav2-ped-drop">' +
              '<a href="/app/login.html?redirect=/flujo-diseno" class="pnav2-ped-card">' +
                '<i class="fas fa-drafting-compass" style="color:#00d2ff;font-size:1.2rem;"></i>' +
                '<div><strong>Diseño CAD</strong><span>Exocad · 3Shape · archivo STL</span></div>' +
              '</a>' +
              '<a href="/app/login.html?redirect=/flujo-fresado" class="pnav2-ped-card">' +
                '<i class="fas fa-cog" style="color:#D4AF37;font-size:1.2rem;"></i>' +
                '<div><strong>Fabricación CAM</strong><span>Zirconia · Disilicato · PMMA</span></div>' +
              '</a>' +
              '<a href="/app/login.html?redirect=/flujo-lab" class="pnav2-ped-card">' +
                '<i class="fas fa-layer-group" style="color:#D946A6;font-size:1.2rem;"></i>' +
                '<div><strong>Flujo Lab Full</strong><span>Modelo → diseño → acabado final</span></div>' +
              '</a>' +
              '<a href="/escaner-domicilio" class="pnav2-ped-card">' +
                '<i class="fas fa-mobile-alt" style="color:#00FF41;font-size:1.2rem;"></i>' +
                '<div><strong>Escaneos a Domicilio</strong><span>Norte Bogotá · 2h hábiles</span></div>' +
              '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +

      '</div>' +
    '</nav>' +

    /* MOBILE NAV */
    '<div class="pnav2-mob" id="pnav2-mob" role="navigation" aria-label="Menú móvil">' +
      '<a href="/diseno-cad"><i class="fas fa-drafting-compass" style="margin-right:8px"></i>DISEÑO CAD</a>' +
      '<a href="/fresado-cam"><i class="fas fa-cog" style="margin-right:8px"></i>FRESADO &amp; IMPRESIÓN</a>' +
      '<a href="/escaner-domicilio"><i class="fas fa-mobile-alt" style="margin-right:8px"></i>ESCANEOS A DOMICILIO</a>' +
      '<a href="/portafolio">PORTAFOLIO</a>' +
      '<a href="/envia-tu-scanner">ENVÍA TU ESCANEO</a>' +
      '<a href="/nosotros">NOSOTROS</a>' +
      '<a href="/journal">BLOG</a>' +
      '<a href="/seguimiento-caso">SIGUE TU CASO</a>' +
      '<a href="/soporte">SOPORTE</a>' +
      '<button type="button" onclick="_phdrToggleIA();document.getElementById(\'pnav2-mob\').classList.remove(\'open\');document.getElementById(\'pnav2-ham-ico\').className=\'fas fa-bars\';document.body.style.overflow=\'\';" style="background:none;border:none;cursor:pointer;color:#00FF41;font:inherit;font-size:.9rem;font-weight:700;display:flex;align-items:center;padding:12px 20px;width:100%;text-align:left;" aria-label="Abrir asistente IA">' +
        '<i class="fas fa-robot" style="margin-right:8px"></i>HABLAR CON IA' +
      '</button>' +
      '<a href="https://wa.me/573212816716" target="_blank" rel="noopener noreferrer" style="color:#25D366;">' +
        '<i class="fab fa-whatsapp" style="margin-right:8px"></i>CONTACTAR' +
      '</a>' +
      '<a href="/app/login.html" style="color:#D946A6;font-weight:900;">' +
        '<i class="fas fa-key" style="margin-right:8px"></i>INGRESAR' +
      '</a>' +
      '<button type="button" onclick="_phdrToggleTheme();document.getElementById(\'pnav2-mob\').classList.remove(\'open\');document.getElementById(\'pnav2-ham-ico\').className=\'fas fa-bars\';document.body.style.overflow=\'\';" id="pnav2-theme-mob" style="background:none;border:none;cursor:pointer;color:#94a3b8;font:inherit;font-size:.9rem;font-weight:700;display:flex;align-items:center;padding:12px 20px;width:100%;text-align:left;" aria-label="Cambiar modo de color">' +
        '<i class="fas fa-moon" style="margin-right:8px" id="pnav2-theme-ico"></i>MODO CLARO' +
      '</button>' +
    '</div>' +

    /* CTA FLOTANTE — suprimido si noCta:true */
    (noCta ? '' :
      '<div id="pcta-pedido">' +
        '<div id="pcta-label" style="display:none;">¿Qué necesitas?</div>' +
        '<div id="pcta-menu">' +
          '<a href="/app/login.html?redirect=/flujo-diseno" class="pcta-card pcta-card-cad">' +
            '<i class="fas fa-drafting-compass"></i>' +
            '<span class="pcta-card-title">Diseño CAD</span>' +
            '<span class="pcta-card-sub">Exocad · STL</span>' +
          '</a>' +
          '<a href="/app/login.html?redirect=/flujo-fresado" class="pcta-card pcta-card-cam">' +
            '<i class="fas fa-cog"></i>' +
            '<span class="pcta-card-title">Fabricación CAM</span>' +
            '<span class="pcta-card-sub">Zirconia · PMMA</span>' +
          '</a>' +
          '<a href="/app/login.html?redirect=/flujo-lab" class="pcta-card pcta-card-lab">' +
            '<i class="fas fa-layer-group"></i>' +
            '<span class="pcta-card-title">Flujo Lab Full</span>' +
            '<span class="pcta-card-sub">Completo → entrega</span>' +
          '</a>' +
          '<a href="/escaner-domicilio" class="pcta-card pcta-card-scan">' +
            '<i class="fas fa-mobile-alt"></i>' +
            '<span class="pcta-card-title">Escáner</span>' +
            '<span class="pcta-card-sub">Norte Bogotá</span>' +
          '</a>' +
        '</div>' +
        '<button type="button" id="pcta-btn" onclick="_phdrCtaToggle(this)" aria-expanded="false">' +
          '<span class="ppulse"></span>' +
          'HAZ TU PEDIDO' +
          '<i class="fas fa-chevron-up pcta-chev"></i>' +
        '</button>' +
      '</div>') +

    /* CHATBOT GLOBAL — ícono robot, presente en todas las páginas */
    '<button type="button" id="pg-chat-bubble" onclick="_phdrToggleIA()" aria-label="Asistente IA PRODIGY">' +
      '<i class="fas fa-robot" id="pg-chat-ico"></i>' +
      '<span class="pg-notif"></span>' +
    '</button>' +
    '<div id="pg-chat-window" role="dialog" aria-label="Asistente IA PRODIGY" aria-modal="false">' +
      '<div class="pg-chat-header">' +
        '<div class="pg-chat-avatar"><i class="fas fa-robot"></i></div>' +
        '<div class="pg-chat-info">' +
          '<h4>Asistente PRODIGY IA</h4>' +
          '<p>En línea · Gemini 2.0</p>' +
        '</div>' +
        '<button type="button" class="pg-chat-close" onclick="_phdrToggleIA()" aria-label="Cerrar"><i class="fas fa-times"></i></button>' +
      '</div>' +
      '<div class="pg-chat-msgs" id="pg-chat-msgs">' +
        '<div class="pg-msg bot">' +
          '<div class="pg-msg-av">🤖</div>' +
          '<div class="pg-msg-bbl">¡Hola! Soy el asistente de <strong>PRODIGY Lab Dental</strong>. Puedo ayudarte con materiales, tiempos de entrega, flujos de escaneo y más. ¿En qué te ayudo?</div>' +
        '</div>' +
      '</div>' +
      '<div class="pg-chat-sugs" id="pg-chat-sugs">' +
        '<button type="button" class="pg-sug-btn" onclick="_phdrSendSug(this)">⏱ Tiempo de entrega</button>' +
        '<button type="button" class="pg-sug-btn" onclick="_phdrSendSug(this)">🦷 Materiales</button>' +
        '<button type="button" class="pg-sug-btn" onclick="_phdrSendSug(this)">📂 Formatos STL</button>' +
        '<button type="button" class="pg-sug-btn" onclick="_phdrSendSug(this)">💰 Cómo cotizar</button>' +
      '</div>' +
      '<div class="pg-typing" id="pg-typing">' +
        '<div class="pg-msg-av">🤖</div>' +
        '<div class="pg-tdots"><span></span><span></span><span></span></div>' +
      '</div>' +
      '<div class="pg-chat-aviso">🔒 No escribas datos de pacientes (nombres, documentos, fotos). Guardamos las preguntas sin datos personales para mejorar las respuestas.</div>' +
      '<div class="pg-chat-input-area">' +
        '<textarea id="pg-chat-input" placeholder="Escribe tu pregunta…" rows="1" onkeydown="_phdrHandleKey(event)" aria-label="Escribe tu mensaje al asistente IA"></textarea>' +
        '<button type="button" id="pg-chat-send" onclick="_phdrSendMsg()" aria-label="Enviar"><i class="fas fa-paper-plane"></i></button>' +
      '</div>' +
    '</div>';

  /* ── INJECT ──────────────────────────────────────────────── */
  document.body.insertAdjacentHTML('afterbegin', topbarHtml + navHtml);
  /* Marcar id centinela */
  document.getElementById('pheader-v2').setAttribute('data-pheader', 'v2');

  /* ── JS ──────────────────────────────────────────────────── */

  /* Scroll: sombra navbar + mostrar CTA flotante */
  window.addEventListener('scroll', function () {
    var nav = document.getElementById('pheader-v2');
    var cta = document.getElementById('pcta-pedido');
    if (nav) nav.classList.toggle('nav-scrolled', window.scrollY > 20);
    if (cta) {
      // Ocultar el CTA flotante cuando el footer entra en pantalla (evita que su menú tape el pie de página)
      var foot = document.getElementById('pfoot-root');
      var footVisible = foot && foot.getBoundingClientRect().top < (window.innerHeight - 20);
      cta.classList.toggle('visible', window.scrollY > 200 && !footVisible);
    }
  }, { passive: true });

  /* ── WIDGET DE URGENCIA — Producción L-V 8am-5pm (corte) ─────
     El sábado (8am-12m) solo se atiende y se terminan pendientes:
     lo que entra el sábado cuenta desde el lunes.                */
  (function initUrgencia() {
    var widget = document.getElementById('urgencia-widget');
    var label  = document.getElementById('urgencia-text');
    if (label) label.setAttribute('translate', 'no');
    if (!widget || !label) return;

    // Día de producción: L-V y no festivo (festivos solo si PFechas está cargado)
    function esDiaProduccion(d) {
      if (window.PFechas) return window.PFechas.esHabil(d);
      var dow = d.getDay();
      return dow !== 0 && dow !== 6;
    }

    // Retorna próximo día de producción (salta sábado, domingo y festivos)
    function siguienteDiaHabil(d) {
      var sig = new Date(d);
      do { sig.setDate(sig.getDate() + 1); } while (!esDiaProduccion(sig));
      return sig;
    }

    // Formatea fecha legible "lunes 28 abr"
    var DIAS  = { es: ['dom','lun','mar','mié','jue','vie','sáb'], en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], pt: ['dom','seg','ter','qua','qui','sex','sáb'] };
    var MESES = { es: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'], en: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], pt: ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'] };
    var AVISO = {
      es: ['Diseño 24h · Fabricación 24–48h · Envío ', 'Diseño 24h · Fabricación 24–48h · Producción Lun–Vie'],
      en: ['Design 24h · Manufacturing 24–48h · Ships ', 'Design 24h · Manufacturing 24–48h · Production Mon–Fri'],
      pt: ['Design 24h · Fabricação 24–48h · Envio ', 'Design 24h · Fabricação 24–48h · Produção Seg–Sex']
    };
    // PT lo traduce Google, pero este texto cambia cada segundo: se escribe ya en portugués y Google no lo toca
    function idioma() { var l = window._phdrLang ? window._phdrLang() : 'es'; try { if (l === 'es' && localStorage.getItem('prd_lang') === 'pt' && location.pathname.indexOf('/en/') !== 0) l = 'pt'; } catch (e) {} return l; }
    function fmtDia(d) { var l = idioma(); return DIAS[l][d.getDay()] + ' ' + d.getDate() + ' ' + MESES[l][d.getMonth()]; }

    function tick() {
      var ahora = new Date();
      var hora  = ahora.getHours();
      var min   = ahora.getMinutes();
      var seg   = ahora.getSeconds();

      // Fuera de horario de producción: sáb/dom/festivo, o ≥17h (corte 5pm), o antes de 8am
      var antesDeApertura = hora < 8;
      var despuesDeCorte  = hora >= 17;
      var enHorario       = esDiaProduccion(ahora) && !antesDeApertura && !despuesDeCorte;

      widget.style.display = 'flex';

      if (enHorario) {
        // Tiempo restante hasta las 17:00
        var corteSeg = (17 - hora) * 3600 - min * 60 - seg;
        var hh = Math.floor(corteSeg / 3600);
        var mm = Math.floor((corteSeg % 3600) / 60);
        var ss = corteSeg % 60;
        var countdown = (hh > 0 ? hh + 'h ' : '') +
                        (mm > 0 || hh > 0 ? mm + 'min ' : '') +
                        ss + 's';

        // "pasado mañana" = 2 días hábiles desde hoy
        var entrega1 = siguienteDiaHabil(ahora);       // mañana (o lunes si viernes)
        var entrega2 = siguienteDiaHabil(entrega1);    // pasado mañana hábil
        label.textContent = AVISO[idioma()][0] + fmtDia(entrega2);
        widget.style.borderColor = 'rgba(217,70,166,.5)';
        widget.style.background  = 'rgba(217,70,166,.14)';
      } else {
        label.textContent = AVISO[idioma()][1];
        widget.style.borderColor = 'rgba(148,163,184,.25)';
        widget.style.background  = 'rgba(30,41,59,.4)';
      }
    }

    tick();
    setInterval(tick, 1000);
  })();

  /* Hamburger */
  document.getElementById('pnav2-ham').addEventListener('click', function () {
    var mob = document.getElementById('pnav2-mob');
    var ico = document.getElementById('pnav2-ham-ico');
    var open = mob.classList.toggle('open');
    ico.className = open ? 'fas fa-times' : 'fas fa-bars';
    this.setAttribute('aria-expanded', open ? 'true' : 'false');
    this.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  document.querySelectorAll('.pnav2-mob a').forEach(function (a) {
    a.addEventListener('click', function () {
      document.getElementById('pnav2-mob').classList.remove('open');
      document.getElementById('pnav2-ham-ico').className = 'fas fa-bars';
      document.body.style.overflow = '';
    });
  });

  /* Dropdown SERVICIOS — click en desktop */
  var dd    = document.getElementById('pnav2-dd');
  var ddBtn = dd.querySelector('.pnav2-dd-btn');
  ddBtn.addEventListener('click', function (e) {
    if (window.innerWidth <= 1024) return;
    e.preventDefault();
    var open = dd.classList.toggle('open');
    ddBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function (e) {
    if (!dd.contains(e.target)) {
      dd.classList.remove('open');
      ddBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* Dropdown SOPORTE */
  var ddSop    = document.getElementById('pnav2-dd-sop');
  var ddSopBtn = ddSop.querySelector('.pnav2-dd-btn');
  ddSopBtn.addEventListener('click', function (e) {
    if (window.innerWidth <= 1024) return;
    e.preventDefault();
    var open = ddSop.classList.toggle('open');
    ddSopBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function (e) {
    if (!ddSop.contains(e.target)) {
      ddSop.classList.remove('open');
      ddSopBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* HAZ TU PEDIDO dropdown */
  window._phdrPedHover = function (entering) {
    var drop  = document.getElementById('pnav2-ped-drop');
    var arrow = document.getElementById('pnav2-ped-arrow');
    if (!drop) return;
    drop.classList.toggle('open', entering);
    if (arrow) arrow.style.transform = entering ? 'rotate(180deg)' : '';
  };

  /* CTA flotante toggle */
  window._phdrCtaToggle = function (btn) {
    var menu  = document.getElementById('pcta-menu');
    var label = document.getElementById('pcta-label');
    var open  = menu.classList.toggle('open');
    btn.classList.toggle('active', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (label) label.style.display = open ? 'block' : 'none';
  };
  /* Cerrar CTA al click fuera */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#pcta-pedido')) {
      var menu  = document.getElementById('pcta-menu');
      var btn   = document.getElementById('pcta-btn');
      var label = document.getElementById('pcta-label');
      if (menu) { menu.classList.remove('open'); }
      if (btn)  { btn.classList.remove('active'); btn.setAttribute('aria-expanded','false'); }
      if (label){ label.style.display = 'none'; }
    }
  });

  /* ── CHATBOT GLOBAL (Gemini 2.0) ─────────────────────────── */
  var _pgChatOpen    = false;
  var _pgChatHistory = [];
  // Clave movida a Cloudflare Pages Environment Variables (GEMINI_API_KEY)
  // El bot llama al proxy /api/gemini — la clave nunca sale al cliente
  var _pgGUrl = '/api/gemini';

  /* Una sola pregunta a la IA, con el mismo contexto que el chat (lo usa el orbe del Centro de Ayuda, js/orbe-ia.js) */
  window._phdrPreguntaIA = function (texto, canal) {
    return fetch(_pgGUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Canal': canal || 'orbe' },
      body: JSON.stringify({ system_instruction: { parts: [{ text: _pgBuildPrompt() }] }, contents: [{ role: 'user', parts: [{ text: String(texto).slice(0, 300) }] }] })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        var c = d && d.candidates && d.candidates[0] && d.candidates[0].content;
        if (c && c.parts) return c.parts.map(function (p) { return p.text || ''; }).join('').trim();
        var e = new Error((d && d.error) || ('HTTP ' + r.status)); e.status = r.status; throw e;
      });
    });
  };

  function _pgBuildPrompt() {
    var title = document.title || 'PRODIGY Lab Dental';
    var path  = window.location.pathname;
    return 'Eres el asistente técnico oficial de PRODIGY Lab Dental, laboratorio CAD/CAM de alta precisión en Bogotá, Colombia. Servicio a todo el mundo.\n\n' +
      'PÁGINA ACTUAL: ' + title + ' (' + path + ')\n' +
      'Responde de forma contextual a la página que el usuario está visitando.\n\n' +
      'SERVICIOS:\n' +
      '• Diseño CAD remoto (Exocad, 3Shape, CoDiagnostiX, Blender for Dental, 3Shape Ortho, Rhinoceros 3D)\n' +
      '• Fresado 5 ejes: Amann Girrbach 🇩🇪 + XTCERA + VHF (zirconia Ivoclar/Vita, PMMA, titanio ±10µm)\n' +
      '• Impresión 3D resina biocompatible: NextDent, SprintRay, Anycubic, Phrozen\n' +
      '• Alineadores invisibles: setup Exocad Ortho, STLs por etapa\n' +
      '• Guías quirúrgicas y planificación de implantes (CoDiagnostiX, exoplan, RealGuide, BlueSkyPlan), todas las marcas de implantes. PROTOCOLO: el doctor marca los sitios en el odontograma del flujo de diseño con la indicación «Planificación de implantes» y justo debajo configura la planificación y, si la quiere, la Guía Quirúrgica y envía CBCT en DICOM (sin contacto oclusal, separador de carrillo, cortes 0,5 mm ~150 micras) + escaneo intraoral de ambas arcadas con mordida; edéntulo total: doble CBCT (prótesis marcada en boca y prótesis sola). Indica el sistema de implante y, si lo tiene, Ø × largo; si no, se sugiere en la planificación. Revisamos viabilidad del CBCT, planificamos posición, profundidad e implante según la prótesis (margen de seguridad de 2 mm a estructuras) y el doctor APRUEBA o pide cambios antes de diseñar y fabricar. El apoyo de la guía (dientes, mucosa o hueso), las anillas y el guiado se definen en la planificación, no los elige el doctor al pedir.\n' +
      '• Soporte técnico XTCERA y escáner Alistar Sensa\n' +
      '• Escaneo intraoral a domicilio: zona norte Bogotá\n' +
      '• Hornos sinterizado: Dentsply Sirona, Vita, Ivoclar Programat\n\n' +
      'PÁGINAS CLAVE DEL SITIO:\n' +
      '• /diseno-remoto — landing diseño CAD remoto (anuncios)\n' +
      '• /diseno-cad — servicio diseño CAD\n' +
      '• /fresado-cam — servicio fresado\n' +
      '• /calculadora — cotizador online\n' +
      '• /escaneo-fotogrametria — escaneo a domicilio Aidite Rapid 5 (disponible). Fotogrametría full-arch: PRÓXIMAMENTE, en certificación INVIMA de los scanbodies. NO ofrecerla como disponible: invitar a pedir aviso por WhatsApp y recibir el caso All-on-X con escaneo intraoral con scanbodies de multi-unit\n' +
      '• /en/global-design — English landing for international clients\n' +
      '• /guia-tecnica — guías exportación STL por software\n' +
      '• /seguimiento-caso — tracking pedidos\n\n' +
      'TIEMPOS: Diseño desde 15 min* (simple) · Fresado 24-48h hábiles · 3D 24-48h hábiles.\n' +
      'FORMATOS ACEPTADOS: STL, OBJ, PLY, Exocad .constructioninfo, 3Shape .3oxz, iTero, Medit, Trios, DICOM.\n' +
      'PAGOS: Stripe (internacional) · Wompi/PSE (Colombia) · PayPal · Transferencia.\n' +
      'POLÍTICA: Cliente nuevo 100% anticipado · Cliente existente 50% abono / 50% contra entrega.\n' +
      'CONTACTO: WhatsApp +57 321 281 6716 · gerencia@prodigylabdental.com\n' +
      'HORARIO: L-V 8am-6pm · Sábados 8am-12m (solo atención; lo recibido el sábado entra a producción el lunes) · Domingos y festivos cerrado · Corte de pedidos 5pm (hora Colombia).\n\n' +
      'PROGRAMA DE REFERIDOS: Si un doctor pregunta por descuentos o cómo referir colegas, menciona el programa en /referidos o desde el portal /app/client-panel.html → "Referir Colegas". El colega obtiene 5% descuento en su primer caso. El referidor recibe $30.000 COP de crédito (cupón CRED-XXXXXXXX) automáticamente cuando su colega paga.\n\n' +
      'PORTAL DEL DOCTOR (/app/client-panel.html): El doctor puede ver sus casos en tiempo real, aprobar diseños, descargar STL, cotizar, aplicar cupones CRED-, ver historial de gastos y referir colegas. El seguimiento usa Supabase Realtime — sin recargar la página.\n\n' +
      'REGISTRO: Cualquier doctor puede crear su cuenta enviando un escáner en /envia-tu-scanner — el sistema crea automáticamente su portal y le envía acceso por WA.\n\n' +
      'LABORATORIO PARA DENTISTAS DE EE.UU. (/en/veneers, en ingles): fabricamos carillas y coronas y las enviamos a consultorios en Estados Unidos, 40-60% mas economico que un laboratorio local de alla. Precios por unidad en USD: carilla e.max desde $89, carilla feldespatica desde $139, corona zirconia desde $59, corona e.max desde $69, corona sobre implante +Ti-base desde $159, inlay/onlay desde $65. Primer pedido 20% de descuento + envio gratis; envio gratis desde 12 unidades. Entrega 3-5 dias habiles mas envio con guia. El dentista aprueba el diseno 3D antes de fabricar y hay garantia de remake por error del laboratorio. Pago 50% para iniciar y 50% antes del envio (tarjeta, PayPal o transferencia). Terminos en /en/veneer-terms. Es un servicio B2B: solo para odontologos con licencia, nunca a pacientes directamente.\n\n' +
      'FAQ COMPLETA: /preguntas — 12 preguntas frecuentes con buscador y filtros por categoría.\n\n' +
      'NUEVAS FUNCIONALIDADES: Borrador en flujos (localStorage 7 días). Estimador de entrega dinámico. Notificaciones RT en portal. Chatbot IA disponible 24/7. Cajones de envío (WA, Drive, WeTransfer, Buzón Dropbox). Sugerencia de próximo pedido basada en historial.\n\n' +
      'Responde en español, técnico pero accesible para odontólogos y técnicos dentales. Máx 3-4 párrafos cortos. ' +
      'Si preguntan precios específicos, usa la calculadora en /calculadora o invita a WhatsApp para cotización exacta. ' +
      'No inventes datos — di "confirma con el equipo técnico vía WhatsApp". ' +
      'Para clientes internacionales que escriben en inglés, responde en inglés. ' +
      'Usa emojis técnicos con moderación (🦷 ⚙️ 📐 💎).';
  }

  /* ── BUSCADOR DE LA WEB + IA ── se carga la primera vez que se usa (lupa del menú, Ctrl+K o «/») */
  window._phdrBuscar = function () {
    var abrir = function () { window.Buscador.abrir({ wa: '573212816716' }); };
    if (window.Buscador) return abrir();
    var s = document.createElement('script'); s.src = '/js/buscador-web.js?v=20261007'; s.onload = abrir;
    document.head.appendChild(s);
  };
  if (window.location.pathname.indexOf('/app/') !== 0) {          // en /app el Ctrl+K es el buscador de casos
    document.addEventListener('keydown', function (e) {
      var k = (e.key || '').toLowerCase(), t = e.target, escribiendo = t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName));
      if (((e.ctrlKey || e.metaKey) && k === 'k') || (k === '/' && !escribiendo && !e.ctrlKey && !e.metaKey && !e.altKey)) { e.preventDefault(); window._phdrBuscar(); }
    });
  }

  window._phdrToggleIA = function () {
    _pgChatOpen = !_pgChatOpen;
    var win = document.getElementById('pg-chat-window');
    var ico = document.getElementById('pg-chat-ico');
    var btn = document.getElementById('pnav2-ia-btn');
    if (win) win.classList.toggle('open', _pgChatOpen);
    if (ico) ico.className = _pgChatOpen ? 'fas fa-times' : 'fas fa-robot';
    if (btn) btn.setAttribute('aria-expanded', _pgChatOpen ? 'true' : 'false');
    if (_pgChatOpen) {
      var notif = document.querySelector('#pg-chat-bubble .pg-notif');
      if (notif) notif.style.display = 'none';
      var inp = document.getElementById('pg-chat-input');
      if (inp) setTimeout(function(){ inp.focus(); }, 300);
    }
  };

  window._phdrOpenIA = window._phdrToggleIA;

  window._phdrHandleKey = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window._phdrSendMsg(); }
  };

  window._phdrSendSug = function (btn) {
    var inp = document.getElementById('pg-chat-input');
    if (inp) inp.value = btn.textContent.replace(/^[^\w]+ /, '');
    var sugs = document.getElementById('pg-chat-sugs');
    if (sugs) sugs.style.display = 'none';
    window._phdrSendMsg();
  };

  function _pgEscHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function _pgAppendMsg(role, text) {
    var wrap = document.getElementById('pg-chat-msgs');
    if (!wrap) return;
    var div  = document.createElement('div');
    div.className = 'pg-msg ' + (role === 'user' ? 'user' : 'bot');
    var av  = document.createElement('div');
    av.className = 'pg-msg-av';
    av.textContent = role === 'user' ? '👤' : '🤖';
    var bbl = document.createElement('div');
    bbl.className = 'pg-msg-bbl';
    // Siempre escapar HTML primero; luego aplicar markdown mínimo (bold, saltos)
    var safe = _pgEscHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    bbl.innerHTML = safe;
    div.appendChild(av);
    div.appendChild(bbl);
    wrap.appendChild(div);
    wrap.scrollTop = wrap.scrollHeight;
  }

  window._phdrSendMsg = async function () {
    var input = document.getElementById('pg-chat-input');
    var text  = input ? input.value.trim() : '';
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    var sendBtn = document.getElementById('pg-chat-send');
    if (sendBtn) sendBtn.disabled = true;
    _pgAppendMsg('user', text);
    _pgChatHistory.push({ role: 'user', parts: [{ text: text }] });
    // Recorta a los últimos 12 turnos: mantiene contexto sin crecer sin límite (evita chocar
    // el cap de 24KB del proxy /api/gemini en chats largos y baja el costo por request).
    if (_pgChatHistory.length > 12) _pgChatHistory = _pgChatHistory.slice(-12);
    var typing = document.getElementById('pg-typing');
    if (typing) typing.classList.add('visible');
    var msgs = document.getElementById('pg-chat-msgs');
    if (msgs) msgs.scrollTop = 9999;
    try {
      var res = await fetch(_pgGUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: _pgBuildPrompt() }] },
          contents: _pgChatHistory
        })
      });
      var data = await res.json();
      if (!res.ok) console.warn('[PRODIGY BOT] Error API:', res.status, data.error || data);
      if (typing) typing.classList.remove('visible');
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        var reply = data.candidates[0].content.parts[0].text;
        _pgChatHistory.push({ role: 'model', parts: [{ text: reply }] });
        _pgAppendMsg('bot', reply);
      } else if (data.error && data.error.includes && (data.error.includes('solicitudes') || data.error.includes('429'))) {
        _pgAppendMsg('bot', 'Muchas consultas seguidas — espera un momento e intenta de nuevo.');
      } else if (data.error && data.error.includes && data.error.includes('configurado')) {
        _pgAppendMsg('bot', 'El asistente está temporalmente fuera de línea. Escríbenos por <a href="https://wa.me/573212816716" target="_blank" rel="noopener noreferrer">WhatsApp +57 321 281 6716</a> — respondemos en minutos.');
      } else {
        var errDetail = data.error ? (' (' + String(data.error).slice(0,60) + ')') : '';
        console.warn('[PRODIGY BOT] Sin candidatos:', JSON.stringify(data));
        _pgAppendMsg('bot', 'No pude procesar tu consulta ahora mismo' + errDetail + '. Escríbenos por <a href="https://wa.me/573212816716" target="_blank" rel="noopener noreferrer">WhatsApp</a> y te respondemos enseguida.');
      }
    } catch (err) {
      console.warn('[PRODIGY BOT] catch:', err.message);
      if (typing) typing.classList.remove('visible');
      _pgAppendMsg('bot', 'Sin conexión ahora mismo. <a href="https://wa.me/573212816716" target="_blank" rel="noopener noreferrer">WhatsApp +57 321 281 6716</a> — respondemos en minutos.');
    }
    if (sendBtn) sendBtn.disabled = false;
    if (input) input.focus();
  };

  /* Auto-resize textarea del chat */
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'pg-chat-input') {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
    }
  });

  /* Mini-login topbar */
  var _SURL_PG = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
  var _SKEY_PG = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhyd3FmeXZneWFwYnd6a3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzczNDksImV4cCI6MjA5MDg1MzM0OX0.9CzmFDQYeQKcbtAZoT1_n_OuJ1qPVJu3jImd938T634';
  var _ADMIN_PG = 'jackalejandroc@gmail.com';

  /* ── DETECTAR SESIÓN ACTIVA ── */
  (function checkSessionPG(){
    var stored = localStorage.getItem('sb-zgihrwqfyvgyapbwzkvw-auth-token');
    if(!stored) return;
    var tok = '';
    try { tok = JSON.parse(stored)?.access_token||''; } catch(e){}
    if(!tok) return;
    fetch(_SURL_PG+'/auth/v1/user',{headers:{'apikey':_SKEY_PG,'Authorization':'Bearer '+tok}})
      .then(function(r){return r.ok?r.json():null;})
      .then(function(u){
        if(!u||!u.email) return;
        var tb = document.getElementById('nav-topbar');
        if(!tb) return;
        var _langSesion = tb.querySelector('.pheader-lang');   // el selector de idioma se queda también con sesión abierta
        var isAdmin = u.email===_ADMIN_PG || u.email==='labdentalprodigy@gmail.com';
        var panelUrl = isAdmin ? '/app/panel-interno-operaciones' : '/app/client-panel';
        tb.innerHTML =
          '<div style="display:flex;align-items:center;gap:12px;padding:0 16px;height:100%">'+
            '<span style="font-size:.75rem;color:#94a3b8"><i class="fas fa-user-circle" style="color:#D4AF37;margin-right:5px"></i>'+(isAdmin?'Admin':'Dr.')+' · '+_pgEscHtml(u.email.split('@')[0])+'</span>'+
            '<a href="'+panelUrl+'" style="background:rgba(212,175,55,.15);border:1px solid rgba(212,175,55,.3);color:#D4AF37;padding:5px 14px;border-radius:6px;font-size:.72rem;font-weight:800;text-decoration:none"><i class="fas fa-th-large" style="margin-right:4px"></i>Mi Panel</a>'+
            '<button type="button" onclick="_phdrLogoutPG()" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#94a3b8;padding:5px 12px;border-radius:6px;font-size:.72rem;font-weight:700;cursor:pointer"><i class="fas fa-sign-out-alt" style="margin-right:4px"></i>Salir</button>'+
          '</div>';
        if (_langSesion) { tb.firstChild.appendChild(_langSesion); _langSesion.style.marginLeft = '4px'; if (window._phdrMarcarIdioma) window._phdrMarcarIdioma(); }
        if (window._phdrTraducir) window._phdrTraducir();
      }).catch(function(){});
  })();

  window._phdrLogoutPG = function(){
    var stored = localStorage.getItem('sb-zgihrwqfyvgyapbwzkvw-auth-token');
    var tok = '';
    try { tok = JSON.parse(stored)?.access_token||''; } catch(e){}
    localStorage.removeItem('sb-zgihrwqfyvgyapbwzkvw-auth-token');
    // Revocar el refresh token server-side — sin esto, un JWT copiado antes
    // del logout seguía siendo válido hasta su expiración natural (~1h).
    var done = function(){ window.location.reload(); };
    if (tok) {
      fetch(_SURL_PG+'/auth/v1/logout',{method:'POST',headers:{'apikey':_SKEY_PG,'Authorization':'Bearer '+tok}})
        .then(done).catch(done);
    } else {
      done();
    }
  };

  window._phdrLogin = function (e) {
    e.preventDefault();
    var email = document.getElementById('tb-email').value.trim();
    var pass  = document.getElementById('tb-pass').value;
    if (!email || !pass) { window.location.href='/app/login.html'; return; }
    var btn = document.querySelector('.tb-acceso');
    if(btn){btn.textContent='...';btn.disabled=true;}
    fetch(_SURL_PG+'/auth/v1/token?grant_type=password',{
      method:'POST',
      headers:{'apikey':_SKEY_PG,'Content-Type':'application/json'},
      body:JSON.stringify({email:email,password:pass})
    }).then(function(r){return r.json();}).then(function(d){
      if(btn){btn.textContent='ACCESO';btn.disabled=false;}
      if(d.access_token){
        localStorage.setItem('sb-zgihrwqfyvgyapbwzkvw-auth-token',JSON.stringify({
          access_token:d.access_token, refresh_token:d.refresh_token||'', user:d.user
        }));
        var isAdmin = d.user&&(d.user.email===_ADMIN_PG||d.user.email==='labdentalprodigy@gmail.com');
        window.location.href = isAdmin ? '/app/panel-interno-operaciones' : '/app/client-panel';
      } else {
        sessionStorage.setItem('tb_email', email);
        sessionStorage.setItem('tb_pass', pass);
        window.location.href = '/app/login.html?email='+encodeURIComponent(email);
      }
    }).catch(function(){
      if(btn){btn.textContent='ACCESO';btn.disabled=false;}
      sessionStorage.setItem('tb_email', email);
      window.location.href = '/app/login.html';
    });
  };

  /* Cargar i18n.js en todas las páginas si aún no está */
  if (!window.i18n) {
    var _i18nS = document.createElement('script');
    _i18nS.src = '/js/i18n.js?v=20261008';
    _i18nS.defer = true;
    document.head.appendChild(_i18nS);
  }

  /* ── IDIOMA DEL MENÚ Y DEL PIE (EN / PT) ──
     i18n.js solo traduce lo marcado con data-i18n en cada página: el menú, la barra de acceso, el botón
     «Haz tu pedido» y el pie (generados aquí y en footer.js) se quedaban en español al elegir EN o PT.
     Diccionario 'español': [inglés, portugués]. Se aplica al cargar y cada vez que cambia <html lang>. */
  var _MARCAS = 'Exocad®, 3Shape®, Ivoclar®, Vita®, Amann Girrbach®, Dentsply Sirona®, Renfert®, Shining 3D®, NextDent®, SprintRay®, Anycubic®, Phrozen®, Creality®, Straumann®, Nobel Biocare®, BioHorizons®, XTCERA®, VHF®, CoDiagnostiX® ';
  var _TXT = {
    'Correo electrónico': ['Email', 'E-mail'], 'Contraseña': ['Password', 'Senha'],
    'ACCESO': ['LOG IN', 'ENTRAR'], 'REGISTRO': ['SIGN UP', 'CADASTRO'],
    'SERVICIOS': ['SERVICES', 'SERVIÇOS'], 'PORTAFOLIO': ['PORTFOLIO', 'PORTFÓLIO'],
    'ENVÍA TU ESCANEO': ['SEND YOUR SCAN', 'ENVIE SEU ESCANEAMENTO'], 'SIGUE TU CASO': ['TRACK YOUR CASE', 'ACOMPANHE SEU CASO'],
    'SOPORTE': ['SUPPORT', 'SUPORTE'], 'NOSOTROS': ['ABOUT US', 'SOBRE NÓS'], 'HAZ TU PEDIDO': ['PLACE AN ORDER', 'FAÇA SEU PEDIDO'],
    'Mi Panel': ['My dashboard', 'Meu painel'], 'Salir': ['Sign out', 'Sair'],
    'DISEÑO CAD REMOTO': ['REMOTE CAD DESIGN', 'DESIGN CAD REMOTO'], '🌍 Internacional · Exocad · entrega 24h': ['🌍 International · Exocad · 24h delivery', '🌍 Internacional · Exocad · entrega 24h'],
    'COTIZADOR DISEÑO': ['DESIGN QUOTE', 'ORÇAMENTO DE DESIGN'], 'Cotiza tu caso en 1 minuto': ['Quote your case in 1 minute', 'Orce seu caso em 1 minuto'],
    'DISEÑO CAD — INFO': ['CAD DESIGN — INFO', 'DESIGN CAD — INFO'], 'Exocad · 3Shape · Archivo STL': ['Exocad · 3Shape · STL file', 'Exocad · 3Shape · Arquivo STL'],
    'FRESADO & IMPRESIÓN': ['MILLING & 3D PRINTING', 'FRESAGEM & IMPRESSÃO'], 'Zirconio · Disilicato · Resina': ['Zirconia · Lithium disilicate · Resin', 'Zircônia · Dissilicato · Resina'],
    'ESCANEOS A DOMICILIO': ['ON-SITE SCANNING', 'ESCANEAMENTO A DOMICÍLIO'], 'Norte Bogotá · 2 h hábiles': ['North Bogotá · 2 business hours', 'Norte de Bogotá · 2 h úteis'],
    'CIRUGÍA GUIADA': ['GUIDED SURGERY', 'CIRURGIA GUIADA'], '🎯 Planificación digital · guía impresa · desde 4h': ['🎯 Digital planning · printed guide · from 4h', '🎯 Planejamento digital · guia impresso · a partir de 4h'],
    'Centro de Soporte': ['Support Center', 'Central de Suporte'], 'FAQs · guías · materiales': ['FAQs · guides · materials', 'FAQs · guias · materiais'],
    'Solución IA': ['AI Assistant', 'Assistente IA'], 'Gemini 2.0 · respuesta 24/7': ['Gemini · answers 24/7', 'Gemini · respostas 24/7'],
    'Diseño CAD': ['CAD Design', 'Design CAD'], 'Exocad · 3Shape · archivo STL': ['Exocad · 3Shape · STL file', 'Exocad · 3Shape · arquivo STL'],
    'Fabricación CAM': ['CAM Manufacturing', 'Fabricação CAM'], 'Zirconia · Disilicato · PMMA': ['Zirconia · Disilicate · PMMA', 'Zircônia · Dissilicato · PMMA'],
    'Flujo Lab Full': ['Full Lab Workflow', 'Fluxo Lab Completo'], 'Modelo → diseño → acabado final': ['Model → design → final finish', 'Modelo → design → acabamento final'],
    'Escaneos a Domicilio': ['On-site Scanning', 'Escaneamento a Domicílio'], 'Norte Bogotá · 2h hábiles': ['North Bogotá · 2 business hours', 'Norte de Bogotá · 2h úteis'],
    'DISEÑO CAD': ['CAD DESIGN', 'DESIGN CAD'], 'HABLAR CON IA': ['TALK TO AI', 'FALAR COM IA'], 'CONTACTAR': ['CONTACT', 'CONTATO'],
    'INGRESAR': ['LOG IN', 'ENTRAR'], 'MODO CLARO': ['LIGHT MODE', 'MODO CLARO'], 'MODO OSCURO': ['DARK MODE', 'MODO ESCURO'],
    '¿Qué necesitas?': ['What do you need?', 'Do que você precisa?'], 'Completo → entrega': ['Complete → delivery', 'Completo → entrega'],
    'Escáner': ['Scanner', 'Escâner'], 'Norte Bogotá': ['North Bogotá', 'Norte de Bogotá'],
    'Especialistas en diseño CAD avanzado y manufactura de alta precisión para clínicas y laboratorios dentales de Colombia y México.': ['Specialists in advanced CAD design and high-precision manufacturing for dental clinics and labs in Colombia and Mexico.', 'Especialistas em design CAD avançado e manufatura de alta precisão para clínicas e laboratórios odontológicos da Colômbia e do México.'],
    '🌎 Hecho en Colombia para el mundo': ['🌎 Made in Colombia for the world', '🌎 Feito na Colômbia para o mundo'],
    'Con tecnología 🇩🇪 Alemana · 🇨🇳 China': ['With 🇩🇪 German · 🇨🇳 Chinese technology', 'Com tecnologia 🇩🇪 Alemã · 🇨🇳 Chinesa'],
    'y manos expertas de 🇨🇴 Colombia · 🇲🇽 México': ['and expert hands from 🇨🇴 Colombia · 🇲🇽 Mexico', 'e mãos especialistas da 🇨🇴 Colômbia · 🇲🇽 México'],
    'Sede Central: Bogotá, Colombia': ['Headquarters: Bogotá, Colombia', 'Sede: Bogotá, Colômbia'],
    'Servicios': ['Services', 'Serviços'], 'Diseño CAD — Exocad · 3Shape': ['CAD Design — Exocad · 3Shape', 'Design CAD — Exocad · 3Shape'],
    '🌍 Diseño CAD Remoto': ['🌍 Remote CAD Design', '🌍 Design CAD Remoto'], 'Fresado & Manufactura CAM': ['Milling & CAM Manufacturing', 'Fresagem & Manufatura CAM'],
    'Catálogo de Materiales': ['Materials Catalog', 'Catálogo de Materiais'], 'Cotizador de Precios': ['Price Quote', 'Orçamento de Preços'],
    'Portafolio y Recursos': ['Portfolio & Resources', 'Portfólio e Recursos'], 'Portafolio de Casos': ['Case Portfolio', 'Portfólio de Casos'],
    'Guía Técnica de Materiales': ['Materials Technical Guide', 'Guia Técnico de Materiais'], 'Envía tu Escaneo': ['Send your Scan', 'Envie seu Escaneamento'],
    'Seguimiento en Vivo': ['Live Case Tracking', 'Acompanhamento ao Vivo'], 'Escaneo a domicilio & Fotogrametría': ['On-site Scanning & Photogrammetry', 'Escaneamento a domicílio & Fotogrametria'],
    'Preguntas Frecuentes': ['FAQ', 'Perguntas Frequentes'], 'Impresión 3D Dental': ['Dental 3D Printing', 'Impressão 3D Odontológica'],
    'Alineadores Invisibles CAD': ['CAD Clear Aligners', 'Alinhadores Invisíveis CAD'], 'Empresa': ['Company', 'Empresa'],
    'Nosotros · Equipo': ['About · Team', 'Sobre nós · Equipe'], 'Contacto': ['Contact', 'Contato'],
    'Software para Laboratorios': ['Software for Labs', 'Software para Laboratórios'], 'Instalar App Móvil': ['Install Mobile App', 'Instalar App'],
    '🎁 Programa Referidos': ['🎁 Referral Program', '🎁 Programa de Indicação'], 'Términos y Privacidad': ['Terms & Privacy', 'Termos e Privacidade'],
    'Portal Profesional': ['Professional Portal', 'Portal Profissional'], 'Acceso Doctores': ['Doctor Login', 'Acesso Dentistas'],
    'Soporte Técnico': ['Technical Support', 'Suporte Técnico'], 'Déjanos tu reseña en Google': ['Leave us a Google review', 'Deixe sua avaliação no Google'],
    '© 2026 PRODIGY Digital Dentistry · Bogotá, Colombia · Todos los derechos reservados ·': ['© 2026 PRODIGY Digital Dentistry · Bogotá, Colombia · All rights reserved ·', '© 2026 PRODIGY Digital Dentistry · Bogotá, Colômbia · Todos os direitos reservados ·'],
    'Términos': ['Terms', 'Termos'], 'Privacidad': ['Privacy', 'Privacidade'],
    // aviso de cookies (footer.js)
    'Ayúdanos a mejorar': ['Help us improve', 'Ajude-nos a melhorar'],
    'Analytics anónimo para ver qué te es útil.': ['Anonymous analytics to see what helps you.', 'Análise anônima para ver o que é útil para você.'],
    'Sin anuncios.': ['No ads.', 'Sem anúncios.'], 'Ver política →': ['See policy →', 'Ver política →'],
    '✓ Sí, mejorar la experiencia': ['✓ Yes, improve my experience', '✓ Sim, melhorar a experiência'], 'No por ahora': ['Not now', 'Agora não']
  };
  _TXT['Las marcas registradas ' + _MARCAS + 'y Blender® son propiedad de sus respectivos dueños y se mencionan exclusivamente con fines informativos sobre la compatibilidad de nuestros flujos de trabajo.'] = [
    'The registered trademarks ' + _MARCAS + 'and Blender® belong to their respective owners and are mentioned for information only, regarding the compatibility of our workflows.',
    'As marcas registradas ' + _MARCAS + 'e Blender® pertencem aos seus respectivos donos e são mencionadas apenas para informar sobre a compatibilidade dos nossos fluxos de trabalho.'];
  function _phdrLang() { return window._phdrIdiomaPagina ? window._phdrIdiomaPagina() : 'es'; }
  window._phdrLang = _phdrLang;
  var _txtOrig = typeof WeakMap === 'function' ? new WeakMap() : null;
  function _phdrTraducir() {
    if (!_txtOrig) return;
    var l = _phdrLang(), ix = l === 'en' ? 0 : l === 'pt' ? 1 : -1;
    ['nav-topbar', 'pheader-v2', 'pnav2-mob', 'pcta-pedido', 'pfoot-root', 'pfoot-cookie-banner'].forEach(function (id) {
      var raiz = document.getElementById(id), w, n, r, k, t, v;
      if (!raiz) return;
      w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
      while ((n = w.nextNode())) {
        r = _txtOrig.get(n);
        if (!r || n.nodeValue !== r.v) r = { es: n.nodeValue }; // texto nuevo o cambiado por otro código = original en español
        k = r.es.trim(); t = _TXT[k];
        v = (t && ix >= 0) ? r.es.replace(k, t[ix]) : r.es;
        if (n.nodeValue !== v) n.nodeValue = v;
        r.v = v; _txtOrig.set(n, r);
      }
      raiz.querySelectorAll('input[placeholder]').forEach(function (inp) {
        var es = inp.getAttribute('data-ph-es') || inp.placeholder, tt = _TXT[es];
        inp.setAttribute('data-ph-es', es);
        inp.placeholder = (tt && ix >= 0) ? tt[ix] : es;
      });
    });
  }
  window._phdrTraducir = _phdrTraducir;
  if (typeof MutationObserver === 'function') {
    new MutationObserver(_phdrTraducir).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  _phdrTraducir();
  document.addEventListener('DOMContentLoaded', _phdrTraducir);

  /* ── THEME TOGGLE ──
     Modo claro = el diseño oscuro con los colores invertidos, en UNA sola regla para toda la web.
     Antes cada página tenía su propio «light-mode» a medias (variables sueltas + estilos fijos oscuros)
     y en claro quedaban textos sin contraste. Fotos, videos y mapas se vuelven a invertir para verse normales.
     Estado único: sessionStorage 'pg_theme' → la web SIEMPRE abre en oscuro y el claro dura solo la visita (decisión
     7-oct-2026: «deben cargarse en oscuro a menos que decidan cambiarle»). El «light-mode» viejo de cada página se neutraliza. */
  var _CLARO_CSS = 'html.tema-claro{filter:invert(1) hue-rotate(180deg);background:#050505}'
    // Se vuelven a invertir (se ven con sus colores reales): fotos, videos, mapas y escenas 3D
    // (el robot de Spline y los visores three.js — su <canvas> lleva data-engine). Las partículas 2D sí se invierten.
    + 'html.tema-claro img,html.tema-claro video,html.tema-claro iframe,html.tema-claro [style*="url("],'
    + 'html.tema-claro spline-viewer,html.tema-claro model-viewer,html.tema-claro canvas[data-engine],html.tema-claro [data-sin-invertir]{filter:invert(1) hue-rotate(180deg)}'
    + 'html.tema-claro [style*="url("] img{filter:none}'
    + 'html.tema-claro spline-viewer{opacity:.38}'   // el robot de la portada detrás del título: suave para que el texto se lea
    + '@media print{html.tema-claro{filter:none}}';
  function _claroCss() {
    if (document.getElementById('tema-claro-css')) return;
    var s = document.createElement('style'); s.id = 'tema-claro-css'; s.textContent = _CLARO_CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  function _phdrIconos(claro) {
    var btn  = document.getElementById('pnav2-theme-btn');
    var mob  = document.getElementById('pnav2-theme-mob');
    var ico  = document.getElementById('pnav2-theme-ico');
    if (btn) btn.textContent = claro ? '☀️' : '🌙';
    if (mob) mob.style.color = claro ? '#b45309' : '#94a3b8';
    if (ico) { ico.className = claro ? 'fas fa-sun' : 'fas fa-moon'; ico.parentElement.lastChild.textContent = claro ? 'MODO OSCURO' : 'MODO CLARO'; }
    if (window._phdrTraducir) window._phdrTraducir(); // en EN/PT, el texto recién puesto se traduce
  }
  /* Contraste en modo claro: al invertir, los textos de acento (magenta, neón, cian, dorado) quedan en tonos
     pastel sobre fondo claro (2–4:1). Cada texto que quede bajo 4.5:1 (3:1 si es grande) se aclara ANTES de la
     inversión —al invertir queda más oscuro, mismo tono— hasta pasar. Solo en modo claro; al volver a oscuro se
     restaura el color original. Se salta lo dudoso (fondos con imagen o degradado, texto con degradado). */
  var _HR = [[-0.574, 1.43, 0.144], [0.426, 0.43, 0.144], [0.426, 1.43, -0.856]]; // hue-rotate(180deg)
  function _visto(c) { // color que ve el ojo con invert(1) hue-rotate(180deg)
    return _HR.map(function (f) { return Math.min(1, Math.max(0, f[0] * (1 - c[0]) + f[1] * (1 - c[1]) + f[2] * (1 - c[2]))); });
  }
  function _lum(c) {
    var k = [0.2126, 0.7152, 0.0722], s = 0;
    for (var i = 0; i < 3; i++) s += k[i] * (c[i] <= 0.03928 ? c[i] / 12.92 : Math.pow((c[i] + 0.055) / 1.055, 2.4));
    return s;
  }
  function _rgba(s) { var m = String(s).match(/[\d.]+/g); return m && m.length >= 3 ? { c: [m[0] / 255, m[1] / 255, m[2] / 255], a: m[3] === undefined ? 1 : +m[3] } : null; }
  function _entorno(el) { // fondos posibles (antes de invertir: uno por color de cada degradado) y opacidad; null si hay imagen
    var capas = [], op = 1, e, cs, b, g;
    for (e = el; e && e.nodeType === 1; e = e.parentElement) {
      cs = getComputedStyle(e); op *= +cs.opacity;
      if (cs.backgroundImage !== 'none') {
        if (/url\(/.test(cs.backgroundImage)) return null;
        g = (cs.backgroundImage.match(/rgba?\([^)]*\)/g) || []).map(_rgba).filter(Boolean);
        if (g.length) capas.push(g.slice(0, 4));
      }
      b = _rgba(cs.backgroundColor);
      if (b && b.a > 0) capas.push([b]);
      if (b && b.a >= 0.99) break;
    }
    var fondos = [[0.02, 0.02, 0.02]];
    for (var i = capas.length - 1; i >= 0; i--) {
      var sig = [];
      fondos.forEach(function (f) { capas[i].forEach(function (l) { sig.push(f.map(function (v, k) { return l.c[k] * l.a + v * (1 - l.a); })); }); });
      fondos = sig.slice(0, 16);
    }
    return { fondos: fondos, op: op };
  }
  function _contrasteClaro() {
    if (!document.body || !document.documentElement.classList.contains('tema-claro')) return;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n, vistos = new Set();
    while ((n = w.nextNode())) {
      var el = n.parentElement;
      if (!el || vistos.has(el) || !n.textContent.trim()) continue;
      vistos.add(el);
      if (el.hasAttribute('data-claro-color') || el.closest('svg,script,style,[data-sin-invertir],[style*="url("]')) continue;
      var cs = getComputedStyle(el), t = _rgba(cs.color), fill = _rgba(cs.webkitTextFillColor);
      if (!t || t.a < 0.5 || (fill && fill.a === 0)) continue;
      var en = _entorno(el);
      if (!en || en.op < 0.5) continue;
      var fs = parseFloat(cs.fontSize), meta = (fs >= 24 || (fs >= 18.66 && parseInt(cs.fontWeight, 10) >= 700)) ? 3 : 4.5;
      var fvs = en.fondos.map(_visto), lfs = fvs.map(_lum);
      var razon = function (c) { // el peor caso entre los colores del fondo
        var vc = _visto(c);
        return Math.min.apply(null, fvs.map(function (fv, j) {
          var lt = _lum(vc.map(function (x, k) { return x * en.op + fv[k] * (1 - en.op); }));
          return (Math.max(lt, lfs[j]) + 0.05) / (Math.min(lt, lfs[j]) + 0.05);
        }));
      };
      if (razon(t.c) >= meta) continue;
      var lf = lfs.reduce(function (a, v) { return a + v; }, 0) / lfs.length;
      var hacia = lf > 0.4 ? 1 : 0; // fondo visto claro → letra vista más oscura → color de origen más claro
      for (var k = 0.1; k <= 1.001; k += 0.1) {
        var c = t.c.map(function (v) { return v + (hacia - v) * k; });
        if (razon(c) >= meta) {
          el.setAttribute('data-claro-color', (el.style.getPropertyValue('color') || '') + '|' + el.style.getPropertyPriority('color'));
          el.style.setProperty('color', 'rgb(' + c.map(function (v) { return Math.round(v * 255); }).join(',') + ')', 'important');
          break;
        }
      }
    }
  }
  function _contrasteRestaurar() {
    document.querySelectorAll('[data-claro-color]').forEach(function (el) {
      var p = el.getAttribute('data-claro-color').split('|');
      if (p[0]) el.style.setProperty('color', p[0], p[1]); else el.style.removeProperty('color');
      el.removeAttribute('data-claro-color');
    });
  }
  var _ccObs = null, _ccT = 0;
  function _contrasteProgramar() {
    clearTimeout(_ccT);
    _ccT = setTimeout(function () { (window.requestIdleCallback || setTimeout)(_contrasteClaro); }, 300);
  }
  function _contrasteVigilar(claro) {
    if (!claro) { if (_ccObs) { _ccObs.disconnect(); _ccObs = null; } _contrasteRestaurar(); return; }
    if (!document.body) { document.addEventListener('DOMContentLoaded', function () { _contrasteVigilar(document.documentElement.classList.contains('tema-claro')); }); return; }
    _contrasteProgramar();
    if (!_ccObs) { _ccObs = new MutationObserver(_contrasteProgramar); _ccObs.observe(document.body, { childList: true, subtree: true }); }
  }
  function _phdrApplyTheme(t) {
    var claro = t === 'light';
    _claroCss();
    document.documentElement.classList.toggle('tema-claro', claro);
    if (document.body) document.body.classList.remove('light-mode');
    _phdrIconos(claro);
    _contrasteVigilar(claro);
    try { sessionStorage.setItem('pg_theme', claro ? 'light' : 'dark'); localStorage.removeItem('pg_theme'); localStorage.setItem('theme', 'dark'); } catch (e) {}
  }

  window._phdrToggleTheme = function() {
    _phdrApplyTheme(document.documentElement.classList.contains('tema-claro') ? 'dark' : 'light');
  };

  /* Restaurar preferencia guardada (también la clave vieja 'theme' de algunas páginas) */
  (function(){
    var claro = false;
    // Antes se guardaba para siempre (localStorage) y quien probó el claro una vez lo veía en todas las visitas: se borra
    try { claro = sessionStorage.getItem('pg_theme') === 'light'; localStorage.removeItem('pg_theme'); } catch (e) {}
    if (claro) _phdrApplyTheme('light'); else { try { localStorage.setItem('theme', 'dark'); } catch (e) {} }
    document.addEventListener('DOMContentLoaded', function(){ _phdrIconos(document.documentElement.classList.contains('tema-claro')); });
    // Botones viejos de algunas páginas que ponen «light-mode» en el body: se traducen a este modo único
    function vigilar() {
      if (!document.body) return;
      new MutationObserver(function(){
        if (document.body.classList.contains('light-mode')) {
          document.body.classList.remove('light-mode');
          _phdrApplyTheme(document.documentElement.classList.contains('tema-claro') ? 'dark' : 'light');
        }
      }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    if (document.body) vigilar(); else document.addEventListener('DOMContentLoaded', vigilar);
  })();

  // Marcar íconos FA decorativos como aria-hidden
  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('i.fas,i.fab,i.far,i.fal,i.fad').forEach(function(ic){
      if (!ic.hasAttribute('aria-hidden') && !ic.hasAttribute('aria-label') && !ic.hasAttribute('role')){
        ic.setAttribute('aria-hidden','true');
      }
    });
  });

  /* ── MODAL MANAGER GLOBAL — role=dialog + focus trap ──────────────────
     Detecta cuando cualquier elemento con clase .modal, .modal-overlay, o
     id que empieza con "modal-" se vuelve visible y:
     1. Agrega role=dialog + aria-modal=true si no los tiene
     2. Mueve el foco al primer elemento interactivo dentro
     3. Atrapa el Tab dentro del modal (focus trap)
     4. Restaura el foco al elemento que lo tenía al cerrar
  ─────────────────────────────────────────────────────────────────────── */
  (function(){
    var _lastFocus = null;
    var _currentModal = null;

    var FOCUSABLE = [
      'a[href]','button:not([disabled])','input:not([disabled])',
      'select:not([disabled])','textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    function _isVisible(el) {
      if (!el) return false;
      var s = window.getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
    }

    function _isModal(el) {
      if (!el || el.nodeType !== 1) return false;
      var cls = el.className || '';
      var id  = el.id || '';
      return (
        cls.indexOf('modal-overlay') !== -1 ||
        cls.indexOf('modal-ov') !== -1 ||
        (cls.indexOf('modal') !== -1 && cls.indexOf('active') !== -1) ||
        (id.indexOf('modal-') === 0 && _isVisible(el))
      );
    }

    function _applyDialog(el) {
      if (!el.hasAttribute('role')) el.setAttribute('role','dialog');
      if (!el.hasAttribute('aria-modal')) el.setAttribute('aria-modal','true');
      // Buscar título dentro del modal
      if (!el.hasAttribute('aria-labelledby') && !el.hasAttribute('aria-label')) {
        var h = el.querySelector('h1,h2,h3,[id*="title"],[id*="titulo"]');
        if (h) {
          if (!h.id) h.id = 'pgm-title-' + Math.random().toString(36).slice(2,7);
          el.setAttribute('aria-labelledby', h.id);
        } else {
          el.setAttribute('aria-label','Diálogo');
        }
      }
    }

    function _focusFirst(modal) {
      var items = Array.from(modal.querySelectorAll(FOCUSABLE)).filter(_isVisible);
      if (items.length) items[0].focus();
    }

    function _trapFocus(e) {
      if (!_currentModal || e.key !== 'Tab') return;
      var items = Array.from(_currentModal.querySelectorAll(FOCUSABLE)).filter(_isVisible);
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    function _onOpen(modal) {
      _applyDialog(modal);
      _lastFocus = document.activeElement;
      _currentModal = modal;
      setTimeout(function(){ _focusFirst(modal); }, 50);
      document.addEventListener('keydown', _trapFocus);
    }

    function _onClose() {
      _currentModal = null;
      document.removeEventListener('keydown', _trapFocus);
      if (_lastFocus && _lastFocus.focus) {
        try { _lastFocus.focus(); } catch(_) {}
      }
    }

    // Observar cambios de clase y estilo en el DOM
    var obs = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        var el = m.target;
        if (_isModal(el)) {
          if (_isVisible(el)) {
            _onOpen(el);
          } else if (_currentModal === el) {
            _onClose();
          }
        }
      });
    });

    document.addEventListener('DOMContentLoaded', function(){
      obs.observe(document.body, {
        attributes: true,
        attributeFilter: ['class','style'],
        subtree: true
      });
    });
  })();

})();
