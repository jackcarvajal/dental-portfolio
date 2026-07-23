# GUÍA — Chatbot Gemini y sistema de artículos auto-generados

Leer solo al tocar el chatbot o el pipeline de artículos. Ver CLAUDE.md § 9-10 para el resumen.

## Chatbot (Gemini) — arquitectura
```
Usuario → header.js (_phdrSendMsg) → fetch POST /api/gemini
  → Cloudflare Pages Function (functions/api/gemini.js)
  → Gemini 2.0 Flash API (GEMINI_API_KEY en Cloudflare Env Vars, nunca expuesta al cliente)
  → Fallback chain: gemini-2.0-flash → gemini-2.0-flash-lite → gemini-1.5-flash → gemini-1.5-flash-8b
```

| Archivo | Rol |
|---|---|
| `js/header.js` | UI del chat + lógica cliente + system prompt |
| `functions/api/gemini.js` | Proxy Cloudflare — guarda la API key |
| Cloudflare Env Vars | `GEMINI_API_KEY` — JAMÁS en código fuente |

System prompt: función `_pgBuildPrompt()` (~línea 844 header.js) — incluye título/path de página, servicios, precios, idioma, regla "no inventar → WhatsApp 573212816716".

**Manejo de errores (4 casos):**
1. Rate limit (429) → "Muchas consultas seguidas — espera un momento."
2. API key no configurada → "Asistente fuera de línea. WhatsApp..."
3. Otro error → detail + WhatsApp + `console.warn('[PRODIGY BOT] Sin candidatos:', ...)`
4. Sin conexión (catch) → "Sin conexión ahora mismo. WhatsApp..."

Rate limit: 5 req/min por IP. CORS: solo dominio propio + `*.pages.dev`.

**Causa más común del bot "roto":** `GEMINI_API_KEY` no configurada en Cloudflare Pages → Settings → Environment Variables. Solución: agregar variable + redesplegar (Deployments → Retry).

**Checklist de verificación:**
- [ ] `GEMINI_API_KEY` en Cloudflare Env Vars (ambos sitios)
- [ ] `functions/api/gemini.js` existe
- [ ] WA correcto en `_pgBuildPrompt()`: 573212816716 (PRODIGY) / 573219581949 (Alejandro)
- [ ] 4 casos de error en `_phdrSendMsg`
- [ ] Rate limit 5/min activo
- [ ] CORS restringido
- [ ] Historial con rol `user`/`model` (no `assistant`)
- [ ] `system_instruction` en cada request

## Artículos auto-generados — regla absoluta
**JAMÁS inventar, alucinar ni parafrasear sin cita verificable.** Toda afirmación clínica/estadística necesita DOI real verificable en PubMed/ScienceDirect. Temperatura Gemini: 0.15.

**Journals aceptados:** Periodontology 2000, JDR, J. Clinical Periodontology, J. of Dentistry, Dental Materials, JPD, AJODO, J. of Endodontics, COIR, IJOS, JADA, Cochrane Oral Health, SciELO Odontología.

**Plataformas para DOIs reales:** PubMed/NCBI, ScienceDirect, JADA, SciELO.

**Fuentes NO permitidas:** Wikipedia (salvo datos generales no clínicos), blogs/comerciales, GPT/Gemini sin cita, artículos sin DOI o revista no indexada.

**Reglas de construcción:** mín. 5 secciones (h2) · mín. 4 referencias con DOI verificado · tablas con columna "Fuente/DOI" · estadísticas numéricas siempre citadas · prompt lista journals explícitamente y prohíbe inventar DOIs.

**Pipeline PRODIGY** (`scripts/auto-journal.js`): GitHub Actions mar/jue 9AM Bogotá → Gemini 2.0 Flash → prepende a `articles.js` (array `ARTICLES`) → auto-actualiza `sitemap.xml` → social copy a GitHub Artifact.

**Pipeline Alejandro** (`alejandro-carvajal-site/scripts/gen-articulo-ac.js`): lun/mié 9AM Bogotá → `articles-ac.js` (array `ARTICLES_AC`).

**Formato de bloque** (`article.html` / `renderContent()` acepta ambos):
```javascript
// Legacy (manual): { tipo, texto, cabeceras, filas }
// Nuevo (auto-journal): { t, c, headers, rows }
// normaliza: tp = b.t || b.tipo; txt = b.c ?? b.texto
```

**Env vars:** Cloudflare Pages `GEMINI_API_KEY` (bot producción) · GitHub Secrets `GEMINI_API_KEY` (cron artículos).
