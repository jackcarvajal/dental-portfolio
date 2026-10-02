/* pulso-lab.js — «Pulso del laboratorio»: el flujo de casos EN VIVO en el panel interno.
 * Inspirado en un componente React de «pipeline de agentes» (framer-motion + Tailwind), rehecho en vanilla JS +
 * SVG (sin React ni build, ARCHITECTURE.md §1) y con datos REALES:
 *   · cuántos casos hay en cada etapa (pedidos.estado_operativo; mismas etapas que js/caso-etapas.js)
 *   · los últimos cambios de etapa (pedido_bitacora) pasando como un teletipo
 *   · esperando al doctor, WhatsApp por enviar (avisos_whatsapp) y atrasados (casos_atrasados)
 * Los puntos solo corren por un tramo si hay casos en él. Quieto con «reducir movimiento». Se actualiza cada 60 s.
 * Uso: <div id="pulso-lab"></div> + <script src="../js/pulso-lab.js?v=..." defer></script> (necesita window.sb).
 */
(function () {
  'use strict';
  var BUCKET = {
    recepcion:  ['', 'VALIDACION_PENDIENTE', 'ERROR_STL', 'PAGO_NO_CONFIRMADO', 'INCIDENCIA_CLIENTE'],
    diseno:     ['EN_DISENO', 'DISENO_FINALIZADO', 'REVISION_CLIENTE', 'CAMBIOS_SOLICITADOS'],
    produccion: ['DISENO_APROBADO', 'FAB_COTIZACION', 'FAB_CONFIRMADA', 'EN_PRODUCCION', 'FRESADO_INICIADO', 'EN_IMPRESION', 'EN_ACABADO', 'QA_APROBADO'],
    despacho:   ['LISTO_DESPACHAR', 'POR_DESPACHAR', 'TERMINADO'],
    camino:     ['EN_REPARTO', 'NO_ENTREGADO']
  };
  var ESPERA_DR = ['REVISION_CLIENTE', 'ERROR_STL', 'PAGO_NO_CONFIRMADO', 'INCIDENCIA_CLIENTE', 'FAB_COTIZACION'];
  var NOMBRE = { '': 'Recibido', VALIDACION_PENDIENTE: 'Validación', ERROR_STL: 'Archivos con error', PAGO_NO_CONFIRMADO: 'Pago por confirmar',
    INCIDENCIA_CLIENTE: 'Pregunta al doctor', EN_DISENO: 'Diseño', DISENO_FINALIZADO: 'Revisión interna', REVISION_CLIENTE: 'Revisión del doctor',
    CAMBIOS_SOLICITADOS: 'Cambios', DISENO_APROBADO: 'Diseño aprobado', FAB_COTIZACION: 'Cotización de fabricación', FAB_CONFIRMADA: 'Fabricación', EN_PRODUCCION: 'Producción',
    FRESADO_INICIADO: 'Fresado', EN_IMPRESION: 'Impresión', EN_ACABADO: 'Terminado y maquillaje', QA_APROBADO: 'Calidad',
    LISTO_DESPACHAR: 'Empacado', POR_DESPACHAR: 'Por despachar', TERMINADO: 'Listo', EN_REPARTO: 'En camino', NO_ENTREGADO: 'No entregado',
    ENTREGADO: 'Entregado', CANCELADO_DOCTOR: 'Cancelado' };
  var P = {
    p1: 'M118,90 L150,90', p2: 'M262,90 L296,90',
    p3: 'M414,90 C432,90 434,53 450,53', p4: 'M414,90 C432,90 434,95 450,95', p5: 'M414,90 C432,90 434,137 450,137'
  };
  var menosMov = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CSS = '#pulso-lab .pl{background:#0a0f17;border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden;margin:0 0 18px;font-family:Inter,-apple-system,"Segoe UI",sans-serif}'
    + '#pulso-lab .pl-h{padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}'
    + '#pulso-lab .pl-t{display:flex;align-items:center;gap:8px;font:700 .66rem ui-monospace,Consolas,monospace;letter-spacing:.1em;color:rgba(255,255,255,.45)}'
    + '#pulso-lab .pl-vivo{width:7px;height:7px;border-radius:50%;background:#00FF41;animation:plLatido 2s ease-in-out infinite}'
    + '@keyframes plLatido{0%,100%{opacity:1}50%{opacity:.2}}'
    + '#pulso-lab .pl-act{font:600 .66rem ui-monospace,Consolas,monospace;color:rgba(255,255,255,.3)}'
    + '#pulso-lab svg{display:block;width:100%;height:auto;max-height:200px;margin:auto}'
    + '#pulso-lab .pl-chips{display:none;flex-wrap:wrap;gap:6px;padding:12px 16px}'
    + '#pulso-lab .pl-chip{display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;background:#121822;border:1px solid rgba(255,255,255,.08);font-size:.72rem;color:rgba(255,255,255,.7)}'
    + '#pulso-lab .pl-chip b{color:#fff;font-family:ui-monospace,Consolas,monospace}'
    + '@media(max-width:600px){#pulso-lab .pl-svg{display:none}#pulso-lab .pl-chips{display:flex}}'
    + '#pulso-lab .pl-tk{border-top:1px solid rgba(255,255,255,.06);padding:9px 16px;display:flex;gap:8px;min-height:40px;align-items:center}'
    + '#pulso-lab .pl-tk b{color:#D946A6;font:700 .9rem ui-monospace,Consolas,monospace}'
    + '#pulso-lab .pl-msg{font:500 .74rem ui-monospace,Consolas,monospace;color:rgba(255,255,255,.55);transition:opacity .25s,transform .25s}'
    + '#pulso-lab .pl-msg.sale{opacity:0;transform:translateY(-4px)}'
    + '#pulso-lab .pl-f{border-top:1px solid rgba(255,255,255,.06);padding:10px 16px;display:flex;gap:22px;flex-wrap:wrap;align-items:center}'
    + '#pulso-lab .pl-k{font-size:.58rem;letter-spacing:.09em;color:rgba(255,255,255,.3);margin-bottom:2px;text-transform:uppercase;font-weight:700}'
    + '#pulso-lab .pl-v{font:700 1rem ui-monospace,Consolas,monospace;color:rgba(255,255,255,.8);font-variant-numeric:tabular-nums}'
    + '#pulso-lab a.pl-s{text-decoration:none;color:inherit}#pulso-lab .pl-s:hover .pl-v{text-decoration:underline}'
    + '#pulso-lab .pl-b{background:none;border:0;padding:0;text-align:left;font:inherit;color:inherit;cursor:pointer}'
    + '#pulso-lab g[data-k]{cursor:pointer;outline:none}#pulso-lab g[data-k]:hover rect,#pulso-lab g[data-k]:focus-visible rect{stroke:#00d2ff;stroke-width:1.4}'
    + '#pulso-lab g[data-k].on rect{stroke:#00d2ff;stroke-width:1.8}'
    + '#pulso-lab .pl-fil{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 16px;background:rgba(0,210,255,.07);border-bottom:1px solid rgba(0,210,255,.18);font-size:.76rem;color:#bfefff}'
    + '#pulso-lab .pl-fil[hidden]{display:none}#pulso-lab .pl-fil button{background:none;border:1px solid rgba(0,210,255,.35);color:#00d2ff;border-radius:999px;padding:3px 10px;font:600 .72rem Inter,system-ui;cursor:pointer}'
    + '#pulso-lab button.pl-chip{cursor:pointer;font-family:inherit}#pulso-lab button.pl-chip.on{border-color:#00d2ff}'
    + '#pulso-lab button:focus-visible{outline:2px solid #00d2ff;outline-offset:2px}'
    + '@media(prefers-reduced-motion:reduce){#pulso-lab .pl-vivo{animation:none}#pulso-lab .pl-msg{transition:none}}';

  // cada etapa es un botón: filtra la tabla de pedidos de abajo (data-k = clave de la etapa)
  function boton(id, etiqueta, svg) { return '<g data-k="' + id + '" role="button" tabindex="0" aria-label="Ver en la tabla los casos en ' + etiqueta + '">' + svg + '</g>'; }
  function nodo(x, y, w, h, etiqueta, id, borde, fondo) {
    return boton(id, etiqueta, '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="9" fill="' + (fondo || '#121822') + '" stroke="' + (borde || 'rgba(255,255,255,.1)') + '" stroke-width="' + (borde ? 1 : .6) + '"/>'
      + '<text x="' + (x + w / 2) + '" y="' + (y + 16) + '" text-anchor="middle" font-size="9" fill="rgba(255,255,255,.4)" letter-spacing=".08em" font-family="Inter,system-ui">' + etiqueta + '</text>'
      + '<text id="pl-' + id + '" x="' + (x + w / 2) + '" y="' + (y + h - (h > 50 ? 16 : 12)) + '" text-anchor="middle" font-size="' + (h > 50 ? 28 : 19) + '" font-weight="800" fill="#fff" font-family="ui-monospace,Consolas,monospace">—</text>');
  }
  function salida(y, etiqueta, id, color) {
    return boton(id, etiqueta, '<rect x="450" y="' + y + '" width="156" height="34" rx="8" fill="#10151d" stroke="rgba(255,255,255,.08)" stroke-width=".6"/>'
      + '<circle cx="464" cy="' + (y + 17) + '" r="3.2" fill="' + color + '"/>'
      + '<text x="476" y="' + (y + 21) + '" font-size="11" fill="rgba(255,255,255,.7)" font-family="Inter,system-ui">' + etiqueta + '</text>'
      + '<text id="pl-' + id + '" x="596" y="' + (y + 22) + '" text-anchor="end" font-size="14" font-weight="800" fill="#fff" font-family="ui-monospace,Consolas,monospace">—</text>');
  }
  function puntos(id, path, dur, color) {
    var s = '<g id="pl-flujo-' + id + '" aria-hidden="true">';
    [[0, 2.6, 1], [dur / 3, 1.9, .6], [dur * 2 / 3, 1.4, .35]].forEach(function (d) {
      s += '<circle r="' + d[1] + '" fill="' + color + '" opacity="' + d[2] + '"><animateMotion dur="' + dur + 's" begin="' + d[0].toFixed(2) + 's" repeatCount="indefinite" path="' + path + '"/></circle>';
    });
    return s + '</g>';
  }

  function pintarEsqueleto(caja) {
    if (!document.getElementById('pulso-lab-css')) { var st = document.createElement('style'); st.id = 'pulso-lab-css'; st.textContent = CSS; document.head.appendChild(st); }
    var tramo = function (d, op) { return '<path aria-hidden="true" d="' + d + '" fill="none" stroke="rgba(0,210,255,' + op + ')" stroke-width="1.5" stroke-dasharray="3 5"/>'; };
    caja.innerHTML = '<div class="pl" role="region" aria-label="Pulso del laboratorio: casos por etapa en vivo">'
      + '<div class="pl-h"><div class="pl-t"><span class="pl-vivo" aria-hidden="true"></span>PULSO DEL LABORATORIO · EN VIVO</div><span class="pl-act" id="pl-act">cargando…</span></div>'
      + '<div class="pl-fil" id="pl-fil" hidden><span id="pl-fil-txt"></span><button type="button" data-k="">Quitar filtro ✕</button></div>'
      + '<div class="pl-svg"><svg viewBox="0 0 620 180" role="group" aria-label="Casos por etapa. Toca una etapa para verla en la tabla.">'
      + tramo(P.p1, .28) + tramo(P.p2, .28) + tramo(P.p3, .18) + tramo(P.p4, .18) + tramo(P.p5, .18)
      + puntos('p1', P.p1, 1.05, '#00d2ff') + puntos('p2', P.p2, .9, '#00d2ff')
      + puntos('p3', P.p3, 1.3, '#D4AF37') + puntos('p4', P.p4, 1.15, '#D946A6') + puntos('p5', P.p5, 1.4, '#00FF41')
      + nodo(14, 68, 104, 44, 'RECEPCIÓN', 'recepcion')
      + nodo(150, 68, 112, 44, 'DISEÑO', 'diseno')
      + nodo(296, 56, 118, 68, 'PRODUCCIÓN', 'produccion', '#D946A6', '#160b14')
      + '<text id="pl-espera" x="206" y="138" text-anchor="middle" font-size="9.5" fill="#D4AF37" font-family="Inter,system-ui"></text>'
      + salida(36, 'Por despachar', 'despacho', '#D4AF37')
      + salida(78, 'En camino', 'camino', '#D946A6')
      + salida(120, 'Entregados hoy', 'hoy', '#00FF41')
      + '<text id="pl-prod-det" x="355" y="138" text-anchor="middle" font-size="9" fill="rgba(217,70,166,.9)" font-family="Inter,system-ui"></text>'
      + '</svg></div>'
      + '<div class="pl-chips" id="pl-chips"></div>'
      + '<div class="pl-tk"><b aria-hidden="true">›</b><span class="pl-msg" id="pl-msg" aria-live="polite">Leyendo la bitácora…</span></div>'
      + '<div class="pl-f">'
      + '<div><div class="pl-k">Casos activos</div><div class="pl-v" id="pl-activos">—</div></div>'
      + '<button type="button" class="pl-s pl-b" data-k="dr"><div class="pl-k">Esperan al doctor</div><div class="pl-v" id="pl-dr" style="color:#D4AF37">—</div></button>'
      + '<a class="pl-s" href="bandeja-whatsapp.html"><div class="pl-k">WhatsApp por enviar</div><div class="pl-v" id="pl-wa" style="color:#25D366">—</div></a>'
      + '<a class="pl-s" href="metricas.html" style="margin-left:auto;text-align:right"><div class="pl-k">Atrasados</div><div class="pl-v" id="pl-atr">—</div></a>'
      + '</div></div>';
    var svg = caja.querySelector('svg');
    if (menosMov && svg.pauseAnimations) svg.pauseAnimations();
    return svg;
  }

  /* ── filtrar la tabla de pedidos del panel por etapa (usa window._pedidosAdmin + renderPedidos del panel) ── */
  var ETQ = { recepcion: 'Recepción', diseno: 'Diseño', produccion: 'Producción', despacho: 'Por despachar', camino: 'En camino', hoy: 'Entregados hoy', dr: 'Esperan al doctor' };
  var _filtro = '';
  function enEtapa(p, k) {
    var e = String(p.estado_operativo || '').toUpperCase();
    if (k === 'hoy') { var h = new Date(); h.setHours(0, 0, 0, 0); return e === 'ENTREGADO' && new Date(p.updated_at) >= h; }
    if (k === 'dr') return ESPERA_DR.indexOf(e) >= 0;
    if (e === '') return k === 'recepcion' && Date.now() - new Date(p.created_at) < 90 * 864e5;   // igual que el conteo
    return (BUCKET[k] || []).indexOf(e) >= 0;
  }
  function filtrar(k) {
    var todos = window._pedidosAdmin;
    if (!Array.isArray(todos) || typeof window.renderPedidos !== 'function') return;
    _filtro = k === _filtro ? '' : k;                                     // tocar la misma etapa otra vez quita el filtro
    var lista = _filtro ? todos.filter(function (p) { return !p.es_prueba && enEtapa(p, _filtro); }) : todos;
    _propio = true; try { window.renderPedidos(lista); } finally { _propio = false; }
    marcarFiltro(lista.length);
    if (_filtro) { var t = document.getElementById('tbody-pedidos'); if (t) (t.closest('table') || t).scrollIntoView({ behavior: menosMov ? 'auto' : 'smooth', block: 'start' }); }
  }
  function marcarFiltro(n) {
    var fil = document.getElementById('pl-fil');
    if (fil) { fil.hidden = !_filtro; txt('pl-fil-txt', _filtro ? 'Tabla filtrada: ' + ETQ[_filtro] + ' (' + n + ' caso' + (n === 1 ? '' : 's') + ')' : ''); }
    document.querySelectorAll('#pulso-lab [data-k]').forEach(function (el) { el.classList.toggle('on', !!_filtro && el.dataset.k === _filtro); });
  }
  // si el panel vuelve a pintar la tabla por su cuenta (Actualizar, sus filtros), el filtro del pulso ya no aplica
  var _propio = false;
  function vigilarTabla() {
    var orig = window.renderPedidos;
    if (typeof orig !== 'function' || orig._pulso) return;
    var envuelta = function () { if (!_propio && _filtro) { _filtro = ''; marcarFiltro(0); } return orig.apply(this, arguments); };
    envuelta._pulso = true; window.renderPedidos = envuelta;
  }
  window.PulsoLab = { filtrar: filtrar };

  var _msgs = [], _i = 0, _timer = null;
  function hace(f) { var m = Math.max(0, Math.round((Date.now() - new Date(f)) / 60000)); return m < 60 ? 'hace ' + m + ' min' : m < 1440 ? 'hace ' + Math.round(m / 60) + ' h' : 'hace ' + Math.round(m / 1440) + ' d'; }
  function rotar() {
    var el = document.getElementById('pl-msg'); if (!el || !_msgs.length) return;
    el.classList.add('sale');
    setTimeout(function () { el.textContent = _msgs[_i % _msgs.length]; el.classList.remove('sale'); _i++; }, menosMov ? 0 : 250);
  }
  function txt(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

  async function cargar(sb, svg) {
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var hace90 = new Date(Date.now() - 90 * 864e5).toISOString();   // sin etapa = recién creado; los viejos sin etapa no cuentan
    var r = await Promise.all([
      sb.from('pedidos').select('estado_operativo,es_prueba').eq('negocio', 'prodigy')
        .or('estado_operativo.not.in.(ENTREGADO,CANCELADO_DOCTOR),and(estado_operativo.is.null,created_at.gte.' + hace90 + ')'),
      sb.from('pedidos').select('id', { count: 'exact', head: true }).eq('negocio', 'prodigy').eq('estado_operativo', 'ENTREGADO').gte('updated_at', hoy.toISOString()),
      sb.from('pedido_bitacora').select('codigo,detalle,created_at').eq('negocio', 'prodigy').eq('tabla', 'pedidos').eq('evento', 'etapa').order('created_at', { ascending: false }).limit(12),
      sb.from('avisos_whatsapp').select('id', { count: 'exact', head: true }).eq('negocio', 'prodigy').eq('estado_envio', 'pendiente'),
      sb.rpc('casos_atrasados', { p_factor: 2 })
    ]);
    var c = { recepcion: 0, diseno: 0, produccion: 0, despacho: 0, camino: 0 }, dr = 0, activos = 0, maq = { fresado: 0, impresión: 0, maquillaje: 0 };
    (r[0].data || []).forEach(function (p) {
      if (p.es_prueba) return;
      var e = String(p.estado_operativo || '').toUpperCase(); activos++;
      if (ESPERA_DR.indexOf(e) >= 0) dr++;
      if (e === 'FRESADO_INICIADO') maq.fresado++; else if (e === 'EN_IMPRESION') maq['impresión']++; else if (e === 'EN_ACABADO') maq.maquillaje++;
      for (var k in BUCKET) if (BUCKET[k].indexOf(e) >= 0) { c[k]++; break; }
    });
    for (var k in c) txt('pl-' + k, c[k]);
    txt('pl-hoy', r[1].count == null ? '—' : r[1].count);
    txt('pl-activos', activos); txt('pl-dr', dr);
    txt('pl-espera', dr ? '⏸ ' + dr + ' esperan al doctor' : '');
    txt('pl-prod-det', Object.keys(maq).filter(function (k) { return maq[k]; }).map(function (k) { return maq[k] + ' ' + k; }).join(' · '));
    // en celular: las mismas cifras como fichas (el diagrama no se lee a 390 px)
    var chips = document.getElementById('pl-chips');
    if (chips) {
      chips.textContent = '';
      [['Recepción', c.recepcion, '#00d2ff', 'recepcion'], ['Diseño', c.diseno, '#00d2ff', 'diseno'], ['Producción', c.produccion, '#D946A6', 'produccion'],
       ['Por despachar', c.despacho, '#D4AF37', 'despacho'], ['En camino', c.camino, '#D946A6', 'camino'], ['Entregados hoy', r[1].count || 0, '#00FF41', 'hoy']].forEach(function (f) {
        var s = document.createElement('button'); s.type = 'button'; s.className = 'pl-chip' + (f[3] === _filtro ? ' on' : ''); s.dataset.k = f[3];
        var d = document.createElement('i'); d.style.cssText = 'display:inline-block;width:7px;height:7px;border-radius:50%;background:' + f[2];
        var b = document.createElement('b'); b.textContent = f[1];
        s.appendChild(d); s.appendChild(document.createTextNode(f[0] + ' ')); s.appendChild(b); chips.appendChild(s);
      });
    }
    txt('pl-wa', r[3].error ? '—' : (r[3].count || 0));
    var atr = r[4].error ? null : (r[4].data || []).length;
    var a = document.getElementById('pl-atr'); if (a) { a.textContent = atr == null ? '—' : atr; a.style.color = atr ? '#f87171' : '#00FF41'; }
    // los puntos corren solo donde hay casos
    var fluye = { p1: c.recepcion > 0, p2: c.diseno > 0, p3: c.produccion > 0, p4: c.despacho + c.camino > 0, p5: c.camino + (r[1].count || 0) > 0 };
    Object.keys(fluye).forEach(function (id) { var g = document.getElementById('pl-flujo-' + id); if (g) g.style.display = fluye[id] && !menosMov ? '' : 'none'; });
    // teletipo con los últimos cambios de etapa
    _msgs = (r[2].data || []).map(function (b) {
      var partes = String(b.detalle || '').replace(/^Etapa:\s*/, '').split('→').map(function (s) { return s.trim().toUpperCase(); });
      var de = NOMBRE[partes[0] === '—' ? '' : partes[0]] || partes[0], a2 = NOMBRE[partes[1]] || partes[1];
      return (b.codigo || 'Caso') + ' · ' + de + ' → ' + a2 + ' · ' + hace(b.created_at);
    });
    if (!_msgs.length) _msgs = ['Sin cambios de etapa recientes. Esperando el próximo movimiento…'];
    _i = 0; rotar();
    if (!_timer) _timer = setInterval(function () { if (!document.hidden) rotar(); }, 2800);
    txt('pl-act', 'actualizado ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
  }

  function iniciar() {
    var caja = document.getElementById('pulso-lab'); if (!caja) return;
    var intentos = 0;
    (function esperarSb() {
      if (!window.sb) { if (++intentos < 40) setTimeout(esperarSb, 250); return; }
      var svg = pintarEsqueleto(caja);
      vigilarTabla();
      caja.addEventListener('click', function (e) { var n = e.target.closest('[data-k]'); if (n) filtrar(n.dataset.k); });
      caja.addEventListener('keydown', function (e) {
        var n = e.target.closest('g[data-k]'); if (!n || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault(); filtrar(n.dataset.k);
      });
      var correr = function () { cargar(window.sb, svg).catch(function () { txt('pl-act', 'sin conexión'); }); };
      correr();
      setInterval(function () { if (!document.hidden) correr(); }, 60000);
      document.addEventListener('visibilitychange', function () { if (!svg.pauseAnimations || menosMov) return; document.hidden ? svg.pauseAnimations() : svg.unpauseAnimations(); });
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
