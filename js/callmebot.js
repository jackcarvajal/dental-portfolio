/**
 * Avisos al equipo PRODIGY por WhatsApp desde el portal del doctor.
 *
 * Este archivo es PÚBLICO (lo descarga el navegador): aquí no va ningún número ni apikey.
 * Los avisos salen por /api/notify-staff (servidor): los números y las apikeys de CallMeBot viven en las
 * variables de Cloudflare (STAFF_1..3_PHONE / _APIKEY) y, si el WhatsApp no sale, llega por correo.
 *
 * Hasta el 23-nov-2026 este archivo llamaba a CallMeBot directo con una apikey 'PENDIENTE' → los avisos de
 * comprobante subido, diseño aprobado, cambios pedidos y pedido nuevo del portal NUNCA salían.
 */

function avisarEquipo(datos) {
  try {
    return fetch('/api/notify-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ panel: 'operaciones' }, datos)),
      keepalive: true
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  } catch (e) { return Promise.resolve(false); }
}

/* ── MENSAJES PREDEFINIDOS (mismos nombres que usan las páginas) ── */

/** Doctor envió un pedido nuevo desde el portal */
function notif_nuevoPedido(doctor, servicio, material, unidades, precio) {
  return avisarEquipo({
    tipo: 'Nuevo pedido (portal)', doctor: doctor, servicio: [servicio, material].filter(Boolean).join(' / '),
    codigo: 'PORTAL', contexto: 'Unidades: ' + (unidades || '—') + ' · Estimado: ' + (precio || '—')
  });
}

/** Doctor subió comprobante de pago */
function notif_pagoSubido(codigo, doctor, total) {
  return avisarEquipo({
    tipo: 'Comprobante de pago recibido', codigo: codigo, doctor: doctor, servicio: 'Pago',
    contexto: 'Total: ' + (total || '—') + ' · Verificar y confirmar el pago'
  });
}

/** Doctor aprobó el diseño */
function notif_disenoAprobado(codigo, doctor) {
  return avisarEquipo({
    tipo: 'Diseño aprobado', codigo: codigo, doctor: doctor, servicio: 'Diseño',
    contexto: 'Proceder a fresado / producción'
  });
}

/** Doctor solicitó cambios */
function notif_cambiosSolicitados(codigo, doctor, notas, revision) {
  return avisarEquipo({
    tipo: 'Cambios solicitados (rev ' + revision + '/2)', codigo: codigo, doctor: doctor, servicio: 'Diseño',
    contexto: 'Notas: ' + (notas || '—') + ' · Responder en ' + (revision >= 2 ? '1 h' : '15 min')
  });
}

/** Doctor subió fotos de feedback */
function notif_fotosSubidas(codigo, doctor, numFotos) {
  return avisarEquipo({
    tipo: 'Fotos de feedback', codigo: codigo, doctor: doctor, servicio: 'Feedback',
    contexto: (numFotos || 1) + ' foto(s) para revisión'
  });
}

/** Recordatorio SLA vencido */
function notif_slaVencido(codigo, servicio, minutos) {
  return avisarEquipo({
    tipo: 'SLA vencido', codigo: codigo, doctor: 'Sistema', servicio: servicio,
    contexto: 'Han pasado ' + minutos + ' minutos sin respuesta'
  });
}
