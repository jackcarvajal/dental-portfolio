# PRODIGY — PENDIENTES MAESTRO
> Fuente única de verdad. Ordenados por bloque. Actualizar al completar.
> Última revisión: 2026-04-08

---

## 🔴 BLOQUE 1 — SUPABASE SQL (ejecutar en orden)
> Dashboard → SQL Editor → pegar archivo → Run

| # | Archivo | Qué hace | Estado |
|---|---------|----------|--------|
| 1 | `sql/schema-completo.sql` | Esquema base completo | ⏳ Pendiente |
| 2 | `sql/rls-policies.sql` | RLS Storage + pedidos (Agente 1) | ⏳ Pendiente |
| 3 | `sql/migrate-v7.sql` | Migración incremental v7 | ⏳ Pendiente |
| 4 | `sql/migrate-v8.sql` | Migración incremental v8 | ⏳ Pendiente |
| 5 | `sql/migrate-leads.sql` | Tabla `leads_doctores` (Journal + Calculadora) | ⏳ Pendiente |
| 6 | `sql/migrate-doctores.sql` | Tablas `doctores_perfil` + `pedidos_doctor` (portal cliente) | ⏳ Pendiente |
| 7 | `sql/migrate-despachos.sql` | Tabla despachos / mensajero | ⏳ Pendiente |
| 8 | `sql/migrate-evidencias.sql` | Tabla evidencias de entrega | ⏳ Pendiente |
| 9 | `sql/migrate-equipo.sql` | Tabla equipo PRODIGY | ⏳ Pendiente |
| 10 | `sql/migrate-inventario.sql` | Tabla inventario materiales | ⏳ Pendiente |
| 11 | `sql/migrate-billing.sql` | Tabla facturación | ⏳ Pendiente |
| 12 | `sql/migrate-compliance.sql` | Tabla compliance / auditoría | ⏳ Pendiente |

---

## 🔴 BLOQUE 2 — SUPABASE STORAGE (Dashboard → Storage)

| # | Acción | Detalle | Estado |
|---|--------|---------|--------|
| 1 | Crear bucket `casos` | Visibilidad: **Private** | ⏳ Pendiente |
| 2 | Crear bucket `evidencias-entrega` | Visibilidad: **Private** | ⏳ Pendiente |
| 3 | Crear tabla `push_subscriptions` | Campos: `case_id text, endpoint text, p256dh text, auth text, created_at timestamptz` | ⏳ Pendiente |
| 4 | Settings → Auth → Site URL | Cambiar a `https://prodigylabdental.com` (actualmente localhost) | ⏳ Pendiente |
| 5 | Settings → Auth → Redirect URLs | Agregar `https://prodigylabdental.com/**` | ⏳ Pendiente |

---

## 🔴 BLOQUE 3 — SUPABASE EDGE FUNCTIONS (deploy con deploy-push.bat)

> Requisito: tener instalado `supabase CLI` y estar vinculado al proyecto.
> Comando base: `.\deploy-push.bat TU_TOKEN`

| # | Función | Qué hace | Estado |
|---|---------|----------|--------|
| 1 | `send-push` | Web Push notifications | ⏳ Pendiente deploy |
| 2 | `notify-wa` | WhatsApp automático por estado (pago, diseño listo, recordatorio) | ⏳ Pendiente deploy + credenciales |
| 3 | `meta-capi` | Meta Conversions API (tracking sin cookies) | ⏳ Pendiente deploy + credenciales |
| 4 | `verify-price` | Verificación de precio en servidor antes del checkout | ⏳ Pendiente deploy |

---

## 🔴 BLOQUE 4 — SUPABASE SECRETS (Dashboard → Settings → Secrets)

| Variable | Cómo obtenerla | Estado |
|----------|----------------|--------|
| `WOMPI_INTEGRITY_SECRET` | Wompi Dashboard → Claves → Integrity Key | ⏳ Pendiente |
| `PADDLE_API_KEY` | dashboard.paddle.com → Developer → API Keys | ⏳ Pendiente |
| `META_ACCESS_TOKEN` | business.facebook.com → System Users → generar token permanente con permisos `whatsapp_business_messaging` | ⏳ Pendiente |
| `WA_PHONE_ID` | business.facebook.com → WhatsApp Manager → número → copiar Phone Number ID (~15 dígitos) | ⏳ Pendiente |
| `META_APP_ID` | developers.facebook.com → tu app → copiar App ID | ⏳ Pendiente |
| `META_PIXEL_ID` | business.facebook.com → Events Manager → tu pixel → copiar ID | ⏳ Pendiente |
| `VAPID_PUBLIC_KEY` | Ejecutar: `npx web-push generate-vapid-keys` → copiar Public Key | ⏳ Pendiente |
| `VAPID_PRIVATE_KEY` | Mismo comando → copiar Private Key | ⏳ Pendiente |

> ⚠️ Después de generar VAPID: pegar la **Public Key** también en `app/sw.js` (línea ~80)

---

## 🟡 BLOQUE 5 — PLATAFORMAS EXTERNAS

### PayPal
| Acción | Detalle | Estado |
|--------|---------|--------|
| Domain whitelist | developers.paypal.com → App → Allowed Return URLs → agregar `https://prodigylabdental.com` | ⏳ Pendiente |

### Paddle
| Acción | Detalle | Estado |
|--------|---------|--------|
| Crear producto | dashboard.paddle.com → Catalog → Products → crear producto tipo "Service" → copiar `pri_...` | ⏳ Pendiente |
| Pegar Price ID | En `js/pagos.js` → `PAGOS_CONFIG.paddle.priceId` → pegar el `pri_...` | ⏳ Pendiente |
| Activar producción | En `js/pagos.js` → `modoEspera: false` | ⏳ Pendiente |
| API Key en Secrets | `PADDLE_API_KEY` → Supabase Secrets | ⏳ Pendiente |

### Wompi
| Acción | Detalle | Estado |
|--------|---------|--------|
| Activar cuenta producción | wompi.co → esperar aprobación → obtener `pub_prod_*` | ⏳ Pendiente |
| Cambiar a producción | `js/pagos.js` → `publicKey: 'pub_prod_...'` + `modoEspera: false` | ⏳ Pendiente |
| Tasa COP/USD | Actualizar `TASA_COP_USD` en `js/pagos.js` mensualmente (actual: 4200) | 🔄 Mensual |

### Meta / WhatsApp Business API
| Acción | Detalle | Estado |
|--------|---------|--------|
| Crear App en Meta Developers | developers.facebook.com → tipo Business | ⏳ Pendiente |
| Agregar producto WhatsApp | App → Add Product → WhatsApp | ⏳ Pendiente |
| Obtener Phone Number ID | WhatsApp Manager → número 3212816716 → copiar ID | ⏳ Pendiente |
| Crear System User | business.facebook.com → Settings → System Users → generar token permanente | ⏳ Pendiente |
| Verificar dominio | prodigylabdental.com → Meta Business → Brand Safety → Domains | ⏳ Pendiente |

---

## 🟡 BLOQUE 6 — NETLIFY (configurar una vez)

| # | Acción | Detalle | Estado |
|---|--------|---------|--------|
| 1 | Crear cuenta | netlify.com → Sign up con GitHub | ⏳ Pendiente |
| 2 | Importar repo | "Add new site" → "Import existing project" → seleccionar repo GitHub | ⏳ Pendiente |
| 3 | Conectar dominio | Site Settings → Domain → "Add custom domain" → `prodigylabdental.com` | ⏳ Pendiente |
| 4 | DNS en registrador | Agregar los registros CNAME/A que Netlify indique en el panel de tu dominio (.co o donde esté) | ⏳ Pendiente |
| 5 | Verificar HTTPS | Netlify → Domain → HTTPS → "Verify DNS" → activar Let's Encrypt | ⏳ Pendiente |

> ✅ El `netlify.toml` ya está configurado correctamente (CSP, cache, redirects, wss: para Realtime)
> Después del setup: `git push` = deploy automático en ~60 segundos

---

## 🟡 BLOQUE 7 — GOOGLE / SEO

| # | Acción | Detalle | Estado |
|---|--------|---------|--------|
| 1 | Search Console | search.google.com/search-console → verificar `prodigylabdental.com` → enviar `sitemap.xml` | ⏳ Pendiente |
| 2 | Google My Business | Crear perfil con fotos del lab, horario 8-18h L-S, dirección Bogotá | ⏳ Pendiente |
| 3 | Analytics GA4 | Crear propiedad → copiar Measurement ID → agregar script en `index.html` y páginas públicas | ⏳ Pendiente |

---

## 🟡 BLOQUE 8 — CONTENIDO (trabajo manual de Alejandro)

| # | Tarea | Detalle | Estado |
|---|-------|---------|--------|
| 1 | Fotos reales portafolio | Reemplazar emojis placeholder en `portafolio.html` con fotos reales de casos | ⏳ Pendiente |
| 2 | Fotos Google My Business | 10-15 fotos del laboratorio: fresadora, escáner, casos terminados | ⏳ Pendiente |
| 3 | Video Reels x 6 | Scripts ya generados en cada artículo de `journal.html` — grabar y publicar | ⏳ Pendiente |
| 4 | Email `casos@prodigylabdental.com` | Crear en tu proveedor de dominio (Google Workspace o similar) | ⏳ Pendiente |
| 5 | Artículos journal pendientes | `escaneres-intraorales-2026` + `3shape-automate-revision` — agregar `contenido[]` en `articles.js` | ⏳ Pendiente |

---

## ✅ COMPLETADO (referencia)

| Qué | Dónde |
|-----|-------|
| Portal doctor (pedidos online) | `app/client-panel.html` |
| Tab "Pedidos Doctores" en panel operador | `app/panel-interno-operaciones.html` |
| Sistema de artículos dinámico | `articles.js` + `article.html` |
| 4 artículos técnicos con refs científicas | `articles.js` |
| Calculadora pública con WA | `calculadora.html` |
| Journal / Blog con lead magnet | `journal.html` |
| Portafolio con lightbox | `portafolio.html` |
| Portafolio preview en index | `index.html#portfolio` |
| 404 personalizado | `404.html` |
| JSON-LD LocalBusiness + FAQPage + Article | `index.html`, `article.html`, `journal.html` |
| robots.txt con GPTBot / PerplexityBot | `robots.txt` |
| sitemap.xml con prodigylabdental.com | `sitemap.xml` |
| netlify.toml con CSP + cache + wss | `netlify.toml` |
| WA unificado a 573212816716 | Todos los archivos |
| Email casos@prodigylabdental.com | `enviar-produccion-*.html` |
| rel=noopener noreferrer en 54 enlaces | Todos los HTML |
| SQL leads_doctores con RLS | `sql/migrate-leads.sql` |
| SQL doctores_perfil + pedidos_doctor | `sql/migrate-doctores.sql` |

---

## 📊 COMPARATIVA — ProDigy vs Competencia

### vs Sindekar (Colombia directa)
| Factor | Sindekar | ProDigy |
|--------|----------|---------|
| Plataforma pública | ❌ Todo tras login | ✅ Calculadora + portafolio + journal |
| SEO / AIO indexable | ❌ Invisible en buscadores | ✅ JSON-LD, FAQPage, blog técnico |
| Portal del cliente | ✅ Establecido | ✅ Implementado (client-panel) |
| WhatsApp integrado | ✅ Solo soporte | ✅ Pedido + notificaciones automáticas |
| Tiempo de entrega | 40 h | 24 h |
| Precios visibles | ❌ No | ✅ Calculadora pública |
| Guías / contenido | ❌ No | ✅ Journal con refs científicas |
| Facturación digital | ✅ | ⏳ Pendiente (migrate-billing.sql) |

### vs Phibo (referencia Europa/Colombia)
> Phibo es fabricante multinacional (España). Su plataforma es B2B para grandes labs.
> **No compite directamente** — ProDigy es laboratorio de servicio, Phibo vende materiales y manufactura a escala industrial.

| Factor | Phibo | ProDigy |
|--------|-------|---------|
| Escala | Multinacional industrial | Laboratorio boutique especializado |
| Mercado | Labs de alto volumen | Dentistas directos (B2C-ish) |
| Personalización | Estándar catálogo | DSD + diseño 1:1 |
| Tiempo respuesta | Semanas (importación) | 24-48h locales |
| Precio | Prima de marca europea | COP competitivo local |
| **Brecha que cerrar** | Garantías escritas con tolerancias (CGC) | ⏳ `terminos-y-legal.html` tiene base — expandir |

**Diferenciador ProDigy que Phibo NO puede replicar**: velocidad local + WhatsApp + precio COP + DSD incluido + trazabilidad realtime.
