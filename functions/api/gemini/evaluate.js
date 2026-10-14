/**
 * PRODIGY — Evaluador de planificación de implantes (crítica clínica)
 * Cloudflare Pages Function — POST /api/gemini/evaluate
 *
 * Reemplaza al backend de Cloud Run de la app de AI Studio, usando la clave de Gemini del lab
 * (env.GEMINI_API_KEY, la misma del chatbot). La lógica clínica vive aquí (server-side): el front
 * manda { planning: {...} } y recibe { critique: "markdown" }. Rate-limit + cap de salida para el costo.
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
  if (n >= 10) return false;   // 10 evaluaciones/min por IP
  await cache.put(key, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=60' } }));
  return true;
}

const SONA = { anterior: 'Anterior (sector estético)', premolar: 'Premolar', molar: 'Molar / posterior' };
const HUESO = { D1: 'D1 — cortical muy densa', D2: 'D2 — trabeculado ideal con cortical definida', D3: 'D3 — cortical fina, trabeculado poco denso', D4: 'D4 — hueso blando, cortical casi ausente', D5: 'D5 — esponjoso muy blando' };

function describir(p) {
  if (!p || typeof p !== 'object') return 'Sin datos de planificación.';
  const L = [];
  const add = (k, v) => { if (v !== undefined && v !== null && v !== '') L.push(`- ${k}: ${v}`); };
  add('Zona', SONA[p.toothZone] || p.toothZone);
  add('Sistema de implante', p.implantSystem === 'tissue_level' ? 'Tissue Level' : p.implantSystem === 'bone_level' ? 'Bone Level' : p.implantSystem);
  add('Diámetro', p.implantDiameter);
  add('Angulación buco-lingual (°)', p.angulationBL);
  add('Profundidad de plataforma (mm)', p.platformDepth);
  add('Calidad ósea', HUESO[p.boneType] || p.boneType);
  add('Ancho óseo (mm)', p.boneWidth);
  add('Altura ósea disponible (mm)', p.boneHeight);
  add('Distancia al nervio dentario (mm)', p.distanceNerve);
  add('Distancia al seno maxilar (mm)', p.distanceSinus);
  add('Nivel de mucosa', p.mucosaLevel);
  add('Color de mucosa', p.mucosaColor);
  add('Diseño protésico', p.prostheticType === 'screw' ? 'Atornillado' : p.prostheticType === 'cement' ? 'Cementado' : p.prostheticType);
  return L.join('\n');
}

const SISTEMA = `Eres el Mentor de Implantología de PRODIGY Lab Dental: asesoras al odontólogo sobre una planificación de implante que te entrega.
Devuelves SIEMPRE una crítica clínica en Markdown, basada en consensos de la ITI y literatura científica revisada, con esta estructura:

### 🩺 Diagnóstico Clínico de Respaldo — Zona {zona}
#### 1. Puntos fuertes y estabilidad primaria
#### 2. Factores de riesgo críticos detectados
#### 3. Recomendaciones quirúrgicas y protésicas
#### 4. Siguiente paso recomendado
#### 5. Conclusión

Reglas:
- En "Siguiente paso recomendado" indica la acción concreta más útil para el caso (p. ej. confirmar con CBCT, planificar injerto/elevación de seno, o diseñar una guía quirúrgica para transferir la posición con precisión). Si procede, menciona que PRODIGY puede diseñar la guía quirúrgica y la planificación digital del caso.
- Usa 🟢 (favorable), 🟡 (precaución) y 🔴 (alerta) al inicio de cada punto.
- Sé específico con los parámetros dados (tipo de hueso D1–D5, angulación, distancias al nervio y seno, mucosa, diseño protésico). Cita el concepto biológico (p. ej. grosor vestibular ≥2 mm, membrana de Schneider, perfil de emergencia, periimplantitis, cementitis).
- NO inventes valores que no se dieron: si un dato falta o llega como "undefined", dilo explícitamente y recomienda complementarlo con CBCT.
- No des un diagnóstico definitivo ni indicaciones de fármacos.
- Cierra SIEMPRE con esta línea exacta en cursiva:
_Herramienta de apoyo a la planificación digital de PRODIGY. No sustituye el juicio clínico ni el examen del profesional tratante._
- Español, tono profesional y directo. Máximo ~450 palabras.`;

async function llamarGemini(apiKey, system, userText, image) {
  const parts = [{ text: userText }];
  if (image && image.data && image.mimeType) parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
  const body = {
    contents: [{ role: 'user', parts: parts }],
    system_instruction: { parts: [{ text: system }] },
    generationConfig: { temperature: 0.4, maxOutputTokens: image ? 1800 : 1400 },
  };
  // Con imagen solo se usa el modelo con visión (evita el fallback a -lite que la rechaza y alarga la respuesta)
  const models = image ? ['gemini-2.5-flash'] : MODELS;
  let last = '';
  for (const model of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.candidates && data.candidates[0]) {
        return { text: (data.candidates[0].content?.parts || []).map(p => p.text || '').join('') };
      }
      last = (data && data.error && data.error.message) || ('HTTP ' + res.status);
    } catch (e) { last = 'Red: ' + (e && e.message || e); }
  }
  return { text: null, err: last };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const H = cors(origin);
  const ok = ORIGINS.includes(origin) || /^https:\/\/([a-z0-9-]+\.)?dental-portfolio-em6\.pages\.dev$/.test(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || origin === '';
  if (!ok) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: H });
  if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({ error: 'Evaluador no configurado' }), { status: 503, headers: H });
  if (!(await rateLimit(request, 'eval'))) return new Response(JSON.stringify({ error: 'Demasiadas evaluaciones. Espera un momento.' }), { status: 429, headers: H });

  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: H }); }
  const planning = body && body.planning;
  if (!planning || typeof planning !== 'object') return new Response(JSON.stringify({ error: 'Falta la planificación' }), { status: 400, headers: H });
  if (JSON.stringify(planning).length > 4000) return new Response(JSON.stringify({ error: 'Datos demasiado largos' }), { status: 413, headers: H });

  // Imagen 2D OPCIONAL (radiografía / corte de CBCT) para análisis multimodal
  let image = null;
  if (body.image && typeof body.image === 'object' && body.image.data && body.image.mimeType) {
    const MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
    if (!MIMES.includes(String(body.image.mimeType))) return new Response(JSON.stringify({ error: 'Formato de imagen no soportado (usa JPG, PNG o WEBP).' }), { status: 400, headers: H });
    if (String(body.image.data).length > 5000000) return new Response(JSON.stringify({ error: 'Imagen demasiado grande (máx ~3.5 MB).' }), { status: 413, headers: H });
    image = { data: String(body.image.data), mimeType: String(body.image.mimeType) };
  }

  const _dbg = image ? new URL(request.url).searchParams.get('dbg') : null;
  if (_dbg === '1') {
    return new Response(JSON.stringify({ critique: 'DEBUG: imagen recibida — mime=' + image.mimeType + ' base64_len=' + image.data.length }), { status: 200, headers: H });
  }
  if (_dbg === '2') {
    // Llama a Gemini con la imagen y devuelve la respuesta CRUDA (para ver qué contesta)
    let out = 'inicio';
    try {
      const b = { contents: [{ role: 'user', parts: [{ text: 'Describe brevemente esta imagen.' }, { inlineData: { mimeType: image.mimeType, data: image.data } }] }], generationConfig: { maxOutputTokens: 200 } };
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + env.GEMINI_API_KEY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
      out = 'HTTP ' + res.status + ' :: ' + (await res.text()).slice(0, 500);
    } catch (e) { out = 'THROW: ' + (e && e.message || e); }
    return new Response(JSON.stringify({ critique: out }), { status: 200, headers: H });
  }

  const zona = SONA[planning.toothZone] || planning.toothZone || 'no indicada';
  const notaImg = image ? '\n\nSe adjunta una IMAGEN 2D del caso (radiografía panorámica/periapical o un corte de CBCT). Analízala SOLO como apoyo: una imagen 2D sin calibración NO permite mediciones exactas, así que no des milímetros exactos a partir de ella. Comenta lo relevante que observes (relación con el nervio dentario o el seno, altura/volumen óseo aparente, densidad, y cualquier hallazgo o patología visible) y correlaciónalo con los parámetros. Si la imagen NO es una radiografía/corte dental legible, dilo con claridad y no la interpretes.' : '';
  const userText = `Evalúa esta planificación de implante:\n\n${describir(planning)}${notaImg}\n\nZona: ${zona}. Entrega la crítica clínica estructurada.`;
  // IMPORTANTE: los errores van con status 200 + {error}. Si devolviéramos 5xx, Cloudflare reemplaza
  // el cuerpo por su propia página "error code: 502" y el front nunca ve el mensaje real.
  let r;
  try { r = await llamarGemini(env.GEMINI_API_KEY, SISTEMA.replace('{zona}', zona), userText, image); }
  catch (e) { return new Response(JSON.stringify({ error: 'Fallo interno: ' + (e && e.message || e) }), { status: 200, headers: H }); }
  if (!r || !r.text) {
    var msg = String(r && r.err || '');
    var amable = /process input image|INVALID_ARGUMENT/i.test(msg)
      ? 'No pude leer la imagen. Sube una radiografía o foto clara (JPG/PNG), o evalúa sin imagen.'
      : 'El evaluador no está disponible ahora. Intenta de nuevo.';
    return new Response(JSON.stringify({ error: amable }), { status: 200, headers: H });
  }
  return new Response(JSON.stringify({ critique: r.text }), { status: 200, headers: H });
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: cors(context.request.headers.get('Origin') || '') });
}
