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

  // Auth — acepta tanto cron-secret como sesión admin (header x-admin)
  const secret = request.headers.get('x-cron-secret');
  const admin  = request.headers.get('x-admin-token');
  if (secret !== env.CRON_SECRET && admin !== env.ADMIN_SECRET) {
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

  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;

  let attempts = 0;
  let geminiData;
  while (attempts < 2) {
    attempts++;
    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 1200, responseMimeType: 'application/json' },
        }),
      });
      if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
      geminiData = await res.json();
      break;
    } catch(e) {
      if (attempts >= 2) {
        return new Response(JSON.stringify({ error: 'Gemini no disponible: ' + e.message }), { status: 502, headers: CORS });
      }
    }
  }

  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  let copies;
  try { copies = JSON.parse(rawText); }
  catch { copies = { raw: rawText }; }

  return new Response(JSON.stringify({ ok: true, articulo: titulo, copies }), { headers: CORS });
}
