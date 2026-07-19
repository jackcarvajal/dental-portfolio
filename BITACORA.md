# 📓 BITÁCORA DE CAMBIOS — Ecosistema Dental (PRODIGY · Alejandro · BSS)

> **Uso:** registro de qué se cambió, qué funciona y qué está pendiente/roto, por fecha.
> **NO se lee en cada sesión** (para no gastar tokens) — se consulta cuando hay que
> retomar algo o saber "en qué punto funcionaba". Se **actualiza** tras cambios
> importantes. Lo más reciente arriba.
>
> Leyenda: ✅ hecho y verificado · 🟡 hecho, falta verificar en vivo · 🔴 abierto/roto · 💡 decisión

---

## 2026-07-18

### 🔴 Ronda 5 — FLUJO DE ARCHIVOS: 5 fallas que impedían entregar (resueltas)

Auditoría completa del ciclo de archivos (cliente sube → operario trabaja → cliente recibe).
Se encontraron fallas **silenciosas**: nadie veía un error, pero el caso llegaba incompleto
o el entregable nunca alcanzaba al doctor.

**1 · El STL final no le llegaba al doctor** 🔴→✅
- `operario-diseno.html:669` sube el STL al bucket **`dental-cases`** y guarda la ruta en `stl_ruta`.
- `client-panel.html` lo buscaba en **`prodigy-files`** → *"Error generando link"* siempre.
- Fix: constante `BUCKET_STL = 'dental-cases'` + soporte para el formato antiguo (URL completa).

**2 · La purga dejaba archivos huérfanos y rompía la referencia** 🔴→✅
- `purgar-stl-storage.js` borraba de **`diseno-archivos`** (tercer bucket distinto).
- El DELETE daba 404 → se contaba como éxito (línea 41) → **igual limpiaba la BD**.
- Resultado: el archivo real quedaba para siempre ocupando espacio y la referencia se destruía.
- Fix: `rutaDesdeUrl()` extrae bucket+ruta de la URL firmada (`stl_urls` guarda URLs, no rutas).

**3 · El botón STL nunca aparecía en el panel interno** 🔴→✅
- Pedía `stl_ruta?.startsWith('https://')`, pero `stl_ruta` guarda una ruta (`{id}/v1.stl`).
- Fallo mudo: el botón simplemente no se dibujaba. Fix: `abrirSTL()` firma al vuelo.

**4 · El CBCT se perdía en silencio** 🔴→✅
- `flujo-uploader.js` permitía `.zip`, pero `upload-guard.js` bloqueaba la firma `50 4B 03 04`.
- El CBCT viaja **siempre** como ZIP de cortes DICOM; los `.3oxz` de 3Shape también son ZIP.
- El archivo pasaba la primera validación y moría en la segunda con solo un `console.warn`:
  el doctor creía haber enviado la tomografía y el caso llegaba sin ella.
- Peor: **fallaba distinto según el flujo** — `flujo-diseno` no cargaba `upload-guard.js`,
  así que ahí sí subía. Mismo archivo, resultado distinto según la página.
- Fix: se quitó la firma ZIP de la lista de bloqueo (el riesgo real es el ejecutable, que sigue
  bloqueado) + `flujo-diseno` ya carga el guard como los otros tres.

**5 · Todos los errores de subida eran mudos** 🔴→✅
- Las 4 rutas de fallo (extensión, tamaño, firma, 3 reintentos agotados) hacían `continue`
  con solo un `console.warn`. `showUploadError()` existía pero nadie la llamaba.
- Fix: se acumulan en `fallidos[]` y se muestran al terminar. Retorno **retrocompatible**
  (sigue siendo un array; `.fallidos` va colgado como propiedad) para no romper los 4 flujos.

**Causa raíz común: CUATRO listas de formatos que no coincidían**
`stl-multi-viewer.js` · `flujo-uploader.js` · `upload-guard.js` · `flujo-diseno.html` inline.
Efectos: el `.pdf` se podía subir pero no seleccionar; se anunciaba `.constructioninfo`
(Exocad) pero el código esperaba `.constructionfile` → rechazado; `.3ox` anunciado y no aceptado.

- **NUEVO `js/formatos.js`** — fuente única. Define categorías, extensiones y **contextos con
  obligatoriedad**: `cliente_caso` (obligatorio, mín. 1, 500MB) · `cliente_revision` (opcional)
  · `cliente_pago` (obligatorio, 10MB) · `operario_diseno` · `operario_evidencia`.
- Incluye lo que faltaba: librerías (`.zip .rar .7z`), Exocad (`.constructioninfo .dxd`),
  3Shape (`.3oxz .3ox`), HEIC/HEIF (iPhone).

### ✅ Ronda 5b — Visor universal

**NUEVO `js/visor-universal.js` (`PVisor`)** — los visores existían solo del lado de *subir*:
el doctor veía su STL en 3D al mandarlo, pero **no podía ver nada de lo que se le entregaba**.
Y el PDF no tenía visor en ningún lado.

| Tipo | Render |
|---|---|
| HTML (export Exocad) | iframe aislado — el flujo modelo, el único que ya funcionaba bien |
| STL / OBJ / PLY | Three.js con OrbitControls (antes solo STL; OBJ y PLY salían como ícono) |
| Imágenes | `<img>` con zoom |
| PDF | visor nativo del navegador |
| ZIP / DICOM | tarjeta + descarga |

Carga perezosa (solo pinta la pestaña abierta), Three.js bajo demanda, `Escape` cierra.
Montado en `client-panel` → botón **Visor** por caso: diseño + modelo 3D + fotos.

### ⚠️ Seguridad — sandbox del iframe del visor Exocad
`revision-diseno.html:854` tenía `sandbox='allow-scripts allow-same-origin'`. **Esas dos
banderas juntas se anulan**: el contenido enmarcado puede quitarse el sandbox y, al ser
`srcdoc`, heredaba el origen de la página → acceso al DOM y a la sesión del doctor.
Fix: `sandbox='allow-scripts'` + `referrerpolicy='no-referrer'`. Los export de Exocad son
autocontenidos, no necesitan same-origin.

### 💡 Decisión — notas de voz descartadas
Se evaluó permitir audio en el feedback clínico. **Se descartó**: el operario no puede revisar
12 casos con audios, el buscador Ctrl+K no encuentra nada dentro de un audio, y en un reclamo
un texto es evidencia y un audio no. El canal es **texto + imagen** — una foto marcando el
margen es más precisa que cualquier descripción. Anotado en `js/formatos.js` para que nadie
lo re-agregue sin revisar la decisión.

### 🔴 PENDIENTE — el STL cae en dos buckets según quién lo suba
- Diseño CAD → `dental-cases` · Producción y Operación → `diseno-archivos`
- El cliente solo lee de `dental-cases`: **si el STL final lo sube Producción, el doctor
  sigue sin poder descargarlo.** Hoy se arregló la ruta principal (Diseño CAD).
- Hay **5 buckets** para un mismo caso (`pedidos-archivos`, `prodigy-files`, `dental-cases`,
  `diseno-archivos`, `evidencias-entrega`) — uno por panel que lo escribió, no por etapa.
- Lo correcto: `caso-entrada` / `caso-entrega` / `evidencias`. Requiere migración.

### 🔴 PENDIENTE — el cliente no recibe todo lo que debería
Hoy solo obtiene diseño y STL. Faltan: **factura PDF**, fotos de entrega/firma, y poder
recuperar sus propios archivos. Requiere tabla `pedido_archivos` (un registro por archivo con
tramo, tipo y estado) — hoy todo va en `stl_url`, una sola columna de texto con URLs pegadas
por `' | '`, sin forma de saber si un pedido llegó completo.

---

## 2026-07-18

### ✅ Ronda 4 — features de operación, pruebas y paridad

**Nuevos módulos (PRODIGY + portados a Alejandro):**
- `js/imprimir.js` — **Orden de trabajo** (sin precios, para el operario) y **Remisión de
  entrega** (con firma), en A4 vía impresión nativa: sin librerías ni CDNs. Botón 🖨️ en cada
  resultado del buscador Ctrl+K.
- `js/rol-actual.js` — **franja de color + chip** con el panel y el rol actual (Administración
  dorado, Diseño azul, Producción naranja, Calidad verde, Mensajería verde WA, Contabilidad
  magenta). Selector **"Ir a…"** solo para admin: salta entre paneles sin cerrar sesión.
  💡 Resuelve la confusión de rol siendo pocas personas cubriendo varios puestos.
- **Notificaciones internas (#6):** la tabla `notificaciones_internas` y `notif-panel.js` ya
  existían, pero **nadie creaba avisos** — el panel solo escuchaba. Se agregó el helper
  `_notificarInterno()` y se dispara al **enrutar a fabricación** (avisa al área) y en
  **cambios de estado** (TERMINADO/LISTO_DESPACHAR → mensajería; ENTREGADO → contabilidad).

**Panel de pruebas (`/app/pruebas-carga`) — para medir antes/después del lanzamiento:**
- **Seguridad por rol:** verifica que un anónimo no lea tablas privadas y que las vistas
  `pedidos_operacion`/`pedidos_entrega` no expongan datos del paciente.
- **Módulos del panel:** que carguen los 7 scripts con su tamaño.
- **Snapshot antes/después:** guarda filas y tiempos por tabla y compara (▲/▼ y delta ms).

### 🔴 RLS — políticas que consultaban `auth.users` (resuelto)
- `cotizaciones` y `referidos` salían en ❌ **sin mensaje** en "Verificar tablas".
- Causa: `cotiz_auth_select` y `ref_auth_select` hacían
  `(SELECT email FROM auth.users WHERE id = auth.uid())`. El rol `authenticated` **no tiene
  permiso sobre el esquema `auth`**, así que la política **lanzaba un error** en vez de denegar.
  Por eso fallaba solo estando logueado (un anónimo obtenía 200 — verificado con curl).
  Además `cotiz_auth_select` comparaba `user_id`, columna inexistente (el campo es `doctor_email`).
- Fix: usar `auth.email()` (lee el JWT, sin tocar `auth.users`). Parche
  `sql/patch-fix-politicas-auth-users-2026-07.sql` + query para detectar otros casos.
- 💡 **Lección:** una política RLS que consulta `auth.users` rompe para usuarios autenticados.
  Usar siempre `auth.email()` / `auth.uid()`.

### ✅ Paridad Alejandro CAD/CAM
- `app/metricas.html` cargaba auth-guard pero **nunca llamaba require()** → sin proteger.
  Corregido con `ACAuth.require('admin')`. (Alejandro expone `ACAuth`, no `ProdigyAuth` —
  ojo con los falsos positivos al auditar.)
- Portados y adaptados: `rol-actual`, `panel-tips`, `historial`, `imprimir`. Verificado en vivo:
  los 4 responden 200 en ambos dominios.

### 🔴 CI ROTO — el deploy no publicaba (resuelto)
- El workflow **"Deploy PRODIGY" fallaba en cada push** durante horas: los cambios de seguridad
  y el tour de clientes **no llegaban a producción** aunque `git push` decía OK.
- Causa: 5 smoke tests fallando. 3 los rompí yo al retirar la CSP `Report-Only` con
  `nonce-PLACEHOLDER` (estaba rota y saturaba `/api/csp-report`); se reemplazaron por asserts
  sobre la CSP enforcing real. 1 era desfase `MAP.md` v36 vs `sw.js` v37. 1 exigía
  `/cotizaciones` en PRECACHE, pero esa ruta **no es pública** (solo el panel autenticado,
  `no-store`) → precachearla serviría contenido privado; se cambió por verificar que
  `/app/` esté en `NEVER_CACHE` (sw.js ya lo hacía bien).
- 💡 **Lección: al verificar `/js/*` en producción hay que incluir el `?v=` del cache-buster.**
  Esos assets se cachean **1 año como `immutable`**; sin el parámetro, el CDN devuelve la copia
  vieja y parece que el deploy falló (me pasó dos veces).
- 💡 **Lección: un `git push` exitoso NO significa desplegado.** Verificar siempre contra
  producción (curl con `-L`: las URLs `.html` hacen 308 a la ruta limpia).
- Resultado: 227 tests ✅ 0 ❌ y deploy destrabado.

### ✅ Verificación de producción (41 checks)
- 13 páginas públicas, landing EE.UU. + términos, 10 páginas del panel, 8 módulos JS,
  health-check y 4 pruebas de seguridad (anon NO lee `pedidos`, `clientes`, `veneer_leads`
  ni `logs_incidencias`): **todo correcto**.
- health-check: DEGRADED con **0 críticos**. Los 3 degradados son servicios externos
  (ipapi.co 429, Wikipedia 403, Factus DIAN 403), no código propio.
- El `207` de health-check es intencional (`allOk?200: critical?503:207`).

### ✅ Bot IA actualizado
- Verificado en vivo (gemini-2.5-flash, 200). Se agregó al prompt el servicio de carillas
  para EE.UU. (precios USD, descuentos, tiempos, garantía, 50/50, B2B con licencia) y se
  eliminó el bloque **duplicado** de referidos que gastaba tokens en cada consulta.

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

### ✅ UX — Mejoras del panel (ronda 3)
- **`js/historial.js`** (4 paneles): el panel ya registraba todo con `_auditLog()` en
  `logs_incidencias` pero **nadie podía verlo**. Ahora hay botón "Actividad reciente" que
  traduce los registros a lenguaje claro ("Cambió el estado de un pedido ABC-123 · email ·
  hace 2 h"). Filtrable por caso: `window.verHistorial('caso-123')`.
- **Móvil del mensajero** (es quien más lo usa desde el celular): botones de 48px a lo ancho,
  resumen en 2 columnas (1 en <380px), filas apiladas, modales a pantalla casi completa,
  inputs a 16px (evita el zoom automático de iOS).
- **🔴 Accesibilidad (WCAG):** `mensajero.html` y `taller.html` traían `user-scalable=no` /
  `maximum-scale=1` → **impedían hacer zoom**. Eliminado. 0 paneles de `/app/` bloquean el zoom.

### ✅ UX — Mejoras del panel (ronda 2)
- **`js/mi-dia.js`** (6 paneles): tarjeta "Mi día" con la tarea principal de cada rol y números
  REALES (diseño→casos en su flujo; calidad→casos en QA; inventario→materiales bajo mínimo;
  mensajero→entregadas hoy/pendientes; admin→pedidos totales/en producción/listos).
  Las consultas se tomaron del código real de cada panel, no inventadas.
- **`js/buscador.js`** (10 paneles): buscador global **Ctrl+K** por código, doctor o cliente
  desde cualquier pantalla. Flechas para navegar, Enter abre, Esc cierra. Botón visible en el
  sidebar. Escapa HTML de los datos de Supabase.
- **Semáforo de estados unificado:** `ENTREGADO` usaba dos verdes distintos (#00FF41 / #22c55e)
  y `EN_REPARTO` dos colores (#00d2ff / #f97316) según la vista → confundía. Unificado a
  ENTREGADO=#00FF41 y EN_REPARTO=#f97316 (el cyan ya lo usa EN_PRODUCCION). 0 inconsistencias.
- **Verificado:** los 3 puntos de borrado (portafolio/waitlist/referidos) YA confirmaban antes
  de eliminar — no hay riesgo de borrado accidental.

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
