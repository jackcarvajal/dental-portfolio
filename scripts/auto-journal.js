#!/usr/bin/env node
/**
 * PRODIGY — Auto-Journal Generator
 * Genera artículos técnicos con Perplexity API y los inserta en articles.js
 * Ejecutado por GitHub Actions cada martes y jueves a las 9:00 AM.
 *
 * Variables de entorno requeridas:
 *   PERPLEXITY_API_KEY  — API Key de Perplexity (en GitHub Secrets)
 */

'use strict';

const https  = require('https');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const ARTICLES_PATH      = path.join(__dirname, '..', 'articles.js');
const SOCIAL_PATH        = path.join(__dirname, '..', 'marketing-social.txt');
const API_KEY            = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_MODEL   = 'llama-3.1-sonar-large-128k-online';

// ── Temas rotativos ───────────────────────────────────────────────
const TOPIC_POOL = [
  {
    slug_prefix: 'exocad',
    chip: 'CAD',
    emoji: '🖥️',
    grad: 'grad-1',
    categoria: 'software',
    tema: 'Novedades y trucos avanzados de Exocad 2025 para diseño de coronas y puentes en laboratorio dental. Incluye comparativa con 3Shape Dental System.',
    lectura: '6 min'
  },
  {
    slug_prefix: 'zirconio',
    chip: 'Materiales',
    emoji: '💎',
    grad: 'grad-2',
    categoria: 'materiales',
    tema: 'Innovaciones en zirconio multicapa y translúcido (5Y-PSZ): resistencia, estética y protocolos de cementación. Datos de estudios 2024-2025.',
    lectura: '5 min'
  },
  {
    slug_prefix: 'impresion3d',
    chip: 'Fabricación',
    emoji: '🖨️',
    grad: 'grad-3',
    categoria: 'fabricacion',
    tema: 'Avances en impresión 3D dental 2025: resinas de cuarta generación, precisión de ajuste clínico y casos de uso en provisionales y modelos de estudio.',
    lectura: '5 min'
  },
  {
    slug_prefix: 'flujo-digital',
    chip: 'Protocolo',
    emoji: '📋',
    grad: 'grad-4',
    categoria: 'protocolo',
    tema: 'Optimización del flujo digital dental completo: escaneo intraoral, diseño CAD y fresado CAM. Tiempos, checkpoints y métricas de calidad en laboratorio.',
    lectura: '7 min'
  },
  {
    slug_prefix: 'implantes-digitales',
    chip: 'Implantología',
    emoji: '🦷',
    grad: 'grad-5',
    categoria: 'implantologia',
    tema: 'Flujo digital en implantología: planificación con CBCT, guías quirúrgicas impresas y restauraciones sobre implante. Estado del arte 2025.',
    lectura: '6 min'
  },
  {
    slug_prefix: 'estetica-digital',
    chip: 'Estética',
    emoji: '✨',
    grad: 'grad-1',
    categoria: 'estetica',
    tema: 'Carillas de cerámica en el flujo digital: diseño de sonrisa con DSD, mockups digitales y protocolo de preparación mínimamente invasiva.',
    lectura: '5 min'
  }
];

// ── Helpers ───────────────────────────────────────────────────────
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function uid(prefix) {
  return `${prefix}-${todayISO()}-${crypto.randomBytes(2).toString('hex')}`;
}

function pickTopic() {
  // Elige el tópico del día basado en día de la semana para evitar repetición
  const day = new Date().getDay(); // 0=Dom, 2=Mar, 4=Jue
  return TOPIC_POOL[day % TOPIC_POOL.length];
}

// ── Perplexity API ────────────────────────────────────────────────
function callPerplexity(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: PERPLEXITY_MODEL,
      messages: [
        {
          role: 'system',
          content: `Eres un redactor técnico especializado en odontología digital y tecnología dental de laboratorio.
Escribes artículos de alta calidad para dentistas y técnicos.
Siempre incluyes datos, estudios o cifras concretas con referencias.
Usas terminología técnica precisa pero accesible.
Responde ÚNICAMENTE con JSON válido. Sin markdown, sin explicaciones adicionales.`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    const options = {
      hostname: 'api.perplexity.ai',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || JSON.stringify(parsed.error)));
          resolve(parsed.choices[0].message.content);
        } catch (e) {
          reject(new Error('Parse error: ' + data.slice(0, 200)));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Prompt de generación ──────────────────────────────────────────
function buildPrompt(topic) {
  return `Genera un artículo técnico dental en español para el ProDigy Journal sobre este tema:
"${topic.tema}"

Devuelve EXACTAMENTE este JSON (sin texto antes ni después):
{
  "titulo": "Título del artículo (máx 80 chars, en español, sin comillas internas)",
  "subtitulo": "Bajada descriptiva de 1-2 oraciones que explica el valor del artículo",
  "contenido": [
    {"t": "p", "c": "Párrafo introductorio con contexto clínico relevante..."},
    {"t": "h2", "c": "Subtítulo de sección 1"},
    {"t": "p", "c": "Desarrollo técnico con datos concretos..."},
    {"t": "list", "items": ["Punto técnico 1 con dato", "Punto 2", "Punto 3", "Punto 4", "Punto 5"]},
    {"t": "h2", "c": "Subtítulo de sección 2"},
    {"t": "p", "c": "Más contenido técnico..."},
    {"t": "h2", "c": "Subtítulo de sección 3"},
    {"t": "p", "c": "Contenido..."},
    {"t": "quote", "c": "Cita técnica relevante de un estudio o experto", "author": "Autor, Institución, Año"},
    {"t": "h2", "c": "Conclusiones clínicas"}
  ],
  "referencias": [
    "Autor A, Autor B. Título del estudio. Revista. Año;vol(n):pp-pp.",
    "Autor C et al. Otro estudio relevante. Journal. Año;vol:pp."
  ],
  "social_instagram": "Texto para Instagram de máx 150 chars con 3 hashtags relevantes",
  "social_linkedin": "Texto para LinkedIn de 2-3 oraciones profesionales con el insight clave del artículo"
}

REGLAS:
- Mínimo 4 secciones h2
- Mínimo 5 puntos en la lista
- Mínimo 2 referencias académicas reales (con DOI si es posible)
- El contenido debe ser técnicamente preciso, no genérico
- NO incluyas comillas dobles dentro de los valores JSON (usa simples o evítalas)`;
}

// ── Leer y parsear articles.js existente ─────────────────────────
function readExistingArticles() {
  const raw = fs.readFileSync(ARTICLES_PATH, 'utf8');
  // Extrae el array entre los primeros [ y el último ]
  const match = raw.match(/const ARTICLES\s*=\s*(\[[\s\S]*\]);/);
  if (!match) throw new Error('No se encontró const ARTICLES en articles.js');
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return ${match[1]}`)();
}

// ── Construir objeto artículo ─────────────────────────────────────
function buildArticleObject(topic, aiData) {
  const id = uid(topic.slug_prefix);
  return {
    id,
    titulo:    aiData.titulo,
    subtitulo: aiData.subtitulo,
    categoria: topic.categoria,
    chip:      topic.chip,
    fecha:     todayISO(),
    lectura:   topic.lectura,
    vistas:    '0',
    emoji:     topic.emoji,
    grad:      topic.grad,
    og_img:    '',
    contenido: aiData.contenido,
    faq: [],
    referencias: aiData.referencias || []
  };
}

// ── Serializar array de artículos → articles.js ───────────────────
function serializeArticles(articles) {
  const header = `/* ============================================================
   PRODIGY — Base de artículos técnicos
   Para agregar un artículo: copia un objeto del array ARTICLES
   y llena los campos. article.html lo renderiza automáticamente.
   Última actualización automática: ${todayISO()}
   ============================================================ */

const ARTICLES = [\n\n`;

  const footer = `\n];\n\nif (typeof module !== 'undefined') module.exports = { ARTICLES };\n`;

  const items = articles
    .map(a => '/* ─────────────────────────────────────────────────────────── */\n' +
              JSON.stringify(a, null, 2))
    .join(',\n\n');

  return header + items + footer;
}

// ── Generar marketing-social.txt ──────────────────────────────────
function appendSocialContent(articles, socialDataList) {
  const sep = '─'.repeat(60);
  const date = new Date().toLocaleDateString('es-CO', { dateStyle: 'long' });
  let content = `\n${sep}\nARTÍCULOS GENERADOS — ${date}\n${sep}\n`;

  articles.forEach((art, i) => {
    const social = socialDataList[i] || {};
    content += `\n📝 ${art.titulo}\n`;
    content += `🔗 URL: https://prodigydigitaldentistry.com/article.html?id=${art.id}\n`;
    content += `\n📸 INSTAGRAM:\n${social.social_instagram || '(sin texto)'}\n`;
    content += `\n💼 LINKEDIN:\n${social.social_linkedin || '(sin texto)'}\n\n`;
  });

  fs.appendFileSync(SOCIAL_PATH, content, 'utf8');
  console.log('✅ marketing-social.txt actualizado');
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  if (!API_KEY) {
    console.error('❌ PERPLEXITY_API_KEY no está definida');
    process.exit(1);
  }

  console.log('🚀 ProDigy Auto-Journal iniciado —', todayISO());

  // Generar 2 artículos con temas distintos
  const topicA = TOPIC_POOL[new Date().getDay() % TOPIC_POOL.length];
  const topicB = TOPIC_POOL[(new Date().getDay() + 1) % TOPIC_POOL.length];
  const topics = [topicA, topicB];

  const newArticles = [];
  const socialDataList = [];

  for (const topic of topics) {
    console.log(`\n📡 Generando artículo: "${topic.tema.slice(0, 60)}..."`);
    try {
      const rawResponse = await callPerplexity(buildPrompt(topic));

      // Extraer JSON del response (puede venir con ```json ... ```)
      let jsonStr = rawResponse;
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1];

      const aiData = JSON.parse(jsonStr);
      const article = buildArticleObject(topic, aiData);
      newArticles.push(article);
      socialDataList.push(aiData);
      console.log(`✅ Artículo generado: ${article.titulo}`);
    } catch (err) {
      console.error(`❌ Error generando artículo (${topic.slug_prefix}):`, err.message);
    }
  }

  if (newArticles.length === 0) {
    console.error('❌ No se generó ningún artículo. Abortando.');
    process.exit(1);
  }

  // Leer artículos existentes y prepend los nuevos
  let existing = [];
  try {
    existing = readExistingArticles();
    console.log(`📚 Artículos existentes: ${existing.length}`);
  } catch (err) {
    console.warn('⚠️  No se pudo leer articles.js existente:', err.message);
  }

  // Los nuevos van al inicio (más recientes primero)
  const allArticles = [...newArticles, ...existing];

  // Escribir articles.js
  fs.writeFileSync(ARTICLES_PATH, serializeArticles(allArticles), 'utf8');
  console.log(`\n✅ articles.js actualizado — total: ${allArticles.length} artículos`);

  // Escribir marketing-social.txt
  appendSocialContent(newArticles, socialDataList);

  console.log('\n🎉 Auto-Journal completado.');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
