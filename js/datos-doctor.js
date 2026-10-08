/* ── Datos del doctor en los flujos de pedido (oct-2026) ─────────────────────────────────────────────────────────
   · Muestra su código de cliente (DR-####) arriba de sus datos: así se relaciona con su número.
   · Los flujos ya llenan los datos desde su cuenta (doctores_perfil). Si el doctor cambia su WhatsApp, su ciudad o su
     especialidad, se le pregunta si quiere que sean sus datos predeterminados de ahora en adelante: «Sí» actualiza su
     propio perfil (RLS doctor_own_profile); «No» los usa solo en este pedido y no vuelve a preguntar por ese valor.
   · Solo para doctores con perfil: el equipo (sin perfil) no ve nada. Todo el texto entra con textContent. */
(function () {
  'use strict';
  if (window.__datosDoctor) return; window.__datosDoctor = 1;
  // [id del campo, columna del perfil, cómo se nombra en el aviso]
  var CAMPOS = [['whatsappCliente', 'whatsapp', 'tu WhatsApp'], ['ciudad', 'municipio', 'tu ciudad'], ['especialidad', 'especialidad', 'tu especialidad']];
  function $(id) { return document.getElementById(id); }
  function waActual() {
    var w = $('whatsappCliente'), d = w ? String(w.value || '').replace(/\D/g, '') : '';
    if (!d) return '';
    var ind = $('indicativo'); return (ind && ind.value ? ind.value : '+57') + d;
  }
  function valor(id) { return id === 'whatsappCliente' ? waActual() : String(($(id) || {}).value || '').trim(); }
  // WhatsApp: se comparan los dígitos (el perfil puede tenerlo con o sin indicativo)
  function igual(col, a, b) {
    a = String(a || ''); b = String(b || '');
    if (col !== 'whatsapp') return a.trim().toLowerCase() === b.trim().toLowerCase();
    a = a.replace(/\D/g, ''); b = b.replace(/\D/g, '');
    if (!a || !b) return a === b;
    var corto = a.length < b.length ? a : b, largo = corto === a ? b : a;
    return corto.length >= 7 && largo.slice(-corto.length) === corto;
  }
  function lista(a) { return a.length < 2 ? a[0] : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1]; }
  function seccion() { var n = $('nombreCliente'); return n && (n.closest('.accordion-inner') || n.closest('.accordion-content') || n.parentElement); }
  function estilos() {
    if ($('dd-css')) return;
    var st = document.createElement('style'); st.id = 'dd-css';
    st.textContent = '.dd-codigo{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;margin:0 0 14px;padding:10px 14px;border:1px solid rgba(212,175,55,.35);border-radius:10px;background:rgba(212,175,55,.06);font-size:.85rem;color:#cbd5e1}' +
      '.dd-codigo b{color:#D4AF37;font-size:1.05rem;letter-spacing:.5px}.dd-codigo small{flex-basis:100%;color:#94a3b8;font-size:.75rem}' +
      '.dd-aviso{margin-top:12px;padding:12px 14px;border:1px solid rgba(0,210,255,.35);border-radius:10px;background:rgba(0,210,255,.06);font-size:.85rem;color:#e2e8f0}' +
      '.dd-aviso p{margin:0 0 8px}.dd-aviso .dd-bt{display:flex;gap:8px;flex-wrap:wrap}' +
      '.dd-aviso button{padding:8px 14px;border-radius:8px;font:inherit;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,.18);background:#1a2332;color:#e2e8f0}' +
      '.dd-aviso button[data-si]{background:#00d2ff;border-color:#00d2ff;color:#050505}.dd-aviso button:focus-visible{outline:2px solid #D4AF37;outline-offset:2px}' +
      '.dd-aviso[hidden],.dd-aviso .dd-bt[hidden]{display:none}';
    document.head.appendChild(st);
  }
  function iniciar(sb) {
    sb.auth.getSession().then(function (r) {
      var s = r && r.data && r.data.session; if (!s) return;
      var uid = s.user.id;
      sb.from('doctores_perfil').select('municipio,whatsapp,especialidad,codigo_cliente').eq('id', uid).maybeSingle().then(function (p) {
        var perfil = p && p.data, sec = seccion(); if (!perfil || !sec) return;
        estilos();
        window.PRODIGY_CODIGO = perfil.codigo_cliente || null;   // va también en el mensaje de WhatsApp del pedido
        if (perfil.codigo_cliente && !$('dd-codigo')) {
          var c = document.createElement('div'); c.id = 'dd-codigo'; c.className = 'dd-codigo';
          c.innerHTML = '<span>Tu código de cliente</span> <b></b><small>Es tu número con el laboratorio: menciónalo al escribirnos y te identificamos al instante.</small>';
          c.querySelector('b').textContent = perfil.codigo_cliente;
          sec.insertBefore(c, sec.firstChild);
        }
        var base = {}, descartado = {};
        CAMPOS.forEach(function (k) { base[k[1]] = perfil[k[1]] || ''; });
        var aviso = document.createElement('div'); aviso.id = 'dd-aviso'; aviso.className = 'dd-aviso'; aviso.hidden = true; aviso.setAttribute('role', 'status');
        aviso.innerHTML = '<p></p><div class="dd-bt"><button type="button" data-si>Sí, guardar en mi cuenta</button><button type="button" data-no>No, solo para este pedido</button></div>';
        sec.appendChild(aviso);
        var txt = aviso.querySelector('p'), bts = aviso.querySelector('.dd-bt'), cambios = [];
        function revisar() {
          cambios = CAMPOS.filter(function (k) { var v = valor(k[0]); return v && !igual(k[1], base[k[1]], v) && !(k[1] in descartado && igual(k[1], descartado[k[1]], v)); });
          if (!cambios.length) { aviso.hidden = true; return; }
          var n = cambios.length > 1;
          txt.textContent = 'Cambiaste ' + lista(cambios.map(function (k) { return k[2]; })) + '. ¿Quieres que ' + (n ? 'sean tus datos predeterminados' : 'sea tu dato predeterminado') + ' de ahora en adelante?';
          bts.hidden = false; aviso.hidden = false;
        }
        aviso.querySelector('[data-si]').onclick = function () {
          var upd = {}; cambios.forEach(function (k) { upd[k[1]] = valor(k[0]); });
          sb.from('doctores_perfil').update(upd).eq('id', uid).then(function (res) {
            bts.hidden = true;
            if (res && res.error) { txt.textContent = 'No se pudo guardar en tu cuenta ahora; se usarán solo en este pedido.'; return; }
            Object.keys(upd).forEach(function (col) { base[col] = upd[col]; });
            txt.textContent = 'Listo: tus datos quedaron actualizados para los próximos pedidos.';
            setTimeout(function () { aviso.hidden = true; }, 4000);
          });
        };
        aviso.querySelector('[data-no]').onclick = function () { cambios.forEach(function (k) { descartado[k[1]] = valor(k[0]); }); aviso.hidden = true; };
        CAMPOS.forEach(function (k) { var e = $(k[0]); if (e) e.addEventListener('change', revisar); });
        var ind = $('indicativo'); if (ind) ind.addEventListener('change', revisar);
      });
    });
  }
  var intentos = 0;
  function go() {
    var sb = window.sb || (window.supabase && window.ProdigyAuth && window.ProdigyAuth.getSb && window.ProdigyAuth.getSb());
    if (sb) iniciar(sb); else if (++intentos < 30) setTimeout(go, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
