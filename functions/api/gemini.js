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
// Precios de DISEÑO en pesos para quien escribe desde Colombia (24-nov-2026): salen del catálogo, los mismos del flujo y la
// calculadora. Afuera el asistente sigue en dólares. Caché 5 min.
const PRECIOS_COP = [
  ['corona', 'Pieza cementada (corona, cofia, carilla, incrustación, póntico, endocrown)'], ['corona_ator', 'Pieza sobre implante (atornillada o sobre pilar personalizado)'],
  ['pilar_pers', 'Pilar personalizado solo'], ['provisional', 'Provisional'], ['encerado', 'Encerado o mockup, por diente'],
  ['all_on_4', 'Full Arch / híbrida, por unidad'], ['encia_unidad', 'Encía, por diente'], ['barra', 'Barra sobre implantes, por arcada'],
  ['diseno_modelo', 'Modelo para imprimir, por arcada'], ['diseno_modelo_impl', 'Modelo con implantes (análogos o encía removible), por arcada'],
  ['diseno_troquel', 'Troquel, por pieza'], ['sonrisa_3d', 'Diseño de sonrisa 3D'], ['ferula', 'Férula'], ['guia_1', 'Guía quirúrgica, 1 implante'], ['setup_orto', 'Planificación de alineadores, caso completo con ambas arcadas (se paga primero la viabilidad de $50.000, que se descuenta; si el caso no sigue, es lo único que se cobra)']
];
async function preciosCOP(c, cache) {
  const k = new Request(`https://rl.internal/precios-cop-diseno`);
  const hit = await cache.match(k);
  if (hit) return hit.text();
  const ids = PRECIOS_COP.map(x => x[0]).join(',');
  const [a, b] = await Promise.all([
    fetch(`${c.URL}/rest/v1/catalogo?flujo=eq.diseno&activo=eq.true&id=in.(${ids})&select=id,precio`, { headers: adminH(c.SERVICE) }),
    fetch(`${c.URL}/rest/v1/config_precios?id=eq.express_diseno&select=precio`, { headers: adminH(c.SERVICE) })]);
  const filas = a.ok ? await a.json() : [], ex = b.ok ? await b.json() : [];
  const m = Object.fromEntries(filas.map(f => [f.id, Number(f.precio) || 0]));
  const fmt = n => '$' + Math.round(n).toLocaleString('es-CO');
  const lineas = PRECIOS_COP.filter(x => m[x[0]] > 0).map(x => `• ${x[1]}: ${fmt(m[x[0]])}`);
  const texto = lineas.length ? 'PRECIOS DE DISEÑO CAD EN PESOS COLOMBIANOS (la persona escribe desde Colombia: si pregunta precios de diseño, dalos en pesos con esta tabla, no en dólares; son solo diseño; el pedido final se confirma en /flujo-diseno o por WhatsApp):\n' +
    lineas.join('\n') + (ex[0] && Number(ex[0].precio) > 0 ? `\n• Express (desde 15 min en trabajos simples): +${fmt(ex[0].precio)}` : '') +
    '\nTiempos: normal 24 a 48 h hábiles. Pago 100 % anticipado.' : '';
  await cache.put(k, new Response(texto, { headers: { 'Cache-Control': 'max-age=300' } }));
  return texto;
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
  // Solo pasa a Gemini lo que usa el chat: conversación en texto, instrucción de sistema y parámetros básicos.
  // Antes el cliente podía mandar tools (búsqueda de Google, se cobra aparte), cachedContent o thinkingConfig
  // y usar la clave del laboratorio como un modelo propio.
  body = limpiarCuerpoGemini(body);
  // Cap de tokens de SALIDA — el cliente no puede pedir respuestas enormes (costo).
  body.generationConfig.maxOutputTokens = Math.min(Number(body.generationConfig.maxOutputTokens) || 1024, 2048);

  // ── Conocimiento aprobado + privacidad ──
  const _c = request.headers.get('X-Canal') || body.canal;
  const canal = ['chat', 'orbe', 'buscador'].includes(_c) ? _c : 'chat';
  delete body.canal;                                   // Gemini rechaza campos desconocidos
  const c = cfg(env);
  const pregunta = ultimaPregunta(body);
  let usadas = [];
  const extra = ['PRIVACIDAD: si el usuario escribe datos de un paciente (nombre, documento, teléfono, fotos), no los repitas y recuérdale con amabilidad que no los comparta en este chat.'];
  // Desde Colombia: precios de diseño en pesos (del catálogo)
  if (String((request.cf && request.cf.country) || request.headers.get('CF-IPCountry') || '').toUpperCase() === 'CO' && c.SERVICE) {
    try { const t = await preciosCOP(c, cache); if (t) extra.push(t); } catch (e) { /* sin tabla: el asistente sigue igual */ }
  }
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

  // El error del proveedor (cupo, clave, modelo) va al log del servidor; al navegador, un mensaje genérico
  // (sin «configurado» ni «solicitudes», que header.js usa para otros casos)
  console.error('[gemini] todos los modelos fallaron:', String(lastError || '').slice(0, 300));
  return new Response(JSON.stringify({ error: 'El asistente no está disponible en este momento' }), {
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

// Lista blanca del cuerpo que se reenvía a Gemini (ver comentario en onRequestPost).
function limpiarCuerpoGemini(b) {
  const soloTexto = (parts, max) => (Array.isArray(parts) ? parts : [])
    .filter(p => p && typeof p.text === 'string')
    .map(p => ({ text: p.text.slice(0, max) }));
  const contents = (Array.isArray(b && b.contents) ? b.contents : []).slice(-30)
    .map(m => ({ role: m && m.role === 'model' ? 'model' : 'user', parts: soloTexto(m && m.parts, 8000) }))
    .filter(m => m.parts.length);
  const si = (b && (b.system_instruction || b.systemInstruction)) || null;
  const siParts = si ? soloTexto(si.parts, 16000) : [];
  const gc = (b && b.generationConfig) || {};
  const generationConfig = {};
  for (const k of ['temperature', 'topP', 'topK', 'maxOutputTokens', 'responseMimeType']) {
    if (gc[k] !== undefined && gc[k] !== null) generationConfig[k] = gc[k];
  }
  const limpio = { contents, generationConfig, system_instruction: { parts: siParts.length ? siParts : [{ text: '' }] } };
  if (b && b.canal !== undefined) limpio.canal = b.canal;              // lo lee y lo borra el propio handler
  if (b && Array.isArray(b.safetySettings)) limpio.safetySettings = b.safetySettings.slice(0, 8);
  return limpio;
}
