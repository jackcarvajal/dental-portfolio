/**
 * PRODIGY — Orden de trabajo y Remisión imprimibles (PDF)
 * v1.0 · 2026-07-18
 *
 * Genera dos documentos A4 listos para imprimir o guardar como PDF, usando el
 * diálogo nativo del navegador (sin librerías externas ni CDNs):
 *
 *   imprimirOrdenTrabajo(pedido)  → hoja que acompaña el caso en producción.
 *                                   SIN precios: la ve el operario/taller.
 *   imprimirRemision(pedido)      → remisión de entrega con firma del receptor.
 *
 * Uso:  <script src="../js/imprimir.js?v=20260718"></script>
 *       imprimirOrdenTrabajo(obj)   ó   imprimirRemision(obj)
 */
(function () {
  'use strict';

  var EMPRESA = {
    nombre: 'PRODIGY Lab Dental',
    lema: 'Laboratorio Dental Digital CAD/CAM',
    ciudad: 'Bogotá, Colombia',
    wa: '+57 321 281 6716',
    web: 'prodigylabdental.com'
  };

  function esc(s) {
    return String(s == null || s === '' ? '—' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fecha(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch (e) { return '—'; }
  }
  function money(n) {
    if (n == null || n === '') return '—';
    return '$' + Number(n).toLocaleString('es-CO');
  }

  /* Hoja de estilos A4 — pensada para papel, no para pantalla */
  var CSS = ''
    + '@page{size:A4;margin:14mm;}'
    + '*{box-sizing:border-box;margin:0;padding:0;}'
    + 'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:#111;font-size:12px;line-height:1.5;}'
    + '.hoja{max-width:182mm;margin:0 auto;}'
    + '.top{display:flex;justify-content:space-between;align-items:flex-start;'
    + 'border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:16px;}'
    + '.marca{font-size:20px;font-weight:800;letter-spacing:-.3px;}'
    + '.marca span{color:#8a6d1f;}'
    + '.lema{font-size:10px;color:#555;margin-top:2px;}'
    + '.doc{text-align:right;}'
    + '.doc .t{font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:1px;}'
    + '.doc .cod{font-family:ui-monospace,Menlo,monospace;font-size:16px;font-weight:700;margin-top:3px;}'
    + '.doc .f{font-size:10px;color:#555;margin-top:2px;}'
    + '.grid{display:grid;grid-template-columns:1fr 1fr;gap:0 18px;margin-bottom:14px;}'
    + '.campo{border-bottom:1px solid #ddd;padding:7px 0;}'
    + '.campo .k{font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:#666;font-weight:700;}'
    + '.campo .v{font-size:13px;font-weight:600;margin-top:1px;}'
    + '.full{grid-column:1/-1;}'
    + '.caja{border:1px solid #bbb;border-radius:4px;padding:10px 12px;margin-top:12px;}'
    + '.caja .k{font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:#666;font-weight:700;margin-bottom:4px;}'
    + '.notas{min-height:22mm;}'
    + '.chk{display:flex;gap:20px;margin-top:8px;flex-wrap:wrap;}'
    + '.chk div{font-size:11px;}'
    + '.chk i{display:inline-block;width:11px;height:11px;border:1.4px solid #333;margin-right:5px;vertical-align:-1px;}'
    + '.firmas{display:flex;gap:26px;margin-top:20mm;}'
    + '.firma{flex:1;border-top:1px solid #333;padding-top:5px;font-size:10px;color:#444;text-align:center;}'
    + '.pie{margin-top:14px;border-top:1px solid #ddd;padding-top:8px;'
    + 'font-size:9.5px;color:#666;display:flex;justify-content:space-between;}'
    + '.aviso{background:#f4f0e2;border-left:3px solid #8a6d1f;padding:8px 10px;font-size:10.5px;margin-top:12px;}'
    + '@media screen{body{background:#eee;padding:20px;}.hoja{background:#fff;padding:16mm;box-shadow:0 2px 12px rgba(0,0,0,.2);}}';

  function cabecera(titulo, p) {
    return '<div class="top"><div>'
      + '<div class="marca">PRODIGY <span>Lab Dental</span></div>'
      + '<div class="lema">' + EMPRESA.lema + ' · ' + EMPRESA.ciudad + '</div>'
      + '</div><div class="doc"><div class="t">' + titulo + '</div>'
      + '<div class="cod">' + esc(p.codigo) + '</div>'
      + '<div class="f">Emitido: ' + fecha(new Date().toISOString()) + '</div>'
      + '</div></div>';
  }
  function campo(k, v, full) {
    return '<div class="campo' + (full ? ' full' : '') + '"><div class="k">' + k + '</div>'
      + '<div class="v">' + esc(v) + '</div></div>';
  }
  function pie() {
    return '<div class="pie"><span>' + EMPRESA.nombre + ' · ' + EMPRESA.web + '</span>'
      + '<span>WhatsApp ' + EMPRESA.wa + '</span></div>';
  }

  function abrir(titulo, cuerpo) {
    var w = window.open('', '_blank');
    if (!w) { alert('El navegador bloqueó la ventana. Permite las ventanas emergentes para imprimir.'); return; }
    w.document.write('<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">'
      + '<title>' + titulo + '</title><style>' + CSS + '</style></head><body>'
      + '<div class="hoja">' + cuerpo + '</div>'
      + '<script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script>'
      + '</body></html>');
    w.document.close();
  }

  /* ── ORDEN DE TRABAJO — acompaña el caso en producción (SIN precios) ── */
  window.imprimirOrdenTrabajo = function (p) {
    p = p || {};
    var cuerpo = cabecera('Orden de trabajo', p)
      + '<div class="grid">'
      + campo('Doctor / Cliente', p.nombre_doctor || p.nombre_cliente)
      + campo('Fecha de ingreso', fecha(p.created_at))
      + campo('Tipo de trabajo', p.tipo_trabajo)
      + campo('Flujo', p.flujo)
      + campo('Material', p.material)
      + campo('Color / Vita', p.color_vita)
      + campo('Estado actual', p.estado_operativo || p.estado)
      + campo('Área asignada', p.departamento_actual)
      + '</div>'
      + '<div class="caja"><div class="k">Indicaciones del caso</div>'
      + '<div class="notas">' + esc(p.notas_cambios || '') + '</div></div>'
      + '<div class="caja"><div class="k">Control de producción</div><div class="chk">'
      + '<div><i></i>Diseño CAD</div><div><i></i>Fresado</div><div><i></i>Impresión 3D</div>'
      + '<div><i></i>Taller / acabado</div><div><i></i>Control de calidad</div><div><i></i>Empaque</div>'
      + '</div></div>'
      + '<div class="aviso">Documento interno de producción. <b>No incluye precios</b> ni datos de contacto del paciente.</div>'
      + '<div class="firmas"><div class="firma">Operario responsable</div>'
      + '<div class="firma">Control de calidad</div></div>'
      + pie();
    abrir('Orden de trabajo ' + (p.codigo || ''), cuerpo);
  };

  /* ── REMISIÓN DE ENTREGA — la firma quien recibe ───────────────────── */
  window.imprimirRemision = function (p) {
    p = p || {};
    var cuerpo = cabecera('Remisión de entrega', p)
      + '<div class="grid">'
      + campo('Entregar a', p.nombre_doctor || p.nombre_cliente)
      + campo('Teléfono', p.telefono)
      + campo('Dirección de entrega', p.direccion, true)
      + campo('Tipo de trabajo', p.tipo_trabajo)
      + campo('Material', p.material)
      + campo('Fecha de despacho', fecha(new Date().toISOString()))
      + campo('Estado', p.estado_operativo || p.estado)
      + (p.precio_total != null
          ? campo('Valor del caso', money(p.precio_total)) + campo('Estado de pago', p.pago_estado)
          : '')
      + '</div>'
      + '<div class="caja"><div class="k">Contenido de la entrega</div>'
      + '<div class="notas">' + esc(p.notas_cambios || '') + '</div></div>'
      + '<div class="aviso">Verifique el contenido antes de firmar. Cualquier novedad debe reportarse el mismo día '
      + 'al WhatsApp ' + EMPRESA.wa + '.</div>'
      + '<div class="firmas"><div class="firma">Entregado por (mensajero)</div>'
      + '<div class="firma">Recibido por — nombre, C.C. y fecha</div></div>'
      + pie();
    abrir('Remisión ' + (p.codigo || ''), cuerpo);
  };

  /* Ayuda: imprimir por código, buscando el pedido en la base */
  window.imprimirPorCodigo = async function (codigo, tipo) {
    try {
      var sbc = (typeof sb !== 'undefined' && sb && sb.from) ? sb : window.sb;
      if (!sbc) { alert('No hay conexión con la base de datos.'); return; }
      var r = await sbc.from('pedidos').select('*').eq('codigo', codigo).limit(1);
      if (r.error || !r.data || !r.data.length) { alert('No se encontró el caso ' + codigo); return; }
      (tipo === 'remision' ? window.imprimirRemision : window.imprimirOrdenTrabajo)(r.data[0]);
    } catch (e) { alert('No se pudo generar el documento: ' + e.message); }
  };
})();
