#!/usr/bin/env node
/**
 * PRODIGY — Auto-Journal Generator
 * ─────────────────────────────────────────────────────────────
 * Motor: Google Gemini 2.0 Flash (gratuito, 1500 req/día)
 * Imágenes: Unsplash API (gratuito, 50 req/hora)
 * Social copy: GitHub Actions Artifact (privado)
 *
 * Variables de entorno requeridas (GitHub Secrets):
 *   GEMINI_API_KEY      — Google AI Studio → aistudio.google.com
 *   UNSPLASH_ACCESS_KEY — unsplash.com/developers → New Application
 */

'use strict';

const https  = require('https');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const ARTICLES_PATH = path.join(__dirname, '..', 'articles.js');
const SOCIAL_PATH   = path.join(__dirname, '..', 'marketing-social.txt');
const GEMINI_KEY    = process.env.GEMINI_API_KEY;
const UNSPLASH_KEY  = process.env.UNSPLASH_ACCESS_KEY;

// ── Temas rotativos — odontología digital real ────────────────────
const TOPIC_POOL = [
  {
    slug_prefix: 'exocad',
    chip: 'Software CAD',
    emoji: '🖥️',
    grad: 'grad-1',
    categoria: 'software',
    lectura: '7 min',
    titulo_seed: 'Exocad DentalCAD 2025',
    tema_es: 'Novedades de Exocad DentalCAD en 2025: nuevas funciones para diseño de coronas, puentes e implantes, comparativa con versiones anteriores y casos clínicos documentados.',
    unsplash_query: 'dental CAD software technology',
  },
  {
    slug_prefix: 'zirconio',
    chip: 'Materiales',
    emoji: '💎',
    grad: 'grad-2',
    categoria: 'materiales',
    lectura: '6 min',
    titulo_seed: 'Zirconio translúcido multicapa 2025',
    tema_es: 'Estado del arte del zirconio dental multicapa y translúcido (5Y-PSZ, 4Y-PSZ): propiedades mecánicas, estética, protocolos de cementación adhesiva y estudios clínicos comparativos publicados 2022-2025.',
    unsplash_query: 'dental crown ceramic laboratory',
  },
  {
    slug_prefix: 'scanner-intraoral',
    chip: 'Escáneres',
    emoji: '📡',
    grad: 'grad-3',
    categoria: 'tecnologia',
    lectura: '6 min',
    titulo_seed: 'Escáneres intraorales 2025',
    tema_es: 'Comparativa de precisión y exactitud de los principales escáneres intraorales en 2025 (iTero Element 7, 3Shape Trios 5, Medit i700, Carestream CS 3800): estudios de trueness y precision publicados en revistas indexadas.',
    unsplash_query: 'intraoral scanner dental technology',
  },
  {
    slug_prefix: 'impresion3d-dental',
    chip: 'Impresión 3D',
    emoji: '🖨️',
    grad: 'grad-4',
    categoria: 'fabricacion',
    lectura: '6 min',
    titulo_seed: 'Impresión 3D dental resinas 2025',
    tema_es: 'Avances en resinas fotopolimerizables para impresión 3D dental en 2025: resinas para provisionales de larga duración, modelos de estudio, guías quirúrgicas y férulas. Precisión clínica y protocolos de post-curado según estudios publicados.',
    unsplash_query: '3D printing dental laboratory resin',
  },
  {
    slug_prefix: 'implantes-digitales',
    chip: 'Implantología',
    emoji: '🦷',
    grad: 'grad-5',
    categoria: 'implantologia',
    lectura: '7 min',
    titulo_seed: 'Flujo digital en implantología 2025',
    tema_es: 'Flujo completamente digital en implantología: planificación con CBCT, guías quirúrgicas impresas en 3D, restauraciones implantosoportadas CAD/CAM y seguimiento postoperatorio. Tasas de éxito y precisión según meta-análisis recientes.',
    unsplash_query: 'dental implant surgery digital',
  },
  {
    slug_prefix: 'dsd-sonrisa',
    chip: 'Diseño Sonrisa',
    emoji: '✨',
    grad: 'grad-1',
    categoria: 'estetica',
    lectura: '5 min',
    titulo_seed: 'Diseño Digital de Sonrisa DSD 2025',
    tema_es: 'Protocolo actualizado de Diseño Digital de Sonrisa (DSD): software disponibles, integración con fotografía facial y escaneo intraoral, mockup digital vs. físico, y evidencia clínica de satisfacción del paciente.',
    unsplash_query: 'dental smile design aesthetic',
  },
  {
    slug_prefix: 'ia-diagnostico-dental',
    chip: 'Inteligencia Artificial',
    emoji: '🤖',
    grad: 'grad-2',
    categoria: 'innovacion',
    lectura: '6 min',
    titulo_seed: 'Inteligencia Artificial en odontología 2025',
    tema_es: 'Aplicaciones de inteligencia artificial en odontología clínica y de laboratorio en 2025: detección de caries por IA, análisis de márgenes en CAD, predicción de carga oclusal, y herramientas aprobadas por FDA/CE disponibles actualmente.',
    unsplash_query: 'artificial intelligence medical dental technology',
  },
  {
    slug_prefix: 'alineadores-digitales',
    chip: 'Ortodoncia Digital',
    emoji: '📐',
    grad: 'grad-3',
    categoria: 'ortodoncia',
    lectura: '5 min',
    titulo_seed: 'Alineadores transparentes flujo digital 2025',
    tema_es: 'Flujo digital completo para alineadores transparentes en 2025: escáner intraoral, software de planificación (Invisalign ClinCheck, 3Shape Ortho Analyzer, uLab), impresión 3D de modelos y fabricación de alineadores. Comparativa de sistemas y resultados clínicos.',
    unsplash_query: 'dental aligners orthodontics clear',
  },
];

// ── Helpers ───────────────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function uid(prefix) {
  return `${prefix}-${todayISO()}-${crypto.randomBytes(2).toString('hex')}`;
}

function pickTopics() {
  const day = new Date().getDay();
  const a = TOPIC_POOL[day % TOPIC_POOL.length];
  const b = TOPIC_POOL[(day + 2) % TOPIC_POOL.length];
  return [a, b];
}

// ── HTTP helper ───────────────────────────────────────────────────
function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
        }
        resolve(data);
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── Gemini API ────────────────────────────────────────────────────
async function callGemini(prompt) {
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
    ]
  });

  const raw = await httpRequest({
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }, body);

  const parsed = JSON.parse(raw);
  if (parsed.error) throw new Error(parsed.error.message);

  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini: respuesta vacía. ' + JSON.stringify(parsed).slice(0, 200));
  return text;
}

// ── Unsplash API ──────────────────────────────────────────────────
async function fetchUnsplashImage(query) {
  if (!UNSPLASH_KEY) {
    console.warn('⚠️  UNSPLASH_ACCESS_KEY no definida — sin imagen');
    return null;
  }
  try {
    const q = encodeURIComponent(query);
    const raw = await httpRequest({
      hostname: 'api.unsplash.com',
      path: `/search/photos?query=${q}&per_page=3&orientation=landscape&content_filter=high`,
      method: 'GET',
      headers: { 'Authorization': `Client-ID ${UNSPLASH_KEY}` }
    });
    const data = JSON.parse(raw);
    const photo = data.results?.[0];
    if (!photo) return null;
    return {
      url:      photo.urls.regular,        // ~1080px
      url_full: photo.urls.full,
      thumb:    photo.urls.small,
      alt:      photo.alt_description || query,
      credit:   `${photo.user.name} on Unsplash`,
      link:     photo.links.html
    };
  } catch (e) {
    console.warn('⚠️  Unsplash error:', e.message);
    return null;
  }
}

// ── Prompt de generación ──────────────────────────────────────────
function buildPrompt(topic) {
  return `Eres un experto en odontología digital con acceso a la literatura científica internacional más reciente (PubMed, Cochrane, JADA, IJOS, Clinical Oral Implants Research, Journal of Prosthodontics, etc.).

Escribe un artículo técnico riguroso en español sobre:
"${topic.tema_es}"

REGLAS ABSOLUTAS:
1. SOLO cita estudios reales y verificables — incluye autores, revista, año, volumen y DOI cuando esté disponible
2. NUNCA inventes estadísticas, porcentajes o citas — si no tienes certeza de un dato, no lo incluyas
3. Nivel técnico para odontólogos generales y técnicos dentales especializados
4. Mínimo 4 secciones temáticas (h2)
5. Mínimo una tabla comparativa con datos reales
6. Mínimo 3 referencias bibliográficas reales con DOI

Devuelve EXACTAMENTE este JSON (sin texto antes ni después, sin markdown):
{
  "titulo": "Título descriptivo y preciso en español (máx 85 chars)",
  "subtitulo": "Resumen del valor clínico del artículo en 1-2 oraciones",
  "contenido": [
    {"t": "p", "c": "Párrafo introductorio con contexto clínico y epidemiológico actual..."},
    {"t": "h2", "c": "Nombre de sección 1"},
    {"t": "p", "c": "Desarrollo técnico con datos concretos y verificables..."},
    {"t": "list", "items": ["Dato técnico verificable 1", "Dato 2", "Dato 3", "Dato 4", "Dato 5"]},
    {"t": "h2", "c": "Nombre de sección 2"},
    {"t": "p", "c": "Contenido técnico..."},
    {"t": "table", "headers": ["Col1", "Col2", "Col3"], "rows": [["val1","val2","val3"],["val4","val5","val6"]]},
    {"t": "h2", "c": "Nombre de sección 3"},
    {"t": "p", "c": "Contenido..."},
    {"t": "h2", "c": "Nombre de sección 4"},
    {"t": "p", "c": "Contenido..."},
    {"t": "quote", "c": "Conclusión o cita de estudio relevante", "author": "Apellido et al., Revista, Año"}
  ],
  "referencias": [
    "Apellido A, Apellido B. Título completo del artículo. Nombre Revista. Año;Vol(N):pp-pp. doi:10.XXXX/XXXXX",
    "Apellido C et al. Título. Revista. Año;Vol:pp. doi:10.XXXX/XXXXX",
    "Apellido D, Apellido E. Título. Revista. Año;Vol(N):pp-pp. PMID: XXXXXXXX"
  ],
  "faq": [
    {"q": "Pregunta clínica frecuente relevante al tema", "a": "Respuesta técnica precisa basada en evidencia"},
    {"q": "Segunda pregunta clínica práctica", "a": "Respuesta con recomendación aplicable"}
  ],
  "social_instagram": "Texto para Instagram máx 150 chars. Dato sorprendente + 3 hashtags relevantes en odontología.",
  "social_linkedin": "Texto para LinkedIn 2-3 oraciones. Insight técnico clave para profesionales dentales. Sin hashtags."
}`;
}

// ── Parsear y validar respuesta Gemini ────────────────────────────
function parseGeminiResponse(raw) {
  let jsonStr = raw.trim();

  // Eliminar bloques ```json si Gemini los incluye
  const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) jsonStr = match[1].trim();

  const data = JSON.parse(jsonStr);

  // Validaciones mínimas
  if (!data.titulo)    throw new Error('Falta titulo');
  if (!data.contenido) throw new Error('Falta contenido');
  if (!Array.isArray(data.referencias) || data.referencias.length < 2)
    throw new Error('Insuficientes referencias');

  return data;
}

// ── Construir objeto artículo ─────────────────────────────────────
function buildArticleObject(topic, aiData, image) {
  return {
    id:        uid(topic.slug_prefix),
    titulo:    aiData.titulo,
    subtitulo: aiData.subtitulo || '',
    categoria: topic.categoria,
    chip:      topic.chip,
    fecha:     todayISO(),
    lectura:   topic.lectura,
    vistas:    '0',
    emoji:     topic.emoji,
    grad:      topic.grad,
    og_img:    image ? image.url : '',
    img_credit: image ? image.credit : '',
    img_link:   image ? image.link : '',
    contenido:  aiData.contenido,
    faq:        aiData.faq || [],
    referencias: aiData.referencias || []
  };
}

// ── Leer artículos existentes ─────────────────────────────────────
function readExistingArticles() {
  const raw = fs.readFileSync(ARTICLES_PATH, 'utf8');
  const match = raw.match(/const ARTICLES\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) throw new Error('No se encontró ARTICLES en articles.js');
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return ${match[1]}`)();
}

// ── Serializar → articles.js ──────────────────────────────────────
function serializeArticles(articles) {
  const header =
`/* ============================================================
   PRODIGY — Base de artículos técnicos
   Para agregar un artículo manualmente: copia un objeto del array
   y llena los campos. article.html lo renderiza automáticamente.
   Última actualización automática: ${todayISO()}
   ============================================================ */

const ARTICLES = [

`;
  const footer = `
];

if (typeof module !== 'undefined') module.exports = { ARTICLES };
`;
  const items = articles
    .map(a =>
      '/* ─────────────────────────────────────────────────── */\n' +
      JSON.stringify(a, null, 2)
    )
    .join(',\n\n');

  return header + items + footer;
}

// ── Social copy (va a GitHub Artifact, no al repo) ────────────────
function writeSocialFile(newArticles, socialDataList) {
  const date = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const sep = '═'.repeat(60);

  let content = `${sep}\nPRODIGY AUTO-JOURNAL — ${date}\n${sep}\n`;

  newArticles.forEach((art, i) => {
    const s = socialDataList[i] || {};
    const url = `https://prodigylabdental.com/article.html?id=${art.id}`;
    content += `\n📝 ARTÍCULO: ${art.titulo}\n`;
    content += `🔗 URL: ${url}\n`;
    if (art.og_img) content += `🖼️  IMAGEN: ${art.og_img}\n`;
    content += `\n📸 INSTAGRAM (copia y pega):\n${s.social_instagram || '—'}\n`;
    content += `\n💼 LINKEDIN (copia y pega):\n${s.social_linkedin || '—'}\n`;
    content += `\n${'─'.repeat(40)}\n`;
  });

  fs.writeFileSync(SOCIAL_PATH, content, 'utf8');
  console.log('✅ marketing-social.txt generado (GitHub Artifact — no se sube al repo)');
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  if (!GEMINI_KEY) {
    console.error('❌ GEMINI_API_KEY no está definida');
    process.exit(1);
  }

  console.log(`\n🚀 ProDigy Auto-Journal — ${todayISO()}`);
  console.log(`📡 Motor: Google Gemini 2.0 Flash`);
  console.log(`🖼️  Imágenes: Unsplash${UNSPLASH_KEY ? ' ✓' : ' (sin key)'}\n`);

  const topics = pickTopics();
  const newArticles   = [];
  const socialDataList = [];

  for (const topic of topics) {
    console.log(`\n── Generando: "${topic.titulo_seed}"`);

    try {
      // 1. Texto con Gemini
      const raw    = await callGemini(buildPrompt(topic));
      const aiData = parseGeminiResponse(raw);
      console.log(`   ✅ Texto: "${aiData.titulo}"`);
      console.log(`   📚 Referencias: ${aiData.referencias.length}`);

      // 2. Imagen con Unsplash
      const image = await fetchUnsplashImage(topic.unsplash_query);
      if (image) console.log(`   🖼️  Imagen: ${image.credit}`);
      else        console.log(`   ⚠️  Sin imagen`);

      // 3. Construir artículo
      const article = buildArticleObject(topic, aiData, image);
      newArticles.push(article);
      socialDataList.push(aiData);

    } catch (err) {
      console.error(`   ❌ Error (${topic.slug_prefix}):`, err.message);
    }
  }

  if (newArticles.length === 0) {
    console.error('\n❌ No se generó ningún artículo. Abortando.');
    process.exit(1);
  }

  // 4. Prepend al articles.js existente
  let existing = [];
  try {
    existing = readExistingArticles();
    console.log(`\n📚 Artículos existentes: ${existing.length}`);
  } catch (e) {
    console.warn('⚠️  No se pudo leer articles.js:', e.message);
  }

  const allArticles = [...newArticles, ...existing];
  fs.writeFileSync(ARTICLES_PATH, serializeArticles(allArticles), 'utf8');
  console.log(`✅ articles.js → ${allArticles.length} artículos totales`);

  // 5. Social copy (Artifact)
  writeSocialFile(newArticles, socialDataList);

  console.log('\n🎉 Auto-Journal completado.\n');
  newArticles.forEach(a => {
    console.log(`   → ${a.titulo}`);
    console.log(`     ID: ${a.id}`);
    if (a.og_img) console.log(`     IMG: ${a.og_img.slice(0, 60)}...`);
  });
}

main().catch(err => {
  console.error('\nFatal:', err.message);
  process.exit(1);
});
