/**
 * Cloudflare Pages Function — Gemini Proxy
 * POST /api/gemini
 *
 * Mantiene GEMINI_API_KEY en variables de entorno de Cloudflare Pages
 * (nunca en el código fuente ni en el bundle JS del cliente).
 *
 * Para configurar la clave:
 *   Cloudflare Dashboard → Pages → dental-portfolio → Settings → Environment variables
 *   Añadir: GEMINI_API_KEY = AIzaSy... (Production + Preview)
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  // Solo acepta requests desde prodigylabdental.com
  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'];
  const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.pages.dev');

  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Bot no configurado' }), {
      status: 503,
      headers: corsHeaders(origin)
    });
  }

  let body;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: corsHeaders(origin) }); }

  // Rate limit básico por IP (5 req/min via CF-Connecting-IP)
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const cacheKey = `gemini_rl_${ip}`;
  const cache = caches.default;
  const cached = await cache.match(new Request(`https://rl.internal/${cacheKey}`));
  if (cached) {
    const count = parseInt(await cached.text());
    if (count >= 5) {
      return new Response(JSON.stringify({ error: 'Demasiadas solicitudes. Espera un momento.' }), {
        status: 429, headers: corsHeaders(origin)
      });
    }
    const newCount = count + 1;
    await cache.put(new Request(`https://rl.internal/${cacheKey}`), new Response(String(newCount), {
      headers: { 'Cache-Control': 'max-age=60' }
    }));
  } else {
    await cache.put(new Request(`https://rl.internal/${cacheKey}`), new Response('1', {
      headers: { 'Cache-Control': 'max-age=60' }
    }));
  }

  // Modelos en orden de preferencia (fallback automático)
  const MODELS = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b'
  ];

  let lastError = null;
  for (const model of MODELS) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    let geminiRes;
    try {
      geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (e) {
      lastError = `Red: ${e.message}`;
      continue;
    }
    const data = await geminiRes.json();
    if (geminiRes.ok && data.candidates) {
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json', 'X-Model-Used': model }
      });
    }
    lastError = data.error?.message || `HTTP ${geminiRes.status}`;
  }

  return new Response(JSON.stringify({ error: lastError || 'Todos los modelos fallaron' }), {
    status: 502, headers: corsHeaders(origin)
  });
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || 'https://prodigylabdental.com',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin') || '';
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}
