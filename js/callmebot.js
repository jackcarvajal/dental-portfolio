/**
 * Callmebot — Notificaciones automáticas a WhatsApp PRODIGY
 * Documentación: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 *
 * ACTIVACIÓN (una sola vez):
 * 1. Abre WhatsApp con el número 3212816716
 * 2. Envía "I allow callmebot to send me messages" al +34 644 59 75 34
 * 3. Recibirás tu apikey — reemplaza CALLMEBOT_APIKEY abajo
 */

const CALLMEBOT_PHONE  = '573212816716'; // WhatsApp PRODIGY Lab
const CALLMEBOT_APIKEY = 'PENDIENTE';    // ← reemplazar con tu apikey de Callmebot

/**
 * Envía notificación WA al lab via Callmebot
 * @param {string} mensaje - Texto del mensaje (máx 1000 chars)
 */
async function notifProdigy(mensaje) {
  if (!CALLMEBOT_APIKEY || CALLMEBOT_APIKEY === 'PENDIENTE') {
    console.warn('[Callmebot] API key no configurada. Activa Callmebot primero.');
    return false;
  }
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${encodeURIComponent(mensaje)}&apikey=${CALLMEBOT_APIKEY}`;
    await fetch(url, { mode: 'no-cors' });
    return true;
  } catch(e) {
    console.warn('[Callmebot] Error:', e.message);
    return false;
  }
}

/* ── MENSAJES PREDEFINIDOS ── */

/** Doctor envió un pedido nuevo */
function notif_nuevoPedido(doctor, servicio, material, unidades, precio) {
  return notifProdigy(
    `🔔 *NUEVO PEDIDO* — Portal Doctor\n` +
    `👨‍⚕️ Doctor: ${doctor}\n` +
    `🦷 Servicio: ${servicio} / ${material}\n` +
    `🔢 Unidades: ${unidades}\n` +
    `💰 Estimado: ${precio}\n` +
    `👉 Admin: prodigylabdental.com/app/panel-interno-operaciones`
  );
}

/** Doctor subió comprobante de pago */
function notif_pagoSubido(codigo, doctor, total) {
  return notifProdigy(
    `💳 *COMPROBANTE RECIBIDO* — ${codigo}\n` +
    `👨‍⚕️ Doctor: ${doctor}\n` +
    `💰 Total: ${total}\n` +
    `✅ Acción: Verificar y confirmar pago\n` +
    `👉 Admin: prodigylabdental.com/app/panel-interno-operaciones`
  );
}

/** Doctor aprobó el diseño */
function notif_disenoAprobado(codigo, doctor) {
  return notifProdigy(
    `✅ *DISEÑO APROBADO* — ${codigo}\n` +
    `👨‍⚕️ Doctor: ${doctor}\n` +
    `📦 Acción: Proceder a fresado/producción\n` +
    `👉 Admin: prodigylabdental.com/app/panel-interno-operaciones`
  );
}

/** Doctor solicitó cambios */
function notif_cambiosSolicitados(codigo, doctor, notas, revision) {
  return notifProdigy(
    `✏️ *CAMBIOS SOLICITADOS* — ${codigo} (Rev ${revision}/2)\n` +
    `👨‍⚕️ Doctor: ${doctor}\n` +
    `📝 Notas: ${notas}\n` +
    `⏱ Responder en ${revision >= 2 ? '1h' : '15 min'}\n` +
    `👉 Admin: prodigylabdental.com/app/panel-interno-operaciones`
  );
}

/** Doctor subió fotos de feedback */
function notif_fotosSubidas(codigo, doctor, numFotos) {
  return notifProdigy(
    `📸 *FOTOS DE FEEDBACK* — ${codigo}\n` +
    `👨‍⚕️ Doctor: ${doctor}\n` +
    `🖼 ${numFotos} foto(s) subida(s) para revisión\n` +
    `👉 Admin: prodigylabdental.com/app/panel-interno-operaciones`
  );
}

/** Recordatorio SLA vencido */
function notif_slaVencido(codigo, servicio, minutos) {
  return notifProdigy(
    `🚨 *SLA VENCIDO* — ${codigo}\n` +
    `🦷 Servicio: ${servicio}\n` +
    `⏰ Han pasado ${minutos} minutos sin respuesta\n` +
    `👉 Admin: prodigylabdental.com/app/panel-interno-operaciones`
  );
}
