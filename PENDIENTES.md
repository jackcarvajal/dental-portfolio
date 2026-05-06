# PRODIGY — PENDIENTES MAESTRO
> Solo tareas activas. Última revisión: 2026-05-05
> Completadas → eliminar. Nuevas → agregar arriba de su bloque.

---

## 🔴 URGENTE — ALEJANDRO (bloquean funcionalidades activas)

| # | Acción | Dónde | Detalle |
|---|--------|-------|---------|
| 1 | **STRIPE_SECRET_KEY** en Cloudflare | Pages → Settings → Env vars | Pagos rotos sin esto |
| 2 | **WOMPI_INTEGRITY_SECRET** en Supabase Secrets | Dashboard → Edge Functions → Secrets | Webhook de pago falla |
| 3 | **SQL: citas_domicilio.acepta_marketing** | Supabase SQL Editor | `sql/patch-citas-domicilio-marketing.sql` |
| 4 | **Subir casos al portafolio** | `/app/panel-interno-operaciones.html` | Mínimo 5 casos con portada + galería |

---

## 🟡 SUPABASE — SQL pendiente

| # | Archivo | Qué hace |
|---|---------|---------|
| 1 | `sql/migrate-lead-sources.sql` | Fuentes de leads (UTM tracking) |
| 2 | `sql/migrate-inventario-implantes.sql` | Inventario de implantes |
| 3 | `sql/migrate-push-notifications.sql` | Tabla Web Push subscriptions |

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
| **Paddle** | Crear producto → copiar `pri_...` en `js/pagos.js` | ⏳ |
| **PayPal** | Whitelist `https://prodigylabdental.com` en Return URLs | ⏳ |

---

## 🟡 SEO / GOOGLE

| # | Acción | Estado |
|---|--------|--------|
| 1 | Search Console → re-enviar `sitemap.xml` | ⏳ |
| 2 | Google My Business → subir 10-15 fotos del lab | ⏳ |
| 3 | GA4 Real Time → verificar que llegan hits | ⏳ |
| 4 | Google Ads ID → reemplazar `AW-XXXXXXXXX` en `js/conversions.js` línea 12 | ⏳ |

---

## 🎨 CONTENIDO VISUAL — ALEJANDRO

| # | Contenido | Dónde | Impacto |
|---|-----------|-------|---------|
| 1 | 5-10 capturas Exocad reales | Portafolio, diseno-remoto, diseno-cad | 🔴 |
| 2 | Video 30-60 seg OBS: STL → diseño | diseno-remoto hero | 🔴 |
| 3 | Foto tuya en PC con Exocad | nosotros.html, diseno-cad | 🟡 |
| 4 | Antes/después: STL crudo vs. diseño | diseno-remoto, diseno-cad | 🟡 |
| 5 | Logo PRODIGY en SVG oficial | header, footer, og:image | 🟡 |
| 6 | Foto del laboratorio/taller | nosotros.html | 🟢 |
| 7 | Email `casos@prodigylabdental.com` | crear en proveedor de dominio | 🟢 |

---

## 📱 TIKTOK @prodigylabdental

| # | Acción |
|---|--------|
| 1 | Completar perfil: bio + link `/diseno-remoto` + foto |
| 2 | Cambiar a Cuenta Creador: Settings → Manage account |
| 3 | Conectar Instagram @labdentalprodigy |
| 4 | Grabar video #1: "¿Cómo envías tu STL?" — 30 seg OBS |
| 5 | Grabar video #2: time-lapse diseño Exocad — 45 seg |
| 6 | Grabar video #3: "¿Cuánto cuesta diseño CAD?" — muestra calculadora |

---

## 🔍 PENDIENTES TÉCNICOS (Claude)

| # | Tarea | Notas |
|---|-------|-------|
| 1 | Verificar RPC `buscar_pedido_publico` solo retorna campos públicos | Supabase → Database → Functions |
| 2 | GDPR aviso específico para clientes UE en `diseno-cad.html` | `diseno-remoto.html` ofrece servicio mundial |
| 3 | Precios calculadoras sincronizados con Supabase `admin-precios` | Hoy hardcodeados — cambio arquitectural |
