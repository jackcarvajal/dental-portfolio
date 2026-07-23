# GUÍA — Checklist completo para páginas nuevas

Leer solo cuando se vaya a crear una página pública nueva. Ver también CLAUDE.md § 3 (resumen).

## `<head>` obligatorio
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

## `<body>`
```html
<script src="js/header.js?v=20260528"></script>  <!-- PRIMER elemento -->
<!-- contenido -->
<script src="js/footer.js?v=20260528"></script>  <!-- antes de </body> -->
<script>if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});</script>
```

## Después de crear la página
- Agregar URL a `sitemap.xml` con `<lastmod>` actual y `<priority>0.8-0.9`
- Agregar clean URL a `_headers` con `Cache-Control: public, max-age=0, must-revalidate`
- Crear imagen OG: 1200×630px en `/assets/og-[slug].jpg`
- Agregar link en menú si es servicio principal
- Si hay acordeón `<details>/<summary>` → agregar `FAQPage` schema (ver docs/GUIA-AUDITORIA.md)
- Si hay formulario con datos personales → checkbox Habeas Data (Ley 1581/2012)
- Si hay tablas `<th>` → agregar `scope="col"` o `scope="row"`
- Si hay campos de formulario con hints/notas → `aria-describedby="hint-id"`
- Si hay contenido dinámico (JS renderiza) → `aria-live="polite"` en el contenedor
- Si usa `window.open()` o `iframe.src` desde DB → validar `^https://` antes
- Si hay arrays de imágenes desde Supabase → `.filter(u => /^https?:\/\//.test(u))`
- Agregar `noscript` fallback con WA si la página requiere JS crítico
- Scripts JS locales: agregar `?v=YYYYMMDD` en todos los `<script src="js/...">`

## Secciones con colores alternantes (patrón obligatorio)
```css
section:nth-child(odd)  { background: var(--bg); }           /* #050505 */
section:nth-child(even) { background: rgba(13,21,32,0.6); }  /* azul oscuro */
.sec-dark   { background: #050505; }
.sec-card   { background: rgba(13,21,32,0.6); }
.sec-gold   { background: linear-gradient(135deg,rgba(212,175,55,.06),rgba(217,70,166,.04)); }
.sec-cyan   { background: linear-gradient(135deg,rgba(0,210,255,.05),rgba(0,210,255,.02)); }
```

## Login en header (usar fetch, NO SDK)
```javascript
// ✅ fetch directo — funciona en cualquier página sin SDK
fetch(SURL+'/auth/v1/token?grant_type=password', {method:'POST',...})
// ❌ window.supabase.createClient() — falla en páginas sin SDK cargado
```

## Multiidioma ES/EN
- Botones `.lang-btn` con `onclick="setLang('es'|'en')"`
- `id="lang-[elemento]"` en textos traducibles
- Objeto `LANG = { es:{...}, en:{...} }` con textos técnicos reales
- Auto-detect con `geo-detect.js`: si `_geoCountry !== 'CO'` → mostrar EN
- `hreflang` en `<head>`: es, en, x-default
- **NO usar traductores automáticos** — terminología clínica real (CBCT, surgical guide, implant planning, guided surgery, viability assessment, STL file delivery)

## og:image — cómo crearla
- Archivo HTML en `/assets/og-[slug].html` con layout 1200×630px
- Colores del proyecto, texto en inglés técnico para internacionales
- Capturar con puppeteer o manualmente con browser screenshot tool
- La imagen final va en `/assets/og-[slug].jpg`

## Precios duales (COP local / USD internacional)
- Tabla `catalogo` en Supabase: columna `precio` (COP) + `precio_usd` (USD)
- En flujo-diseno.html Alejandro: sync usa `precio_usd` como prioridad
- En landing pages: toggle `.toggle-btn` COP/USD con función `setMoneda(m,btn)`
- Ratio actual: 1 USD ≈ 4.000 COP (ajustar según TRM)
- Local Colombia +20% sobre convenio CDR · Internacional +80% sobre convenio CDR

## Protocolo CDR — Guías Quirúrgicas (parámetros exactos)
**Dentosoportada:** CBCT maxilar completo · separador de carrillo · sin contacto oclusal · cortes 0.5mm · resolución 150 micras · escáner intraoral ambos maxilares (.PLY o .STL)
**Mucosoportada:** 2 CBCT · paciente sentado · con contacto oclusal sin morder estabilizador · marcadores mín. 4 vestibular + 4 palatino ≈3mm (gutapercha o resina fotocurada) · prótesis con rebase si no asienta
**Esterilización guía:** Solo glutaraldehído + enjuague · NO autoclave · NO agua caliente · probar 24h antes de cirugía
