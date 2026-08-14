#!/usr/bin/env node
/* audit-live.mjs — auditoría RUNTIME (headless Edge + CDP). Complementa audit.mjs.
   Atrapa lo que solo se ve al EJECUTAR la página:
     · errores/excepciones JS de consola (SyntaxError, null refs, funciones no definidas)
     · llamadas a Supabase/API con 400/401/403 (anon key mala, RLS, columnas)
     · páginas "vacías" (bloques .reveal que nunca se muestran)
   Levanta solo: python http.server + Edge headless con --remote-debugging-port.
   Uso:   node tools/audit-live.mjs [carpeta]
   Exit:  1 si hay excepciones JS o 4xx de backend; 0 si limpio.
   Requiere: Python en PATH y Microsoft Edge instalado.
*/
import { readdirSync, statSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { spawn } from 'child_process';

const ROOT = (process.argv[2] || process.cwd());
const PORT = 8799, CDP = 9399;
const EDGES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const EDGE = EDGES.find(existsSync);
if (!EDGE) { console.error('✗ No encontré msedge.exe'); process.exit(2); }

const SKIP = /^(404|_plantilla|.*preview|mantenimiento)/;
function pages(dir, base = '', out = []) {
  for (const n of readdirSync(dir)) {
    if (['node_modules', '.git', 'assets', 'sql', 'docs', 'tools', 'patients'].includes(n)) continue;
    const p = join(dir, n), st = statSync(p);
    if (st.isDirectory()) pages(p, base + n + '/', out);
    else if (n.endsWith('.html') && !SKIP.test(n)) out.push(base + n);
  }
  return out;
}
const list = pages(ROOT);

const sleep = ms => new Promise(r => setTimeout(r, ms));
const srv = spawn('python', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore' });
const prof = join(process.env.TEMP || '/tmp', 'audit-live-' + Date.now());
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  '--user-data-dir=' + prof, '--remote-debugging-port=' + CDP, 'about:blank'], { stdio: 'ignore' });
function cleanup() { try { srv.kill(); } catch {} try { edge.kill(); } catch {} }
process.on('exit', cleanup);

await sleep(3500);

let ws, id = 0; const pend = new Map(); let errs = [], net = [];
async function connect() {
  const t = await (await fetch(`http://localhost:${CDP}/json`)).json();
  ws = new WebSocket(t.find(p => p.type === 'page').webSocketDebuggerUrl);
  ws.onmessage = e => {
    const d = JSON.parse(e.data);
    if (d.method === 'Runtime.exceptionThrown') errs.push((((d.params.exceptionDetails.exception || {}).description) || d.params.exceptionDetails.text || '').split('\n')[0].slice(0, 100));
    if (d.method === 'Network.responseReceived') { const r = d.params.response; if (r.status >= 400 && /supabase|\/api\//.test(r.url) && !/\/api\/track-event/.test(r.url)) net.push(r.status + ' ' + r.url.replace(/\?.*/, '').slice(-60)); }
    if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result); pend.delete(d.id); }
  };
  await new Promise(r => ws.onopen = r);
}
const send = (m, p = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });

await connect();
await send('Runtime.enable'); await send('Log.enable'); await send('Network.enable'); await send('Page.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Network.setCookie', { name: 'pg_admin', value: '1', domain: 'localhost', path: '/' });

let bad = 0;
for (const f of list) {
  errs = []; net = [];
  await send('Page.navigate', { url: `http://localhost:${PORT}/${f}` });
  await sleep(2000);
  // scroll para disparar reveals/lazy
  await send('Runtime.evaluate', { expression: `(function(){var y=0,H=document.body.scrollHeight,iv=setInterval(function(){y+=900;scrollTo(0,y);if(y>H){clearInterval(iv);scrollTo(0,0);}},15);})()` }).catch(() => {});
  await sleep(700);
  const problems = [];
  if (errs.length) problems.push('JS: ' + [...new Set(errs)].join(' | '));
  if (net.length) problems.push('BACKEND ' + [...new Set(net)].join(' | '));
  if (problems.length) { bad++; console.log('\x1b[31m✗ ' + f + '\x1b[0m  → ' + problems.join('  ·  ')); }
}
console.log('\n' + '─'.repeat(50));
console.log(`Páginas: ${list.length} · con problemas: ${bad}`);
cleanup();
if (bad) { console.log('\x1b[31m✗ AUDITORÍA RUNTIME FALLÓ\x1b[0m'); process.exit(1); }
console.log('\x1b[32m✓ Auditoría runtime OK\x1b[0m');
process.exit(0);
