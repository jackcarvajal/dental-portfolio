/**
 * PRODIGY — Footer Compartido
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
      'padding:56px 0 24px;',
      'font-family:inherit;',
    '}',
    '#pfoot-root .pfoot-grid{',
      'display:grid;',
      'grid-template-columns:repeat(auto-fit,minmax(200px,1fr));',
      'gap:36px;',
      'max-width:1200px;margin:0 auto 40px;padding:0 24px;',
    '}',
    '#pfoot-root .pfoot-col h4{',
      'color:#D4AF37;font-size:13px;font-weight:800;',
      'text-transform:uppercase;letter-spacing:1.2px;',
      'margin:0 0 16px;',
    '}',
    '#pfoot-root .pfoot-col ul{list-style:none;padding:0;margin:0;}',
    '#pfoot-root .pfoot-col li{padding:6px 0;color:#94a3b8;font-size:13px;}',
    '#pfoot-root .pfoot-col a{',
      'color:#94a3b8;text-decoration:none;',
      'transition:color .25s;',
    '}',
    '#pfoot-root .pfoot-col a:hover{color:#D4AF37;}',
    '#pfoot-root .pfoot-brand strong{',
      'display:block;font-size:20px;font-weight:900;',
      'letter-spacing:2.5px;color:#D4AF37;margin-bottom:6px;',
    '}',
    '#pfoot-root .pfoot-brand p{color:#64748b;font-size:12px;line-height:1.6;margin:0;}',
    '#pfoot-root .pfoot-copy{',
      'text-align:center;',
      'border-top:1px solid rgba(255,255,255,.06);',
      'max-width:1200px;margin:0 auto;padding:20px 24px 0;',
      'color:#475569;font-size:12px;',
    '}',
    '#pfoot-root .pfoot-copy a{color:#64748b;text-decoration:none;transition:color .2s;}',
    '#pfoot-root .pfoot-copy a:hover{color:#D4AF37;}',
    '#pfoot-root .pfoot-social{display:flex;gap:12px;margin-top:14px;}',
    '#pfoot-root .pfoot-social a{',
      'display:inline-flex;align-items:center;justify-content:center;',
      'width:34px;height:34px;border-radius:50%;',
      'background:rgba(255,255,255,.05);color:#94a3b8;',
      'font-size:14px;text-decoration:none;',
      'transition:background .25s,color .25s;',
    '}',
    '#pfoot-root .pfoot-social a:hover{background:rgba(212,175,55,.15);color:#D4AF37;}',
    '@media(max-width:600px){',
      '#pfoot-root .pfoot-grid{grid-template-columns:repeat(2,1fr);gap:24px;}',
      '#pfoot-root{padding:40px 0 16px;}',
    '}',
    '@media(max-width:380px){',
      '#pfoot-root .pfoot-grid{grid-template-columns:1fr;}',
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
        '<strong>PRODIGY</strong>' +
        '<p>Laboratorio dental digital de alta precisión.<br>Bogotá, Colombia.</p>' +
        '<div class="pfoot-social">' +
          '<a href="https://wa.me/573212816716" target="_blank" rel="noopener noreferrer" title="WhatsApp">' +
            '<i class="fab fa-whatsapp"></i>' +
          '</a>' +
          '<a href="https://instagram.com/prodigydigitaldentistry" target="_blank" rel="noopener noreferrer" title="Instagram">' +
            '<i class="fab fa-instagram"></i>' +
          '</a>' +
        '</div>' +
      '</div>' +

      /* Col 2 — Contacto */
      '<div class="pfoot-col">' +
        '<h4>Contacto</h4>' +
        '<ul>' +
          '<li><a href="tel:+573212816716">+57 321 281 6716</a></li>' +
          '<li><a href="mailto:labdentalprodigy@gmail.com">labdentalprodigy@gmail.com</a></li>' +
          '<li><a href="https://wa.me/573212816716?text=Hola%20PRODIGY%2C%20quiero%20información" target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a></li>' +
        '</ul>' +
      '</div>' +

      /* Col 3 — Servicios */
      '<div class="pfoot-col">' +
        '<h4>Servicios</h4>' +
        '<ul>' +
          '<li><a href="flujo-diseno.html">Diseños CAD</a></li>' +
          '<li><a href="flujo-fresado.html">Centro Fresado e Impresión</a></li>' +
          '<li><a href="envia-tu-scanner.html">Envía tu Escáner</a></li>' +
          '<li><a href="escaner-domicilio.html">Escáner Móvil</a></li>' +
          '<li><a href="calculadora.html">Cotizador de Casos</a></li>' +
        '</ul>' +
      '</div>' +

      /* Col 4 — Prodigy */
      '<div class="pfoot-col">' +
        '<h4>Prodigy</h4>' +
        '<ul>' +
          '<li><a href="portafolio.html">Portafolio</a></li>' +
          '<li><a href="journal.html">Blog Científico</a></li>' +
          '<li><a href="seguimiento-caso.html">Sigue tu Caso</a></li>' +
          '<li><a href="terminos-y-legal.html">Términos y Condiciones</a></li>' +
          '<li><a href="terminos-y-legal.html#privacidad">Política de Privacidad</a></li>' +
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
})();
