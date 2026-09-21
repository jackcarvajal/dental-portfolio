/**
 * PRODIGY Lab Dental — Aviso al staff por WhatsApp cuando entra un lead
 * POST /api/notify-staff
 * Body: { doctor, servicio, whatsapp, pais }
 *
 * Destinatarios NO vienen del request (anti-abuso): salen de env vars.
 * Cada número debe registrarse en CallMeBot y tener su propia apikey.
 *
 * Env vars (Cloudflare Pages):
 *   STAFF_1_PHONE / STAFF_1_APIKEY   → PRODIGY (573212816716)
 *   STAFF_2_PHONE / STAFF_2_APIKEY   → Alejandro (573219581949)
 *   STAFF_3_PHONE / STAFF_3_APIKEY   → (opcional)
 */

const CORS_OK = ['https://prodigylabdental.com'];

function cors(origin) {
  const ok = CORS_OK.includes(origin) || (origin || '').includes('.pages.dev') || !origin;
  return { 'Access-Control-Allow-Origin': ok ? origin || '*' : CORS_OK[0], 'Content-Type': 'application/json' };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: { ...cors(request.headers.get('Origin') || ''), 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function onRequestPost({ request, env }) {
  const h = cors(request.headers.get('Origin') || '');

  const staff = [];
  for (let i = 1; i <= 3; i++) {
    const phone = env['STAFF_' + i + '_PHONE'];
    const key   = env['STAFF_' + i + '_APIKEY'];
    if (phone && key) staff.push({ phone: String(phone).replace(/\D/g, ''), key });
  }
  if (!staff.length) return new Response(JSON.stringify({ error: 'Sin staff configurado' }), { status: 503, headers: h });

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = new Request('https://rl.internal/notify-staff-pg_' + ip);
  const hit = await caches.default.match(rlKey);
  const n = hit ? (parseInt(await hit.text(), 10) || 0) : 0;
  if (n >= 20) return new Response(JSON.stringify({ error: 'Rate limit' }), { status: 429, headers: h });
  await caches.default.put(rlKey, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));

  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: h }); }

  const esc = s => String(s || '').replace(/[<>]/g, '').slice(0, 80);
  const doctor   = esc(body.doctor) || 'Sin nombre';
  const servicio = esc(body.servicio) || 'trabajo';
  const waLead   = esc(body.whatsapp) || 's/n';
  const pais     = esc(body.pais) || '';
  const codigo   = esc(body.codigo) || '';
  const tipo     = esc(body.tipo) || 'Nuevo caso';

  const mensaje =
    `🔔 *${tipo} — PRODIGY Lab Dental*\n\n` +
    (codigo ? `Nº caso: *${codigo}*\n` : '') +
    `Servicio: ${servicio}\n` +
    `Dr(a): ${doctor}\n` +
    `WhatsApp: ${waLead}${pais ? `\nPaís: ${pais}` : ''}\n\n` +
    `Responde rápido 👉 wa.me/${waLead.replace(/\D/g, '')}\n` +
    `Panel: prodigylabdental.com/app/panel-interno-operaciones.html`;

  const resultados = await Promise.all(staff.map(async ({ phone, key }) => {
    try {
      const r = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(mensaje)}&apikey=${key}`);
      const txt = await r.text();
      return { phone, ok: r.ok && /message queued/i.test(txt) };
    } catch (e) {
      return { phone, ok: false };
    }
  }));

  return new Response(JSON.stringify({ ok: true, enviados: resultados }), { status: 200, headers: h });
}
