/**
 * PRODIGY — Mentor de implantología (chat del evaluador)
 * Cloudflare Pages Function — POST /api/gemini/chat
 *
 * El front manda { messages: [{role, content}], currentPlanning: {...} } y recibe { text: "markdown" }.
 * Usa env.GEMINI_API_KEY. Rate-limit + cap de salida por costo.
 */

const ORIGINS = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'];
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.0-flash-lite'];

function cors(origin) {
  const ok = ORIGINS.includes(origin) || /^https:\/\/([a-z0-9-]+\.)?dental-portfolio-em6\.pages\.dev$/.test(origin || '') || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
  return { 'Access-Control-Allow-Origin': ok ? origin : 'https://prodigylabdental.com', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json' };
}

async function rateLimit(request, prefijo) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = new Request(`https://rl.internal/${prefijo}_${ip}`);
  const cache = caches.default;
  const hit = await cache.match(key);
  const n = hit ? parseInt(await hit.text()) || 0 : 0;
  if (n >= 15) return false;   // 15 mensajes/min por IP
  await cache.put(key, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=60' } }));
  return true;
}

const SISTEMA = `Eres el Mentor de Implantología de PRODIGY Lab Dental. Respondes las dudas del odontólogo sobre la planificación de implante que está analizando, de forma breve, clínica y práctica, con base en consensos de la ITI y literatura científica.
Reglas:
- Responde en español, en Markdown, directo al punto (máximo ~200 palabras salvo que pidan detalle).
- Apóyate en los parámetros de la planificación actual cuando sean relevantes.
- No des diagnósticos definitivos ni prescripción de fármacos; eres apoyo a la decisión.
- Si el usuario comparte datos de un paciente (nombre, documento, teléfono, fotos), no los repitas y recuérdale con amabilidad que no los comparta aquí.
- Si procede, sugiere con naturalidad que PRODIGY puede diseñar la guía quirúrgica o la planificación digital del caso.`;

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const H = cors(origin);
  const ok = ORIGINS.includes(origin) || /^https:\/\/([a-z0-9-]+\.)?dental-portfolio-em6\.pages\.dev$/.test(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin === '';
  if (!ok) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: H });
  if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({ error: 'Chat no configurado' }), { status: 503, headers: H });
  if (!(await rateLimit(request, 'chat'))) return new Response(JSON.stringify({ error: 'Demasiados mensajes. Espera un momento.' }), { status: 429, headers: H });

  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: H }); }
  if (JSON.stringify(body || {}).length > 12000) return new Response(JSON.stringify({ error: 'Conversación demasiado larga' }), { status: 413, headers: H });

  const msgs = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const contents = msgs
    .filter(m => m && (m.content || m.text))
    .map(m => ({ role: (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user', parts: [{ text: String(m.content || m.text).slice(0, 2000) }] }));
  if (!contents.length) return new Response(JSON.stringify({ error: 'Sin mensaje' }), { status: 400, headers: H });

  let sys = SISTEMA;
  if (body.currentPlanning && typeof body.currentPlanning === 'object') {
    sys += '\n\nPLANIFICACIÓN ACTUAL DEL CASO (contexto):\n' + JSON.stringify(body.currentPlanning).slice(0, 1500);
  }

  const reqBody = {
    contents,
    system_instruction: { parts: [{ text: sys }] },
    generationConfig: { temperature: 0.5, maxOutputTokens: 900 },
  };

  for (const model of MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reqBody),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.candidates && data.candidates[0]) {
        const text = (data.candidates[0].content?.parts || []).map(p => p.text || '').join('');
        return new Response(JSON.stringify({ text }), { status: 200, headers: H });
      }
    } catch (e) { /* siguiente modelo */ }
  }
  return new Response(JSON.stringify({ error: 'El mentor no está disponible ahora. Intenta de nuevo.' }), { status: 502, headers: H });
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: cors(context.request.headers.get('Origin') || '') });
}
