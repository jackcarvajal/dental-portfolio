/**
 * PRODIGY — Buscador global del panel (Ctrl+K / Cmd+K)
 * v1.0 · 2026-07-18
 *
 * Busca un caso por código, doctor o cliente desde CUALQUIER pantalla del
 * panel, sin tener que navegar. Muestra estado, tipo y precio, y permite
 * copiar el código o abrir el caso en la pestaña de Pedidos.
 *
 * Defensivo: si no hay cliente Supabase o la consulta falla, muestra el
 * mensaje correspondiente — nunca rompe la página.
 *
 * Uso:  <script src="../js/buscador.js?v=20260718"></script>
 */
(function () {
  'use strict';

  /* Colores de estado — mismo semáforo que el resto del panel */
  var COLOR = {
    'ENTREGADO': '#00FF41', 'QA_APROBADO': '#00FF41', 'DISENO_APROBADO': '#00FF41',
    'LISTO_DESPACHAR': '#D946A6', 'EN_REPARTO': '#f97316', 'PROGRAMADO': '#fbbf24',
    'EN_PRODUCCION': '#00d2ff', 'FRESADO_INICIADO': '#D4AF37',
    'NO_ENTREGADO': '#f87171', 'CANCELADO': '#f87171',
    'VALIDACION_PENDIENTE': '#94a3b8'
  };

  var css = ''
    + '#bg-ov{position:fixed;inset:0;z-index:100001;background:rgba(0,0,0,.72);display:none;'
    + 'align-items:flex-start;justify-content:center;padding:12vh 16px 16px;}'
    + '#bg-ov.show{display:flex;}'
    + '#bg-box{width:min(640px,100%);background:#0d0a00;border:1px solid rgba(212,175,55,.35);'
    + 'border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.75);overflow:hidden;}'
    + '#bg-inp{width:100%;background:transparent;border:none;border-bottom:1px solid rgba(255,255,255,.10);'
    + 'padding:16px 18px;color:#f5f5f7;font-size:1rem;outline:none;font-family:inherit;}'
    + '#bg-inp::placeholder{color:#64748b;}'
    + '#bg-res{max-height:52vh;overflow:auto;}'
    + '#bg-res .r{display:flex;gap:12px;align-items:center;padding:11px 18px;cursor:pointer;'
    + 'border-bottom:1px solid rgba(255,255,255,.05);}'
    + '#bg-res .r:hover,#bg-res .r.sel{background:rgba(212,175,55,.10);}'
    + '#bg-res .cod{font-family:ui-monospace,Menlo,monospace;font-weight:800;color:#D4AF37;font-size:.85rem;min-width:92px;}'
    + '#bg-res .who{flex:1;min-width:0;}'
    + '#bg-res .who b{display:block;font-size:.86rem;color:#f5f5f7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'
    + '#bg-res .who span{font-size:.74rem;color:#94a3b8;}'
    + '#bg-res .est{font-size:.68rem;font-weight:800;padding:3px 9px;border-radius:20px;white-space:nowrap;}'
    + '#bg-msg{padding:22px 18px;color:#94a3b8;font-size:.86rem;text-align:center;}'
    + '#bg-foot{padding:9px 18px;border-top:1px solid rgba(255,255,255,.07);font-size:.7rem;color:#64748b;'
    + 'display:flex;gap:14px;flex-wrap:wrap;}'
    + '#bg-foot kbd{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);'
    + 'border-radius:4px;padding:1px 5px;font-family:ui-monospace,monospace;}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var ov, inp, res, sel = -1, filas = [], timer;

  function client() {
    try { if (typeof sb !== 'undefined' && sb && sb.from) return sb; } catch (e) {}
    return (window.sb && window.sb.from) ? window.sb : null;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function abrir() {
    ov.classList.add('show');
    inp.value = ''; res.innerHTML = '';
    document.getElementById('bg-msg').textContent = 'Escribe un código, doctor o cliente…';
    document.getElementById('bg-msg').style.display = 'block';
    setTimeout(function () { inp.focus(); }, 30);
  }
  function cerrar() { ov.classList.remove('show'); sel = -1; filas = []; }

  async function buscar(q) {
    var msg = document.getElementById('bg-msg');
    var sbc = client();
    if (!sbc) { res.innerHTML = ''; msg.style.display = 'block'; msg.textContent = 'No se pudo conectar a la base de datos.'; return; }
    if (q.length < 2) { res.innerHTML = ''; msg.style.display = 'block'; msg.textContent = 'Escribe al menos 2 caracteres…'; return; }

    msg.style.display = 'block'; msg.textContent = 'Buscando…'; res.innerHTML = '';
    try {
      var like = '%' + q.replace(/[%,]/g, '') + '%';
      var r = await sbc.from('pedidos')
        .select('id,codigo,nombre_doctor,nombre_cliente,tipo_trabajo,estado,estado_operativo,precio_total,created_at')
        .or('codigo.ilike.' + like + ',nombre_doctor.ilike.' + like + ',nombre_cliente.ilike.' + like)
        .order('created_at', { ascending: false })
        .limit(20);

      if (r.error) { msg.textContent = 'No se pudo buscar: ' + r.error.message; return; }
      filas = r.data || [];
      if (!filas.length) { msg.textContent = 'Sin resultados para “' + q + '”.'; return; }

      msg.style.display = 'none';
      res.innerHTML = filas.map(function (p, i) {
        var e = p.estado_operativo || p.estado || '—';
        var c = COLOR[e] || '#94a3b8';
        var quien = p.nombre_doctor || p.nombre_cliente || 'Sin nombre';
        var detalle = [p.tipo_trabajo, p.precio_total ? ('$' + Number(p.precio_total).toLocaleString('es-CO')) : null]
                      .filter(Boolean).join(' · ');
        return '<div class="r" data-i="' + i + '">'
          + '<div class="cod">' + esc(p.codigo || '—') + '</div>'
          + '<div class="who"><b>' + esc(quien) + '</b><span>' + esc(detalle) + '</span></div>'
          + '<div class="est" style="color:' + c + ';background:' + c + '1f;">' + esc(e) + '</div></div>';
      }).join('');
      sel = -1;
    } catch (err) {
      msg.style.display = 'block'; msg.textContent = 'Error al buscar.';
    }
  }

  function elegir(i) {
    var p = filas[i]; if (!p) return;
    // Si estamos en el panel admin, ir a Pedidos; si no, copiar el código
    try {
      if (typeof switchTab === 'function' && document.getElementById('tab-pedidos')) {
        var nav = document.querySelector('.nav-item[onclick*="pedidos"]');
        switchTab('pedidos', nav || null);
        cerrar();
        if (typeof toast === 'function') toast('Buscando ' + (p.codigo || '') + ' en Pedidos', 'success');
        return;
      }
    } catch (e) {}
    try { navigator.clipboard.writeText(p.codigo || ''); } catch (e) {}
    cerrar();
    if (typeof toast === 'function') toast('Código ' + (p.codigo || '') + ' copiado', 'success');
  }

  function marcar() {
    var rs = res.querySelectorAll('.r');
    rs.forEach(function (el, i) { el.classList.toggle('sel', i === sel); });
    if (rs[sel]) rs[sel].scrollIntoView({ block: 'nearest' });
  }

  document.addEventListener('DOMContentLoaded', function () {
    ov = document.createElement('div'); ov.id = 'bg-ov';
    ov.innerHTML = '<div id="bg-box" role="dialog" aria-label="Buscador de casos">'
      + '<input id="bg-inp" type="search" autocomplete="off" placeholder="Buscar caso por código, doctor o cliente…" aria-label="Buscar">'
      + '<div id="bg-msg"></div><div id="bg-res"></div>'
      + '<div id="bg-foot"><span><kbd>↑</kbd><kbd>↓</kbd> moverse</span><span><kbd>Enter</kbd> abrir</span>'
      + '<span><kbd>Esc</kbd> cerrar</span><span><kbd>Ctrl</kbd>+<kbd>K</kbd> abrir buscador</span></div></div>';
    document.body.appendChild(ov);
    inp = document.getElementById('bg-inp');
    res = document.getElementById('bg-res');

    ov.addEventListener('click', function (e) { if (e.target === ov) cerrar(); });
    inp.addEventListener('input', function () {
      clearTimeout(timer); var q = inp.value.trim();
      timer = setTimeout(function () { buscar(q); }, 260);
    });
    res.addEventListener('click', function (e) {
      var r = e.target.closest('.r'); if (r) elegir(parseInt(r.getAttribute('data-i'), 10));
    });

    document.addEventListener('keydown', function (e) {
      var k = (e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 'k') { e.preventDefault(); ov.classList.contains('show') ? cerrar() : abrir(); return; }
      if (!ov.classList.contains('show')) return;
      if (k === 'escape') { cerrar(); }
      else if (k === 'arrowdown') { e.preventDefault(); sel = Math.min(sel + 1, filas.length - 1); marcar(); }
      else if (k === 'arrowup') { e.preventDefault(); sel = Math.max(sel - 1, 0); marcar(); }
      else if (k === 'enter' && sel >= 0) { e.preventDefault(); elegir(sel); }
    });

    /* Botón discreto en la barra lateral, para quien no sepa el atajo */
    var side = document.getElementById('sidebar');
    if (side) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-tip', 'Busca un caso por código, doctor o cliente desde cualquier pantalla. Atajo: Ctrl+K');
      b.style.cssText = 'margin:10px 14px;padding:9px 12px;width:calc(100% - 28px);background:rgba(255,255,255,.05);'
        + 'border:1px solid rgba(255,255,255,.12);border-radius:9px;color:#94a3b8;font-size:.78rem;cursor:pointer;'
        + 'display:flex;align-items:center;justify-content:space-between;gap:8px;font-family:inherit;';
      b.innerHTML = '<span>&#128269; Buscar caso…</span><span style="font-size:.66rem;opacity:.7;">Ctrl+K</span>';
      b.addEventListener('click', abrir);
      var first = side.querySelector('.nav-section') || side.firstElementChild;
      side.insertBefore(b, first ? first.nextSibling : null);
    }
  });

  window.BuscadorGlobal = { abrir: function () { ov && abrir(); } };
})();
