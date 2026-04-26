# PRODIGY — Manual Técnico Responsivo y Estándares Web
> Actualizado: 2026-04-25 | Basado en auditorías rounds 21-25
> **Aplicar TODO a cada página nueva o modificación mayor.**

---

## CHECKLIST COMPLETO — PÁGINA NUEVA (copiar y marcar)

### Tipografía
- [ ] `font-family: 'Inter'` declarado en body
- [ ] Preconnect a `fonts.googleapis.com` y `fonts.gstatic.com`
- [ ] Link Inter con `&display=swap`
- [ ] Preload woff2 Inter (patrón abajo)
- [ ] Texto cuerpo ≥ `1rem` (16px), `line-height ≥ 1.6`
- [ ] Descripción de card ≥ `0.92rem`
- [ ] Badges decorativos uppercase: mínimo `0.75rem`
- [ ] **PROHIBIDO:** `#666`, `#777`, `#86868b`, `#8b99a8` en texto

### Contraste WCAG AAA
- [ ] Texto principal: `#e2e8f0` o más claro → contraste ~14:1 ✅
- [ ] Texto secundario: `#94a3b8` mínimo → contraste ~8:1 ✅
- [ ] **PROHIBIDO:** `#475569`, `#64748b` sobre fondos oscuros

### Responsive / Mobile-First
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- [ ] `overflow-x: hidden` en body
- [ ] H1 con `clamp()`: `clamp(1.8rem, 5vw, 3rem)`
- [ ] Grids 3 col → breakpoint 860px (2col) y 540px (1col)
- [ ] Grids 4 col → breakpoint 860px (2col) y 480px (1col)
- [ ] Touch targets: padding vertical ≥ 11px en botones (→ 44px altura)
- [ ] Imágenes: `width:100%` + `object-fit:cover`

### Core Web Vitals
- [ ] Scripts no críticos con `defer`
- [ ] Supabase CDN siempre con `defer`
- [ ] `header.js` y `footer.js` **sin** defer (síncronos por diseño)

### Accesibilidad
- [ ] Skip navigation al inicio de `<body>` (patrón abajo)
- [ ] Todos los `<img>` con `alt` descriptivo
- [ ] Botones sin texto: `aria-label`
- [ ] Inputs con `label` asociado y `autocomplete`

### SEO
- [ ] `<title>` único, 50-60 caracteres
- [ ] `meta description` única, 120-160 caracteres
- [ ] `link rel="canonical"` con URL absoluta
- [ ] JSON-LD: `BreadcrumbList` mínimo en servicios
- [ ] JSON-LD: `FAQPage` si hay preguntas frecuentes
- [ ] `hreflang` ES/EN/x-default
- [ ] `og:title`, `og:description`, `og:image`, `og:url`

### Seguridad
- [ ] `header.js` primer elemento en `<body>`
- [ ] `footer.js` antes de `</body>`
- [ ] Páginas `/app/`: `auth-guard.js` + `noindex`
- [ ] Formularios: checkbox Habeas Data + `autocomplete` en inputs

---

## PATRONES DE CÓDIGO — COPIAR LITERALMENTE

### 1. Font Inter en `<head>`
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
      as="font" type="font/woff2" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
```

### 2. CSS base en `<style>`
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #050505;
  color: #e2e8f0;
  line-height: 1.6;
  overflow-x: hidden;
}
```

### 3. Grid 3 columnas responsivo
```css
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
@media(max-width: 860px) { .grid-3 { grid-template-columns: repeat(2, 1fr); } }
@media(max-width: 540px) { .grid-3 { grid-template-columns: 1fr; } }
```

### 4. Grid 4 columnas responsivo
```css
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
@media(max-width: 860px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } }
@media(max-width: 480px) { .grid-4 { grid-template-columns: 1fr; } }
```

### 5. Skip navigation (primer elemento en `<body>`)
```html
<a href="#main-content" class="skip-nav"
   style="position:absolute;top:-100%;left:0;background:#D946A6;color:#fff;
          padding:10px 20px;font-weight:700;font-size:1rem;z-index:99999;
          border-radius:0 0 8px 0;transition:top .2s;text-decoration:none;"
   onfocus="this.style.top='0'" onblur="this.style.top='-100%'">
  Saltar al contenido
</a>
```

### 6. hreflang (antes de `</head>`, cambiar SLUG)
```html
<link rel="alternate" hreflang="es" href="https://prodigylabdental.com/SLUG">
<link rel="alternate" hreflang="en" href="https://prodigylabdental.com/SLUG?lang=en">
<link rel="alternate" hreflang="x-default" href="https://prodigylabdental.com/SLUG">
```

### 7. Scripts — orden correcto
```html
<!-- INICIO de <body> — NO defer (inyecta navbar síncronamente) -->
<script src="js/header.js?v=20260425"></script>

<!-- ANTES de </body> — NO defer (inyecta footer síncronamente) -->
<script src="js/footer.js?v=20260425"></script>

<!-- Supabase — SIEMPRE defer -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js" defer></script>

<!-- JS de negocio — SIEMPRE defer si no bloquea render -->
<script src="js/mi-logica.js" defer></script>
```

### 8. Schema BreadcrumbList (obligatorio en servicios)
```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList",
 "itemListElement":[
   {"@type":"ListItem","position":1,"name":"Inicio","item":"https://prodigylabdental.com/"},
   {"@type":"ListItem","position":2,"name":"NOMBRE PÁGINA","item":"https://prodigylabdental.com/SLUG"}
 ]}
</script>
```

### 9. Schema FAQPage (si hay preguntas en la página)
```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage",
 "mainEntity":[
   {"@type":"Question","name":"¿Pregunta exacta?",
    "acceptedAnswer":{"@type":"Answer","text":"Respuesta en texto plano."}}
 ]}
</script>
```

### 10. Card estándar PRODIGY
```html
<div style="background:#0d1520;border:1px solid rgba(217,70,166,0.18);
            border-radius:16px;padding:24px;transition:border-color .3s,transform .3s;">
  <div style="font-size:1.7rem;margin-bottom:12px;">🎯</div>
  <h3 style="color:#e2e8f0;font-size:1rem;font-weight:700;margin-bottom:8px;">Título</h3>
  <p style="color:#94a3b8;font-size:1rem;line-height:1.65;margin:0;">Descripción</p>
</div>
```

---

## COLORES ESTÁNDAR

| Variable | Hex | Uso | Contraste sobre #050505 |
|---|---|---|---|
| `--gold-primary` | `#D946A6` | Acentos, CTAs, links | — (no usar en texto pequeño) |
| `--gold-hover` | `#D4AF37` | Dorado, precios | — |
| `--accent-cyan` | `#00d2ff` | Highlights, badges | — |
| `--neon-green` | `#00FF41` | Badges activo, live | — |
| `--text-primary` | `#e2e8f0` | Texto principal | ~14:1 ✅ AAA |
| `--text-secondary` | `#b0b0b8` | Texto de cards | ~8:1 ✅ AAA |
| `--muted` | `#94a3b8` | Texto terciario | ~8:1 ✅ AAA |
| `--bg` | `#050505` | Fondo principal | — |
| `--bg-card` | `#0d1520` | Fondo de cards | — |

---

## SCRIPT DE AUTO-AUDITORÍA

Correr desde la carpeta del proyecto antes de publicar cualquier página:

```bash
# 1. Textos demasiado pequeños en cuerpo
grep -rn "font-size:.*\.[6-7][0-9]rem\|font-size:.*1[0-3]px" *.html \
  | grep -v "uppercase\|text-transform\|\.fas\|li i\|letter-spacing.*3px"

# 2. Colores prohibidos en texto
grep -rn "#666\b\|#777\b\|#888\b\|#86868b\|#8b99a8\|#475569\|#64748b" *.html \
  | grep -v "background\|border\|box-shadow\|//"

# 3. Scripts bloqueantes (excepto header/footer)
grep -rn "<script src=" *.html \
  | grep -v "defer\|async\|header\.js\|footer\.js\|auth-guard"

# 4. Grids 3+ col sin breakpoint
grep -rn "repeat([3-9]" *.html | grep -v "@media\|auto-fill\|auto-fit"

# 5. Body sin overflow-x:hidden
for f in *.html; do grep -l "body" "$f" | xargs grep -L "overflow-x" 2>/dev/null; done

# 6. Falta Inter font
grep -rn "<body" *.html | while read line; do
  f=$(echo "$line" | cut -d: -f1)
  grep -qL "Inter" "$f" && echo "SIN Inter: $f"
done 2>/dev/null
```

---

## HERRAMIENTAS DE VERIFICACIÓN

| Herramienta | URL | Meta |
|---|---|---|
| Lighthouse Mobile | Chrome F12 → Lighthouse | A11y ≥ 90, Perf ≥ 80 |
| PageSpeed Insights | pagespeed.web.dev | LCP < 2.5s, CLS < 0.1 |
| WebAIM Contrast | webaim.org/resources/contrastchecker | ≥ 7:1 AAA |
| Security Headers | securityheaders.com | Score A+ |
| Schema Validator | schema.org/SchemaValidator | Sin errores |
| Mobile Friendly | search.google.com/test/mobile-friendly | Apto |
| Rich Results | search.google.com/test/rich-results | FAQ detectado |
| Mail Tester | mail-tester.com | 10/10 |

---

## CONFIGURACIÓN DNS EMAIL (hacer una sola vez en Cloudflare)

Ver archivo: `PENDIENTES-DNS-EMAIL.md`

Resumen:
1. **SPF** — TXT en `@`: `v=spf1 include:_spf.google.com ~all`
2. **DKIM** — Generado desde Google Workspace / tu proveedor de correo
3. **DMARC** — TXT en `_dmarc`: `v=DMARC1; p=quarantine; rua=mailto:gerencia@prodigylabdental.com`

---

*Última actualización: 2026-04-25*
