---
name: prodigy-publicar
description: Checklist para cerrar una tarea y publicar cambios de PRODIGY o Alejandro CAD/CAM (commit + push que despliega en Cloudflare Pages). Usar al terminar cambios de código, antes de git commit o git push, y cuando Alejandro pida "sube", "publica", "push" o "verlo en vivo".
---

# Publicar (PRODIGY → Cloudflare Pages)

Cada push a `main` (PRODIGY) o `master` (Alejandro) despliega en vivo en 1–2 minutos. El repo PRODIGY es
**público**: nada de claves, contraseñas, UIDs ni datos de pacientes.

## 1. Solo lo tuyo

Otra sesión puede estar trabajando en el mismo repo.
- `git status` y `git diff` de tus archivos; relee un archivo antes de editarlo si pudo cambiar.
- `git add <archivos propios>` — nunca `git add -A` a ciegas.

## 2. Caché

- `/js` y `/css` se sirven inmutables: si cambiaste uno, sube su `?v=` en **todas** las páginas que lo cargan
  (`grep -rl "archivo.js?v=" --include=*.html .`).
- Si cambiaste un archivo precacheado por `sw.js`, sube `CACHE` en `sw.js` y el `SW_VERSION` de `MAP.md`
  (el smoke test exige que coincidan).
- Si cambió un flujo del equipo: actualiza `app/ayuda-articulos.json` (sube su `version`).

## 3. Verifica

- `node tools/audit.mjs` (el pre-push corre además `audit-schema-live.mjs`; nunca `--no-verify`).
- `node tests/smoke-tests.js` si tocaste archivos críticos, `sitemap.xml`, `robots.txt` o `_headers`.
- Cambio de UI → captura con la skill `prodigy-preview-visual` y muéstrala.

## 4. Commit y push

- Mensaje: `tipo(modulo): qué cambia, en español y en palabras del usuario`, más la línea de coautoría.
- `git pull --rebase` y luego `git push`. Si Alejandro ya pidió verlo en vivo, no vuelvas a preguntar.
- Comprueba en vivo con la URL completa (`https://prodigylabdental.com/...`). Las páginas públicas en
  mantenimiento necesitan el bypass `https://prodigylabdental.com/?preview=prodigy`.

## 5. Paridad y registro

- ¿El fix aplica a Alejandro CAD/CAM (`D:\proyectos-web\alejandro-carvajal-site`, rama `master`)? Si es de
  seguridad o rendimiento, pórtalo sin que lo pidan (`CLAUDE.md` §1b).
- Agrega la entrada en `BITACORA.md`.

## 6. Reporte final

Formato de `CLAUDE.md` §6 (CAMBIOS / VERIFICADO / PENDIENTE), enlaces completos, y al final
"Mejoras e ideas" (3–6, priorizadas).
