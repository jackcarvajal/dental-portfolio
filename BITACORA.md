# 📓 BITÁCORA DE CAMBIOS — Ecosistema Dental (PRODIGY · Alejandro · BSS)

> **Uso:** registro de qué se cambió, qué funciona y qué está pendiente/roto, por fecha.
> **NO se lee en cada sesión** (para no gastar tokens) — se consulta cuando hay que
> retomar algo o saber "en qué punto funcionaba". Se **actualiza** tras cambios
> importantes. Lo más reciente arriba.
>
> Leyenda: ✅ hecho y verificado · 🟡 hecho, falta verificar en vivo · 🔴 abierto/roto · 💡 decisión

---

## 2026-07-17

### 🔴 ABIERTO — Bugs sin resolver
- **Panel `panel-interno-operaciones` → tab "Portafolio" sale en blanco.**
  - El panel SÍ carga y renderiza (tab Pedidos muestra KPIs, filtros, texto blanco visible).
  - Diagnóstico confirmó: `main-content` display=block h=1937; tab-pedidos h=559 OK;
    **pero `tab-portafolio` colapsa a h=0px con 3 hijos** (page-header + section-card/form + grid).
  - El formulario de subir caso (`form-portafolio`, drop-zones) existe en el HTML pero no se ve.
  - Causa aún NO identificada (no es error JS — el detector no dispara; no es color — texto es #fff).
  - `cargarPortafolio()` solo escribe en `#portafolio-grid` (no duplicado). El colapso es del tab entero.
  - **Siguiente paso:** re-diagnosticar el tab-portafolio específico (children heights/display) al hacer clic.
- **"Los botones/funciones del panel no sirven"** — en gran parte porque la **DB está vacía**
  (0 pedidos, $0, 0 clientes) y hay features en construcción. Falta distinguir bug real vs sin-datos.
- **RLS:** tabla `referidos` da 403 al leer desde el panel (KPI referidos) — falta política de lectura para admin.
- **RPC `prodigy_forecast_semana`** devuelve 400 (no existe o params) — el forecast semanal no carga.

### ✅ Panel interno — fixes aplicados
- `switchTab` blindado: null-guard del panel + try/catch en cargadores (un fallo ya no deja todo en blanco).
- Detector de errores en pantalla (banner rojo ante cualquier error JS/promesa) — **se dejó activo**.
- Despachos: quitado subquery SQL dentro de `.not('id','in','(SELECT...)')` (PostgREST no lo soporta →
  daba 400 y "sin asignar" salía vacío). Exclusión ahora client-side.
- `auth-guard.js`: **cliente Supabase singleton** (antes creaba uno nuevo por llamada → "Multiple
  GoTrueClient" y carreras de sesión que dejaban páginas del panel sin abrir). Portado a Alejandro. +cache-buster v=20260717.
- `_headers`: eliminada CSP `Report-Only` rota (`nonce-PLACEHOLDER`) que saturaba `/api/csp-report` con 429.
- 💡 El panel usa `verificarAdmin()` propio (no `ProdigyAuth.require()`), auth admin por **email**.

### ✅ Servicio de carillas (landing US `/en/veneers`) — PRODIGY + Alejandro
- Cotizador con **precios + estimado en vivo** (e.max $89, feldespática $139, zirconia $59, corona e.max
  $69, implante+Ti $159, inlay/onlay $65) + descuentos volumen/primer-caso + envío gratis 12+.
- Bloque de **pago** (tarjeta/PayPal/transferencia) + gancho ES para dentistas latinos.
- **Galería de casos** before/after (6 slots) — falta subir fotos a `/assets/veneers/case-1..6.jpg`.
- **Captura de leads a Supabase**: tabla `veneer_leads` + edge fn `/api/veneer-lead` (ambos negocios).
  Verificado end-to-end (`{"ok":true}`). SQL: `sql/tabla-veneer-leads-2026-07.sql` (ya ejecutado).
- Fix contraste del `<select>` (options oscuras + `color-scheme:dark`).
- 💡 Bypass para ver desde Colombia: `?preview=1`.

### ✅ Infra / backend
- **Cloudflare env vars restauradas** (estaban ausentes → TODO el backend Supabase caído):
  `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` en proyecto Prodigy **y** Alejandro. health-check pasó CRITICAL→DEGRADED.
- `health-check.js`: fallback a `SERVICE_KEY` si falta `ANON_KEY`.

### ✅ Contenido / calidad
- **Encoding:** reparados 45+ caracteres corruptos `�` (login, reset-password, onboarding, articles) en
  PRODIGY y Alejandro. BSS estaba limpio. (Pendiente menor: 2 archivos de fuente en `patients/` con 1 glifo roto.)
- **Favicons:** marca por sitio — 💎 PRODIGY, 👑 Alejandro, ✈️ BSS. Reparados corruptos "??", +cobertura
  100% (BSS no tenía ninguno → +58 páginas).
- Eslogan `sobre-mi` Alejandro → "Diseño con excelencia estética premium…".

### ✅ Documentación / referencia
- `DIRECTORIO-PROYECTOS.md` (repo) + Artifact — mapa de los 3 proyectos, URLs públicas/privadas, bypass, accesos.
- Artifact **Índice completo** (181 páginas filtrables) + Artifact **Playbook de carillas**.

---

## Estado general (snapshot 2026-07-17)
- **Webs públicas:** PRODIGY, Alejandro, BSS — en vivo y funcionando. Landings de carillas listas para anuncios.
- **Backend Supabase:** operativo (env vars restauradas). Tabla `veneer_leads` capturando.
- **Panel interno:** RENDERIZA pero la app está **en construcción + DB vacía**; tab Portafolio con bug abierto.
- **dental-concierge (BSS):** repo SIN remoto git → se despliega por subida directa a Cloudflare.
