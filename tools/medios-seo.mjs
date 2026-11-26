#!/usr/bin/env node
/* medios-seo.mjs — SEO de fotos y videos propios (assets/trabajos, assets/videos). Gemelo en las dos webs.
   Para cada página del sitemap que use fotos o videos reales:
     1) sitemap.xml: agrega <image:image> (foto en 1600 px) y <video:video> (miniatura, título, descripción,
        archivo y duración) dentro de su <url>, para que Google Imágenes y Videos los encuentre.
     2) la página: un bloque JSON-LD <script id="ld-medios"> con un ImageObject por foto (pie, autor, crédito y
        derechos) y un VideoObject por video (nombre, descripción, miniatura, archivo, duración, fecha).
   Idempotente: vuelve a generar todo cada vez (corre después de agregar o quitar fotos).
   Uso:  node tools/medios-seo.mjs            (detecta la web por el dominio del sitemap)
         node tools/medios-seo.mjs --simular  (solo muestra qué haría)
   Requiere ffprobe en el PATH (o en la ruta de WinGet) para la duración de los videos; sin él la omite. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SIMULAR = process.argv.includes('--simular');
const smPath = path.join(ROOT, 'sitemap.xml');
let sm = fs.readFileSync(smPath, 'utf8');
const DOM = (sm.match(/<loc>(https:\/\/[^/<]+)/) || [])[1];
if (!DOM) { console.error('✗ No pude leer el dominio del sitemap'); process.exit(2); }
const ES_PRODIGY = /prodigylabdental/.test(DOM);
const AUTOR = ES_PRODIGY
  ? { '@type': 'Organization', name: 'PRODIGY Lab Dental', url: DOM + '/' }
  : { '@type': 'Person', name: 'Alejandro Carvajal', url: DOM + '/sobre-mi' };
const CREDITO = ES_PRODIGY ? 'PRODIGY Lab Dental' : 'Alejandro Carvajal · Alejandro CAD/CAM';
const DERECHOS = '© 2026 ' + (ES_PRODIGY ? 'PRODIGY Lab Dental' : 'Alejandro Carvajal');
const FECHA_VIDEO = '2026-11-25T12:00:00-05:00';

const FFPROBE = ['ffprobe', path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', 'ffprobe.exe')]
  .find(p => { try { execFileSync(p, ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } });
const duracion = f => {
  if (!FFPROBE) return null;
  try { const s = parseFloat(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString()); return isFinite(s) ? Math.round(s) : null; } catch { return null; }
};
const limpiar = t => String(t || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const escXml = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const archivoDe = loc => {
  let p = loc.replace(DOM, '').split('?')[0];
  if (p === '' || p === '/') return 'index.html';
  if (p.endsWith('/')) return p.slice(1) + 'index.html';
  return p.slice(1) + '.html';
};

// Lee fotos y videos propios de una página, con su texto (pie o alt)
function medios(html) {
  const fotos = new Map(), videos = new Map();
  // fotos con pie (galerías, franja y respiro): <figure> … assets/trabajos/<slug>-(800|1600).webp … <figcaption>…</figcaption>
  for (const m of html.matchAll(/<figure\b[^>]*>([\s\S]*?)<\/figure>/g)) {
    const bloque = m[1];
    const cap = limpiar((bloque.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/) || [])[1]);
    const v = bloque.match(/assets\/videos\/([\w-]+)\.mp4/);
    if (v) { if (!videos.has(v[1])) videos.set(v[1], cap); continue; }
    const f = bloque.match(/assets\/trabajos\/([\w-]+)-(?:800|1600)\.webp/);
    if (f && !fotos.has(f[1])) {
      const alt = limpiar((bloque.match(/\balt="([^"]*)"/) || [])[1]);
      fotos.set(f[1], cap || alt);
    }
  }
  // fotos sin <figure> (por ejemplo la del fondo del hero): se toman con su alt si lo tienen
  for (const m of html.matchAll(/assets\/trabajos\/([\w-]+)-(?:800|1600)\.webp/g)) if (!fotos.has(m[1])) fotos.set(m[1], '');
  return { fotos, videos };
}

const urls = [...sm.matchAll(/<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g)];
let paginas = 0, nFotos = 0, nVideos = 0;
for (const u of urls) {
  const loc = u[1].replace(/&amp;/g, '&');
  if (loc.includes('?')) continue;                         // artículos: sus portadas las maneja el journal
  const file = path.join(ROOT, archivoDe(loc));
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const original = html;
  const { fotos, videos } = medios(html);
  // 1) sitemap
  let bloque = u[0].replace(/\s*<image:image>[\s\S]*?<\/image:image>/g, '').replace(/\s*<video:video>[\s\S]*?<\/video:video>/g, '');
  const extra = [];
  for (const [slug] of fotos) extra.push(`    <image:image><image:loc>${DOM}/assets/trabajos/${slug}-1600.webp</image:loc></image:image>`);
  const vidData = [];
  for (const [slug, cap] of videos) {
    const seg = duracion(path.join(ROOT, 'assets', 'videos', slug + '.mp4'));
    const titulo = cap.replace(/\.$/, '') || slug.replace(/-/g, ' ');
    vidData.push({ slug, titulo, desc: cap || titulo, seg });
    extra.push(`    <video:video>\n      <video:thumbnail_loc>${DOM}/assets/videos/${slug}.webp</video:thumbnail_loc>\n      <video:title>${escXml(titulo)}</video:title>\n      <video:description>${escXml(cap || titulo)}</video:description>\n      <video:content_loc>${DOM}/assets/videos/${slug}.mp4</video:content_loc>${seg ? `\n      <video:duration>${seg}</video:duration>` : ''}\n      <video:publication_date>${FECHA_VIDEO}</video:publication_date>\n      <video:family_friendly>yes</video:family_friendly>\n    </video:video>`);
  }
  if (extra.length) bloque = bloque.replace(/\s*<\/url>$/, '\n' + extra.join('\n') + '\n  </url>');
  sm = sm.replace(u[0], () => bloque);
  // 2) JSON-LD en la página
  const graph = [];
  for (const [slug, cap] of fotos) graph.push({ '@type': 'ImageObject', contentUrl: `${DOM}/assets/trabajos/${slug}-1600.webp`,
    thumbnailUrl: `${DOM}/assets/trabajos/${slug}-800.webp`, ...(cap ? { caption: cap } : {}), creator: AUTOR, creditText: CREDITO, copyrightNotice: DERECHOS });
  for (const v of vidData) graph.push({ '@type': 'VideoObject', name: v.titulo, description: v.desc,
    thumbnailUrl: [`${DOM}/assets/videos/${v.slug}.webp`], contentUrl: `${DOM}/assets/videos/${v.slug}.mp4`, uploadDate: FECHA_VIDEO,
    ...(v.seg ? { duration: `PT${v.seg}S` } : {}), creator: AUTOR, copyrightNotice: DERECHOS });
  const nl = html.includes('\r\n') ? '\r\n' : '\n';
  const viejo = /[ \t]*<script type="application\/ld\+json" id="ld-medios">[\s\S]*?<\/script>\r?\n?/;
  html = html.replace(viejo, '');
  if (graph.length) {
    const ld = `<script type="application/ld+json" id="ld-medios">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>${nl}`;
    html = html.replace('</head>', () => ld + '</head>');
    paginas++; nFotos += fotos.size; nVideos += videos.size;
    console.log(`  ${archivoDe(loc).padEnd(38)} fotos:${fotos.size} videos:${videos.size}`);
  }
  if (!SIMULAR && html !== original) fs.writeFileSync(file, html);   // solo si cambió (otra sesión puede estar editando)
}
// namespaces del sitemap
if (!/xmlns:image=/.test(sm)) sm = sm.replace('<urlset ', '<urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ');
if (!/xmlns:video=/.test(sm)) sm = sm.replace('<urlset ', '<urlset xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" ');
if (!SIMULAR) fs.writeFileSync(smPath, sm);
console.log(`${SIMULAR ? '(simulación) ' : ''}${DOM}: ${paginas} páginas · ${nFotos} fotos · ${nVideos} videos${FFPROBE ? '' : ' (sin ffprobe: videos sin duración)'}`);
