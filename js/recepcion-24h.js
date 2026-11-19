/* Recepción 24/7 (decisión de Alejandro, 19-nov-2026): el cliente puede subir archivos y enviar casos a
 * cualquier hora; el trabajo arranca en horario hábil y los tiempos de entrega se cuentan desde ese inicio.
 * Reemplaza el texto del banner «CICLO EN PRODUCCIÓN» (#banner-ciclo / #banner-msg), que decía «Cerramos
 * recepción de casos a las 5:00 PM» y hacía creer que después no se podía enviar.
 * El texto lo pone cada página en data-texto (PRODIGY y Alejandro tienen horarios distintos).
 * Uso: <script src="js/recepcion-24h.js?v=…" data-texto="…" defer></script>
 * Gemelo idéntico en alejandro-carvajal-site/js/recepcion-24h.js */
(function () {
  var s = document.currentScript;
  var texto = s && s.getAttribute('data-texto');
  if (!texto) return;
  function aplicar() {
    var msg = document.getElementById('banner-msg');
    if (!msg) return;
    msg.textContent = texto;
    var banner = document.getElementById('banner-ciclo');
    var etiqueta = banner && banner.querySelector('span');
    if (etiqueta && etiqueta.lastChild && etiqueta.lastChild.nodeType === 3) {
      etiqueta.lastChild.textContent = ' RECIBIMOS CASOS 24/7';
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aplicar);
  else aplicar();
})();
