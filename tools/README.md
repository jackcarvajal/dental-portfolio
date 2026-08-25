# 🛡️ Herramientas de auditoría — prevención de bugs antes del deploy

Nacieron de la sesión donde encontramos (en producción) cosas que debieron atraparse antes:
anon key rotada (401 en calculadoras/soporte/waitlist), errores JS que dejaban páginas vacías,
IDs duplicados, enlaces rotos. Estas dos herramientas los detectan **antes** de subir.

## Estrategia en capas

| Capa | Qué atrapa | Costo | Cuándo |
|---|---|---|---|
| **1. Estática** (`audit.mjs`) | anon key desactualizada · IDs duplicados · enlaces internos rotos · SEO básico | Node puro, ~1s, sin navegador | **antes de cada `git push`** |
| **2. Runtime** (`audit-live.mjs`) | errores JS de consola · llamadas Supabase/API 4xx · páginas vacías | headless Edge, ~3-4 min | **antes de cada deploy** / semanal |
| **3. Backend/BD** (`audit-schema.mjs`) | contrato front↔BD: **columnas/tablas que el código usa y no existen** (schema drift), RPCs, redundancia | Node puro; validar necesita el esquema real | al tocar BD / periódico |
| **4. Hook/CI** | corre la capa 1 automáticamente y bloquea si hay crítico | — | automático |

### Capa 3 — contrato front ↔ base de datos
```bash
node tools/audit-schema.mjs                 # lista tablas/columnas/RPCs que toca el código
# Validar una tabla contra su esquema real (encuentra columnas inexistentes de una):
#   En Supabase SQL editor:
#     SELECT string_agg(column_name, ',') FROM information_schema.columns WHERE table_name='pedidos';
#   Guarda el resultado en pedidos.txt (mismo nombre que la tabla) y:
node tools/audit-schema.mjs --schema pedidos.txt
```
Nace de los bugs recurrentes de columna: `publicado`/`visible`, `cancelado`/`Cancelado`, `event`/`evento`,
`recurso_descargado`/`notas`. En vez de encontrarlos uno por uno en producción (400), los detecta todos juntos.

## Uso

```bash
# Capa 1 — estática (rápida). Exit 1 si hay algo crítico.
node tools/audit.mjs                                   # repo actual (cwd)
node tools/audit.mjs "D:/proyectos-web/alejandro-carvajal-site"   # otro repo

# Capa 2 — runtime (levanta server + Edge solos). Requiere Python + Edge.
node tools/audit-live.mjs
node tools/audit-live.mjs "D:/proyectos-web/alejandro-carvajal-site"
```

## Capa 3b — contrato front↔BD contra la base REAL (`audit-schema-live.mjs`)

`audit-schema.mjs` valida contra un CSV que se desactualiza. `audit-schema-live.mjs` **prueba cada columna
y RPC que el código usa contra Supabase en vivo** (42703 columna inexistente · 42P01 tabla · 42P13/22P02/PGRST202
RPC rota/ausente). Se autovalida contra el esquema vigente → no hay snapshot que mantener. Habría cazado los
400 de agosto-2026 (vista `pedidos_operacion`, `prodigy_forecast_semana`, etc.).

```sh
node tools/audit-schema-live.mjs            # 0 = limpio · 1 = hay columna/RPC inexistente · sin red = no bloquea
```

Falsos positivos del extractor (jsonb anidado, columnas de un embed `pedidos(...)`, bleed) van al `ALLOW` del script.

## Capa 4 — git hook (recomendado)

Para que las capas 1 y 3b corran solas antes de cada push, crea `.git/hooks/pre-push` con:

```sh
#!/bin/sh
command -v node >/dev/null 2>&1 || exit 0
node tools/audit.mjs             || { echo "⛔ Auditoría estática falló"; exit 1; }
node tools/audit-schema-live.mjs || { echo "⛔ Drift front↔BD (columna/RPC inexistente)"; exit 1; }
```

y dale permiso: `chmod +x .git/hooks/pre-push`. (Los hooks NO se versionan; recréalo en cada clon.
El de este repo ya corre ambas capas.)

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
