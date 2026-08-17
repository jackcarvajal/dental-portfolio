#!/usr/bin/env node
/* audit-schema.mjs — "contrato" frontend ↔ base de datos.
   Extrae TODA la superficie de BD que el código toca:
     · tablas (.from('x'), /rest/v1/x)
     · columnas por tabla (select, eq/gt/lt/filtros, order, insert/update, ?col=eq.)
     · RPCs + sus parámetros (.rpc('f',{p}))
   Sirve para: (1) ver de qué depende el front, (2) cruzarlo contra el esquema real
   y encontrar TODAS las columnas/tablas inexistentes de una (no una por una).

   Uso:      node tools/audit-schema.mjs [carpeta] [--json]
   Validar:  node tools/audit-schema.mjs --schema pedidos.txt   (pega el information_schema)
             → marca cada columna que el código usa y NO existe en la tabla.
*/
import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);
const ROOT = (args.find(a => !a.startsWith('--')) || process.cwd());
const schemaArg = (() => { const i = args.indexOf('--schema'); return i > -1 ? args[i + 1] : null; })();

const files = [];
(function walk(d) { for (const n of readdirSync(d)) { if (['node_modules', '.git', 'assets', 'patients', 'docs'].includes(n)) continue; const p = join(d, n); const st = statSync(p); if (st.isDirectory()) walk(p); else if (/\.(html|js)$/.test(n)) files.push(p); } })(ROOT);

const tables = {};   // tabla -> Set(columnas)
const rpcs = {};     // rpc  -> Set(params)
const add = (t, c) => { (tables[t] ||= new Set()); if (c) c.split(',').forEach(x => { x = x.trim().replace(/^["'`]|["'`]$/g, ''); if (x && x !== '*' && /^[a-z_][\w]*$/i.test(x)) tables[t].add(x); }); };

for (const f of files) {
  const s = readFileSync(f, 'utf8');
  // .from('tabla') … encadenado. Cortamos en el siguiente .from( para no mezclar columnas.
  let m, re = /\.from\(\s*['"`]([a-z_][\w]*)['"`]\s*\)([\s\S]{0,600})/gi;
  while ((m = re.exec(s))) {
    const t = m[1];
    let chain = m[2];
    const nxt = chain.search(/\.from\(/); if (nxt > -1) chain = chain.slice(0, nxt);   // no pasar de la siguiente query
    let c;
    const selRe = /\.select\(\s*['"`]([^'"`]*)['"`]/g; while ((c = selRe.exec(chain))) add(t, c[1]);
    const opRe = /\.(?:eq|neq|gt|gte|lt|lte|like|ilike|is|in|order|contains|match)\(\s*['"`]([a-z_][\w]*)['"`]/g; while ((c = opRe.exec(chain))) add(t, c[1]);
    const insRe = /\.(?:insert|update|upsert)\(\s*\{([^}]*)\}/g; while ((c = insRe.exec(chain))) { for (const k of c[1].match(/([a-z_][\w]*)\s*:/gi) || []) add(t, k.replace(':', '')); }
    if (!chain.trim()) add(t, null);
  }
  // REST directo: /rest/v1/tabla?col=eq. & select=
  const rest = /\/rest\/v1\/([a-z_][\w]*)\?([^'"`\s]*)/gi;
  while ((m = rest.exec(s))) {
    const t = m[1], q = m[2];
    let c; const qcol = /([a-z_][\w]*)=(?:eq|neq|gt|gte|lt|lte|like|ilike|is|in|not)\./g; while ((c = qcol.exec(q))) add(t, c[1]);
    const sel = /select=([^&]+)/.exec(q); if (sel) add(t, decodeURIComponent(sel[1]));
  }
  // .rpc('nombre', { params })
  const rr = /\.rpc\(\s*['"`]([a-z_][\w]*)['"`]\s*(?:,\s*\{([^}]*)\})?/gi;
  while ((m = rr.exec(s))) { const n = m[1]; (rpcs[n] ||= new Set()); for (const k of (m[2] || '').match(/([a-z_][\w]*)\s*:/gi) || []) rpcs[n].add(k.replace(':', '')); }
  const rpcRest = /\/rest\/v1\/rpc\/([a-z_][\w]*)/gi;
  while ((m = rpcRest.exec(s))) { (rpcs[m[1]] ||= new Set()); }
}

// ── Modo validación: cruzar contra columnas reales de UNA tabla ──
if (schemaArg && existsSync(schemaArg)) {
  const real = new Set(readFileSync(schemaArg, 'utf8').split(/[\s,\n]+/).map(x => x.trim().replace(/["',;]/g, '')).filter(Boolean));
  const tName = schemaArg.replace(/.*[\\/]/, '').replace(/\.\w+$/, '');
  const used = tables[tName];
  console.log(`\nValidación de columnas usadas en el código para "${tName}" vs esquema real:`);
  if (!used) { console.log('  (el código no referencia esa tabla)'); process.exit(0); }
  const missing = [...used].filter(c => !real.has(c));
  if (!missing.length) console.log('  \x1b[32m✓ todas las columnas usadas existen\x1b[0m');
  else { console.log('  \x1b[31m✗ columnas usadas que NO existen en la tabla:\x1b[0m ' + missing.join(', ')); process.exit(1); }
  process.exit(0);
}

// ── Modo reporte: superficie de BD ──
const T = Object.keys(tables).sort();
console.log(`\n\x1b[1mSUPERFICIE DE BD — ${ROOT.replace(/.*[\\/]/, '')}\x1b[0m  (${T.length} tablas, ${Object.keys(rpcs).length} RPCs)\n`);
console.log('\x1b[1mTABLAS y columnas referenciadas por el código:\x1b[0m');
for (const t of T) console.log(`  • ${t}  (${tables[t].size}): ${[...tables[t]].sort().join(', ') || '—'}`);
console.log('\n\x1b[1mRPCs y parámetros:\x1b[0m');
for (const r of Object.keys(rpcs).sort()) console.log(`  • ${r}(${[...rpcs[r]].join(', ')})`);
console.log('\n💡 Para validar: exporta las columnas reales de una tabla y córrelo con --schema.');
console.log('   En Supabase:  SELECT string_agg(column_name, \',\') FROM information_schema.columns WHERE table_name=\'pedidos\';');
console.log('   Guárdalo en pedidos.txt →  node tools/audit-schema.mjs --schema pedidos.txt');
if (args.includes('--json')) console.log('\n' + JSON.stringify({ tables: Object.fromEntries(T.map(t => [t, [...tables[t]]])), rpcs: Object.fromEntries(Object.entries(rpcs).map(([k, v]) => [k, [...v]])) }, null, 1));
