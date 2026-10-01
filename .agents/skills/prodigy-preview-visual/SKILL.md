---
name: prodigy-preview-visual
description: Cómo capturar y mostrar previews visuales de cambios de UI en PRODIGY y Alejandro CAD/CAM (capturas locales o en vivo, modo claro/oscuro, móvil, escenas 3D, páginas en mantenimiento y páginas con login). Usar después de cualquier cambio visual, al revisar contraste, responsive o animaciones, y al preparar una vista previa o un prototipo para Alejandro.
---

# Preview visual

Regla: todo cambio de UI se muestra con una captura antes de darlo por terminado.

## Herramienta

`playwright-cli` (ver skill `playwright-cli`). Básico:

```bash
playwright-cli open http://localhost:8787/ruta.html
playwright-cli resize 1366 900          # escritorio
playwright-cli screenshot --filename=<scratchpad>/captura.png
playwright-cli resize 390 844           # móvil: revisa que no haya scroll horizontal
playwright-cli close
```

Guarda las capturas en el scratchpad de la sesión, nunca en el repo, y míralas con Read antes de mostrarlas.

## Trampas conocidas del proyecto

- **Servir local:** `python -m http.server 8787` desde la raíz del repo (rutas relativas).
- **Mantenimiento:** `js/header.js` manda las páginas públicas a `/mantenimiento` sin la cookie `pg_admin=1`.
  Abre primero `/?preview=prodigy` o pon la cookie con `playwright-cli eval`.
- **Modo claro:** `localStorage.pg_theme = 'light'` y recarga. Es un `filter: invert` global: fotos, videos,
  iframes, `spline-viewer` y `canvas[data-engine]` se re-invierten; revisa contraste de textos.
- **Páginas `/app` con login:** `auth-guard.js` redirige sin sesión. Usa una cuenta con rol `test`
  (modo prueba: pedidos ficticios) o un stub de Supabase en una copia de la página en el scratchpad.
- **3D / WebGL en headless (Chrome):** `--use-angle=swiftshader --enable-unsafe-swiftshader`; espera 2–3 s
  antes de capturar.
- **Git Bash:** antepón `MSYS_NO_PATHCONV=1` si un argumento empieza con `/` (si no, lo vuelve ruta de Windows).
- **Caché del navegador:** con `?v=` viejo verás el JS anterior; recarga o sube la versión.

## Entrega

- Captura estática → muéstrala y di qué mirar en ella.
- Prototipo interactivo (3D, animación, maqueta) → publícalo como Artifact y da la URL completa; copia el
  `.html` a `C:\Users\Jack Carvajal\Downloads\` para que Alejandro lo abra localmente.
- No integres un prototipo al sitio hasta que Alejandro lo apruebe.
