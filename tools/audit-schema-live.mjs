#!/usr/bin/env node
/* audit-schema-live.mjs — CONTRATO front↔BD contra la base de datos REAL (no un snapshot).
 *
 * Extrae toda la superficie que el código toca (tablas·columnas·RPCs) igual que
 * audit-schema.mjs, y PRUEBA cada una contra Supabase por REST:
 *   · columna inexistente → 42703  · tabla/relación inexistente → 42P01
 *   · RPC rota → 42703/42P13/22P02 · RPC ausente → PGRST202/42883
 * Se autovalida contra el esquema vigente → no se desactualiza como un CSV.
 *
 * Uso:   node tools/audit-schema-live.mjs [carpeta]
 * Sale 1 si encuentra fantasmas/roturas reales (fuera del allowlist); 0 si limpio
 * o si no hay red (no bloquea pushes offline).
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = process.argv.find((a, i) => i >= 2 && !a.startsWith('--')) || process.cwd();

// ── Falsos positivos conocidos (columnas que el extractor sobre-captura) ──
//   jsonb anidado, columnas de un embed pedidos(...), o bleed del regex.
const ALLOW = new Set([
  'cotizaciones.cantidad', 'cotizaciones.material', 'cotizaciones.urgente', // van en jsonb items[]
  'catalogo.precio_base',                                                    // bleed
  'inventario_items.costo_unitario', 'inventario_items.proveedor',           // otra tabla / bleed
  // columnas de pedidos que llegan por embed despachos->pedidos(...) — se atribuyen mal a "despachos"
  'despachos.codigo', 'despachos.nombre_cliente', 'despachos.nombre_doctor', 'despachos.telefono',
  'despachos.direccion', 'despachos.precio_total', 'despachos.saldo_pendiente_monto',
  'despachos.nota_calidad', 'despachos.modalidad_cobro', 'despachos.pago_estado',
  // ruido lowercase del extractor (variables/valores captados como columnas)
  'analytics_events.props', 'analytics_events.event', 'cotizaciones.servicio', 'pedidos.servicio',
  'leads_doctores.html', 'leads_doctores.soporte', 'logs_incidencias.bajo', 'logs_incidencias.pago',
  'notificaciones_internas.arr',
]);

// ── 1. extraer superficie (mismo motor que audit-schema.mjs) ──
const files = [];
(function walk(d) { for (const n of readdirSync(d)) { if (['node_modules', '.git', 'assets', 'patients', 'docs'].includes(n)) continue; const p = join(d, n); const st = statSync(p); if (st.isDirectory()) walk(p); else if (/\.(html|js)$/.test(n)) files.push(p); } })(ROOT);

const tables = {}; const rpcs = new Set(); const enumVals = {};   // tabla -> Set(valores usados para filtrar `estado`)
// solo tokens tipo columna real: snake_case en minúscula (rechaza VALORES de enum como RECHAZADO / Calculadora)
const add = (t, c) => { (tables[t] ||= new Set()); if (c) c.split(',').forEach(x => { x = x.trim().replace(/^["'`]|["'`]$/g, '').split(':').pop().trim(); if (x && x !== '*' && /^[a-z_][a-z0-9_]{2,}$/.test(x)) tables[t].add(x); }); };
const addEnum = (t, v) => { v = (v || '').trim().replace(/^["'`(]+|["'`)]+$/g, '').trim(); if (v && /^[A-Za-zÀ-ÿ][\w \-]*$/.test(v)) (enumVals[t] ||= new Set()).add(v); };
let src = '';
for (const f of files) src += '\n' + readFileSync(f, 'utf8');
{
  let m; const s = src;
  let re = /\.from\(\s*['"`]([a-z_][\w]*)['"`]\s*\)([\s\S]{0,600})/gi;
  while ((m = re.exec(s))) { const t = m[1]; let chain = m[2]; const nxt = chain.search(/\.from\(/); if (nxt > -1) chain = chain.slice(0, nxt); let c; const selRe = /\.select\(\s*['"`]([^'"`]*)['"`]/g; while ((c = selRe.exec(chain))) add(t, c[1]); const opRe = /\.(?:eq|neq|gt|gte|lt|lte|like|ilike|is|in|order|contains|match)\(\s*['"`]([a-z_][\w]*)['"`]/g; while ((c = opRe.exec(chain))) add(t, c[1]); const insRe = /\.(?:insert|update|upsert)\(\s*\{([^}]*)\}/g; while ((c = insRe.exec(chain))) { for (const k of c[1].match(/([a-z_][\w]*)\s*:/gi) || []) add(t, k.replace(':', '')); }
    // valores de filtro sobre `estado` (enum frágil) → validar 22P02
    let ev; const evEq = /\.(?:eq|neq)\(\s*['"`]estado['"`]\s*,\s*['"`]([^'"`]+)['"`]/g; while ((ev = evEq.exec(chain))) addEnum(t, ev[1]);
    const evList = /\.(?:in|not)\(\s*['"`]estado['"`]\s*,(?:\s*['"`](?:in|eq)['"`]\s*,)?\s*['"`]\(?([^'"`]+?)\)?['"`]/g; while ((ev = evList.exec(chain))) ev[1].split(',').forEach(v => addEnum(t, v)); }
  const rest = /\/rest\/v1\/([a-z_][\w]*)\?([^'"`\s]*)/gi;
  while ((m = rest.exec(s))) { const t = m[1], q = m[2]; let c; const qcol = /([a-z_][\w]*)=(?:eq|neq|gt|gte|lt|lte|like|ilike|is|in|not)\./g; while ((c = qcol.exec(q))) add(t, c[1]); const sel = /select=([^&]+)/.exec(q); if (sel) add(t, decodeURIComponent(sel[1]).replace(/[()]/g, '')); let ev; const eq = /(?:^|&)estado=(?:eq|neq|in|not\.in)\.\(?([^&)]+)\)?/g; while ((ev = eq.exec(q))) ev[1].split(',').forEach(v => addEnum(t, decodeURIComponent(v))); }
  const rr = /\.rpc\(\s*['"`]([a-z_][\w]*)['"`]/gi; while ((m = rr.exec(s))) rpcs.add(m[1]);
  const rpcRest = /\/rest\/v1\/rpc\/([a-z_][\w]*)/gi; while ((m = rpcRest.exec(s))) rpcs.add(m[1]);
}

// ── 2. credenciales: URL del proyecto + anon key, leídas del propio código ──
const URL = (src.match(/https:\/\/([a-z0-9]{16,})\.supabase\.co/) || [])[0];
const ANON = (src.match(/eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g) || []).sort((a, b) => b.length - a.length)[0];
if (!URL || !ANON) { console.log('\x1b[33m⚠ audit-schema-live: no encontré URL/anon key en el código — omito.\x1b[0m'); process.exit(0); }
const H = { apikey: ANON, Authorization: `Bearer ${ANON}` };

const GHOST = /42703|42P01/;                       // columna / relación inexistente
const RPC_BROKEN = /42703|42P01|42P13|22P02|42883/; // RPC rota
const probe = async (path) => {
  try { const r = await fetch(URL + path, { headers: H }); const code = (await r.json().catch(() => ({})))?.code || ''; return { status: r.status, code }; }
  catch (e) { return { net: e.message }; }
};
const probePost = async (name) => {
  try { const r = await fetch(`${URL}/rest/v1/rpc/${name}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: '{}' }); const code = (await r.json().catch(() => ({})))?.code || ''; return { status: r.status, code }; }
  catch (e) { return { net: e.message }; }
};

// ── 3. probar ──
console.log('\n\x1b[1mAUDIT SCHEMA LIVE — contrato código ↔ BD real\x1b[0m\n');
let ghosts = 0, broken = 0, offline = false;

for (const t of Object.keys(tables).sort()) {
  const cols = [...tables[t]]; if (!cols.length) continue;
  const batch = await probe(`/rest/v1/${t}?select=${cols.join(',')}&limit=0`);
  if (batch.net) { offline = true; break; }
  if (batch.status === 200 || !GHOST.test(batch.code)) continue;   // tabla ok (o error no-relacionado a columnas)
  // algo falta: aislar columna a columna
  const bad = [];
  for (const c of cols) {
    if (ALLOW.has(`${t}.${c}`)) continue;
    const one = await probe(`/rest/v1/${t}?select=${c}&limit=0`);
    if (one.net) { offline = true; break; }
    if (GHOST.test(one.code)) bad.push(c);
  }
  if (offline) break;
  if (bad.length) { ghosts += bad.length; console.log(`  \x1b[31m✗ ${t}\x1b[0m → columnas inexistentes: ${bad.join(', ')}`); }
}

if (!offline) for (const name of [...rpcs].sort()) {
  const r = await probePost(name);
  if (r.net) { offline = true; break; }
  if (RPC_BROKEN.test(r.code)) { broken++; console.log(`  \x1b[31m✗ rpc ${name}()\x1b[0m → ${r.code} (rota o ausente)`); }
}

// ── 3b. valores de filtro de `estado` que NO existen en el enum (22P02) ──
let badEnum = 0;
if (!offline) for (const t of Object.keys(enumVals).sort()) {
  for (const v of enumVals[t]) {
    const r = await probe(`/rest/v1/${t}?select=id&estado=eq.${encodeURIComponent(v)}&limit=0`);
    if (r.net) { offline = true; break; }
    if (/22P02/.test(r.code)) { badEnum++; console.log(`  \x1b[31m✗ ${t}.estado\x1b[0m → valor de enum inexistente: '${v}' (filtrar por él da 22P02/400)`); }
  }
  if (offline) break;
}

if (offline) { console.log('\x1b[33m⚠ Sin red / Supabase inalcanzable — omito la validación (no bloqueo el push).\x1b[0m'); process.exit(0); }

if (!ghosts && !broken && !badEnum) { console.log('  \x1b[32m✓ Todo lo que el código pide existe en la BD (columnas, RPCs y valores de enum `estado`).\x1b[0m\n'); process.exit(0); }
console.log(`\n\x1b[31m${ghosts} columnas fantasma · ${broken} RPCs rotas/ausentes · ${badEnum} valores de enum inexistentes.\x1b[0m Corrige, o si es falso positivo (jsonb/embed) añádelo al ALLOW.\n`);
process.exit(1);
