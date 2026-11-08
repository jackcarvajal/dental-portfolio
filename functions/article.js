/**
 * Cloudflare Pages Function — /article?id=XXX
 *
 * PROBLEMA SEO QUE RESUELVE:
 *   article.html arma el contenido con JavaScript (lee ARTICLES de /articles.js
 *   en el navegador). En el HTML ESTÁTICO que ve Googlebot en su primera pasada,
 *   el <link rel="canonical"> apunta a /journal para TODOS los artículos, y el
 *   JS lo corrige solo si Google re-renderiza. Resultado en Search Console:
 *   "Página alternativa con etiqueta canónica adecuada" → los artículos no se
 *   indexan (se tratan como alternativos de /journal).
 *
 * QUÉ HACE:
 *   Intercepta /article, sirve el article.html estático (next()) y, con
 *   HTMLRewriter, inyecta del lado del SERVIDOR el canonical/og:url correctos
 *   (self-URL, no depende de datos) y —best-effort— el título/descripción/imagen
 *   reales del artículo leídos de /articles.js. El JS del cliente sigue igual.
 *
 * Idempotente y tolerante: si no hay ?id o no es HTML, pasa la respuesta tal cual;
 *   si no logra leer los metadatos, al menos deja el canonical correcto.
 */

const DOMINIO = 'https://prodigylabdental.com';

class PonerAttr {
  constructor(attr, valor) { this.attr = attr; this.valor = valor; }
  element(el) { el.setAttribute(this.attr, this.valor); }
}
class PonerTexto {
  constructor(texto) { this.texto = texto; }
  element(el) { el.setInnerContent(this.texto); }
}
class Quitar {
  element(el) { el.remove(); }
}
class PonerJSONLD {
  constructor(json) { this.json = json; }
  element(el) { el.setInnerContent(this.json, { html: true }); }  // JSON crudo, no HTML-escapado
}

function extraerMeta(txt, id) {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp('"id"\\s*:\\s*"' + esc + '"').exec(txt);
  if (!m) return null;
  const slice = txt.slice(m.index, m.index + 4000); // dentro del objeto del artículo
  const campo = (n) => {
    const r = new RegExp('"' + n + '"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"').exec(slice);
    return r ? r[1].replace(/\\"/g, '"').replace(/\\n/g, ' ').replace(/\\\\/g, '\\') : null;
  };
  return { titulo: campo('titulo'), subtitulo: campo('subtitulo'), og_img: campo('og_img'), fecha: campo('fecha'), chip: campo('chip') };
}

// Replica server-side de buildSchema(art) de article.html (Article + BreadcrumbList).
// El JS del cliente igual lo sobre-escribe al renderizar (y añade FAQPage); esto es
// para que Googlebot vea los datos estructurados en su PRIMERA pasada (sin JS).
function construirSchema(meta, selfUrl) {
  const img = meta.og_img ? (meta.og_img.startsWith('http') ? meta.og_img : DOMINIO + meta.og_img) : null;
  const articulo = {
    '@type': ['Article', 'MedicalWebPage'],
    'headline': meta.titulo,
    'description': meta.subtitulo,
    'datePublished': meta.fecha,
    'dateModified': meta.fecha,
    'inLanguage': 'es-CO',
    'author': { '@type': 'Organization', 'name': 'PRODIGY Lab Dental', 'url': DOMINIO },
    'publisher': { '@type': 'Organization', 'name': 'PRODIGY Lab Dental', 'url': DOMINIO, 'logo': { '@type': 'ImageObject', 'url': DOMINIO + '/assets/icons/icon-192.png' } },
    'mainEntityOfPage': selfUrl,
    'keywords': (meta.chip || '') + ', CAD/CAM dental, odontología digital, laboratorio dental Colombia',
    'medicalAudience': { '@type': 'MedicalAudience', 'audienceType': 'Dentist' },
    'about': { '@type': 'MedicalCondition', 'name': 'Restauraciones dentales CAD/CAM' },
    'speakable': { '@type': 'SpeakableSpecification', 'cssSelector': ['h1', 'h2', '.article-subtitulo', '.article-meta'] }
  };
  if (img) articulo.image = { '@type': 'ImageObject', 'url': img, 'width': 1200, 'height': 630 };
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      articulo,
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': DOMINIO + '/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Journal', 'item': DOMINIO + '/journal' },
          { '@type': 'ListItem', 'position': 3, 'name': meta.titulo, 'item': selfUrl }
        ]
      }
    ]
  };
  return JSON.stringify(schema).replace(/</g, '\\u003c');  // evita romper el </script>
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  const res = await next();                       // sirve el article.html estático
  const ct = res.headers.get('content-type') || '';
  if (!id || !ct.includes('text/html')) return res;

  const selfUrl = DOMINIO + '/article?id=' + encodeURIComponent(id);

  // Metadatos reales (best-effort; cacheado en el edge)
  let meta = null;
  try {
    const aRes = await fetch(url.origin + '/articles.js', { cf: { cacheTtl: 1800, cacheEverything: true } });
    if (aRes.ok) meta = extraerMeta(await aRes.text(), id);
  } catch (_) { /* el canonical se corrige igual */ }

  // El canonical SIEMPRE se corrige (no depende de los datos) → arregla el "alternativo"
  let rw = new HTMLRewriter()
    .on('link#canonical', new PonerAttr('href', selfUrl))
    .on('meta#og-url', new PonerAttr('content', selfUrl))
    // hreflang: es/x-default al self; el 'en' es fantasma (no hay artículos en inglés) → se quita
    .on('link[hreflang="es"]', new PonerAttr('href', selfUrl))
    .on('link[hreflang="x-default"]', new PonerAttr('href', selfUrl))
    .on('link[hreflang="en"]', new Quitar());

  if (meta && meta.titulo) {
    const full = meta.titulo + ' | PRODIGY Lab Dental';
    rw = rw
      .on('title', new PonerTexto(full))
      .on('meta#meta-title', new PonerAttr('content', full))
      .on('meta#og-title', new PonerAttr('content', meta.titulo))
      .on('meta#tw-title', new PonerAttr('content', meta.titulo))
      // Hero VISIBLE server-side → mata el CLS (el h1/chip dejan de nacer vacíos y
      // crecer cuando el JS llega) y adelanta el LCP (el h1 pinta en la 1ª pasada).
      // El JS del cliente los re-escribe al mismo valor, sin salto de layout.
      .on('h1#article-title', new PonerTexto(meta.titulo))
      .on('div#hero-chip', new PonerTexto(meta.chip || ''))
      .on('div#article-meta', new PonerAttr('style', 'min-height:46px')); // reserva la meta (2 líneas móvil)
  }
  if (meta && meta.subtitulo) {
    rw = rw
      .on('meta#meta-desc', new PonerAttr('content', meta.subtitulo))
      .on('meta#og-desc', new PonerAttr('content', meta.subtitulo))
      .on('meta#tw-desc', new PonerAttr('content', meta.subtitulo))
      .on('p#article-sub', new PonerTexto(meta.subtitulo)); // subtítulo visible server-side (anti-CLS)
  }
  if (meta && meta.og_img) {
    const img = meta.og_img.startsWith('http') ? meta.og_img : DOMINIO + meta.og_img;
    rw = rw
      .on('meta#og-image', new PonerAttr('content', img))
      .on('meta#tw-image', new PonerAttr('content', img));
  }

  // JSON-LD Article + BreadcrumbList server-side (el <script id=jsonld-schema> va vacío en estático)
  if (meta && meta.titulo && meta.fecha) {
    rw = rw.on('script#jsonld-schema', new PonerJSONLD(construirSchema(meta, selfUrl)));
  }

  return rw.transform(res);
}
