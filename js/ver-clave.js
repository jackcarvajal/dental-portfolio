/* Ojo para ver la contraseña un momento: se agrega a cada casilla de clave de la página.
   Se vuelve a ocultar sola a los 8 segundos (o al tocar el ojo otra vez). */
(function () {
  'use strict';
  function armar(inp) {
    if (inp.dataset.ojo) return;
    inp.dataset.ojo = '1';
    var caja = document.createElement('span');
    caja.style.cssText = 'position:relative;display:block;';
    inp.parentNode.insertBefore(caja, inp);
    caja.appendChild(inp);
    inp.style.paddingRight = '48px';

    var b = document.createElement('button');
    b.type = 'button';
    b.style.cssText = 'position:absolute;right:6px;top:50%;transform:translateY(-50%);background:none;border:none;color:#94a3b8;cursor:pointer;padding:8px 10px;font-size:1rem;line-height:1;';
    var t = null;
    function pintar(visible) {
      b.innerHTML = '<i class="fas ' + (visible ? 'fa-eye-slash' : 'fa-eye') + '" aria-hidden="true"></i>';
      b.setAttribute('aria-label', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
      b.setAttribute('aria-pressed', String(visible));
      b.title = visible ? 'Ocultar' : 'Ver la contraseña';
    }
    function ocultar() { clearTimeout(t); inp.type = 'password'; pintar(false); }
    b.addEventListener('click', function () {
      if (inp.type === 'password') { inp.type = 'text'; pintar(true); clearTimeout(t); t = setTimeout(ocultar, 8000); }
      else ocultar();
      inp.focus();
    });
    // Al enviar el formulario siempre vuelve a quedar oculta
    if (inp.form) inp.form.addEventListener('submit', ocultar);
    pintar(false);
    caja.appendChild(b);
  }
  function init() { document.querySelectorAll('input[type="password"]').forEach(armar); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
