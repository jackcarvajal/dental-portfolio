# PRODIGY — PENDIENTES MAESTRO
> Fuente única de verdad. Ordenados por bloque. Actualizar al completar.
> Última revisión: 2026-04-09

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
| 13 | `sql/migrate-scanner.sql` | Tabla `solicitudes_scanner` (escáner landing) | ⏳ **Pendiente** — correr en SQL Editor |

---

## 🔴 BLOQUE 2 — SUPABASE STORAGE

| # | Acción | Detalle | Estado |
|---|--------|---------|--------|
| 1 | Crear bucket `casos` | Visibilidad: **Private** | ⏳ Pendiente |
| 2 | Crear bucket `evidencias-entrega` | Visibilidad: **Private** | ⏳ Pendiente |
| 3 | Crear bucket `scanner-uploads` | Visibilidad: **Private** + política INSERT para anon | ⏳ Pendiente |
| 4 | Settings → Auth → Site URL | Cambiar a `https://prodigylabdental.com` | ⏳ Pendiente |
| 5 | Settings → Auth → Redirect URLs | Agregar `https://prodigylabdental.com/**` | ⏳ Pendiente |
| 6 | Tabla `push_subscriptions` | `case_id text, endpoint text, p256dh text, auth text, created_at timestamptz` | ⏳ Pendiente |

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
| `WOMPI_INTEGRITY_SECRET` | Wompi Dashboard → Claves → Integrity Key | ⏳ Pendiente (cuando activen cuenta) |
| `PADDLE_API_KEY` | dashboard.paddle.com → Developer → API Keys | ⏳ Pendiente |

---

## 🟡 BLOQUE 5 — PLATAFORMAS EXTERNAS

### Meta / WhatsApp Business API ← **Prioridad alta**
| Acción | Detalle | Estado |
|--------|---------|--------|
| Crear App en Meta Developers | developers.facebook.com → tipo Business | ⏳ Pendiente |
| Agregar producto WhatsApp | App → Add Product → WhatsApp | ⏳ Pendiente |
| Obtener Phone Number ID | WhatsApp Manager → número 3212816716 | ⏳ Pendiente |
| Crear System User + token | business.facebook.com → Settings → System Users | ⏳ Pendiente |
| Verificar dominio | prodigylabdental.com → Meta Business → Brand Safety | ⏳ Pendiente |

> Una vez completado: `notify-wa` activa notificaciones WA reales al doctor al avanzar estado.

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
| 1 | Search Console | Verificar `prodigylabdental.com` → enviar `sitemap.xml` | ⏳ Pendiente |
| 2 | Google My Business | Crear perfil con fotos del lab, horario, dirección Bogotá | ⏳ Pendiente |
| 3 | Analytics GA4 | Crear propiedad → copiar Measurement ID → reemplazar `G-XXXXXXXXXX` en el script que ya está en las páginas públicas | ⏳ Solo necesita el ID |

---

## 🟡 BLOQUE 8 — CONTENIDO (trabajo manual de Alejandro)

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Fotos reales portafolio | ⏳ Reemplazar emojis placeholder en `portafolio.html` |
| 2 | Fotos Google My Business | ⏳ 10–15 fotos del lab, fresadora, casos terminados |
| 3 | Video Reels x 6 | ⏳ Scripts en cada artículo — grabar y publicar |
| 4 | Email `casos@prodigylabdental.com` | ⏳ Crear en tu proveedor de dominio |

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
