# 🛡️ Herramientas de auditoría — prevención de bugs antes del deploy

Nacieron de la sesión donde encontramos (en producción) cosas que debieron atraparse antes:
anon key rotada (401 en calculadoras/soporte/waitlist), errores JS que dejaban páginas vacías,
IDs duplicados, enlaces rotos. Estas dos herramientas los detectan **antes** de subir.

## Estrategia en 3 capas

| Capa | Qué atrapa | Costo | Cuándo |
|---|---|---|---|
| **1. Estática** (`audit.mjs`) | anon key desactualizada · IDs duplicados · enlaces internos rotos · SEO básico | Node puro, ~1s, sin navegador | **antes de cada `git push`** |
| **2. Runtime** (`audit-live.mjs`) | errores JS de consola · llamadas Supabase/API 4xx · páginas vacías | headless Edge, ~3-4 min | **antes de cada deploy** / semanal |
| **3. Hook/CI** | corre la capa 1 automáticamente y bloquea si hay crítico | — | automático |

## Uso

```bash
# Capa 1 — estática (rápida). Exit 1 si hay algo crítico.
node tools/audit.mjs                                   # repo actual (cwd)
node tools/audit.mjs "D:/proyectos-web/alejandro-carvajal-site"   # otro repo

# Capa 2 — runtime (levanta server + Edge solos). Requiere Python + Edge.
node tools/audit-live.mjs
node tools/audit-live.mjs "D:/proyectos-web/alejandro-carvajal-site"
```

## Capa 3 — git hook (opcional, recomendado)

Para que la capa 1 corra sola antes de cada push, crea `.git/hooks/pre-push` con:

```sh
#!/bin/sh
node tools/audit.mjs || { echo "Auditoría estática falló — corrige antes de pushear (o git push --no-verify para saltar)"; exit 1; }
```

y dale permiso: `chmod +x .git/hooks/pre-push`. (Los hooks NO se versionan; hay que crearlo en cada clon.)

## Notas / cómo leer los resultados

- **Capa 1 «crítico»** = rompe algo real (deploy debería frenarse). **«aviso SEO»** = mejora, no bloquea.
- **Anon key drift**: la herramienta toma como *vigente* la key más usada; marca cualquier archivo con otra.
  Si rotas credenciales en Supabase, corre la capa 1 para encontrar todos los archivos a actualizar.
- **Falsos positivos ya contemplados**: hrefs generados por JS (`${...}`, concatenación), `data-id=`,
  tokens i18n (`cad.cta.href`), y assets se resuelven relativos a su carpeta.
- La capa 2 ignora `/api/track-event` (da 501 en local, funciona en Cloudflare) y usa la cookie `pg_admin=1`
  para saltar el modo mantenimiento.

💡 **Regla aprendida**: un 401 en llamada anon = key inválida o RLS; decodifica el JWT (`iat`/`exp`) para
ver si la key está vieja. Un 400 = columna que no existe. Una página en blanco bajo el hero = error JS
que mató el script (revisa consola).
