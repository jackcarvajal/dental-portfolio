/**
 * PRODIGY — "Mi día": resumen de la tarea principal de cada rol
 * v1.0 · 2026-07-18
 *
 * Muestra arriba del panel una tarjeta con lo que esa persona tiene que hacer
 * HOY, con números reales tomados de las mismas consultas que ya usa el panel.
 *
 * Diseño defensivo: si la consulta falla o no hay cliente Supabase, la tarjeta
 * simplemente NO se muestra — nunca rompe la página.
 *
 * Uso:  <script src="../js/mi-dia.js?v=20260718"></script>  (tras el JS del panel)
 */
(function () {
  'use strict';

  /* Config por panel: consultas verificadas contra el código de cada rol */
  var PANELES = {

    'operario-diseno.html': {
      titulo: 'Tus casos de diseño',
      metricas: [
        { label: 'casos en tu flujo', color: '#00d2ff',
          q: function (sb) { return sb.from('pedidos').select('id', { count: 'exact', head: true }).eq('flujo', 'diseno'); } },
        { label: 'ya aprobados', color: '#00FF41',
          q: function (sb) { return sb.from('pedidos').select('id', { count: 'exact', head: true }).eq('flujo', 'diseno').eq('estado_operativo', 'DISENO_APROBADO'); } }
      ],
      hint: 'Descarga el archivo del caso, sube tu diseño y márcalo como listo para que pase a producción.'
    },

    'calidad.html': {
      titulo: 'Casos para revisar',
      metricas: [
        { label: 'en control de calidad', color: '#D4AF37',
          q: function (sb) { return sb.from('pedidos').select('id', { count: 'exact', head: true }).in('estado_operativo', ['QA_APROBADO', 'LISTO_DESPACHAR', 'POR_DESPACHAR', 'EN_REPARTO']); } },
        { label: 'listos para despachar', color: '#00FF41',
          q: function (sb) { return sb.from('pedidos').select('id', { count: 'exact', head: true }).eq('estado_operativo', 'LISTO_DESPACHAR'); } }
      ],
      hint: 'Revisa cada caso terminado: si cumple, márcalo listo para despachar; si no, devuélvelo con la observación.'
    },

    'inventario.html': {
      titulo: 'Estado del inventario',
      metricas: [
        { label: 'materiales activos', color: '#00d2ff',
          q: function (sb) { return sb.from('inventario_items').select('id', { count: 'exact', head: true }).eq('activo', true); } }
      ],
      extra: 'stockBajo',
      hint: 'Revisa los materiales en rojo: están por debajo del mínimo y hay que reponerlos.'
    },

    'mensajero.html': {
      titulo: 'Tus entregas',
      metricas: [
        { label: 'entregadas hoy', color: '#00FF41',
          q: function (sb) {
            var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
            return sb.from('despachos').select('id', { count: 'exact', head: true })
                     .eq('estado', 'ENTREGADO').gte('fecha_entrega_real', hoy.toISOString());
          } },
        { label: 'pendientes por entregar', color: '#fbbf24',
          q: function (sb) { return sb.from('despachos').select('id', { count: 'exact', head: true }).in('estado', ['PROGRAMADO', 'EN_REPARTO']); } }
      ],
      hint: 'Al entregar, marca el despacho y sube la foto de evidencia. Así el caso se cierra solo.'
    },

    'taller.html': {
      titulo: 'Trabajo en taller',
      metricas: [
        { label: 'incidencias abiertas', color: '#f87171',
          q: function (sb) { return sb.from('logs_incidencias').select('id', { count: 'exact', head: true }); } }
      ],
      hint: 'Actualiza el estado de cada trabajo al terminarlo para no frenar el despacho.'
    },

    'panel-interno-operaciones.html': {
      titulo: 'Resumen de hoy',
      metricas: [
        { label: 'pedidos totales', color: '#D4AF37',
          q: function (sb) { return sb.from('pedidos').select('id', { count: 'exact', head: true }); } },
        { label: 'en producción', color: '#00d2ff',
          q: function (sb) { return sb.from('pedidos').select('id', { count: 'exact', head: true }).eq('estado', 'En Producción'); } },
        { label: 'listos para despachar', color: '#00FF41',
          q: function (sb) { return sb.from('pedidos').select('id', { count: 'exact', head: true }).eq('estado_operativo', 'LISTO_DESPACHAR'); } }
      ],
      hint: 'Si un número está en cero es porque aún no hay datos de ese tipo — no es un error.'
    }
  };

  /* ── Estilos ─────────────────────────────────────────────────── */
  var css = ''
    + '#midia{background:linear-gradient(135deg,rgba(0,210,255,.07),rgba(212,175,55,.04));'
    + 'border:1px solid rgba(255,255,255,.10);border-left:3px solid #00d2ff;border-radius:12px;'
    + 'padding:15px 18px;margin:0 0 18px;}'
    + '#midia .mt{font-size:.7rem;font-weight:800;letter-spacing:.6px;text-transform:uppercase;'
    + 'color:#94a3b8;margin-bottom:10px;}'
    + '#midia .mrow{display:flex;flex-wrap:wrap;gap:26px;}'
    + '#midia .mnum{font-size:1.7rem;font-weight:900;line-height:1;}'
    + '#midia .mlab{font-size:.72rem;color:#94a3b8;margin-top:3px;}'
    + '#midia .mhint{font-size:.78rem;color:#cbd5e1;margin-top:11px;padding-top:10px;'
    + 'border-top:1px solid rgba(255,255,255,.07);line-height:1.5;}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function getClient() {
    try { if (typeof sb !== 'undefined' && sb && sb.from) return sb; } catch (e) {}
    if (window.sb && window.sb.from) return window.sb;
    return null;
  }

  function render(cfg, valores, stockBajo) {
    var host = document.getElementById('main-content')
            || document.querySelector('main, .main, .container, .content')
            || document.body;
    var box = document.createElement('div');
    box.id = 'midia';
    var html = '<div class="mt">' + cfg.titulo + '</div><div class="mrow">';
    valores.forEach(function (v) {
      html += '<div><div class="mnum" style="color:' + v.color + '">' + v.valor + '</div>'
            + '<div class="mlab">' + v.label + '</div></div>';
    });
    if (typeof stockBajo === 'number') {
      html += '<div><div class="mnum" style="color:' + (stockBajo > 0 ? '#f87171' : '#00FF41') + '">' + stockBajo + '</div>'
            + '<div class="mlab">bajo mínimo</div></div>';
    }
    html += '</div>';
    if (cfg.hint) html += '<div class="mhint">' + cfg.hint + '</div>';
    box.innerHTML = html;

    // Colocar debajo de la tarjeta de intro si existe
    var intro = document.getElementById('pintro');
    if (intro && intro.parentNode === host) host.insertBefore(box, intro.nextSibling);
    else host.insertBefore(box, host.firstChild);
  }

  async function init() {
    var archivo = (location.pathname.split('/').pop() || 'index').toLowerCase();
    if (archivo.indexOf('.html') === -1) archivo += '.html';   // URLs limpias
    var cfg = PANELES[archivo];
    if (!cfg) return;
    var sbc = getClient();
    if (!sbc) return;

    try {
      var valores = [];
      for (var i = 0; i < cfg.metricas.length; i++) {
        var m = cfg.metricas[i];
        var r = await m.q(sbc);
        if (r && r.error) continue;               // consulta bloqueada/rota → se omite
        valores.push({ valor: (r && r.count) || 0, label: m.label, color: m.color });
      }
      var bajo;
      if (cfg.extra === 'stockBajo') {
        var inv = await sbc.from('inventario_items').select('stock_actual,stock_minimo').eq('activo', true);
        if (inv && !inv.error && Array.isArray(inv.data)) {
          bajo = inv.data.filter(function (it) {
            return it.stock_minimo != null && it.stock_actual != null && Number(it.stock_actual) <= Number(it.stock_minimo);
          }).length;
        }
      }
      if (valores.length) render(cfg, valores, bajo);
    } catch (e) { /* nunca romper el panel */ }
  }

  // Esperar a que exista el cliente Supabase (los paneles lo crean en su propio script)
  document.addEventListener('DOMContentLoaded', function () {
    var intentos = 0;
    (function esperar() {
      if (getClient()) { init(); return; }
      if (++intentos > 20) return;      // ~4s y desistimos en silencio
      setTimeout(esperar, 200);
    })();
  });
})();
