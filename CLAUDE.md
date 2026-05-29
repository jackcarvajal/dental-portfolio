# REGLAS MAESTRAS - PROYECTO PRODIGY

## 0. PERMISOS
Total: bash, leer, escribir, crear, eliminar. Confirma solo si: eliminas sin backup, cambios >200 líneas, instalas dependencias.

## 1. OPERACIÓN
- Directo. Sin introducciones. Sin sugerencias no pedidas.
- Archivos >300 líneas: grep primero, leer solo ±30 líneas del match.
- Ediciones QUIRÚRGICAS. Diagnóstico: máx 3 líneas. Verificación: un grep con número de línea.

## 2. CONTEXTO
- Usuario: Alejandro Carvajal. Idioma: Español estricto.
- Stack: Vanilla JS, HTML5, CSS3. Rutas relativas siempre.
- INTOCABLE: `calcularTotal()`, `STATE`, `calcularFechaEntrega()`. Sin variables paralelas para precios.
- APIs externas: claves en Cloudflare Env Vars. Frontend llama solo a `/api/función`.

## 3. PÁGINAS NUEVAS (checklist obligatorio)
Toda página pública DEBE tener en `<head>`:
```html
<meta name="theme-color" content="#D946A6">
<link rel="manifest" href="/manifest.json">
<title>[Servicio] — PRODIGY Lab Dental | [keyword principal]</title>
<meta name="description" content="[150-160 chars con keyword + CTA]">
<meta name="keywords" content="[keyword1, keyword2, ...]">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<meta name="author" content="PRODIGY Lab Dental">
<link rel="canonical" href="https://prodigylabdental.com/[slug]">
<!-- hreflang — OBLIGATORIO en servicios, calculadoras y portafolio -->
<link rel="alternate" hreflang="es" href="https://prodigylabdental.com/[slug]">
<link rel="alternate" hreflang="en" href="https://prodigylabdental.com/[slug]?lang=en">
<link rel="alternate" hreflang="x-default" href="https://prodigylabdental.com/[slug]">
<!-- Si existe página EN dedicada: hreflang="en" → /en/[slug-en] en lugar de ?lang=en -->
<!-- OG básico -->
<meta property="og:title" content="[Título página]">
<meta property="og:description" content="[Descripción corta]">
<meta property="og:type" content="website">
<meta property="og:url" content="https://prodigylabdental.com/[slug]">
<meta property="og:image" content="https://prodigylabdental.com/assets/og-[slug].jpg">
<meta property="og:image:alt" content="[Descripción de la imagen]">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="es_CO">
<meta property="og:locale:alternate" content="en_US">  <!-- si la página tiene hreflang EN -->
<!-- Twitter card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[Título]">
<meta name="twitter:description" content="[Descripción]">
<meta name="twitter:image" content="https://prodigylabdental.com/assets/og-[slug].jpg">
<meta name="twitter:image:alt" content="[Descripción de la imagen]">
<!-- UX/Accesibilidad -->
<meta name="color-scheme" content="dark">
<!-- Geo local SEO — Bogotá, Colombia -->
<meta name="geo.region" content="CO-DC">
<meta name="geo.placename" content="Bogotá">
<meta name="geo.position" content="4.710989;-74.072090">
<meta name="ICBM" content="4.710989, -74.072090">
<!-- Schema.org (copiar y ajustar) -->
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Service","name":"[Nombre servicio]","description":"[Descripción]","provider":{"@type":"LocalBusiness","name":"PRODIGY Lab Dental","telephone":"+573212816716","address":{"@type":"PostalAddress","addressLocality":"Bogotá","addressCountry":"CO"}},"areaServed":"Colombia","offers":{"@type":"Offer","priceCurrency":"COP","price":"[precio_base]"}}</script>
```

En `<body>`:
```html
<script src="js/header.js?v=20260528"></script>  <!-- PRIMER elemento -->
<!-- contenido -->
<script src="js/footer.js?v=20260528"></script>  <!-- antes de </body> -->
<script>if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});</script>
```

**Después de crear la página:**
- Agregar URL a `sitemap.xml` con `<lastmod>` actual y `<priority>0.8-0.9`
- Agregar clean URL a `_headers` con `Cache-Control: public, max-age=0, must-revalidate`
- Crear imagen OG: 1200×630px en `/assets/og-[slug].jpg`
- Agregar link en menú si es servicio principal
- Si hay acordeón `<details>/<summary>` → agregar `FAQPage` schema (ver sección 8b)
- Si hay formulario con datos personales → verificar checkbox Habeas Data (Ley 1581/2012)
- Si hay tablas `<th>` → agregar `scope="col"` o `scope="row"`
- Si hay campos de formulario con hints/notas → conectar con `aria-describedby="hint-id"`
- Si hay contenido dinámico (JS renderiza) → `aria-live="polite"` en el contenedor
- Si usa `window.open()` o `iframe.src` desde DB → validar `^https://` antes
- Si hay arrays de imágenes desde Supabase → `.filter(u => /^https?:\/\//.test(u))`
- Agregar `noscript` fallback con WA si la página requiere JS crítico
- Scripts JS locales: agregar `?v=YYYYMMDD` en todos los `<script src="js/...">>`

### Secciones con colores alternantes (patrón obligatorio)
```css
/* Alternar entre estas 4 variantes */
section:nth-child(odd)  { background: var(--bg); }           /* #050505 */
section:nth-child(even) { background: rgba(13,21,32,0.6); }  /* azul oscuro */
/* O usar clases: */
.sec-dark   { background: #050505; }
.sec-card   { background: rgba(13,21,32,0.6); }
.sec-gold   { background: linear-gradient(135deg,rgba(212,175,55,.06),rgba(217,70,166,.04)); }
.sec-cyan   { background: linear-gradient(135deg,rgba(0,210,255,.05),rgba(0,210,255,.02)); }
```

### Login en header (CORRECTO — usar fetch, NO SDK)
```javascript
// ✅ Correcto: fetch directo — funciona en cualquier página sin SDK
fetch(SURL+'/auth/v1/token?grant_type=password', {method:'POST',...})
// ❌ Incorrecto: window.supabase.createClient() — falla en páginas sin SDK cargado
```

### Multiidioma ES/EN (para páginas con tráfico internacional)
- Agregar botones `.lang-btn` con `onclick="setLang('es'|'en')"`
- Poner `id="lang-[elemento]"` en los textos traducibles
- En el JS: objeto `LANG = { es:{...}, en:{...} }` con textos técnicos reales
- Auto-detect con `geo-detect.js`: si `_geoCountry !== 'CO'` → mostrar EN
- `hreflang` en `<head>`: es, en, x-default
- **NO usar traductores automáticos** — terminología clínica real (CBCT, surgical guide, implant planning, guided surgery, viability assessment, STL file delivery)

### og:image — cómo crearla
- Archivo HTML en `/assets/og-[slug].html` con layout 1200×630px
- Colores del proyecto, texto en inglés técnico para internacionales
- Capturar con puppeteer o manualmente con browser screenshot tool
- La imagen final va en `/assets/og-[slug].jpg`

### Precios duales (COP local / USD internacional)
- Tabla `catalogo` en Supabase: columna `precio` (COP) + `precio_usd` (USD)
- En flujo-diseno.html Alejandro: sync usa `precio_usd` como prioridad
- En landing pages: toggle `.toggle-btn` COP/USD con función `setMoneda(m,btn)`
- Ratio actual: 1 USD ≈ 4.000 COP (ajustar según TRM)
- Local Colombia +20% sobre convenio CDR · Internacional +80% sobre convenio CDR

### Protocolo CDR — Guías Quirúrgicas (parámetros exactos)
**Dentosoportada:** CBCT maxilar completo · separador de carrillo · sin contacto oclusal · cortes 0.5mm · resolución 150 micras · escáner intraoral ambos maxilares (.PLY o .STL)
**Mucosoportada:** 2 CBCT · paciente sentado · con contacto oclusal sin morder estabilizador · marcadores mín. 4 vestibular + 4 palatino ≈3mm (gutapercha o resina fotocurada) · prótesis con rebase si no asienta
**Esterilización guía:** Solo glutaraldehído + enjuague · NO autoclave · NO agua caliente · probar 24h antes de cirugía

## 3b. LEY 50/50
Cotizaciones: "50% abono inicio · 50% saldo contra entrega". Precios en COP. WA incluye: Total, Abono, Saldo.

## 4. SEGURIDAD

### 4a. Reglas generales
- `/app/*.html` (excl. login/reset): `noindex,nofollow` + `auth-guard.js` antes de JS de negocio.
- `/patient.html`: noindex.
- `/sql/*`, `/supabase/*`: bloqueados en `_redirects`.
- XSS: siempre `escH()` o `textContent` para datos de Supabase/API externa en innerHTML.
- Auth: SOLO `app_metadata.role` para roles staff. `user_metadata` es user-controlled — NUNCA para autorización.
- Admin: lista hardcodeada de emails en `auth-guard.js` y edge functions. NUNCA desde DB.

### 4b. XSS — Patrón de escape por contexto
Cada archivo define su propia función local. Nombres estándar en uso:
```javascript
// Función local (definir al inicio del script si el archivo usa Supabase data en innerHTML)
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
// Variantes existentes: _escH, escHtml, escapeHtml, _pgEscH, _qrEscH, esc() — mismo patrón
```
**Aplica a:** campos Supabase, respuestas de API externa (ipapi.co, etc.), `file.name`, `error.message`

### 4c. CORS — Edge functions (Cloudflare Pages Functions)
```javascript
// ✅ Correcto: validar origin contra allowlist
const allowed = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'];
const ok = allowed.includes(origin) || origin.includes('.pages.dev');
return { 'Access-Control-Allow-Origin': ok ? origin : allowed[0] };
// ❌ Incorrecto: echo ciego del origin
return { 'Access-Control-Allow-Origin': origin }; // sin validar
```
Siempre incluir `onRequestOptions` para manejar preflight OPTIONS.

### 4d. Supabase — GRANT explícitos (cambio oct 2026)
**Desde el 30 de octubre de 2026**, las tablas nuevas en el schema `public` NO se exponen
a la API (PostgREST/supabase-js) sin un GRANT explícito. RLS sigue siendo la capa de seguridad real.

**Parche para tablas existentes + futuras:** `sql/patch-supabase-public-grants-2026.sql`
(ejecutar en Supabase Dashboard → SQL Editor antes del 30-oct-2026)

**Patrón obligatorio para nuevas tablas:**
```sql
CREATE TABLE IF NOT EXISTS public.nueva_tabla (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ...
);
-- Habilitar RLS
ALTER TABLE public.nueva_tabla ENABLE ROW LEVEL SECURITY;
-- GRANT explícito (requerido desde oct 2026)
GRANT ALL ON TABLE public.nueva_tabla TO anon, authenticated;
-- Políticas RLS específicas...
CREATE POLICY "nombre_policy" ON public.nueva_tabla FOR SELECT TO authenticated USING (...);
```

### 4e. Preconnect / dns-prefetch (performance + privacidad)
Cada CDN externo usada por la página debe tener:
```html
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
```
CDNs usados en este proyecto:
- `https://cdnjs.cloudflare.com` — Font Awesome
- `https://cdn.jsdelivr.net` — Supabase SDK, Three.js
- `https://unpkg.com` — Leaflet (mensajero, taller, inventario)
- `https://zgihrwqfyvgyapbwzkvw.supabase.co` — Supabase API
- `https://fonts.googleapis.com` + `https://fonts.gstatic.com` — Google Fonts

### 4f2. Accesibilidad obligatoria en header.js
El `header.js` de ambos proyectos ya implementa (NO repetir, solo verificar):
- `<nav aria-label="Navegación principal">` en nav desktop
- `<button aria-expanded="false" aria-controls="pnav2-mob">` en hamburguesa + actualización dinámica
- `<div id="pnav2-mob" role="navigation" aria-label="Menú móvil">` en menú móvil
- `<button aria-expanded="false" aria-controls="pg-chat-window">` en botón chatbot
- `<div id="pg-chat-window" role="dialog" aria-label="...">` en ventana chatbot
- `<textarea aria-label="Escribe tu mensaje al asistente">` en input chat

Para otros botones/modales que crees:
```javascript
// Patrón obligatorio: actualizar aria-expanded al abrir/cerrar
btn.setAttribute('aria-expanded', open ? 'true' : 'false');
btn.setAttribute('aria-label', open ? 'Cerrar X' : 'Abrir X');
// El contenedor del modal debe tener:
// role="dialog" aria-label="Nombre del diálogo" aria-modal="true"
```

### 4f. Font Awesome — versión y carga
- Versión fija: **6.5.1** en toda la plataforma
- `header.js` auto-inyecta FA si la página no lo carga (usa 6.5.1)
- Para páginas con íconos críticos above-the-fold → link síncrono en `<head>`
- Para paneles/app → patrón preload lazy:
```html
<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"></noscript>
```

## 4g. Seguridad adicional — hallazgos audit 2026-05-28

### Open redirect en edge functions (stripe-checkout, send-push)
```javascript
// ❌ Peligroso: success_url/cancel_url sin validar
const url = body.success_url; // atacante puede redirigir a phishing

// ✅ Correcto: validar contra dominio propio
const _own = /^https:\/\/(www\.)?prodigylabdental\.com\//;
const success_url = raw && _own.test(raw) ? raw : 'https://prodigylabdental.com/default';
```

### URL validation en iframe.src y gallery arrays (javascript: protocol)
```javascript
// ✅ Siempre validar antes de asignar src a iframe/video/img desde DB
try { const u = new URL(link); if (u.protocol !== 'https:') throw new Error(); }
catch { return; } // bloquea javascript:, http:, data:
iframe.src = link;

// ✅ Filtrar arrays de galería de Supabase
gallery = (Array.isArray(c.gallery) ? c.gallery : []).filter(u => /^https?:\/\//.test(u));
```

### Badge/toast functions con innerHTML — SIEMPRE escapar el msg
```javascript
// ❌ Peligroso: msg de Supabase sin escapar
el.innerHTML = `<span>${msg}</span>`;

// ✅ Correcto: escH local antes de innerHTML
const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
el.innerHTML = `<span>${_esc(msg)}</span>`;
```

### Rate limiting en edge functions (patrón Cloudflare Cache API)
```javascript
// Aplicar a: send-email, send-push, notify-wa, gemini
const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
const rlKey = new Request('https://rl.internal/func-name_' + ip);
const hit = await caches.default.match(rlKey);
if (hit) {
  const count = parseInt(await hit.text(), 10) || 0;
  if (count >= 5) return new Response(JSON.stringify({error:'Demasiadas solicitudes.'}),{status:429});
  await caches.default.put(rlKey, new Response(String(count+1),{headers:{'Cache-Control':'max-age=60'}}));
} else {
  await caches.default.put(rlKey, new Response('1',{headers:{'Cache-Control':'max-age=60'}}));
}
```

### CSP obligatorio en _headers — directivas críticas 2026
```
Content-Security-Policy: ...
  media-src 'self' blob: https://*.supabase.co https://drive.google.com;
  upgrade-insecure-requests;
  object-src 'none';
  base-uri 'self';
```
- `media-src`: necesario para `<video>/<audio>` con fuentes externas (sin él se bloquean)
- `upgrade-insecure-requests`: convierte automáticamente HTTP→HTTPS en recursos

### SW notificationclick — validar data.url
```javascript
// ❌ Peligroso: url de push notification sin validar
clients.openWindow(e.notification.data.url);

// ✅ Correcto: solo dominio propio o rutas relativas
const rawUrl = e.notification.data?.url || '/';
const url = /^https?:\/\/prodigylabdental\.com\//.test(rawUrl) || rawUrl.startsWith('/')
  ? rawUrl : '/seguimiento-caso';
clients.openWindow(url);
```

## 4h. Cache-busters — regla obligatoria

**Todos los scripts JS locales deben tener `?v=AAAAMMDD`** — los assets en `/js/*` se cachean 1 año (`immutable`). Sin versión, los usuarios ven código viejo indefinidamente.

```html
<!-- ✅ Correcto -->
<script src="js/header.js?v=20260528"></script>
<script src="js/footer.js?v=20260528"></script>
<script src="js/auth-guard.js?v=20260528"></script>

<!-- Footer lazy scripts también deben tener versión -->
_loadScript('/js/utm-tracker.js?v=20260528');
_loadScript('/js/conversions.js?v=20260528');
```

**Cuándo actualizar:** cada vez que se modifica el JS. Convención: fecha del cambio `YYYYMMDD`.

## 5. DISEÑO
Colores: `#D946A6` magenta · `#D4AF37` gold · `#00d2ff` cyan · `#050505` bg · `#1a2332` card · `#00FF41` neon
Animaciones: solo en idle (requestIdleCallback). Sin loops en eco-cards. Solo fade+scroll con GSAP.

### Regla OBLIGATORIA — prefers-reduced-motion
Toda página con `animation: X infinite` DEBE incluir al final del `<style>`:
```css
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation-duration:.01ms!important;
    animation-iteration-count:1!important;
    transition-duration:.01ms!important;
  }
}
```
**Por qué:** usuarios con trastornos vestibulares pueden sufrir malestar con animaciones continuas. WCAG 2.1 SC 2.3.3.

### Regla OBLIGATORIA — color-scheme
Todas las páginas dark DEBEN tener:
```html
<meta name="color-scheme" content="dark">
```
**Por qué:** evita el flash de fondo blanco antes de que el CSS cargue.

## 6. REPORTE (al terminar tarea)
```
CAMBIOS: [archivo] → [qué] (línea X)
VERIFICADO: [grep] → [resultado]
PENDIENTE: [acción] → solo si hay algo
```
Al final de sesión: `/clear` (todo commiteado) o `/compact` (trabajo en vuelo).

## 6b. ROBOTS.TXT — bots a bloquear (lista actualizada 2026-05-28)
```
# Bots de extracción/entrenamiento sin búsqueda — BLOQUEAR
User-agent: ClaudeBot
User-agent: CCBot
User-agent: Bytespider
User-agent: FacebookBot
User-agent: Applebot-Extended    # Apple AI training (nuevo 2025)
User-agent: Diffbot              # Extracción comercial de datos
Disallow: /

# Crawlers de agencias SEO — BLOQUEAR (no aportan tráfico)
User-agent: MJ12bot
User-agent: AhrefsBot
User-agent: SemrushBot
Disallow: /

# Rutas a bloquear SIEMPRE
Disallow: /app/
Disallow: /api/          # Edge functions no deben indexarse
Disallow: /sql/
Disallow: /supabase/
Disallow: /.git/
Disallow: /MEMORY/
Disallow: /scripts/
```

## 7. PRIVACIDAD
- Formularios: checkbox Habeas Data Colombia obligatorio.
- Separar: Transaccionales (siempre) vs. Promocionales (`acepta_marketing = true`).

## 8b. AUDITORÍA WEB APP / E-COMMERCE (checklist adicional)

### 404.html — obligatorio en AMBOS proyectos
```html
<!-- Patrón mínimo — copiar de 404.html PRODIGY -->
<meta name="robots" content="noindex">
<!-- CTA principal + auto-redirect 10s + skip link + SW register -->
```

### Schema.org — tipos por contexto
| Página | Tipo obligatorio |
|---|---|
| Home personal | `Person` + `Service` |
| Servicio/landing | `Service` + `BreadcrumbList` |
| Página con FAQ accordion | + `FAQPage` (mainEntity con Q/A) |
| Contacto/soporte | `ContactPage` |
| Cotizador/calculator | `Service` + `BreadcrumbList` |

Regla: **siempre que exista un `<details>`/acordeón de FAQ visible → agregar FAQPage schema**. Google lo muestra como rich result en SERP.

### hreflang — en páginas con tráfico internacional
```html
<link rel="alternate" hreflang="es" href="https://[dominio]/[slug]">
<link rel="alternate" hreflang="en" href="https://[dominio]/[slug]?lang=en">
<link rel="alternate" hreflang="x-default" href="https://[dominio]/[slug]">
```
Obligatorio en: index, servicios principales, calculadoras, portafolio.

### dns-prefetch — fallback para preconnect
```html
<!-- Después de cada preconnect, agregar su dns-prefetch equivalente -->
<link rel="preconnect" href="https://dominio.com">
<link rel="dns-prefetch" href="https://dominio.com">
```

## 9. BOT IA (CHATBOT GEMINI) — ARQUITECTURA Y REGLAS

### Arquitectura del bot
```
Usuario → header.js (_phdrSendMsg) → fetch POST /api/gemini
                                          ↓
                               Cloudflare Pages Function
                               (functions/api/gemini.js)
                                          ↓
                               Gemini 2.0 Flash API (Google)
                               GEMINI_API_KEY en Cloudflare Env Vars
                               (nunca expuesta al cliente)
                                          ↓
                               Fallback chain: gemini-2.0-flash
                               → gemini-2.0-flash-lite
                               → gemini-1.5-flash → gemini-1.5-flash-8b
```

### Archivos clave del bot
| Archivo | Rol |
|---|---|
| `js/header.js` | UI del chat + lógica cliente + system prompt |
| `functions/api/gemini.js` | Proxy Cloudflare — guarda la API key |
| Cloudflare Env Vars | `GEMINI_API_KEY` — JAMÁS en código fuente |

### System prompt del bot — función `_pgBuildPrompt()` (línea ~844 header.js)
El prompt se construye dinámicamente incluyendo:
- Título y path de la página actual (contexto por página)
- Lista de servicios PRODIGY (CAD, fresado, 3D, alineadores, guías)
- Precios y tiempos de entrega
- Instrucción de idioma (ES/EN según cliente)
- Regla: no inventar datos → invitar a WhatsApp 573212816716

### Manejo de errores (3 casos — implementado)
```javascript
// Caso 1: Rate limit (429)
data.error.includes('solicitudes') || data.error.includes('429')
→ "Muchas consultas seguidas — espera un momento e intenta de nuevo."

// Caso 2: API key no configurada en Cloudflare
data.error.includes('configurado')
→ "El asistente está temporalmente fuera de línea. WhatsApp..."

// Caso 3: Cualquier otro error
→ Muestra detail + invita a WhatsApp
→ console.warn('[PRODIGY BOT] Sin candidatos:', JSON.stringify(data))

// Caso 4 (catch): Sin conexión de red
→ "Sin conexión ahora mismo. WhatsApp..."
```

### Rate limit en el proxy
- 5 req/min por IP (Cloudflare Cache API)
- CORS: solo dominio propio + *.pages.dev

### Causa más común del bot "roto"
`GEMINI_API_KEY` no configurada en Cloudflare Pages → Settings → Environment Variables.
El proxy devuelve `{error: 'Bot no configurado'}` → el JS muestra el mensaje de WhatsApp.
**Solución:** agregar la variable y redesplegar (Cloudflare → Deployments → Retry).

### Checklist de verificación del bot
- [ ] `GEMINI_API_KEY` configurada en Cloudflare Env Vars (ambos sitios)
- [ ] `functions/api/gemini.js` existe en el repo
- [ ] `_pgBuildPrompt()` tiene WA correcto: 573212816716 (PRODIGY) / 573219581949 (Alejandro)
- [ ] Manejo de 4 casos de error en `_phdrSendMsg`
- [ ] Rate limit 5 req/min activo en el proxy
- [ ] CORS restringe a dominio propio
- [ ] Historial de conversación: `_pgChatHistory` con rol `user`/`model` (no `assistant`)
- [ ] `system_instruction` enviada en cada request (no en contents[0])

## 10. SISTEMA DE ARTÍCULOS — ESTÁNDAR CIENTÍFICO OBLIGATORIO (ARTÍCULOS IA)

### Regla absoluta
**JAMÁS inventar, alucinar ni parafrasear sin cita verificable.**
Cada afirmación clínica o estadística DEBE tener referencia real con DOI verificable en PubMed/ScienceDirect.
Temperatura Gemini: 0.15 (mínima alucinación).

### Journals aceptados (únicos válidos como fuente)
| Journal | Especialidad | Base de datos |
|---|---|---|
| Periodontology 2000 | Periodoncia, implantología | PubMed / ScienceDirect |
| Journal of Dental Research (JDR) | Investigación multidisciplinaria | PubMed / ScienceDirect |
| Journal of Clinical Periodontology | Periodoncia clínica, implantes | PubMed / ScienceDirect |
| Journal of Dentistry | Materiales, odontología digital | ScienceDirect |
| Dental Materials | Resinas, cerámicas, metales | ScienceDirect |
| Journal of Prosthetic Dentistry (JPD) | Rehabilitación oral, prótesis | ScienceDirect |
| Am. Journal of Orthodontics (AJODO) | Ortodoncia | ScienceDirect |
| Journal of Endodontics | Endodoncia, pulpa dental | ScienceDirect |
| Clinical Oral Implants Research (COIR) | Implantología | PubMed / ScienceDirect |
| International Journal of Oral Surgery (IJOS) | Cirugía oral | PubMed |
| JADA (J. American Dental Association) | Práctica clínica general | jada.ada.org |
| Cochrane Oral Health | Revisiones sistemáticas | cochrane.org |
| SciELO Odontología | Estudios en español/portugués | scielo.org |

### Plataformas para buscar DOIs reales
- **PubMed / NCBI** — pubmed.ncbi.nlm.nih.gov (biomédico más grande del mundo)
- **ScienceDirect (Elsevier)** — sciencedirect.com (JDR, Dental Materials, JPD, etc.)
- **JADA** — jada.ada.org (American Dental Association)
- **SciELO** — scielo.org (estudios en español/portugués)

### Fuentes NO permitidas
- Wikipedia (solo para datos generales no clínicos)
- Blogs, sitios comerciales de laboratorios o fabricantes
- GPT/Gemini sin cita verificable
- Artículos sin DOI o de revistas no indexadas

### Reglas de construcción del artículo
1. Mínimo 5 secciones (h2)
2. Mínimo 4 referencias con DOI real — verificadas antes de incluir
3. Tablas de comparación DEBEN tener columna "Fuente/DOI"
4. Estadísticas numéricas (ej: "92% de supervivencia") → cita obligatoria
5. El prompt a Gemini debe listar los journals explícitamente y prohibir inventar DOIs

### Cómo se generan los artículos (pipeline actual)

**PRODIGY** (`dental-portfolio/scripts/auto-journal.js`):
- Trigger: GitHub Actions, martes y jueves 9 AM Bogotá (14:00 UTC)
- Motor: Gemini 2.0 Flash via `GEMINI_API_KEY` (secret GitHub)
- Salida: prepende objeto a `articles.js` → array `ARTICLES`
- Auto-actualiza: `sitemap.xml` con nueva URL
- Social copy: `marketing-social.txt` → GitHub Artifact (privado, 30 días)

**Alejandro CAD/CAM** (`alejandro-carvajal-site/scripts/gen-articulo-ac.js`):
- Trigger: GitHub Actions, lunes y miércoles 9 AM Bogotá (14:00 UTC)
- Motor: Gemini 2.0 Flash via `GEMINI_API_KEY` (secret GitHub)
- Salida: prepende objeto a `articles-ac.js` → array `ARTICLES_AC`
- Auto-actualiza: `sitemap.xml` con nueva URL
- Social copy: `marketing-social-ac.txt` → GitHub Artifact (privado, 30 días)

### Formato de bloque de contenido (ambos proyectos)
`article.html` / `renderContent()` acepta AMBOS formatos (legacy y nuevo):
```javascript
// Legacy (manual): { tipo, texto, cabeceras, filas }
// Nuevo (auto-journal): { t, c, headers, rows }
// renderContent() normaliza: tp = b.t || b.tipo; txt = b.c ?? b.texto
```

### Variables de entorno requeridas
- **Cloudflare Pages** (ambos sitios): `GEMINI_API_KEY` → para el chatbot bot en producción
- **GitHub Secrets** (ambos repos): `GEMINI_API_KEY` → para el cron de artículos

## 8. REFERENCIAS RÁPIDAS
- `MAP.md` — líneas exactas de funciones críticas. Leer antes de editar archivos grandes.
- `PENDIENTES.md` — solo tareas ⏳/🔴/🟡. Orden: 0-SQL → 1-Home → 2-Portafolio → 3-Servicios → 4-Flujos → 5-Soporte → 6-Empresa → 7-Portal → 8-SEO.
- `VERIFICAR.md` — protocolo que sigue Alejandro para reportar resultados.
