/**
 * PRODIGY — Track Analytics Events
 * POST /api/track-event
 *
 * Registra eventos de conversión en Supabase para analytics internos.
 * Alternativa a GA4 con datos propios sin depender de Google.
 *
 * Eventos recomendados:
 *  - page_view: visita a página
 *  - cta_click: clic en botón principal
 *  - form_submit: envío de formulario
 *  - calculator_use: uso de calculadora
 *  - file_upload: subida de STL
 *  - pedido_iniciado: arranca flujo de pedido
 *  - pedido_completado: pedido finalizado
 *  - registro_implicito: cuenta creada automáticamente
 *
 * Body: { evento, pagina, negocio?, metadata? }
 */

const CORS_ALLOWED = ['https://prodigylabdental.com','https://www.prodigylabdental.com',
                       'https://alejandrocadcam.pages.dev'];

function cors(origin) {
  const ok = CORS_ALLOWED.includes(origin) || origin.includes('.pages.dev') || origin.includes('localhost');
  return {
    'Access-Control-Allow-Origin': ok ? origin : CORS_ALLOWED[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: cors(request.headers.get('Origin') || '') });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const h = cors(origin);

  // Rate limit suave: 60 eventos/min por IP (analytics, no malicioso)
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = new Request('https://rl.internal/track-event_' + ip);
  const rlHit = await caches.default.match(rlKey);
  if (rlHit) {
    const count = parseInt(await rlHit.text(), 10) || 0;
    if (count >= 60) return new Response(JSON.stringify({ ok: false, reason: 'rate_limited' }), { status: 429, headers: h });
    await caches.default.put(rlKey, new Response(String(count + 1), { headers: { 'Cache-Control': 'max-age=60' } }));
  } else {
    await caches.default.put(rlKey, new Response('1', { headers: { 'Cache-Control': 'max-age=60' } }));
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    // No configurado — responder OK silenciosamente (no bloquear el frontend)
    return new Response(JSON.stringify({ ok: true, stored: false }), { status: 200, headers: h });
  }

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, error: 'JSON inválido' }), { status: 400, headers: h });
  }

  const { evento, pagina, negocio = 'prodigy', metadata = {} } = body;

  if (!evento) {
    return new Response(JSON.stringify({ ok: false, error: 'Falta campo evento' }), { status: 400, headers: h });
  }

  // Sanitizar: solo alfanumérico y guiones
  const eventoClean = String(evento).replace(/[^a-z0-9_]/gi, '_').slice(0, 50);
  const paginaClean = String(pagina || '').slice(0, 200);

  try {
    const resp = await fetch(`${env.SUPABASE_URL}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        evento: eventoClean,
        pagina: paginaClean,
        negocio: String(negocio).slice(0, 30),
        metadata: metadata || {},
        ip_hash: await hashIP(ip),
        user_agent: (request.headers.get('User-Agent') || '').slice(0, 200),
        country: request.cf?.country || null,
        created_at: new Date().toISOString(),
      }),
    });

    return new Response(JSON.stringify({ ok: resp.ok, stored: resp.ok }), { status: 200, headers: h });
  } catch (err) {
    // Silencioso — nunca bloquear el frontend por analytics
    return new Response(JSON.stringify({ ok: true, stored: false, error: err.message }), { status: 200, headers: h });
  }
}

async function hashIP(ip) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + 'prodigy-salt-2026'));
  return Array.from(new Uint8Array(buf)).slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}
