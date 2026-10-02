/**
 * Cloudflare Pages Function — WhatsApp al doctor según el estado del caso
 * POST /api/notify-wa
 *
 * Dos modos (el panel no cambia según cuál esté activo):
 *  1. OFICIAL — WhatsApp Cloud API de Meta. Si existen WA_TOKEN y WA_PHONE_ID y quien llama es del
 *     equipo, se envía solo con una plantilla aprobada (docs/WHATSAPP-OFICIAL.md) → { enviado:true }.
 *  2. MANUAL (respaldo) — devuelve wa_url (wa.me con el texto listo) y el panel lo abre para enviarlo.
 *
 * El enlace de seguimiento lleva la llave del caso (hash_seguridad) SOLO si quien llama es del equipo
 * (sesión verificada): /seguimiento-caso no muestra un caso sin su llave, y el enlace viejo
 * `seguimiento-caso?pedido=COD` le decía al doctor "caso no encontrado".
 *
 * Body: { nuevo_estado, codigo, nombre_doctor, whatsapp, pais, servicio, fecha_entrega, recibo_url }
 * Header opcional: Authorization: Bearer <sesión del equipo>
 * Env: SUPABASE_SERVICE_ROLE_KEY | SUPABASE_SERVICE_KEY · WA_TOKEN, WA_PHONE_ID, WA_GRAPH_VERSION (opcionales)
 */
import { cfg, adminH, usuarioDe, ADMIN_EMAILS } from './reportar-problema.js';

const WA_PRODIGY = '573212816716';
const SITIO = 'https://prodigylabdental.com';

const MSGS_ES = {
  WAITLIST_LAB:            (d) => `🧪 *Nuevo lab en waitlist*\n\n*Lab:* ${d.dr}\n*Ciudad/Volumen:* ${d.srv}\n\nRevisa: prodigylabdental.com/app/panel-interno-operaciones.html`,
  REFERIDO_PRIMER_PEDIDO:  (d) => `🎁 *¡Tu referido hizo su primer pedido!*\n\nHola Dr. ${d.dr}, tu colega ${d.srv} acaba de pagar su primer caso en PRODIGY.\n\n🏷️ Tu cupón de crédito: *${d.cod}*\nÚsalo en tu próximo pedido para descontar *$30.000 COP* automáticamente. Es de un solo uso y no caduca.\n\n_PRODIGY Lab Dental_`,
  ERROR_STL:        (d) => `⚠️ *Caso #${d.cod} — Necesitamos tus archivos*\n\nHola Dr. ${d.dr}, los archivos de tu caso llegaron incompletos o con un problema. Reenvíalos para continuar.\n\n📍 Tu caso: ${d.link}\n\n_PRODIGY Lab Dental_`,
  EN_DISENO:        (d) => `🎨 *Caso #${d.cod} — Empezamos el diseño*\n\nHola Dr. ${d.dr}, tu caso ya está en manos del diseñador.\n\n📍 Síguelo aquí: ${d.link}\n\n_PRODIGY Lab Dental_`,
  REVISION_CLIENTE: (d) => `✨ *Caso #${d.cod} — Tu diseño está listo*\n\nHola Dr. ${d.dr}, tu diseño está listo para revisar. Apruébalo o pide cambios (2 revisiones incluidas):\n\n👉 ${d.accion}\n\n_PRODIGY Lab Dental_`,
  DISENO_LISTO:     (d) => `✨ *Caso #${d.cod} — Tu diseño está listo*\n\nHola Dr. ${d.dr}, tu diseño está listo para revisar. Apruébalo o pide cambios (2 revisiones incluidas):\n\n👉 ${d.accion}\n\n_PRODIGY Lab Dental_`,
  CAMBIOS_SOLICITADOS: (d) => `🔄 *Caso #${d.cod} — Aplicando tus cambios*\n\nHola Dr. ${d.dr}, recibimos tus notas y el diseñador ya está haciendo los ajustes.\n\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`,
  EN_PRODUCCION:    (d) => `✅ *Caso #${d.cod} — Producción iniciada*\n\nHola Dr. ${d.dr}, tu caso superó la validación técnica y ya está en producción.\n\n📅 Entrega estimada: *${d.fecha}*\n🔬 Servicio: ${d.srv}\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`,
  FRESADO_INICIADO: (d) => `⚙️ *Caso #${d.cod} — Fresado en curso*\n\nHola Dr. ${d.dr}, iniciamos el fresado de tu caso. Estamos en la recta final.\n\n📅 Entrega estimada: *${d.fecha}*\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`,
  EN_ACABADO:       (d) => `🎨 *Caso #${d.cod} — Terminado y maquillaje*\n\nHola Dr. ${d.dr}, tu caso está en el horno de glaseado: maquillaje, color final y ajuste de contactos.\n\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`,
  EN_IMPRESION:     (d) => `🖨️ *Caso #${d.cod} — Impresión en curso*\n\nHola Dr. ${d.dr}, tu caso se está imprimiendo.\n\n📅 Entrega estimada: *${d.fecha}*\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`,
  QA_APROBADO:      (d) => `🛡️ *Caso #${d.cod} — Control de calidad ✅*\n\nHola Dr. ${d.dr}, tu caso pasó el control de calidad. Estamos programando el despacho.\n\n📅 Entrega estimada: *${d.fecha}*\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`,
  LISTO_DESPACHAR:  (d) => `📦 *Caso #${d.cod} — Empacado y listo*\n\nHola Dr. ${d.dr}, tu caso está empacado y listo para despacho. Nuestro mensajero saldrá pronto.\n\n_PRODIGY Lab Dental_`,
  EN_REPARTO:       (d) => d.envio?.tipo_envio === 'transportadora'
    ? `🚚 *Caso #${d.cod} — En camino*\n\nHola Dr. ${d.dr}, tu caso va por ${d.envio.transportadora || 'transportadora'}, guía *${d.envio.guia || '—'}*.\n\n🔎 Rastréalo: ${urlRastreo(d.envio.transportadora, d.envio.guia)}\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`
    : `🏍️ *Caso #${d.cod} — En camino*\n\nHola Dr. ${d.dr}, nuestro mensajero ya va en camino con tu caso. Llegará hoy.\n\n📋 Recibo: ${d.recibo}\n\n_PRODIGY Lab Dental_`,
  ENTREGADO:        (d) => `🎉 *Caso #${d.cod} — Entregado*\n\nHola Dr. ${d.dr}, tu caso fue entregado exitosamente. ¡Gracias por confiar en PRODIGY!\n\n📄 Tu recibo: ${d.recibo}\n\n_Si tienes algún comentario, escríbenos al +${WA_PRODIGY}_`,
};

const MSGS_EN = {
  WAITLIST_LAB:            (d) => `🧪 *New lab on waitlist*\n\n*Lab:* ${d.dr}\n*City/Volume:* ${d.srv}\n\nReview: prodigylabdental.com/app/panel-interno-operaciones.html`,
  REFERIDO_PRIMER_PEDIDO:  (d) => `🎁 *Your referral made their first order!*\n\nHi Dr. ${d.dr}, your colleague ${d.srv} just paid their first case at PRODIGY.\n\n🏷️ Your credit coupon: *${d.cod}*\nApply it on your next order for an automatic *$30,000 COP* discount. Single use, no expiry.\n\n_PRODIGY Lab Dental_`,
  ERROR_STL:        (d) => `⚠️ *Case #${d.cod} — We need your files*\n\nHello Dr. ${d.dr}, your case files arrived incomplete or with a problem. Please resend them to continue.\n\n📍 Your case: ${d.link}\n\n_PRODIGY Lab Dental_`,
  EN_DISENO:        (d) => `🎨 *Case #${d.cod} — Design started*\n\nHello Dr. ${d.dr}, your case is now with our designer.\n\n📍 Track it: ${d.link}\n\n_PRODIGY Lab Dental_`,
  REVISION_CLIENTE: (d) => `✨ *Case #${d.cod} — Your design is ready*\n\nHello Dr. ${d.dr}, your design is ready for review. Approve it or request changes (2 revisions included):\n\n👉 ${d.accion}\n\n_PRODIGY Lab Dental_`,
  DISENO_LISTO:     (d) => `✨ *Case #${d.cod} — Your design is ready*\n\nHello Dr. ${d.dr}, your design is ready for review. Approve it or request changes (2 revisions included):\n\n👉 ${d.accion}\n\n_PRODIGY Lab Dental_`,
  CAMBIOS_SOLICITADOS: (d) => `🔄 *Case #${d.cod} — Applying your changes*\n\nHello Dr. ${d.dr}, we received your notes and the designer is working on them.\n\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`,
  EN_PRODUCCION:    (d) => `✅ *Case #${d.cod} — Production started*\n\nHello Dr. ${d.dr}, your case passed technical validation and is now in production.\n\n📅 Estimated delivery: *${d.fecha}*\n🔬 Service: ${d.srv}\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`,
  FRESADO_INICIADO: (d) => `⚙️ *Case #${d.cod} — Milling in progress*\n\nHello Dr. ${d.dr}, we have started milling your case. Final stretch!\n\n📅 Estimated delivery: *${d.fecha}*\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`,
  EN_ACABADO:       (d) => `🎨 *Case #${d.cod} — Finishing and staining*\n\nHello Dr. ${d.dr}, your case is in the glazing furnace: staining, final shade and contact adjustment.\n\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`,
  EN_IMPRESION:     (d) => `🖨️ *Case #${d.cod} — Printing in progress*\n\nHello Dr. ${d.dr}, your case is being printed.\n\n📅 Estimated delivery: *${d.fecha}*\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`,
  QA_APROBADO:      (d) => `🛡️ *Case #${d.cod} — Quality control passed ✅*\n\nHello Dr. ${d.dr}, your case passed our quality control. Scheduling shipment now.\n\n📅 Estimated delivery: *${d.fecha}*\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`,
  LISTO_DESPACHAR:  (d) => `📦 *Case #${d.cod} — Packed and ready*\n\nHello Dr. ${d.dr}, your case is packed and ready for dispatch.\n\n_PRODIGY Lab Dental_`,
  EN_REPARTO:       (d) => d.envio?.tipo_envio === 'transportadora'
    ? `🚚 *Case #${d.cod} — On the way*\n\nHello Dr. ${d.dr}, your case ships with ${d.envio.transportadora || 'a carrier'}, tracking *${d.envio.guia || '—'}*.\n\n🔎 Track it: ${urlRastreo(d.envio.transportadora, d.envio.guia)}\n📍 ${d.link}\n\n_PRODIGY Lab Dental_`
    : `🏍️ *Case #${d.cod} — On the way*\n\nHello Dr. ${d.dr}, our courier is on the way with your case. Arriving today.\n\n📋 Receipt: ${d.recibo}\n\n_PRODIGY Lab Dental_`,
  ENTREGADO:        (d) => `🎉 *Case #${d.cod} — Delivered*\n\nHello Dr. ${d.dr}, your case was successfully delivered. Thank you for trusting PRODIGY!\n\n📄 Your receipt: ${d.recibo}\n\n_For any questions, reach us at +${WA_PRODIGY}_`,
};

// Plantillas oficiales (deben existir y estar APROBADAS en WhatsApp Manager con estos nombres, en «es» y «en»).
// Botón de cada plantilla: URL dinámica https://prodigylabdental.com/{{1}} → aquí va la ruta del enlace.
const ETAPA_ES = { EN_DISENO: 'empezamos el diseño', CAMBIOS_SOLICITADOS: 'estamos aplicando sus cambios', EN_PRODUCCION: 'entró a producción',
  FRESADO_INICIADO: 'empezó el fresado', EN_ACABADO: 'está en terminado y maquillaje', EN_IMPRESION: 'empezó la impresión', QA_APROBADO: 'pasó el control de calidad', LISTO_DESPACHAR: 'está empacado y listo para despacho', EN_REPARTO: 'va en camino a su consultorio' };
const etapaReparto = (d, intl) => d.envio?.tipo_envio === 'transportadora'
  ? (intl ? `ships with ${d.envio.transportadora || 'a carrier'}, tracking ${d.envio.guia || '—'}` : `va por ${d.envio.transportadora || 'transportadora'}, guía ${d.envio.guia || '—'}`)
  : null;
const ETAPA_EN = { EN_DISENO: 'design has started', CAMBIOS_SOLICITADOS: 'we are applying your changes', EN_PRODUCCION: 'is now in production',
  FRESADO_INICIADO: 'milling has started', EN_ACABADO: 'is in finishing and staining', EN_IMPRESION: 'printing has started', QA_APROBADO: 'passed quality control', LISTO_DESPACHAR: 'is packed and ready to ship', EN_REPARTO: 'is on the way to your office' };
function plantillaDe(estado, d, intl) {
  const ruta = u => String(u || '').replace(/^https:\/\/(www\.)?prodigylabdental\.com\//, '');
  if (estado === 'REVISION_CLIENTE' || estado === 'DISENO_LISTO') return { name: 'prodigy_diseno_listo', body: [d.dr, d.cod], url: ruta(d.accion) };
  if (estado === 'ERROR_STL') return { name: 'prodigy_reenviar_archivos', body: [d.dr, d.cod], url: ruta(d.link) };
  if (estado === 'ENTREGADO') return { name: 'prodigy_caso_entregado', body: [d.dr, d.cod], url: ruta(d.recibo) };
  const etapa = (estado === 'EN_REPARTO' && etapaReparto(d, intl)) || (intl ? ETAPA_EN : ETAPA_ES)[estado];
  return etapa ? { name: 'prodigy_avance_caso', body: [d.dr, d.cod, etapa], url: ruta(d.link) } : null;
}
async function enviarOficial(env, wa, p, intl) {
  const components = [{ type: 'body', parameters: p.body.map(t => ({ type: 'text', text: String(t).slice(0, 120) })) }];
  if (p.url) components.push({ type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: p.url }] });
  const r = await fetch(`https://graph.facebook.com/${env.WA_GRAPH_VERSION || 'v23.0'}/${env.WA_PHONE_ID}/messages`, {
    method: 'POST', headers: { Authorization: `Bearer ${env.WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: wa, type: 'template', template: { name: p.name, language: { code: intl ? 'en' : 'es' }, components } }),
  });
  const j = await r.json().catch(() => ({}));
  if (r.ok && j.messages?.[0]?.id) return { ok: true, id: j.messages[0].id };
  console.error('[notify-wa] Cloud API:', r.status, j.error?.code, j.error?.message);   // detalle solo en el log
  return { ok: false };
}

// Del equipo = admin por email o cualquier rol de staff (no cliente ni cuenta de pruebas). Roles solo de app_metadata.
const esPersonal = u => !!u && (ADMIN_EMAILS.includes(String(u.email || '').toLowerCase())
  || [].concat(u.app_metadata?.roles || [], u.app_metadata?.role || []).some(r => r && !['client', 'test'].includes(r)));
// Colombia: 10 dígitos que empiezan por 3 → se antepone 57 (wa.me y Meta exigen el indicativo)
// Rastreo de la guía en la web de la transportadora (mismo mapa en js/caso-etapas.js)
const urlRastreo = (empresa, guia) => {
  const e = String(empresa || '').toLowerCase(), g = encodeURIComponent(String(guia || '').trim());
  if (!g) return '';
  if (e.includes('servientrega')) return `https://www.servientrega.com/wps/portal/rastreo-envio/detalle?id=${g}`;
  if (e.includes('coordinadora')) return `https://coordinadora.com/rastreo/rastreo-de-guia/detalle-de-rastreo-de-guia/?guia=${g}`;
  if (e.includes('tcc')) return 'https://tcc.com.co/rastreo/';
  return `https://www.google.com/search?q=${encodeURIComponent('rastrear guía ' + empresa + ' ' + guia)}`;
};
const normalizarWA = n => { const d = String(n || '').replace(/\D/g, ''); return d.length === 10 && d.startsWith('3') ? '57' + d : d; };

function corsHeaders(origin) {
  const allowed = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'];
  const ok = allowed.includes(origin) || /^https:\/\/([a-z0-9-]+\.)?dental-portfolio-em6\.pages\.dev$/.test(origin || '') || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
  return {
    'Access-Control-Allow-Origin':  ok ? origin : 'https://prodigylabdental.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const cors   = corsHeaders(origin);

  // Quién llama (sesión verificada; roles solo de app_metadata)
  const c = cfg(env);
  const yo = c.SERVICE ? await usuarioDe(request, c) : null;
  const personal = esPersonal(yo);

  // Rate limit por IP: 20 / 5 min sin sesión; 300 / 5 min para el equipo (Bandeja de WhatsApp)
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const cache = caches.default;
  const rlKey = new Request('https://rl.internal/notify-wa_' + ip);
  const rlHit = await cache.match(rlKey);
  if (rlHit) {
    const count = parseInt(await rlHit.text(), 10) || 0;
    if (count >= (personal ? 300 : 20)) {
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

  const wa    = normalizarWA(whatsapp);
  const dr    = String(nombre_doctor || '').trim().replace(/^(dr|dra|doctor|doctora)(\.\s*|\s+)/i, '').split(/\s+/)[0] || 'Doctor';   // sin «Dr. Dr.» si el nombre ya trae el título
  const cod   = codigo || '—';
  const srv   = servicio || 'Servicio dental';
  const fecha = fecha_entrega
    ? new Date(fecha_entrega).toLocaleDateString(esIntl ? 'en-US' : 'es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
    : (esIntl ? 'To be confirmed' : 'A confirmar');
  const _propio = /^https:\/\/(www\.)?prodigylabdental\.com\//;
  const recibo = (recibo_url && _propio.test(recibo_url)) ? recibo_url : `${SITIO}/recibo-caso?id=${encodeURIComponent(cod)}${esIntl ? '&lang=en' : ''}`;

  // Enlace de seguimiento: con la llave del caso solo si llama alguien del equipo
  let link = `${SITIO}/app/client-panel`, pedidoId = null;
  if (personal && codigo) {
    try {
      const r = await fetch(`${c.URL}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(codigo)}&select=id,hash_seguridad&limit=1`, { headers: adminH(c.SERVICE) });
      const [p] = r.ok ? await r.json() : [];
      if (p) pedidoId = p.id;
      if (p) link = `${SITIO}/seguimiento-caso?id=${encodeURIComponent(codigo)}${p.hash_seguridad ? '&key=' + encodeURIComponent(p.hash_seguridad) : ''}`;
    } catch (_) { /* queda el portal */ }
  }
  // Acción del doctor en la revisión: el enlace de aprobación que manda el panel (revision-express) o el seguimiento
  const accion = (recibo_url && _propio.test(recibo_url) && /revision-express/.test(recibo_url)) ? recibo_url : link;

  // En camino: ¿mensajero o transportadora? (último despacho del caso; solo para el equipo)
  let envio = null;
  if (personal && pedidoId && nuevo_estado === 'EN_REPARTO') {
    try {
      const r = await fetch(`${c.URL}/rest/v1/despachos?pedido_id=eq.${pedidoId}&select=tipo_envio,transportadora,guia&order=created_at.desc&limit=1`, { headers: adminH(c.SERVICE) });
      [envio] = r.ok ? await r.json() : [];
    } catch (_) { /* sin dato: mensaje de mensajero */ }
  }
  const d = { cod, dr, srv, fecha, recibo, link, accion, envio };
  const mensaje = fn(d);
  const waUrl   = `https://wa.me/${wa}?text=${encodeURIComponent(mensaje)}`;

  // Envío automático por la API oficial (si está configurada y quien llama es del equipo)
  // `solo_texto`: la Bandeja pide el mensaje para mostrarlo, sin enviarlo
  if (personal && env.WA_TOKEN && env.WA_PHONE_ID && !body.solo_texto) {
    const p = plantillaDe(nuevo_estado, d, esIntl);
    if (p) {
      const r = await enviarOficial(env, wa, p, esIntl).catch(() => ({ ok: false }));
      if (r.ok) {
        if (pedidoId) await fetch(`${c.URL}/rest/v1/avisos_whatsapp?pedido_id=eq.${pedidoId}&estado=eq.${encodeURIComponent(nuevo_estado)}&estado_envio=eq.pendiente`, {
          method: 'PATCH', headers: { ...adminH(c.SERVICE), Prefer: 'return=minimal' },
          body: JSON.stringify({ estado_envio: 'enviado', metodo: 'oficial', enviado_at: new Date().toISOString(), enviado_por: yo?.id || null }),
        }).catch(() => {});
        return new Response(JSON.stringify({ enviado: true, metodo: 'oficial', id: r.id, wa_url: waUrl, mensaje }), { status: 200, headers: cors });
      }
    }
  }

  // ¿Ya quedó en la Bandeja de WhatsApp? (lo encola el trigger al cambiar el estado). Si sí, el panel no abre
  // WhatsApp: lo envía la secretaria desde la Bandeja y así nadie lo manda dos veces.
  let en_bandeja = false;
  if (personal && pedidoId && !body.solo_texto) {
    try {
      const r = await fetch(`${c.URL}/rest/v1/avisos_whatsapp?pedido_id=eq.${pedidoId}&estado=eq.${encodeURIComponent(nuevo_estado)}&estado_envio=eq.pendiente&select=id&limit=1`, { headers: adminH(c.SERVICE) });
      en_bandeja = r.ok && (await r.json()).length > 0;
    } catch (_) { /* sin bandeja: el panel abre WhatsApp como antes */ }
  }
  return new Response(JSON.stringify({ enviado: false, metodo: 'wa_url', en_bandeja, wa_url: waUrl, mensaje }), { status: 200, headers: cors });
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin') || '';
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}
