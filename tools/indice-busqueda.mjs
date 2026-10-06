// Índice del buscador del menú (buscar-indice.json, en la raíz: se revalida siempre): páginas públicas + artículos del blog.
// Lo usa js/buscador-web.js para mostrar resultados mientras se escribe. Se regenera solo en el cron del blog
// (artículos nuevos) y a mano al crear o quitar una página:  node tools/indice-busqueda.mjs
// Archivo gemelo en ambos repos: detecta solo el archivo de artículos y la lista de páginas públicas.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const NO = /^(404|_plantilla|.*-preview|mantenimiento|pagar|recibo-caso|revision-diseno|revision-express|patient|caso|article|w|offline|index-old|google[0-9a-f]+)\.html$/;

// PRODIGY: solo las páginas que header.js deja ver (las demás están en mantenimiento a propósito)
let publicas = null;
const header = readFileSync(join(RAIZ, 'js/header.js'), 'utf8');
const m = header.match(/var publicPages\s*=\s*\[([\s\S]*?)\];/);
if (m) publicas = new Set((m[1].match(/'([^']+)'/g) || []).map(s => s.slice(1, -1)));

const limpiar = s => String(s || '').replace(/\s+/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const paginas = [];
for (const dir of ['', 'en/']) {
  const abs = join(RAIZ, dir);
  if (!existsSync(abs)) continue;
  for (const f of readdirSync(abs)) {
    if (!f.endsWith('.html') || NO.test(f)) continue;
    const u = '/' + dir + f.replace(/\.html$/, '').replace(/^index$/, '');
    const clave = u === '/' ? '/' : u.replace(/\/$/, '');
    if (publicas && clave !== '/' && !publicas.has(clave)) continue;
    if (publicas && clave === '/' && !publicas.has('/')) continue;
    const html = readFileSync(join(abs, f), 'utf8');
    const t = limpiar((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]).replace(/\s*[|—–-]\s*(PRODIGY|Alejandro Carvajal)[^|]*$/i, '');
    const d = limpiar((html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || [])[1]);
    if (!t) continue;
    paginas.push({ t, d: d.slice(0, 180), u: clave, k: dir ? 'English' : 'Página' });
  }
}
// artículos del blog (el archivo que exista)
for (const [arch, nombre] of [['articles.js', 'ARTICLES'], ['articles-ac.js', 'ARTICLES_AC']]) {
  const p = join(RAIZ, arch);
  if (!existsSync(p)) continue;
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(readFileSync(p, 'utf8') + `;globalThis.__A=${nombre};`, ctx);
  for (const a of ctx.__A || []) if (!a.proximas) paginas.push({ t: limpiar(a.titulo), d: limpiar(a.subtitulo).slice(0, 180), u: '/article?id=' + a.id, k: 'Artículo' });
}
writeFileSync(join(RAIZ, 'buscar-indice.json'), JSON.stringify(paginas));
console.log(`buscar-indice.json: ${paginas.length} entradas (${paginas.filter(x => x.k === 'Artículo').length} artículos)`);
