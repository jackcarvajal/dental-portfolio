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
<meta name="robots" content="index, follow">
<meta name="author" content="PRODIGY Lab Dental">
<link rel="canonical" href="https://prodigylabdental.com/[slug]">
<!-- OG básico -->
<meta property="og:title" content="[Título página]">
<meta property="og:description" content="[Descripción corta]">
<meta property="og:type" content="website">
<meta property="og:url" content="https://prodigylabdental.com/[slug]">
<meta property="og:image" content="https://prodigylabdental.com/assets/og-[slug].jpg">
<meta property="og:locale" content="es_CO">
<!-- Schema.org (copiar y ajustar) -->
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Service","name":"[Nombre servicio]","description":"[Descripción]","provider":{"@type":"LocalBusiness","name":"PRODIGY Lab Dental","telephone":"+573212816716","address":{"@type":"PostalAddress","addressLocality":"Bogotá","addressCountry":"CO"}},"areaServed":"Colombia","offers":{"@type":"Offer","priceCurrency":"COP","price":"[precio_base]"}}</script>
```

En `<body>`:
```html
<script src="js/header.js"></script>  <!-- PRIMER elemento -->
<!-- contenido -->
<script src="js/footer.js?v=20260522"></script>  <!-- antes de </body> -->
<script>if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});</script>
```

**Después de crear la página:**
- Agregar URL a `sitemap.xml` con `<lastmod>` actual y `<priority>0.8-0.9`
- Crear imagen OG: 1200×630px en `/assets/og-[slug].jpg`
- Agregar link en menú si es servicio principal

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

## 3b. LEY 50/50
Cotizaciones: "50% abono inicio · 50% saldo contra entrega". Precios en COP. WA incluye: Total, Abono, Saldo.

## 4. SEGURIDAD
- `/app/*.html` (excl. login/reset): `noindex,nofollow` + `auth-guard.js` antes de JS de negocio.
- `/patient.html`: noindex.
- `/sql/*`, `/supabase/*`: bloqueados en `_redirects`.
- XSS: siempre `escH()` o `textContent` para datos de Supabase en innerHTML.

## 5. DISEÑO
Colores: `#D946A6` magenta · `#D4AF37` gold · `#00d2ff` cyan · `#050505` bg · `#1a2332` card · `#00FF41` neon
Animaciones: solo en idle (requestIdleCallback). Sin loops en eco-cards. Solo fade+scroll con GSAP.

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
