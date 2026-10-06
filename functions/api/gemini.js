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
import { NEGOCIO, cfg, adminH } from './reportar-problema.js';

// ── IA que crece con lo que preguntan los doctores (oct-2026) ─────────────────────────────────────────
// 1) Respuestas oficiales (tabla ia_conocimiento, las aprueba el equipo en app/ia-conocimiento.html): las más
//    parecidas a la pregunta se agregan a las instrucciones, con prioridad. Caché 5 min.
// 2) Registro ANÓNIMO (tabla ia_preguntas): sin IP ni usuario; correos, teléfonos, documentos y enlaces se borran
//    del texto antes de guardar. Si las tablas aún no existen, todo sigue funcionando igual.
const _sinTildes = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const _palabras = t => new Set(_sinTildes(t).split(/[^a-z0-9ñ]+/).filter(w => w.length > 3));
function anonimizar(t, max) {
  return String(t || '')
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[correo]')
    .replace(/https?:\/\/\S+/g, '[enlace]')
    .replace(/\+?\d[\d\s().-]{6,}\d/g, '[número]')
    .replace(/\b(paciente|pte\.?|sr\.?|sra\.?|señora?|don|doña)\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?/g, '$1 [nombre]')
    .slice(0, max);
}
function ultimaPregunta(body) {
  const c = Array.isArray(body.contents) ? body.contents : [];
  for (let i = c.length - 1; i >= 0; i--) if (c[i] && c[i].role !== 'model') return (c[i].parts || []).map(p => p.text || '').join(' ').trim();
  return '';
}
const textoDe = data => ((data.candidates || [])[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
async function conocimiento(c, cache) {
  const k = new Request(`https://rl.internal/ia-kb-${NEGOCIO}`);
  const hit = await cache.match(k);
  if (hit) return hit.json();
  const r = await fetch(`${c.URL}/rest/v1/ia_conocimiento?activo=eq.true&negocio=in.(${NEGOCIO},ambos)&select=id,pregunta,respuesta,palabras_clave&limit=300`, { headers: adminH(c.SERVICE) });
  const lista = r.ok ? await r.json() : [];
  await cache.put(k, new Response(JSON.stringify(lista), { headers: { 'Cache-Control': 'max-age=300' } }));
  return lista;
}
function relevantes(lista, pregunta, max) {
  const q = _palabras(pregunta);
  return lista.map(e => {
    const base = _palabras(e.pregunta), claves = _palabras(e.palabras_clave || '');
    let p = 0; q.forEach(w => { if (base.has(w)) p += 1; if (claves.has(w)) p += 2; });
    return { e, p };
  }).filter(x => x.p >= 2).sort((a, b) => b.p - a.p).slice(0, max).map(x => x.e);
}
async function registrar(c, fila, usadas) {
  try {
    await fetch(`${c.URL}/rest/v1/ia_preguntas`, { method: 'POST', headers: { ...adminH(c.SERVICE), Prefer: 'return=minimal' }, body: JSON.stringify(fila) });
    if (usadas.length) await fetch(`${c.URL}/rest/v1/rpc/ia_conocimiento_usada`, { method: 'POST', headers: adminH(c.SERVICE), body: JSON.stringify({ p_ids: usadas }) });
  } catch (e) { /* el registro nunca debe romper la respuesta */ }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Solo acepta requests desde prodigylabdental.com
  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'];
  const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/([a-z0-9-]+\.)?dental-portfolio-em6\.pages\.dev$/.test(origin || '');

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

  // Cap de tamaño de entrada — evita abuso de costo con prompts gigantes en tu API key
  // (el check de Origin solo frena navegadores de otros sitios, no un script con Origin falso).
  const _bodyStr = JSON.stringify(body);
  if (_bodyStr.length > 24000) {
    return new Response(JSON.stringify({ error: 'Mensaje demasiado largo.' }), { status: 413, headers: corsHeaders(origin) });
  }
  // Cap de tokens de SALIDA — el cliente no puede pedir respuestas enormes (costo).
  body.generationConfig = {
    ...(body.generationConfig || {}),
    maxOutputTokens: Math.min(Number(body.generationConfig?.maxOutputTokens) || 1024, 2048),
  };

  // ── Conocimiento aprobado + privacidad ──
  const _c = request.headers.get('X-Canal') || body.canal;
  const canal = ['chat', 'orbe', 'buscador'].includes(_c) ? _c : 'chat';
  delete body.canal;                                   // Gemini rechaza campos desconocidos
  const c = cfg(env);
  const pregunta = ultimaPregunta(body);
  let usadas = [];
  const extra = ['PRIVACIDAD: si el usuario escribe datos de un paciente (nombre, documento, teléfono, fotos), no los repitas y recuérdale con amabilidad que no los comparta en este chat.'];
  if (c.SERVICE && pregunta) {
    try {
      const elegidas = relevantes(await conocimiento(c, cache), pregunta, 5);
      if (elegidas.length) {
        usadas = elegidas.map(e => e.id);
        extra.push('RESPUESTAS OFICIALES DEL LABORATORIO (verificadas por el equipo: úsalas con prioridad y no las contradigas):\n' +
          elegidas.map(e => `• P: ${e.pregunta}\n  R: ${e.respuesta}`).join('\n'));
      }
    } catch (e) { /* sin base de conocimiento: sigue con el texto base */ }
  }
  body.system_instruction = body.system_instruction && Array.isArray(body.system_instruction.parts) ? body.system_instruction : { parts: [{ text: '' }] };
  body.system_instruction.parts[0].text = (body.system_instruction.parts[0].text || '') + '\n\n' + extra.join('\n\n');
  let pagina = '';
  try { pagina = new URL(request.headers.get('Referer') || '').pathname.slice(0, 200); } catch (e) {}

  // Modelos en orden de preferencia (fallback automático)
  const MODELS = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-2.0-flash-lite'
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
    let data;
    try { data = await geminiRes.json(); }
    catch { lastError = `HTTP ${geminiRes.status} (respuesta no-JSON)`; continue; }
    if (geminiRes.ok && data.candidates) {
      if (c.SERVICE && pregunta) context.waitUntil(registrar(c, { negocio: NEGOCIO, pregunta: anonimizar(pregunta, 500), respuesta: anonimizar(textoDe(data), 4000), pagina, canal }, usadas));
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
  const allowed = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'];
  const ok = allowed.includes(origin) || /^https:\/\/([a-z0-9-]+\.)?dental-portfolio-em6\.pages\.dev$/.test(origin || '') || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
  return {
    'Access-Control-Allow-Origin': ok ? origin : 'https://prodigylabdental.com',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin') || '';
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}
