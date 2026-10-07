/* ── PIEZAS DENTALES · FDI · Universal · Palmer (oct-2026, igual en PRODIGY y Alejandro CAD/CAM) ──────────────
   El cliente marca las piezas en SU nomenclatura (EE. UU.: Universal 1–32 · Reino Unido: Palmer UR1 · resto: FDI) y
   el laboratorio las recibe SIEMPRE en FDI (ISO 3950), la que usamos aquí. La conversión va en los dos sentidos.
     var sel = Dientes.montar(el, { cantidad: '#cantidad', porPieza: fn, input: '#campo' });
     sel.resumen() → { fdi: ['11','21'], sistema: 'universal', nombreSistema: 'Universal', texto: '#8, #9', textoFDI: '11, 21' }
     Dientes.texto(['11','21'], 'universal') → '#8, #9'      Dientes.leer('#8 #9', 'universal') → ['11','21']
     Dientes.mostrar(['11','21']) → en la nomenclatura del que mira, con el FDI al lado si no es FDI
   · conversor: true → sin «(opcional)» y el resultado muestra las tres nomenclaturas (convertidor de Soporte).
   · cantidad + porPieza(): si el servicio se cobra por pieza y no coincide con las piezas marcadas, ofrece ajustarla
     (dispara 'change' en el campo: el total lo recalcula la propia página, este archivo no toca precios).
   · input: campo de texto que recibe las piezas en FDI («11, 21»), para formularios que ya guardan texto.
   Preferencia: localStorage 'prd_notacion'. Por defecto Universal si la página está en inglés; si no, FDI. */
(function () {
  'use strict';
  if (window.Dientes) return;

  var CUAD = { 1: 'UR', 2: 'UL', 3: 'LL', 4: 'LR' };
  var DE_PALMER = { UR: '1', UL: '2', LL: '3', LR: '4' };
  // Orden del arco = numeración Universal 1…32 (18→28 arriba, 38→48 abajo)
  var ARCO = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 38, 37, 36, 35, 34, 33, 32, 31, 41, 42, 43, 44, 45, 46, 47, 48];
  var SISTEMAS = ['fdi', 'universal', 'palmer'];

  function valido(f) { return /^[1-4][1-8]$/.test(String(f)); }
  function universal(f) { return ARCO.indexOf(+f) + 1; }
  function deUniversal(u) { u = +u; return u >= 1 && u <= 32 ? String(ARCO[u - 1]) : null; }
  function etiqueta(f, s) { f = String(f); return s === 'universal' ? '#' + universal(f) : s === 'palmer' ? CUAD[f[0]] + f[1] : f; }
  function ordenar(lista, s) {
    var u = (lista || []).map(String).filter(function (x, i, a) { return valido(x) && a.indexOf(x) === i; });
    return u.sort(function (a, b) { return s === 'universal' ? universal(a) - universal(b) : a - b; });
  }
  function texto(lista, s) { s = s || 'fdi'; return ordenar(lista, s).map(function (f) { return etiqueta(f, s); }).join(', '); }
  // Texto libre («11, 21» · «#8 #9» · «UR1 UL 1») en la nomenclatura indicada → lista FDI
  function leer(t, s) {
    var out = [];
    String(t || '').toUpperCase().replace(/\b(UR|UL|LL|LR)\s+([1-8])\b/g, '$1$2').split(/[^A-Z0-9#]+/).forEach(function (tok) {
      var m, f = null;
      if (!tok) return;
      if ((m = tok.match(/^(UR|UL|LL|LR)([1-8])$/))) f = DE_PALMER[m[1]] + m[2];
      else if (s === 'universal' && (m = tok.match(/^#?(\d{1,2})$/))) f = deUniversal(m[1]);
      else if ((m = tok.match(/^#?([1-4][1-8])$/))) f = m[1];
      if (f && out.indexOf(f) < 0) out.push(f);
    });
    return out;
  }

  function idioma() { return window._phdrIdiomaPagina && window._phdrIdiomaPagina() === 'en' ? 'en' : 'es'; }
  function preferido() {
    try { var v = localStorage.getItem('prd_notacion'); if (SISTEMAS.indexOf(v) >= 0) return v; } catch (e) {}
    return idioma() === 'en' ? 'universal' : 'fdi';
  }
  function guardarPref(s) { try { localStorage.setItem('prd_notacion', s); } catch (e) {} }

  var NOM = { fdi: 'FDI', universal: 'Universal', palmer: 'Palmer' };
  var T = {
    es: {
      tit: 'Piezas dentales', opc: 'opcional', sis: 'Nomenclatura', zona: { fdi: 'ISO · LatAm', universal: 'EE. UU.', palmer: 'R. Unido' },
      ayuda: 'Marca las piezas del caso. Si trabajas con Universal (EE. UU.) o Palmer (Reino Unido), elígela arriba: el laboratorio las recibe convertidas a FDI.',
      der: 'Derecha del paciente', izq: 'Izquierda del paciente',
      q: { 1: 'Superior derecho', 2: 'Superior izquierdo', 3: 'Inferior izquierdo', 4: 'Inferior derecho' },
      sup: 'Arcada superior', inf: 'Arcada inferior', limpiar: 'Limpiar',
      nada: 'Ninguna pieza marcada.', n: function (n) { return n + (n === 1 ? ' pieza' : ' piezas'); },
      lab: 'El laboratorio la recibe en FDI:',
      dif: function (n, u) { return 'Marcaste ' + n + ' y las unidades son ' + u + '.'; },
      usar: function (n) { return 'Usar ' + n + ' como unidades'; }
    },
    en: {
      tit: 'Teeth', opc: 'optional', sis: 'Numbering system', zona: { fdi: 'ISO', universal: 'US', palmer: 'UK' },
      ayuda: 'Mark the teeth involved in the numbering system you use (Universal, Palmer or FDI). We convert it to FDI (ISO 3950) for the lab automatically.',
      der: "Patient's right", izq: "Patient's left",
      q: { 1: 'Upper right', 2: 'Upper left', 3: 'Lower left', 4: 'Lower right' },
      sup: 'Upper arch', inf: 'Lower arch', limpiar: 'Clear',
      nada: 'No teeth selected.', n: function (n) { return n + (n === 1 ? ' tooth' : ' teeth'); },
      lab: 'Sent to the lab in FDI:',
      dif: function (n, u) { return n + ' selected, units set to ' + u + '.'; },
      usar: function (n) { return 'Set units to ' + n; }
    }
  };

  var CSS = '.dt{container-type:inline-size;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px;background:rgba(255,255,255,.025);margin:0 0 18px}' +
    '.dt-cab{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}' +
    '.dt-tit{font-weight:700;font-size:.9rem;color:#e2e8f0}.dt-tit small{font-weight:500;color:#94a3b8;margin-left:6px;font-size:.72rem}' +
    '.dt-sis{display:inline-flex;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);border-radius:9px;padding:3px;gap:2px}' +
    '.dt-sis button{background:none;border:0;color:#cbd5e1;font:inherit;font-size:.74rem;font-weight:700;padding:5px 10px;border-radius:6px;cursor:pointer;line-height:1.15;text-align:center}' +
    '.dt-sis button small{display:block;font-size:.6rem;font-weight:500;color:#94a3b8}' +
    '.dt-sis button[aria-checked=true]{background:rgba(0,210,255,.16);color:#00d2ff}' +
    '.dt-ayuda{font-size:.74rem;color:#94a3b8;line-height:1.45;margin:0 0 10px}' +
    '.dt-lados{display:flex;justify-content:space-between;font-size:.64rem;letter-spacing:.06em;text-transform:uppercase;color:#64748b;margin-bottom:6px}' +
    '.dt-arcos{display:grid;grid-template-columns:1fr 1fr}' +
    '.dt-cuad{padding:0 8px 10px}.dt-cuad[data-q="1"],.dt-cuad[data-q="4"]{border-right:1px dashed rgba(255,255,255,.2)}' +
    '.dt-cuad[data-q="3"],.dt-cuad[data-q="4"]{padding-top:10px;padding-bottom:0;border-top:1px dashed rgba(255,255,255,.2)}' +
    '.dt-qt{font-size:.66rem;color:#94a3b8;margin-bottom:5px}' +
    '.dt-fila{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:4px}' +
    '.dt-d{min-height:40px;min-width:0;padding:0;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);color:#e2e8f0;font:inherit;font-size:.78rem;font-weight:700;cursor:pointer;font-variant-numeric:tabular-nums;transition:background .15s,border-color .15s}' +
    '.dt-cuad[data-q="1"] .dt-d,.dt-cuad[data-q="2"] .dt-d{border-radius:6px 6px 14px 14px}' +
    '.dt-cuad[data-q="3"] .dt-d,.dt-cuad[data-q="4"] .dt-d{border-radius:14px 14px 6px 6px}' +
    '.dt-d:hover{border-color:rgba(0,210,255,.6)}.dt-d[aria-pressed=true]{background:#00d2ff;border-color:#00d2ff;color:#04121a}' +
    '.dt-d:focus-visible,.dt-sis button:focus-visible,.dt-acc button:focus-visible,.dt-aviso button:focus-visible{outline:2px solid #D4AF37;outline-offset:2px}' +
    '.dt-acc{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}' +
    '.dt-acc button{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);color:#cbd5e1;font:inherit;font-size:.72rem;padding:6px 10px;border-radius:7px;cursor:pointer}' +
    '.dt-res{margin-top:10px;font-size:.8rem;color:#cbd5e1;line-height:1.55}.dt-res b{color:#00d2ff}.dt-res .dt-lab{display:block;color:#94a3b8}.dt-res .dt-lab b{color:#D4AF37}' +
    '.dt-conv{display:grid;grid-template-columns:84px 1fr;gap:10px;padding:6px 0;border-top:1px solid rgba(255,255,255,.08)}.dt-conv span{color:#94a3b8;font-size:.74rem;text-transform:uppercase;letter-spacing:.06em}.dt-conv b{font-variant-numeric:tabular-nums}' +
    '.dt-aviso[hidden]{display:none}.dt-aviso{margin-top:8px;display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:.75rem;color:#fbbf24}' +
    '.dt-aviso button{background:rgba(212,175,55,.14);border:1px solid rgba(212,175,55,.45);color:#D4AF37;font:inherit;font-size:.72rem;font-weight:700;padding:5px 10px;border-radius:7px;cursor:pointer}' +
    '@container (max-width:520px){.dt-arcos{grid-template-columns:1fr}.dt-lados{display:none}.dt-cuad,.dt-cuad[data-q]{padding:0 0 10px;border-right:0;border-top:0}' +
    '.dt-cuad[data-q="4"]{padding-top:10px;border-top:1px dashed rgba(255,255,255,.2)}.dt-cuad[data-q="3"]{padding-bottom:0}}';

  function estilos() {
    if (document.getElementById('dt-css')) return;
    var st = document.createElement('style'); st.id = 'dt-css'; st.textContent = CSS; document.head.appendChild(st);
  }

  function montar(el, op) {
    if (!el) return null;
    op = op || {};
    estilos();
    var L = T[idioma()], sis = preferido();
    var inp = op.input ? document.querySelector(op.input) : null;
    var cant = op.cantidad ? document.querySelector(op.cantidad) : null;
    var sel = inp && inp.value ? leer(inp.value, 'fdi') : [];
    var cuad = function (q) {
      var ns = q === 1 || q === 4 ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
      return '<div class="dt-cuad" data-q="' + q + '"><div class="dt-qt"></div><div class="dt-fila">' +
        ns.map(function (n) { return '<button type="button" class="dt-d" translate="no" data-f="' + q + n + '" aria-pressed="false"></button>'; }).join('') + '</div></div>';
    };
    el.classList.add('dt');
    el.innerHTML =
      '<div class="dt-cab"><span class="dt-tit">' + L.tit + (op.conversor ? '' : '<small>(' + L.opc + ')</small>') + '</span>' +
      '<div class="dt-sis" role="radiogroup" aria-label="' + L.sis + '">' +
      SISTEMAS.map(function (s) { return '<button type="button" role="radio" data-s="' + s + '" aria-checked="false"><span translate="no">' + NOM[s] + '</span><small>' + L.zona[s] + '</small></button>'; }).join('') +
      '</div></div>' +
      (op.conversor ? '' : '<p class="dt-ayuda">' + L.ayuda + '</p>') +
      '<div class="dt-lados" aria-hidden="true"><span>← ' + L.der + '</span><span>' + L.izq + ' →</span></div>' +
      '<div class="dt-arcos">' + cuad(1) + cuad(2) + cuad(4) + cuad(3) + '</div>' +
      '<div class="dt-acc"><button type="button" data-a="sup">' + L.sup + '</button><button type="button" data-a="inf">' + L.inf + '</button><button type="button" data-a="limpiar">' + L.limpiar + '</button></div>' +
      '<div class="dt-res" aria-live="polite"></div><div class="dt-aviso" hidden></div>';
    var res = el.querySelector('.dt-res'), aviso = el.querySelector('.dt-aviso');

    function avisoUnidades() {
      var u = cant ? parseInt(cant.value, 10) || 0 : 0;
      var mostrar = cant && sel.length && u !== sel.length && (!op.porPieza || op.porPieza());
      aviso.hidden = !mostrar;
      if (!mostrar) return;
      aviso.textContent = '';
      var s = document.createElement('span'); s.textContent = L.dif(L.n(sel.length), u);
      var b = document.createElement('button'); b.type = 'button'; b.dataset.a = 'usar'; b.textContent = L.usar(sel.length);
      aviso.appendChild(s); aviso.appendChild(b);
    }
    function pintar() {
      [].forEach.call(el.querySelectorAll('.dt-sis button'), function (b) { b.setAttribute('aria-checked', b.dataset.s === sis ? 'true' : 'false'); });
      [].forEach.call(el.querySelectorAll('.dt-cuad'), function (c) {
        var q = c.dataset.q;
        c.querySelector('.dt-qt').textContent = L.q[q] + (sis === 'palmer' ? ' · ' + CUAD[q] : sis === 'fdi' ? ' · ' + q : '');
      });
      [].forEach.call(el.querySelectorAll('.dt-d'), function (b) {
        var f = b.dataset.f, on = sel.indexOf(f) >= 0;
        b.textContent = sis === 'universal' ? String(universal(f)) : sis === 'palmer' ? f[1] : f;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.title = 'FDI ' + f + ' · Universal #' + universal(f) + ' · Palmer ' + CUAD[f[0]] + f[1];
        b.setAttribute('aria-label', L.q[f[0]] + ' — ' + etiqueta(f, sis));
      });
      res.textContent = '';
      if (!sel.length) res.textContent = L.nada;
      else if (op.conversor) {
        SISTEMAS.forEach(function (s) {
          var fila = document.createElement('span'); fila.className = 'dt-conv';
          var k = document.createElement('span'); k.setAttribute('translate', 'no'); k.textContent = NOM[s];
          var v = document.createElement('b'); v.setAttribute('translate', 'no'); v.textContent = texto(sel, s);
          fila.appendChild(k); fila.appendChild(v); res.appendChild(fila);
        });
      } else {
        var b1 = document.createElement('b'); b1.textContent = L.n(sel.length);
        res.appendChild(b1); res.appendChild(document.createTextNode(' · ' + texto(sel, sis) + (sis === 'fdi' ? '' : ' (' + NOM[sis] + ')')));
        if (sis !== 'fdi') {
          var lab = document.createElement('span'); lab.className = 'dt-lab'; lab.textContent = L.lab + ' ';
          var b2 = document.createElement('b'); b2.setAttribute('translate', 'no'); b2.textContent = texto(sel, 'fdi');
          lab.appendChild(b2); res.appendChild(lab);
        }
      }
      if (inp) { var v = texto(sel, 'fdi'); if (inp.value !== v) { inp.value = v; inp.dispatchEvent(new Event('input', { bubbles: true })); } }
      avisoUnidades();
      if (typeof op.alCambiar === 'function') op.alCambiar(api.resumen());
    }
    function alternar(lista) {
      var todas = lista.every(function (f) { return sel.indexOf(f) >= 0; });
      sel = todas ? sel.filter(function (f) { return lista.indexOf(f) < 0; }) : sel.concat(lista.filter(function (f) { return sel.indexOf(f) < 0; }));
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !el.contains(b)) return;
      if (b.dataset.s) { sis = b.dataset.s; guardarPref(sis); }
      else if (b.dataset.f) alternar([b.dataset.f]);
      else if (b.dataset.a === 'sup') alternar(ARCO.slice(0, 16).map(String));
      else if (b.dataset.a === 'inf') alternar(ARCO.slice(16).map(String));
      else if (b.dataset.a === 'limpiar') sel = [];
      else if (b.dataset.a === 'usar' && cant) { cant.value = sel.length; cant.dispatchEvent(new Event('change', { bubbles: true })); }
      pintar();
    });
    if (cant) { cant.addEventListener('input', avisoUnidades); cant.addEventListener('change', avisoUnidades); }
    // el servicio elegido (por pieza o no) cambia fuera de este bloque: revisar el aviso tras cada clic de la página
    if (op.porPieza) document.addEventListener('click', function () { setTimeout(avisoUnidades, 0); }, true);
    if (inp) inp.addEventListener('change', function () { sel = leer(inp.value, 'fdi'); pintar(); });

    var api = {
      resumen: function () { return { fdi: ordenar(sel, 'fdi'), sistema: sis, nombreSistema: NOM[sis], texto: texto(sel, sis), textoFDI: texto(sel, 'fdi') }; },
      fijar: function (lista) { sel = ordenar(lista, 'fdi'); pintar(); },
      limpiar: function () { sel = []; pintar(); }
    };
    pintar();
    return api;
  }

  // Para mostrar piezas guardadas (FDI) a quien las mira: su nomenclatura, con el FDI al lado si no es FDI
  function mostrar(lista) {
    var fdi = Array.isArray(lista) ? lista : leer(lista, 'fdi');
    if (!fdi.length) return '';
    var s = preferido();
    return s === 'fdi' ? texto(fdi, 'fdi') : texto(fdi, s) + ' (' + NOM[s] + ') · FDI ' + texto(fdi, 'fdi');
  }

  window.Dientes = { montar: montar, texto: texto, leer: leer, mostrar: mostrar, etiqueta: etiqueta, universal: universal, preferido: preferido };
})();
