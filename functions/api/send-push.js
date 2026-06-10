/**
 * PRODIGY — Envío de Web Push Notification via OneSignal
 * POST /api/send-push
 *
 * Envía notificación push a staff cuando:
 * - Llega un pedido nuevo
 * - Un referido hace su primer pedido
 * - Una cotización fue aceptada
 *
 * Env vars: ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY, CRON_SECRET
 */

const CORS = {
  'Access-Control-Allow-Origin':  'https://prodigylabdental.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type':                 'application/json',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Auth — solo desde CRON o admin interno
  const secret = request.headers.get('x-cron-secret');
  const admin  = request.headers.get('x-admin-token');
  if (secret !== env.CRON_SECRET && admin !== env.ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: CORS });
  }

  if (!env.ONESIGNAL_APP_ID || !env.ONESIGNAL_REST_API_KEY) {
    return new Response(JSON.stringify({ ok: false, reason: 'OneSignal no configurado' }), { headers: CORS });
  }

  // Rate limit: 60 push / min
  const ip  = request.headers.get('CF-Connecting-IP') || 'server';
  const rlK = new Request('https://rl.internal/send-push_' + ip);
  const hit = await caches.default.match(rlK);
  if (hit) {
    const n = parseInt(await hit.text(), 10) || 0;
    if (n >= 60) return new Response(JSON.stringify({ ok: false, reason: 'rate-limit' }), { status: 429, headers: CORS });
    await caches.default.put(rlK, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=60' } }));
  } else {
    await caches.default.put(rlK, new Response('1', { headers: { 'Cache-Control': 'max-age=60' } }));
  }

  let body;
  try { body = await request.json(); } catch { body = {}; }

  const {
    titulo    = '🦷 PRODIGY — Nuevo pedido',
    mensaje   = 'Hay un caso nuevo esperando validación.',
    url       = '/app/panel-interno-operaciones.html',
    segmento  = 'staff',  // 'staff' | 'all' | email específico
  } = body;

  // Validar URL (solo dominio propio)
  const _own = /^https?:\/\/(www\.)?prodigylabdental\.com\//;
  const safeUrl = (_own.test(url) || url.startsWith('/')) ? url : '/app/panel-interno-operaciones.html';

  const payload = {
    app_id:   env.ONESIGNAL_APP_ID,
    headings: { en: titulo, es: titulo },
    contents: { en: mensaje, es: mensaje },
    url:      safeUrl.startsWith('/') ? `https://prodigylabdental.com${safeUrl}` : safeUrl,
    chrome_web_icon: 'https://prodigylabdental.com/assets/icons/icon-192.png',
  };

  // Segmentación
  if (segmento === 'all') {
    payload.included_segments = ['All'];
  } else {
    // Por defecto solo staff (tag role = staff/admin/operator)
    payload.filters = [
      { field: 'tag', key: 'role', relation: 'exists' }
    ];
  }

  try {
    const r = await fetch('https://onesignal.com/api/v1/notifications', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Basic ${env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    return new Response(JSON.stringify({ ok: r.ok, recipients: data.recipients, id: data.id }), { headers: CORS });
  } catch(e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { headers: CORS });
  }
}
