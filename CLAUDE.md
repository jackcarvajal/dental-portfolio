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

## 8. REFERENCIAS RÁPIDAS
- `MAP.md` — líneas exactas de funciones críticas. Leer antes de editar archivos grandes.
- `PENDIENTES.md` — solo tareas ⏳/🔴/🟡. Orden: 0-SQL → 1-Home → 2-Portafolio → 3-Servicios → 4-Flujos → 5-Soporte → 6-Empresa → 7-Portal → 8-SEO.
- `VERIFICAR.md` — protocolo que sigue Alejandro para reportar resultados.
