#!/usr/bin/env node
/* audit-live-sesion.mjs — auditoría RUNTIME de la parte interna (/app) CON SESIÓN, contra producción.
   audit-live.mjs no puede entrar a /app (sin sesión todo redirige al login). Este inicia sesión con una
   cuenta (por variables de entorno, nunca en el repo), pone la sesión en el navegador headless y recorre
   las páginas registrando:
     · excepciones JS y console.error
     · llamadas a Supabase / /api con 4xx-5xx (RLS, columnas, funciones)
     · a qué página terminó llevando cada una (redirecciones por rol)
   Uso (PowerShell):  $env:AUD_EMAIL='cuenta@...'; $env:AUD_PASS='...'; node tools/audit-live-sesion.mjs [pagina1,pagina2]
   Uso (bash):        AUD_EMAIL=... AUD_PASS=... node tools/audit-live-sesion.mjs
   Exit 1 si hay excepciones o errores de backend.
*/
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

const SITIO = process.env.AUD_SITIO || 'https://prodigylabdental.com';
const PROY = 'zgihrwqfyvgyapbwzkvw';
const SB = `https://${PROY}.supabase.co`;
const { AUD_EMAIL: EMAIL, AUD_PASS: PASS } = process.env;
if (!EMAIL || !PASS) { console.error('Falta AUD_EMAIL / AUD_PASS'); process.exit(2); }

// anon key: la misma que usa la web (pública)
const guard = (await import('fs')).readFileSync(join(process.cwd(), 'js/auth-guard.js'), 'utf8');
const ANON = (guard.match(/eyJ[\w-]+\.[\w-]+\.[\w-]+/) || [])[0];

const paginas = (process.argv[2] ? process.argv[2].split(',') : readdirSync('app').filter(n => n.endsWith('.html')).map(n => n.slice(0, -5)))
  .filter(n => !['login', 'reset-password', 'success'].includes(n));

// 1) sesión
const r = await fetch(`${SB}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: EMAIL, password: PASS }) });
const ses = await r.json();
if (!ses.access_token) { console.error('No se pudo iniciar sesión:', ses.msg || ses.error_description || ses.error); process.exit(2); }
const am = ses.user.app_metadata || {};
console.log(`Sesión: ${EMAIL} · roles=${JSON.stringify(am.roles || am.role || 'cliente')}\n`);

// 2) navegador
const CH = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const CDP = 9411;
const prof = join(process.env.TEMP || '/tmp', 'aud-ses-' + Date.now());
const nav = spawn(CH, ['--headless=new', '--disable-gpu', '--no-first-run', '--user-data-dir=' + prof, '--remote-debugging-port=' + CDP, 'about:blank'], { stdio: 'ignore' });
process.on('exit', () => { try { nav.kill(); } catch {} });
const dormir = ms => new Promise(res => setTimeout(res, ms));
await dormir(3000);
const t = (await (await fetch(`http://localhost:${CDP}/json`)).json()).find(p => p.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise(res => ws.onopen = res);
let id = 0; const pend = new Map(); let errs = [], red = [];
ws.onmessage = e => {
  const d = JSON.parse(e.data);
  if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result); pend.delete(d.id); return; }
  if (d.method === 'Runtime.exceptionThrown') errs.push('excepción: ' + ((d.params.exceptionDetails.exception || {}).description || d.params.exceptionDetails.text || '').split('\n')[0]);
  if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errs.push('console.error: ' + d.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 160));
  if (d.method === 'Network.responseReceived') {
    const x = d.params.response;
    if (x.status >= 400 && (x.url.includes('supabase.co') || x.url.includes('/api/')) && !x.url.includes('/api/track-event'))
      red.push(`${x.status} ${x.url.replace(SB, 'supabase').split('?')[0].slice(0, 110)}`);
  }
};
const cmd = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await cmd('Runtime.enable'); await cmd('Network.enable'); await cmd('Page.enable');

// 3) sesión en el navegador (mismo formato que supabase-js)
await cmd('Page.navigate', { url: SITIO + '/robots.txt' }); await dormir(1500);
const guardar = { ...ses, expires_at: Math.floor(Date.now() / 1000) + (ses.expires_in || 3600) };
await cmd('Runtime.evaluate', { expression: `localStorage.setItem('sb-${PROY}-auth-token', ${JSON.stringify(JSON.stringify(guardar))}); document.cookie='pg_admin=1;path=/'; 'ok'` });

// 4) recorrido
let malos = 0;
for (const n of paginas) {
  errs = []; red = [];
  await cmd('Page.navigate', { url: n.startsWith('/') ? SITIO + n : `${SITIO}/app/${n}.html` });   // «/flujo-diseno» = página pública
  await dormir(6500);
  const fin = ((await cmd('Runtime.evaluate', { expression: 'location.pathname', returnByValue: true })).result || {}).value || '?';
  const destino = fin.replace(/^\/app\//, '').replace(/\.html$/, '');
  const redir = destino !== n.replace(/\.html$/, '') && fin !== n ? `  → llevó a ${destino}` : '';
  const uniq = a => [...new Set(a)];
  if (errs.length || red.length) {
    malos++;
    console.log(`✗ ${n}${redir}`);
    uniq(errs).slice(0, 6).forEach(x => console.log('    ' + x));
    uniq(red).slice(0, 6).forEach(x => console.log('    red ' + x));
  } else console.log(`✓ ${n}${redir}`);
}
console.log(`\n${paginas.length} páginas · ${malos} con errores`);
ws.close(); nav.kill();
process.exit(malos ? 1 : 0);
