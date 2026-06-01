/**
 * PRODIGY — Notificaciones internas por rol + cliente
 * Uso staff:   _notifInit(sb, 'diseno', 'operario')
 * Uso cliente: _notifInit(sb, null, null, true)  ← modo cliente
 */
(function(){
'use strict';

const PRIO_COLOR = { alta:'#ef4444', media:'#fbbf24', baja:'#475569' };
const PRIO_ICON  = { alta:'fa-triangle-exclamation', media:'fa-bell', baja:'fa-circle-info' };
const TIPO_ICON  = {
  nuevo_caso:'fa-file-medical', estado_cambio:'fa-arrows-rotate',
  urgente:'fa-bolt', pago:'fa-credit-card', churn:'fa-user-minus',
  cotizacion:'fa-receipt'
};

let _notifs  = [];
let _unread  = 0;
let _uid     = null;
let _dept    = null;
let _rol     = null;
let _sb      = null;
let _channel = null;
let _modoCliente = false;

/* ── Init ── */
window._notifInit = async function(sb, dept, rol, modoCliente) {
  _sb          = sb;
  _dept        = dept || null;
  _rol         = rol  || null;
  _modoCliente = !!modoCliente;
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;
  _uid = session.user.id;
  _injectUI();
  await _loadNotifs();
  _subscribeRealtime();
};

/* ── Inyectar UI en el DOM ── */
function _injectUI() {
  if (document.getElementById('_notif-btn')) return;

  const css = `
    #_notif-btn{position:fixed;top:12px;right:56px;z-index:9000;background:rgba(13,21,32,.85);border:1px solid rgba(255,255,255,.1);border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(8px);transition:border-color .2s;}
    #_notif-btn:hover{border-color:rgba(217,70,166,.5);}
    #_notif-badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;border-radius:50%;width:18px;height:18px;font-size:.65rem;font-weight:800;display:none;align-items:center;justify-content:center;border:2px solid #050505;}
    #_notif-panel{position:fixed;top:58px;right:12px;z-index:9001;width:320px;max-height:480px;background:rgba(13,21,32,.97);border:1px solid rgba(255,255,255,.12);border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.6);backdrop-filter:blur(16px);display:none;flex-direction:column;}
    #_notif-panel.open{display:flex;}
    ._np-head{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between;}
    ._np-head h3{font-size:.82rem;font-weight:800;color:#fff;margin:0;}
    ._np-mark{font-size:.7rem;color:#D946A6;cursor:pointer;font-weight:700;}
    ._np-mark:hover{text-decoration:underline;}
    ._np-list{overflow-y:auto;flex:1;}
    ._np-item{padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.04);display:flex;gap:10px;cursor:pointer;transition:background .15s;}
    ._np-item:hover{background:rgba(255,255,255,.03);}
    ._np-item.nueva{background:rgba(217,70,166,.04);}
    ._np-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px;}
    ._np-body{flex:1;}
    ._np-titulo{font-size:.78rem;font-weight:700;color:#e2e8f0;line-height:1.3;margin-bottom:2px;}
    ._np-msg{font-size:.72rem;color:#94a3b8;line-height:1.4;}
    ._np-time{font-size:.65rem;color:#475569;margin-top:4px;}
    ._np-empty{padding:24px;text-align:center;color:#475569;font-size:.78rem;}
    ._np-foot{padding:10px 16px;border-top:1px solid rgba(255,255,255,.06);text-align:center;}
    ._np-foot a{font-size:.72rem;color:#D946A6;text-decoration:none;font-weight:700;}
    @media(prefers-reduced-motion:reduce){#_notif-panel{transition:none;}}
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const btn = document.createElement('button');
  btn.id = '_notif-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Notificaciones');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', '_notif-panel');
  btn.innerHTML = `<i class="fas fa-bell" style="color:#94a3b8;font-size:.9rem;" aria-hidden="true"></i>
    <span id="_notif-badge" aria-live="polite" aria-atomic="true"></span>`;
  btn.onclick = _togglePanel;
  document.body.appendChild(btn);

  const panel = document.createElement('div');
  panel.id = '_notif-panel';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label','Notificaciones internas');
  panel.innerHTML = `
    <div class="_np-head">
      <h3><i class="fas fa-bell" aria-hidden="true"></i> Notificaciones</h3>
      <span class="_np-mark" onclick="_notifMarcarLeidas()" role="button" tabindex="0">Marcar todas leídas</span>
    </div>
    <div class="_np-list" id="_notif-list" aria-live="polite"><div class="_np-empty">Cargando…</div></div>
    <div class="_np-foot"><a href="/app/operario.html">Ver todos los casos →</a></div>`;
  document.body.appendChild(panel);

  // Cerrar al click fuera
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !panel.contains(e.target)) {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
    }
  });
}

/* ── Toggle panel ── */
function _togglePanel() {
  const panel = document.getElementById('_notif-panel');
  const btn   = document.getElementById('_notif-btn');
  const open  = panel.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(open));
  if (open) _renderList();
}

/* ── Cargar notificaciones ── */
async function _loadNotifs() {
  try {
    let data;
    if (_modoCliente && _uid) {
      // Cliente: query directa por user_id
      const { data: rows } = await _sb
        .from('notificaciones_internas')
        .select('id,created_at,tipo,prioridad,titulo,mensaje,pedido_codigo,accion_url,leida_por')
        .eq('destinatario_user_id', _uid)
        .order('created_at', { ascending: false })
        .limit(15);
      data = (rows||[]).map(n => ({...n, es_nueva: !Array.isArray(n.leida_por) || !n.leida_por.includes(_uid)}));
    } else {
      // Staff: RPC
      const { data: rows } = await _sb.rpc('prodigy_mis_notifs', { p_dept:_dept, p_rol:_rol, p_limit:15 });
      data = rows || [];
    }
    _notifs = data || [];
    _unread = _notifs.filter(n => n.es_nueva).length;
    _updateBadge();
    _renderList();
  } catch(e) { /* silencioso hasta que el SQL esté ejecutado */ }
}

/* ── Actualizar badge ── */
function _updateBadge() {
  const badge = document.getElementById('_notif-badge');
  const icon  = document.querySelector('#_notif-btn i');
  if (!badge) return;
  if (_unread > 0) {
    badge.textContent = _unread > 9 ? '9+' : String(_unread);
    badge.style.display = 'flex';
    if (icon) icon.style.color = '#D946A6';
  } else {
    badge.style.display = 'none';
    if (icon) icon.style.color = '#94a3b8';
  }
}

/* ── Renderizar lista ── */
function _renderList() {
  const el = document.getElementById('_notif-list');
  if (!el) return;
  if (!_notifs.length) {
    el.innerHTML = '<div class="_np-empty"><i class="fas fa-check-circle" style="color:#00FF41;font-size:1.5rem;display:block;margin-bottom:8px;" aria-hidden="true"></i>Sin notificaciones pendientes</div>';
    return;
  }
  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const fmtT = d => {
    const diff = Date.now()-new Date(d).getTime();
    if (diff<60000) return 'Ahora';
    if (diff<3600000) return Math.floor(diff/60000)+'m';
    if (diff<86400000) return Math.floor(diff/3600000)+'h';
    return Math.floor(diff/86400000)+'d';
  };
  el.innerHTML = _notifs.map(n => `
    <div class="_np-item${n.es_nueva?' nueva':''}" onclick="_notifIr('${esc(n.accion_url||'')}','${esc(n.id)}')" role="button" tabindex="0">
      <div class="_np-dot" style="background:${PRIO_COLOR[n.prioridad]||'#475569'};"></div>
      <div class="_np-body">
        <div class="_np-titulo"><i class="fas ${TIPO_ICON[n.tipo]||'fa-bell'}" style="margin-right:5px;color:${PRIO_COLOR[n.prioridad]||'#475569'}" aria-hidden="true"></i>${esc(n.titulo)}</div>
        <div class="_np-msg">${esc(n.mensaje)}</div>
        <div class="_np-time">${fmtT(n.created_at)}${n.pedido_codigo?' · #'+esc(n.pedido_codigo):''}</div>
      </div>
    </div>`).join('');
}

/* ── Ir a recurso y marcar leída ── */
window._notifIr = async function(url, notifId) {
  if (notifId && _uid) {
    try {
      await _sb.from('notificaciones_internas')
        .update({ leida_por: _sb.rpc('array_append', { arr: [], el: _uid }) })
        .eq('id', notifId);
    } catch(_){}
  }
  if (url) window.location.href = url;
};

/* ── Marcar todas leídas ── */
window._notifMarcarLeidas = async function() {
  if (!_uid) return;
  try {
    if (_modoCliente) {
      // Cliente: actualizar leida_por en sus notificaciones directamente
      const ids = _notifs.filter(n=>n.es_nueva).map(n=>n.id);
      if (ids.length) {
        await _sb.from('notificaciones_internas')
          .update({ leida_por: _sb.sql`array_append(leida_por, ${_uid}::uuid)` })
          .in('id', ids);
      }
    } else {
      await _sb.rpc('prodigy_marcar_notifs_leidas', { p_user_id: _uid });
    }
    _notifs = _notifs.map(n => ({...n, es_nueva: false}));
    _unread = 0;
    _updateBadge();
    _renderList();
  } catch(e){}
};

/* ── Realtime ── */
function _subscribeRealtime() {
  if (_channel) return;
  const channelName = _modoCliente ? `notif-cliente-${_uid}` : 'notif-staff-live';
  _channel = _sb.channel(channelName)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'notificaciones_internas'}, async (payload) => {
      const n = payload.new;
      let meDirige = false;
      if (_modoCliente) {
        // cliente solo ve sus propias notificaciones
        meDirige = n.destinatario_user_id === _uid;
      } else {
        // staff: por dept, rol o broadcast
        meDirige = (!n.destinatario_dept || n.destinatario_dept === _dept)
                && (!n.destinatario_rol  || n.destinatario_rol  === _rol || _rol === 'admin' || _rol === 'superadmin')
                && !n.destinatario_user_id; // no son notifs de cliente
      }
      if (!meDirige) return;
      _notifToast(n);
      await _loadNotifs();
    })
    .subscribe();
}

/* ── Toast de notificación ── */
function _notifToast(n) {
  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const color = PRIO_COLOR[n.prioridad] || '#94a3b8';
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;bottom:24px;right:16px;z-index:9999;background:rgba(13,21,32,.97);border:1px solid ${color};border-left:4px solid ${color};border-radius:10px;padding:12px 16px;max-width:300px;box-shadow:0 10px 40px rgba(0,0,0,.5);backdrop-filter:blur(12px);animation:_notifSlide .3s ease;`;
  toast.innerHTML = `<div style="font-size:.78rem;font-weight:800;color:#fff;margin-bottom:3px;"><i class="fas ${TIPO_ICON[n.tipo]||'fa-bell'}" style="margin-right:6px;color:${color}" aria-hidden="true"></i>${esc(n.titulo)}</div><div style="font-size:.7rem;color:#94a3b8;">${esc((n.mensaje||'').slice(0,80))}</div>`;
  if (!document.getElementById('_notif-slide-css')) {
    const s=document.createElement('style');s.id='_notif-slide-css';
    s.textContent='@keyframes _notifSlide{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}';
    document.head.appendChild(s);
  }
  document.body.appendChild(toast);
  setTimeout(()=>{ toast.style.transition='opacity .4s'; toast.style.opacity='0'; setTimeout(()=>toast.remove(),400); },5000);
}

})();
