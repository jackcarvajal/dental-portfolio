/* caso-etapas.js — FUENTE ÚNICA de «en qué estación está el caso y de quién es el turno».
 * La usan el laboratorio 3D (js/laboratorio-3d.js) y el seguimiento público. Si cambia el flujo del
 * laboratorio (un estado nuevo, una estación nueva), se cambia AQUÍ y nada más.
 * Estados = valores de pedidos.estado_operativo (docs/CONTRATO-ESTADOS.md).
 * Uso: CasoEtapas.leer({ codigo, flujo, estado_operativo }) → { flujo, F, paso, turno, t, d, cta, ir, vehiculo, idx }
 */
(function () {
  'use strict';
  var ESTACIONES = {
    recepcion: { n: 'Recepción',    c: 0x00d2ff, pos: [-5.0, 0, -2.2] },
    diseno:    { n: 'Diseño CAD',   c: 0xD946A6, pos: [-1.7, 0, -2.9] },
    fresado:   { n: 'Fresado',      c: 0xD4AF37, pos: [ 1.7, 0, -2.9] },
    impresion: { n: 'Impresión 3D', c: 0x00d2ff, pos: [ 5.0, 0, -2.2] },
    terminado: { n: 'Terminado',    c: 0xD946A6, pos: [ 5.4, 0,  2.3] },
    calidad:   { n: 'Calidad',      c: 0x00FF41, pos: [ 2.7, 0,  2.5] },
    empaque:   { n: 'Empaque',      c: 0xD4AF37, pos: [ 0.0, 0,  2.55] },
    reparto:   { n: 'Reparto',      c: 0xD946A6, pos: [-2.7, 0,  2.5] },
    entrega:   { n: 'Entregado',    c: 0x00FF41, pos: [-5.4, 0,  2.3] }
  };
  // Tipo de trabajo → estaciones que recorre. CAD- solo diseño · PROD- fresado o impresión · LAB- completo
  var FLUJOS = {
    diseno:    { n: 'Solo diseño',           pasos: ['recepcion', 'diseno', 'entrega'], digital: true },
    fresado:   { n: 'Diseño + fresado',      pasos: ['recepcion', 'diseno', 'fresado', 'terminado', 'calidad', 'empaque', 'reparto', 'entrega'] },
    impresion: { n: 'Diseño + impresión 3D', pasos: ['recepcion', 'diseno', 'impresion', 'calidad', 'empaque', 'reparto', 'entrega'] },
    lab:       { n: 'Laboratorio completo',  pasos: ['recepcion', 'diseno', 'fresado', 'terminado', 'calidad', 'empaque', 'reparto', 'entrega'] }
  };
  var TURNO_TXT = { lab: 'Turno: PRODIGY', doctor: '⏸ Turno: tuyo, doctor', fin: '✓ Terminado', cancelado: 'Cancelado' };

  // El flujo guardado en el pedido manda; si falta, el prefijo del código
  function flujoDe(caso) {
    var f = String((caso && caso.flujo) || '').toLowerCase();
    if (FLUJOS[f]) return f;
    var cod = String((caso && caso.codigo) || '').toUpperCase();
    if (/^CAD-/.test(cod)) return 'diseno';
    if (/^LAB-/.test(cod)) return 'lab';
    return 'fresado';
  }

  function ubicar(flujo, e, vehiculo) {
    var F = FLUJOS[flujo] || FLUJOS.fresado;
    var fab = F.pasos.indexOf('fresado') >= 0 ? 'fresado' : F.pasos.indexOf('impresion') >= 0 ? 'impresion' : null;
    function R(paso, turno, t, d, cta, ir) { return { paso: paso, turno: turno, t: t, d: d, cta: cta || '', ir: ir || 'panel' }; }
    switch (String(e || 'VALIDACION_PENDIENTE').toUpperCase()) {
      case 'VALIDACION_PENDIENTE': return R('recepcion', 'lab', 'Validando tus archivos', 'Revisamos que los STL estén completos antes de empezar.');
      case 'ERROR_STL':            return R('recepcion', 'doctor', 'Tus archivos tienen un problema', 'Reenvía el escaneo para continuar; te escribimos el detalle por WhatsApp.', 'Escribir por WhatsApp', 'wa');
      case 'PAGO_NO_CONFIRMADO':   return R('recepcion', 'doctor', 'Pago por confirmar', 'Empezamos apenas confirmemos tu pago. En tu panel ves el valor y cómo pagar.', 'Ir a mi panel');
      case 'INCIDENCIA_CLIENTE':   return R('recepcion', 'doctor', 'Necesitamos un dato tuyo', 'Tenemos una pregunta sobre tu caso; escríbenos para seguir.', 'Escribir por WhatsApp', 'wa');
      case 'EN_DISENO':            return R('diseno', 'lab', 'Diseñando tu caso', 'El diseñador trabaja tu restauración en Exocad.');
      case 'DISENO_FINALIZADO':    return R('diseno', 'lab', 'Revisión interna del diseño', 'Lo verificamos antes de enviártelo.');
      case 'REVISION_CLIENTE':     return R('diseno', 'doctor', 'Tu diseño está listo para revisar', 'Apruébalo o pide cambios (2 revisiones sin costo) desde tu panel de cliente; el caso sigue apenas respondas.', 'Revisar y aprobar en mi panel');
      case 'CAMBIOS_SOLICITADOS':  return R('diseno', 'lab', 'Aplicando tus cambios', 'Ajustamos el diseño según lo que pediste.');
      case 'DISENO_APROBADO':      return fab ? R(fab, 'lab', fab === 'fresado' ? 'En cola de fresado' : 'En cola de impresión', 'Diseño aprobado: tu caso entra a la máquina.')
                                              : R('entrega', 'lab', 'Diseño aprobado', 'Preparamos tus archivos finales (STL y visor 3D).');
      case 'FAB_CONFIRMADA':       return R(fab || 'fresado', 'lab', 'Fabricación confirmada', 'Tu caso entra a producción.');
      case 'FRESADO_INICIADO':     return R('fresado', 'lab', 'Fresando tu restauración', 'La fresadora de 5 ejes talla tu caso en zirconio.');
      case 'EN_IMPRESION':         return R('impresion', 'lab', 'Imprimiendo tu caso', 'Impresión en resina: modelos, guías o provisionales.');
      case 'EN_PRODUCCION':        return R(fab || 'fresado', 'lab', 'En producción', 'Tu caso se está fabricando.');
      case 'EN_ACABADO':           return R('terminado', 'lab', 'Terminado y maquillaje', 'Maquillaje, glaseado en horno y ajuste de contactos.');
      case 'QA_APROBADO':          return R('calidad', 'lab', 'Control de calidad', 'Revisamos ajuste, contactos y color, y tomamos fotos de evidencia.');
      case 'TERMINADO': case 'LISTO_DESPACHAR': case 'POR_DESPACHAR':
                                   return R('empaque', 'lab', 'Empacado y listo', 'Tu caso está empacado y etiquetado; sale en el próximo despacho.');
      case 'EN_REPARTO': {
        var r = vehiculo === 'camion'
          ? R('reparto', 'lab', 'En camino por transportadora', 'Va a tu ciudad con la transportadora; te enviamos el número de guía.')
          : R('reparto', 'lab', 'En camino a tu consultorio', 'Nuestro mensajero va en moto con tu caso.');
        r.vehiculo = vehiculo === 'camion' ? 'camion' : 'moto'; return r;
      }
      case 'NO_ENTREGADO':         return R('reparto', 'lab', 'Reprogramando la entrega', 'No pudimos entregar; te contactamos para una nueva hora.');
      case 'ENTREGADO':            return F.digital ? R('entrega', 'fin', 'Archivos entregados', 'Descárgalos desde tu portal cuando quieras.')
                                                    : R('entrega', 'fin', 'Entregado', 'Recibiste tu caso en el consultorio.');
      case 'CANCELADO_DOCTOR':     return R('recepcion', 'cancelado', 'Caso cancelado', 'Este caso se canceló a petición del doctor.');
      default:                     return R('recepcion', 'lab', 'Caso recibido', 'Estamos revisando tu orden.');
    }
  }

  function leer(caso) {
    var flujo = flujoDe(caso), F = FLUJOS[flujo];
    var u = ubicar(flujo, caso && caso.estado_operativo, caso && caso.vehiculo);
    u.flujo = flujo; u.F = F; u.idx = F.pasos.indexOf(u.paso);
    return u;
  }

  window.CasoEtapas = { ESTACIONES: ESTACIONES, FLUJOS: FLUJOS, TURNO_TXT: TURNO_TXT, flujoDe: flujoDe, ubicar: ubicar, leer: leer };
})();
