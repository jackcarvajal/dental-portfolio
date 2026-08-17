# REGLAS MAESTRAS - PROYECTO PRODIGY

Este archivo se carga en CADA turno — se mantiene corto a propósito. Detalles extensos (plantillas
de meta-tags, patrones de seguridad con código, pipeline del bot/artículos) viven en `docs/` y solo
se leen cuando la tarea los necesita. No dupliques contenido de vuelta aquí.

## 0. PERMISOS
Total: bash, leer, escribir, crear, eliminar. Confirma solo si: eliminas sin backup, cambios >200 líneas, instalas dependencias.

## 1. OPERACIÓN
- Directo. Sin introducciones. Sin sugerencias no pedidas.
- Archivos >300 líneas: grep primero, leer solo ±30 líneas del match.
- Ediciones QUIRÚRGICAS. Diagnóstico: máx 3 líneas. Verificación: un grep con número de línea.

## 1b. LEY DE ORO — PARIDAD PRODIGY ↔ ALEJANDRO CAD/CAM
PRODIGY (este repo) y Alejandro CAD/CAM (`D:\proyectos-web\alejandro-carvajal-site`) comparten el
mismo proyecto Supabase (`zgihrwqfyvgyapbwzkvw`), separados por la columna `negocio`.

- **SQL/RLS/RPC sobre tablas compartidas** → corregir UNA sola vez alcanza para ambos (misma tabla física). No duplicar el patch en los dos repos.
- **Código (JS/HTML/Cloudflare Functions)** → cada proyecto tiene su propio repo/Cloudflare Pages, NO se hereda solo. Todo fix de seguridad/rendimiento en un repo DEBE evaluarse y portarse al otro si aplica — sin que el usuario lo pida cada vez.
- **RPCs/tablas de un solo negocio** (ej. `alejandro_*`, guías CDR) no se portan — se auditan aparte.
- Al cerrar una ronda de fixes de seguridad: preguntarse "¿esto aplica también al otro?" antes de dar la tarea por cerrada.

## 2. CONTEXTO
- Usuario: Alejandro Carvajal. Idioma: Español estricto.
- Stack: Vanilla JS, HTML5, CSS3. Rutas relativas siempre.
- INTOCABLE: `calcularTotal()`, `STATE`, `calcularFechaEntrega()`. Sin variables paralelas para precios.
- APIs externas: claves en Cloudflare Env Vars. Frontend llama solo a `/api/función`.

## 3. PÁGINAS NUEVAS
Checklist completo (meta-tags `<head>`, body, colores alternantes, login, multiidioma, og:image, precios duales, protocolo CDR): **`docs/GUIA-PAGINAS-NUEVAS.md`** — leer antes de crear una página pública.

## 3b. LEY 50/50
Cotizaciones: "50% abono inicio · 50% saldo contra entrega". Precios en COP. WA incluye: Total, Abono, Saldo.

## 4. SEGURIDAD — reglas siempre-activas
- `/app/*.html` (excl. login/reset): `noindex,nofollow` + `auth-guard.js` antes de JS de negocio.
- `/patient.html`: noindex. `/sql/*`, `/supabase/*`: bloqueados en `_redirects`.
- XSS: siempre `escH()` o `textContent` para datos de Supabase/API externa en innerHTML.
- Auth: SOLO `app_metadata.role` para roles staff. `user_metadata` es user-controlled — NUNCA para autorización.
- Admin: lista hardcodeada de emails en `auth-guard.js` y edge functions. NUNCA desde DB.

Patrones detallados con código (XSS, CORS, GRANT Supabase oct-2026, preconnect, accesibilidad, Font Awesome, rate limiting, CSP, cache-busters, robots.txt): **`docs/GUIA-SEGURIDAD.md`** — leer al tocar código de seguridad.

## 5. DISEÑO
Colores: `#D946A6` magenta · `#D4AF37` gold · `#00d2ff` cyan · `#050505` bg · `#1a2332` card · `#00FF41` neon
Animaciones: solo en idle (requestIdleCallback). Sin loops en eco-cards. Solo fade+scroll con GSAP.

Toda página con `animation: X infinite` DEBE incluir al final del `<style>`:
```css
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;}
}
```
Toda página dark DEBE tener `<meta name="color-scheme" content="dark">` (evita flash blanco).

## 6. REPORTE (al terminar tarea)
```
CAMBIOS: [archivo] → [qué] (línea X)
VERIFICADO: [grep] → [resultado]
PENDIENTE: [acción] → solo si hay algo
```
Al final de sesión: `/clear` (todo commiteado) o `/compact` (trabajo en vuelo).

## 7. PRIVACIDAD
- Formularios: checkbox Habeas Data Colombia obligatorio.
- Separar: Transaccionales (siempre) vs. Promocionales (`acepta_marketing = true`).

## 8. REFERENCIAS RÁPIDAS
- `MAP.md` — líneas exactas de funciones críticas. Leer antes de editar archivos grandes.
- `PENDIENTES.md` — solo tareas ⏳/🔴/🟡. Orden: 0-SQL → 1-Home → 2-Portafolio → 3-Servicios → 4-Flujos → 5-Soporte → 6-Empresa → 7-Portal → 8-SEO.
- `VERIFICAR.md` — protocolo que sigue Alejandro para reportar resultados.
- `docs/GUIA-PAGINAS-NUEVAS.md` — checklist completo de páginas públicas nuevas.
- `docs/GUIA-SEGURIDAD.md` — patrones de seguridad con código (XSS, CORS, GRANT, CSP, etc).
- `docs/GUIA-BOT-Y-ARTICULOS.md` — arquitectura del chatbot Gemini y pipeline de artículos auto-generados.
- `docs/GUIA-AUDITORIA.md` — checklist de auditoría web app / e-commerce (404, Schema.org, hreflang).
- `tools/` — **auditoría automática (correr antes de push/deploy)**: `audit.mjs` (estático: anon key, IDs dup, links rotos), `audit-live.mjs` (runtime: errores JS, 4xx Supabase), `audit-schema.mjs` (contrato front↔BD, columnas fantasma). Ver `tools/README.md`.

## 9. ANTI-SLOP / ARQUITECTURA (aprendido ago-2026)
La IA sin guía genera slop de BD/backend. Reglas: **verificar el esquema real antes de tocar tablas/columnas/RPCs** (un 400 = columna que no existe; 401 anon = RLS/GRANT o anon key vieja). No inventar nombres, no columnas bilingües (`event`/`evento`), no tablas solapadas, una sola fuente de verdad por RPC. Correr los `tools/audit-*.mjs`. Refactor de esquema = cirugía sobre datos vivos → por etapas.
