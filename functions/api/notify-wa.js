/**
 * Cloudflare Pages Function — Notificación WhatsApp automática al doctor
 * POST /api/notify-wa
 *
 * Construye el mensaje apropiado según estado_operativo y país del cliente,
 * devuelve la URL wa.me pre-rellenada. El front-end la abre con window.open().
 * Sin Meta API — funciona inmediatamente sin aprobación externa.
 *
 * Body: { pedido_id, nuevo_estado, codigo, nombre_doctor, whatsapp, pais,
 *         servicio, fecha_entrega, precio_total, recibo_url }
 */

const WA_PRODIGY = '573212816716';

const MSGS_ES = {
  WAITLIST_LAB:            (d) => `🧪 *Nuevo lab en waitlist*\n\n*Lab:* ${d.dr}\n*Ciudad/Volumen:* ${d.srv}\n\nRevisa: prodigylabdental.com/app/panel-interno-operaciones.html`,
  REFERIDO_PRIMER_PEDIDO:  (d) => `🎁 *¡Tu referido hizo su primer pedido!*\n\nHola Dr. ${d.dr}, tu colega ${d.srv} acaba de pagar su primer caso en PRODIGY.\n\n🏷️ Tu cupón de crédito: *${d.cod}*\nÚsalo en tu próximo pedido para descontar *$30.000 COP* automáticamente. Es de un solo uso y no caduca.\n\n_PRODIGY Lab Dental_`,
  EN_PRODUCCION:    (d) => `✅ *Caso #${d.cod} — Producción iniciada*\n\nHola Dr. ${d.dr}, tu caso ha superado la validación técnica y ya está en producción.\n\n📅 Entrega estimada: *${d.fecha}*\n🔬 Servicio: ${d.srv}\n\n_Cualquier novedad te notificamos. PRODIGY Lab Dental_`,
  FRESADO_INICIADO: (d) => `⚙️ *Caso #${d.cod} — Fresado en curso*\n\nHola Dr. ${d.dr}, iniciamos el fresado de tu caso. Estamos en la recta final.\n\n📅 Entrega estimada: *${d.fecha}*\n\n_PRODIGY Lab Dental_`,
  QA_APROBADO:      (d) => `🛡️ *Caso #${d.cod} — Control de calidad ✅*\n\nHola Dr. ${d.dr}, tu caso pasó el control de calidad exitosamente. Estamos programando el despacho.\n\n📅 Entrega estimada: *${d.fecha}*\n\n_PRODIGY Lab Dental_`,
  LISTO_DESPACHAR:  (d) => `📦 *Caso #${d.cod} — Empacado y listo*\n\nHola Dr. ${d.dr}, tu caso está empacado y listo para despacho. Nuestro mensajero saldrá pronto.\n\n_PRODIGY Lab Dental_`,
  EN_REPARTO:       (d) => `🏍️ *Caso #${d.cod} — En camino*\n\nHola Dr. ${d.dr}, nuestro mensajero ya va en camino con tu caso. Llegará hoy.\n\n📋 Recibo: ${d.recibo}\n\n_PRODIGY Lab Dental_`,
  ENTREGADO:        (d) => `🎉 *Caso #${d.cod} — Entregado*\n\nHola Dr. ${d.dr}, tu caso fue entregado exitosamente. ¡Gracias por confiar en PRODIGY!\n\n📄 Tu recibo: ${d.recibo}\n\n_Si tienes algún comentario, escríbenos al ${WA_PRODIGY}_`,
};

const MSGS_EN = {
  WAITLIST_LAB:            (d) => `🧪 *New lab on waitlist*\n\n*Lab:* ${d.dr}\n*City/Volume:* ${d.srv}\n\nReview: prodigylabdental.com/app/panel-interno-operaciones.html`,
  REFERIDO_PRIMER_PEDIDO:  (d) => `🎁 *Your referral made their first order!*\n\nHi Dr. ${d.dr}, your colleague ${d.srv} just paid their first case at PRODIGY.\n\n🏷️ Your credit coupon: *${d.cod}*\nApply it on your next order for an automatic *$30,000 COP* discount. Single use, no expiry.\n\n_PRODIGY Lab Dental_`,
  EN_PRODUCCION:    (d) => `✅ *Case #${d.cod} — Production started*\n\nHello Dr. ${d.dr}, your case passed technical validation and is now in production.\n\n📅 Estimated delivery: *${d.fecha}*\n🔬 Service: ${d.srv}\n\n_PRODIGY Lab Dental_`,
  FRESADO_INICIADO: (d) => `⚙️ *Case #${d.cod} — Milling in progress*\n\nHello Dr. ${d.dr}, we have started milling your case. Final stretch!\n\n📅 Estimated delivery: *${d.fecha}*\n\n_PRODIGY Lab Dental_`,
  QA_APROBADO:      (d) => `🛡️ *Case #${d.cod} — Quality control passed ✅*\n\nHello Dr. ${d.dr}, your case passed our quality control. Scheduling shipment now.\n\n📅 Estimated delivery: *${d.fecha}*\n\n_PRODIGY Lab Dental_`,
  LISTO_DESPACHAR:  (d) => `📦 *Case #${d.cod} — Packed and ready*\n\nHello Dr. ${d.dr}, your case is packed and ready for dispatch.\n\n_PRODIGY Lab Dental_`,
  EN_REPARTO:       (d) => `🏍️ *Case #${d.cod} — On the way*\n\nHello Dr. ${d.dr}, our courier is on the way with your case. Arriving today.\n\n📋 Receipt: ${d.recibo}\n\n_PRODIGY Lab Dental_`,
  ENTREGADO:        (d) => `🎉 *Case #${d.cod} — Delivered*\n\nHello Dr. ${d.dr}, your case was successfully delivered. Thank you for trusting PRODIGY!\n\n📄 Your receipt: ${d.recibo}\n\n_For any questions, reach us at +${WA_PRODIGY}_`,
};

function corsHeaders(origin) {
  const allowed = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'];
  const ok = allowed.includes(origin) || origin.includes('.pages.dev') || origin.includes('localhost');
  return {
    'Access-Control-Allow-Origin':  ok ? origin : 'https://prodigylabdental.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

export async function onRequestPost(context) {
  const { request } = context;
  const origin = request.headers.get('Origin') || '';
  const cors   = corsHeaders(origin);

  // Rate limit: 20 req / 5 min por IP
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const cache = caches.default;
  const rlKey = new Request('https://rl.internal/notify-wa_' + ip);
  const rlHit = await cache.match(rlKey);
  if (rlHit) {
    const count = parseInt(await rlHit.text(), 10) || 0;
    if (count >= 20) {
      return new Response(JSON.stringify({ error: 'Demasiadas solicitudes.' }), { status: 429, headers: cors });
    }
    await cache.put(rlKey, new Response(String(count + 1), { headers: { 'Cache-Control': 'max-age=300' } }));
  } else {
    await cache.put(rlKey, new Response('1', { headers: { 'Cache-Control': 'max-age=300' } }));
  }

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: cors });
  }

  const {
    nuevo_estado, codigo, nombre_doctor, whatsapp,
    pais, servicio, fecha_entrega, recibo_url,
  } = body;

  if (!whatsapp || !nuevo_estado) {
    return new Response(JSON.stringify({ error: 'Faltan whatsapp y nuevo_estado' }), { status: 400, headers: cors });
  }

  const esIntl = pais && pais !== 'CO';
  const MSGS   = esIntl ? MSGS_EN : MSGS_ES;
  const fn     = MSGS[nuevo_estado];

  if (!fn) {
    return new Response(JSON.stringify({ skipped: true, reason: 'Estado sin mensaje definido' }), { status: 200, headers: cors });
  }

  const wa    = whatsapp.replace(/\D/g, '');
  const dr    = (nombre_doctor || '').split(' ')[0] || 'Doctor';
  const cod   = codigo || '—';
  const srv   = servicio || 'Servicio dental';
  const fecha = fecha_entrega
    ? new Date(fecha_entrega).toLocaleDateString(esIntl ? 'en-US' : 'es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    : (esIntl ? 'To be confirmed' : 'A confirmar');
  const _ownRecibo = /^https:\/\/(www\.)?prodigylabdental\.com\//;
  const recibo = (recibo_url && _ownRecibo.test(recibo_url)) ? recibo_url : `https://prodigylabdental.com/recibo-caso?id=${cod}${esIntl ? '&lang=en' : ''}`;

  const mensaje = fn({ cod, dr, srv, fecha, recibo });
  const waUrl   = `https://wa.me/${wa}?text=${encodeURIComponent(mensaje)}`;

  return new Response(JSON.stringify({ wa_url: waUrl, mensaje }), { status: 200, headers: cors });
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin') || '';
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}
