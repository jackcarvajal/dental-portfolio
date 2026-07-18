# 📓 BITÁCORA DE CAMBIOS — Ecosistema Dental (PRODIGY · Alejandro · BSS)

> **Uso:** registro de qué se cambió, qué funciona y qué está pendiente/roto, por fecha.
> **NO se lee en cada sesión** (para no gastar tokens) — se consulta cuando hay que
> retomar algo o saber "en qué punto funcionaba". Se **actualiza** tras cambios
> importantes. Lo más reciente arriba.
>
> Leyenda: ✅ hecho y verificado · 🟡 hecho, falta verificar en vivo · 🔴 abierto/roto · 💡 decisión

---

## 2026-07-18

### ✅ Auditoría exhaustiva del panel (27 páginas, 11 roles)
- **Estructura:** HTML correcto en las 27. El bug de `<div>` sin cerrar era exclusivo de
  `panel-interno-operaciones` (ya resuelto). **0 handlers muertos** (los `window.fn = ...` daban falso positivo).
- **🔴 Seguridad (corregido):** 5 páginas cargaban `auth-guard.js` pero NUNCA llamaban `require()`
  → sin validar sesión/rol: `cotizaciones`, `metricas`, `metricas-churn`, `metricas-referidos`,
  `pruebas-carga`. Se agregó `ProdigyAuth.require([...])` a cada una.
- **Roles:** 11 roles, todos con panel de aterrizaje, sin bucles de redirección. Admin por email.
- **🔴 RLS desalineado (parche SQL ejecutado):** las políticas verificaban `app_metadata.role='admin'`
  pero el admin se identifica por EMAIL → RLS lo bloqueaba (causa del **403 en `referidos`**).
  Además 7 tablas (incl. 22 políticas de storage) usan roles inexistentes `'staff'`/`'operario'`.
  → `sql/patch-roles-rls-alineacion-2026-07.sql` (Parte 1 ejecutada: admin ya tiene el rol).
  💡 Tras ejecutarlo hay que **cerrar sesión y volver a entrar** para que el JWT tome el rol.

### ✅ UX — Asistente de ayuda (`js/panel-tips.js`, en 23 paneles)
- Tooltips al pasar el mouse / enfocar con teclado sobre menú y botones. Las ayudas se asignan
  solas leyendo `switchTab('X')` y la función del `onclick` (no hay que tocar el HTML).
- Usa **delegación de eventos** → funciona con botones creados dinámicamente.
- Botón flotante **"?"** con guía rápida **adaptativa** (cada rol ve solo sus secciones).
- Tarjeta **"¿qué hago aquí?"** por panel, ocultable (localStorage).
- **Estados vacíos accionables** en el panel principal: dicen qué hacer, no solo "sin datos".

---

## 2026-07-17

### ✅ RESUELTO — Panel en blanco / "los botones no abren" (bug sistémico)
- **Causa raíz:** HTML malformado en `panel-interno-operaciones.html`:
  1. **6 `<div>` sin cerrar** en varios tab-panel (tab-pedidos +1, tab-clientes +1,
     tab-equipo +1, tab-despachos +2, tab-torre +2) → cada tab quedaba ANIDADO dentro
     del anterior. Al cambiar de pestaña, `switchTab` ponía el padre en `display:none`
     y ocultaba a los hijos → pantalla en blanco en TODO el panel.
  2. **`</main>` mal ubicado** (cerraba tras 7 tabs) → 11 tab-panels quedaban FUERA de
     `#main-content` y no renderizaban.
- **Cómo se halló:** diagnóstico en pantalla de la CADENA DE ANCESTROS reveló que
  `tab-portafolio` tenía como padre a `tab-pedidos` (imposible si fueran hermanos).
- **Fix:** cerrados los 6 `<div>` + movido `</main>` al final del último tab. Ahora los
  18 tab-panels son hijos directos de `#main-content` (balance 370/370).
- **Además:** `switchTab` fuerza `display` por style inline (paneles con `display:none`
  inline no abrían); tab Portafolio reconstruido limpio con `subirCasoSimple()`.
- 💡 Lección: ante "todo el panel en blanco/no abre", sospechar HTML malformado
  (divs sin cerrar que anidan) ANTES que CSS/JS. El diag de cadena de ancestros lo caza.
- **Pendiente menor:** quitar el diag temporal del banner café de `switchTab` (queda inofensivo, solo dispara si un tab colapsa).
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
