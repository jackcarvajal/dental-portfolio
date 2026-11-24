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
    ? { nada: 'No indications assigned yet: tap a tooth on the chart.', unid: function (n) { return n + (n === 1 ? ' tooth' : ' teeth'); }, cot: 'to be quoted', guia: 'Surgical guide', plan: 'Implant planning', modelo: 'Printed model', mDis: 'printed model', otro: 'Selected service: ' }
    : { nada: 'Aún no has asignado indicaciones a los dientes.', unid: function (n) { return n + (n === 1 ? ' pieza' : ' piezas'); }, cot: 'a cotizar', guia: 'Guía quirúrgica', plan: 'Planificación de implantes', modelo: 'Modelo impreso', mDis: 'modelo impreso', otro: 'Servicio elegido: ' };
  // Informativas: no se cobran por diente (la planificación de implantes se cobra con la guía o la planificación del caso)
  var INFO = { 'Antagonista': 1, 'Diente adyacente': 1, 'Omitir en el puente': 1, 'Planificación de implantes': 1 };
  var porArcada = C.porArcada || {}, porCaso = C.porCaso || {}, mapa = C.mapa || {}, guias = C.guias || {};
  // Pesos (tabla de Colombia, 24-nov-2026). Alejandro cobra en dólares y muestra pesos en Colombia: algunas indicaciones
  // tienen su propio precio en pesos (copId → id del catálogo), el encerado/mockup se cobra por diente (copPorDiente)
  // y las guías toman el precio en pesos de su id (copGuias). PRODIGY no los necesita: su catálogo ya está en pesos.
  var AC = C.sitio === 'ac', copId = C.copId || {}, copPorDiente = C.copPorDiente || {}, copGuias = C.copGuias || {};

  function cat() { return (typeof MATERIAL_DATA_MUT !== 'undefined') ? MATERIAL_DATA_MUT : ((typeof MATERIAL_DATA !== 'undefined') ? MATERIAL_DATA : null); }
  function sub(par) { var c = cat(); return (par && c && c[par[0]] && c[par[0]].subtipos && c[par[0]].subtipos[par[1]]) || null; }
  // Precio en pesos: 1) el del catálogo por id (window._catCOP, lo llena Alejandro); 2) precio_cop del subtipo; 3) el precio
  // del subtipo (PRODIGY ya está en pesos; en Alejandro es dólar → × 4.000 solo como respaldo si el catálogo no cargó)
  function cop(s, id) {
    var k = window._catCOP && id && Number(window._catCOP[id]);
    if (k > 0) return k;
    if (!s) return 0;
    if (Number(s.precio_cop) > 0) return Number(s.precio_cop);
    return (Number(s.precio) || 0) * (AC ? 4000 : 1);
  }
  window._odoCOP = cop;
  function resumenEl() { return document.getElementById('odo-resumen'); }
  function fdiLista(items) { return items.map(function (i) { return String(i.d); }).filter(function (x, i, a) { return a.indexOf(x) === i; }).sort(function (a, b) { return a - b; }); }
  function mostrar(lista) { return window.Dientes ? (Dientes.mostrar(lista) || lista.join(', ')) : lista.join(', '); }

  var activo = false, piezasFDI = [], ultimo = null, orden = null, detalle = '';
  function aplicar(x) {
    var items = (x.items || []).filter(function (it) { return it && it.ind; });
    var cobrables = items.filter(function (it) { return !INFO[it.ind]; });
    var g = (x.guia && x.guia.tipo) ? x.guia : null;
    var m = x.modelo || null;                                       // modelos impresos (hueco/sólido, zócalo, troqueles, implantes, articulador)
    var hay = cobrables.length || g || m;
    if (!hay && !activo) return;                                    // aún no se usa: no pisa un servicio ya elegido
    var total = 0, totalCOP = 0, vistos = {}, vistosC = {}, cotizar = [];
    var enc = { sup: 0, inf: 0 }, arcs = {};                       // dientes con encía por arcada · arcadas con trabajo (¿implantes?)
    var grupos = [], idx = {};                                      // para el nombre corto: «Corona anatómica en zirconio ×2 + Pilar personalizado»
    function contar(nom) { if (idx[nom] == null) { idx[nom] = grupos.length; grupos.push([nom, 0]); } grupos[idx[nom]][1]++; }
    cobrables.forEach(function (it) {
      var arc = it.d < 30 ? 'sup' : 'inf', A = arcs[arc] = arcs[arc] || { impl: false };
      if ((it.impl && it.impl !== 'Post y core') || it.barra || /barra|Pilar personalizado/i.test(it.ind)) A.impl = true;
      if (it.encia) enc[arc]++;
      // Full Arch / híbrida (barra interna o subestructura de barra): se cobra POR UNIDAD (catálogo all_on_4, 24-nov-2026)
      // y la barra interna una sola vez por arcada, como barra.
      var fa = !!(it.barra || it.impl === 'Subestructura (barra)');
      // Corona sobre implante (pilar personalizado, atornillada o pilar de aditamiento) = «pieza con conexión a implante»:
      // se cobra la corona atornillada del catálogo en vez de la corona cementada (24-nov-2026, tabla aprobada: $50.000).
      // En dólares (Alejandro, exterior) la corona sobre pilar personalizado sigue siendo corona + pilar (dos diseños).
      var enImpl = !fa && it.impl && /^(Pilar personalizado|Atornillado oclusal|Pilar de aditamiento)$/.test(it.impl) && mapa[it.ind] && mapa[it.ind][1] === 'corona';
      contar((fa ? 'Full Arch (por unidad)' : it.ind + (enImpl ? ' sobre implante' : '')) + (it.mat ? ' en ' + String(it.mat).toLowerCase() : ''));
      if (it.impl === 'Post y core' && cotizar.indexOf('perno-muñón') < 0) cotizar.push('perno-muñón');
      var s = fa ? (sub(['cad_implantes', 'all_on_4']) || sub(mapa[it.ind])) : enImpl ? (sub(['cad_implantes', 'corona_ator']) || sub(mapa[it.ind])) : sub(mapa[it.ind]);
      if (!s) { if (cotizar.indexOf(it.ind) < 0) cotizar.push(it.ind); return; }
      if (it.barra && !vistos['barra·' + arc]) {                      // barra interna de la híbrida: una por arcada
        var sb = sub(['cad_implantes', 'barra']);
        if (sb) { vistos['barra·' + arc] = vistosC['barra·' + arc] = 1; total += sb.precio || 0; totalCOP += cop(sb, 'barra'); contar('Barra interna'); }
      }
      var esBarra = mapa[it.ind] && mapa[it.ind][1] === 'barra';      // pilar y segmento de barra: una barra por arcada
      var clave = fa ? it.d + '·fa' : esBarra ? 'barra·' + arc : porArcada[it.ind] ? it.ind + (it.d < 30 ? '·sup' : '·inf') : (porCaso[it.ind] ? (typeof porCaso[it.ind] === 'string' ? porCaso[it.ind] : it.ind) : it.d + '·' + it.ind);
      var claveC = copPorDiente[it.ind] ? it.d + '·' + it.ind : clave;          // pesos: encerado y mockup por diente
      if (!vistosC[claveC]) { vistosC[claveC] = 1; totalCOP += cop(s, fa ? 'all_on_4' : enImpl ? 'corona_ator' : copId[it.ind]); }
      if (vistos[clave]) return;
      vistos[clave] = 1;
      if (AC && enImpl && it.impl === 'Pilar personalizado') {        // dólares: corona + pilar (dos diseños)
        var sc0 = sub(mapa[it.ind]), sp0 = sub(['cad_implantes', 'pilar_pers']);
        total += ((sc0 && sc0.precio) || 0) + ((sp0 && sp0.precio) || 0);
      } else total += s.precio || 0;
    });
    var gNom = '';
    if (g) {
      var gs = sub(guias[g.tipo]);
      gNom = (gs && gs.nombre) || g.tipoNom || g.tipo;
      if (gs) { total += gs.precio || 0; totalCOP += cop(gs, copGuias[g.tipo]); } else cotizar.push(gNom);
    }
    // Encía (24-nov-2026): por diente, con tope «encía total» por arcada (lo que salga menos)
    ['sup', 'inf'].forEach(function (k) {
      var n = enc[k]; if (!n) return;
      var su = sub(['cad_implantes', 'encia_unidad']), st = sub(['cad_implantes', 'encia_total']);
      if (!su) { if (cotizar.indexOf('encía') < 0) cotizar.push('encía'); return; }
      var cu = cop(su, 'encia_unidad') * n, ct = st ? cop(st, 'encia_total') : Infinity, esTot = ct <= cu;
      total += esTot ? (st.precio || 0) : (su.precio || 0) * n;
      totalCOP += Math.min(cu, ct);
      if (esTot) contar('Encía total ' + (k === 'sup' ? 'superior' : 'inferior')); else for (var i = 0; i < n; i++) contar('Encía');
    });
    // Modelos (24-nov-2026): diseño del modelo por arcada (superior e inferior: el trabajo y su antagonista); «con implantes»
    // si esa arcada lleva implantes y se pidieron análogos o encía removible. Troqueles: por pieza preparada.
    var mNom = m ? 'Modelo impreso: ' + (m.resumen || [m.tipo, m.articulador || 'sin articulador', m.articulador ? m.version : ''].filter(Boolean).join(' · ')) : '';
    if (m) {
      var ms = sub(['cad_modelos', 'diseno_modelo']), mi = sub(['cad_modelos', 'diseno_modelo_impl']);
      var conImpl = !!(m.implantes && (m.implantes.analogos || m.implantes.encia));
      if (!ms) cotizar.push('modelo impreso');
      else {
        ['sup', 'inf'].forEach(function (k) {
          var ci = !!(conImpl && mi && arcs[k] && arcs[k].impl), sm = ci ? mi : ms;
          total += sm.precio || 0; totalCOP += cop(sm, ci ? 'diseno_modelo_impl' : 'diseno_modelo');
          contar('Modelo ' + (k === 'sup' ? 'superior' : 'inferior') + (ci ? ' con implantes' : ''));
        });
        var tro = m.troqueles && (m.troqueles.zanahoria || m.troqueles.adicionales);
        var nt = tro ? cobrables.filter(function (it) { return !(it.impl && it.impl !== 'Post y core') && !it.barra && /^(Corona|Cofia|Overlay|Incrustación|Inlay|Carilla)/.test(it.ind); }).length : 0;
        var ts = sub(['cad_modelos', 'diseno_troquel']);
        if (nt && ts) { total += (ts.precio || 0) * nt; totalCOP += cop(ts, 'diseno_troquel') * nt; for (var j = 0; j < nt; j++) contar('Troquel'); }
        else if (nt) cotizar.push('troqueles');
      }
    }
    piezasFDI = fdiLista(cobrables);
    var partes = [], corto = [];
    if (cobrables.length) partes.push('Diseño CAD por diente (' + cobrables.length + ' pieza' + (cobrables.length > 1 ? 's' : '') + ', FDI): ' + x.resumen);
    if (grupos.length) corto.push(grupos.map(function (gr) { return gr[0] + (gr[1] > 1 ? ' ×' + gr[1] : ''); }).join(' + '));
    if (g) partes.push((g.pide === 'plan' ? 'Planificación de implantes: ' : 'Guía quirúrgica: ') + gNom + ' (' + [g.sistema, g.arcada === 'edentulo' ? 'edéntulo total (doble CBCT)' : (g.arcada === 'con_dientes' ? 'arcada con dientes' : ''), g.abordaje].filter(Boolean).join(' · ') + ')' + (g.dientes && g.dientes.length ? ' · implantes (FDI): ' + g.dientes.map(function (f) { return f + ((g.implantes || {})[f] ? ' ' + g.implantes[f] : ' (a sugerir)'); }).join(', ') : ''));
    if (g) corto.push((g.pide === 'plan' ? 'Planificación: ' : 'Guía quirúrgica: ') + gNom);
    if (m) partes.push(mNom);
    if (cotizar.length) { partes.push('A cotizar: ' + cotizar.join(', ')); corto.push('a cotizar: ' + cotizar.join(', ')); }
    detalle = hay ? partes.join(' · ') : '';
    STATE.categoriaId = 'cad_diseno'; STATE.categoriaKey = 'cad_diseno_odontograma'; STATE.categoriaNombre = 'Diseño CAD (por diente)';
    STATE.subtipoId = hay ? 'odontograma' : null;
    STATE.subtipoNombre = hay ? corto.join(' · ') : null;   // corto: el detalle por diente va en _odoDetalle() → notas del pedido
    STATE.subtipoPrecio = total;
    STATE.subtipoPrecioCOP = totalCOP;   // pesos del catálogo (Alejandro los muestra en Colombia; PRODIGY = el mismo total)
    STATE.odontograma = items; STATE.guia = g;
    orden = hay ? { v: 1, nomenclatura: window.Dientes ? Dientes.preferido() : 'fdi', proceso: 'Diseño CAD',
      piezas: items.map(function (it) { return { fdi: +it.d, indicacion: it.ind, material: it.mat || null, codigo_exocad: it.cod || null, proceso: it.proc || null, tono: it.tono || null, implante: it.impl || null, barra_interna: it.barra || null, encia: it.encia || null }; }),
      guia: g ? { tipo: g.tipo, nombre: gNom, sistema: g.sistema || null, soporte: g.soporte || null, guiado: g.guiado || null, manga: g.manga || null, pide: g.pide || 'guia', dientes: g.dientes || [], nota: g.nota || null, implantes: g.implantes || {}, arcada: g.arcada || null, abordaje: g.abordaje || null } : null,
      modelo: m } : null;
    activo = !!hay;
    var cc = document.getElementById('cantidad'); if (cc) cc.value = 1;
    // Archivos requeridos según lo marcado (implantes → scan body; férula/dentadura → mordida; si no, corona)
    if (hay && typeof renderArchivosRequeridos === 'function') {
      var tiene = function (re) { return cobrables.some(function (it) { return re.test(it.ind) || (it.impl && re.test(it.impl)); }); };
      var base = g ? ((C.archivosGuia || {})[g.arcada === 'edentulo' ? 'edentulo' : 'dientes'] || 'guia_1') : tiene(/Pilar|barra|Atache|Offset|aditamiento|Atornillado/i) ? 'corona_ator' : tiene(/Férula/) ? 'ferula' : tiene(/Carilla|Mockup|Encerado/) ? 'carilla' : 'corona';
      try { renderArchivosRequeridos(base); } catch (e) {}
    }
    var rp = resumenEl();
    if (rp) {
      var txt = [];
      if (cobrables.length) txt.push(T.unid(cobrables.length) + ': ' + mostrar(piezasFDI));
      if (g) txt.push((g.pide === 'plan' ? T.plan : T.guia) + ': ' + gNom + (g.dientes && g.dientes.length ? ' (' + mostrar(g.dientes.map(String)) + ')' : ''));
      if (m) txt.push(T.modelo + ': ' + (m.texto || mNom.replace(/^Modelo impreso: /, '')));
      if (cotizar.length) txt.push(T.cot + ': ' + cotizar.map(function (c) { return c === 'modelo impreso' ? T.mDis : c; }).join(', '));
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
      try { var cc = cat(), sc = cc && cc[STATE.categoriaKey] && cc[STATE.categoriaKey].subtipos && cc[STATE.categoriaKey].subtipos[STATE.subtipoId]; STATE.subtipoPrecioCOP = sc ? cop(sc, STATE.subtipoId) : null; } catch (e) { STATE.subtipoPrecioCOP = null; }
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
  // Detalle completo (material, proceso, tipo de implante por diente) para las notas del pedido y el laboratorio
  window._odoDetalle = function () { return activo ? detalle : ''; };

  // Lo que usan la confirmación, el WhatsApp y el pedido (pedidos.piezas en FDI)
  window._piezasFDI = function () { return activo && piezasFDI.length ? piezasFDI.slice() : null; };
  window._piezasTexto = function () {
    if (!activo || !piezasFDI.length) return '';
    var s = window.Dientes ? Dientes.preferido() : 'fdi';
    return s === 'fdi' ? piezasFDI.join(', ') + ' (FDI)' : Dientes.texto(piezasFDI, s) + ' (' + ({ universal: 'Universal', palmer: 'Palmer' }[s]) + ') = FDI ' + piezasFDI.join(', ');
  };
})();
