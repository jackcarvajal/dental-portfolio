/**
 * PRODIGY — Lead Magnet (descarga catálogo/guía)
 * POST /api/lead-magnet
 * Body: { nombre, email, whatsapp, recurso, negocio? }
 *
 * Guarda el lead en tabla leads_doctores y envía WA de bienvenida.
 * Env vars: SUPABASE_SERVICE_KEY, CALLMEBOT_APIKEY
 */

const SURL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
const CORS_ALLOWED = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'];

function escH(s) { return String(s||'').replace(/[<>"'&]/g,''); }

function cors(origin) {
  const ok = CORS_ALLOWED.includes(origin) || (origin||'').includes('.pages.dev');
  return { 'Access-Control-Allow-Origin': ok ? origin : CORS_ALLOWED[0], 'Content-Type': 'application/json' };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: { ...cors(request.headers.get('Origin')||''), 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const h = cors(origin);

  if (!env.SUPABASE_SERVICE_KEY) return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_KEY falta' }), { status: 503, headers: h });

  // Rate limit 10/hora por IP
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = new Request('https://rl.internal/lead-magnet_' + ip);
  const rlHit = await caches.default.match(rlKey);
  if (rlHit) {
    const n = parseInt(await rlHit.text(), 10) || 0;
    if (n >= 10) return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), { status: 429, headers: h });
    await caches.default.put(rlKey, new Response(String(n+1), { headers: { 'Cache-Control': 'max-age=3600' } }));
  } else {
    await caches.default.put(rlKey, new Response('1', { headers: { 'Cache-Control': 'max-age=3600' } }));
  }

  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: h }); }

  const { nombre, email, whatsapp, recurso, negocio = 'prodigy' } = body;
  if (!email && !whatsapp) return new Response(JSON.stringify({ error: 'Se requiere email o WhatsApp' }), { status: 400, headers: h });

  const sbH = { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

  try {
    // Guardar lead en Supabase
    await fetch(`${SURL}/rest/v1/leads_doctores`, {
      method: 'POST',
      headers: sbH,
      body: JSON.stringify({ nombre: escH(nombre), email: escH(email), whatsapp: escH(whatsapp), recurso_descargado: escH(recurso), negocio, fuente: 'lead-magnet' }),
    });

    // Enviar WA de bienvenida si hay WA y CALLMEBOT_APIKEY
    if (whatsapp && env.CALLMEBOT_APIKEY) {
      const wa = String(whatsapp).replace(/\D/g,'');
      const waFull = wa.length === 10 ? '57'+wa : wa;
      const nombreCorto = (nombre||'Doctor').split(' ')[0];
      const msg = `💎 *PRODIGY Lab Dental*\n\nHola ${nombreCorto}, gracias por descargar *${recurso||'el catálogo'}*.\n\nCualquier consulta sobre servicios o precios, estamos aquí:\n👉 prodigylabdental.com\n📱 WhatsApp: +57 321 281 6716\n\n_¡Esperamos trabajar contigo!_`;
      await fetch(`https://api.callmebot.com/whatsapp.php?phone=${waFull}&text=${encodeURIComponent(msg)}&apikey=${env.CALLMEBOT_APIKEY}`).catch(()=>{});
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: h });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: h });
  }
}
