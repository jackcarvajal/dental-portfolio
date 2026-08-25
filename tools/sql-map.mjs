#!/usr/bin/env node
/* sql-map.mjs — reconcilia CÓDIGO ↔ repo SQL para el `sql/` (que no tiene fuente única de verdad).
 * Responde: ¿qué RPC llama el código?  ¿dónde está definida?  ¿en cuántos archivos (drift)?
 *           ¿hay RPCs opacas (llamadas pero sin definición en el repo → solo en la base)?
 *           ¿hay definiciones muertas (nunca llamadas)?
 * NO toca la base. Uso: node tools/sql-map.mjs
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

// ── 1. RPCs que el CÓDIGO llama ──
const codeFiles = [];
(function walk(d) { for (const n of readdirSync(d)) { if (['node_modules', '.git', 'assets', 'patients', 'sql', 'docs'].includes(n)) continue; const p = join(d, n); const st = statSync(p); if (st.isDirectory()) walk(p); else if (/\.(html|js)$/.test(n)) codeFiles.push(p); } })(ROOT);
const called = new Set();
for (const f of codeFiles) {
  const s = readFileSync(f, 'utf8');
  let m; const r1 = /\.rpc\(\s*['"`]([a-z_][\w]*)['"`]/gi; while ((m = r1.exec(s))) called.add(m[1]);
  const r2 = /\/rest\/v1\/rpc\/([a-z_][\w]*)/gi; while ((m = r2.exec(s))) called.add(m[1]);
}

// ── 2. Definiciones en el repo SQL ──
const sqlDir = join(ROOT, 'sql');
const defFn = {};   // funcion -> [{file, mtime}]
const defTb = {};   // tabla   -> [files]
const trigFns = new Set();   // funciones-trigger (RETURNS trigger o EXECUTE FUNCTION)
let allSql = '';             // todo el SQL concatenado (para detectar llamadas internas)
let sqlFiles = 0;
try {
  for (const n of readdirSync(sqlDir)) {
    if (!n.endsWith('.sql')) continue;
    sqlFiles++;
    const p = join(sqlDir, n), s = readFileSync(p, 'utf8'), mtime = statSync(p).mtime;
    allSql += '\n' + s;
    let m;
    // exige `(` tras el nombre → función real (evita matches en prosa/comentarios)
    const fn = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?([a-z_][\w]*)\s*\(/gi;
    while ((m = fn.exec(s))) { (defFn[m[1]] ||= []).push({ file: n, mtime }); }
    const tb = /CREATE\s+(?:TABLE|MATERIALIZED\s+VIEW|VIEW)\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:OR\s+REPLACE\s+)?(?:public\.)?([a-z_][\w]*)/gi;
    while ((m = tb.exec(s))) { (defTb[m[1]] ||= new Set()).add(n); }
    // triggers que ejecutan una función
    const tg = /EXECUTE\s+(?:FUNCTION|PROCEDURE)\s+(?:public\.)?([a-z_][\w]*)/gi;
    while ((m = tg.exec(s))) trigFns.add(m[1]);
  }
} catch { console.log('No hay carpeta sql/.'); process.exit(0); }
// funciones que RETURNS trigger (aunque no tengan CREATE TRIGGER en el repo)
{ let m; const rt = /FUNCTION\s+(?:public\.)?([a-z_][\w]*)\s*\([^;]*?\)\s*RETURNS\s+trigger/gi; while ((m = rt.exec(allSql))) trigFns.add(m[1]); }

const C = { r: '\x1b[31m', y: '\x1b[33m', g: '\x1b[32m', b: '\x1b[1m', x: '\x1b[0m', d: '\x1b[2m' };
const fecha = (arr) => arr.slice().sort((a, b) => b.mtime - a.mtime);

console.log(`\n${C.b}MAPA SQL — código ↔ repo${C.x}  (${called.size} RPC llamadas · ${sqlFiles} .sql · ${Object.keys(defFn).length} funciones definidas)\n`);

// builtins de Postgres/PostgREST (no son RPC del proyecto)
const BUILTIN = new Set(['array_append', 'array_remove', 'array_cat', 'jsonb_set', 'coalesce', 'now', 'concat', 'to_json']);
// A. opacas: llamadas pero SIN definición en el repo
const opacas = [...called].filter(n => !defFn[n] && !BUILTIN.has(n)).sort();
console.log(`${C.b}① RPC OPACAS — el código las llama pero NO están en el repo (solo viven en la base):${C.x}`);
console.log(opacas.length ? opacas.map(n => `   ${C.r}✗ ${n}()${C.x}`).join('\n') : `   ${C.g}✓ ninguna${C.x}`);

// B. duplicadas: definidas en >1 archivo (drift repo↔repo)
const dup = [...called].filter(n => defFn[n] && defFn[n].length > 1).sort((a, b) => defFn[b].length - defFn[a].length);
console.log(`\n${C.b}② RPC DUPLICADAS — misma función en varios archivos (¿cuál es la desplegada?):${C.x}`);
if (!dup.length) console.log(`   ${C.g}✓ ninguna${C.x}`);
else for (const n of dup) { const fs2 = fecha(defFn[n]); console.log(`   ${C.y}⚠ ${n}()${C.x} — ${fs2.length} copias · más reciente: ${C.b}${fs2[0].file}${C.x}\n      ${C.d}${fs2.slice(1).map(x => x.file).join(', ')}${C.x}`); }

// C. sin uso por el código → CLASIFICAR (no todo lo no-llamado es muerto)
const noCode = Object.keys(defFn).filter(n => !called.has(n));
const calledInSql = (n) => {   // ¿la llama otra función del sql? (uso interno)
  const defs = (allSql.match(new RegExp(`FUNCTION\\s+(?:public\\.)?${n}\\s*\\(`, 'gi')) || []).length;
  const uses = (allSql.match(new RegExp(`\\b${n}\\s*\\(`, 'g')) || []).length;
  return uses > defs;   // aparece más veces de las que se define → alguien la llama
};
const cls = { trigger: [], interna: [], alejandro: [], backend: [], muerta: [] };
const BACKEND = /^(_|prodigy_(purgar|notif|set_sla|forzar|limpiar|restrict|alerta)|corte_|detectar_|avisar_|enrutar_|actualizar_|generar_|newsletter_unsub|role_from|es_admin|no$)/;
for (const n of noCode.sort()) {
  if (trigFns.has(n)) cls.trigger.push(n);
  else if (/^alejandro_/.test(n)) cls.alejandro.push(n);
  else if (calledInSql(n)) cls.interna.push(n);
  else if (BACKEND.test(n)) cls.backend.push(n);
  else cls.muerta.push(n);
}
console.log(`\n${C.b}③ Definiciones no llamadas por el frontend — clasificadas:${C.x}`);
const line = (lbl, arr, col) => console.log(`   ${col}${lbl}${C.x} (${arr.length}): ${C.d}${arr.join(', ') || '—'}${C.x}`);
line('trigger', cls.trigger, C.g);
line('helper interno (lo llama otra función)', cls.interna, C.g);
line('Alejandro (otro negocio)', cls.alejandro, C.g);
line('backend/cron (heurística por nombre)', cls.backend, C.y);
console.log(`   ${C.r}posible MUERTA (revisar antes de borrar)${C.x} (${cls.muerta.length}): ${cls.muerta.join(', ') || C.g + 'ninguna' + C.x}`);

console.log(`\n${C.b}Resumen:${C.x} ${opacas.length} opacas · ${dup.length} duplicadas · ${cls.muerta.length} posibles muertas (de ${noCode.length} no-llamadas). ` +
  `Prioridad: (1) exportar baseline, (2) 1 definición canónica por RPC, (3) migraciones ordenadas.\n`);
