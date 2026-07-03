/**
 * PRODIGY — Notificación interna cuando lab se une a la waitlist
 * POST /api/waitlist-notify
 *
 * Llamado desde para-laboratorios.html tras INSERT exitoso.
 * Envía email a equipo vía Resend + WA via Callmebot.
 * Silent fail — no bloquea UX del usuario.
 *
 * Env vars: RESEND_API_KEY, CALLMEBOT_APIKEY, CRON_SECRET
 */

const CORS = {
  'Access-Control-Allow-Origin':  'https://prodigylabdental.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type':                  'application/json',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Rate limit: 30 req / 10 min por IP (anti-spam)
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = new Request('https://rl.internal/waitlist-notify_' + ip);
  const hit = await caches.default.match(rlKey);
  if (hit) {
    const n = parseInt(await hit.text(), 10) || 0;
    if (n >= 30) return new Response(JSON.stringify({ ok: false, reason: 'rate-limit' }), { status: 429, headers: CORS });
    await caches.default.put(rlKey, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=600' } }));
  } else {
    await caches.default.put(rlKey, new Response('1', { headers: { 'Cache-Control': 'max-age=600' } }));
  }

  let body;
  try { body = await request.json(); } catch { body = {}; }

  const { nombre_lab, nombre_contacto, ciudad, pedidos_mes, whatsapp } = body;
  if (!nombre_lab) return new Response(JSON.stringify({ ok: false }), { headers: CORS });

  const results = {};

  // 1. Email via Resend
  if (env.RESEND_API_KEY) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'PRODIGY Waitlist <alertas@prodigylabdental.com>',
          to:   ['gerencia@prodigylabdental.com'],
          subject: `🧪 Nuevo lab en waitlist: ${nombre_lab}`,
          html: `<h2>Nuevo laboratorio en la lista de espera</h2>
            <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
              <tr><td style="padding:6px 12px;font-weight:700;">Lab:</td><td>${escH(nombre_lab)}</td></tr>
              <tr><td style="padding:6px 12px;font-weight:700;">Contacto:</td><td>${escH(nombre_contacto || '—')}</td></tr>
              <tr><td style="padding:6px 12px;font-weight:700;">WhatsApp:</td><td>${escH(whatsapp || '—')}</td></tr>
              <tr><td style="padding:6px 12px;font-weight:700;">Ciudad:</td><td>${escH(ciudad || '—')}</td></tr>
              <tr><td style="padding:6px 12px;font-weight:700;">Volumen/mes:</td><td>${escH(pedidos_mes || '—')}</td></tr>
            </table>
            <p style="margin-top:16px;"><a href="https://prodigylabdental.com/app/panel-interno-operaciones.html" style="background:#D4AF37;color:#000;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">Ver en Admin Panel →</a></p>`,
        }),
      });
      results.email = r.ok ? 'ok' : `error ${r.status}`;
    } catch(e) { results.email = 'exception: ' + e.message; }
  }

  // 2. WA via Callmebot
  if (env.CALLMEBOT_APIKEY && env.CALLMEBOT_APIKEY !== 'PENDIENTE') {
    try {
      const msg = `🧪 *Nuevo lab en waitlist*\n*Lab:* ${nombre_lab}\n*Contacto:* ${nombre_contacto||'—'}\n*Ciudad:* ${ciudad||'—'} · ${pedidos_mes||'?'} ped/mes\n*WA:* ${whatsapp||'—'}`;
      const url = `https://api.callmebot.com/whatsapp.php?phone=573212816716&text=${encodeURIComponent(msg)}&apikey=${env.CALLMEBOT_APIKEY}`;
      const r = await fetch(url);
      const rTxt = await r.text();
      results.wa = (r.ok && /message queued/i.test(rTxt)) ? 'ok' : `error: ${rTxt.slice(0, 150)}`;
    } catch(e) { results.wa = 'exception: ' + e.message; }
  }

  return new Response(JSON.stringify({ ok: true, results }), { headers: CORS });
}

function escH(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
