#!/usr/bin/env node
/* audit.mjs — auditoría ESTÁTICA del sitio (Node puro, sin navegador, segundos).
   Atrapa antes del deploy:
     · anon key de Supabase desactualizada/rotada (la que dio 401 en calculadoras/soporte/waitlist)
     · IDs duplicados en una misma página (HTML inválido, rompe getElementById)
     · enlaces internos rotos (slug sin .html y sin regla en _redirects)
     · páginas sin <title>, sin <link rel=canonical> o con != 1 <h1>
   Uso:   node tools/audit.mjs [carpeta]      (por defecto: cwd)
   Exit:  1 si hay hallazgos CRÍTICOS (key drift, IDs duplicados, links rotos), 0 si limpio.
*/
import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, basename, dirname, resolve as presolve } from 'path';

const ROOT = presolve(process.argv[2] || process.cwd());
const NROOT = ROOT.replace(/\\/g, '/');
const IGNORE_DIRS = new Set(['node_modules', '.git', 'assets', 'patients', 'sql', 'docs', 'tools']);
let critical = 0;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) { if (!IGNORE_DIRS.has(name)) walk(p, out); }
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}
const htmlFiles = walk(ROOT);
const allFiles = [];
(function walkAll(dir){ for (const n of readdirSync(dir)){ const p=join(dir,n); let st; try{st=statSync(p);}catch{continue;} if(st.isDirectory()){ if(!IGNORE_DIRS.has(n)) walkAll(p);} else if(/\.(html|js)$/.test(n)) allFiles.push(p);} })(ROOT);

const rel = p => p.replace(/\\/g, '/').replace(NROOT + '/', '');
const hdr = t => console.log('\n\x1b[1m' + t + '\x1b[0m');

/* ── 1. ANON KEY DRIFT ─────────────────────────────────────── */
hdr('1) Anon key de Supabase (drift)');
const JWT = /eyJhbGci[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g;
const keyCount = {};                       // token -> nº archivos
const keyFiles = {};                        // token -> [archivos]
for (const f of allFiles) {
  const found = new Set((readFileSync(f, 'utf8').match(JWT) || []));
  for (const k of found) { keyCount[k] = (keyCount[k] || 0) + 1; (keyFiles[k] ||= []).push(f); }
}
const keys = Object.keys(keyCount);
if (!keys.length) console.log('   (sin JWTs — ok)');
else {
  const canonical = keys.sort((a, b) => keyCount[b] - keyCount[a])[0]; // el más usado = vigente
  const iat = k => { try { return JSON.parse(Buffer.from(k.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString()).iat; } catch { return '?'; } };
  console.log(`   Vigente (${keyCount[canonical]} archivos, iat ${iat(canonical)}): …${canonical.slice(-12)}`);
  const drift = keys.filter(k => k !== canonical);
  if (!drift.length) console.log('   \x1b[32m✓ todas las keys coinciden\x1b[0m');
  else for (const k of drift) {
    critical++;
    console.log(`   \x1b[31m✗ key distinta (iat ${iat(k)}) en ${keyCount[k]} archivo(s):\x1b[0m ${keyFiles[k].map(rel).join(', ')}`);
  }
}

/* ── 2. IDs DUPLICADOS por página ──────────────────────────── */
hdr('2) IDs duplicados por página');
let dupPages = 0;
for (const f of htmlFiles) {
  // quitar <script>, <style> y comentarios → contar solo id= del HTML renderizado
  const html = readFileSync(f, 'utf8')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const ids = {};
  // atributo id="…" real: precedido de espacio (excluye data-id, aria-…, [id=…])
  const re = /\sid\s*=\s*"([^"]+)"/g; let m;
  while ((m = re.exec(html))) ids[m[1]] = (ids[m[1]] || 0) + 1;
  const dups = Object.keys(ids).filter(k => ids[k] > 1);
  if (dups.length) { critical++; dupPages++; console.log(`   \x1b[31m✗ ${rel(f)}:\x1b[0m ${dups.map(d => d + '×' + ids[d]).join(', ')}`); }
}
if (!dupPages) console.log('   \x1b[32m✓ sin IDs duplicados\x1b[0m');

/* ── 3. ENLACES INTERNOS ROTOS ─────────────────────────────── */
hdr('3) Enlaces internos rotos');
// mapa de redirects (source → existe)
const redirects = new Set();
const rf = join(ROOT, '_redirects');
if (existsSync(rf)) for (const line of readFileSync(rf, 'utf8').split('\n')) {
  const s = line.trim(); if (!s || s.startsWith('#')) continue;
  const src = s.split(/\s+/)[0]; if (src) redirects.add(src.replace(/^\//, '').replace(/\.html$/, ''));
}
const ASSET = /\.(css|js|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|pdf|json|xml|txt|mp4|webm|map)$/i;
// dinámico = generado por JS (template literal / concatenación / token i18n) → no chequeable estáticamente
const isDynamic = h => /[$`{}<>+]|['"]|\s/.test(h) || (!h.includes('/') && /^[a-z][\w]*(\.[a-z][\w]*)+$/i.test(h));
function slugRoot(abs) { return abs.replace(/\\/g, '/').replace(NROOT + '/', '').replace(/\.html$/, '').replace(/\/$/, ''); }
function resolves(href, fromFile) {
  let h = href.split('#')[0].split('?')[0].trim();
  if (!h) return true;
  if (isDynamic(h)) return true;
  const abs = h.startsWith('/') ? join(ROOT, h.slice(1)) : presolve(dirname(fromFile), h);
  if (ASSET.test(h)) return existsSync(abs);                    // css/js/img → existencia directa
  if (/\.html$/i.test(h)) return existsSync(abs);               // link explícito a .html
  if (existsSync(abs + '.html') || existsSync(join(abs, 'index.html'))) return true;  // slug limpio → .html
  const s = slugRoot(abs);
  if (s === '' || s === 'index') return true;
  if (redirects.has(s)) return true;
  for (const r of redirects) if (r.endsWith('/*') && s.startsWith(r.slice(0, -2))) return true;
  return false;
}
const broken = {};   // slug -> [páginas que lo enlazan]
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  const re = /href\s*=\s*"([^"]+)"/g; let m;
  while ((m = re.exec(html))) {
    let h = m[1].trim();
    if (!h || /^(https?:|mailto:|tel:|javascript:|data:|#)/.test(h)) continue;
    if (!resolves(h, f)) (broken[h] ||= []).push(rel(f));
  }
}
const bk = Object.keys(broken);
if (!bk.length) console.log('   \x1b[32m✓ sin enlaces internos rotos\x1b[0m');
else for (const h of bk) { critical++; console.log(`   \x1b[31m✗ ${h}\x1b[0m  (en ${[...new Set(broken[h])].slice(0,4).join(', ')})`); }

/* ── 4. SEO básico (aviso, no crítico) ─────────────────────── */
hdr('4) SEO básico (aviso)');
let seoIssues = 0;
for (const f of htmlFiles) {
  if (/mantenimiento|404|_plantilla|preview/.test(basename(f))) continue;
  const html = readFileSync(f, 'utf8');
  const noindex = /name=["']robots["'][^>]*noindex/i.test(html);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  const problems = [];
  if (!/<title[\s>]/i.test(html)) problems.push('sin <title>');
  if (!noindex && !/rel=["']canonical["']/i.test(html)) problems.push('sin canonical');
  if (!noindex && h1 !== 1) problems.push('h1=' + h1);
  if (problems.length) { seoIssues++; console.log(`   \x1b[33m• ${rel(f)}:\x1b[0m ${problems.join(', ')}`); }
}
if (!seoIssues) console.log('   \x1b[32m✓ ok\x1b[0m');

/* ── RESUMEN ───────────────────────────────────────────────── */
console.log('\n' + '─'.repeat(50));
console.log(`Páginas: ${htmlFiles.length} · Hallazgos críticos: ${critical} · Avisos SEO: ${seoIssues}`);
if (critical) { console.log('\x1b[31m✗ AUDITORÍA FALLÓ — revisa lo crítico antes de desplegar\x1b[0m'); process.exit(1); }
console.log('\x1b[32m✓ Auditoría estática OK\x1b[0m');
