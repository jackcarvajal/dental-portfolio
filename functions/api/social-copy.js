/**
 * PRODIGY — Social Copy Generator
 * POST /api/social-copy
 *
 * Recibe el artículo más reciente de ARTICLES y genera:
 * - Post para Instagram (hasta 150 palabras, emojis, hashtags)
 * - Post para LinkedIn (hasta 200 palabras, tono profesional)
 * - Tweet/X (hasta 280 chars)
 * - Copy para WhatsApp broadcast (bullet points cortos)
 *
 * Env vars: GEMINI_API_KEY, CRON_SECRET
 * Quién: cron (x-cron-secret) o el admin con sesión (Authorization: Bearer). Antes pedía `x-admin-token` =
 * ADMIN_SECRET, que no existe en Cloudflare ni debe estar en el navegador → el botón del panel siempre daba 401.
 */
import { cfg, usuarioDe, ADMIN_EMAILS } from './reportar-problema.js';

const CORS = {
  'Access-Control-Allow-Origin':  'https://prodigylabdental.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type':                  'application/json',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

// Rate limiting — protege cuota de Gemini aunque el llamador tenga el secreto correcto
async function _rlSocialCopy(request) {
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rlKey = new Request('https://rl.internal/social-copy_' + ip);
    const hit = await caches.default.match(rlKey);
    const count = hit ? (parseInt(await hit.text(), 10) || 0) : 0;
    if (count >= 10) return false;
    await caches.default.put(rlKey, new Response(String(count + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));
    return true;
  } catch { return true; }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!(await _rlSocialCopy(request))) {
    return new Response(JSON.stringify({ error: 'Demasiadas solicitudes. Intenta en 1 hora.' }), { status: 429, headers: CORS });
  }

  // Auth — cron (secreto) o admin con sesión verificada
  const secret = request.headers.get('x-cron-secret');
  let ok = !!env.CRON_SECRET && secret === env.CRON_SECRET;
  if (!ok) {
    const c = cfg(env);
    const yo = c.SERVICE ? await usuarioDe(request, c) : null;
    const roles = [].concat(yo?.app_metadata?.roles || [], yo?.app_metadata?.role || []);
    ok = !!yo && (ADMIN_EMAILS.includes(String(yo.email || '').toLowerCase()) || roles.includes('admin'));
  }
  if (!ok) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: CORS });
  }

  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY no configurada' }), { status: 503, headers: CORS });
  }

  let body;
  try { body = await request.json(); } catch { body = {}; }

  const { titulo, descripcion, url, categoria, chip } = body;
  if (!titulo) {
    return new Response(JSON.stringify({ error: 'titulo requerido' }), { status: 400, headers: CORS });
  }

  const prompt = `Eres el social media manager de PRODIGY Lab Dental, un laboratorio de CAD/CAM dental en Bogotá, Colombia.

Con base en este artículo del journal científico de odontología digital:
- Título: "${titulo}"
- Descripción: "${descripcion || 'No disponible'}"
- URL: "${url || 'https://prodigylabdental.com/article'}"
- Categoría: "${categoria || 'tecnologia'}"
- Chip: "${chip || ''}"

Genera EXACTAMENTE este JSON (sin texto fuera del JSON):
{
  "instagram": "Post para Instagram (máx 150 palabras). Emojis estratégicos, 5-7 hashtags dentales en español e inglés, CTA con link en bio. Tono cercano y técnico a la vez.",
  "linkedin": "Post LinkedIn (máx 200 palabras). Tono profesional dirigido a odontólogos y técnicos dentales. Sin hashtags excesivos (máx 3). CTA clara.",
  "twitter": "Tweet/X (MÁXIMO 260 caracteres incluido el URL). Contundente y técnico.",
  "whatsapp": "Mensaje para broadcast WA (bullet points, máx 5 líneas, sin formato markdown). Para doctores clientes de PRODIGY."
}

Reglas:
- Solo terminología clínica real (CAD, zirconio, fresado, implantes, guías quirúrgicas, etc.)
- NO inventar estadísticas ni estudios
- Idioma: español colombiano
- Mencionar PRODIGY Lab Dental naturalmente en cada copy`;

  // Modelos en orden (igual que gemini.js / asistente-soporte): gemini-2.0-flash ya no responde en el plan gratis
  // (el botón daba 502). En 2.5 se apaga el "pensar" para que no se coma los tokens de la respuesta.
  const MODELOS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest'];
  let geminiData, ultimoError = '';
  for (const modelo of MODELOS) {
    try {
      const gen = { temperature: 0.5, maxOutputTokens: 1200, responseMimeType: 'application/json' };
      if (modelo.startsWith('gemini-2.5')) gen.thinkingConfig = { thinkingBudget: 0 };
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: gen }),
      });
      if (!res.ok) { ultimoError = `${modelo} HTTP ${res.status}`; continue; }
      geminiData = await res.json();
      if (geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) break;
      ultimoError = `${modelo} sin texto`;
    } catch (e) { ultimoError = `${modelo}: ${e.message}`; }
  }
  if (!geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return new Response(JSON.stringify({ error: 'Gemini no disponible: ' + ultimoError }), { status: 502, headers: CORS });
  }

  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  let copies;
  try { copies = JSON.parse(rawText); }
  catch { copies = { raw: rawText }; }

  return new Response(JSON.stringify({ ok: true, articulo: titulo, copies }), { headers: CORS });
}
