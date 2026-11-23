// Genera las imágenes para compartir (og:image, 1200×630) con fotos reales del laboratorio y de casos.
//
//   node tools/og-generar.mjs            → crea/actualiza assets/og-<slug>.jpg
//   node tools/og-generar.mjs --aplicar  → además apunta og:image y twitter:image de cada página a su imagen
//   node tools/og-generar.mjs --solo laboratorio,fresado   → solo esas
//
// Reglas (22-nov-2026): español sin precios ni promesas de tiempo (los precios cambian y la imagen queda vieja
// en las cachés de WhatsApp/Facebook; el fresado además tiene precios suspendidos). Foto real, un solo acento
// (magenta), sin brillos ni etiquetas decorativas. Gemela de tools/og-generar.mjs de Alejandro CAD/CAM (dorado).
// Requiere Chrome o Edge instalados (variable CHROME para otra ruta).

import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Fotos: «local:» = archivo del repo (assets/…); lo demás = portafolio en Supabase (casos reales).
const SUPA = 'https://zgihrwqfyvgyapbwzkvw.supabase.co/storage/v1/object/public/portafolio/';
const foto = f => f.startsWith('local:') ? pathToFileURL(join(ROOT, 'assets', f.slice(6))).href : SUPA + f;
const GUIA = 'caso-1784766305902/gallery/foto-10.jpeg';              // implantes planificados (exocad)
const PLACA = 'caso-1784826632765/gallery/foto-2.png';               // modelos de alineadores en la placa de impresión
const PLACA2 = 'caso-1784827436676/gallery/foto-2.png';

const LAB = { pie: 'Trabajo real del laboratorio' }, CAD = { pie: 'Diseño real en exocad' }, CASO = { pie: 'Caso real' };
const IMPRIMIR = { pie: 'Caso real · modelos listos para imprimir' };
const IMAGENES = [
  { slug: 'laboratorio', ...LAB, foto: 'local:og-fuentes/hibrida-frente.jpg', t: 'Laboratorio dental digital en Bogotá', s: 'Diseño CAD, fresado, impresión 3D y laboratorio completo para clínicas y laboratorios.', paginas: ['index', 'links'] },
  { slug: 'fresado', ...LAB, foto: 'local:og-fuentes/barra-hibrida.jpg', t: 'Fresado CAD/CAM en Bogotá', s: 'Zirconio, PMMA, disilicato, titanio y CrCo, con envío a toda Colombia.', paginas: ['fresado-cam', 'flujo-fresado'] },
  { slug: 'cotizador', ...CAD, foto: 'local:catalogo/cad-3.jpg', t: 'Calculadora de diseño y fresado', s: 'Arma el pedido y conoce el valor antes de enviarlo.', paginas: ['calculadora'] },
  { slug: 'cotiza-fresado', ...LAB, foto: 'local:links-gallery/lentes-ceramicos.jpg', t: 'Cotiza tu fresado', s: 'Coronas de zirconio o disilicato, puentes y provisionales en PMMA.', paginas: ['calculadora-fresado'] },
  { slug: 'impresion', ...IMPRIMIR, foto: PLACA, t: 'Impresión 3D dental', s: 'Modelos, guías quirúrgicas, provisionales y férulas en resina.', paginas: ['calculadora-impresion', 'flujo-impresion', 'impresion-3d'] },
  { slug: 'diseno', ...CAD, foto: 'local:catalogo/cad-1.jpg', t: 'Diseño CAD dental en exocad y 3Shape', s: 'Coronas, carillas, Full Arch y guías, diseñadas por el equipo del laboratorio.', paginas: ['diseno-cad'] },
  { slug: 'diseno-a-distancia', ...CAD, foto: 'local:catalogo/cad-2.jpg', t: 'Diseño dental remoto', s: 'Envías el escaneo, apruebas el diseño y recibes el STL.', paginas: ['diseno-remoto'] },
  { slug: 'casos', ...CASO, foto: 'local:catalogo/caso2-despues.jpg', t: 'Casos reales del laboratorio', s: 'Coronas, carillas, implantes y Full Arch, del diseño a la boca.', paginas: ['portafolio', 'caso', 'mapa-sitio', 'terminos-y-legal'] },
  { slug: 'materiales', ...LAB, foto: 'local:og-fuentes/hibrida-lado.jpg', t: 'Materiales del laboratorio', s: 'Zirconia multicapa, disilicato, PMMA, CrCo y resinas 3D, con sus indicaciones.', paginas: ['catalogo'] },
  { slug: 'lab-full', ...CASO, foto: 'local:catalogo/caso1-despues.jpg', t: 'Laboratorio completo', s: 'Envía el caso digital o análogo y recíbelo terminado.', paginas: ['flujo-lab'] },
  { slug: 'software-labs', ...CAD, foto: 'local:catalogo/cad-4.jpg', t: 'Software para laboratorios dentales', s: 'Pedidos, diseño, pagos y mensajería en un solo sistema. Lista de espera abierta.', paginas: ['para-laboratorios'] },
  { slug: 'ayuda', ...CAD, foto: 'local:catalogo/cad-3.jpg', t: 'Soporte y ayuda', s: 'Guías de envío STL, fichas de materiales y seguimiento de tu pedido.', paginas: ['soporte', 'preguntas'] },
  { slug: 'soporte-exocad', ...CAD, foto: 'local:catalogo/cad-2.jpg', t: 'Soporte técnico de exocad', s: 'Errores, licencia, instalación y librerías de implantes. Remoto y en español.', paginas: ['soporte-exocad'] },
  { slug: 'escaner-clinica', ...CASO, foto: 'local:catalogo/caso2-despues.jpg', t: 'Escáner intraoral a domicilio en Bogotá', s: 'Vamos a tu clínica, escaneamos y el caso entra directo al laboratorio.', paginas: ['envia-tu-scanner'] },
  { slug: 'alineadores-envio', ...IMPRIMIR, foto: PLACA2, t: 'Envía tus casos de alineadores', s: 'Planificación digital y setup, con facturación mensual para clínicas con convenio.', paginas: ['envia-alineadores'] },
  { slug: 'guias', ...CAD, foto: GUIA, t: 'Guías quirúrgicas digitales', s: 'Planificación con CoDiagnostiX, Exoplan o RealGuide, que apruebas antes de imprimir.', paginas: ['guias-quirurgicas'] },
  { slug: 'en-lab', pie: 'Real lab work', foto: 'local:og-fuentes/hibrida-frente.jpg', t: 'Digital dental lab for clinics worldwide', s: 'Send your STL, approve the design, we mill and ship.', paginas: ['en/index'] },
  { slug: 'en-design', pie: 'Real design in exocad', foto: 'local:catalogo/cad-1.jpg', t: 'Dental CAD outsourcing in exocad and 3Shape', s: 'Crowns, veneers, full arch and guides, designed by the lab team.', paginas: ['en/global-design'] },
  { slug: 'en-aligners', pie: 'Real case · print-ready models', foto: PLACA2, t: 'Clear aligner CAD design', s: 'Staging, attachments and IPR planning from your STL scans.', paginas: ['en/dental-aligners'] },
  { slug: 'en-guides', pie: 'Real design in exocad', foto: GUIA, t: 'Surgical guide design from CBCT', s: 'Fully guided implant planning, checked by a technician in exocad.', paginas: ['en/surgical-guides'] },
  { slug: 'en-zirconia', pie: 'Real design in exocad', foto: 'local:catalogo/cad-3.jpg', t: 'Zirconia crown and bridge design', s: 'Anatomic contours and precise margins, in exocad and 3Shape.', paginas: ['en/zirconia-crowns'] },
  // Resto de páginas (22-nov-2026)
  { slug: 'cotiza-diseno', ...CAD, foto: 'local:catalogo/cad-4.jpg', t: 'Cotiza tu diseño CAD', s: 'Corona, carilla, puente o Full Arch: conoce el valor antes de enviarlo.', paginas: ['calculadora-diseno'] },
  { slug: 'alineadores-cad', ...IMPRIMIR, foto: PLACA, t: 'Diseño CAD de alineadores', s: 'Planificación en exocad Ortho, con modelos listos para imprimir.', paginas: ['alineadores-cad'] },
  { slug: 'calidad', ...CASO, foto: 'local:catalogo/caso1-despues.jpg', t: 'Calidad y estándares', s: 'Cómo revisamos cada restauración antes de que salga del laboratorio.', paginas: ['calidad'] },
  { slug: 'carillas-lab', ...LAB, foto: 'local:links-gallery/lentes-ceramicos.jpg', t: 'Carillas para tu clínica', s: 'Disilicato, feldespáticas o zirconia, con diseño de sonrisa previo.', paginas: ['carillas'] },
  { slug: 'coronas-implantes', ...CAD, foto: 'caso-1784766305902/gallery/foto-2.jpeg', t: 'Coronas sobre implantes', s: 'Atornilladas o cementadas, en zirconia o disilicato, sobre la base de titanio.', paginas: ['coronas-sobre-implantes'] },
  { slug: 'coronas-zirconia', ...CAD, foto: 'caso-1784774363552/gallery/foto-15.jpeg', t: 'Coronas de zirconio', s: 'Diseño y fresado, con márgenes, oclusión y color que calzan.', paginas: ['coronas-zirconio'] },
  { slug: 'ferulas', ...CAD, foto: 'caso-1784774716081/gallery/foto-6.jpeg', t: 'Férulas oclusales', s: 'Michigan, NTI y para bruxismo, en PMMA fresado o resina 3D.', paginas: ['ferulas-oclusales'] },
  { slug: 'escaneo-domicilio', ...CASO, foto: 'local:catalogo/caso2-despues.jpg', t: 'Escaneo intraoral a domicilio', s: 'Vamos a tu consultorio en Bogotá y el archivo queda listo para el laboratorio.', paginas: ['escaner-domicilio'] },
  { slug: 'fotogrametria', ...LAB, foto: 'local:og-fuentes/barra-hibrida.jpg', t: 'Fotogrametría para Full Arch', s: 'Para multi-unit y All-on-X. Próximamente; hoy, escaneo intraoral a domicilio.', paginas: ['escaneo-fotogrametria'] },
  { slug: 'guia-envio', ...CAD, foto: 'local:catalogo/cad-2.jpg', t: 'Guía técnica de envío', s: 'Cómo exportar el STL desde exocad, 3Shape y tu escáner intraoral.', paginas: ['guia-tecnica'] },
  { slug: 'app', ...CAD, foto: 'local:catalogo/cad-3.jpg', t: 'Instala la app de PRODIGY', s: 'Pedidos, cotizador y seguimiento de tus casos desde el celular.', paginas: ['instalar-app'] },
  { slug: 'journal-lab', ...CAD, foto: 'local:catalogo/cad-1.jpg', t: 'PRODIGY Journal', s: 'Odontología digital al día, con referencias científicas verificadas.', paginas: ['journal', 'article'] },
  { slug: 'nosotros-lab', ...LAB, foto: 'local:og-fuentes/hibrida-lado.jpg', t: 'Sobre el laboratorio', s: 'Diseño, fresado e impresión 3D bajo un mismo techo, en Bogotá.', paginas: ['nosotros'] },
  { slug: 'referidos-lab', ...LAB, foto: 'local:og-fuentes/hibrida-frente.jpg', t: 'Programa de referidos', s: 'Refiere a un colega y recibe crédito para tus próximos pedidos.', paginas: ['referidos'] },
  { slug: 'full-arch-lab', ...LAB, foto: 'local:og-fuentes/barra-hibrida.jpg', t: 'Rehabilitación Full Arch sobre implantes', s: 'All-on-4 y All-on-6: barra de titanio, zirconia monolítica y provisional inmediato.', paginas: ['rehabilitacion-sobre-implantes'] },
  { slug: 'seguimiento', ...CAD, foto: 'local:catalogo/cad-4.jpg', t: 'Seguimiento de tu caso', s: 'Consulta en qué etapa está tu diseño, fresado o impresión.', paginas: ['seguimiento-caso'] },
  { slug: 'en-implant-crowns', pie: 'Real design in exocad', foto: 'caso-1784766305902/gallery/foto-2.jpeg', t: 'Implant crowns and custom abutments', s: 'Screw-retained or cemented, in zirconia or lithium disilicate.', paginas: ['en/implant-crowns'] },
  { slug: 'en-full-arch', pie: 'Real lab work', foto: 'local:og-fuentes/barra-hibrida.jpg', t: 'All-on-4 and All-on-6 full-arch bridges', s: 'Titanium hybrid bars, monolithic zirconia and immediate-load provisionals.', paginas: ['en/full-arch'] },
  { slug: 'en-veneers', pie: 'Real lab work', foto: 'local:links-gallery/lentes-ceramicos.jpg', t: 'Veneers for your clinic', s: 'Lithium disilicate, feldspathic or translucent zirconia, designed and milled.', paginas: ['en/veneers'] },
  { slug: 'en-faq', pie: 'Real design in exocad', foto: 'local:catalogo/cad-2.jpg', t: 'Dental CAD lab FAQ', s: 'Files, turnaround, revisions, USD payment and shipping.', paginas: ['en/faq'] },
  { slug: 'servicios', ...LAB, foto: 'local:catalogo/carillas-lentes.jpg', t: 'Servicios del laboratorio', s: 'Diseño CAD, fresado, impresión 3D y laboratorio completo, en Bogotá.', paginas: ['servicios'] },
];

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  .replace(/(\S+-\S+)/g, '<span style="white-space:nowrap">$1</span>');   // «CAD/CAM», «All-on-4» no se parten
// Gema del logo (assets/prodigy-logo.svg)
const GEMA = `<svg width="34" height="30" viewBox="14 2 36 40" aria-hidden="true"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D4AF37"/><stop offset=".5" stop-color="#D946A6"/><stop offset="1" stop-color="#00d2ff"/></linearGradient></defs>
<polygon points="32,4 16,20 32,20" fill="url(#g)" opacity=".9"/><polygon points="32,4 48,20 32,20" fill="#D4AF37" opacity=".75"/><polygon points="16,20 32,20 22,40" fill="#D946A6" opacity=".85"/><polygon points="48,20 32,20 42,40" fill="url(#g)" opacity=".7"/><polygon points="22,40 32,20 42,40" fill="#D4AF37" opacity=".95"/></svg>`;
const plantilla = i => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;800;900&display=swap">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden;background:#070708;font-family:Inter,'Segoe UI',Arial,sans-serif}
.panel{position:absolute;left:0;top:0;bottom:0;width:520px;padding:52px 52px 50px 60px;display:flex;flex-direction:column;justify-content:space-between}
.marca{display:flex;align-items:center;gap:12px;font-size:22px;color:#f1f1f1}
.marca strong{font-weight:900;letter-spacing:.04em}
.marca span{font-weight:600;color:#D946A6}
h1{font-size:${i.t.length > 34 ? 46 : 54}px;line-height:1.08;font-weight:800;color:#fff;text-wrap:balance;letter-spacing:-.01em}
p{margin-top:22px;font-size:22px;line-height:1.45;color:#aeb4bf;font-weight:500}
.web{font-size:20px;font-weight:600;color:#D946A6}
.foto{position:absolute;left:520px;top:0;right:0;bottom:0;overflow:hidden;background:#1a1a1d}
.foto img{width:100%;height:100%;object-fit:cover;object-position:${i.pos || 'center'}}
.pie{position:absolute;right:0;bottom:0;padding:9px 16px;background:rgba(7,7,8,.78);color:#e7e7e7;font-size:15px;font-weight:500}
</style></head><body>
<div class="panel"><div class="marca">${GEMA}<strong>PRODIGY</strong><span>Lab Dental</span></div>
<div><h1>${esc(i.t)}</h1><p>${esc(i.s)}</p></div><div class="web">prodigylabdental.com</div></div>
<div class="foto"><img src="${foto(i.foto)}" alt=""><div class="pie">${esc(i.pie)}</div></div>
</body></html>`;

function chromePath() {
  const c = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  const p = c.find(x => x && existsSync(x)); if (!p) throw new Error('No encuentro Chrome/Edge (define CHROME=ruta)'); return p;
}

async function conCDP(fn) {
  const perfil = mkdtempSync(join(tmpdir(), 'og-'));
  const PUERTO = 9400 + Math.floor(Math.random() * 400);
  const ch = spawn(chromePath(), ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });
  try {
    let ver; for (let k = 0; k < 50 && !ver; k++) { try { ver = await (await fetch(`http://127.0.0.1:${PUERTO}/json/version`)).json(); } catch { await new Promise(r => setTimeout(r, 200)); } }
    if (!ver) throw new Error('Chrome no abrió el puerto de depuración');
    const t = await (await fetch(`http://127.0.0.1:${PUERTO}/json/new?about:blank`, { method: 'PUT' })).json();
    const ws = new WebSocket(t.webSocketDebuggerUrl); let id = 0; const pend = {}; const ev = [];
    ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } else ev.forEach(h => h(m)); });
    await new Promise(r => ws.addEventListener('open', r));
    const send = (method, params = {}) => new Promise((ok, mal) => { const i = ++id; pend[i] = m => m.error ? mal(new Error(m.error.message)) : ok(m.result); ws.send(JSON.stringify({ id: i, method, params })); });
    const cargado = () => new Promise(r => { const h = m => { if (m.method === 'Page.loadEventFired') { ev.splice(ev.indexOf(h), 1); r(); } }; ev.push(h); });
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
    await fn({ send, cargado });
    ws.close();
  } finally { ch.kill(); await new Promise(r => setTimeout(r, 400)); try { rmSync(perfil, { recursive: true, force: true }); } catch {} }
}

const args = process.argv.slice(2);
const solo = args.includes('--solo') ? args[args.indexOf('--solo') + 1].split(',') : null;
const lista = IMAGENES.filter(i => !solo || solo.includes(i.slug));
const tmp = mkdtempSync(join(tmpdir(), 'og-html-'));

await conCDP(async ({ send, cargado }) => {
  for (const i of lista) {
    const f = join(tmp, i.slug + '.html'); writeFileSync(f, plantilla(i));
    let ok = false;
    for (let intento = 1; intento <= 3 && !ok; intento++) {   // las fotos de Supabase pueden fallar por red: se reintenta
      const listo = cargado(); await send('Page.navigate', { url: pathToFileURL(f).href }); await listo;
      const r = await send('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression:
        `document.fonts.ready.then(() => Promise.all([...document.images].map(m => m.decode().then(() => m.naturalWidth).catch(() => 0))))` });
      ok = r.result.value.every(Boolean);
    }
    if (!ok) throw new Error('No cargó la foto de ' + i.slug);
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } });
    writeFileSync(join(ROOT, 'assets', `og-${i.slug}.jpg`), Buffer.from(shot.data, 'base64'));
    console.log('✓ assets/og-' + i.slug + '.jpg');
  }
});
rmSync(tmp, { recursive: true, force: true });

if (args.includes('--aplicar')) {
  for (const i of lista) for (const p of i.paginas) {
    const f = join(ROOT, p + '.html'); let t = readFileSync(f, 'utf8'); const antes = t;
    const url = `https://prodigylabdental.com/assets/og-${i.slug}.jpg`;
    t = t.replace(/(<meta\b[^>]*\bproperty="og:image"[^>]*\bcontent=")[^"]+(")/, `$1${url}$2`).replace(/(<meta\b[^>]*\bname="twitter:image"[^>]*\bcontent=")[^"]+(")/, `$1${url}$2`);
    if (t !== antes) { writeFileSync(f, t); console.log('  → ' + p + '.html'); } else console.log('  = ' + p + '.html (sin cambio)');
  }
}
