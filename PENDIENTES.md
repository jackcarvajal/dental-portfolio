# PRODIGY — PENDIENTES MAESTRO
> Fuente única de verdad. Ordenados por bloque. Actualizar al completar.
> Última revisión: 2026-04-15

---

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
| 1 | Search Console | Verificar dominio + sitemap enviado + validación corrección iniciada | ✅ Listo |
| 2 | Google My Business | Perfil creado y activo — faltan fotos del lab | ⏳ Subir 10-15 fotos |
| 3 | Analytics GA4 | `G-Z8G2X7ETQ1` activo en index, calculadora, journal, envia-tu-scanner, escaner-domicilio | ✅ Listo |

---

## 🟡 BLOQUE 8 — CONTENIDO (trabajo manual de Alejandro)

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Fotos reales portafolio | ⏳ Reemplazar emojis placeholder en `portafolio.html` |
| 2 | Fotos Google My Business | ⏳ 10–15 fotos del lab, fresadora, casos terminados |
| 3 | Video Reels x 6 | ⏳ Scripts en cada artículo — grabar y publicar |
| 4 | Email `casos@prodigylabdental.com` | ⏳ Crear en tu proveedor de dominio |

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
