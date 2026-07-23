# GUÍA — Seguridad detallada (patrones y código)

Leer solo cuando se toque código de seguridad (auth, CORS, XSS, SW, CSP). Ver CLAUDE.md § 4a para las reglas siempre-activas.

## XSS — patrón de escape por contexto
```javascript
// Función local (definir al inicio del script si el archivo usa Supabase data en innerHTML)
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
// Variantes existentes: _escH, escHtml, escapeHtml, _pgEscH, _qrEscH, esc() — mismo patrón
```
Aplica a: campos Supabase, respuestas de API externa (ipapi.co, etc.), `file.name`, `error.message`.

## CORS — Edge functions (Cloudflare Pages Functions)
```javascript
// ✅ validar origin contra allowlist
const allowed = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'];
const ok = allowed.includes(origin) || origin.includes('.pages.dev');
return { 'Access-Control-Allow-Origin': ok ? origin : allowed[0] };
// ❌ echo ciego del origin
return { 'Access-Control-Allow-Origin': origin };
```
Siempre incluir `onRequestOptions` para preflight OPTIONS.

## Supabase — GRANT explícitos (cambio oct 2026)
Desde el 30-oct-2026, tablas nuevas en `public` no se exponen a la API sin GRANT explícito. RLS sigue siendo la seguridad real.
Parche para tablas existentes+futuras: `sql/patch-supabase-public-grants-2026.sql`.

Patrón obligatorio para tablas nuevas:
```sql
CREATE TABLE IF NOT EXISTS public.nueva_tabla (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, ...);
ALTER TABLE public.nueva_tabla ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.nueva_tabla TO anon, authenticated;
CREATE POLICY "nombre_policy" ON public.nueva_tabla FOR SELECT TO authenticated USING (...);
```

## Preconnect / dns-prefetch
```html
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
```
CDNs del proyecto: cdnjs.cloudflare.com (Font Awesome) · cdn.jsdelivr.net (Supabase SDK, Three.js) · unpkg.com (Leaflet) · zgihrwqfyvgyapbwzkvw.supabase.co · fonts.googleapis.com + fonts.gstatic.com.

## Accesibilidad en header.js (ya implementado, solo verificar)
`<nav aria-label="Navegación principal">` · hamburguesa con `aria-expanded`/`aria-controls` · menú móvil `role="navigation"` · botón chatbot con `aria-expanded` · ventana chat `role="dialog"` · textarea con `aria-label`.

Patrón para modales/botones nuevos:
```javascript
btn.setAttribute('aria-expanded', open ? 'true' : 'false');
btn.setAttribute('aria-label', open ? 'Cerrar X' : 'Abrir X');
// contenedor del modal: role="dialog" aria-label="..." aria-modal="true"
```

## Font Awesome
Versión fija **6.5.1**. `header.js` auto-inyecta si falta. Íconos above-the-fold → link síncrono en `<head>`. Paneles/app → preload lazy:
```html
<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"></noscript>
```

## Hallazgos audit 2026-05-28

**Open redirect (stripe-checkout, send-push):**
```javascript
// ✅ validar contra dominio propio
const _own = /^https:\/\/(www\.)?prodigylabdental\.com\//;
const success_url = raw && _own.test(raw) ? raw : 'https://prodigylabdental.com/default';
```

**URL validation en iframe.src / gallery arrays:**
```javascript
try { const u = new URL(link); if (u.protocol !== 'https:') throw new Error(); } catch { return; }
iframe.src = link;
gallery = (Array.isArray(c.gallery) ? c.gallery : []).filter(u => /^https?:\/\//.test(u));
```

**Badge/toast con innerHTML — siempre escapar:**
```javascript
const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
el.innerHTML = `<span>${_esc(msg)}</span>`;
```

**Rate limiting (Cloudflare Cache API)** — aplicar a send-email, send-push, notify-wa, gemini:
```javascript
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

**CSP obligatorio en `_headers`:**
```
Content-Security-Policy: ...
  media-src 'self' blob: https://*.supabase.co https://drive.google.com;
  upgrade-insecure-requests;
  object-src 'none';
  base-uri 'self';
```

**SW notificationclick — validar data.url:**
```javascript
const rawUrl = e.notification.data?.url || '/';
const url = /^https?:\/\/prodigylabdental\.com\//.test(rawUrl) || rawUrl.startsWith('/') ? rawUrl : '/seguimiento-caso';
clients.openWindow(url);
```

## Cache-busters
Todos los scripts JS locales llevan `?v=AAAAMMDD` (assets `/js/*` cacheados 1 año, `immutable`).
```html
<script src="js/header.js?v=20260528"></script>
<script src="js/footer.js?v=20260528"></script>
_loadScript('/js/utm-tracker.js?v=20260528');
```
Actualizar en cada modificación del JS, convención fecha del cambio.

## robots.txt — bots a bloquear (2026-05-28)
```
User-agent: ClaudeBot
User-agent: CCBot
User-agent: Bytespider
User-agent: FacebookBot
User-agent: Applebot-Extended
User-agent: Diffbot
Disallow: /

User-agent: MJ12bot
User-agent: AhrefsBot
User-agent: SemrushBot
Disallow: /

Disallow: /app/
Disallow: /api/
Disallow: /sql/
Disallow: /supabase/
Disallow: /.git/
Disallow: /MEMORY/
Disallow: /scripts/
```
