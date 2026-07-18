/**
 * PRODIGY — Historial de actividad (quién hizo qué y cuándo)
 * v1.0 · 2026-07-18
 *
 * El panel ya registraba cada acción con _auditLog() en `logs_incidencias`,
 * pero nadie podía verlo. Esto lo muestra en lenguaje claro:
 *   "Cambió el estado del pedido ABC-123 · Alejandro · hace 2 h"
 *
 * - Botón "Actividad" en la barra lateral.
 * - Se puede filtrar por caso:  window.verHistorial('caso-123')
 *
 * Defensivo: si la consulta falla, muestra el motivo y nunca rompe el panel.
 *
 * Uso:  <script src="../js/historial.js?v=20260718"></script>
 */
(function () {
  'use strict';

  /* Acción técnica -> frase entendible */
  var ACCIONES = {
    'CAMBIAR_ESTADO':                 'Cambió el estado de un pedido',
    'CAMBIAR_ESTADO_PEDIDO_DOCTOR':   'Cambió el estado de un pedido de doctor',
    'CAMBIAR_ESTADO_REFERIDO':        'Cambió el estado de un referido',
    'CAMBIAR_ROL_STAFF':              'Cambió el rol de un miembro del equipo',
    'CONFIRMAR_PAGO_FABRICACION':     'Confirmó un pago de fabricación',
    'DELETE_CASO_PORTAFOLIO':         'Eliminó un caso del portafolio',
    'EDITAR_CASO_PORTAFOLIO':         'Editó un caso del portafolio',
    'PUBLICAR_CASO_PORTAFOLIO':       'Publicó un caso en el portafolio',
    'OCULTAR_CASO_PORTAFOLIO':        'Ocultó un caso del portafolio',
    'ELIMINAR_REFERIDO':              'Eliminó un referido',
    'ELIMINAR_WAITLIST':              'Eliminó un registro de la lista de espera',
    'TOGGLE_DEPARTAMENTO_STAFF':      'Cambió el departamento de un operario',
    'TOGGLE_PERFIL_ACTIVO':           'Activó o desactivó un perfil',
    'TOGGLE_STAFF_ACTIVO':            'Activó o desactivó a un miembro del equipo'
  };

  var css = ''
    + '#hist-ov{position:fixed;inset:0;z-index:100002;background:rgba(0,0,0,.72);display:none;'
    + 'align-items:center;justify-content:center;padding:16px;}'
    + '#hist-ov.show{display:flex;}'
    + '#hist-box{width:min(680px,100%);max-height:82vh;display:flex;flex-direction:column;'
    + 'background:#0d0a00;border:1px solid rgba(212,175,55,.35);border-radius:14px;overflow:hidden;'
    + 'box-shadow:0 20px 60px rgba(0,0,0,.75);}'
    + '#hist-head{display:flex;align-items:center;justify-content:space-between;gap:12px;'
    + 'padding:15px 18px;border-bottom:1px solid rgba(255,255,255,.08);}'
    + '#hist-head h3{margin:0;font-size:1rem;color:#fff;}'
    + '#hist-head .sub{font-size:.74rem;color:#94a3b8;margin-top:2px;}'
    + '#hist-close{background:none;border:none;color:#94a3b8;font-size:1.4rem;cursor:pointer;line-height:1;}'
    + '#hist-list{overflow:auto;padding:6px 0;}'
    + '#hist-list .h{display:flex;gap:12px;padding:11px 18px;border-bottom:1px solid rgba(255,255,255,.05);}'
    + '#hist-list .dot{width:8px;height:8px;border-radius:50%;background:#D4AF37;margin-top:6px;flex:0 0 8px;}'
    + '#hist-list .txt{flex:1;min-width:0;}'
    + '#hist-list .acc{font-size:.85rem;color:#f5f5f7;font-weight:600;}'
    + '#hist-list .meta{font-size:.72rem;color:#94a3b8;margin-top:2px;}'
    + '#hist-list .ref{font-family:ui-monospace,Menlo,monospace;color:#00d2ff;}'
    + '#hist-msg{padding:26px 18px;text-align:center;color:#94a3b8;font-size:.86rem;}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function client() {
    try { if (typeof sb !== 'undefined' && sb && sb.from) return sb; } catch (e) {}
    return (window.sb && window.sb.from) ? window.sb : null;
  }
  function hace(iso) {
    if (!iso) return '';
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return 'hace un momento';
    if (s < 3600) return 'hace ' + Math.floor(s / 60) + ' min';
    if (s < 86400) return 'hace ' + Math.floor(s / 3600) + ' h';
    var d = Math.floor(s / 86400);
    if (d < 30) return 'hace ' + d + (d === 1 ? ' día' : ' días');
    return new Date(iso).toLocaleDateString('es-CO');
  }

  /* "[AUDIT] ACCION por email: {json}" -> partes legibles */
  function parsear(desc) {
    var m = /^\[AUDIT\]\s+([A-Z_]+)\s+por\s+([^:]+):\s*(.*)$/.exec(desc || '');
    if (!m) return null;
    var accion = m[1], quien = (m[2] || '').trim(), json = m[3];
    var ref = '';
    try {
      var o = JSON.parse(json);
      var k = Object.keys(o)[0];
      if (k) ref = String(o[k]);
    } catch (e) {}
    return { accion: ACCIONES[accion] || accion.replace(/_/g, ' ').toLowerCase(), quien: quien, ref: ref };
  }

  var ov, list, msg, sub;

  async function cargar(filtro) {
    var sbc = client();
    list.innerHTML = '';
    msg.style.display = 'block'; msg.textContent = 'Cargando actividad…';
    sub.textContent = filtro ? ('Filtrado por: ' + filtro) : 'Últimas acciones del equipo';
    if (!sbc) { msg.textContent = 'No se pudo conectar a la base de datos.'; return; }
    try {
      var q = sbc.from('logs_incidencias')
        .select('descripcion,created_at')
        .eq('tipo', 'ADMIN_ACTION')
        .order('created_at', { ascending: false })
        .limit(60);
      if (filtro) q = q.ilike('descripcion', '%' + String(filtro).replace(/[%,]/g, '') + '%');
      var r = await q;
      if (r.error) { msg.textContent = 'No se pudo cargar: ' + r.error.message; return; }
      var filas = (r.data || []).map(function (x) {
        var p = parsear(x.descripcion); if (!p) return null;
        p.cuando = x.created_at; return p;
      }).filter(Boolean);

      if (!filas.length) {
        msg.textContent = filtro
          ? 'Sin movimientos registrados para eso.'
          : 'Aún no hay actividad registrada. Aquí verás quién cambió qué y cuándo.';
        return;
      }
      msg.style.display = 'none';
      list.innerHTML = filas.map(function (f) {
        return '<div class="h"><div class="dot"></div><div class="txt">'
          + '<div class="acc">' + esc(f.accion) + (f.ref ? ' <span class="ref">' + esc(f.ref) + '</span>' : '') + '</div>'
          + '<div class="meta">' + esc(f.quien) + ' · ' + esc(hace(f.cuando)) + '</div>'
          + '</div></div>';
      }).join('');
    } catch (e) {
      msg.style.display = 'block'; msg.textContent = 'Error al cargar la actividad.';
    }
  }

  function abrir(filtro) { ov.classList.add('show'); cargar(filtro || null); }
  function cerrar() { ov.classList.remove('show'); }

  document.addEventListener('DOMContentLoaded', function () {
    ov = document.createElement('div'); ov.id = 'hist-ov';
    ov.innerHTML = '<div id="hist-box" role="dialog" aria-label="Historial de actividad">'
      + '<div id="hist-head"><div><h3>Actividad reciente</h3><div class="sub"></div></div>'
      + '<button id="hist-close" type="button" aria-label="Cerrar">&times;</button></div>'
      + '<div id="hist-msg"></div><div id="hist-list"></div></div>';
    document.body.appendChild(ov);
    list = document.getElementById('hist-list');
    msg = document.getElementById('hist-msg');
    sub = ov.querySelector('.sub');

    document.getElementById('hist-close').addEventListener('click', cerrar);
    ov.addEventListener('click', function (e) { if (e.target === ov) cerrar(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ov.classList.contains('show')) cerrar();
    });

    /* Botón en la barra lateral */
    var side = document.getElementById('sidebar');
    if (side) {
      var b = document.createElement('button');
      b.type = 'button';
      b.id = 'hist-side-btn';
      b.setAttribute('data-tip', 'Ver quién hizo cada cambio en el panel y cuándo. Sirve para saber qué pasó con un caso.');
      b.style.cssText = 'margin:0 14px 10px;padding:9px 12px;width:calc(100% - 28px);background:rgba(255,255,255,.05);'
        + 'border:1px solid rgba(255,255,255,.12);border-radius:9px;color:#94a3b8;font-size:.78rem;cursor:pointer;'
        + 'display:flex;align-items:center;gap:8px;font-family:inherit;';
      b.innerHTML = '<span>&#128339;</span><span>Actividad reciente</span>';
      b.addEventListener('click', function () { abrir(null); });
      var ref = side.querySelector('.nav-section') || side.firstElementChild;
      side.insertBefore(b, ref ? ref.nextSibling : null);
    }
  });

  /* API pública: window.verHistorial('caso-123') filtra por ese caso */
  window.verHistorial = function (filtro) { if (ov) abrir(filtro); };
})();
