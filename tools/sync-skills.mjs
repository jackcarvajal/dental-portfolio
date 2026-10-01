#!/usr/bin/env node
/* sync-skills.mjs — las skills propias (prodigy-*) se editan en .claude/skills/ (Claude Code) y se copian
 * a .agents/skills/ (Codex, Cursor y demás agentes) para que ambos lean lo mismo.
 * Uso: node tools/sync-skills.mjs          → copia
 *      node tools/sync-skills.mjs --check  → solo avisa si difieren (sale con 1)
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const SRC = join(process.cwd(), '.claude', 'skills');
const DST = join(process.cwd(), '.agents', 'skills');
const check = process.argv.includes('--check');

const files = (dir, base = dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? files(p, base) : [p.slice(base.length + 1)];
});

let distintos = 0;
for (const skill of readdirSync(SRC).filter((n) => n.startsWith('prodigy-'))) {
  for (const rel of files(join(SRC, skill))) {
    const a = join(SRC, skill, rel), b = join(DST, skill, rel);
    const igual = existsSync(b) && readFileSync(a).equals(readFileSync(b));
    if (igual) continue;
    distintos++;
    if (check) { console.log(`≠ ${skill}/${rel}`); continue; }
    mkdirSync(join(b, '..'), { recursive: true });
    writeFileSync(b, readFileSync(a));
    console.log(`→ ${skill}/${rel}`);
  }
}
console.log(distintos ? `${distintos} archivo(s) ${check ? 'desincronizados' : 'copiados'}` : 'Skills sincronizadas');
process.exit(check && distintos ? 1 : 0);
