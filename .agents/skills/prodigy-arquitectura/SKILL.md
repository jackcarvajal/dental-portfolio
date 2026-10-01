---
name: prodigy-arquitectura
description: Arquitectura del ecosistema PRODIGY (PRODIGY Lab Dental, Alejandro CAD/CAM y Bogotá Smile Studio, que comparten una base Supabase). Usar ANTES de crear una página, módulo, tabla, columna, RPC, endpoint en functions/api, integración con un proveedor externo o un script compartido; al decidir dónde va un código nuevo; al portar algo entre repos; y cuando pregunten por la arquitectura, los módulos, "dónde va esto" o cómo está organizado el proyecto.
---

# Arquitectura PRODIGY

La fuente de verdad es `ARCHITECTURE.md` en la raíz del repo PRODIGY
(`D:\proyectos-web\mi-portfolio-dental\dental-portfolio\ARCHITECTURE.md`). Esta skill no la repite:
dice cuándo leerla y cómo aplicarla.

Resumen de la decisión (ADR-001): **monolito modular por producto + núcleo compartido**. Un repo por
producto, una base Supabase con columna `negocio`, módulos de negocio con fronteras, proveedores externos
solo detrás de `functions/api/`. Microservicios y reescrituras a frameworks están descartados.

## Antes de crear algo

1. **Lee `ARCHITECTURE.md` §3 (módulos) y §5 (¿dónde va esto?).**
2. **Nombra el módulo dueño** (Pedidos y flujos, Diseño, Alineadores, Gestión del lab, Cobros, Clientes y
   crecimiento, Identidad y acceso, Notificaciones y soporte, Contenido y SEO). Si nada encaja, dilo y
   propón el módulo; no lo inventes en silencio.
3. **Busca lo que ya existe** antes de escribir:
   - páginas y JS: `grep -rl "<concepto>" app js *.html`
   - RPC: `node tools/sql-map.mjs` (la definición canónica es el archivo más reciente que señala)
   - columnas y tablas reales: `node tools/audit-schema-live.mjs`
4. **Aplica la regla de §5.** Lo que toca dinero, estado de un caso o permisos se decide en Postgres
   (RPC `SECURITY DEFINER` + `search_path`, trigger o RLS); el navegador solo muestra.
5. **Si tocas el núcleo compartido (§4)**: primero en PRODIGY, luego porta a Alejandro
   (`D:\proyectos-web\alejandro-carvajal-site`, rama `master`) y evalúa BSS (`d:\proyectos-web\dental-concierge`).
   SQL sobre tablas compartidas se corre una sola vez. RPC `alejandro_*` no se portan.
6. **Al terminar**: si cambió la arquitectura (módulo nuevo, carpeta nueva, responsabilidad movida,
   integración nueva), actualiza `ARCHITECTURE.md` en el mismo commit.

## Señales de que algo va mal (detente y corrige)

- Una tabla nueva parecida a una que ya existe, o una columna en dos idiomas (`event`/`evento`).
- Una clave de API en el navegador, o una función nueva en `supabase/functions/` (segundo runtime: no crecer).
- El mismo bloque de código pegado en una tercera página: va a `js/<modulo>-*.js`.
- Una página en `app/` sin `noindex` + `auth-guard.js`, o una carpeta interna sin bloqueo en
  `functions/_middleware.js`.
- Roles leídos de `user_metadata` (solo `app_metadata`); admins sacados de la base (solo lista fija de emails).
- Un fix al núcleo hecho en un solo repo.

## Skills relacionadas

- `prodigy-cambio-bd` — cualquier cambio en Supabase.
- `prodigy-publicar` — cerrar, verificar y subir.
- `prodigy-preview-visual` — capturas de todo cambio de UI.
- `supabase-postgres-best-practices`, `supabase` — detalle técnico de Postgres y Supabase.
