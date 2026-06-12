/**
 * PRODIGY — Recordatorio WA de cotización por vencer
 * POST /api/wa-cotizacion
 * Body: { whatsapp, nombre, total, codigo, dias }
 *
 * Llamar desde cron diario (junto a expire-cotizaciones).
 * Env vars: CALLMEBOT_APIKEY, CRON_SECRET
 */

const CORS_ALLOWED = ['https://prodigylabdental.com','https://www.prodigylabdental.com'];
const SURL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';

function cors(origin) {
  const ok = CORS_ALLOWED.includes(origin) || origin.includes('.pages.dev') || !origin;
  return { 'Access-Control-Allow-Origin': ok ? origin || '*' : CORS_ALLOWED[0], 'Content-Type': 'application/json' };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: { ...cors(request.headers.get('Origin')||''), 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const h = cors(origin);

  if (!env.CALLMEBOT_APIKEY) return new Response(JSON.stringify({ error: 'CALLMEBOT_APIKEY no configurada' }), { status: 503, headers: h });
  if (!env.SUPABASE_SERVICE_KEY) return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_KEY no configurada' }), { status: 503, headers: h });

  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: h }); }

  // Solo cron interno — evita relay de WA arbitrario via CALLMEBOT_APIKEY
  const key = request.headers.get('X-Cron-Key') || body.key;
  if (!env.CRON_SECRET || key !== env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: h });
  }

  // Rate limit: 20 WA/hora
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = new Request('https://rl.internal/wa-cotizacion_' + ip);
  const hit = await caches.default.match(rlKey);
  if (hit) {
    const n = parseInt(await hit.text(), 10) || 0;
    if (n >= 20) return new Response(JSON.stringify({ error: 'Rate limit' }), { status: 429, headers: h });
    await caches.default.put(rlKey, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));
  } else {
    await caches.default.put(rlKey, new Response('1', { headers: { 'Cache-Control': 'max-age=3600' } }));
  }

  const { whatsapp, nombre, total, codigo, dias } = body;
  if (!whatsapp || !codigo) return new Response(JSON.stringify({ error: 'Faltan whatsapp o codigo' }), { status: 400, headers: h });

  // Limpiar número
  const wa = String(whatsapp).replace(/\D/g, '');
  if (wa.length < 10) return new Response(JSON.stringify({ error: 'WA inválido' }), { status: 400, headers: h });
  const waFull = wa.length === 10 ? '57' + wa : wa;

  const nombreCorto = String(nombre || 'Doctor').split(' ')[0];
  const diasLabel = Number(dias) <= 1 ? 'mañana' : `en ${dias} días`;

  const msg = `🦷 *PRODIGY Lab Dental*\n\nHola ${nombreCorto}, tu cotización *${codigo}* vence ${diasLabel}.\n\n💰 *Total:* ${total || 'ver cotización'}\n\n¿Deseas convertirla en pedido?\n👉 https://prodigylabdental.com/flujo-fresado\n\n_Responde este WA para cualquier consulta._`;

  const url = `https://api.callmebot.com/whatsapp.php?phone=${waFull}&text=${encodeURIComponent(msg)}&apikey=${env.CALLMEBOT_APIKEY}`;

  try {
    const resp = await fetch(url);
    const txt = await resp.text();
    if (!resp.ok && !txt.includes('Message queued')) {
      return new Response(JSON.stringify({ error: 'Callmebot error', detail: txt.slice(0, 200) }), { status: 502, headers: h });
    }
    return new Response(JSON.stringify({ ok: true, wa: waFull }), { status: 200, headers: h });
  } catch (err) {
    console.error('[wa-cotizacion]', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500, headers: h });
  }
}
