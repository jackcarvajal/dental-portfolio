/* ── Dibujo del odontograma de un pedido (oct-2026) ──────────────────────────────────────────────────────────────
   Pinta pedidos.odontograma (orden por diente del flujo de diseño) como un arco dental en SVG: cada diente con el color
   de su indicación (los mismos de odontograma.html / exocad DentalDB) y su número FDI, más la leyenda y la tabla.
     OdontoDibujo.svg(orden)    → SVG del arco
     OdontoDibujo.leyenda(orden) → indicaciones usadas con su color
     OdontoDibujo.tabla(orden)  → tabla diente · indicación · material · tono · implante (+ guía)
   Todo el texto pasa por esc(): los datos vienen del formulario del doctor. */
(function () {
  'use strict';
  if (window.OdontoDibujo) return;
  // Posición de cada diente (FDI) en % del diagrama de odontograma.html
  var POS = { 11: [48.2, 7.2], 12: [42.2, 8.8], 13: [37.4, 12.3], 14: [33.8, 17.1], 15: [32, 22.3], 16: [30.2, 28.6], 17: [29.5, 37.2], 18: [29.6, 45.1],
    21: [55, 7.2], 22: [61, 8.8], 23: [65.7, 12.3], 24: [69.3, 17.1], 25: [71.3, 22.3], 26: [72.4, 28.6], 27: [72.4, 37.2], 28: [72.4, 45.1],
    31: [54.6, 93.5], 32: [59.2, 92.2], 33: [63, 89.8], 34: [66.5, 85.3], 35: [68.7, 79.7], 36: [71.3, 71.8], 37: [72, 63.5], 38: [72.8, 55.5],
    41: [49.4, 93.5], 42: [44.6, 92.2], 43: [40.5, 89.8], 44: [36.8, 85.3], 45: [34.6, 79.7], 46: [33.5, 71.8], 47: [31.3, 63.5], 48: [30.5, 55.5] };
  var COLOR = { 'Planificación de implantes': '#00d2ff', 'Plan de restauración': '#f0abfc', 'Diente ausente - plan de sustitución': '#c4b5fd', 'Diente de soporte para guía quirúrgica': '#5eead4',
    'Corona anatómica': '#D946A6', 'Cofia anatómica': '#00b3a4', 'Corona prensada': '#e0b23a', 'Corona cáscara de huevo (prov.)': '#a855f7', 'Overlay': '#8a95a3', 'Cofia': '#4fb477',
    'Póntico anatómico': '#e05252', 'Póntico cáscara de huevo (prov.)': '#c084fc', 'Póntico reducido': '#e07a52', 'Póntico prensado': '#4aa3df', 'Mockup': '#e08a8a', 'Incrustación/Onlay': '#4fb477', 'Inlay de grosor mínimo': '#4aa3df',
    'Carilla': '#2f7fd0', 'Encerado anatómico': '#4fb477', 'Encerado reducido': '#5fbf86', 'Encerado póntico': '#6f6fc9', 'Dentadura completa': '#c0c7d0', 'Esqueléticas parciales': '#8a95a3',
    'Férula de descarga': '#00b8dd', 'Corona telescópica primaria': '#e07a52', 'Corona telescópica secundaria': '#c98a5a', 'Atache': '#00b8dd', 'Pilar de barra': '#e0b23a',
    'Segmento de barra': '#a855f7', 'Subestructura Offset': '#c0c7d0', 'Pilar personalizado (abutment)': '#00b8dd', 'Pilar de aditamiento': '#e07a52', 'Antagonista': '#e0894a',
    'Diente adyacente': '#d4af37', 'Omitir en el puente': '#e5342e' };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function piezas(orden) { return (orden && Array.isArray(orden.piezas)) ? orden.piezas : []; }
  function porDiente(orden) { var m = {}; piezas(orden).forEach(function (x) { if (POS[x.fdi]) m[x.fdi] = x; }); return m; }

  function svg(orden) {
    var m = porDiente(orden), out = [];
    out.push('<svg viewBox="22 1 58 98" width="100%" style="max-width:300px;display:block" role="img" aria-label="Odontograma del pedido">');
    out.push('<line x1="51.6" y1="2" x2="51.6" y2="98" stroke="#334155" stroke-width=".25" stroke-dasharray="1 1"/>');
    out.push('<line x1="24" y1="50.3" x2="78" y2="50.3" stroke="#334155" stroke-width=".25" stroke-dasharray="1 1"/>');
    Object.keys(POS).forEach(function (f) {
      var p = POS[f], x = m[f], c = x ? (COLOR[x.indicacion] || '#94a3b8') : null;
      out.push('<g><title>' + esc(f + (x ? ' · ' + x.indicacion + (x.material ? ' (' + x.material + ')' : '') : '')) + '</title>' +
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.3" fill="' + (c || '#16202d') + '" stroke="' + (c ? '#0b1017' : '#334155') + '" stroke-width=".35"/>' +
        '<text x="' + p[0] + '" y="' + (p[1] + 0.95) + '" text-anchor="middle" font-size="2.7" font-weight="700" font-family="Arial,sans-serif" fill="' + (c ? '#0b1017' : '#64748b') + '">' + f + '</text></g>');
    });
    out.push('<text x="51.6" y="50.9" text-anchor="middle" font-size="2.2" fill="#475569" font-family="Arial,sans-serif">FDI</text>');
    out.push('</svg>');
    return out.join('');
  }
  function leyenda(orden) {
    var vistos = {};
    piezas(orden).forEach(function (x) { if (x.indicacion) vistos[x.indicacion] = (vistos[x.indicacion] || []).concat(x.fdi); });
    return '<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;font-size:.84rem">' + Object.keys(vistos).map(function (k) {
      return '<li style="display:flex;gap:8px;align-items:center"><span style="width:12px;height:12px;border-radius:50%;flex:none;background:' + (COLOR[k] || '#94a3b8') + '"></span>' +
        '<span><strong>' + esc(k) + '</strong> · ' + esc(vistos[k].sort(function (a, b) { return a - b; }).join(', ')) + '</span></li>';
    }).join('') + '</ul>';
  }
  function tabla(orden) {
    var filas = piezas(orden).slice().sort(function (a, b) { return a.fdi - b.fdi; }).map(function (x) {
      return '<tr style="border-top:1px solid rgba(255,255,255,.08)"><td style="padding:6px 8px;font-weight:800">' + esc(x.fdi) + '</td><td style="padding:6px 8px">' + esc(x.indicacion || '—') +
        '</td><td style="padding:6px 8px">' + esc((x.material || '—') + (x.proceso ? ' · ' + x.proceso : '')) + '</td><td style="padding:6px 8px">' + esc(x.tono || '—') + '</td><td style="padding:6px 8px">' + esc(x.implante || '—') + '</td></tr>';
    }).join('');
    var g = orden && orden.guia, mo = orden && orden.modelo;
    return '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.86rem"><thead><tr style="text-align:left;color:#94a3b8">' +
      '<th style="padding:6px 8px">Diente</th><th style="padding:6px 8px">Indicación</th><th style="padding:6px 8px">Material</th><th style="padding:6px 8px">Tono</th><th style="padding:6px 8px">Implante</th></tr></thead><tbody>' +
      filas + '</tbody></table></div>' +
      (g ? '<p style="margin-top:10px;font-size:.86rem"><strong>' + (g.pide === 'plan' ? 'Planificación de implantes' : 'Guía quirúrgica') + ':</strong> ' + esc(g.nombre || g.tipo) + ' · ' + esc([g.sistema, g.soporte, g.pines ? 'con pines de anclaje' : '', g.guiado, g.manga].filter(Boolean).join(' · ')) + (g.dientes && g.dientes.length ? ' · dientes ' + esc(g.dientes.join(', ')) : '') + '</p>' : '') +
      (mo ? '<p style="margin-top:6px;font-size:.86rem"><strong>Modelo impreso:</strong> ' + esc(mo.resumen || [mo.tipo, mo.articulador || 'sin articulador', mo.articulador ? mo.version : ''].filter(Boolean).join(' · ')) + '</p>' : '');
  }
  window.OdontoDibujo = { svg: svg, leyenda: leyenda, tabla: tabla, tiene: function (o) { return !!(o && (piezas(o).length || o.guia || o.modelo)); } };
})();
