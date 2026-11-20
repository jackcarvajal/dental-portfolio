// tools/revision-sitio.mjs — revisión SEO/técnica EN VIVO de un sitio completo (todas las URLs de su sitemap).
// Solo GET (no escribe nada). Uso: node tools/revision-sitio.mjs https://prodigylabdental.com
//   (sirve igual para https://alejandrocadcam.com). Sale con código 1 si hay hallazgos graves (no-200, noindex,
//   canonical a otra URL, JSON-LD roto, og:image caída, títulos/descripciones duplicados). 20-nov-2026.

const BASE = process.argv[2].replace(/\/$/, '');
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; revision-sitio/1.0)' };
const get = async (u, opt = {}) => { try { const r = await fetch(u, { headers: UA, redirect: opt.redirect || 'follow' }); return { r, txt: opt.body === false ? '' : await r.text() }; } catch (e) { return { err: e.message }; } };
const attr = (tag, a) => { const m = tag.match(new RegExp(a + '\\s*=\\s*"([^"]*)"', 'i')) || tag.match(new RegExp(a + "\\s*=\\s*'([^']*)'", 'i')); return m ? m[1] : null; };
const metas = (h, sel) => [...h.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0]).filter(t => sel(t));
const dec = s => (s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// ── sitemap (soporta índice) ──
async function urlsDe(sm) { const { txt } = await get(sm); if (!txt) return []; const locs = [...txt.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => dec(m[1]));
  if (/<sitemapindex/i.test(txt)) { let all = []; for (const s of locs) all = all.concat(await urlsDe(s)); return all; } return locs; }
const robots = (await get(BASE + '/robots.txt')).txt || '';
const smRobots = [...robots.matchAll(/^sitemap:\s*(\S+)/gim)].map(m => m[1]);
let urls = []; for (const s of (smRobots.length ? smRobots : [BASE + '/sitemap.xml'])) urls = urls.concat(await urlsDe(s));
urls = [...new Set(urls)];

const issues = []; const add = (u, t) => issues.push([u.replace(BASE, '') || '/', t]);
const titles = {}, descs = {}, ogs = new Set();
async function revisar(u) {
  const { r, txt, err } = await get(u, { redirect: 'manual' });
  if (err) return add(u, 'ERROR de red: ' + err);
  if (r.status >= 300 && r.status < 400) return add(u, `en sitemap pero REDIRIGE ${r.status} → ${r.headers.get('location')}`);
  if (r.status !== 200) return add(u, `en sitemap pero responde ${r.status}`);
  const h = txt, xr = r.headers.get('x-robots-tag') || '';
  const head = h.split(/<\/head>/i)[0];
  const title = dec((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').trim();
  const desc = dec(attr(metas(head, t => /name\s*=\s*["']description["']/i.test(t))[0] || '', 'content') || '').trim();
  const canon = attr([...head.matchAll(/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/gi)].map(m => m[0])[0] || '', 'href');
  const nCanon = [...head.matchAll(/rel\s*=\s*["']canonical["']/gi)].length;
  const robotsMeta = attr(metas(head, t => /name\s*=\s*["']robots["']/i.test(t))[0] || '', 'content') || '';
  const og = attr(metas(head, t => /property\s*=\s*["']og:image["']/i.test(t))[0] || '', 'content');
  const h1 = (h.match(/<h1\b/gi) || []).length;
  if (/noindex/i.test(robotsMeta + ' ' + xr)) add(u, 'en sitemap pero tiene NOINDEX');
  if (!title) add(u, 'sin <title>'); else { (titles[title] ||= []).push(u); if (title.length > 70) add(u, `título largo (${title.length}): ${title}`); }
  if (!desc) add(u, 'sin meta description'); else { (descs[desc] ||= []).push(u); if (desc.length > 170) add(u, `descripción larga (${desc.length})`); if (desc.length < 50) add(u, `descripción corta (${desc.length})`); }
  if (!canon) add(u, 'sin canonical'); else { const norm = x => x.replace(/\/$/, '').replace(/\.html$/, '').replace(/\/index$/, ''); if (norm(new URL(canon, u).href) !== norm(u)) add(u, `canonical apunta a otra URL: ${canon}`); }
  if (nCanon > 1) add(u, `${nCanon} canonical`);
  if (h1 === 0 && !/<script[^>]+header\.js/i.test(h)) add(u, 'sin <h1> en el HTML'); else if (h1 === 0) add(u, 'sin <h1> en el HTML estático (¿lo pinta JS?)'); else if (h1 > 1) add(u, `${h1} etiquetas <h1>`);
  if (!/<html[^>]+lang=/i.test(h)) add(u, 'sin lang en <html>');
  for (const m of h.matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) { try { JSON.parse(m[1]); } catch (e) { add(u, 'JSON-LD inválido: ' + e.message.slice(0, 80)); } }
  if (og) ogs.add(new URL(og, u).href); else add(u, 'sin og:image');
  if (/src\s*=\s*["']http:\/\//i.test(h)) add(u, 'recurso por http:// (contenido mixto)');
  const kb = Math.round(txt.length / 1024); if (kb > 250) add(u, `HTML pesado: ${kb} KB`);
}
for (let i = 0; i < urls.length; i += 6) await Promise.all(urls.slice(i, i + 6).map(revisar));
for (const [t, l] of Object.entries(titles)) if (l.length > 1) add(l[0], `título DUPLICADO en ${l.length} páginas: «${t}» (${l.map(x => x.replace(BASE, '')).join(', ')})`);
for (const [d, l] of Object.entries(descs)) if (l.length > 1) add(l[0], `descripción DUPLICADA en ${l.length} páginas (${l.map(x => x.replace(BASE, '')).join(', ')})`);
for (const o of ogs) { const { r, err } = await get(o, { body: false }); if (err || !r.ok) add(o, `og:image no carga (${err || r.status})`); }

// ── sitio ──
const site = [];
const home = await get(BASE + '/'); const hh = home.r ? home.r.headers : new Headers();
for (const k of ['strict-transport-security', 'content-security-policy', 'x-content-type-options', 'referrer-policy', 'permissions-policy']) if (!hh.get(k)) site.push('falta cabecera ' + k);
if (!hh.get('x-frame-options') && !/frame-ancestors/i.test(hh.get('content-security-policy') || '')) site.push('sin protección contra iframes (x-frame-options / frame-ancestors)');
const n404 = await get(BASE + '/esta-pagina-no-existe-' + Date.now(), { redirect: 'manual' }); site.push('URL inexistente → ' + (n404.r ? n404.r.status + (n404.r.headers.get('location') ? ' → ' + n404.r.headers.get('location') : '') : n404.err));
const http = await get(BASE.replace('https:', 'http:') + '/', { redirect: 'manual', body: false }); site.push('http:// → ' + (http.r ? http.r.status + ' ' + (http.r.headers.get('location') || '') : http.err));
site.push('robots.txt: ' + (robots ? robots.split('\n').filter(l => /^(user-agent|disallow|allow|sitemap)/i.test(l.trim())).length + ' reglas, sitemap ' + (smRobots.length ? 'declarado' : 'NO declarado') : 'NO existe'));

console.log(`\n=== ${BASE} — ${urls.length} URLs en sitemap · ${ogs.size} og:image distintas ===`);
console.log('SITIO:'); site.forEach(s => console.log('  · ' + s));
console.log(`PÁGINAS (${issues.length} hallazgos):`);
const porTipo = {}; for (const [u, t] of issues) { const k = t.replace(/\(.*$|:.*$/, '').trim(); (porTipo[k] ||= []).push(`${u} — ${t}`); }
for (const [k, l] of Object.entries(porTipo).sort((a, b) => b[1].length - a[1].length)) { console.log(`  [${l.length}] ${k}`); l.slice(0, 12).forEach(x => console.log('     ' + x.slice(0, 230))); if (l.length > 12) console.log(`     … y ${l.length - 12} más`); }
// Graves = rompen indexación o seguridad; títulos/descripciones largos y HTML pesado son solo avisos.
const GRAVE = /REDIRIGE|responde \d|NOINDEX|canonical apunta|JSON-LD inválido|og:image no carga|DUPLICAD|ERROR de red|sin <title>|contenido mixto/;
const graves = issues.filter(([, t]) => GRAVE.test(t)).length + site.filter(s => /^falta cabecera|sin protección/.test(s)).length
  + (/→ 404/.test(site.join(' ')) ? 0 : 1);   // una URL inexistente DEBE dar 404 real
console.log(graves ? `\n✗ ${graves} hallazgos graves` : '\n✓ Sin hallazgos graves (títulos/descripciones largos y HTML pesado son avisos)');
process.exit(graves ? 1 : 0);
