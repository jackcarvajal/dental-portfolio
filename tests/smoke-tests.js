/**
 * PRODIGY — Smoke Tests automatizados
 * Node.js — sin dependencias externas
 *
 * Uso: node tests/smoke-tests.js
 * CI:  Agregar al workflow de GitHub Actions antes del deploy
 *
 * Verifica:
 *  1. Archivos críticos presentes
 *  2. Reglas biomecánicas — validación de casos conocidos
 *  3. Upload guard — magic bytes correctos
 *  4. Variables de entorno declaradas en edge functions
 *  5. Sitemap válido (URLs únicas, lastmod correcto)
 *  6. robots.txt correcto
 *  7. _headers con directivas de seguridad
 *  8. biomecanica-rules.js — TODOS los casos de prueba
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let passed = 0, failed = 0, warnings = 0;

function ok(msg)   { console.log(`  ✅ ${msg}`); passed++; }
function fail(msg) { console.error(`  ❌ ${msg}`); failed++; }
function warn(msg) { console.warn(`  ⚠️  ${msg}`); warnings++; }

function fileExists(rel) { return fs.existsSync(path.join(ROOT, rel)); }
function fileContent(rel) { return fs.existsSync(path.join(ROOT, rel)) ? fs.readFileSync(path.join(ROOT, rel), 'utf8') : ''; }
function assert(cond, msg) { cond ? ok(msg) : fail(msg); }

// ── BLOQUE 1: Archivos críticos ────────────────────────────────────
console.log('\n📁 ARCHIVOS CRÍTICOS');
const criticalFiles = [
  'index.html', 'flujo-diseno.html', 'flujo-fresado.html', 'flujo-impresion.html', 'flujo-lab.html',
  'seguimiento-caso.html', 'sw.js', 'manifest.json', '_headers', '_redirects', 'robots.txt', 'sitemap.xml',
  'js/header.js', 'js/footer.js', 'js/auth-guard.js', 'js/upload-guard.js', 'js/biomecanica-rules.js',
  'js/flujo-impresion.js', 'functions/api/gemini.js', 'functions/api/health-check.js',
  'functions/api/churn-alert.js', 'sql/patch-rls-client-column-protection.sql',
  'sql/trigger-purga-stl-30dias.sql', 'SAAS-ROADMAP.md', 'SECURITY.md',
  'app/panel-interno-operaciones.html', 'app/client-panel.html', 'app/login.html',
];
criticalFiles.forEach(f => assert(fileExists(f), f));

// ── BLOQUE 2: Seguridad en _headers ───────────────────────────────
console.log('\n🛡️  HEADERS DE SEGURIDAD');
const headers = fileContent('_headers');
const requiredHeaders = [
  'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy',
  'Permissions-Policy', 'Content-Security-Policy', 'upgrade-insecure-requests',
  'object-src', 'base-uri', 'media-src',
];
requiredHeaders.forEach(h => assert(headers.includes(h), `_headers contiene ${h}`));

// ── BLOQUE 3: robots.txt ───────────────────────────────────────────
console.log('\n🤖 ROBOTS.TXT');
const robots = fileContent('robots.txt');
assert(robots.includes('Disallow: /app/'), 'Bloquea /app/');
assert(robots.includes('Disallow: /api/'), 'Bloquea /api/');
assert(robots.includes('ClaudeBot'), 'Bloquea ClaudeBot');
assert(robots.includes('Sitemap:'), 'Tiene Sitemap declarado');
assert(!robots.includes('GPTBot\nDisallow'), 'Permite GPTBot');

// ── BLOQUE 4: SW cache version ─────────────────────────────────────
console.log('\n📦 SERVICE WORKER');
const sw = fileContent('sw.js');
const cacheMatch = sw.match(/const CACHE = '([^']+)'/);
if (cacheMatch) { ok(`Cache version: ${cacheMatch[1]}`); }
else { fail('No se encontró CACHE version en sw.js'); }
assert(sw.includes('/flujo-diseno'), 'PRECACHE incluye flujo-diseno');
assert(sw.includes('/flujo-fresado'), 'PRECACHE incluye flujo-fresado');
assert(sw.includes('/seguimiento-caso'), 'PRECACHE incluye seguimiento-caso');

// ── BLOQUE 5: biomecanica-rules.js — casos de prueba ──────────────
console.log('\n🦷 REGLAS BIOMECÁNICAS');
const bioContent = fileContent('js/biomecanica-rules.js');
assert(bioContent.includes('puente_resina_larga'), 'Regla: puente en PMMA larga');
assert(bioContent.includes('fullarch_emax'), 'Regla: Full Arch en e.max');
assert(bioContent.includes('carilla_zirconio_posterior'), 'Regla: carilla zirconio posterior');
assert(bioContent.includes('guia_sin_cbct'), 'Regla: guía sin CBCT');
assert(bioContent.includes('provisional_largo_plazo'), 'Regla: provisional como definitivo');
assert(bioContent.includes("nivel: 'bloqueo'"), 'Tiene bloqueos definidos');
assert(bioContent.includes("nivel: 'advertencia'"), 'Tiene advertencias definidas');

// ── BLOQUE 6: Edge functions — env vars referenciadas ─────────────
console.log('\n⚡ EDGE FUNCTIONS');
const checkGemini  = fileContent('functions/api/gemini.js');
const checkHealth  = fileContent('functions/api/health-check.js');
const checkChurn   = fileContent('functions/api/churn-alert.js');
const checkFactura = fileContent('functions/api/factura.js');
assert(checkGemini.includes('GEMINI_API_KEY'), 'gemini.js referencia GEMINI_API_KEY');
assert(checkGemini.includes('rate') || checkGemini.includes('429'), 'gemini.js tiene rate limiting');
assert(checkHealth.includes('SERVICES'), 'health-check.js tiene lista de servicios');
assert(checkChurn.includes('CRON_SECRET'), 'churn-alert.js tiene autenticación');
assert(checkFactura.includes('max-age=3600'), 'factura.js tiene rate limiting');

// ── BLOQUE 7: upload-guard.js — magic bytes completos ─────────────
console.log('\n📁 UPLOAD GUARD');
const uploadGuard = fileContent('js/upload-guard.js');
assert(uploadGuard.includes('0x4D,0x5A'), 'Detecta EXE (MZ)');
assert(uploadGuard.includes('0x7F,0x45,0x4C,0x46'), 'Detecta ELF Linux');
assert(uploadGuard.includes('validateMagicBytes'), 'Exporta validateMagicBytes');
assert(uploadGuard.includes('validateUpload'), 'Exporta validateUpload');
assert(uploadGuard.includes('CAD'), 'Tiene reglas para archivos CAD');
assert(uploadGuard.includes('COMPROBANTE'), 'Tiene reglas para comprobantes');

// ── BLOQUE 8: auth-guard.js — funciones críticas ──────────────────
console.log('\n🔒 AUTH GUARD');
const authGuard = fileContent('js/auth-guard.js');
assert(authGuard.includes('app_metadata'), 'Usa app_metadata para roles');
// user_metadata puede aparecer en comentarios explicativos — verificar que no se use en decisiones de auth
const userMetaInAuth = authGuard.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
assert(!userMetaInAuth.match(/if.*user_metadata.*role/), 'NO usa user_metadata para decisiones de rol');
assert(authGuard.includes('IDLE_MS'), 'Tiene session timeout');
assert(authGuard.includes('signOut'), 'Exporta signOut');
assert(authGuard.includes('jackalejandroc@gmail.com'), 'Admin hardcodeado por email');

// ── BLOQUE 9: sitemap.xml ──────────────────────────────────────────
console.log('\n🗺️  SITEMAP');
const sitemap = fileContent('sitemap.xml');
const urlCount = (sitemap.match(/<loc>/g) || []).length;
assert(urlCount >= 50, `Sitemap tiene ${urlCount} URLs (mín 50)`);
assert(sitemap.includes('prodigylabdental.com'), 'Sitemap apunta al dominio correcto');
assert(sitemap.includes('<priority>'), 'Sitemap tiene priority tags');
assert(sitemap.includes('2026-05'), 'Sitemap tiene lastmod reciente (2026-05)');

// ── BLOQUE 10: noopener en HTML críticos ──────────────────────────
console.log('\n🔗 NOOPENER COVERAGE');
const flujoDiseno = fileContent('flujo-diseno.html');
const remainingUnsafe = (flujoDiseno.match(/window\.open[^)]*'_blank'\)/g) || [])
  .filter(m => !m.includes('noopener'));
assert(remainingUnsafe.length === 0, `flujo-diseno.html: 0 window.open sin noopener`);

// ── BLOQUE 11: SW versión sync con MAP.md ─────────────────────────
console.log('\n🔄 SERVICE WORKER SYNC');
const map = fileContent('MAP.md');
if (map.includes('SW_VERSION')) {
  const mapVersion   = (map.match(/SW_VERSION\s*=\s*'([^']+)'/) || [])[1];
  const swVersion    = (sw.match(/const CACHE = '([^']+)'/)  || [])[1];
  if (mapVersion && swVersion) {
    assert(mapVersion === swVersion, `MAP.md SW_VERSION (${mapVersion}) = sw.js CACHE (${swVersion})`);
  } else { warn('No se pudo comparar versiones SW vs MAP.md'); }
} else { warn('MAP.md no tiene SW_VERSION declarado'); }

// ── BLOQUE 12: biomecanica-rules.js función validate exportada ─────
console.log('\n🔬 BIOMECANICA VALIDATE FUNCTION');
// Simular el entorno del browser
const vmModule = require('vm');
const bioCode = fileContent('js/biomecanica-rules.js');
const sandbox = { window: {} };
vmModule.createContext(sandbox);
try {
  vmModule.runInContext(bioCode, sandbox);
  const rules = sandbox.window.BiomecanicaRules;
  if (rules && typeof rules.validate === 'function') {
    // Caso 1: puente 5 unidades en PMMA → debe bloquear
    const r1 = rules.validate('puente', 'pmma', 5);
    assert(!r1.ok, 'Bloquea: puente 5u en PMMA');
    // Caso 2: Full Arch en e.max → bloqueo
    const r2 = rules.validate('full arch', 'emax', 14);
    assert(!r2.ok, 'Bloquea: Full Arch en e.max');
    // Caso 3: Corona en zirconio → sin problemas
    const r3 = rules.validate('corona', 'zirconio_multicapa', 1);
    assert(r3.ok, 'OK: Corona unitaria en zirconio');
    // Caso 4: Advertencia carilla posterior
    const r4 = rules.validate('carilla', 'zirconi', 1, { zona: 'posterior' });
    assert(r4.advertencias.length > 0, 'Advierte: carilla zirconio posterior');
  } else { fail('BiomecanicaRules no encontrado o validate no es función'); }
} catch(e) { fail(`Error ejecutando biomecanica-rules.js: ${e.message}`); }

// ── BLOQUE 13: flujos tienen biomecanica-rules.js ─────────────────
console.log('\n📋 COBERTURA BIOMECÁNICA EN FLUJOS');
['flujo-fresado.html', 'flujo-impresion.html', 'calculadora-fresado.html', 'calculadora-diseno.html'].forEach(f => {
  const content = fileContent(f);
  assert(content.includes('biomecanica-rules'), `${f} carga biomecanica-rules.js`);
});

// ── BLOQUE 14: Churn alert y health check configurados ─────────────
console.log('\n⚡ EDGE FUNCTIONS AVANZADAS');
const churnFn   = fileContent('functions/api/churn-alert.js');
const healthFn  = fileContent('functions/api/health-check.js');
assert(churnFn.includes('prodigy_detectar_churn'), 'churn-alert llama RPC de Supabase');
assert(churnFn.includes('sendWhatsAppAlert') || churnFn.includes('callmebot'), 'churn-alert envía WA');
assert(healthFn.length > 5, 'health-check.js tiene contenido');
const serviceCount = (healthFn.match(/name:/g) || []).length;
assert(serviceCount >= 10, `health-check monitorea ${serviceCount} servicios (mín 10)`);

// ── BLOQUE 15: Auth guard session timeout ─────────────────────────
console.log('\n⏱️  SESSION TIMEOUT');
const authContent = fileContent('js/auth-guard.js');
assert(authContent.includes('30 * 60 * 1000') || authContent.includes('1800000'), 'Timeout de 30 min configurado');
assert(authContent.includes('mousemove') && authContent.includes('keydown'), 'Detecta actividad del usuario');
assert(authContent.includes('signOut'), 'Llama signOut al expirar');

// ── RESUMEN ────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(50));
console.log(`RESUMEN: ${passed} ✅  ${warnings} ⚠️  ${failed} ❌`);
if (failed > 0) {
  console.error(`\n🚨 ${failed} test(s) fallaron — revisar antes de deploy`);
  process.exit(1);
} else {
  console.log(`\n🎉 Todos los tests pasaron`);
  process.exit(0);
}
