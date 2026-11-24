/* VISTA PREVIA (rama vista-previa, NO producción): mejoras propuestas y aún sin aprobar, aplicadas sobre las páginas
   reales para verlas navegando. Se borra al aprobar (cada mejora se implementa en el HTML de su página) o al descartar.
   Mejora 1: franja debajo del hero de la portada · 2: foto real + garantía (coronas, carillas) · 3: flujo de diseño que
   empieza por el servicio, datos al final y tutorial solo si se pide. */
(function () {
  'use strict';
  var ruta = location.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  var FOTO = function (c, f) { return 'https://zgihrwqfyvgyapbwzkvw.supabase.co/storage/v1/render/image/public/portafolio/' + c + '/gallery/' + f + '?width=900&height=675&resize=cover&quality=78'; };
  function css(t) { var s = document.createElement('style'); s.textContent = t; document.head.appendChild(s); }
  function listo(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  // Aviso fijo: que nadie confunda esta web con la real
  listo(function () {
    css('#vp-aviso{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:100000;background:#D4AF37;color:#111;font:800 12px/1.2 Inter,system-ui,sans-serif;letter-spacing:.04em;padding:7px 12px;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.45);pointer-events:none;white-space:nowrap}');
    var a = document.createElement('div'); a.id = 'vp-aviso'; a.textContent = 'VISTA PREVIA · CAMBIOS SIN APROBAR'; document.body.appendChild(a);
  });

  /* ── 1. Portada: franja debajo del hero ── */
  if (ruta === '/') listo(function () {
    var hero = document.querySelector('header.hero'); if (!hero) return;
    css('.qh{position:relative;z-index:3;background:#0b0f17;border-top:1px solid rgba(212,175,55,.18);border-bottom:1px solid rgba(255,255,255,.06);padding:48px 0 44px}' +
      '.qh .in{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr);gap:28px;padding:0 max(16px,env(safe-area-inset-left,0px))}' +
      '.qh h2{font:800 clamp(1.7rem,4vw,2.5rem)/1.12 Inter,system-ui,sans-serif;color:#f8fafc;letter-spacing:-.02em;margin:0 0 12px;text-align:center;text-wrap:balance}.qh h2 span{color:#D4AF37}' +
      '.qh .s{font:400 1.05rem/1.6 Inter,system-ui,sans-serif;color:#cbd5e1;max-width:640px;margin:0 auto 22px;text-align:center}' +
      '.qh .b{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:18px}' +
      '.qh .b a{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:14px 24px;border-radius:12px;font:700 1rem Inter,system-ui,sans-serif;text-decoration:none;min-height:50px;min-width:220px}' +
      '.qh .p{background:#D946A6;color:#fff}.qh .w{border:1.5px solid #25D366;color:#f1f5f9;background:rgba(37,211,102,.07)}' +
      '.qh .c{display:flex;gap:6px 20px;justify-content:center;flex-wrap:wrap;font:600 .95rem Inter,system-ui,sans-serif;color:#cbd5e1}.qh .c b{color:#D4AF37}' +
      '.qh .f{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}' +
      '.qh figure{margin:0;border-radius:14px;overflow:hidden;background:#1a2332;border:1px solid rgba(255,255,255,.08)}' +
      '.qh figure img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}' +
      '.qh figcaption{padding:10px 12px;font:600 .95rem Inter,system-ui,sans-serif;color:#e2e8f0}.qh figcaption small{display:block;font-weight:400;color:#94a3b8;font-size:.88rem}' +
      '@media(max-width:700px){.qh .f{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px}.qh figure{flex:0 0 78%;scroll-snap-align:start}}');
    var d = document.createElement('div'); d.className = 'qh';
    d.innerHTML = '<div class="in"><div>' +
      '<h2>Laboratorio dental digital en Bogotá. <span>Apruebas el diseño antes de producir.</span></h2>' +
      '<p class="s">Diseño en Exocad y 3Shape desde 24 h, coronas de zirconio, carillas, guías quirúrgicas e impresión 3D para clínicas y laboratorios.</p>' +
      '<div class="b"><a class="p" href="/envia-tu-scanner"><i class="fas fa-upload" aria-hidden="true"></i> Enviar mi caso</a>' +
      '<a class="w" href="https://wa.me/573212816716?text=Hola%20PRODIGY%2C%20quiero%20cotizar%20un%20caso" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" style="color:#25D366" aria-hidden="true"></i> Cotizar por WhatsApp</a></div>' +
      '<div class="c"><span><b>★</b> Opiniones verificadas en Google</span><span><b>200+</b> doctores activos</span><span><b>~150</b> diseños al mes</span></div></div>' +
      '<div class="f">' +
      '<figure><img src="' + FOTO('caso-1784765727153', 'foto-3.jpeg') + '" alt="Diseño de coronas en Exocad sobre el modelo" loading="lazy"><figcaption>Coronas sobre diente e implante<small>Diseño en Exocad, aprobado antes de fresar</small></figcaption></figure>' +
      '<figure><img src="' + FOTO('caso-1784770877222', 'foto-3.jpeg') + '" alt="Diseño de carillas en Exocad" loading="lazy"><figcaption>Carillas en e.max<small>Mock-up digital y forma aprobada por el doctor</small></figcaption></figure>' +
      '<figure><img src="' + FOTO('caso-1784766305902', 'foto-3.jpeg') + '" alt="Diseño de coronas sobre implantes e iBar" loading="lazy"><figcaption>Coronas sobre implantes e iBar<small>Rehabilitación fija superior</small></figcaption></figure>' +
      '</div></div>';
    hero.after(d);
  });

  /* ── 2. Foto real del trabajo + garantía junto al botón ── */
  var FOTO_SERVICIO = {
    '/coronas-zirconio': ['caso-1784765727153', 'foto-3.jpeg', 'Diseño real en Exocad de un caso de coronas. Así lo revisas y apruebas antes de fresar.', 'la corona'],
    '/carillas': ['caso-1784770877222', 'foto-3.jpeg', 'Diseño real de carillas en Exocad. Ves la forma y la apruebas antes de producir.', 'la carilla']
  };
  if (FOTO_SERVICIO[ruta]) listo(function () {
    var cfg = FOTO_SERVICIO[ruta];
    var fila = document.querySelector('.hero .cta-row'), badges = document.querySelector('.hero .hero-badges');
    if (!fila) return;
    css('.fx{margin:22px 0 0;border-radius:16px;overflow:hidden;border:1px solid rgba(212,175,55,.25);background:#0d1525;max-width:560px}' +
      '.fx img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover}.fx figcaption{padding:10px 14px;font:500 .95rem/1.45 Inter,system-ui,sans-serif;color:#cbd5e1}' +
      '.gx{display:flex;gap:10px;align-items:flex-start;margin:16px 0 0;padding:12px 14px;border-radius:12px;background:rgba(0,255,65,.06);border:1px solid rgba(0,255,65,.22);font:500 .95rem/1.5 Inter,system-ui,sans-serif;color:#e2e8f0;max-width:560px}' +
      '.gx i{color:#00FF41;margin-top:3px}.gx a{color:#00d2ff;font-weight:700}');
    var g = document.createElement('p'); g.className = 'gx';
    g.innerHTML = '<i class="fas fa-shield-halved" aria-hidden="true"></i><span><b>Garantía de producción:</b> si ' + cfg[3] + ' no coincide con el diseño que aprobaste (±20 µm), la reponemos en 24 h. <a href="/terminos-y-legal">Condiciones</a></span>';
    fila.after(g);
    var f = document.createElement('figure'); f.className = 'fx';
    f.innerHTML = '<img src="' + FOTO(cfg[0], cfg[1]) + '" alt="Diseño real en Exocad"><figcaption>' + cfg[2] + '</figcaption>';
    (badges || g).after(f);
  });

  /* ── 3. Flujo de diseño: primero el servicio, tus datos al final, tutorial a pedido ── */
  if (ruta === '/flujo-diseno') listo(function () {
    var main = document.getElementById('main-content'); if (!main) return;
    var faq = main.firstElementChild; if (faq && /Ver FAQ/.test(faq.textContent)) faq.remove();
    var ciclo = document.getElementById('banner-ciclo'); if (ciclo) ciclo.remove();
    [].slice.call(document.querySelectorAll('div')).filter(function (d) { return /Recibimos casos 24\/7/i.test(d.textContent) && d.textContent.length < 500; }).forEach(function (d) { d.remove(); });
    [].slice.call(document.querySelectorAll('.container > div')).filter(function (d) { return /orden en papel o PDF/.test(d.textContent) && d.textContent.length < 300; }).forEach(function (d) { d.remove(); });
    css('.fxh{text-align:left;padding:18px 0 6px}.fxh h1{font:800 1.75rem/1.15 Inter,system-ui,sans-serif;color:#f8fafc;margin:0 0 8px;letter-spacing:-.01em}' +
      '.fxh p{font:400 1rem/1.55 Inter,system-ui,sans-serif;color:#cbd5e1;margin:0 0 14px}.fxh ol{list-style:none;display:flex;gap:6px;flex-wrap:wrap;padding:0;margin:0 0 12px}' +
      '.fxh li{font:600 .85rem Inter,system-ui,sans-serif;color:#cbd5e1;background:#1a2332;border:1px solid rgba(255,255,255,.08);border-radius:999px;padding:6px 11px}.fxh li b{color:#D4AF37;margin-right:4px}' +
      '.fxh .l{font-size:.9rem;color:#94a3b8}.fxh .l a,.fxh .l button{color:#00d2ff;font-weight:700;text-decoration:none;background:none;border:0;padding:0;font:inherit;cursor:pointer}' +
      '.accordion-header h2,.timeline-section h2{text-transform:none!important;letter-spacing:0!important;font-size:1.05rem!important}');
    var hd = document.querySelector('.container > header');
    if (hd) {
      hd.className = 'fxh';
      hd.innerHTML = '<h1>Envía tu caso de diseño CAD</h1><p>Unos 2 minutos: eliges el diseño, subes el escaneo y pagas al confirmar.</p>' +
        '<ol><li><b>1</b>Diseño</li><li><b>2</b>Entrega</li><li><b>3</b>Archivos</li><li><b>4</b>Tus datos</li><li><b>5</b>Pago</li></ol>' +
        '<p class="l"><button type="button" id="vp-tour">¿Cómo funciona?</button> · <a href="/preguntas">Preguntas</a> · <a href="/orden-laboratorio">Orden en PDF</a> · Recibimos casos 24/7 (corte 5:00 PM)</p>';
      var bt = document.getElementById('vp-tour'); if (bt) bt.onclick = function () { if (window.TourPRODIGY) window.TourPRODIGY.abrir(); };
    }
    var w = document.querySelector('.col-izquierda-wrap') || main;
    var datos = [].slice.call(w.children).filter(function (e) { return e.matches('.accordion') && /DATOS DEL PROFESIONAL/.test(e.textContent.slice(0, 300)); })[0];
    var archivos = document.getElementById('acc-archivos'), dis = document.getElementById('acc-diseno');
    if (datos && archivos) { archivos.after(datos); datos.classList.remove('active'); if (dis) dis.classList.add('active'); }
    var ren = [[/2\. TIPO DE DISEÑO CAD/, '1. ¿Qué diseño necesitas?'], [/3\. TIEMPO DE ENTREGA ESTIMADO/, '2. Tiempo de entrega'], [/4\. CHECKLIST DE ARCHIVOS/, '3. Archivos del caso'], [/1\. DATOS DEL PROFESIONAL/, '4. Tus datos'], [/5\. CONFIRMACIÓN FINAL/, '5. Confirmar y pagar']];
    [].forEach.call(w.querySelectorAll('h2'), function (h) { ren.forEach(function (r) { if (r[0].test(h.textContent)) h.textContent = r[1]; }); });
  });

  /* ── Portadas del portafolio: comparar en vivo (portada y /portafolio) ──
     Actual = la portada que hay hoy (cara completa). Sonrisa = la misma foto recortada a la boca (el punto se calcula
     buscando el diseño amarillo/verde sobre los dientes). Diseño = la tercera foto de la galería (vista frontal en Exocad). */
  if (ruta === '/' || ruta === '/portafolio') listo(function () {
    var SURL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
    var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhyd3FmeXZneWFwYnd6a3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzczNDksImV4cCI6MjA5MDg1MzM0OX0.9CzmFDQYeQKcbtAZoT1_n_OuJ1qPVJu3jImd938T634';
    var render = function (u, w) { return u && u.indexOf('/object/public/') > -1 ? u.replace('/object/public/', '/render/image/public/') + (u.indexOf('?') > -1 ? '&' : '?') + 'width=' + (w || 700) + '&quality=75' : u; };
    var galeria = {}, foco = {}, modo = 'actual';
    try { modo = sessionStorage.getItem('vp_portadas') || 'actual'; } catch (e) {}
    fetch(SURL + '/rest/v1/casos_portafolio?select=id,gallery&visible=eq.true', { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } })
      .then(function (r) { return r.json(); }).then(function (filas) { (filas || []).forEach(function (f) { galeria[f.id] = f.gallery || []; }); aplicar(); }).catch(function () {});

    // Centro del diseño (píxeles amarillos o verdes saturados) en una copia chica de la portada
    function buscarBoca(src, cb) {
      var im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = function () {
        try {
          var c = document.createElement('canvas'), W = 120, H = Math.round(120 * im.naturalHeight / im.naturalWidth) || 90; c.width = W; c.height = H;
          var x = c.getContext('2d'); x.drawImage(im, 0, 0, W, H); var d = x.getImageData(0, 0, W, H).data, sx = 0, sy = 0, k = 0;
          for (var i = 0; i < d.length; i += 4) {
            var r = d[i], g = d[i + 1], b = d[i + 2], px = (i / 4) % W, py = Math.floor(i / 4 / W);
            if (py < H * 0.45) continue;   // arriba están los lentes con el logo dorado: la boca siempre queda abajo
            if ((r > 170 && g > 140 && b < 90) || (g > 170 && r < 140 && b > 90 && b < 200 && g - r > 60)) { sx += px; sy += py; k++; }
          }
          cb(k > 25 ? [Math.round(100 * sx / k / W), Math.round(100 * sy / k / H)] : [50, 72]);
        } catch (e) { cb([50, 72]); }
      };
      im.onerror = function () { cb([50, 72]); };
      im.src = render(src, 240) || src;
    }

    function tarjetas() {
      return [].slice.call(document.querySelectorAll('#idx-port-grid a[href*="caso?id="], #casesGrid a.case-card')).map(function (a) {
        var id = decodeURIComponent((a.getAttribute('href').split('id=')[1] || '').split('&')[0]);
        return { id: id, img: a.querySelector('img') };
      }).filter(function (t) { return t.id && t.img; });
    }
    function aplicar() {
      tarjetas().forEach(function (t) {
        var im = t.img;
        if (!im.dataset.vpOrig) im.dataset.vpOrig = im.getAttribute('src');
        var orig = im.dataset.vpOrig;
        im.style.transition = 'none';
        if (modo === 'diseno') {
          var g = galeria[t.id] || [], u = g[2] || g[1] || g[0];
          im.style.transform = ''; im.style.objectPosition = '';
          if (u) im.src = render(u, 700);
        } else {
          if (im.getAttribute('src') !== orig) im.src = orig;
          if (modo === 'sonrisa') {
            var pon = function (p) { im.style.objectFit = 'cover'; im.style.objectPosition = p[0] + '% ' + p[1] + '%'; im.style.transformOrigin = p[0] + '% ' + p[1] + '%'; im.style.transform = 'scale(2.2)'; };
            if (foco[t.id]) pon(foco[t.id]); else buscarBoca(orig, function (p) { foco[t.id] = p; if (modo === 'sonrisa') pon(p); });
          } else { im.style.transform = ''; im.style.objectPosition = ''; im.style.transformOrigin = ''; }
        }
      });
      [].forEach.call(document.querySelectorAll('#vp-portadas button'), function (b) { b.setAttribute('aria-pressed', b.dataset.m === modo ? 'true' : 'false'); });
    }

    css('#vp-portadas{position:fixed;right:max(12px,env(safe-area-inset-right,0px));top:calc(var(--alto-menu,130px) + 12px);z-index:100000;background:#1a2332;border:1px solid #D4AF37;border-radius:14px;padding:8px;font:600 13px Inter,system-ui,sans-serif;color:#e2e8f0;box-shadow:0 8px 24px rgba(0,0,0,.5)}' +
      '#vp-portadas p{margin:0 0 6px;color:#D4AF37;font-size:12px;letter-spacing:.04em}#vp-portadas div{display:flex;gap:4px}' +
      '#vp-portadas button{border:1px solid rgba(255,255,255,.15);background:#0d1525;color:#cbd5e1;border-radius:9px;padding:7px 10px;font:inherit;cursor:pointer}' +
      '#vp-portadas button[aria-pressed="true"]{background:#D4AF37;color:#111;border-color:#D4AF37}');
    var p = document.createElement('div'); p.id = 'vp-portadas';
    p.innerHTML = '<p>PORTADAS DEL PORTAFOLIO</p><div><button type="button" data-m="actual">Actual</button><button type="button" data-m="sonrisa">Sonrisa</button><button type="button" data-m="diseno">Diseño</button></div>';
    p.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; modo = b.dataset.m; try { sessionStorage.setItem('vp_portadas', modo); } catch (er) {} aplicar(); });
    document.body.appendChild(p);
    // Las tarjetas llegan después (y el portafolio las vuelve a pintar al filtrar o cambiar de página)
    ['idx-port-grid', 'casesGrid'].forEach(function (id) { var g = document.getElementById(id); if (g) new MutationObserver(function () { setTimeout(aplicar, 50); }).observe(g, { childList: true }); });
    aplicar();
  });
})();
