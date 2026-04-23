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
    '#pfoot-root .pfoot-col a:hover{color:#D4AF37;padding-left:4px;}',
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
      'color:#475569;font-size:12px;',
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
        '<p class="pfoot-desc">Especialistas en diseño CAD avanzado y manufactura de alta precisión para clínicas y laboratorios dentales.</p>' +
        '<div class="pfoot-geo"><span class="pfoot-geo-dot"></span>Sede Central: Bogotá, Colombia</div>' +
        '<div class="pfoot-social">' +
          '<a href="https://wa.me/573212816716" target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp PRODIGY Lab">' +
            '<i class="fab fa-whatsapp"></i>' +
          '</a>' +
          '<a href="https://www.instagram.com/labdentalprodigy/" target="_blank" rel="noopener noreferrer" title="Instagram @labdentalprodigy" aria-label="Instagram @labdentalprodigy">' +
            '<i class="fab fa-instagram"></i>' +
          '</a>' +
        '</div>' +
      '</div>' +

      /* Col 2 — Manufactura Colombia */
      '<div class="pfoot-col">' +
        '<h4>Manufactura (Colombia)</h4>' +
        '<ul>' +
          '<li><a href="fresado-cam.html">Fresado CAM — Servicios</a></li>' +
          '<li><a href="flujo-fresado.html">Pedir Fresado</a></li>' +
          '<li><a href="flujo-impresion.html">Impresión 3D Dental</a></li>' +
          '<li><a href="catalogo.html">Catálogo de Materiales</a></li>' +
          '<li><a href="escaner-domicilio.html">Escáner Móvil a Domicilio</a></li>' +
        '</ul>' +
      '</div>' +

      /* Col 3 — Ecosistema Digital */
      '<div class="pfoot-col">' +
        '<h4>Ecosistema Digital</h4>' +
        '<ul>' +
          '<li><a href="diseno-cad.html">Diseño CAD — Servicios</a></li>' +
          '<li><a href="flujo-diseno.html">Pedir Diseño CAD</a></li>' +
          '<li><a href="envia-tu-scanner.html">Envía tu Escáner</a></li>' +
          '<li><a href="journal.html">ProDigy Journal</a></li>' +
          '<li><a href="seguimiento-caso.html">Seguimiento en Vivo</a></li>' +
        '</ul>' +
      '</div>' +

      /* Col 3b — Empresa */
      '<div class="pfoot-col">' +
        '<h4>Empresa</h4>' +
        '<ul>' +
          '<li><a href="nosotros.html">Nosotros</a></li>' +
          '<li><a href="soporte.html">Soporte Técnico</a></li>' +
          '<li><a href="nosotros.html#contacto">Contacto</a></li>' +
          '<li><a href="instalar-app.html">Instalar App</a></li>' +
          '<li><a href="terminos-y-legal.html">Términos y Privacidad</a></li>' +
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
        '<a href="terminos-y-legal.html">Términos</a> · ' +
        '<a href="terminos-y-legal.html#privacidad">Privacidad</a>' +
      '</p>' +
    '</div>';

  document.body.appendChild(footer);

  // ── Cookie consent (SIC Circular 002/2015 + GA4) ──────────────
  if (!localStorage.getItem('prodigy_cookies_ok')) {
    var cb = document.createElement('div');
    cb.id = 'pfoot-cookie-banner';
    cb.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#0d1520;border-top:1px solid rgba(212,175,55,.3);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:inherit;font-size:.82rem;color:#94a3b8;';
    cb.innerHTML = '<span>Usamos <strong style="color:#e2e8f0">cookies analíticas</strong> (Google Analytics) para mejorar el servicio. No compartimos datos personales con terceros. ' +
      '<a href="/terminos-y-legal.html#privacidad" style="color:#D946A6">Ver política de privacidad</a></span>' +
      '<button onclick="localStorage.setItem(\'prodigy_cookies_ok\',\'1\');document.getElementById(\'pfoot-cookie-banner\').remove();" ' +
      'style="background:#D946A6;color:#fff;border:none;border-radius:8px;padding:8px 20px;font-weight:700;cursor:pointer;font-size:.82rem;white-space:nowrap;">Aceptar</button>';
    document.body.appendChild(cb);
  }
})();
