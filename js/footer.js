/**
 * PRODIGY — Footer Maestro Compartido
 * Inyecta el footer al final de <body> en cualquier página pública.
 * Uso: <script src="js/footer.js"></script> antes de </body>
 */
(function () {
  'use strict';
  if (document.getElementById('pfoot-root')) return;

  /* ── CSS ─────────────────────────────────────────────────── */
  var css = [
    '#pfoot-root{',
      'background:#050505;',
      'border-top:1px solid rgba(212,175,55,.2);',
      'padding:64px 0 28px;',
      'font-family:inherit;',
    '}',
    '#pfoot-root .pfoot-grid{',
      'display:grid;',
      'grid-template-columns:1.4fr 1fr 1fr 1fr 1fr;',
      'gap:40px;',
      'max-width:1260px;margin:0 auto 48px;padding:0 28px;',
    '}',
    '#pfoot-root .pfoot-col h4{',
      'color:#D4AF37;font-size:12px;font-weight:800;',
      'text-transform:uppercase;letter-spacing:1.5px;',
      'margin:0 0 18px;',
      'padding-bottom:8px;',
      'border-bottom:1px solid rgba(212,175,55,.25);',
      'display:inline-block;',
    '}',
    '#pfoot-root .pfoot-col ul{list-style:none;padding:0;margin:0;}',
    '#pfoot-root .pfoot-col li{padding:5px 0;color:#94a3b8;font-size:13.5px;}',
    '#pfoot-root .pfoot-col a{',
      'color:#94a3b8;text-decoration:none;',
      'transition:color .25s,padding-left .2s;',
    '}',
    '#pfoot-root .pfoot-col ul li a:hover{color:#D4AF37;padding-left:4px;}',
    '#pfoot-root .pfoot-col a:not(ul li a):hover{color:#D4AF37;}',
    /* Brand col */
    '#pfoot-root .pfoot-brand .pfoot-logo{',
      'font-size:22px;font-weight:900;letter-spacing:3px;',
      'color:#D4AF37;margin:0 0 4px;',
    '}',
    '#pfoot-root .pfoot-brand .pfoot-tagline{',
      'font-size:10px;text-transform:uppercase;letter-spacing:3px;',
      'color:#94a3b8;margin:0 0 14px;',
    '}',
    '#pfoot-root .pfoot-brand .pfoot-desc{',
      'color:#94a3b8;font-size:12.5px;line-height:1.65;margin:0 0 16px;',
    '}',
    '#pfoot-root .pfoot-geo{',
      'display:inline-flex;align-items:center;gap:7px;',
      'font-size:12px;color:#94a3b8;',
    '}',
    '#pfoot-root .pfoot-geo-dot{',
      'width:7px;height:7px;border-radius:50%;',
      'background:#00FF41;',
      'box-shadow:0 0 6px rgba(0,255,65,.7);',
      'flex-shrink:0;',
    '}',
    '#pfoot-root .pfoot-social{display:flex;gap:10px;margin-top:16px;}',
    '#pfoot-root .pfoot-social a{',
      'display:inline-flex;align-items:center;justify-content:center;',
      'width:36px;height:36px;border-radius:50%;',
      'background:rgba(255,255,255,.10);color:#e2e8f0;',
      'font-size:16px;text-decoration:none;',
      'transition:background .25s,color .25s;',
    '}',
    '#pfoot-root .pfoot-social a:hover{background:rgba(212,175,55,.2);color:#D4AF37;}',
    /* Portal CTA button */
    '#pfoot-root .pfoot-cta{',
      'display:block;',
      'border:1px solid #D4AF37;',
      'color:#D4AF37;',
      'padding:11px 16px;',
      'text-align:center;',
      'text-decoration:none;',
      'border-radius:4px;',
      'margin-bottom:18px;',
      'font-size:13px;font-weight:700;letter-spacing:.5px;',
      'transition:background .3s,color .3s;',
    '}',
    '#pfoot-root .pfoot-cta:hover{background:#D4AF37;color:#000;padding-left:16px;}',
    /* Bottom bar */
    '#pfoot-root .pfoot-copy{',
      'text-align:center;',
      'border-top:1px solid rgba(255,255,255,.06);',
      'max-width:1260px;margin:0 auto;padding:22px 28px 0;',
      'color:#94a3b8;font-size:12px;',
    '}',
    '#pfoot-root .pfoot-copy a{color:#94a3b8;text-decoration:none;transition:color .2s;}',
    '#pfoot-root .pfoot-copy a:hover{color:#D4AF37;}',
    /* Responsive */
    '@media(max-width:1100px){',
      '#pfoot-root .pfoot-grid{grid-template-columns:1fr 1fr 1fr;}',
    '}',
    '@media(max-width:960px){',
      '#pfoot-root .pfoot-grid{grid-template-columns:1fr 1fr;}',
    '}',
    '@media(max-width:520px){',
      '#pfoot-root .pfoot-grid{grid-template-columns:1fr;gap:28px;}',
      '#pfoot-root{padding:40px 0 16px;}',
    '}'
  ].join('');

  var st = document.createElement('style');
  st.id = 'pfoot-css';
  st.textContent = css;
  document.head.appendChild(st);

  /* ── HTML ────────────────────────────────────────────────── */
  var footer = document.createElement('footer');
  footer.id = 'pfoot-root';

  footer.innerHTML =
    '<div class="pfoot-grid">' +

      /* Col 1 — Brand */
      '<div class="pfoot-col pfoot-brand">' +
        '<div class="pfoot-logo">PRODIGY</div>' +
        '<div class="pfoot-tagline">Digital Dental Excellence</div>' +
        '<p class="pfoot-desc">Especialistas en diseño CAD avanzado y manufactura de alta precisión para clínicas y laboratorios dentales de Colombia y México.</p>' +
        '<div style="font-size:.72rem;font-style:italic;color:#94a3b8;margin:6px 0 10px;line-height:1.5;">🌎 Made in Colombia for the world<br>Con tecnología 🇩🇪 Alemana · 🇨🇳 China<br>y manos expertas de 🇨🇴 Colombia · 🇲🇽 México</div>' +
        '<div class="pfoot-geo"><span class="pfoot-geo-dot"></span>Sede Central: Bogotá, Colombia</div>' +
        '<div class="pfoot-social">' +
          '<a href="https://wa.me/573212816716" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp PRODIGY Lab">' +
            '<i class="fab fa-whatsapp"></i>' +
          '</a>' +
          '<a href="https://www.instagram.com/labdentalprodigy/" target="_blank" rel="noopener noreferrer" title="Instagram @labdentalprodigy" aria-label="Instagram @labdentalprodigy">' +
            '<i class="fab fa-instagram"></i>' +
          '</a>' +
          '<a href="https://www.facebook.com/profile.php?id=61575383924264" target="_blank" rel="noopener noreferrer" title="Facebook ProDigy Lab Dental" aria-label="Facebook ProDigy Lab Dental">' +
            '<i class="fab fa-facebook"></i>' +
          '</a>' +
          '<a href="https://www.tiktok.com/@prodigylabdental" target="_blank" rel="noopener noreferrer" title="TikTok @prodigylabdental" aria-label="TikTok @prodigylabdental">' +
            '<i class="fab fa-tiktok"></i>' +
          '</a>' +
        '</div>' +
      '</div>' +

      /* Col 2 — Servicios */
      '<div class="pfoot-col">' +
        '<h4>Servicios</h4>' +
        '<ul>' +
          '<li><a href="diseno-cad">Diseño CAD — Exocad · 3Shape</a></li>' +
          '<li><a href="diseno-remoto">🌍 Diseño CAD Remoto</a></li>' +
          '<li><a href="fresado-cam">Fresado & Manufactura CAM</a></li>' +
          '<li><a href="escaner-domicilio">Escaneos a Domicilio</a></li>' +
          '<li><a href="catalogo">Catálogo de Materiales</a></li>' +
          '<li><a href="calculadora">Cotizador de Precios</a></li>' +
        '</ul>' +
      '</div>' +

      /* Col 3 — Portafolio y Recursos */
      '<div class="pfoot-col">' +
        '<h4>Portafolio y Recursos</h4>' +
        '<ul>' +
          '<li><a href="portafolio">Portafolio de Casos</a></li>' +
          '<li><a href="journal">PRODIGY Journal — Blog</a></li>' +
          '<li><a href="guia-tecnica">Guía Técnica de Materiales</a></li>' +
          '<li><a href="envia-tu-scanner">Envía tu Escaneo</a></li>' +
          '<li><a href="seguimiento-caso">Seguimiento en Vivo</a></li>' +
          '<li><a href="soporte-tecnico">Soporte XTCERA & Alistar</a></li>' +
        '</ul>' +
      '</div>' +

      /* Col 3b — Empresa */
      '<div class="pfoot-col">' +
        '<h4>Empresa</h4>' +
        '<ul>' +
          '<li><a href="nosotros">Nosotros · Equipo</a></li>' +
          '<li><a href="nosotros#contacto">Contacto</a></li>' +
          '<li><a href="soporte">Centro de Soporte</a></li>' +
          '<li><a href="instalar-app">Instalar App Móvil</a></li>' +
          '<li><a href="terminos-y-legal">Términos y Privacidad</a></li>' +
        '</ul>' +
      '</div>' +

      /* Col 4 — Portal Profesional */
      '<div class="pfoot-col">' +
        '<h4>Portal Profesional</h4>' +
        '<a href="app/login.html" class="pfoot-cta"><i class="fas fa-key"></i> Acceso Doctores</a>' +
        '<ul>' +
          '<li><a href="https://wa.me/573212816716?text=Hola%20PRODIGY%2C%20necesito%20soporte%20t%C3%A9cnico" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" style="color:#25D366;margin-right:6px"></i>Soporte Técnico</a></li>' +
          '<li><a href="mailto:gerencia@prodigylabdental.com"><i class="far fa-envelope" style="margin-right:6px"></i>gerencia@prodigylabdental.com</a></li>' +
          '<li><a href="tel:+573212816716"><i class="fas fa-phone" style="margin-right:6px"></i>+57 321 281 6716</a></li>' +
        '</ul>' +
      '</div>' +
    '</div>' +

    '<div class="pfoot-copy">' +
      '<p>© 2026 PRODIGY Digital Dentistry · Bogotá, Colombia · Todos los derechos reservados · ' +
        '<a href="terminos-y-legal">Términos</a> · ' +
        '<a href="terminos-y-legal#privacidad">Privacidad</a>' +
      '</p>' +
      '<p style="font-size:.68rem;color:#475569;margin-top:8px;line-height:1.6;">' +
        'Las marcas registradas Exocad®, 3Shape®, Ivoclar®, Vita®, Amann Girrbach®, Dentsply Sirona®, Renfert®, ' +
        'Shining 3D®, NextDent®, SprintRay®, Anycubic®, Phrozen®, Creality®, Straumann®, Nobel Biocare®, BioHorizons®, ' +
        'XTCERA®, VHF®, CoDiagnostiX® y Blender® son propiedad de sus respectivos dueños y se mencionan exclusivamente ' +
        'con fines informativos sobre la compatibilidad de nuestros flujos de trabajo.' +
      '</p>' +
    '</div>';

  document.body.appendChild(footer);

  // ── UTM Tracker + Conversions (carga diferida para no bloquear render) ──
  function _loadScript(src) {
    var s = document.createElement('script');
    s.src = src; s.defer = true;
    document.body.appendChild(s);
  }
  _loadScript('/js/utm-tracker.js');
  _loadScript('/js/conversions.js');
  _loadScript('/js/geo-detect.js');
  _loadScript('/js/content-protection.js');
  /* GSAP + ScrollTrigger + animaciones PRODIGY */
  function _loadGSAP() {
    var g = document.createElement('script');
    g.src = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
    g.onload = function () {
      var st = document.createElement('script');
      st.src = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js';
      st.onload = function () { _loadScript('/js/animations.js'); };
      document.body.appendChild(st);
    };
    document.body.appendChild(g);
  }
  /* Cargar GSAP solo cuando el browser esté idle */
  if ('requestIdleCallback' in window) {
    requestIdleCallback(_loadGSAP, { timeout: 2000 });
  } else {
    setTimeout(_loadGSAP, 800);
  }

  // ── GDPR — aviso adicional para visitantes de la Unión Europea ──
  if (window.ProdigyGeo && window.ProdigyGeo.onReady) {
    window.ProdigyGeo.onReady(function(geo) {
      if (!geo.esEuropa) return;
      if (localStorage.getItem('prodigy_gdpr_ok')) return;
      var gd = document.createElement('div');
      gd.id = 'pfoot-gdpr-banner';
      gd.style.cssText = 'position:fixed;top:120px;right:20px;z-index:99998;max-width:300px;' +
        'background:#0d1520;border:1px solid rgba(0,210,255,.3);border-radius:14px;' +
        'padding:16px 18px;font-family:inherit;font-size:.76rem;color:#94a3b8;' +
        'box-shadow:0 8px 32px rgba(0,0,0,.5);transform:translateX(320px);transition:transform .4s ease;';
      gd.innerHTML =
        '<div style="font-size:.82rem;font-weight:800;color:#00d2ff;margin-bottom:8px;">🇪🇺 Aviso para usuarios de la UE</div>' +
        '<p style="line-height:1.6;margin-bottom:12px;">' +
          'Bajo el <strong style="color:#e2e8f0;">RGPD (GDPR)</strong> tienes derecho a acceder, rectificar y eliminar tus datos. ' +
          'PRODIGY no comparte datos personales con terceros ni usa cookies de publicidad. ' +
          'Solo usamos analytics anónimo (Google Analytics) con tu consentimiento.' +
        '</p>' +
        '<div style="display:flex;gap:8px;">' +
          '<a href="/terminos-y-legal#privacidad" style="flex:1;text-align:center;padding:7px;border:1px solid rgba(0,210,255,.3);' +
            'border-radius:8px;color:#00d2ff;text-decoration:none;font-size:.72rem;font-weight:700;">Ver política</a>' +
          '<button onclick="localStorage.setItem(\'prodigy_gdpr_ok\',\'1\');var b=document.getElementById(\'pfoot-gdpr-banner\');' +
            'b.style.transform=\'translateX(320px)\';setTimeout(function(){b.remove()},400);" ' +
            'style="flex:1;background:rgba(0,210,255,.12);border:1px solid rgba(0,210,255,.3);border-radius:8px;' +
            'color:#00d2ff;cursor:pointer;font-size:.72rem;font-weight:700;padding:7px;">Entendido</button>' +
        '</div>';
      document.body.appendChild(gd);
      setTimeout(function(){ gd.style.transform = 'translateX(0)'; }, 500);
    });
  }

  // ── Cookie consent (SIC Circular 002/2015 + GDPR + GA4 Consent Mode v2) ──
  var _pgConsentVal = localStorage.getItem('prodigy_cookies_ok');

  // Aplicar consent state al cargar si ya hay decisión previa
  if (_pgConsentVal === '1' && window.gtag) {
    window.gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'denied' });
  } else if (_pgConsentVal === '0' && window.gtag) {
    window.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied' });
  }

  if (!_pgConsentVal) {
    function _pgAccept() {
      localStorage.setItem('prodigy_cookies_ok','1');
      if(window.gtag) window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied'});
      var b = document.getElementById('pfoot-cookie-banner');
      if(b){ b.style.transform='translateY(100%)'; setTimeout(function(){ b.remove(); }, 300); }
    }
    function _pgReject() {
      localStorage.setItem('prodigy_cookies_ok','0');
      if(window.gtag) window.gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied'});
      var b = document.getElementById('pfoot-cookie-banner');
      if(b){ b.style.transform='translateY(100%)'; setTimeout(function(){ b.remove(); }, 300); }
    }

    /* Mostrar después de 3 seg — el usuario ya vio valor antes de que aparezca */
    setTimeout(function() {
      var cb = document.createElement('div');
      cb.id = 'pfoot-cookie-banner';
      cb.style.cssText = [
        'position:fixed;bottom:24px;left:24px;z-index:99999;',
        'background:linear-gradient(135deg,#0d1520,#0a1018);',
        'border:1px solid rgba(212,175,55,.35);border-radius:16px;',
        'padding:16px 18px;font-family:inherit;width:300px;',
        'transform:translateY(20px);opacity:0;transition:transform .4s ease,opacity .4s ease;',
        'box-shadow:0 8px 32px rgba(0,0,0,.6);'
      ].join('');

      cb.innerHTML =
        '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">' +
          '<div style="font-size:1.4rem;flex-shrink:0;line-height:1;">📊</div>' +
          '<div>' +
            '<div style="font-size:.84rem;font-weight:800;color:#f8fafc;margin-bottom:4px;">Ayúdanos a mejorar</div>' +
            '<div style="font-size:.72rem;color:#64748b;line-height:1.5;">' +
              'Analytics anónimo para ver qué te es útil. ' +
              '<strong style="color:#94a3b8;">Sin anuncios.</strong> ' +
              '<a href="/terminos-y-legal#privacidad" style="color:rgba(217,70,166,.8);text-decoration:none;">Ver política →</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<button onclick="_pgAccept()" ' +
          'style="width:100%;background:linear-gradient(135deg,#D4AF37,#D946A6);color:#000;border:none;border-radius:50px;' +
          'padding:9px 0;font-weight:900;font-size:.8rem;cursor:pointer;margin-bottom:6px;' +
          'box-shadow:0 4px 14px rgba(217,70,166,.3);transition:opacity .2s;" ' +
          'onmouseover="this.style.opacity=\'.85\'" onmouseout="this.style.opacity=\'1\'">' +
          '✓ Sí, mejorar la experiencia' +
        '</button>' +
        '<button onclick="_pgReject()" ' +
          'style="width:100%;background:transparent;color:#475569;border:none;padding:4px;' +
          'font-size:.7rem;cursor:pointer;text-decoration:underline;">' +
          'No por ahora' +
        '</button>';

      document.body.appendChild(cb);
      /* Slide up con animación */
      requestAnimationFrame(function(){ cb.style.transform = 'translateY(0)'; });
    }, 3000);
  }
})();
