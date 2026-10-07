/* ── ORDEN POR DIENTE estilo exocad DentalDB dentro del flujo de diseño (oct-2026, igual en ambas webs) ──────────
   El odontograma vive en /odontograma.html (iframe del mismo origen) y avisa por postMessage
   { __odo:1, items:[{d (FDI), ind, mat, tono, impl}], resumen, guia, height }.
   Aquí se pone precio con el catálogo del propio flujo (MATERIAL_DATA_MUT: COP en PRODIGY, USD en Alejandro) usando
   window.ODO_CFG (mapa indicación → [categoría, subtipo], qué se cobra por arcada o por caso y las guías).
   No toca calcularTotal(): llena STATE igual que selectSubtipo() y la llama. Gana la última acción del doctor:
   el odontograma o un servicio de «Otros servicios». El laboratorio recibe todo en FDI (pedidos.piezas). */
(function () {
  'use strict';
  var C = window.ODO_CFG || {};
  var fr = document.getElementById('odo-frame');
  if (!fr) return;
  var EN = !!(window._phdrIdiomaPagina && window._phdrIdiomaPagina() === 'en');
  var nota = window.Dientes ? Dientes.preferido() : (EN ? 'universal' : 'fdi');   // FDI (ISO) · Universal (EE. UU.) · Palmer (R. Unido)
  // Idioma del odontograma: EN técnico, PT con los nombres oficiales de exocad (la página en PT la traduce Google; el marco no)
  var PT = !EN && (function () { try { return localStorage.getItem('prd_lang') === 'pt'; } catch (e) { return false; } })();
  fr.src = '/odontograma.html?v=' + (C.v || '1') + '&lang=' + (EN ? 'en' : (PT ? 'pt' : 'es')) + '&nota=' + nota + (C.sitio ? '&sitio=' + C.sitio : '');
  var T = EN
    ? { nada: 'No indications assigned yet: tap a tooth on the chart.', unid: function (n) { return n + (n === 1 ? ' tooth' : ' teeth'); }, cot: 'to be quoted', guia: 'Surgical guide', otro: 'Selected service: ' }
    : { nada: 'Aún no has asignado indicaciones a los dientes.', unid: function (n) { return n + (n === 1 ? ' pieza' : ' piezas'); }, cot: 'a cotizar', guia: 'Guía quirúrgica', otro: 'Servicio elegido: ' };
  var INFO = { 'Antagonista': 1, 'Diente adyacente': 1, 'Omitir en el puente': 1 };   // informativas: no se cobran
  var porArcada = C.porArcada || {}, porCaso = C.porCaso || {}, mapa = C.mapa || {}, guias = C.guias || {};

  function cat() { return (typeof MATERIAL_DATA_MUT !== 'undefined') ? MATERIAL_DATA_MUT : ((typeof MATERIAL_DATA !== 'undefined') ? MATERIAL_DATA : null); }
  function sub(par) { var c = cat(); return (par && c && c[par[0]] && c[par[0]].subtipos && c[par[0]].subtipos[par[1]]) || null; }
  function resumenEl() { return document.getElementById('odo-resumen'); }
  function fdiLista(items) { return items.map(function (i) { return String(i.d); }).filter(function (x, i, a) { return a.indexOf(x) === i; }).sort(function (a, b) { return a - b; }); }
  function mostrar(lista) { return window.Dientes ? (Dientes.mostrar(lista) || lista.join(', ')) : lista.join(', '); }

  var activo = false, piezasFDI = [], ultimo = null, orden = null;
  function aplicar(x) {
    var items = (x.items || []).filter(function (it) { return it && it.ind; });
    var cobrables = items.filter(function (it) { return !INFO[it.ind]; });
    var g = (x.guia && x.guia.tipo) ? x.guia : null;
    var hay = cobrables.length || g;
    if (!hay && !activo) return;                                    // aún no se usa: no pisa un servicio ya elegido
    var total = 0, vistos = {}, cotizar = [];
    cobrables.forEach(function (it) {
      var s = sub(mapa[it.ind]);
      if (!s) { if (cotizar.indexOf(it.ind) < 0) cotizar.push(it.ind); return; }
      var clave = porArcada[it.ind] ? it.ind + (it.d < 30 ? '·sup' : '·inf') : (porCaso[it.ind] ? it.ind : it.d + '·' + it.ind);
      if (vistos[clave]) return;
      vistos[clave] = 1; total += s.precio || 0;
    });
    var gNom = '';
    if (g) {
      var gs = sub(guias[g.tipo]);
      gNom = (gs && gs.nombre) || g.tipoNom || g.tipo;
      if (gs) total += gs.precio || 0; else cotizar.push(gNom);
    }
    piezasFDI = fdiLista(cobrables);
    var partes = [];
    if (cobrables.length) partes.push('Diseño CAD por diente (' + cobrables.length + ' pieza' + (cobrables.length > 1 ? 's' : '') + ', FDI): ' + x.resumen);
    if (g) partes.push('Guía quirúrgica: ' + gNom + ' (' + [g.sistema, g.soporte, g.guiado, g.manga].filter(Boolean).join(' · ') + ')');
    if (cotizar.length) partes.push('A cotizar: ' + cotizar.join(', '));
    STATE.categoriaId = 'cad_diseno'; STATE.categoriaKey = 'cad_diseno_odontograma'; STATE.categoriaNombre = 'Diseño CAD (por diente)';
    STATE.subtipoId = hay ? 'odontograma' : null;
    STATE.subtipoNombre = hay ? partes.join(' · ') : null;
    STATE.subtipoPrecio = total;
    STATE.odontograma = items; STATE.guia = g;
    orden = hay ? { v: 1, nomenclatura: window.Dientes ? Dientes.preferido() : 'fdi', proceso: 'Diseño CAD',
      piezas: items.map(function (it) { return { fdi: +it.d, indicacion: it.ind, material: it.mat || null, codigo_exocad: it.cod || null, proceso: it.proc || null, tono: it.tono || null, implante: it.impl || null }; }),
      guia: g ? { tipo: g.tipo, nombre: gNom, sistema: g.sistema || null, soporte: g.soporte || null, guiado: g.guiado || null, manga: g.manga || null } : null } : null;
    activo = !!hay;
    var cc = document.getElementById('cantidad'); if (cc) cc.value = 1;
    // Archivos requeridos según lo marcado (implantes → scan body; férula/dentadura → mordida; si no, corona)
    if (hay && typeof renderArchivosRequeridos === 'function') {
      var tiene = function (re) { return cobrables.some(function (it) { return re.test(it.ind) || (it.impl && re.test(it.impl)); }); };
      var base = tiene(/Pilar|barra|Atache|Offset|aditamiento|Atornillado/i) ? 'corona_ator' : tiene(/Férula/) ? 'ferula' : tiene(/Carilla|Mockup|Encerado/) ? 'carilla' : 'corona';
      try { renderArchivosRequeridos(base); } catch (e) {}
    }
    var rp = resumenEl();
    if (rp) {
      var txt = [];
      if (cobrables.length) txt.push(T.unid(cobrables.length) + ': ' + mostrar(piezasFDI));
      if (g) txt.push(T.guia + ': ' + gNom);
      if (cotizar.length) txt.push(T.cot + ': ' + cotizar.join(', '));
      rp.textContent = hay ? txt.join(' · ') : T.nada;
    }
    if (typeof calcularTotal === 'function') calcularTotal();
  }

  window.addEventListener('message', function (ev) {
    if (ev.origin !== location.origin) return;
    var x = ev.data;
    if (x && x.__odoNota) { if (ultimo && typeof STATE !== 'undefined') aplicar(ultimo); return; }   // cambió la nomenclatura
    if (!x || x.__odo !== 1) return;
    ultimo = x;
    if (typeof x.height === 'number' && x.height > 300) fr.style.height = (x.height + 8) + 'px';
    if (typeof STATE === 'undefined') return;
    aplicar(x);
  });

  // Un servicio de «Otros servicios» reemplaza lo del odontograma (gana la última acción)
  if (typeof window.selectSubtipo === 'function') {
    var orig = window.selectSubtipo;
    window.selectSubtipo = function () {
      var r = orig.apply(this, arguments);
      activo = false; piezasFDI = []; orden = null;
      var rp = resumenEl(); if (rp && STATE.subtipoNombre) rp.textContent = T.otro + STATE.subtipoNombre;
      return r;
    };
  }

  // Orden estructurada (pedidos.odontograma, jsonb). Solo se envía si la columna existe (sql/pedidos-odontograma-2026.sql):
  // si no, el insert completo fallaría por una columna desconocida.
  window._odoColumna = false;
  window.addEventListener('load', function () {
    try { var sb = (typeof getSupabase === 'function') ? getSupabase() : null;
      if (sb) sb.from('pedidos').select('odontograma').limit(0).then(function (r) { window._odoColumna = !r.error; }); } catch (e) {}
  });
  window._odoOrden = function () { return activo && orden ? orden : null; };

  // Lo que usan la confirmación, el WhatsApp y el pedido (pedidos.piezas en FDI)
  window._piezasFDI = function () { return activo && piezasFDI.length ? piezasFDI.slice() : null; };
  window._piezasTexto = function () {
    if (!activo || !piezasFDI.length) return '';
    var s = window.Dientes ? Dientes.preferido() : 'fdi';
    return s === 'fdi' ? piezasFDI.join(', ') + ' (FDI)' : Dientes.texto(piezasFDI, s) + ' (' + ({ universal: 'Universal', palmer: 'Palmer' }[s]) + ') = FDI ' + piezasFDI.join(', ');
  };
})();
