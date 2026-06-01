/**
 * PRODIGY — WhatsApp automático al cliente
 * POST /api/wa-auto
 *
 * Estrategia:
 *  1. Si CALLMEBOT_APIKEY configurado → envía directo via Callmebot (el doctor debe haberlo activado)
 *  2. Si no → devuelve {wa_url} para que el frontend lo abra manualmente
 *
 * Body: { whatsapp, mensaje, pedido_id?, codigo?, nuevo_estado? }
 *
 * Env vars: CALLMEBOT_APIKEY (opcional), SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

const WA_PRODIGY = '573212816716';

const ESTADO_MSG = {
  EN_PRODUCCION:   (cod,dr) => `✅ *Caso #${cod} en producción*\n\nHola Dr. ${dr}, tu caso ya está en producción en PRODIGY Lab Dental.\n\nTe avisamos cuando esté listo para entrega. Cualquier novedad: wa.me/${WA_PRODIGY}`,
  QA_APROBADO:     (cod,dr) => `🛡️ *Control de calidad ✅ — Caso #${cod}*\n\nHola Dr. ${dr}, tu caso superó el control de calidad. Estamos programando el despacho.\n\n_PRODIGY Lab Dental_`,
  LISTO_DESPACHAR: (cod,dr) => `📦 *Caso #${cod} listo para entrega*\n\nHola Dr. ${dr}, tu caso está empacado y listo. Nuestro equipo coordinará la entrega.\n\n_PRODIGY Lab Dental_`,
  EN_REPARTO:      (cod,dr) => `🏍️ *Caso #${cod} en camino*\n\nHola Dr. ${dr}, nuestro mensajero ya va en camino con tu caso. Llegará hoy.\n\n_PRODIGY Lab Dental_`,
  ENTREGADO:       (cod,dr) => `🎉 *Caso #${cod} entregado*\n\nHola Dr. ${dr}, tu caso fue entregado exitosamente. ¡Gracias por confiar en PRODIGY!\n\nCualquier pregunta: wa.me/${WA_PRODIGY}`,
  CAMBIOS_SOLICITADOS: (cod,dr) => `🔄 *Caso #${cod} — Cambios en proceso*\n\nHola Dr. ${dr}, recibimos tus notas de cambio y nuestro diseñador ya está trabajando en los ajustes.\n\n_PRODIGY Lab Dental_`,
  APROBADO_CLIENTE:(cod,dr) => `✅ *Diseño aprobado — Caso #${cod}*\n\nHola Dr. ${dr}, confirmamos que tu diseño fue aprobado. Iniciamos la siguiente etapa.\n\n_PRODIGY Lab Dental_`,
};

function corsHeaders(origin) {
  const allowed = ['https://prodigylabdental.com','https://www.prodigylabdental.com'];
  const ok = allowed.includes(origin) || origin.includes('.pages.dev') || origin.includes('localhost');
  return {
    'Access-Control-Allow-Origin': ok ? origin : 'https://prodigylabdental.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')||'') });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const cors = corsHeaders(origin);

  // Rate limit: 10 req/min por IP
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = new Request('https://rl.internal/wa-auto_' + ip);
  const rlHit = await caches.default.match(rlKey);
  if (rlHit) {
    const count = parseInt(await rlHit.text(), 10) || 0;
    if (count >= 10) return new Response(JSON.stringify({ error: 'Demasiadas solicitudes.' }), { status: 429, headers: cors });
    await caches.default.put(rlKey, new Response(String(count+1), { headers: { 'Cache-Control': 'max-age=60' } }));
  } else {
    await caches.default.put(rlKey, new Response('1', { headers: { 'Cache-Control': 'max-age=60' } }));
  }

  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: cors }); }

  const { whatsapp, mensaje: bodyMsg, nuevo_estado, codigo, nombre_doctor } = body;

  if (!whatsapp) return new Response(JSON.stringify({ error: 'Falta whatsapp' }), { status: 400, headers: cors });

  const wa = whatsapp.replace(/\D/g,'');
  if (!wa || wa.length < 10) return new Response(JSON.stringify({ error: 'Número inválido' }), { status: 400, headers: cors });

  // Construir mensaje
  const dr = (nombre_doctor||'').split(' ')[0] || 'Doctor';
  const cod = codigo || '—';
  let mensaje = bodyMsg;
  if (!mensaje && nuevo_estado && ESTADO_MSG[nuevo_estado]) {
    mensaje = ESTADO_MSG[nuevo_estado](cod, dr);
  }
  if (!mensaje) return new Response(JSON.stringify({ error: 'Sin mensaje para este estado' }), { status: 200, headers: cors });

  const waUrl = `https://wa.me/${wa}?text=${encodeURIComponent(mensaje)}`;

  // Intentar envío automático vía Callmebot
  const CALLMEBOT_KEY = env.CALLMEBOT_APIKEY;
  if (CALLMEBOT_KEY && CALLMEBOT_KEY !== 'PENDIENTE') {
    try {
      const cbUrl = `https://api.callmebot.com/whatsapp.php?phone=${wa}&text=${encodeURIComponent(mensaje)}&apikey=${CALLMEBOT_KEY}`;
      const res = await fetch(cbUrl, { method: 'GET', cf: { cacheEverything: false } });
      const text = await res.text();
      const enviado = res.ok && !text.toLowerCase().includes('error');

      // Marcar en Supabase si enviado
      if (enviado && body.pedido_id && env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
        await fetch(`${env.SUPABASE_URL}/rest/v1/notificaciones_internas?pedido_id=eq.${body.pedido_id}&destinatario_user_id=not.is.null`, {
          method: 'PATCH',
          headers: {
            'apikey': env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ wa_enviado: true, wa_at: new Date().toISOString() }),
        }).catch(()=>{});
      }

      return new Response(JSON.stringify({
        enviado,
        metodo: 'callmebot',
        wa_url: waUrl,
        callmebot_response: text.slice(0,200),
      }), { status: 200, headers: cors });
    } catch(e) {
      // Callmebot falló → devolver URL para apertura manual
    }
  }

  // Fallback: devolver URL para abrir manualmente desde el frontend
  return new Response(JSON.stringify({
    enviado: false,
    metodo: 'wa_url',
    wa_url: waUrl,
    nota: 'CALLMEBOT_APIKEY no configurada — abrir URL manualmente',
  }), { status: 200, headers: cors });
}
