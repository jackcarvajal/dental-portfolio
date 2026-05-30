/**
 * PRODIGY — Generador de OG Images con Puppeteer
 *
 * Uso: node scripts/gen-og-images.js
 * Requiere: npm install puppeteer (una vez, en la raíz del proyecto)
 *
 * Lee todos los assets/og-*.html y genera assets/og-*.jpg (1200x630, JPEG 90%)
 */

const path = require('path');
const fs   = require('fs');

const ASSETS = path.join(__dirname, '..', 'assets');

async function generateOG() {
  let puppeteer;
  try { puppeteer = require('puppeteer'); }
  catch {
    console.error('Puppeteer no instalado. Ejecuta: npm install puppeteer');
    console.log('\nAlternativa manual sin Puppeteer:');
    console.log('1. Abre cada assets/og-*.html en Chrome');
    console.log('2. F12 → Toggle Device (Ctrl+Shift+M) → 1200x630');
    console.log('3. Ctrl+Shift+P → "Capture screenshot" → Guardar como assets/og-*.jpg');
    process.exit(1);
  }

  const htmlFiles = fs.readdirSync(ASSETS).filter(f => f.startsWith('og-') && f.endsWith('.html'));
  if (!htmlFiles.length) { console.error('No se encontraron archivos og-*.html en /assets/'); process.exit(1); }

  console.log(`Generando ${htmlFiles.length} imágenes OG...`);
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page    = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  let ok = 0, err = 0;
  for (const html of htmlFiles) {
    const jpgName = html.replace('.html', '.jpg');
    const jpgPath = path.join(ASSETS, jpgName);
    if (fs.existsSync(jpgPath)) {
      const htmlStat = fs.statSync(path.join(ASSETS, html));
      const jpgStat  = fs.statSync(jpgPath);
      if (jpgStat.mtimeMs > htmlStat.mtimeMs) {
        console.log(`SKIP (ya existe y es más reciente): ${jpgName}`);
        continue;
      }
    }
    try {
      await page.goto('file://' + path.join(ASSETS, html), { waitUntil: 'networkidle0', timeout: 8000 });
      await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 90 });
      console.log(`✓ ${jpgName}`);
      ok++;
    } catch(e) {
      console.error(`✗ ${html}: ${e.message}`);
      err++;
    }
  }

  await browser.close();
  console.log(`\nCompletado: ${ok} generadas, ${err} errores, skipped: ${htmlFiles.length - ok - err}`);
}

generateOG();
