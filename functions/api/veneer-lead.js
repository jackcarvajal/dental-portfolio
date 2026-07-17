/**
 * PRODIGY — Captura de lead del servicio de carillas (EE.UU.)
 * POST /api/veneer-lead
 * Body: { nombre, email, practice, material, units, first_order, estimado, shade, notas }
 *
 * Guarda el lead en tabla veneer_leads (compartida, negocio='prodigy').
 * Fire-and-forget desde el cotizador: el WhatsApp se abre igual aunque esto falle.
 * Env vars: SUPABASE_SERVICE_KEY
 */

const SURL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
const NEGOCIO = 'prodigy';
const CORS_ALLOWED = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'];

function clean(s) { return String(s == null ? '' : s).replace(/[<>]/g, '').slice(0, 500); }

function cors(origin) {
  const ok = CORS_ALLOWED.includes(origin) || (origin || '').includes('.pages.dev');
  return { 'Access-Control-Allow-Origin': ok ? origin : CORS_ALLOWED[0], 'Content-Type': 'application/json' };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: { ...cors(request.headers.get('Origin') || ''), 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const h = cors(origin);

  if (!env.SUPABASE_SERVICE_KEY) return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_KEY falta' }), { status: 503, headers: h });

  // Rate limit 15/hora por IP
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = new Request('https://rl.internal/veneer-lead_' + ip);
  const rlHit = await caches.default.match(rlKey);
  if (rlHit) {
    const n = parseInt(await rlHit.text(), 10) || 0;
    if (n >= 15) return new Response(JSON.stringify({ error: 'Demasiadas solicitudes' }), { status: 429, headers: h });
    await caches.default.put(rlKey, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));
  } else {
    await caches.default.put(rlKey, new Response('1', { headers: { 'Cache-Control': 'max-age=3600' } }));
  }

  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: h }); }

  const { nombre, email, practice, material, units, first_order, estimado, shade, notas } = body;
  if (!email && !nombre) return new Response(JSON.stringify({ error: 'Se requiere nombre o email' }), { status: 400, headers: h });

  const u = parseInt(units, 10);
  const row = {
    negocio: NEGOCIO,
    nombre: clean(nombre),
    email: clean(email),
    practice: clean(practice),
    material: clean(material),
    units: Number.isFinite(u) ? u : null,
    first_order: !!first_order,
    estimado_usd: clean(estimado),
    shade: clean(shade),
    notas: clean(notas),
    source: 'veneers-landing',
  };

  const sbH = { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };

  try {
    const r = await fetch(`${SURL}/rest/v1/veneer_leads`, { method: 'POST', headers: sbH, body: JSON.stringify(row) });
    if (!r.ok) { console.error('[veneer-lead]', r.status, await r.text()); return new Response(JSON.stringify({ error: 'No se pudo guardar' }), { status: 502, headers: h }); }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: h });
  } catch (err) {
    console.error('[veneer-lead]', err);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500, headers: h });
  }
}
