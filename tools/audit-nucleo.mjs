#!/usr/bin/env node
/* audit-nucleo.mjs — deriva del NÚCLEO COMPARTIDO (ARCHITECTURE.md §4) entre PRODIGY y los otros repos.
 * Para cada archivo del núcleo dice si es idéntico, cuántas líneas difieren y QUÉ REPO LO TOCÓ ÚLTIMO
 * (último commit). Si el otro repo es más nuevo, probablemente tiene un fix que PRODIGY no tiene:
 * hay que traerlo a PRODIGY (canónico) y luego repartirlo. NO modifica nada.
 * Uso: node tools/audit-nucleo.mjs [--repo <ruta> ...]
 */
import { readFileSync, existsSync } from 'fs';
import { join, resolve, basename } from 'path';
import { execFileSync } from 'child_process';

const NUCLEO = [
  'js/auth-guard.js', 'js/rol-actual.js', 'js/notif-panel.js', 'js/ver-clave.js', 'js/webpush.js',
  'js/modo-prueba.js', 'js/pedido-guard.js', 'js/upload-guard.js', 'js/registro-archivos.js',
  'js/fechas-habiles.js', 'js/formatos.js', 'js/visor-universal.js', 'js/historial.js', 'js/imprimir.js',
  'functions/api/notify-staff.js', 'functions/api/reportar-problema.js', 'functions/api/send-email.js',
  'functions/api/send-push.js', 'functions/api/gemini.js', 'functions/api/paypal-create-order.js',
  'functions/api/paypal-capture.js', 'functions/api/paypal-webhook.js',
];

const PRODIGY = process.cwd();
const args = process.argv.slice(2);
const pedidos = args.flatMap((a, i) => (a === '--repo' ? [args[i + 1]] : []));
const OTROS = (pedidos.length ? pedidos : [
  resolve(PRODIGY, '../../alejandro-carvajal-site'),
  resolve(PRODIGY, '../../dental-concierge'),
]).filter((r) => existsSync(r));

const ultimo = (repo, rel) => {
  try { return execFileSync('git', ['-C', repo, 'log', '-1', '--format=%cs', '--', rel], { encoding: 'utf8' }).trim() || '(sin commit)'; }
  catch { return '?'; }
};
const lineas = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n').split('\n');
const difieren = (a, b) => {               // líneas que están en uno y no en el otro (multiconjunto)
  const cuenta = new Map();
  for (const l of a) cuenta.set(l, (cuenta.get(l) || 0) + 1);
  let n = 0;
  for (const l of b) { const c = cuenta.get(l) || 0; if (c) cuenta.set(l, c - 1); else n++; }
  for (const c of cuenta.values()) n += c;
  return n;
};

const C = { g: '\x1b[32m', y: '\x1b[33m', r: '\x1b[31m', d: '\x1b[2m', b: '\x1b[1m', x: '\x1b[0m' };
console.log(`${C.b}AUDIT NÚCLEO — deriva PRODIGY ↔ ${OTROS.map((r) => basename(r)).join(' · ')}${C.x}\n`);
let traer = 0, iguales = 0, distintos = 0;
for (const rel of NUCLEO) {
  const p = join(PRODIGY, rel);
  if (!existsSync(p)) { console.log(`${C.r}✗ ${rel}: no existe en PRODIGY${C.x}`); continue; }
  const lp = lineas(p), fp = ultimo(PRODIGY, rel);
  const celdas = OTROS.map((repo) => {
    const o = join(repo, rel);
    if (!existsSync(o)) return `${C.d}—${C.x}`;
    const n = difieren(lp, lineas(o));
    if (!n) { iguales++; return `${C.g}=${C.x}`; }
    distintos++;
    const fo = ultimo(repo, rel);
    if (fo > fp) { traer++; return `${C.r}≠${n} (${basename(repo)} más nuevo ${fo} > ${fp})${C.x}`; }
    return `${C.y}≠${n} (PRODIGY más nuevo)${C.x}`;
  });
  console.log(`  ${rel.padEnd(36)} ${celdas.join('   ')}`);
}
console.log(`\nIdénticos: ${iguales} · Con diferencias: ${distintos} · ${C.r}Otro repo más nuevo (revisar y traer a PRODIGY): ${traer}${C.x}`);
console.log(`${C.d}≠N = líneas distintas. Parte puede ser configuración legítima (marca, negocio, emails); lo demás es deriva.${C.x}`);
