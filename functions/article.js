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

function extraerMeta(txt, id) {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp('"id"\\s*:\\s*"' + esc + '"').exec(txt);
  if (!m) return null;
  const slice = txt.slice(m.index, m.index + 4000); // dentro del objeto del artículo
  const campo = (n) => {
    const r = new RegExp('"' + n + '"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"').exec(slice);
    return r ? r[1].replace(/\\"/g, '"').replace(/\\n/g, ' ').replace(/\\\\/g, '\\') : null;
  };
  return { titulo: campo('titulo'), subtitulo: campo('subtitulo'), og_img: campo('og_img') };
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
    .on('meta#og-url', new PonerAttr('content', selfUrl));

  if (meta && meta.titulo) {
    const full = meta.titulo + ' | PRODIGY Lab Dental';
    rw = rw
      .on('title', new PonerTexto(full))
      .on('meta#meta-title', new PonerAttr('content', full))
      .on('meta#og-title', new PonerAttr('content', meta.titulo))
      .on('meta#tw-title', new PonerAttr('content', meta.titulo));
  }
  if (meta && meta.subtitulo) {
    rw = rw
      .on('meta#meta-desc', new PonerAttr('content', meta.subtitulo))
      .on('meta#og-desc', new PonerAttr('content', meta.subtitulo))
      .on('meta#tw-desc', new PonerAttr('content', meta.subtitulo));
  }
  if (meta && meta.og_img) {
    const img = meta.og_img.startsWith('http') ? meta.og_img : DOMINIO + meta.og_img;
    rw = rw
      .on('meta#og-image', new PonerAttr('content', img))
      .on('meta#tw-image', new PonerAttr('content', img));
  }

  return rw.transform(res);
}
