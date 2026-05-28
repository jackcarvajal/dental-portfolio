# PRODIGY — PENDIENTES MAESTRO
> Solo tareas activas. Última revisión: 2026-05-27
> Completadas → eliminar. Nuevas → agregar arriba de su bloque.

---

## 🔴 URGENTE — Bloquean funcionalidades activas

| # | Acción | Dónde | Detalle |
|---|--------|-------|---------|
| 1 | `GEMINI_API_KEY` en Cloudflare Pages — **PRODIGY** | Pages → Settings → Environment Variables → Add | Sin esto el chatbot IA no responde |
| 2 | `GEMINI_API_KEY` en Cloudflare Pages — **Alejandro** | Pages → Settings → Environment Variables → Add | Sin esto el chatbot IA no responde |
| 3 | `GEMINI_API_KEY` en GitHub Secrets — **repo Alejandro** | Repo → Settings → Secrets and variables → Actions | Sin esto el cron de artículos no corre |
| 4 | `WOMPI_INTEGRITY_SECRET` en Supabase Secrets | Dashboard → Edge Functions → Secrets | Webhook de pago falla |
| 5 | **Redesplegar ambos sitios** en Cloudflare tras agregar env vars | Cloudflare → Deployments → Retry deployment | Para activar bot + SEO fixes |
| 6 | **Subir casos al portafolio** | `/app/panel-interno-operaciones.html` | Mínimo 5 casos con portada + galería |
| 7 | **Ejecutar `patch-supabase-public-grants-2026.sql`** | Supabase Dashboard → SQL Editor | **Antes del 30-oct-2026** — sin esto las tablas nuevas no responden via API (cambio discusión #45329) |

---

## 🟡 SUPABASE SECRETS — Meta/WhatsApp

| Variable | Cómo obtenerla |
|----------|----------------|
| `META_ACCESS_TOKEN` | business.facebook.com → Usuarios del sistema → token permanente |
| `WA_PHONE_ID` | business.facebook.com → WhatsApp Manager → Phone Number ID |
| `META_APP_ID` | developers.facebook.com → tu app → Basic Settings |
| `META_PIXEL_ID` | business.facebook.com → Events Manager → Píxeles |

> Una vez agregados: `notify-wa` activa WA automático al doctor. `meta-capi` registra eventos server-side.

---

## 🟡 PLATAFORMAS EXTERNAS

| Plataforma | Acción | Estado |
|------------|--------|--------|
| **Meta/WA** | Verificar dominio prodigylabdental.com en Business Suite | ⏳ |
| **Meta/WA** | Crear App tipo Business → agregar WhatsApp → obtener Phone ID | ⏳ |
| **Stripe** | Crear cuenta Wise Business → obtener datos bancarios USD → abrir Stripe | ⏳ |
| **Wompi** | Activar cuenta producción → clave `pub_prod_*` | ⏳ |
| **PayPal** | Whitelist `https://prodigylabdental.com` en Return URLs | ⏳ |

---

## 🟡 SEO / GOOGLE

| # | Acción | Estado |
|---|--------|--------|
| 1 | Search Console → re-enviar `sitemap.xml` (ambos sitios) | ⏳ |
| 2 | Google My Business → subir 10-15 fotos del lab | ⏳ |
| 3 | GA4 Real Time → verificar que llegan hits | ⏳ |
| 4 | Google Ads ID → reemplazar `AW-XXXXXXXXX` en `js/conversions.js` línea 22 | ⏳ |
| 5 | DNS Cloudflare → SPF + DKIM + DMARC (ver `PENDIENTES-DNS-EMAIL.md`) | ⏳ |
| 6 | **OG images Alejandro** → capturar JPG desde HTML: `assets/og-home.html`, `og-calculadora-diseno.html`, `og-diseno-remoto.html` → guardar como `.jpg` 1200×630 | ⏳ |
| 7 | **OG images PRODIGY** → 19 páginas usan `prodigy-preview.jpg` compartido. Crear imágenes dedicadas por servicio (CAD, fresado, calculadoras) para mejor CTR en redes | ⏳ |

---

## 🎨 CONTENIDO VISUAL — TUYO

| # | Contenido | Dónde | Impacto |
|---|-----------|-------|---------|
| 1 | 5-10 capturas Exocad reales | Portafolio, diseno-remoto, diseno-cad | 🔴 |
| 2 | Video 30-60 seg OBS: STL → diseño | diseno-remoto hero | 🔴 |
| 3 | Foto tuya en PC con Exocad | nosotros.html, diseno-cad | 🟡 |
| 4 | Antes/después: STL crudo vs. diseño | diseno-remoto, diseno-cad | 🟡 |
| 5 | Foto del laboratorio/taller | nosotros.html | 🟢 |

---

## 📱 TIKTOK @prodigylabdental

| # | Acción |
|---|--------|
| 1 | Completar perfil: bio + link `/diseno-remoto` + foto |
| 2 | Cambiar a Cuenta Creador: Settings → Manage account |
| 3 | Grabar video #1: "¿Cómo envías tu STL?" — 30 seg OBS |
| 4 | Grabar video #2: time-lapse diseño Exocad — 45 seg |
| 5 | Grabar video #3: "¿Cuánto cuesta diseño CAD?" — muestra calculadora |

---

## ✅ COMPLETADO (sesión continuación 2026-05-27 — ronda 3)
- **SW PRODIGY v23**: flujo-diseno/fresado/impresion/lab agregados al PRECACHE; MAP.md actualizado
- **SW Alejandro v12**: /en/remote-design agregado al PRECACHE
- **Security audit completo**: contabilidad/inventario/taller/mensajero/mis-casos Alejandro/configuracion — todos usan escH() correctamente; patient.html usa escapeHtml(); revision-diseno.html usa esc(); seguimiento-caso PRODIGY usa _escH()
- **JSON.stringify en onclick audit**: solo admin-panel PRODIGY tenía uno residual (_admEviMap aplicado); Alejandro limpio (_pMap ya existía)
- **FAQPage audit**: todos los `<details>` en ambos proyectos tienen FAQPage schema ✓
- **Canonicals**: solo recibo-caso/revision-diseno sin canonical, ambas noindex ✓
- **_redirects**: /sql/ y /supabase/ bloqueados con 404 en ambos proyectos ✓
- **Edge functions Gemini**: CORS allowlist + rate limit 5 req/min en ambos ✓; temperatura 0.15 en auto-journal ambos ✓
- **auth-guard.js**: usa app_metadata (no user_metadata) en ambos ✓; onboarding.html correcto
- **Preconnects**: todas las páginas de flujo/calculadoras tienen CDN hints correctos; catalogo.html solo usa CDNs que ya tiene preconnect

## ✅ COMPLETADO (sesión continuación 2026-05-27 — ronda 2)
- **Security**: JSON.stringify(p) en onclick → _pioMap en panel-interno-operaciones (3 botones WA + cierre map)
- **Security**: JSON.stringify(d) en onclick → _admEviMap en admin-panel PRODIGY (botón verEvidencia logística)
- **XSS audit completo app/**: flujo-impresion.js sin riesgo (showProdigyAlert literales; colores hardcoded); gestionar-casos ya escH correcto; seguimiento-caso Alejandro ya _escH correcto
- **Schema**: Person schema agregado a sobre-mi.html Alejandro (BreadcrumbList ya existía)
- **Verificado**: journal.html PRODIGY tiene BreadcrumbList ✓; index.html Alejandro tiene Person+Service+BreadcrumbList ✓; admin-panel Alejandro JSON.stringify limpio (_pMap ya existía) ✓

## ✅ COMPLETADO (sesión continuación 2026-05-27)
- **SEO descs/titles lote k**: desc ≤160 en 4 PRODIGY (soporte-tecnico, index, calculadora-fresado, terminos-y-legal) + 2 Alejandro (index, portafolio); title ≤72 calculadora-fresado PRODIGY; desc ≤160 en/global-design (254→163)
- **Security lote k**: XSS escH revision_num en PRODIGY client-panel + operario-diseno; XSS escH revision_num + lead_source + p.estado en Alejandro admin/client-panel; escH p.codigo en operator-panel onclick; esc(lbl/d) en operario servicios_pagados; app_metadata.role en supabase-client.js loginSupabase (era user_metadata)
- **SW**: /mapa-sitio agregado al precache PRODIGY
- **Schemas**: BreadcrumbList en contacto.html PRODIGY (skip — página redirect noindex); nosotros/terminos/portafolio/catalogo verificados — todos tienen schemas correctos
- **Audit completo**: gestionar-casos, contabilidad, inventario, taller, mensajero, operario, operator-panel, revision-diseno, seguimiento-caso, flujo-diseno ambos proyectos — XSS limpio (excepto fixes aplicados arriba)

## ✅ COMPLETADO (2026-05-24)
- Bot IA PRODIGY y Alejandro: manejo 4 casos de error + system prompt precios USD
- SEO: noindex→index,follow en 9 páginas públicas (7 PRODIGY + 2 Alejandro)
- robots.txt ambos: bots IA (ChatGPT/Perplexity/Gemini permitidos, CCBot/ClaudeBot bloqueados)
- articles.js: pool 28 temas unificados + pick aleatorio sin repetición reciente
- WCAG: `<main id="main-content">` verificado en todas las páginas públicas de ambos proyectos
- MAP.md: versiones actualizadas (SW v22, footer v20260522, líneas articles.js reales)
- CLAUDE.md PRODIGY: sección bot IA + sección artículos científicos con journals
- CLAUDE.md Alejandro: creado desde cero con todas las reglas
- hreflang EN agregado a portafolio.html
- temperature auto-journal PRODIGY: 0.2→0.15
- nosotros.html PRODIGY: secciones Fundador + Arsenal técnico + Trayectoria 2014–2026 agregadas
- nosotros.html: Lighthouse SEO score actualizado 63→95 (fix noindex ya aplicado)
- diseno-cad.html + catalogo.html + fresado-cam.html: robots index,follow agregado
- sitemap.xml PRODIGY: nosotros lastmod → 2026-05-24
- **SEO autónomo lote 1**: escaner-domicilio robots + hreflang EN en guias-quirurgicas + calculadora-diseno
- **SEO autónomo lote 2**: hreflang EN + author en calidad, guia-tecnica, instalar-app, soporte, nosotros, portafolio, calculadora-fresado, calculadora-impresion
- **SEO autónomo lote 3**: hreflang EN en flujo-lab, flujo-fresado, flujo-impresion, article
- **sitemap.xml PRODIGY**: flujo-lab, flujo-fresado, flujo-impresion agregados
- **Alejandro**: hreflang EN en soporte, envia-tu-scanner, cursos, flujo-diseno; robots+author en portafolio
- **sitemap.xml Alejandro**: flujo-diseno agregado
- **Panel admin PRODIGY**: fix analytics tab, toggle visible/oculto portafolio, WA clientes, busqueda pedidos, links torre control, colspan clientes
- **operario-diseno.html**: kanban drag & drop + touch implementado (4 columnas)
- **MAP.md PRODIGY**: entradas admin-panel.html y operario-diseno.html agregadas
- **SEO autónomo lote 4**: author en index, article, calculadora, soporte-tecnico, en/global-design PRODIGY; hreflang EN catalogo + soporte-tecnico
- **Alejandro SEO lote 2**: author en index, article, cursos, envia-tu-scanner, flujo-diseno, soporte; hreflang EN sobre-mi
- **SW registration**: todas las páginas .html de ambos proyectos (incl. app/ panels, public pages, en/)
- **Escape key handlers**: todos los modales en operator-panel, calidad, inventario, operario-diseno, operario, gestionar-casos, taller, client-panel, admin-panel, mensajero, contabilidad, taller; Alejandro: admin-panel, client-panel
- **Realtime Supabase**: admin-panel (pedidos + logs_incidencias), gestionar-casos (casos_portafolio); Alejandro: admin-panel (solicitudes_scanner)
- **auth-guard.js PRODIGY**: 6 roles faltantes añadidos (calidad, contabilidad, diseno, taller, fresado, impresion) en getRole() y DEST_MAP
- **taller.html**: auth ampliado a ['admin','taller'] para que operarios accedan
- **mensajero.html**: fix redirect — ya no redirige siempre a login.html sino al panel correcto según rol
- **factura.js**: JWT admin verification añadida + Auth header en contabilidad.html
- **CORS fix**: send-email.js y send-push.js Alejandro: wildcard '*' → dominio propio
- **auto-journal PRODIGY**: updateSitemap() añadida + git add sitemap.xml en journal-cron.yml
- **_headers PRODIGY**: Cache-Control para sitemap.xml añadido
- **Security lote 2026-05-26**: panel-interno-operaciones (app_metadata fix), onboarding (user_metadata fix), stripe-checkout JWT auth, caso.html XSS fix (ambos), flujo-lab Habeas Data, gemini.js CORS, sitemap noindex cleanup
- **Security lote 2026-05-27**: index.html XSS (coverImage/name/type/desc), article.html escaping (lectura/vistas/fecha), journal.html vistas, blog.html vistas (Alejandro); CORS OPTIONS handlers (notify-wa, factura, stripe-checkout); preconnect cdnjs en 8 páginas PRODIGY + 2 Alejandro; _headers PRODIGY clean URLs + dedup nosotros
- **Perf/Security lote 2026-05-27b**: preconnect cdn.jsdelivr.net en 14 páginas PRODIGY + 8 paneles app + 5 páginas Alejandro; CORS OPTIONS stripe-checkout Alejandro (allowlist); XSS pagos.js country_code ipapi.co (ambos proyectos); XSS qr-generator.js Supabase fields; CSP Alejandro: youtube frame-src + cdn.jsdelivr connect-src; seguimiento-caso cache no-store Alejandro; preconnect Supabase en index/journal/portafolio PRODIGY + 7 páginas Alejandro; preconnect unpkg dns-prefetch (inventario/mensajero/taller); FA 6.5.1 normalizado en 7 páginas PRODIGY + 1 Alejandro; mensajero.html FA preload lazy
- **Security/Compliance lote 2026-05-27c**: XSS error.message inventario.html (escaping inline); Habeas Data Ley 1581/2012 en flujo-impresion + flujo-fresado (texto checkbox actualizado); XSS file.name flujo-diseno.html Alejandro; robots.txt PRODIGY: Disallow /patients/ (datos Exocad); _headers PRODIGY: clean URLs /mapa-sitio + /contacto; edge functions audit completo (factura, gemini, notify-wa, stripe-checkout, send-email, send-push, resumen-semanal) — todos con allowlist CORS; auth-guard.js audit — sin open redirect, app_metadata correcto; revision-diseno buildHistorial() audit — esc() correcto en todos los campos
- **SEO lote 2026-05-27d**: hreflang ES+EN+x-default en fresado-cam, diseno-remoto (+es faltante), guias-quirurgicas, nosotros, calidad, envia-tu-scanner, escaner-domicilio (PRODIGY); hreflang en guias-quirurgicas + envia-tu-scanner (Alejandro); sitemap lastmod 2026-05-27 para 7 páginas PRODIGY + 2 Alejandro; FA 6.5.0→6.5.1 en header.js ambos proyectos; patient.html/recibo-caso.html/caso.html audit XSS — escapeHtml() correcto en todos
- **Schemas + Security + Perf 2026-05-27e**: Service+BreadcrumbList en 4 flujos PRODIGY (flujo-lab/fresado/impresion/diseno) + flujo-diseno Alejandro; XSS completar escaping `>` en admin-precios+taller.html; /nosotros clean URL _headers PRODIGY; `functions/api/gemini.js` creado para Alejandro (chatbot era 502 sin este archivo); preconnect Supabase en 5 páginas PRODIGY (diseno-cad, calidad, fresado-cam, guias-quirurgicas, flujo-diseno); auto-journal Alejandro: scripts/gen-articulo-ac.js + .github/workflows/journal-cron-ac.yml (lunes+miércoles 9AM, 13 tópicos CAD dental)
- **Audit lote 2026-05-27f**: XSS audit final — onclick + innerHTML — LIMPIOS en ambos proyectos; _headers PRODIGY: dedup /nosotros; journal-cron.yml PRODIGY + journal-cron-ac.yml Alejandro: fix grep titulo (JS single-quote format); MAP.md PRODIGY: lastmod + 12 categorías journal; filtros blog.html + journal.html corregidos; sw.js + blog.html + caso.html XSS (ambos) commiteados
- **SEO lote 2026-05-27g**: geo.region+placename+position+ICBM en 18 páginas PRODIGY + 11 páginas Alejandro (local SEO Bogotá CO-DC); sitemap lastmod 2026-05-27 en 13 páginas PRODIGY + 8 páginas Alejandro; 13 artículos faltantes agregados a sitemap.xml PRODIGY; 9 artículos fantasma eliminados de sitemap Alejandro (soft 404 — no existen en articles-ac.js); OG/Twitter/keywords completados en flujo-diseno/flujo-lab/mapa-sitio PRODIGY
- **SEO lote 2026-05-27h**: twitter:title+description en 5 páginas PRODIGY (calculadora-fresado/diseno/impresion, calidad, guia-tecnica) + 4 Alejandro (calculadora-diseno, cursos, index, soporte); títulos >75chars → ≤72 en 5 PRODIGY + 4 Alejandro; descriptions >165chars → ≤160 en 6 PRODIGY + 6 Alejandro; schema WebSite en mapa-sitio.html PRODIGY; keywords en terminos-y-legal (ambos proyectos); audit completo: hreflang ✓, BreadcrumbList ✓, FAQPage ✓, SW ✓, CORS ✓, auth-guard ✓, robots.txt ✓, manifest.json ✓
- **SEO/Fix lote 2026-05-27i**: max-snippet:-1+max-image-preview:large en 10 páginas PRODIGY (calidad, flujos, mapa-sitio, guia-tecnica, envia-tu-scanner, escaner-domicilio, terminos) + 4 Alejandro (flujo-diseno, article, soporte, terminos); **hreflang dedup**: eliminados duplicados en 6 páginas PRODIGY (envia-tu-scanner, escaner-domicilio, fresado-cam, guias-quirurgicas, nosotros, calidad) + 2 Alejandro (guias-quirurgicas, envia-tu-scanner); **MAP.md Alejandro**: líneas header.js actualizadas (topbar 296, navHtml 344, _SURL 529, _pgHistory 642, _pgSystemPrompt 644, _pgAddMsg 682, fetch gemini 706, errores 717-730); **auto-journal pool**: +7 temas PRODIGY (34 total) + +12 temas Alejandro (25 total); mapa-sitio.html: hreflang es/x-default agregado; hreflang+max-snippet en mapa-sitio.html PRODIGY
- **Schemas+Security lote 2026-05-27j**: Service+BreadcrumbList en 6 páginas servicio PRODIGY (diseno-cad, diseno-remoto, fresado-cam, guias-quirurgicas, escaner-domicilio, envia-tu-scanner); XSS fix r.revision_num en recibo-caso.html (ambos); XSS fix n.reaction en caso.html (ambos); TOPIC_POOL Alejandro: tema faltante flujo-digital-ortopedico agregado (25 total confirmado)
