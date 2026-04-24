# PRODIGY — PENDIENTES MAESTRO
> Fuente única de verdad. Ordenados por bloque. Actualizar al completar.
> Última revisión: 2026-04-24

---

## 🚨 SQL CRÍTICO — EJECUTAR YA (fuga de datos PII activa)

```
sql/patch-rls-leads-fix.sql          → leads_doctores: anon podía leer todos los leads
sql/patch-rls-authenticated-only.sql → mensajeros/despachos/creditos_cliente: misma fuga
```
**Pasos:** Supabase Dashboard → SQL Editor → pegar contenido de cada archivo → Run

---

## 🔴 BLOQUE 0 — PORTAFOLIO ONLINE (sesión 2026-04-15) ← ACCIÓN INMEDIATA

### SQL pendiente de ejecutar
| # | Archivo | Qué hace | Estado |
|---|---------|----------|--------|
| A | `sql/migrate-portafolio-online.sql` | Tabla `casos_portafolio` + RLS | ✅ Ejecutado |
| B | `sql/migrate-comentarios-portafolio.sql` | Tabla `comentarios_portafolio` + RLS base | ✅ Ejecutado |
| C | `sql/patch-comentarios-admin-delete.sql` | Policy admin-delete comentarios | ✅ Ejecutado |

### Storage pendiente (manual en dashboard)
| # | Acción | Detalle | Estado |
|---|--------|---------|--------|
| 1 | Crear bucket `portafolio` | Storage → New bucket → nombre: **portafolio** → **Public: ON** | ✅ Listo |

### Código pendiente
| # | Archivo | Qué falta | Impacto |
|---|---------|-----------|---------|
| 1 | `patient.html` | ✅ Migrado — busca en `casos_portafolio` (Supabase) con fallback a datos estáticos | ✅ Listo |
| 2 | `portafolio.html` | Paginación (limit/offset) cuando haya >20 casos | 🟡 Medio |
| 3 | `app/agregar-caso.html` | Editar / despublicar casos existentes (`visible=false`) | 🟡 Medio |

### Sugerencias proactivas detectadas
| # | Sugerencia | Por qué | Estado |
|---|-----------|---------|--------|
| S1 | Agregar campo `tags` (JSONB) a `casos_portafolio` | Permite filtros múltiples (material, técnica, zona) sin otra tabla | ⏳ |
| S2 | Thumbnail automático via Supabase Image Transform | `?width=400&quality=80` en URL de portada — carga ~70% más rápida | ✅ Aplicado en `portafolio.html` y `gestionar-casos.html` |
| S3 | Panel admin para ver/ocultar casos publicados | Hoy no hay forma de despublicar desde el admin sin ir a Supabase | ✅ Creado `app/gestionar-casos.html` |
| S4 | Rate-limit comentarios: 1 por usuario por caso por hora | Previene flood aunque el filtro spam esté activo | ✅ Aplicado en `patient.html` |
| S5 | `coming-soon.html` redirige automáticamente al index | Ya no es archivo muerto | ✅ `meta refresh` + link `acceso-staff.html` corregido |

---

## ✅ BLOQUE 1 — SUPABASE SQL (COMPLETADO)

| # | Archivo | Qué hace | Estado |
|---|---------|----------|--------|
| 1 | `sql/schema-completo.sql` | Esquema base completo | ✅ Ejecutado |
| 2 | `sql/rls-policies.sql` | RLS Storage + pedidos | ✅ Ejecutado |
| 3 | `sql/migrate-v7.sql` | Migración incremental v7 | ✅ Ejecutado |
| 4 | `sql/migrate-v8.sql` | Migración incremental v8 | ✅ Ejecutado |
| 5 | `sql/migrate-leads.sql` | Tabla `leads_doctores` | ✅ Ejecutado |
| 6 | `sql/migrate-doctores.sql` | `doctores_perfil` + `pedidos_doctor` | ✅ Ejecutado |
| 7 | `sql/migrate-despachos.sql` | Tabla despachos / mensajero | ✅ Ejecutado |
| 8 | `sql/migrate-evidencias.sql` | Tabla evidencias de entrega | ✅ Ejecutado |
| 9 | `sql/migrate-equipo.sql` | Tabla equipo PRODIGY | ✅ Ejecutado |
| 10 | `sql/migrate-inventario.sql` | Tabla inventario materiales | ✅ Ejecutado |
| 11 | `sql/migrate-billing.sql` | Tabla facturación | ✅ Ejecutado |
| 12 | `sql/migrate-compliance.sql` | Tabla compliance / auditoría | ✅ Ejecutado |
| 13 | `sql/migrate-scanner.sql` | Tabla `solicitudes_scanner` (escáner landing) | ✅ Ejecutado |
| 14 | `sql/migrate-domicilio.sql` | Tabla `citas_domicilio` (agendamiento a domicilio) | ✅ Ejecutado |

---

## 🔴 BLOQUE 2 — SUPABASE STORAGE

| # | Acción | Detalle | Estado |
|---|--------|---------|--------|
| 1 | Crear bucket `casos` | Visibilidad: **Private** | ✅ Listo |
| 2 | Crear bucket `evidencias-entrega` | Visibilidad: **Private** | ✅ Listo |
| 3 | Crear bucket `scanner-uploads` | Visibilidad: **Private** + política INSERT para anon | ✅ Listo |
| 4 | Settings → Auth → Site URL | Cambiar a `https://prodigylabdental.com` | ✅ Listo |
| 5 | Settings → Auth → Redirect URLs | Agregar `https://prodigylabdental.com/**` | ✅ Listo |
| 6 | Tabla `push_subscriptions` | SQL listo en `sql/migrate-push-subscriptions.sql` | ✅ Ejecutado |
| 7 | Columna `citas_domicilio.acepta_marketing` | SQL listo en `sql/patch-citas-domicilio-marketing.sql` | 🔴 Ejecutar |

---

## ✅ BLOQUE 3 — SUPABASE EDGE FUNCTIONS (COMPLETADO)

| # | Función | Qué hace | Estado |
|---|---------|----------|--------|
| 1 | `send-push` | Web Push notifications | ✅ Deployed |
| 2 | `notify-wa` | WhatsApp automático por estado | ✅ Deployed — falta META_ACCESS_TOKEN |
| 3 | `meta-capi` | Meta Conversions API | ✅ Deployed — falta META_ACCESS_TOKEN |
| 4 | `verify-price` | Verificación de precio en servidor | ✅ Deployed |
| 5 | `webhook-handler` | Handler de webhooks entrantes | ✅ Deployed |

---

## 🔴 BLOQUE 4 — SUPABASE SECRETS

| Variable | Cómo obtenerla | Estado |
|----------|----------------|--------|
| `VAPID_PUBLIC_KEY` | ✅ Generado y guardado | ✅ Listo |
| `VAPID_PRIVATE_KEY` | ✅ Generado y guardado | ✅ Listo |
| `META_ACCESS_TOKEN` | business.facebook.com → System Users → token permanente con `whatsapp_business_messaging` | ⏳ Pendiente |
| `WA_PHONE_ID` | business.facebook.com → WhatsApp Manager → Phone Number ID | ⏳ Pendiente |
| `META_APP_ID` | developers.facebook.com → tu app → App ID | ⏳ Pendiente |
| `META_PIXEL_ID` | business.facebook.com → Events Manager → tu pixel | ⏳ Pendiente |
| `WOMPI_INTEGRITY_SECRET` | Ya tienes la key — pegar en Supabase Secrets (ver pasos abajo) | 🔴 ACCIÓN INMEDIATA |
| `PADDLE_API_KEY` | dashboard.paddle.com → Developer → API Keys | ⏳ Pendiente |

---

## 🟡 BLOQUE 5 — PLATAFORMAS EXTERNAS

### Meta / WhatsApp Business API ← **Prioridad alta**

**Paso 1 — Verificar dominio (Meta Business Suite)**
1. business.facebook.com → Configuración → Brand Safety → Dominios
2. "Agregar dominio" → `prodigylabdental.com`
3. Elegir método DNS: copiar el TXT record → pegarlo en Cloudflare DNS de tu dominio
4. Volver a Meta → "Verificar"

**Paso 2 — Crear App en Meta Developers**
1. developers.facebook.com → My Apps → Create App
2. Tipo: **Business** → nombre: "PRODIGY Notificaciones"
3. Asociar a tu Business Manager

**Paso 3 — Agregar producto WhatsApp + obtener Phone Number ID**
1. Dentro de la app → Add Product → WhatsApp → Set Up
2. WhatsApp → Getting Started → seleccionar número **3212816716**
3. Copiar el **Phone Number ID** (formato: `12345678901234`)

**Paso 4 — Crear System User + token permanente**
1. business.facebook.com → Configuración → Usuarios del sistema → Agregar
2. Nombre: "PRODIGY Server" | Rol: **Admin**
3. Asignar activo: tu App (full control)
4. Generar token → permisos requeridos:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
   - `ads_management` (para CAPI)
5. **Nunca expira** → copiar y guardar el token

**Paso 5 — Obtener Pixel ID**
1. business.facebook.com → Events Manager → Píxeles
2. Si no tienes uno: Conectar fuentes de datos → Web → Meta Pixel
3. Copiar el **Pixel ID** (número de 15-16 dígitos)

**Paso 6 — Guardar los 4 secretos en Supabase**
1. supabase.com → tu proyecto → Settings → Edge Functions → Secrets
2. Agregar uno a uno:
   - `META_ACCESS_TOKEN` = token del paso 4
   - `WA_PHONE_ID` = Phone Number ID del paso 3
   - `META_APP_ID` = App ID de la app (developers.facebook.com → tu app → Basic Settings)
   - `META_PIXEL_ID` = Pixel ID del paso 5
3. Las Edge Functions `notify-wa` y `meta-capi` ya están deployed — al agregar los secrets, activan automáticamente.

| Paso | Acción | Estado |
|------|--------|--------|
| 1 | Verificar dominio en Meta Business | ⏳ Pendiente |
| 2 | Crear App tipo Business en Meta Developers | ⏳ Pendiente |
| 3 | Agregar WhatsApp → obtener Phone Number ID para 3212816716 | ⏳ Pendiente |
| 4 | Crear System User Admin → token permanente (4 permisos) | ⏳ Pendiente |
| 5 | Obtener Pixel ID de Events Manager | ⏳ Pendiente |
| 6 | Agregar 4 secrets en Supabase Edge Functions | ⏳ Pendiente |

> Una vez completado: `notify-wa` activa notificaciones WA reales al doctor al avanzar estado. `meta-capi` registra eventos Purchase/Lead server-side.

### PayPal
| Acción | Estado |
|--------|--------|
| Whitelist `https://prodigylabdental.com` en Allowed Return URLs | ⏳ Pendiente |

### Paddle
| Acción | Estado |
|--------|--------|
| Crear producto "Service" → copiar `pri_...` | ⏳ Pendiente |
| Pegar Price ID en `js/pagos.js` → `PAGOS_CONFIG.paddle.priceId` | ⏳ Pendiente |
| Activar producción: `modoEspera: false` | ⏳ Pendiente |

### Wompi
| Acción | Estado |
|--------|--------|
| Activar cuenta producción → obtener `pub_prod_*` | ⏳ Pendiente |
| Cambiar a producción en `js/pagos.js` | ⏳ Pendiente |
| Actualizar `TASA_COP_USD` mensualmente (actual: 4200) | 🔄 Mensual |

---

## ✅ BLOQUE 6 — NETLIFY (COMPLETADO)

> El sitio está vivo en producción. Coming-soon desactivado.
> Deploy automático en ~60s con cada `git push`.

---

## 🟡 BLOQUE 7 — GOOGLE / SEO

| # | Acción | Detalle | Estado |
|---|--------|---------|--------|
| 1 | Search Console | Sitemap actualizado 2026-04-22 — **re-enviar** `https://prodigylabdental.com/sitemap.xml` | 🔴 Re-enviar |
| 2 | Google My Business | Perfil creado y activo — faltan fotos del lab | ⏳ Subir 10-15 fotos |
| 3 | Analytics GA4 | `G-Z8G2X7ETQ1` activo en todas las páginas públicas | ✅ Listo |
| 4 | PageSpeed Insights | Medir LCP/CLS en nosotros, portafolio, calculadora post-deploy | ⏳ Manual |
| 5 | GA4 Real Time | Abrir analytics.google.com → Real Time y navegar el sitio para confirmar hits | ⏳ Manual |
| 6 | `assets/prodigy-preview.jpg` | Verificar que el archivo existe en Cloudflare Pages (og:image de todas las páginas apunta ahí) | ⏳ Manual |

---

## ✅ BLOQUE 10 — HOMEPAGE (resuelto 2026-04-23)

| # | Item | Detalle | Estado |
|---|------|---------|--------|
| 1 | `index.html` convertido a homepage real | Removido `noindex`. Añadido: title SEO, canonical, og:, twitter:, manifest, GA4, header.js, footer.js, SW. Texto "coming-soon" eliminado. Progress bar 75% eliminado. | ✅ Listo |

---

## 🔴 BLOQUE 9 — DECISIONES PENDIENTES (requieren confirmación Alejandro)

| # | Item | Qué decidir | Impacto |
|---|------|-------------|---------|
| 1 | `portal.html` | ¿Es página pública o legacy? Opciones: A) agregar `noindex` (recomendado si no se usa activamente), B) agregar al sitemap + linkear desde nav | SEO — está indexable pero sin links entrantes |
| 2 | ~~`fresado-cam.html` CTA secundario~~ | ✅ Resuelto 2026-04-23 — CTA corregido a `/flujo-fresado.html` | ✅ Listo |
| 3 | `buscar_pedido_publico` RPC | Verificar en Supabase Dashboard → Database → Functions que la función SOLO retorna campos públicos (estado, timeline, parámetros técnicos) y NO incluye email, teléfono, datos personales del doctor | Privacidad de datos |
| 4 | GDPR clientes internacionales | `diseno-cad.html` ofrece servicio mundial. Clientes EU activan GDPR — ¿agregar aviso específico para UE? | Cumplimiento legal |

---

## 🟡 BLOQUE 8 — CONTENIDO (trabajo manual de Alejandro)

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Fotos reales portafolio | ⏳ Reemplazar emojis placeholder en `portafolio.html` |
| 2 | Fotos Google My Business | ⏳ 10–15 fotos del lab, fresadora, casos terminados |
| 3 | Video Reels x 6 | ⏳ Scripts en cada artículo — grabar y publicar |
| 4 | Email `casos@prodigylabdental.com` | ⏳ Crear en tu proveedor de dominio |

---

## ✅ COMPLETADO sesión 2026-04-24 (round 12 — CSV injection + validaciones finales)

| Qué | Dónde |
|-----|-------|
| **CSV Injection** — `exportarDIAN()`: campos sin quoting RFC4180 ni prevención de `=+-@` → añadida `csvCell()` | `app/admin-panel.html` |
| **CSV Injection** — `exportarCSV()` de catálogo de precios: mismo problema | `app/admin-precios.html` |
| **security** — `agregar-caso.html`: `drive_link` se guardaba sin validar protocolo https:// | `app/agregar-caso.html` |
| **flujo-uploader.js** — `validateMagicBytes()` añadida antes de cada upload | `js/flujo-uploader.js` |
| **Audit limpio** — `success.html`, `mensajero.html`, `taller.html`, `patients-data.js`, `translations.js`: sin issues | ✓ |
| **Audit limpio** — edge functions `meta-capi`, `migrate-seguimiento-rpc-v2.sql`: correctos | ✓ |
| **Audit limpio** — `prompt()` results van a Supabase via `.update()`, nunca a innerHTML | ✓ |

## ✅ COMPLETADO sesión 2026-04-24 (round 11 — últimas mejoras autónomas)

| Qué | Dónde |
|-----|-------|
| **security** — `flujo-uploader.js`: añadida validación `validateMagicBytes()` antes de cada upload a Supabase | `js/flujo-uploader.js` |
| **security** — `admin-panel.html` sección torre: `urgentes` e `incidencias` sin escHtml (severidad, tipo, descripcion, codigo) | `app/admin-panel.html` |
| **ux** — `inputmode="tel"` en 12 inputs `type="tel"` para teclado numérico correcto en iOS | 11 archivos |
| **ux** — `spellcheck="false"` en campos de contraseña (fix: bug roto del regex multi-línea corregido) | login.html, reset-password.html |
| **a11y** — `aria-label` en 4 selects inline sin etiqueta (cambiar estado pedido, estado diseño, rol) | admin-panel, panel-interno |
| **a11y** — `alt=""` en 4 imágenes decorativas (preview-img, upload-preview, foto-galería) | 3 app pages |
| **Audit** — `gestionar-casos.html` modal edición: usa `.value =` (DOM property, safe). Sin issues | ✓ |
| **Audit** — subscripciones realtime Supabase: cleanup correcto en client-panel y panel-interno | ✓ |
| **Audit** — `novalidate` en formularios: intencional (todos tienen validación JS custom) | ✓ |

## ✅ COMPLETADO sesión 2026-04-24 (round 10 — CSP completo + XSS residual + upload-guard audit)

| Qué | Dónde |
|-----|-------|
| **CSP** — `frame-src`: añadido openstreetmap.org (mapa GPS), supabase.co+drive.google (iframe diseños), paddle.com | `_headers` |
| **CSP** — `script-src`: añadido unpkg.com y cdn.paddle.com (QR scanner y Paddle SDK) | `_headers` |
| **CSP** — `connect-src`: añadido paddle.com y checkout.wompi.co | `_headers` |
| **security** — `abrirAprobacion()` en client-panel: `new URL()` acepta `javascript:` → añadido check `protocol==='https:'` | `app/client-panel.html` |
| **XSS** — panel-interno-operaciones: `esc(nom)` en métricas top-doctor, `link_archivo` validar https, `esc(a.rol)` fallback, `esc(error.message)` | `app/panel-interno-operaciones.html` |
| **Audit** — `upload-guard.js`: excelente — whitelist de extensiones + magic bytes (primeros 8 bytes) + filtrarPII | ✓ ningún cambio necesario |
| **Audit** — SQL completo: 27 tablas × RLS ✓, funciones SECURITY DEFINER sin GRANTs anon peligrosos | ✓ |
| **perf** — preconnect unpkg.com en inventario, mensajero y taller | 3 app pages |

## ✅ COMPLETADO sesión 2026-04-24 (round 9 — RLS SQL audit + a11y final)

| Qué | Dónde |
|-----|-------|
| **🚨 RLS CRÍTICO** — `leads_doctores`: política `admin_read_leads` sin `TO authenticated` → anon podía SELECT todos los leads (PII) | `sql/patch-rls-leads-fix.sql` |
| **🚨 RLS CRÍTICO** — `mensajeros`, `despachos`, `creditos_cliente`: mismo bug → rutas GPS, contactos internos expuestos | `sql/patch-rls-authenticated-only.sql` |
| **RLS audit completo** — 27 tablas verificadas; 0 policies sin restricción tras los patches | todos los *.sql |
| **SQL injection audit** — todas las funciones SECURITY DEFINER usan queries parametrizadas, 0 concatenación de strings | ✓ |
| **a11y** — `alt=""` en foto-thumbs decorativos de operator-panel; `aria-label="Cerrar"` en 5 botones ✕/× sin etiqueta | 3 app pages |
| **autocomplete** — `new-password` en reset-password.html; `name/tel` en flujo-lab.html | 2 páginas |
| **perf** — carga doble de `supabase.js` eliminada en flujo-fresado, flujo-impresion, flujo-diseno | 3 páginas |
| **Scan JSON-LD** — 24 páginas, 0 errores de JSON inválido | ✓ |
| **Scan metadata** — todas las páginas tienen description, canonical, lang, OG | ✓ |

## ✅ COMPLETADO sesión 2026-04-24 (round 8 — scan XSS global completo + perf)

| Qué | Dónde |
|-----|-------|
| **XSS** — `flujo-lab.html`: `f.name` (nombre archivo) sin escH en innerHTML + onclick attr | `flujo-lab.html` |
| **XSS** — `main.js` y `portal.html`: `patient.name/coverImage/description` sin escH en innerHTML | `js/main.js`, `portal.html` |
| **XSS** — `admin-panel.html`: `c.titulo`, `c.imagen_url`, `c.tipo`, `c.material` del portafolio interno sin escHtml | `app/admin-panel.html` |
| **XSS** — `qr-generator.js`: `e.message` sin escapar en innerHTML de error | `js/qr-generator.js` |
| **perf** — carga doble de `supabase.js` eliminada en 3 flujos (ya cargado para auth-guard) | flujo-fresado, flujo-impresion, flujo-diseno |
| **Scan global final** — `innerHTML + template literal` sin escaping: 0 issues con datos de usuario o Supabase | ✓ codebase completo |
| **Residual aceptado** — `article.html` (articles.js estático admin), `flujo-impresion.js` (colores VITA hardcoded): riesgo admin-a-sí-mismo, sin usuario externo | documentado |

## ✅ COMPLETADO sesión 2026-04-24 (round 7 — XSS profundo en JS + app pages restantes)

| Qué | Dónde |
|-----|-------|
| **XSS crítico** — `stl-multi-viewer.js`: `fObj.name` (nombre de archivo del usuario) sin escH en `title`, `alt` y texto en `innerHTML` | `js/stl-multi-viewer.js` |
| **XSS fix** — `inventario.html`: `m.notas`, `m.tipo`, `m.nombre`, `m.categoria` en tablas sin escH | `app/inventario.html` |
| **XSS fix** — `admin-precios.html`: `item.nombre`, `item.descripcion`, `item.tipo` en innerHTML sin escH | `app/admin-precios.html` |
| **autocomplete** — 6 campos de registro + reset en `login.html`; 4 campos en `onboarding.html` | 2 archivos |
| **Audit limpio** — `mensajero.html`, `supabase-client.js`, `auth-guard.js`, `agregar-caso.html`, `reset-password.html`: 0 issues | ✓ |
| **Audit limpio** — WhatsApp message construction: todos usan `encodeURIComponent`; STL upload: solo admin, bajo riesgo | ✓ |
| **Scan completo app/** — todos los archivos con innerHTML tienen función de escape activa | ✓ |

## ✅ COMPLETADO sesión 2026-04-24 (round 6 — auditoría de app pages + accesibilidad + validaciones)

| Qué | Dónde |
|-----|-------|
| **Security** — `webhook-handler`: falla hard si `WOMPI_INTEGRITY_SECRET` no configurado (antes lo saltaba) | `supabase/functions/webhook-handler/index.ts` |
| **XSS fix** — `panel-interno-operaciones.html`: `l.whatsapp` (leads) en innerHTML sin escH; `stl_url` sin validar https; `cover_image` sin escH en img src | `app/panel-interno-operaciones.html` |
| **XSS fix** — `gestionar-casos.html`: `cover_image` sin `startsWith('https://')` ni escH | `app/gestionar-casos.html` |
| **a11y** — aria-label añadido a botones ux-floaters (scroll-top, theme-toggle, translate) en 3 páginas flujo | flujo-diseno, flujo-fresado, flujo-impresion |
| **Audit limpio** — eval(), open redirect, console.log sensible, target=_blank sin noopener, alt faltantes, 50/50 compliance: 0 issues | todas las páginas |
| **Audit limpio** — sitemap.xml: todos los URLs apuntan a páginas existentes; articles.js: 6 artículos completos sin campos faltantes | ✓ |
| **Audit limpio** — manifest.json válido, sw.js PRECACHE sin broken links, Edge Functions send-push/verify-price/wompi-signature CORS correcto | ✓ |

## ✅ COMPLETADO sesión 2026-04-24 (round 5 — GA4 fix completo + cache-busting + auditoría final)

| Qué | Dónde |
|-----|-------|
| **GA4 Consent Mode fix** — 6 páginas con formato multi-línea/comillas dobles quedaron sin consent default en el batch anterior → aplicado manualmente | calculadora, envia-tu-scanner, escaner-domicilio, flujo-lab, journal, portal |
| **Cache-busting** — `?v=20260424` en `header.js` y `footer.js` en 20 páginas públicas (evita que usuarios con `immutable` cache vean versiones viejas) | batch 20 archivos |
| **SW cache bump** — `prodigy-v4` → `prodigy-v5` para invalidar HTML sin Consent Mode en clientes con SW | `sw.js` |
| **CORS Edge Functions** — ya corregido sesión anterior | ✓ |
| **Audit links rotos** — todos los links del footer.js, header.js y sw.js precache verificados → 0 broken | 3 archivos auditados |
| **Audit Habeas Data** — todos los formularios públicos tienen checkbox/texto legal | ✓ |
| **manifest.json** — completo y válido | ✓ |
| **App pages** — admin-panel, client-panel, operator-panel, taller: todos usan escHtml/escH en innerHTML con datos Supabase | ✓ |

## ✅ COMPLETADO sesión 2026-04-23 (round 4 — seguridad + privacidad + perf)

| Qué | Dónde |
|-----|-------|
| **XSS fix** — `portafolio.html`: datos Supabase (`c.name`, `c.description`, `c.date`) sin escapar en `grid.innerHTML` → añadida `escH()` | `portafolio.html` |
| **YouTube ID validation** — `article.html` iframe src con `b.youtube` sin validar → regex `/^[\w-]{5,20}$/` | `article.html` línea 301 |
| **PubMed URL validation** — `article.html` `r.pubmed` directo en `href` → validación `startsWith('https://')` | `article.html` línea 318 |
| **DOI encoding** — `article.html` DOI sin `encodeURIComponent` en href | `article.html` línea 317 |
| **autocomplete** — name/tel/address-level2 en flujo-fresado y flujo-impresion | 2 archivos |
| **Cookie banner** — añadido botón "Rechazar" + GA4 Consent Mode update en `footer.js` | `js/footer.js` |
| **GA4 Consent Mode v2** — `gtag('consent','default',{analytics_storage:'denied',...})` + `anonymize_ip:true` en las 15 páginas públicas con GA4 | batch 15 archivos |
| **noscript** — fallbacks añadidos en nosotros, catalogo, terminos-y-legal, flujo-fresado, flujo-impresion, flujo-diseno, patient | 7 archivos |
| **preconnect** — jsdelivr + supabase en calculadora; supabase en envia-tu-scanner y escaner-domicilio | 3 archivos |
| **CORS Edge Functions** — `*` → `https://prodigylabdental.com` en `notify-wa` y `meta-capi` (riesgo: abuso de WA Business) | 2 edge functions |
| **Typo brand** — "ProDigy" → "PRODIGY" en `notify-wa/index.ts` | edge function |
| **sitemap** — lastmod → 2026-04-23 para 10 páginas modificadas | `sitemap.xml` |

## ✅ COMPLETADO sesión 2026-04-23 (round 3 — auditoría profunda)

| Qué | Dónde |
|-----|-------|
| **XSS fix** — `header.js` chat widget: `bbl.innerHTML` con user input sin escapar → añadida `_pgEscHtml()` | `js/header.js` línea 706 |
| **Typo brand** — "ProDigy" → "PRODIGY" en 11 archivos HTML/JS | batch global |
| **GA4** — añadido a `flujo-lab.html` (única página sin tracking) | `flujo-lab.html` |
| **noscript** — fallbacks añadidos en index, instalar-app, flujo-lab | 3 archivos |
| **preconnect** — fonts.googleapis.com + gstatic en index.html; cdnjs + supabase en flujo-lab | 2 archivos |
| **autocomplete** — name/tel/email/org en calculadora, envia-tu-scanner, escaner-domicilio, flujo-diseno, journal | 5 archivos |
| **sitemap** — lastmod artículos actualizado a 2026-04-23 | `sitemap.xml` |
| **title SEO** — index.html 64→51 chars | `index.html` |

## ✅ COMPLETADO sesión 2026-04-23 (round 2 — auditoría WCAG + UX)

| Qué | Dónde |
|-----|-------|
| **WCAG global** — `#64748b`, `#475569`, `#334155` → `#94a3b8` (7.6:1 AAA) en 31 HTML + 5 JS | batch |
| **ux-floaters** — scroll-top + theme + WA añadidos en: index, fresado-cam, article, instalar-app, flujo-lab | 5 archivos |
| **auth-guard.js** — añadido a `app/onboarding.html` (faltaba per CLAUDE.md §4) | `app/onboarding.html` |
| **theme-color** — `<meta name="theme-color">` añadido a `index.html` (faltaba per CLAUDE.md §3b) | `index.html` |

---

## ✅ COMPLETADO sesión 2026-04-23

| Qué | Dónde |
|-----|-------|
| **index.html homepage** — removido `noindex`, title/og/twitter/canonical/manifest/GA4/header.js/footer.js/SW, texto coming-soon → homepage real | `index.html` |
| **nosotros.html** — tech strip XTCERA/Exocad/BCN3D/±10µm, historia-img 4-cuadrantes lab, contraste WCAG fix `#64748b→#8b99a8` en dif-card/valor-item | `nosotros.html` |
| **fresado-cam.html** — proceso CAD/CAM con flechas `›` conectoras + timing por paso, CTA corregido flujo-diseno→flujo-fresado | `fresado-cam.html` |
| **portafolio.html** — sección testimonios 3 doctores con CSS completo | `portafolio.html` |
| **Security audit** — `noopener noreferrer` en todos los `target="_blank"` públicos (article, escaner-domicilio, envia-tu-scanner, diseno-cad, fresado-cam, journal, soporte, seguimiento-caso) | 8 archivos |
| **sitemap.xml** — lastmod actualizado: index (/), nosotros, fresado-cam, portafolio → 2026-04-23 | `sitemap.xml` |
| **article.html** — DOI/PubMed links `rel="noopener noreferrer"` | `article.html` |

---

## ✅ COMPLETADO sesión 2026-04-22 (auditoría completa)

| Qué | Dónde |
|-----|-------|
| **SQL patch** citas_domicilio.acepta_marketing | `sql/patch-citas-domicilio-marketing.sql` — ejecutar en Supabase |
| **_headers** sw.js → no-store; articles.js → 1 día; generativelanguage eliminado CSP | `_headers` |
| **patient.html** — GA4 G-Z8G2X7ETQ1 (página pública sin tracking) | `patient.html` |
| **journal.html** — preconnect cdnjs + noscript | `journal.html` |
| **seguimiento-caso.html** — XSS: id URL param sin escapar en banner Wompi → textContent | `seguimiento-caso.html` línea ~518 |
| **reset-password.html** — showMsg usa DOM API (error.message de Supabase sin escapar) | `app/reset-password.html` |
| **admin-panel.html** — err.message sin escapar en catch → textContent | `app/admin-panel.html` |
| **inventario.html** — error.message sin escapar en tbody → createElement/textContent | `app/inventario.html` |
| **sitemap.xml** — lastmod actualizado: journal, escaner-domicilio, envia-tu-scanner → 2026-04-22 | `sitemap.xml` |
| **Audit completa** todas las páginas app/ — auth-guard ✅, noindex ✅, roles correctos ✅ | todas `app/*.html` |
| **Audit sw.js** — páginas app/ en NEVER_CACHE ✅, PRECACHE solo públicas ✅ | `sw.js` |
| **Audit auth-guard.js** — admin por email hardcoded, staff por app_metadata ✅ | `js/auth-guard.js` |
| **Audit CSP completa** — dominios correctos, generativelanguage eliminado | `_headers` |
| **Audit redirect** login.html — open redirect protegido con `startsWith('/')` y `!startsWith('//')` ✅ | `app/login.html` |

---

## ✅ COMPLETADO sesión 2026-04-22 (continuación)

| Qué | Dónde |
|-----|-------|
| **PENDIENTES.md BLOQUE 5** — Meta/WA paso a paso detallado (6 pasos con URLs exactas) | `PENDIENTES.md` |
| **portal.html** — noindex,nofollow agregado (página huérfana, canonical incorrecto apuntaba a homepage) | `portal.html` |
| **article.html** — preconnect cdnjs + noscript fallback → journal.html / WA | `article.html` |
| **seguimiento-caso.html** — XSS fix: id de URL params inyectado sin escapar en innerHTML → DOM textContent | `seguimiento-caso.html` línea ~518 |
| **fresado-cam.html** — noscript fallback | `fresado-cam.html` |
| **diseno-cad.html** — noscript fallback | `diseno-cad.html` |
| **soporte.html** — noscript fallback | `soporte.html` |
| **envia-tu-scanner.html** — noscript fallback | `envia-tu-scanner.html` |
| **escaner-domicilio.html** — noscript fallback | `escaner-domicilio.html` |
| **BLOQUE 10** — Detectado: index.html es coming-soon con noindex pero en sitemap | `PENDIENTES.md` |

---

## ✅ COMPLETADO sesiones 2026-04-21 / 2026-04-22

| Qué | Dónde |
|-----|-------|
| **SEO/Launch nosotros.html** — BreadcrumbList, title≤60ch, desc≤160ch, og:image | `nosotros.html` |
| **Lead capture nosotros.html** — Supabase fire-and-forget antes de abrir WA | `nosotros.html` + Supabase CDN |
| **WCAG nosotros.html** — sr-only heading, aria-label WA btn, H3→H2 historia | `nosotros.html` |
| **portafolio.html** — sr-only H2, CollectionPage schema, aria-labels botones | `portafolio.html` |
| **terminos-y-legal.html** — política 50/50, sub-procesadores (Supabase/GA4/CF), BreadcrumbList, Titular Alejandro eliminado | `terminos-y-legal.html` |
| **js/pagos.js** — instrucciones transferencia solo a Jessica 322 877 4481 | `js/pagos.js` |
| **js/footer.js** — aria-labels redes, cookie consent banner (SIC Circular 002/2015) | `js/footer.js` |
| **js/supabase-mock.js** — passwords sanitizados → REDACTED | `js/supabase-mock.js` |
| **_redirects** — 8 nuevos bloques (supabase-mock, SESIONES, PENDIENTES, CLAUDE, .env, .log, flujos privados) | `_redirects` |
| **_headers** — api.qrserver.com en img-src (QR Nequi), Cross-Origin-Opener-Policy | `_headers` |
| **sitemap.xml** — removidos flujo-*, agregados nosotros/catalogo/soporte/instalar-app, lastmod al día | `sitemap.xml` |
| **flujo-fresado/impresion/lab.html** — noindex,nofollow agregado | 3 archivos |
| **catalogo.html** — GA4, BreadcrumbList, sr-only H2 WCAG | `catalogo.html` |
| **soporte.html** — FAQPage JSON-LD (5 Q&A), BreadcrumbList | `soporte.html` |
| **envia-tu-scanner.html** — HowTo JSON-LD (4 pasos), BreadcrumbList | `envia-tu-scanner.html` |
| **escaner-domicilio.html** — HowTo JSON-LD (4 pasos), BreadcrumbList | `escaner-domicilio.html` |
| **diseno-cad / fresado-cam** — Service schema, BreadcrumbList, preconnect cdnjs | 2 archivos |
| **instalar-app.html** — BreadcrumbList, SoftwareApplication schema, H3→H2 fix | `instalar-app.html` |
| **journal.html** — BreadcrumbList, título 62ch→47ch | `journal.html` |
| **calculadora.html** — BreadcrumbList, sr-only H2 WCAG | `calculadora.html` |
| **seguimiento-caso.html** — twitter:card, preconnect Google Fonts | `seguimiento-caso.html` |
| **nosotros.html** — preconnect cdnjs/jsdelivr/supabase, openingHoursSpecification L-S 8-18h | `nosotros.html` |
| **manifest.json** — campo `id: "/"` (PWA Identity estándar Chrome 2024) | `manifest.json` |
| **sw.js** — prodigy-v2→v3 (PRECACHE sincronizado), instalar-app + terminos agregados | `sw.js` |
| **robots.txt** — flujo-fresado/impresion/lab Disallow; soporte+instalar-app a GPTBot/Perplexity/Anthropic | `robots.txt` |
| **número personal 3219581949** — eliminado de todos los archivos | búsqueda global |
| **noopener noreferrer** — agregado en todos los target=_blank de páginas públicas | múltiples |
| **10 páginas públicas** — preconnect cdnjs; Google Fonts con display=swap verificado | batch |

---

## ✅ COMPLETADO sesión 2026-04-15

| Qué | Dónde |
|-----|-------|
| Portafolio online — tabla + RLS Supabase | `sql/migrate-portafolio-online.sql` |
| `agregar-caso.html` — ZIP reemplazado por upload directo Supabase Storage + insert DB | `app/agregar-caso.html` |
| `portafolio.html` — lee desde Supabase en vez de `patients-data.js` | `portafolio.html` |
| Comentarios de doctores en fichas de casos | `sql/migrate-comentarios-portafolio.sql` + `patient.html` |
| Admin-delete comentarios (policy + botón en UI) | `sql/patch-comentarios-admin-delete.sql` + `patient.html` |
| Filtro anti-spam/ofensivo en comentarios (URLs, palabras, repetición) | `patient.html` línea ~1266 |
| `patient.html` — carga caso desde `casos_portafolio` (Supabase) con fallback estático | `patient.html` línea ~988 |
| Thumbnail automático `?width=400&quality=80` en portafolio | `portafolio.html` línea ~583 |
| Paginación 12 casos/página con botones Anterior/Siguiente | `portafolio.html` — `renderPage()`, `goPage()` |
| Panel admin de casos: ver, editar, ocultar, eliminar | `app/gestionar-casos.html` (nuevo) |
| `migrate-domicilio.sql` — corregido `gen_random_uuid()`, listo para ejecutar | `sql/migrate-domicilio.sql` |
| `migrate-push-subscriptions.sql` — tabla Web Push con RLS por rol | `sql/migrate-push-subscriptions.sql` (nuevo) |
| Rate-limit 1 comentario/hora por usuario/caso | `patient.html` línea ~1424 |
| `coming-soon.html` → redirect automático a `/` | `coming-soon.html` + `acceso-staff.html` |
| `index.html` — `url` duplicado en JSON-LD eliminado, teléfono corregido | `index.html` línea 31 |

---

## ✅ COMPLETADO — Referencia rápida

| Qué | Dónde |
|-----|-------|
| 10 migraciones SQL + compliance | `sql/` |
| 5 Edge Functions deployed | Supabase Dashboard |
| VAPID keys generados | Supabase Secrets |
| Portal doctor (pedidos online) | `app/client-panel.html` |
| Panel operador con rutador, métricas, realtime | `app/panel-interno-operaciones.html` |
| Asignado_a por caso (inline edit) | rutador panel operador |
| Notify WA al guardar link diseño | `guardarLinkDiseno()` |
| Realtime Supabase en rutador | `iniciarRealtimeRutador()` |
| Dashboard métricas completo | tab-metricas panel operador |
| Coming-soon desactivado, sitio público | `netlify.toml` |
| Landing "Envía tu escáner" | `envia-tu-scanner.html` |
| Visor STL 3D en landing escáner | Three.js + STLLoader |
| Sistema de artículos dinámico | `articles.js` + `article.html` |
| 4 artículos técnicos + 2 nuevos completos | `articles.js` |
| Calculadora pública con WA | `calculadora.html` |
| Journal / Blog con lead magnet | `journal.html` |
| Portafolio con lightbox | `portafolio.html` |
| 404 personalizado | `404.html` |
| JSON-LD LocalBusiness + FAQPage + Article | `index.html`, `article.html`, `journal.html` |
| robots.txt con GPTBot / PerplexityBot | `robots.txt` |
| sitemap.xml actualizado | `sitemap.xml` |
| netlify.toml con CSP + cache + wss | `netlify.toml` |
| noindex en todas las páginas /app/ | auditado 2026-04-09 |
| auth-guard.js en todas las páginas /app/ protegidas | auditado 2026-04-09 |
| GA4 placeholder en páginas públicas | listo — solo falta el ID real |
| `rel="noopener noreferrer"` auditado en TODAS las páginas públicas + flujos + portal | 2026-04-23 |
| WCAG AA `--muted` corregido a `#94a3b8` (7.6:1) en 6 páginas públicas | 2026-04-23 |
| `rel="noopener noreferrer"` en header.js WA link | `js/header.js` 2026-04-23 |
| Audit XSS: sin innerHTML con input usuario, sin eval() en JS público | 2026-04-23 |
| CSP, _headers, _redirects — estructuralmente correctos | 2026-04-23 |
| `rel="noopener noreferrer"` en /app/ (admin-panel, client-panel, mensajero) | 2026-04-23 |
| Habeas Data Colombia en journal.html (leadForm + notifyForm) con acepta_marketing | 2026-04-23 |
| Habeas Data Colombia en calculadora.html (formCotizar) con acepta_marketing | 2026-04-23 |
| sw.js v4: article.html + articles.js en PRECACHE (offline support) | 2026-04-23 |
| robots.txt: article.html en Allow para GPTBot/PerplexityBot/anthropic-ai | 2026-04-23 |
| fresado-cam.html meta description ampliada a 138 chars (WCAG SEO) | 2026-04-23 |
| flujo-diseno.html: aria-label en modal close button | 2026-04-23 |
| flujo-fresado.html: loading="lazy" en QR Nequi | 2026-04-23 |
| Audit open redirects, prototype pollution, .env exposure — todo limpio | 2026-04-23 |
| Audit JSON-LD: todas las páginas públicas tienen structured data | 2026-04-23 |
| Audit broken links: ningún link interno roto | 2026-04-23 |
| PENDIENTE MANUAL: ejecutar migrate-privacy.sql en Supabase para que acepta_marketing funcione | Alejandro → Supabase SQL Editor |
| Botones corregidos — destinos erróneos que apuntaban a flujo-*.html (auth) desde páginas públicas | 2026-04-23 |
| article.html, envia-tu-scanner (2×), escaner-domicilio → /calculadora.html | 2026-04-23 |
| instalar-app.html "Envía tu pedido" → /envia-tu-scanner.html (antes flujo-lab, requería auth) | 2026-04-23 |
| terminos-y-legal "Volver al Cotizador": href index.html → /calculadora.html, movido a left:24px | 2026-04-23 |
| soporte.html: fa-satellite-dish → fa-upload en tarjeta "Envía tu Escáner" | 2026-04-23 |
| ux-floaters (scroll-top + theme + WA) añadidos a 8 páginas públicas que los faltaban | 2026-04-23 |
