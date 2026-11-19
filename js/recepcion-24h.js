/* Recepción 24/7 (decisión de Alejandro, 19-nov-2026): el cliente puede subir archivos y enviar casos a
 * cualquier hora; el trabajo arranca en horario hábil y los tiempos de entrega se cuentan desde ese inicio.
 * - Páginas con el banner «CICLO EN PRODUCCIÓN» (#banner-ciclo / #banner-msg): cambia el texto (antes decía
 *   «Cerramos recepción de casos a las 5:00 PM», que hacía creer que después no se podía enviar) y lo pasa a un
 *   tono tranquilo (cian, sin el punto rojo que parpadeaba).
 * - Páginas sin banner: pinta un aviso en [data-aviso-24h] o justo antes de #scannerForm / #alnForm.
 * El texto lo pone cada página en data-texto (PRODIGY y Alejandro tienen horarios distintos).
 * Uso: <script src="js/recepcion-24h.js?v=…" data-texto="…" defer></script>
 * Gemelo idéntico en alejandro-carvajal-site/js/recepcion-24h.js */
(function () {
  var s = document.currentScript;
  var texto = s && s.getAttribute('data-texto');
  if (!texto) return;

  function bannerTranquilo(banner) {
    banner.style.background = 'linear-gradient(90deg,rgba(0,210,255,.10),rgba(0,210,255,.04),rgba(0,210,255,.10))';
    banner.style.borderBottom = '1px solid rgba(0,210,255,.25)';
    var etiqueta = banner.querySelector('span');
    if (etiqueta) {
      etiqueta.style.color = '#00d2ff';
      var punto = etiqueta.querySelector('span');
      if (punto) { punto.style.animation = 'none'; punto.style.background = '#00d2ff'; }
      if (etiqueta.lastChild && etiqueta.lastChild.nodeType === 3) etiqueta.lastChild.textContent = ' RECIBIMOS CASOS 24/7';
    }
  }

  function aviso() {
    var d = document.createElement('div');
    d.setAttribute('role', 'note');
    d.style.cssText = 'display:flex;gap:10px;align-items:flex-start;background:rgba(0,210,255,.07);' +
      'border:1px solid rgba(0,210,255,.28);border-radius:12px;padding:12px 16px;margin:0 0 18px;' +
      'font-size:.92rem;line-height:1.55;color:#e2e8f0;text-align:left';
    var t = document.createElement('div');
    var b = document.createElement('strong');
    b.style.color = '#00d2ff';
    b.textContent = 'Recibimos casos 24/7. ';
    t.appendChild(b);
    t.appendChild(document.createTextNode(texto));
    d.appendChild(t);
    return d;
  }

  function aplicar() {
    var msg = document.getElementById('banner-msg');
    if (msg) {
      msg.textContent = texto;
      var banner = document.getElementById('banner-ciclo');
      if (banner) bannerTranquilo(banner);
      return;
    }
    var hueco = document.querySelector('[data-aviso-24h]');
    if (hueco) { hueco.appendChild(aviso()); return; }
    var form = document.getElementById('scannerForm') || document.getElementById('alnForm');
    if (form && form.parentNode) form.parentNode.insertBefore(aviso(), form);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aplicar);
  else aplicar();
})();
