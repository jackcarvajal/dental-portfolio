#!/usr/bin/env node
/* audit-media.mjs — auditoría de FOTOS, VIDEOS y VISUALIZACIÓN en computador y celular (headless Edge + CDP).
   Recorre las páginas del sitemap EN LA WEB REAL (o en --base) a 1366×900 y 390×844 y reporta:
     · scroll horizontal en el celular/computador (y qué elementos se salen de la pantalla)
     · imágenes rotas, sin alt, recortadas (object-fit:cover con otra proporción), deformadas (fill) o
       demasiado pesadas para el tamaño en que se muestran
     · videos que no cargan o sin póster · 4xx/5xx de imágenes, videos y fuentes · errores JS
   Uso:   node tools/audit-media.mjs [--base https://prodigylabdental.com] [--solo ruta1,ruta2] [--json salida.json]
   Exit:  1 si hay errores graves (rotas, scroll horizontal, 4xx de medios, JS); 0 si limpio. */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'https://prodigylabdental.com').replace(/\/$/, '');
const SOLO = arg('--solo', '');
const JSON_OUT = arg('--json', '');
const CDP = 9411;
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
if (!EDGE) { console.error('✗ No encontré msedge.exe'); process.exit(2); }

const ROOT = process.cwd();
let rutas = SOLO ? SOLO.split(',').map(s => s.trim()).filter(Boolean)
  : [...readFileSync(join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(/^https?:\/\/[^/]+/, '') || '/');
rutas = [...new Set(rutas.map(r => r.replace(/&amp;/g, '&')))];

const VISTAS = [
  { nombre: 'pc', width: 1366, height: 900, mobile: false, dpr: 1 },
  { nombre: 'cel', width: 390, height: 844, mobile: true, dpr: 2 },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const prof = join(process.env.TEMP || '/tmp', 'audit-media-' + Date.now());
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', '--mute-audio',
  '--autoplay-policy=no-user-gesture-required', '--user-data-dir=' + prof, '--remote-debugging-port=' + CDP, 'about:blank'], { stdio: 'ignore' });
process.on('exit', () => { try { edge.kill(); } catch {} });
await sleep(3500);

let ws, id = 0; const pend = new Map(); let errs = [], net = [];
const t = await (await fetch(`http://localhost:${CDP}/json`)).json();
ws = new WebSocket(t.find(p => p.type === 'page').webSocketDebuggerUrl);
ws.onmessage = e => {
  const d = JSON.parse(e.data);
  if (d.method === 'Runtime.exceptionThrown') errs.push((((d.params.exceptionDetails.exception || {}).description) || d.params.exceptionDetails.text || '').split('\n')[0].slice(0, 110));
  if (d.method === 'Network.responseReceived') {
    const r = d.params.response, ty = d.params.type;
    if (r.status >= 400 && /^(Image|Media|Font)$/.test(ty)) net.push(r.status + ' ' + ty + ' ' + r.url.replace(/\?.*/, '').slice(-80));
  }
  if (d.method === 'Network.loadingFailed' && /^(Image|Media)$/.test(d.params.type) && !d.params.canceled) net.push('FALLÓ ' + d.params.type + ' ' + (d.params.errorText || ''));
  if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result); pend.delete(d.id); }
};
await new Promise(r => ws.onopen = r);
const send = (m, p = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
await send('Runtime.enable'); await send('Network.enable'); await send('Page.enable');
const host = new URL(BASE).hostname;
await send('Network.setCookie', { name: 'pg_admin', value: '1', domain: host, path: '/' });

// Revisión dentro de la página (se ejecuta después de recorrerla de arriba abajo)
const REVISAR = `(() => {
  const W = innerWidth, dpr = devicePixelRatio || 1, out = { overflow: [], rotas: [], sinAlt: [], recortadas: [], deformadas: [], pesadas: [], fuera: [], videos: [] };
  const corto = el => (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : ''));
  const visible = el => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 2 && r.height > 2; };
  const sw = document.documentElement.scrollWidth;
  if (sw > W + 1) {
    const malos = [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(); if (r.right <= W + 1 || r.width < 4) return false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const s = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(s.overflowX)) return false; if (s.position === 'fixed') return false; }
      return getComputedStyle(el).position !== 'fixed'; });
    const top = malos.filter(el => !malos.some(m => m !== el && m.contains(el))).slice(0, 5);
    out.overflow.push(sw + 'px > ' + W + 'px: ' + top.map(el => corto(el) + '(' + Math.round(el.getBoundingClientRect().right) + ')').join(', '));
  }
  for (const im of document.images) {
    const src = (im.currentSrc || im.src || '').replace(location.origin, '');
    if (!src || src.startsWith('data:')) continue;
    if (!im.hasAttribute('alt')) out.sinAlt.push(src.slice(-70));
    if (!visible(im)) continue;
    const r = im.getBoundingClientRect();
    if (im.complete && im.naturalWidth === 0) { out.rotas.push(src.slice(-80)); continue; }
    if (!im.naturalWidth) continue;
    const s = getComputedStyle(im), rn = im.naturalWidth / im.naturalHeight, rr = r.width / r.height, dif = Math.abs(rr - rn) / rn;
    if (s.objectFit === 'cover' && dif > 0.12 && r.width > 80) out.recortadas.push(src.slice(-70) + ' (' + Math.round(dif * 100) + '%)');
    if ((s.objectFit === 'fill' || s.objectFit === '') && dif > 0.06 && r.width > 40) out.deformadas.push(src.slice(-70) + ' (' + Math.round(dif * 100) + '%)');
    if (im.naturalWidth > Math.max(1300, r.width * dpr * 2.6)) out.pesadas.push(src.slice(-70) + ' ' + im.naturalWidth + 'px para ' + Math.round(r.width) + 'px');
    if (r.right > W + 2 && !getComputedStyle(im.parentElement).overflow.match(/hidden|clip/)) out.fuera.push(src.slice(-70));
  }
  for (const v of document.querySelectorAll('video')) {
    const src = (v.currentSrc || (v.querySelector('source') || {}).src || v.src || '').replace(location.origin, '');
    if (v.error) out.videos.push('ERROR ' + v.error.code + ' ' + src.slice(-60));
    else if (!v.poster && !v.autoplay) out.videos.push('sin póster ' + src.slice(-60));
  }
  return JSON.stringify(out);
})()`;

const informe = [];
let graves = 0;
for (const vista of VISTAS) {
  await send('Emulation.setDeviceMetricsOverride', { width: vista.width, height: vista.height, deviceScaleFactor: vista.dpr, mobile: vista.mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: vista.mobile });
  for (const ruta of rutas) {
    errs = []; net = [];
    const sep = ruta.includes('?') ? '&' : '?';
    await send('Page.navigate', { url: BASE + ruta + sep + 'auditmedia=' + Date.now() });
    await sleep(2600);
    await send('Runtime.evaluate', { expression: `new Promise(r=>{let y=0;const H=()=>document.documentElement.scrollHeight;const iv=setInterval(()=>{y+=Math.round(innerHeight*0.8);scrollTo(0,y);if(y>H()){clearInterval(iv);setTimeout(r,900);}},120);})`, awaitPromise: true, timeout: 45000 }).catch(() => {});
    const res = await send('Runtime.evaluate', { expression: REVISAR, returnByValue: true }).catch(() => null);
    let o = {}; try { o = JSON.parse(res.result.value); } catch { o = { error: 'no se pudo revisar' }; }
    o.js = [...new Set(errs)]; o.red = [...new Set(net)];
    const g = (o.overflow || []).length + (o.rotas || []).length + o.red.length + o.js.length + (o.videos || []).filter(v => v.startsWith('ERROR')).length + (o.fuera || []).length;
    const leves = (o.sinAlt || []).length + (o.recortadas || []).length + (o.deformadas || []).length + (o.pesadas || []).length;
    if (g) graves++;
    informe.push({ vista: vista.nombre, ruta, ...o });
    const marca = g ? '\x1b[31m✗' : (leves ? '\x1b[33m·' : '\x1b[32m✓');
    const det = [];
    for (const k of ['overflow', 'rotas', 'fuera', 'red', 'js', 'videos', 'recortadas', 'deformadas', 'pesadas', 'sinAlt']) if ((o[k] || []).length) det.push(k + ':' + o[k].length);
    console.log(`${marca} [${vista.nombre}] ${ruta}\x1b[0m ${det.join(' ')}`);
  }
}
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(informe, null, 1));
console.log('\n' + '─'.repeat(50));
console.log(`Páginas: ${rutas.length} × ${VISTAS.length} vistas · con errores graves: ${graves}`);
process.exit(graves ? 1 : 0);
