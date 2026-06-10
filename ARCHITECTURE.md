# PRODIGY Lab Dental — Architecture Overview

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS, HTML5, CSS3 — sin frameworks |
| Hosting | Cloudflare Pages (CDN global, edge functions) |
| Database | Supabase (PostgreSQL + RLS + Realtime + Storage) |
| Auth | Supabase Auth (JWT, app_metadata.role para roles staff) |
| AI | Gemini 2.0 Flash (chatbot + auto-journal + social copy) |
| Payments | Stripe Checkout (edge function stripe-checkout.js) |
| Notifications | Callmebot WA + Resend email + Web Push |
| PWA | Service Worker v25 (SWR + Push + Background Sync) |

## Estructura de carpetas

```
/
├── app/                     # Rutas protegidas (auth-guard.js obligatorio)
│   ├── panel-interno-operaciones.html  # Staff PRODIGY — gestión pedidos + analytics (dashboard único, 18 tabs)
│   ├── client-panel.html    # Doctores — seguimiento + cotizaciones
│   ├── metricas.html        # BI Dashboard (solo admin/staff)
│   ├── operator-panel.html  # Operario — QA + bulk upload diseños
│   ├── operario-diseno.html # Diseñador — subir diseños HTML/STL
│   ├── mensajero.html       # Mensajero — despacho + offline sync
│   └── ...
├── functions/api/           # Cloudflare Pages Functions (edge)
│   ├── gemini.js            # Proxy chatbot IA (Gemini 2.0 Flash)
│   ├── social-copy.js       # Generador copy redes sociales IA
│   ├── churn-alert.js       # Re-engagement WA para doctores inactivos
│   ├── health-check.js      # Monitor 12 APIs + alertas dual-channel
│   ├── resumen-semanal.js   # Reporte semanal automático
│   ├── csp-report.js        # CSP violation logger → logs_incidencias
│   ├── notify-wa.js         # Notificaciones WA internas
│   ├── factura.js           # Generación de facturas
│   └── stripe-checkout.js   # Creación sesiones de pago Stripe
├── js/
│   ├── header.js            # Nav + chatbot Gemini + Modal Manager
│   ├── footer.js            # Footer + lazy scripts (UTM, GA4, Push)
│   ├── auth-guard.js        # Protección rutas /app/ + session timeout 30min
│   ├── biomecanica-rules.js # 7 reglas clínicas de validación
│   └── ar-viewer.js         # WebXR AR (Android) + QuickLook (iOS) + 3D
├── sql/                     # Scripts SQL para Supabase Dashboard
│   ├── cotizaciones-table.sql    # Tabla cotizaciones + RLS + RPC
│   ├── prodigy-analytics-rpc.sql # 6 RPCs para BI Dashboard
│   ├── revision-tokens-table.sql # Single-use tokens para aprobación email
│   ├── storage-webp-rls.sql      # RLS Supabase Storage con WebP transform
│   └── trigger-doctor-inactivo-churn.sql  # Vista + RPC churn prevention
├── scripts/
│   └── auto-journal.js      # Cron GitHub Actions: artículos IA (mar/jue 9AM)
├── tests/
│   └── smoke-tests.js       # 170 tests — CI antes de cada deploy
├── css/
│   └── styles.css           # Variables + utilidades hover (hover-card-mg, etc.)
├── sw.js                    # Service Worker v25
├── _headers                 # CSP + Cache-Control + CORS headers Cloudflare
├── _redirects               # Clean URLs + bloqueos de rutas privadas
├── manifest.json            # PWA manifest
├── robots.txt               # Bots bloqueados + rutas privadas
└── sitemap.xml              # Sitemap actualizado por auto-journal.js
```

## Modelo de datos (tablas principales Supabase)

| Tabla | Propósito |
|-------|-----------|
| `pedidos` | Casos clínicos — estado_operativo, pagos, archivos STL/HTML |
| `pedidos_doctor` | Vista desnormalizada para médicos |
| `leads_doctores` | Leads desde calculadora y formularios |
| `cotizaciones` | Cotizaciones guardadas desde calculadora (borrador→aceptada) |
| `historial_diseno` | Timeline de cambios por pedido (auditoría) |
| `logs_incidencias` | Log de seguridad: CSP violations, errores, churn alerts |
| `revision_tokens` | Tokens single-use para aprobación de diseños por email |
| `catalogo` | Servicios + precios COP/USD + materiales |
| `bibliotecas_protesis` | Librerías de implantes por doctor |
| `analytics_events` | Eventos de calculadora, artículos, carritos abandonados |

## Seguridad

- **RLS**: Todas las tablas con Row Level Security activo
- **Roles**: `app_metadata.role` (admin/staff/operario) — nunca `user_metadata`
- **XSS**: `escH()` / `textContent` en todo dato externo en innerHTML
- **CSRF**: Edge functions con `x-cron-secret` o `x-admin-token`
- **CORS**: Allowlist explícita (no echo ciego del origin)
- **Open redirect**: Validación `^https://prodigylabdental.com/` en edge functions
- **CSP**: `strict-dynamic https:` + `CSP-Report-Only` para monitoring
- **Auth guard**: Lista hardcodeada de emails admin — no desde DB
- **Session timeout**: 30 min inactividad en rutas /app/
- **Rate limiting**: 5 req/min por IP en Cloudflare Cache API (gemini, email, push)

## Flujos de trabajo

### Flujo de un pedido
```
Doctor (flujo-diseno.html) → Supabase INSERT pedido
  → Realtime → panel-interno-operaciones.html (Nuevo pedido)
  → Operario (operario.html) → sube STL → QA
  → Diseñador (operario-diseno.html) → sube HTML diseño
  → revision-express.html → doctor aprueba vía email (token single-use)
  → Mensajero (mensajero.html) → despacho + evidencia foto
  → Saldo cobrado → factura.js → PDF
```

### Flujo del chatbot
```
Usuario → header.js (_phdrSendMsg) → fetch POST /api/gemini
  → Cloudflare Function → Gemini 2.0 Flash API
  → Fallback chain: 2.0-flash → 2.0-flash-lite → 1.5-flash → 1.5-flash-8b
  → Rate limit 5 req/min (Cloudflare Cache API)
```

### Auto-journal de artículos
```
GitHub Actions (mar/jue 9AM Bogotá)
  → scripts/auto-journal.js
  → Gemini 2.0 Flash (temperatura 0.15 + journals verificados)
  → Fallback a Claude Haiku si Gemini falla
  → Prepende objeto en articles.js + actualiza sitemap.xml
  → GitHub Artifact: marketing-social.txt (copy para redes)
```

## Variables de entorno requeridas

### Cloudflare Pages (Settings → Environment Variables)
| Variable | Uso |
|----------|-----|
| `GEMINI_API_KEY` | Chatbot + social-copy edge function |
| `SUPABASE_URL` | URL proyecto Supabase |
| `SUPABASE_SERVICE_KEY` | Service role key (edge functions) |
| `CRON_SECRET` | Autenticar llamadas automáticas |
| `ADMIN_SECRET` | social-copy.js desde admin panel |
| `CALLMEBOT_APIKEY` | Notificaciones WA via Callmebot |
| `STRIPE_SECRET_KEY` | Stripe checkout |
| `RESEND_API_KEY` | Emails transaccionales |

### GitHub Secrets (Actions)
| Variable | Uso |
|----------|-----|
| `GEMINI_API_KEY` | auto-journal.js cron |

## CI/CD

1. Push a `main` → Cloudflare Pages auto-deploy
2. `.github/workflows/deploy.yml` ejecuta `node tests/smoke-tests.js` (170 tests)
3. Si falla algún test → build bloqueado
4. GitHub Actions cron (mar/jue) → auto-journal.js → commit automático
