/**
 * PRODIGY — "¿Dónde estoy?" — identificador de panel y rol
 * v1.0 · 2026-07-18
 *
 * Problema que resuelve: siendo pocas personas, una misma persona entra a
 * varios paneles (admin, diseño, producción…) y es fácil confundirse de
 * pantalla. Esto pone una franja de color inconfundible arriba, con el nombre
 * del panel y el rol con el que entraste.
 *
 * Si además eres admin, aparece un selector para saltar a cualquier panel
 * sin cerrar sesión.
 *
 * Uso:  <script src="../js/rol-actual.js?v=20260718"></script>
 */
(function () {
  'use strict';

  /* Panel -> nombre visible, color y rol que le corresponde */
  var PANELES = {
    'panel-interno-operaciones.html': ['ADMINISTRACIÓN', '#D4AF37', 'admin'],
    'operator-panel.html':            ['OPERACIÓN',      '#00d2ff', 'operator'],
    'operario-diseno.html':           ['DISEÑO CAD',     '#3b82f6', 'diseno'],
    'operario.html':                  ['PRODUCCIÓN',     '#f97316', 'fresado / impresión'],
    'taller.html':                    ['TALLER',         '#a78bfa', 'taller'],
    'calidad.html':                   ['CALIDAD',        '#00FF41', 'calidad'],
    'mensajero.html':                 ['MENSAJERÍA',     '#25D366', 'mensajero'],
    'inventario.html':                ['INVENTARIO',     '#fbbf24', 'encargado_inventario'],
    'contabilidad.html':              ['CONTABILIDAD',   '#D946A6', 'contabilidad'],
    'client-panel.html':              ['PORTAL DEL DOCTOR', '#94a3b8', 'cliente'],
    'cotizaciones.html':              ['COTIZACIONES',   '#00d2ff', 'admin / operator'],
    'gestionar-casos.html':           ['PORTAFOLIO',     '#D4AF37', 'admin'],
    'agregar-caso.html':              ['SUBIR CASO',     '#D4AF37', 'admin'],
    'admin-precios.html':             ['PRECIOS',        '#D4AF37', 'admin'],
    'configuracion.html':             ['CONFIGURACIÓN',  '#D4AF37', 'admin'],
    'pruebas-carga.html':             ['PRUEBAS',        '#f87171', 'admin'],
    'metricas.html':                  ['MÉTRICAS',       '#00d2ff', 'admin'],
    'metricas-fin.html':              ['MÉTRICAS FIN.',  '#D946A6', 'admin']
  };

  /* Adónde puede saltar el admin */
  var SALTOS = [
    ['panel-interno-operaciones.html', 'Administración'],
    ['operator-panel.html',            'Operación'],
    ['operario-diseno.html',           'Diseño CAD'],
    ['operario.html',                  'Producción'],
    ['taller.html',                    'Taller'],
    ['calidad.html',                   'Calidad'],
    ['mensajero.html',                 'Mensajería'],
    ['inventario.html',                'Inventario'],
    ['contabilidad.html',              'Contabilidad'],
    ['cotizaciones.html',              'Cotizaciones'],
    ['pruebas-carga.html',             'Pruebas']
  ];

  function archivo() {
    var n = (location.pathname.split('/').pop() || 'index').toLowerCase();
    return n.indexOf('.html') > -1 ? n : n + '.html';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var f = archivo();
    var cfg = PANELES[f];
    if (!cfg) return;
    var nombre = cfg[0], color = cfg[1], rol = cfg[2];

    var css = ''
      + '#rolbar{position:fixed;top:0;left:0;right:0;z-index:99990;height:5px;background:' + color + ';}'
      + '#rolchip{position:fixed;top:11px;right:14px;z-index:99991;display:flex;align-items:center;gap:9px;'
      + 'background:rgba(10,10,10,.92);border:1px solid ' + color + '66;border-left:3px solid ' + color + ';'
      + 'border-radius:9px;padding:6px 12px;font:600 .72rem/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;'
      + 'color:#e6e9ee;backdrop-filter:blur(6px);}'
      + '#rolchip .p{color:' + color + ';font-weight:800;letter-spacing:.6px;}'
      + '#rolchip .r{color:#94a3b8;font-size:.68rem;}'
      + '#rolsel{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:#e6e9ee;'
      + 'border-radius:7px;padding:4px 7px;font-size:.7rem;font-family:inherit;cursor:pointer;color-scheme:dark;}'
      + '#rolsel option{background:#14100a;color:#f5f5f7;}'
      + '@media(max-width:640px){#rolchip{top:auto;bottom:8px;right:8px;left:8px;justify-content:center;}}'
      + '@media print{#rolbar,#rolchip{display:none;}}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    var bar = document.createElement('div'); bar.id = 'rolbar'; document.body.appendChild(bar);

    var chip = document.createElement('div');
    chip.id = 'rolchip';
    chip.setAttribute('data-tip', 'Te indica en qué panel estás y con qué rol. Sirve para no confundirte de pantalla.');
    chip.innerHTML = '<span class="p">' + nombre + '</span><span class="r">rol: ' + rol + '</span>';
    document.body.appendChild(chip);

    /* Selector de panel — solo para quien es admin */
    function esAdmin() {
      if (window.PRODIGY_ROLE === 'admin') return true;
      var mail = (window.PRODIGY_EMAIL || '').toLowerCase();
      return mail === 'jackalejandroc@gmail.com' || mail === 'labdentalprodigy@gmail.com';
    }
    function ponerSelector() {
      if (!esAdmin() || document.getElementById('rolsel')) return;
      var s = document.createElement('select');
      s.id = 'rolsel';
      s.setAttribute('aria-label', 'Cambiar de panel');
      s.setAttribute('data-tip', 'Salta a otro panel sin cerrar sesión. Solo disponible para el administrador.');
      s.innerHTML = '<option value="">Ir a…</option>'
        + SALTOS.filter(function (x) { return x[0] !== f; })
                .map(function (x) { return '<option value="' + x[0] + '">' + x[1] + '</option>'; }).join('');
      s.addEventListener('change', function () {
        if (s.value) location.href = '/app/' + s.value;
      });
      chip.appendChild(s);
    }
    ponerSelector();
    // El rol se resuelve después del login: reintentar un par de veces
    var t = 0, iv = setInterval(function () {
      ponerSelector();
      if (++t > 12 || document.getElementById('rolsel')) clearInterval(iv);
    }, 500);
  });
})();
