# PRODIGY — Estándares Técnicos Definitivos
> Resultado de auditoría autónoma completa (rounds 1–15, Abr 2026).
> Aplicar TODO esto al crear páginas nuevas o implementaciones nuevas.
> **Actualizar este archivo cada vez que se implemente un nuevo patrón.**
> Última actualización: 2026-04-29

## ESTADO ACTUAL DEL PROYECTO (2026-04-29 — round 23)
- ✅ **SEO 66→92+** — canonical article.html vacío corregido, href="#" reemplazados por URLs reales, hreflang x-default en 3 páginas, FAQPage JSON-LD en soporte-tecnico.html
- ✅ **Gemini API** movida a Cloudflare Function `/api/gemini` — clave nunca expuesta en cliente
- ✅ **Stripe Checkout** vía Cloudflare Function `/api/stripe-checkout` — 100% cliente nuevo, 50% existente
- ✅ **Lemon Squeezy eliminado** — scripts, funciones, CSP domains completamente purgados
- ✅ **UTM Tracker** `js/utm-tracker.js` — captura gclid/fbclid/utm_* → Supabase lead_sources
- ✅ **Conversions** `js/conversions.js` — GA4 events + Meta Pixel lazy (requiere reemplazar IDs)
- ✅ **Geo-detect** `js/geo-detect.js` — ipapi.co → banner inglés para visitantes internacionales
- ✅ **22 artículos Journal** — 100% cobertura en sitemap.xml
- ✅ **SW v11** — precache: /diseno-remoto, /en/global-design, /soporte-tecnico, /alejandro
- ✅ **Alejandro.html NOINDEX** — suspendida hasta tener dominio propio
- ⚠️ **Pendiente Alejandro**: GEMINI_API_KEY + STRIPE_SECRET_KEY en Cloudflare env vars
- ⚠️ **Pendiente Alejandro**: Reemplazar TU_PIXEL_ID y AW-XXXXXXXXX en js/conversions.js

## REGLA: Cloudflare Pages Functions (API proxy)
```javascript
// functions/api/mi-funcion.js
export async function onRequestPost(context) {
  const { request, env } = context;
  const apiKey = env.MI_API_KEY; // Nunca en código JS público
  // CORS solo a dominio propio:
  const corsH = { 'Access-Control-Allow-Origin': 'https://prodigylabdental.com' };
  // Rate limit vía CF cache si es necesario
}
// Agregar dominio API a _headers connect-src
// Agregar env var en Cloudflare Pages → Settings → Environment variables
```

## REGLA: UTM Tracking (js/utm-tracker.js)
```javascript
// Captura automática al cargar página
// Persiste en localStorage key 'prodigy_utm'
// Inyectar en mensajes WA:
const utm = window.ProdigyUTM && ProdigyUTM.get();
const source = utm ? `[via ${utm.source}]` : '';
// Guardar lead en Supabase:
window.ProdigyUTM.saveLeadSource({ phone, service });
// Tabla: lead_sources (ejecutar sql/migrate-lead-sources.sql)
```

## REGLA: GA4 Conversions (js/conversions.js)
```javascript
// Eventos estándar disponibles:
window.ProdigyConv.whatsapp(service);   // whatsapp_click
window.ProdigyConv.upload();            // stl_upload
window.ProdigyConv.cotizacion(val);     // cotizacion_sent
window.ProdigyConv.lead();              // lead_qualified
// Reemplazar antes de activar:
// AW-XXXXXXXXX → ID Google Ads (cuando actives campaña)
// TU_PIXEL_ID  → ID Meta Pixel (cuando actives campaña FB)
```

## REGLA: Geo-detect (js/geo-detect.js)
```javascript
// Se carga desde footer.js automáticamente
// Detecta país vía ipapi.co/json/
// Colombia → sin banner
// Resto → banner "View in English" → /en/global-design
// Acceso programático:
const geo = await window.ProdigyGeo.get(); // { country_code, country_name, ... }
```

## REGLA: Stripe Checkout (flujo-diseno.html + /api/stripe-checkout)
```javascript
// Cliente nuevo (0 pedidos no-cancelados en BD) → cobra 100%
// Cliente existente → cobra 50% (abono)
// Llamada:
const res = await fetch('/api/stripe-checkout', {
  method: 'POST',
  body: JSON.stringify({ amount_cop, descripcion, doctor_id })
});
// Redirige a Stripe Checkout URL
// STRIPE_SECRET_KEY en Cloudflare env vars (nunca en código)
// Dominios CSP requeridos en _headers:
// script-src: js.stripe.com
// connect-src: api.stripe.com
// frame-src: hooks.stripe.com
```

## ESTADO ACTUAL DEL PROYECTO (2026-04-24 — round 20 — BUGS CRÍTICOS)
- ✅ **SW v7** — invalida cache con mantenimiento.html servido desde SW anterior
- ✅ **CSP `connect-src`** — añadido `generativelanguage.googleapis.com` (bot IA bloqueado por CSP) y `accounts.google.com` + `*.googleapis.com` (Google OAuth bloqueado)
- ✅ **CSP `frame-src`** — añadido `accounts.google.com` para Google Sign-In popup
- ✅ **0 referencias locales rotas** — favicon.ico, logo-prodigy.png, patients-data.js, main.js
- ✅ **app/sw.js** — icono push `/favicon.ico` → `/assets/icons/icon-192.png`
- ⚠️ **Para Alejandro**: Hard refresh `Ctrl+Shift+R` para forzar nuevo SW inmediatamente

## REGLA: Nuevas APIs externas en el bot o funciones
```
# Agregar siempre a _headers connect-src cuando se añada una API fetch nueva:
# generativelanguage.googleapis.com — Gemini AI (bot)
# accounts.google.com — Google OAuth
# *.googleapis.com — Google APIs en general
```

## ESTADO ACTUAL DEL PROYECTO (2026-04-24 — round 19)
- ✅ **CERO** referencias locales rotas (assets, scripts, imágenes) — verificado con scanner
- ✅ `favicon.ico` / `logo-prodigy.png` (no existían) → SVG inline en mensajero, index, mantenimiento
- ✅ `portal.html` cargaba `patients-data.js` y `main.js` desde ruta incorrecta → corregido a `js/`
- ✅ `app/sw.js` push icon usaba `/favicon.ico` (no existe) → `/assets/icons/icon-192.png`
- ✅ `agregar-caso.html` valida magic bytes también en archivos de carpeta Exocad

## REGLA: Al agregar scripts en HTML
```html
<!-- Rutas de scripts JS: usar prefijo js/ explícitamente, no relativo -->
<script src="js/mi-script.js"></script>       <!-- ✅ -->
<script src="mi-script.js"></script>          <!-- ❌ si el archivo está en js/ -->
```

## ESTADO ACTUAL DEL PROYECTO (2026-04-24 — round 18 — ESTADO FINAL)
- ✅ **CERO .html** en URLs navegables — verificado con scan global de TODO el proyecto
- ✅ Todas las páginas públicas y app/ tienen favicon, theme-color, manifest
- ✅ `patient.html` tiene SW registration, favicon, theme-color y manifest
- ✅ Flujos internos (flujo-diseno/fresado/impresion/lab) tienen clean URLs en `_redirects`
- ✅ `upload-guard.js` + `validateMagicBytes` en TODOS los puntos de upload
- ✅ Favicon 💎 en todas las páginas (incluyendo contacto.html y flujo-lab.html)

## ESTADO ACTUAL DEL PROYECTO (2026-04-24 — round 17)
- ✅ Todas las páginas `app/` tienen `<meta name="theme-color" content="#D946A6">`
- ✅ Todas las páginas `app/` tienen `<link rel="manifest" href="/manifest.json">`
- ✅ Todas las páginas `app/` tienen preconnect para cdnjs/jsdelivr/supabase
- ✅ `beforeinstallprompt` PWA en `instalar-app.html` y `success.html`
- ✅ `upload-guard.js` + `validateMagicBytes` en TODOS los puntos de upload: flujo-* (4), envia-tu-scanner, agregar-caso
- ✅ `.claude/settings.json` → `Bash(*)` — cero prompts de permiso

## REGLA: Todo upload a Supabase Storage
```javascript
// SIEMPRE cargar upload-guard.js en la página
// SIEMPRE verificar antes del .upload():
if (window.validateMagicBytes) {
    const mb = await validateMagicBytes(file);
    if (!mb.safe) { /* mostrar error, return */ }
}
```

## ESTADO ACTUAL DEL PROYECTO (2026-04-24)
- ✅ **CERO** `.html` en URLs navegables — verificado con scan global de todo el proyecto
- ✅ **CERO** XSS con datos de Supabase/usuario sin escapar (escH aplicado en todos los innerHTML)
- ✅ **CERO** buckets de Storage sin políticas RLS
- ✅ **CERO** tablas de BD con RLS sin `TO authenticated`
- ✅ GA4 Consent Mode v2 en 21 páginas públicas
- ✅ Cookie banner con botón Rechazar funcional
- ✅ PWA install prompt en instalar-app.html
- ⚠️ **PENDIENTE (requiere Alejandro):** ejecutar 5 patches SQL en Supabase (ver PENDIENTES.md)

---

## 1. CHECKLIST PÁGINA PÚBLICA NUEVA

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#D946A6">          <!-- OBLIGATORIO -->
  <link rel="manifest" href="/manifest.json">           <!-- OBLIGATORIO -->
  <title>Título max 60 chars — PRODIGY Lab Dental</title>
  <meta name="description" content="...">              <!-- max 160 chars -->
  <meta property="og:title" content="...">
  <meta property="og:description" content="...">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://prodigylabdental.com/SLUG-LIMPIO">   <!-- sin .html -->
  <meta property="og:image" content="https://prodigylabdental.com/assets/prodigy-preview.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="https://prodigylabdental.com/SLUG-LIMPIO">        <!-- sin .html -->

  <!-- preconnect para CDNs que usa esta página -->
  <link rel="preconnect" href="https://cdnjs.cloudflare.com">
  <!-- si usa Google Fonts: -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <!-- si usa Supabase: -->
  <link rel="preconnect" href="https://zgihrwqfyvgyapbwzkvw.supabase.co">
  <!-- si usa jsdelivr: -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net">

  <!-- GA4 Consent Mode v2 — SIEMPRE antes del script async de GA4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-3N0ZZE5V10"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
  gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',wait_for_update:500});
  gtag('js',new Date());gtag('config','G-3N0ZZE5V10',{anonymize_ip:true});</script>

  <!-- JSON-LD estructurado (opcional pero recomendado) -->
  <script type="application/ld+json">{ ... }</script>

  <!-- CSS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/global-nav.min.css">
</head>
<body>
  <!-- PRIMER elemento: header compartido -->
  <script src="js/header.js?v=20260424"></script>

  <!-- CONTENIDO de la página aquí -->

  <!-- noscript fallback OBLIGATORIO -->
  <noscript><p style="text-align:center;padding:2rem;color:#94a3b8">Esta página requiere JavaScript.
  <a href="https://wa.me/573212816716" style="color:#D946A6">Contáctanos por WhatsApp</a>.</p></noscript>

  <!-- UX Floaters: scroll-top + theme + WhatsApp -->
  <div class="ux-floaters">
    <button class="ux-btn" id="scroll-top-btn" onclick="window.scrollTo({top:0,behavior:'smooth'})"
      title="Volver arriba" aria-label="Volver arriba"><i class="fas fa-arrow-up"></i></button>
    <button class="ux-btn" id="theme-btn" onclick="toggleTheme()"
      title="Modo claro/oscuro" aria-label="Cambiar modo claro/oscuro">🌙</button>
    <a href="https://wa.me/573212816716?text=Hola%20PRODIGY%2C%20necesito%20soporte."
      class="ux-btn" target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp"
      style="background:rgba(37,211,102,0.12);border-color:rgba(37,211,102,0.4);">
      <i class="fab fa-whatsapp" aria-hidden="true" style="color:#25D366;"></i></a>
  </div>
  <script>(function(){function t(){var l=document.body.classList.toggle('light-mode');var b=document.getElementById('theme-btn');if(b)b.textContent=l?'☀️':'🌙';localStorage.setItem('theme',l?'light':'dark');}window.toggleTheme=t;if(localStorage.getItem('theme')==='light'){document.body.classList.add('light-mode');var b=document.getElementById('theme-btn');if(b)b.textContent='☀️';}window.addEventListener('scroll',function(){var s=document.getElementById('scroll-top-btn');if(s)s.classList.toggle('visible',window.scrollY>400);});})();</script>

  <!-- Footer compartido — ÚLTIMO antes de </body> -->
  <script src="js/footer.js?v=20260424"></script>

  <!-- Service Worker -->
  <script>if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});</script>
</body>
</html>
```

### Tareas adicionales al crear página pública
1. **`_redirects`**: añadir `  /SLUG-LIMPIO   /pagina.html   200`
2. **`sitemap.xml`**: añadir entrada con URL limpia y `<lastmod>YYYY-MM-DD</lastmod>`
3. **`sw.js` PRECACHE**: añadir `'/SLUG-LIMPIO'` al array (usar clean URL, NO .html)
4. **`js/header.js`**: añadir link de nav si la página va en el menú
5. **`js/footer.js`**: añadir link si la página va en el footer
6. **`robots.txt`**: si es noindex, añadir `Disallow: /SLUG-LIMPIO`

---

## 2. CHECKLIST PÁGINA APP (interna, autenticada)

```html
<head>
  <meta name="robots" content="noindex, nofollow">  <!-- OBLIGATORIO -->
  <!-- NO incluir GA4 en páginas de app -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  <script src="../js/auth-guard.js"></script>        <!-- DESPUÉS de supabase.js -->
</head>
<body style="visibility:hidden">                     <!-- ocultar hasta auth -->
<script>ProdigyAuth.require('ROLE','/app/login.html?redirect='+encodeURIComponent(location.pathname));</script>
```

- NO incluir `header.js` ni `footer.js` — las páginas app tienen su propio layout
- NO incluir GA4
- SÍ incluir `<meta name="viewport">` y `<meta charset="UTF-8">`
- SÍ incluir `<html lang="es">`

---

## 3. SEGURIDAD — REGLAS ABSOLUTAS

### 3a. XSS — Escapado de datos en innerHTML

**SIEMPRE** escapar antes de insertar en `innerHTML`:

```javascript
// Función estándar — copiar en cada archivo que la necesite
function escH(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// USO:
el.innerHTML = `<span>${escH(datoDeSuabase)}</span>`;   // ✅ CORRECTO
el.innerHTML = `<span>${datoDeSuabase}</span>`;           // ❌ INCORRECTO
```

**Alternativa segura cuando solo hay texto:** usar `el.textContent = valor` (no interpreta HTML).

### 3b. URLs en atributos href/src/iframe.src

```javascript
// href con URL externa del usuario o BD:
const safe = url.startsWith('https://') ? url : null;
if (safe) el.href = escH(safe);

// iframe.src con URL externa:
try {
  const u = new URL(link);
  if (u.protocol !== 'https:') throw new Error();  // ← CRÍTICO: new URL() acepta javascript:
  iframe.src = link;
} catch { toast('URL inválida', 'error'); return; }

// YouTube iframe (solo en articles.js):
const ytId = /^[\w-]{5,20}$/.test(b.youtube||'') ? b.youtube : '';
```

### 3c. Uploads de archivos — OBLIGATORIO

```javascript
// Siempre antes de sb.storage.from().upload():
if (window.validateUpload) {
  const r = validateUpload(file, 'CAD'); // o 'COMPROBANTE' o 'FOTO_SALIDA'
  if (!r.valid) { showUploadError(r.error); return; }
}
if (window.validateMagicBytes) {
  const mb = await validateMagicBytes(file);
  if (!mb.safe) { showUploadError(mb.error); return; }
}
```

Tipos disponibles en `upload-guard.js`: `'CAD'` (STL/OBJ/PLY), `'COMPROBANTE'` (JPG/PNG/PDF), `'FOTO_SALIDA'` (imágenes).

### 3d. CSV exports — Prevenir formula injection

```javascript
function csvCell(v) {
  const s = String(v ?? '');
  const safe = /^[=+\-@]/.test(s) ? "'" + s : s;  // prefijo apostrophe si empieza con =+-@
  return /[",\n\r]/.test(safe) ? '"' + safe.replace(/"/g,'""') + '"' : safe;
}
// USO: rows.map(r => r.map(csvCell).join(','))
```

### 3e. Edge Functions (Supabase/Deno)

```typescript
// CORS — NUNCA usar "*", siempre el dominio explícito:
const CORS = {
  "Access-Control-Allow-Origin": "https://prodigylabdental.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Secrets — fallar HARD si no están configurados:
const SECRET = Deno.env.get("MI_SECRET");
if (!SECRET) return new Response("Secret no configurado", { status: 500 });
```

### 3f. RLS en SQL (Supabase)

```sql
-- NUNCA esto (anon puede leer):
CREATE POLICY "admin_all" ON mi_tabla FOR ALL USING (true);

-- SIEMPRE especificar TO:
CREATE POLICY "admin_all" ON mi_tabla FOR ALL TO authenticated USING (true);

-- INSERT público (formularios de captación):
CREATE POLICY "public_insert" ON mi_tabla
  FOR INSERT TO anon, authenticated WITH CHECK (true);
```

### 3g. Storage Buckets — Políticas obligatorias

Cada bucket necesita 3 políticas SQL:

```sql
-- Upload: solo el dueño (authenticated)
CREATE POLICY "upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'mi-bucket' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Lectura: pública si el bucket es público, o solo admin si privado
CREATE POLICY "read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'mi-bucket');

-- Eliminación: solo admin
CREATE POLICY "delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'mi-bucket' AND auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com'));
```

---

## 4. PRIVACIDAD / GDPR

### 4a. GA4 Consent Mode v2 — OBLIGATORIO en toda página con GA4

```html
<!-- Este bloque COMPLETO, en este orden exacto: -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3N0ZZE5V10"></script>
<script>
  window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
  gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',wait_for_update:500});
  gtag('js',new Date());
  gtag('config','G-3N0ZZE5V10',{anonymize_ip:true});
</script>
```

El botón "Aceptar" y "Rechazar" ya están en `footer.js` — llaman a `gtag('consent','update',...)` automáticamente.

### 4b. Formularios de captación — Habeas Data Colombia

```html
<!-- Obligatorio en CUALQUIER formulario que capture datos personales: -->
<label style="display:flex;gap:8px;align-items:flex-start;font-size:.8rem;color:#94a3b8;">
  <input type="checkbox" required name="habeas_data">
  <span>Autorizo el tratamiento de mis datos para gestión de pedidos.
  Acepto recibir novedades y promociones (opcional).
  Puedo darme de baja sin afectar seguimiento de caso.</span>
</label>
<!-- Marketing opcional (separado del transaccional): -->
<label>
  <input type="checkbox" name="acepta_marketing">
  Acepto recibir novedades y promociones
</label>
```

### 4c. Ley 50/50 (flujos de pago)

Toda página de cotización o pedido DEBE mostrar y calcular:
- "50% abono para inicio de labores · 50% saldo contra entrega"
- El resumen de cotización muestra el abono automáticamente
- El mensaje de WhatsApp incluye: Total, Abono (50%), Saldo (50%)

---

## 5. URLs LIMPIAS (sin .html)

### 5a. Al crear página nueva

1. El archivo puede llamarse `mi-pagina.html` en disco
2. Añadir en `_redirects`:
   ```
   /mi-pagina   /mi-pagina.html   200
   ```
3. Canonical y og:url → `https://prodigylabdental.com/mi-pagina`
4. Sitemap → `https://prodigylabdental.com/mi-pagina`
5. Links internos → `href="mi-pagina"` (sin .html)
6. `sw.js` PRECACHE → `'/mi-pagina'` (sin .html)
7. robots.txt si aplica → `Disallow: /mi-pagina`
8. En Cloudflare Dashboard → Redirect Rules: `/mi-pagina.html` → 301 → `/mi-pagina`

### 5b. Links internos — regla general

```html
<!-- ✅ CORRECTO -->
<a href="nosotros">Nosotros</a>
<a href="/nosotros">Nosotros</a>

<!-- ❌ INCORRECTO -->
<a href="nosotros.html">Nosotros</a>
<a href="/nosotros.html">Nosotros</a>

<!-- EXCEPCIÓN: flujos internos (noindex) pueden seguir con .html: -->
<a href="flujo-fresado.html">Pedir Fresado</a>  <!-- OK — es página de pedido autenticado -->
<a href="app/login.html">Login</a>              <!-- OK — app pages no tienen clean URL -->
```

---

## 6. ACCESIBILIDAD (WCAG AA)

### 6a. Imágenes

```html
<!-- Imagen informativa: -->
<img src="..." alt="Descripción clara del contenido">

<!-- Imagen decorativa: -->
<img src="..." alt="">

<!-- Imagen de preview (JS-generated): -->
<img class="foto-thumb" src="${url}" alt="">
```

### 6b. Botones icon-only — SIEMPRE con aria-label

```html
<button onclick="..." title="Volver arriba" aria-label="Volver arriba">
  <i class="fas fa-arrow-up"></i>
</button>

<!-- Botón cerrar modal: -->
<button onclick="cerrar()" aria-label="Cerrar">✕</button>
```

### 6c. Selects sin label visible

```html
<!-- Dentro de innerHTML dinámico — añadir aria-label: -->
`<select aria-label="Estado del pedido" onchange="cambiarEstado('${id}',this.value)">`
```

### 6d. Inputs — autocomplete obligatorio

```html
<input type="text"     name="nombre"   autocomplete="name">
<input type="email"    name="email"    autocomplete="email">
<input type="tel"      name="tel"      autocomplete="tel"        inputmode="tel">
<input type="text"     name="clinica"  autocomplete="organization">
<input type="text"     name="ciudad"   autocomplete="address-level2">
<input type="password" name="pass"     autocomplete="current-password" spellcheck="false">
<input type="password" name="newpass"  autocomplete="new-password"     spellcheck="false">
```

### 6e. WCAG contraste (textos sobre fondo oscuro)

```css
/* ✅ CORRECTO — contraste AAA (7.6:1) sobre #0d1520 */
color: #94a3b8;

/* ❌ INCORRECTO — contraste insuficiente */
color: #64748b;   /* 3.76:1 — FALLA */
color: #475569;   /* 2.5:1  — FALLA */
color: #334155;   /* 2.0:1  — FALLA */
```

---

## 7. PERFORMANCE

### 7a. Preconnect para CDNs

```html
<!-- Google Fonts (si la página los usa): -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Supabase (si la página hace queries): -->
<link rel="preconnect" href="https://zgihrwqfyvgyapbwzkvw.supabase.co">

<!-- jsDelivr (si la página carga Supabase JS): -->
<link rel="preconnect" href="https://cdn.jsdelivr.net">

<!-- cdnjs (Font Awesome — en todas): -->
<link rel="preconnect" href="https://cdnjs.cloudflare.com">

<!-- unpkg (QR scanner — en inventario/mensajero/taller): -->
<link rel="preconnect" href="https://unpkg.com">
```

### 7a-2. Preconnect para páginas APP (internas)

```html
<!-- Toda página app/ DEBE tener estas 3 líneas antes de cargar CDNs: -->
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preconnect" href="https://zgihrwqfyvgyapbwzkvw.supabase.co">
<!-- Si también usa unpkg (inventario, mensajero, taller): -->
<link rel="preconnect" href="https://unpkg.com">
```

### 7b. Scripts duplicados — PROHIBIDO

```html
<!-- Si la página ya cargó supabase.js para auth-guard, NO cargarlo de nuevo: -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/..."></script>
<script src="../js/auth-guard.js"></script>
<!-- ❌ NO repetir: <script src="...supabase.js"></script> más abajo -->
```

### 7c. Cache-busting en header.js y footer.js

```html
<!-- Siempre con versión — actualizar la fecha cuando modifiques header.js o footer.js: -->
<script src="js/header.js?v=20260424"></script>
<script src="js/footer.js?v=20260424"></script>
```

---

## 8. SEO — Structured Data

### 8a. Breadcrumb (todas las páginas con contenido)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type":"ListItem","position":1,"name":"Inicio","item":"https://prodigylabdental.com/"},
    {"@type":"ListItem","position":2,"name":"Nombre Página","item":"https://prodigylabdental.com/SLUG-LIMPIO"}
  ]
}
```

### 8b. Reglas de títulos

- Máximo **60 caracteres**
- Formato: `Título Descriptivo — PRODIGY Lab Dental`
- Incluir keyword principal al inicio

### 8c. URLs absolutas en JSON-LD — SIEMPRE clean (sin .html)

```json
{ "url": "https://prodigylabdental.com/nosotros" }
```

---

## 9. COLORES OFICIALES

```css
--gold-primary:  #D946A6;   /* Magenta PRODIGY — botones, acentos principales */
--gold-hover:    #D4AF37;   /* Dorado — hover states, decoración */
--accent-cyan:   #00d2ff;   /* Cyan — elementos digitales/tech */
--bg-darker:     #050505;   /* Fondo principal */
--bg-card:       #0d1525;   /* Fondo de tarjetas */
--neon-green:    #00FF41;   /* Verde — estados activos/conectado */
--text-muted:    #94a3b8;   /* Texto secundario — WCAG AAA ✅ */
--text-body:     #e2e8f0;   /* Texto principal */
```

---

## 10. BRAND — REGLAS ABSOLUTAS

- **PRODIGY** → SIEMPRE en mayúsculas. Nunca "ProDigy", "Prodigy", "prodigy"
- **PRODIGY Lab Dental** → nombre completo para og:site_name y JSON-LD
- **PRODIGY Digital Dentistry** → para taglines y descripciones largas
- Logo en CSS/código: `letter-spacing: 3px; font-weight: 900;`

---

## 11. CSP (_headers) — DOMINIOS APROBADOS

Si necesitas cargar un recurso de un dominio nuevo, añadirlo a `_headers` en la directiva correcta:

| Tipo de recurso | Directiva CSP |
|---|---|
| Scripts JS externos | `script-src` |
| Iframes (YouTube, PDFs, mapas) | `frame-src` |
| APIs fetch/XHR | `connect-src` |
| Imágenes de CDN | `img-src` |
| Fuentes tipográficas | `font-src` |
| CSS externo | `style-src` |

Dominios ya aprobados: cdnjs, jsdelivr, unpkg, supabase, paypal, lemonsqueezy, googletagmanager, google-analytics, youtube, openstreetmap, paddle, drive.google, docs.google.

---

## 12. PÁGINAS DE FLUJO (pedidos, órdenes)

Las páginas `flujo-*.html` y `flujo-lab.html` son **noindex** (autenticadas):
- NO van en sitemap
- NO tienen clean URL en `_redirects`
- SÍ tienen auth-guard y `<meta name="robots" content="noindex,nofollow">`
- SÍ cargan `upload-guard.js` y `js/pagos.js`
- SÍ tienen Ley 50/50

---

## 13. EDGE FUNCTIONS NUEVAS

Checklist al crear una Edge Function nueva:

```typescript
// 1. CORS restringido
const CORS = { "Access-Control-Allow-Origin": "https://prodigylabdental.com", ... };

// 2. Secrets → fallar hard si no configurados
const SECRET = Deno.env.get("MI_SECRET");
if (!SECRET) return new Response("Secret no configurado", { status: 500 });

// 3. Validar método HTTP
if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

// 4. Parsear body con try/catch
let body; try { body = await req.json(); } catch { return json({ error: "JSON inválido" }, 400); }

// 5. No concatenar strings en queries SQL — usar parámetros siempre
```

---

## 14. SQL — NUEVAS TABLAS

Checklist para cada tabla nueva:

```sql
-- 1. RLS activado
ALTER TABLE mi_tabla ENABLE ROW LEVEL SECURITY;

-- 2. Política de INSERT (si pública):
CREATE POLICY "public_insert" ON mi_tabla
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 3. Política de SELECT (NUNCA sin TO):
CREATE POLICY "admin_read" ON mi_tabla
  FOR ALL TO authenticated USING (true);  -- ← TO authenticated OBLIGATORIO

-- 4. Índices en columnas de búsqueda frecuente
CREATE INDEX IF NOT EXISTS idx_tabla_campo ON mi_tabla(campo);
```

---

## 15. VERIFICACIÓN RÁPIDA AL TERMINAR UNA TAREA

```bash
# 1. Sin colores de bajo contraste
grep -rn "color:#64748b\|color:#475569\|color:#334155" *.html

# 2. Sin innerHTML con datos sin escapar  
grep -n "innerHTML.*\${" archivo.html | grep -v "escH\|esc(\|escHtml"

# 3. Sin target=_blank sin noopener
grep -n 'target="_blank"' archivo.html | grep -v "noopener"

# 4. JSON-LD válido
node -e "const fs=require('fs');const c=fs.readFileSync('archivo.html','utf8');const m=c.match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g)||[];m.forEach(s=>{try{JSON.parse(s.replace(/<\/?script[^>]*>/g,''))}catch(e){console.log('INVALID JSON-LD:',e.message)}})"

# 5. Sin .html en URLs absolutas (canonical, og:url, JSON-LD)
grep "prodigylabdental.com.*\.html" archivo.html

# 6. RLS SQL — políticas con TO authenticated
grep "FOR ALL USING (true)" *.sql | grep -v "TO authenticated"

# 7. Storage buckets — todos tienen política INSERT
node -e "const fs=require('fs');const inCode=new Set();const withP=new Set();fs.readdirSync('.').filter(f=>f.endsWith('.html')||f.endsWith('.js')).forEach(f=>{(fs.readFileSync(f,'utf8').match(/storage\.from\('([^']+)'\)/g)||[]).forEach(m=>{inCode.add(m.match(/'([^']+)'/)[1])})});fs.readdirSync('sql').filter(f=>f.endsWith('.sql')).forEach(f=>{(fs.readFileSync('sql/'+f,'utf8').match(/bucket_id\s*=\s*'([^']+)'/g)||[]).forEach(m=>{withP.add(m.match(/'([^']+)'/)[1])})});const missing=[...inCode].filter(b=>!withP.has(b));console.log('Buckets sin políticas:',missing.length?missing:'NINGUNO ✅')"

# 8. Sin .html en links internos
node -e "const fs=require('fs');const slugs=['nosotros','soporte','catalogo','portafolio','calculadora','journal','diseno-cad','fresado-cam','envia-tu-scanner','escaner-domicilio','instalar-app','terminos-y-legal','seguimiento-caso','article','patient'];let ok=true;fs.readdirSync('.').filter(f=>f.endsWith('.html')&&!f.includes('ESTANDARES')).forEach(f=>{const c=fs.readFileSync(f,'utf8');c.split('\n').forEach((l,i)=>{if(l.trim().startsWith('//')||l.trim().startsWith('#'))return;slugs.forEach(s=>{if(l.includes(s+'.html')&&!l.includes('js/')&&!l.includes('recurso_descargado')&&!l.includes('article.html lo')){console.log(f+':'+(i+1),l.trim().slice(0,70));ok=false;}})})});if(ok)console.log('✅ Sin .html en links internos')"
```

---

## 16. CLEAN URLs — IMPLEMENTACIÓN COMPLETA

### 16a. IMPORTANTE — Cloudflare Pages sirve clean URLs nativamente

**No se necesitan rewrites en `_redirects` para clean URLs.** Cloudflare Pages automáticamente sirve:
- `/nosotros` → desde `nosotros.html`
- `/journal` → desde `journal.html`
- etc.

Los rewrites `200` en `_redirects` **causan redirect loops** porque Cloudflare los procesa doblemente. **No agregar rewrites 200 para páginas HTML.**

Los links internos `href="nosotros"` (sin .html) funcionan directamente.

### 16b. Archivos a actualizar al crear página nueva

| Archivo | Qué hacer |
|---|---|
| `_redirects` | `  /mi-pagina   /mi-pagina.html   200` |
| `sitemap.xml` | URL sin `.html` + `<lastmod>` |
| `sw.js` PRECACHE | `'/mi-pagina'` (sin .html) |
| `robots.txt` | `Disallow: /mi-pagina` si es noindex |
| HTML canonical | `https://prodigylabdental.com/mi-pagina` |
| HTML og:url | `https://prodigylabdental.com/mi-pagina` |
| JSON-LD url/item | `https://prodigylabdental.com/mi-pagina` |
| Links internos | `href="mi-pagina"` (sin .html) |
| manifest.json shortcuts | `"url": "/mi-pagina"` si aplica |

### 16b. Redirect de .html → clean (Cloudflare Dashboard)

Los archivos estáticos tienen precedencia sobre `_redirects`, por eso NO funciona poner `nosotros.html → /nosotros` en `_redirects`. Hacerlo en Cloudflare Dashboard:

**Cloudflare Dashboard → Rules → Redirect Rules → Create Rule:**
- Nombre: "Remove .html extension"
- When: `URI Path ends with ".html" AND URI Path does not contain "/app/"`
- Then: Dynamic Redirect 301
- URL: `concat(slice(http.request.uri.path, 0, len(http.request.uri.path) - 5), http.request.uri.query)`

### 16c. Páginas de redirección simples (como contacto.html)

Para una URL antigua que debe redirigir a otra:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <link rel="canonical" href="https://prodigylabdental.com/nosotros#contacto">
  <meta http-equiv="refresh" content="0;url=/nosotros#contacto">
  <script>window.location.replace('/nosotros#contacto');</script>
  <title>Redirigiendo...</title>
</head>
<body>
  <p>Redirigiendo… <a href="/nosotros#contacto">Haz clic aquí si no eres redirigido.</a></p>
</body>
</html>
```

Y en `_redirects`: `/contacto   /nosotros#contacto   301`

---

## 17. PWA — INSTALL PROMPT NATIVO

En `instalar-app.html` o cualquier página con CTA de instalación:

```javascript
// Capturar el evento antes de que Chrome lo descarte
let _deferredInstall = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  _deferredInstall = e;
  document.getElementById('pwa-install-btn').style.display = 'inline-flex';
});
window.addEventListener('appinstalled', () => {
  const btn = document.getElementById('pwa-install-btn');
  if (btn) { btn.textContent = '✅ App instalada'; btn.disabled = true; }
  _deferredInstall = null;
});
window.triggerInstall = function() {
  if (!_deferredInstall) return;
  _deferredInstall.prompt();
  _deferredInstall.userChoice.then(r => {
    if (r.outcome === 'accepted') { /* opcional: analytics */ }
    _deferredInstall = null;
  });
};
```

```html
<!-- Botón oculto por defecto — aparece solo si el browser lo permite -->
<button id="pwa-install-btn" onclick="triggerInstall()" style="display:none;">
  <i class="fas fa-download"></i> Instalar en este dispositivo
</button>
```

**Condiciones para que aparezca:** HTTPS, manifest.json válido, SW registrado, usuario no ha instalado ya, Chrome/Edge en Android o Desktop.

---

## 18. NUEVO STORAGE BUCKET — CHECKLIST

Al crear un bucket nuevo en Supabase:

1. **SQL:** ejecutar en SQL Editor:

```sql
-- Crear bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('mi-bucket', 'mi-bucket', false, LIMITE_EN_BYTES, ARRAY['image/jpeg','image/png'])
ON CONFLICT (id) DO UPDATE SET public=false;

-- Políticas (ver sección 3g)
CREATE POLICY "upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'mi-bucket' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "read" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'mi-bucket');
CREATE POLICY "delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'mi-bucket' AND auth.email() IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com'));
```

2. **JavaScript:** validar antes de upload:

```javascript
if (window.validateUpload) {
  const r = validateUpload(file, 'FOTO_SALIDA'); // ajustar tipo
  if (!r.valid) { showUploadError(r.error); return; }
}
if (window.validateMagicBytes) {
  const mb = await validateMagicBytes(file);
  if (!mb.safe) { showUploadError(mb.error); return; }
}
const { error } = await sb.storage.from('mi-bucket').upload(path, file, { upsert: true });
```

3. **CSP:** si el bucket es público (getPublicUrl), añadir `https://*.supabase.co` a `img-src` en `_headers` (ya está).

---

## 20. STRIPE CHECKOUT — PATRÓN DE PAGO

### Cuándo usar
Toda página de flujo de pedido que cobre dinero. Reemplaza Lemon Squeezy (dado de baja 2026-04-29).

### Regla de cobro
- **Cliente nuevo** (0 pedidos en Supabase): 100% upfront
- **Cliente existente**: 50% abono al iniciar · 50% contra entrega

### Implementación frontend

```javascript
// 1. Detectar tipo de cliente
async function detectarTipoCliente() {
    const sb = getSupabase();
    const user = (await sb.auth.getUser())?.data?.user;
    if (!user) return true; // sin sesión = nuevo
    const { count } = await sb.from('pedidos')
        .select('*', { count:'exact', head:true })
        .eq('doctor_uid', user.id).neq('estado','Cancelado');
    return count === 0;
}

// 2. Llamar al proxy Cloudflare Function
const res = await fetch('/api/stripe-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        amount_cop:       total,       // monto total del pedido en COP
        description:      'Servicio · X unidades',
        pedido_id:        orderId,
        doctor_email:     email,
        es_nuevo_cliente: esNuevo,     // boolean
        success_url:      'https://prodigylabdental.com/app/success.html?pedido=' + orderId + '&session_id={CHECKOUT_SESSION_ID}',
        cancel_url:       window.location.href
    })
});
const { url } = await res.json();
if (url) window.location.href = url;
```

### Cloudflare Function: /functions/api/stripe-checkout.js
- Lee `STRIPE_SECRET_KEY` de env vars (nunca en código)
- Aplica cobrar_pct: nuevo → 1.0, existente → 0.5
- Crea Stripe Checkout Session en COP
- CORS restringido a prodigylabdental.com

### Variable de entorno requerida
```
Cloudflare Pages → Settings → Environment variables:
STRIPE_SECRET_KEY = sk_live_...  (Production)
STRIPE_SECRET_KEY = sk_test_...  (Preview)
```

### CSP requerido en _headers
```
script-src: https://js.stripe.com
connect-src: https://api.stripe.com
frame-src:   https://hooks.stripe.com
```

### NUNCA
- Poner sk_live_ en código fuente
- Usar Lemon Squeezy (cuenta denegada 2026-04-29)

---

## 21. GEO-DETECCIÓN — js/geo-detect.js

### Cuándo usar
Landing pages que sirven a Colombia y mercado internacional (diseno-remoto, alejandro, en/global-design).

### Qué hace
- Detecta país por IP via ipapi.co (gratis hasta 1000 req/día)
- Persiste en sessionStorage (no repite la llamada)
- Expone `window.ProdigyGeo.get()` → `{ pais, moneda, esColombia, esMexico, esLatam, esEuropa }`
- Muestra banner bilingüe a visitantes fuera de Colombia → /en/global-design
- Aplica precios `data-price-cop` / `data-price-usd` automáticamente

### Cargado automáticamente
`footer.js` inyecta `_loadScript('/js/geo-detect.js')` en todas las páginas.

### Uso manual en código
```javascript
window.ProdigyGeo.onReady(function(geo) {
    if (!geo.esColombia) {
        // mostrar precios en USD, botón inglés, etc.
    }
});
```

---

## 22. MARCA PERSONAL — /alejandro

### Patrón de página personal/portfolio (diferente de página de empresa)
- Paleta: near-black `#080808` + dorado cálido `#c9a96e` (NO usar colores PRODIGY)
- Tipografía: Playfair Display (serif) para nombre + Inter para cuerpo
- Sin header.js branding PRODIGY visible — header.js se carga pero la página tiene identidad propia
- i18n con objeto `T = { es:{...}, en:{...} }` y `setLang()` sin librerías externas
- Chatbot Exocad: usa `/api/gemini` con system prompt especializado en Exocad Wiki
- Portafolio: misma tabla Supabase `casos_portafolio`, misma query
- WhatsApp: número personal del diseñador (NO número PRODIGY)

### Subdominio independiente
```
Cloudflare DNS → CNAME alejandro → dental-portfolio.pages.dev
Cloudflare Pages → Custom domains → alejandro.prodigylabdental.com
```
Próximo paso: dominio propio `alejandrocarvajal.dental` (~$15/año Namecheap).

---

## 19. MANTENIMIENTO DE ESTE ARCHIVO

**Regla:** Cada vez que se implemente un patrón nuevo que deba repetirse, documentarlo aquí ANTES de hacer commit.

Plantilla rápida para añadir una sección nueva:

```markdown
## XX. NOMBRE DEL PATRÓN

Descripción breve de cuándo usarlo.

### Implementación

\`\`\`html/js/sql
código de referencia
\`\`\`

### Notas
- Qué no hacer
- Casos edge
```

**Cuándo actualizar:**
- Al añadir un nuevo helper de seguridad (escH, csvCell, etc.)
- Al implementar nueva integración (pago, notificación, analytics)
- Al descubrir un bug de seguridad y su fix
- Al cambiar un patrón existente por una versión mejorada
- Al crear un nuevo tipo de página (flujo, landing, app page)
```
