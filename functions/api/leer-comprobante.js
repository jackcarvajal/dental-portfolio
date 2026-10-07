/**
 * Cloudflare Pages Function — Leer un comprobante de pago con IA (oct-2026, idea tomada de Soluciones FE)
 *
 * POST /api/leer-comprobante  { url }   (url https del comprobante en Supabase Storage)
 *   → { monto, moneda, fecha, hora, medio, referencia, destinatario, estado, confianza }
 *
 * La IA solo LEE: contabilidad compara con el abono esperado y confirma a mano (la decisión sigue siendo humana).
 * Seguridad:
 *   · Solo personal (admin por correo o app_metadata.role admin/contabilidad/secretaria/operator) con su sesión.
 *   · Solo descarga archivos de *.supabase.co (no sirve de proxy a otras direcciones) y de máx. 8 MB.
 *   · Límite: 40 lecturas por IP por hora.
 * Variables de entorno: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY (las mismas que ya usa la web).
 */

const ADMIN_EMAILS = ['jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com', 'gerencia@prodigylabdental.com', 'casos@prodigylabdental.com'];
const ROLES = ['admin', 'contabilidad', 'secretaria', 'operator'];
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.0-flash-lite'];
const MAX_BYTES = 8 * 1024 * 1024;

function cors(origin) {
  const ok = /^https:\/\/(www\.)?prodigylabdental\.com$/.test(origin || '') || /^https:\/\/([a-z0-9-]+\.)?dental-portfolio-em6\.pages\.dev$/.test(origin || '');
  return {
    'Access-Control-Allow-Origin': ok ? origin : 'https://prodigylabdental.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}
const json = (obj, status, h) => new Response(JSON.stringify(obj), { status, headers: h });

async function esPersonal(request, env) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return false;
  try {
    const r = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_SERVICE_KEY } });
    if (!r.ok) return false;
    const u = await r.json();
    const roles = [u.app_metadata?.role].concat(Array.isArray(u.app_metadata?.roles) ? u.app_metadata.roles : []);
    return ADMIN_EMAILS.includes(String(u.email || '').toLowerCase()) || roles.some(x => ROLES.includes(x));
  } catch { return false; }
}

async function limite(request) {
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'x';
    const k = new Request('https://rl.internal/comprobante_' + ip);
    const hit = await caches.default.match(k);
    const n = hit ? (parseInt(await hit.text(), 10) || 0) : 0;
    if (n >= 40) return false;
    await caches.default.put(k, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));
    return true;
  } catch { return true; }
}

function base64(buf) {
  let s = ''; const b = new Uint8Array(buf);
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return btoa(s);
}

const INSTRUCCION = `Eres un asistente contable de un laboratorio dental en Colombia. Te muestran un comprobante de pago
(transferencia, Nequi, Daviplata, Bancolombia, PSE, consignación o similar). Extrae SOLO lo que se lee en el comprobante.
Responde únicamente con JSON con estas claves:
monto (número, sin puntos de miles ni signo), moneda ("COP" o "USD"), fecha ("AAAA-MM-DD" o null), hora ("HH:MM" o null),
medio (banco o billetera, p. ej. "Nequi"), referencia (número de comprobante o aprobación, o null),
destinatario (nombre o número de cuenta/celular que recibió, o null), estado ("exitosa", "pendiente", "rechazada" o null),
confianza (número de 0 a 1: qué tan legible y claro es el comprobante).
Si la imagen no es un comprobante de pago, responde {"monto": null, "confianza": 0, "estado": null, "nota": "no es un comprobante"}.`;

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: cors(request.headers.get('Origin')) });
}

export async function onRequestPost({ request, env }) {
  const h = cors(request.headers.get('Origin'));
  if (!env.GEMINI_API_KEY) return json({ error: 'IA no configurada' }, 503, h);
  if (!(await esPersonal(request, env))) return json({ error: 'No autorizado' }, 403, h);
  if (!(await limite(request))) return json({ error: 'Demasiadas lecturas; espera una hora' }, 429, h);

  let url = '';
  try { url = String((await request.json()).url || ''); } catch { return json({ error: 'Cuerpo inválido' }, 400, h); }
  let u;
  try { u = new URL(url); } catch { return json({ error: 'URL inválida' }, 400, h); }
  if (u.protocol !== 'https:' || !/\.supabase\.co$/i.test(u.hostname)) return json({ error: 'Solo comprobantes guardados en Supabase' }, 400, h);

  const r = await fetch(u.toString());
  if (!r.ok) return json({ error: 'No se pudo descargar el comprobante (' + r.status + ')' }, 502, h);
  const tipo = (r.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  if (!/^image\/(png|jpe?g|webp|heic|heif)$|^application\/pdf$/.test(tipo)) return json({ error: 'Formato no compatible: ' + tipo }, 415, h);
  const buf = await r.arrayBuffer();
  if (buf.byteLength > MAX_BYTES) return json({ error: 'Archivo muy grande (máx. 8 MB)' }, 413, h);

  const body = {
    contents: [{ role: 'user', parts: [{ text: INSTRUCCION }, { inline_data: { mime_type: tipo === 'image/jpg' ? 'image/jpeg' : tipo, data: base64(buf) } }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 400, responseMimeType: 'application/json' },
  };
  let ultimo = '';
  for (const model of MODELS) {
    try {
      const g = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await g.json().catch(() => null);
      const txt = d && d.candidates && d.candidates[0] && d.candidates[0].content && (d.candidates[0].content.parts || []).map(p => p.text || '').join('');
      if (!g.ok || !txt) { ultimo = (d && d.error && d.error.message) || ('HTTP ' + g.status); continue; }
      const datos = JSON.parse(txt.replace(/^```json\s*|```$/g, '').trim());
      const monto = Number(String(datos.monto ?? '').replace(/[^\d.]/g, ''));
      return json({
        monto: Number.isFinite(monto) && monto > 0 ? monto : null, moneda: datos.moneda || 'COP',
        fecha: datos.fecha || null, hora: datos.hora || null, medio: datos.medio || null, referencia: datos.referencia || null,
        destinatario: datos.destinatario || null, estado: datos.estado || null,
        confianza: Math.max(0, Math.min(1, Number(datos.confianza) || 0)), nota: datos.nota || null, modelo: model,
      }, 200, h);
    } catch (e) { ultimo = e.message; }
  }
  return json({ error: 'La IA no pudo leer el comprobante: ' + ultimo }, 502, h);
}
