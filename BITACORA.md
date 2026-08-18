# 📓 BITÁCORA DE CAMBIOS — Ecosistema Dental (PRODIGY · Alejandro · BSS)

> **Uso:** registro de qué se cambió, qué funciona y qué está pendiente/roto, por fecha.
> **NO se lee en cada sesión** (para no gastar tokens) — se consulta cuando hay que
> retomar algo o saber "en qué punto funcionaba". Se **actualiza** tras cambios
> importantes. Lo más reciente arriba.
>
> Leyenda: ✅ hecho y verificado · 🟡 hecho, falta verificar en vivo · 🔴 abierto/roto · 💡 decisión

---

## 2026-08-18

### ✅ Validación total front↔BD (con esquema real de las 57 tablas)
`tools/audit-schema.mjs --schema-all` cruzó todo el código contra el esquema real. De 35 candidatos:
- **Arreglado**: `leads_doctores` — panel ordenaba `.order('fecha_descarga')` (inexistente) → 400 en lista de leads → `created_at`.
- **Falsos positivos**: cotizaciones (`cantidad/material` van en jsonb `items`), catalogo.precio_base (bleed).
- **Arreglados (2ª/3ª pasada, autónomo, validados con audit-schema)**: Alejandro `envia-tu-scanner` (insertaba `negocio` inexistente → se perdían solicitudes de escáner) y `admin-panel` cotizaciones (`doctor→doctor_nombre`); `alejandro_top_servicios` reconstruida; app/calidad QA (`fotos_calidad→fotos_empaque`, `timestamp_calidad→timestamp_qa`, quitado `calidad_user_id`); operario:621 (`nombre_doctor` vía pedidos base); metrics-churn (alias); **equipo_mantenimiento** → creada tabla `mantenimiento_log` + repuntado el código.
- **Pendiente SQL (correr en Supabase)**: `sql/fix-pedidos-doctor-revisiones.sql` (ADD COLUMN revisiones_usadas), `sql/create-mantenimiento-log.sql` (CREATE TABLE). Vistas (`pedidos_operacion`/`doctors_inactivos`/`despachos`) opcionales. Ver `sql/PENDIENTE-otros-ghosts.md`.

### ✅ FAQ /preguntas — categoría "Servicios" (10 preguntas)
Diseño CAD, software, materiales fresado, solo fresado, impresión 3D, Lab Full, niveles, escaneo domicilio, Aidite, fotogrametría. + filtro + schema FAQPage (12→22). También ~14 respuestas nuevas en el artefacto de WhatsApp.

### ✅ Métricas RPCs — DESPLEGADAS
Ejecutado en Supabase con éxito. Enum `estado` comparado como `::text` (el enum desplegado difiere del repo — ni `cancelado` ni `Cancelado` validaban). Consolidado en `sql/EJECUTAR-EN-SUPABASE-metricas.sql`.

---

## 2026-08-17

### ✅ Herramientas de auditoría automática (`tools/`) — prevención pre-deploy
Nacen de los bugs recurrentes (anon key rotada→401, column mismatches→400). En ambos repos + git hook `pre-push`:
- `tools/audit.mjs` (estático, ~1s): anon key drift, IDs duplicados, enlaces internos rotos, SEO básico.
- `tools/audit-live.mjs` (runtime headless): errores JS de consola, llamadas Supabase/API 4xx, páginas vacías.
- `tools/audit-schema.mjs` (contrato front↔BD): extrae tablas/columnas/RPCs que toca el código y valida vs esquema real (`--schema`) → caza columnas fantasma. Ver `tools/README.md` y CLAUDE.md §9.

### ✅ Auditoría de backend/BD (raíz de los 400) — schema drift
`audit-schema` + `information_schema` revelaron: `pedidos` con ~130 columnas (4 "total"), 6 tablas `pedidos*`
solapadas, columnas bilingües. **RPCs de dashboard/recordatorios rotas por columnas fantasma** — corregido en repo
(`p.total→precio_total`, `p.doctor→nombre_doctor`, `servicio→tipo_trabajo`, `p.whatsapp→telefono`, enum
`cancelado`/`CANCELADO`/`en_diseno`→valores reales). ✅ RESUELTO y DESPLEGADO en Supabase (2026-08-18, enum como ::text). Ver `sql/PENDIENTE-metricas-rpcs.md`.

### ✅ Otros hallazgos de las herramientas
- **portafolio.html** + app/agregar-caso: `casos_portafolio?publicado` (columna inexistente) → `visible`. 400→200.
- **app/calidad + contabilidad**: link "Cerrar sesión" `../login.html` (root inexistente) → `/app/login.html`.
- Contador de waitlist: fallback elegante cuando total=0 (RPC `waitlist_labs_count` ya corre).

### ✅ Home: coverflow de servicios por flujo/categoría
Chips `Todos/Diseño CAD/Fresado/Impresión 3D/Lab Full` que filtran las tarjetas (`data-cat`) + CTA contextual
"Pedir por flujo de X". `coverflow-svc.js` retrocompatible. Iconos con su color original.

### ✅ Atención al cliente — artefacto de respuestas WhatsApp
Artefacto con mensajes auto (bienvenida/ausencia) + ~17 respuestas rápidas por tema (copiar/pegar, con atajos)
+ guía de automatización en 3 niveles (App WhatsApp Business → no-code → Cloud API + bot Gemini en Cloudflare).
https://claude.ai/code/artifact/0290c216-5dd1-4a87-bbab-5c4569b66351

### ✅ Reglas anti-slop
CLAUDE.md §9 (verificar esquema real antes de tocar BD, correr audit tools, no columnas bilingües/tablas solapadas)
+ memoria de sesión. Nace de los hilos de X (gastonfoncea/adevsays) sobre slop de IA sin guía.

---

## 2026-08-11

### ✅ Auditoría profunda del sitio (crawler CDP) — bugs JS reales corregidos
Rastreo headless de ~40 páginas PRODIGY + ~38 Alejandro. Errores JS que **mataban el JS de la página**
(mismo patrón que la página vacía de guías):
- **caso.html** (ambos): `const PALABRAS_PROHIBIDAS` duplicado con `content-guard.js` → SyntaxError. Renombrado a `_CASO`.
- **nosotros.html**: `null.classList` en `onScroll` (no existe `#navbar`, lo inyecta header.js) → guarda `if(!nav)return`.
- **patient.html**: `escapeHtml is not defined` en `renderError` (estaba anidada) → definida en scope exterior.
- **calculadora-diseno** (Alejandro): `biomecanica-rules.js` tenía `mensaje` con template literal `${opts}` que se evaluaba **en carga** → ReferenceError rompía el módulo. A string estático (como PRODIGY). Bump v20260811.
💡 Los "8 slugs rotos" del coverflow y `/terminos` (Alejandro) eran **falsos positivos**: los resuelve `_redirects` (el server local no lo procesa).

### ✅ Analytics propio nunca registró — enrutado por edge function
`prodigy-analytics.js` insertaba directo en `analytics_events` con columnas en inglés (`event/page/ts/props`→400)
y además `anon` tiene INSERT **revocado por diseño** (→401). Ahora POST a `/api/track-event` (service_role,
rate-limit, sanitización) con contrato `{evento,pagina,negocio,metadata}`; `session_id` va en metadata. Bump v20260811.
💡 Regla: 400 = columna inexistente; 401 en insert = RLS/GRANT revocado (el camino correcto es la edge function).

### 🔴→✅ Anon key vieja/rotada rompía features (calculadoras, soporte, waitlist)
6 archivos PRODIGY (calculadora-diseno/fresado/impresion, soporte, para-laboratorios, app/metricas) + 5 Alejandro
(calculadora-diseno, cursos, flujo-diseno, soporte, app/metricas) usaban una anon key **antigua (iat 2024)** que
daba **401** — mientras los otros 58 archivos usan la vigente (iat 2026). Rompía en silencio el guardado de
cotizaciones, tickets de soporte y el form+contador de waitlist. Reemplazada por la key vigente en los 11.
💡 Cómo se detectó: `sb.rpc('waitlist_labs_count')` daba 401 con la key vieja; decodificar el JWT (iat/exp) reveló
la diferencia. Verificado: RPC pasó de 401 → 200. Contador con fallback elegante cuando total=0 ('sé de los primeros').

### 🟡 Panel de métricas (app/metricas) — RPCs rotas por schema drift
`tools/audit-live.mjs` detectó 400 en las RPCs del dashboard. Probadas directo: `prodigy_dashboard_semana`
usaba enum `'cancelado'` (real: `'Cancelado'` → **corregido en repo, falta re-ejecutar**); `prodigy_top_doctores`
(`column p.doctor` → `nombre_doctor`), `prodigy_ingresos_por_canal` (`p.total` → `monto_total`),
`prodigy_tiempos_entrega`/`prodigy_pedidos_por_material` (`servicio` no existe en la tabla desplegada).
El esquema desplegado difiere del repo (`pedidos` es RLS, no introspectable con anon). Detalle en
`sql/PENDIENTE-metricas-rpcs.md`. Interno (admin), no afecta al público.

### ✅ casos_portafolio: columna 'publicado' inexistente → 'visible'
Contador de casos del **portafolio público** (y stat de app/agregar-caso) usaban `?publicado=eq.true` (columna
que no existe) → 400. Cambiado a `visible`. Verificado 400→200. (Detectado por audit-live.)

### ✅ IDs duplicados (HTML inválido)
- `theme-btn` (flujo-fresado/impresion): 2 botones → `id`→clase `.theme-btn` + selectores JS.
- `journal-search`: había 2 cajas de búsqueda → quitada la duplicada.
- `seguimiento-caso` (ambos): panel `#resultado`/`#noEncontrado` **duplicado entero** (copia B muerta) → eliminada.

### ✅ Limpieza / sanitización
- Home: eliminado `#modal-canal` + `abrirModalCanal` + form + signup (122 líneas huérfanas del canal).
- Home: CSS muerto del canal (`glowGreen/Blue/Cyan/Ink`, `.cajon-whatsapp/drive/wetransfer/dropbox`, glint,
  `.canales-envio-persuasive`, `.cajones-persuasive-grid` — quitado solo el selector muerto de los grupos con `.cajon-persuasive` vivo).

### ✅ Home: sección canal → registro + coverflow por categoría
- **"SELECCIONA TU CANAL DE ENVÍO"** (Drive/WeTransfer/WhatsApp) anulada → **"Crea tu cuenta y envía tu primer caso"**
  con 6 beneficios + CTA al sistema propio (`/flujo-diseno`). Quitado el CTA duplicado "PEDIR MI CASO AHORA".
- **Coverflow de servicios por flujo**: chips `Todos/Diseño CAD/Fresado/Impresión 3D/Lab Full` que filtran
  (data-cat multi-valor) + CTA contextual "Pedir por flujo de X". `coverflow-svc.js` retrocompatible + centrado inicial. Bump v20260811.

### ✅ Otros
- **diseño-remoto** (ambos): iconos emoji→FA, flujo primario al sistema propio, hover en tarjetas.
- **guías-quirúrgicas** (ambos): reveal robusto (threshold 0 + fallback scroll) — `.12` dejaba el contenido vacío.
- **8 tarjetas de servicios** del home iban a 404 → `_redirects` 301 a `/diseno-remoto` / `/impresion-3d`.
- **instalar-app.html** creado en Alejandro (paridad; footer enlazaba a página inexistente → 404 site-wide).
- Emoji quitado del `<h3>` CAPACIDAD DE PRODUCCIÓN (a11y).

### 🟡 Pendiente (SQL — correr en Supabase)
- **Contador de waitlist**: `sql/waitlist-count-rpc.sql` — RPC `waitlist_labs_count()` (anon no puede SELECT por RLS).
  El código ya llama la RPC con fallback silencioso; falta **ejecutar el SQL** para que muestre el número.

---

## 2026-07-25

### 🔴→✅ Captura de leads 100% rota — columna fantasma recurso_descargado

`leads_doctores` no tiene `recurso_descargado` (real: `notas`); los 9 inserts la usaban → PGRST204/400
→ ningún lead se capturó nunca (calculadoras, journal/blog lead-magnets, cursos, nosotros, soporte).
Corregido recurso_descargado→notas en PRODIGY (6 inserts + panel-interno lectura) y Alejandro (3 inserts
+ admin-panel lectura). Además `whatsapp` es NOT NULL y los forms de contacto (nosotros PRODIGY,
soporte Alejandro) no lo mandaban → añadido whatsapp:'—'. `origen` tiene CHECK (categórico), por eso
el texto va a `notas`. Filas 'AUDIT BOT BORRAR' también en leads_doctores.
💡 Método: PGRST204 al insertar = columna que no existe en la tabla; 23514 = viola CHECK; 23502 = NOT NULL.

### ✅ El bug RETURNING también en las 5 calculadoras (cotizaciones)

Barrido multilínea de `.insert().select()` en páginas públicas: las 5 calculadoras (PRODIGY
calculadora/-diseno/-fresado/-impresion + Alejandro calculadora-diseno) guardaban la cotización con
`.insert(payload).select('id')` → RETURNING revierte el insert anon (42501) → ninguna cotización
pública se guardó nunca (mostraba "✓ Guardada" en falso). Mismo fix: id uuid client-side + sin .select.
`app/inventario.html` (lotes_material con RETURNING) es staff autenticado → no aplica. Filas de prueba
'AUDIT BOT BORRAR' también en cotizaciones (limpieza en verificar-pedido-prueba §2b).

### ✅ Auditoría de transiciones de estado — 5 UPDATEs rotos por enum

Con `pedidos` ya no-vacía, auditadas las transiciones del staff contra la BD real. Enum `estado_pedido`
= Pendiente/En Diseño/En Revisión/En Producción/Pagado; `estado_operativo`/`pago_estado` = TEXT libre.
Corregidos 5 updates que escribían valores inexistentes al enum `estado` (todo el UPDATE fallaba):
PRODIGY `operator-panel` (terminado→se quita), `mensajero` (EN_REPARTO→estado_operativo), `panel-interno`
(POR_DESPACHAR→estado_operativo); Alejandro `client-panel` aprobar-diseño y pedir-cambios (estado
inválido dentro del update con diseno_aprobado/notas → fallaba todo; nunca funcionaron). Flujo de escáner
verificado sano. 🟡 Pendiente: Alejandro usa un enum de estado ficticio en su display (client-panel:684,
admin-panel, calculadora-diseno) — refactor dedicado al enum real. Dejó filas 'AUDIT BOT BORRAR' en
pedidos y solicitudes_scanner (limpieza en sql/verificar-pedido-prueba-2026-07.sql).
💡 Método: `estado_operativo`/`pago_estado` aceptan cualquier valor (text), `estado` es enum estricto —
probado con `?col=eq.valor` (error 22P02 = valor fuera del enum).

## 2026-07-23

### 🔴 Auditoría pre-lanzamiento — sospechoso de por qué `pedidos` sigue vacío

Barrido de "qué falta para lanzar". Infra OK (webs 200, APIs vivas, chatbot `/api/gemini` responde,
sitemaps 200). Confirmado por screenshots del usuario: `WOMPI_INTEGRITY_SECRET` ya existe en Supabase
Secrets, buckets sensibles ya privados (`pedidos-archivos`, `dental-cases`, `evidencias-entrega`,
`scanner-uploads`, `casos`); `portafolio`/`links-media` siguen PUBLIC (correcto, contenido público).
Faltan secrets Meta (WhatsApp auto). Existe `PADDLE_API_KEY` (pasarela Paddle configurada).

🔴 **Hallazgo:** los 4 flujos de creación (`flujo-diseno.html:2104`, `flujo-fresado.html:4184`,
`flujo-lab.html:979`, `js/flujo-impresion.js:2285`) mandan `tipo_trabajo` pero NO `servicio`.
`schema-completo.sql:52` declara `servicio text NOT NULL` y ningún patch del repo lo renombra/dropea.
Si en la BD real `servicio` sigue NOT NULL sin default → todo INSERT de pedido revienta → tabla vacía
(explicaría el count=0 histórico). Creado `sql/diagnostico-pedidos-columnas-2026-07.sql` para
confirmarlo ANTES de la prueba en vivo. Como la tabla `pedidos` es compartida, el fix sirve para
PRODIGY y Alejandro de una vez. 💡 `schema-completo.sql` está desactualizado — NO es fuente de verdad.

### ✅ CAUSA RAÍZ del count=0 encontrada y corregida

El diagnóstico (corrido por Alejandro en Supabase) reveló: columnas obligatorias de `pedidos` =
`precio_base`, `precio_total`, `tipo_trabajo`. Los flujos **nunca mandaban `precio_base`** (NOT NULL
sin default) → todo INSERT reventaba en silencio. `servicio` descartado (ya no existe en la BD).
Corregido `precio_base` (= `STATE.total`, subtotal) en los 5 INSERT: PRODIGY `flujo-diseno.html:2117`,
`flujo-fresado.html:4195`, `flujo-lab.html:986`, `js/flujo-impresion.js:2297` + Alejandro
`flujo-diseno.html`. Bug 2: `client-panel.html` pedía `servicio` (inexistente) en su `.select()` →
habría roto el panel del cliente al ver el 1er pedido; quitado del SELECT (render ya cae a `tipo_trabajo`).
🟡 Falta la prueba en vivo tras deploy (crear pedido real → confirmar en `pedidos`).

### 🔬 Auditoría profunda vía anon REST — 3 obstáculos en cadena

Usando la anon key (pública) contra PostgREST se validó el INSERT sin depender de la prueba
manual. Cada obstáculo estaba oculto tras el anterior:
1. ✅ `precio_base` faltante (ya corregido).
2. ✅ `estado:'Borrador'` → el enum `estado_pedido` real NO tiene 'Borrador' (repo desactualizado).
   Valores reales: Pendiente/En Diseño/En Revisión/En Producción/Pagado. Corregido a 'Pendiente'
   en los 5 flujos (PRODIGY x4 + Alejandro).
3. 🔴 RLS 42501: insert anónimo que cumple todas las condiciones de la policy del repo igual es
   rechazado → la policy `pedidos_insert_flujo_publico` desplegada ≠ repo (o no existe). Bloquea
   la creación de pedidos de clientes sin sesión. Creado `sql/diagnostico-policies-insert-pedidos-2026-07.sql`;
   fix probable: re-ejecutar `patch-pedidos-insert-anon-2026-07.sql`.
Verificado además: todas las columnas leídas por paneles y escritas por los INSERT existen en la BD.

### ✅ CAUSA RAÍZ DEFINITIVA del count=0 — el RETURNING de .select('id')

Tras descartar columnas, enum, policies y triggers, la prueba decisiva: POST anónimo con
`Prefer: return=minimal` → **201** (el insert SÍ está permitido). El culpable era el
`.insert([...]).select('id')` de los flujos: el `.select()` añade un `RETURNING id` que exige
una policy SELECT para anon sobre la fila nueva; como no existe, PostgREST **revierte todo el
insert** y devuelve 42501. Por eso `pedidos` llevaba 730 días vacía pese a que el insert era válido.
**Fix sin SQL:** cada flujo genera su `id` (uuid) con `crypto.randomUUID()` (con fallback) y lo manda
en el insert; se elimina el `.select('id')`. El flujo conserva el id para `pedido_archivos`.
Aplicado en los 5 flujos (PRODIGY: diseno/fresado/lab/impresion + Alejandro diseno). `node --check` OK.
💡 Método de sondeo con anon key: `Prefer: return=minimal` vs `return=representation` aísla si un
fallo es del INSERT o del RETURNING. Dejó 2 filas de prueba 'AUDIT BOT BORRAR' (borrar con
sql/verificar-pedido-prueba-2026-07.sql §2b).
💡 Método útil para el futuro: probar columnas/enums/policies contra prod con la anon key vía
`?select=col` (columna), `?estado=eq.valor` (enum) y POST de prueba (RLS) — sin tocar el Dashboard.
💡 Confirmado (3ª vez) que los .sql del repo (schema-completo, enum, policies) están desactualizados
vs la BD viva.

### 🎨 Kit de marca Alejandro CAD/CAM — fix servicio duplicado

Artefacto Claude: s3 renombrado de "Wax-up / Sonrisa" (duplicaba s4) a "Guía quirúrgica"/"Surgical guide"
en i18n ES/EN + 3 títulos estáticos. Republicado en misma URL.

## 2026-07-19

### ✅ Cadena de diseño completa — el eslabón que faltaba

Preparando la validación end-to-end aparecieron **tres cortes** en la misma cadena
(cliente sube → operario diseña → doctor revisa → cliente descarga). Cada uno rompía el
flujo por su cuenta:

**1. El diseño del modal QA nunca le llegaba al doctor** — `app/operario-diseno.html`
El botón principal (QA de cada caso) escribía en `link_diseno`, pero la carga masiva escribía
en `html_diseno_url`, y `revision-diseno.html` **exige `html_diseno_url`**. Todo diseño subido
por el camino natural era invisible para el doctor. Además un link de Drive tampoco serviría:
el visor hace `fetch()` del HTML y Drive lo bloquea por CORS.
Fix: campo para **subir el visor Exocad (.html)** → `dental-cases/{id}/v{n}.html`, firmado a
`html_diseno_url`. Botón nuevo **"Enviar al doctor a revisar"** (`REVISION_CLIENTE`,
`stl_liberado=false`) — antes solo existía "Aprobar y entregar", que se saltaba la revisión.

**2. El doctor no podía ver sus propios pedidos** — `sql/patch-cliente-ve-sus-pedidos-2026-07.sql` ✅
Tres columnas distintas para lo mismo: el flujo no guardaba `email`, el panel filtra por
`.eq('email', email)`, y la única policy de SELECT miraba `doctor_uid` (que nadie escribe).
RLS le negaba todas las filas → panel vacío.
Fix: el flujo guarda `email` + `user_id` si hay sesión; policies de SELECT y UPDATE que
reconocen al dueño por `user_id` OR `doctor_uid` OR `email`. El UPDATE abre la fila, no las
columnas — las sensibles siguen protegidas por `trg_restrict_client_pedido_updates`.

Con esto la cadena cierra de punta a punta por primera vez.

### ✅ Entorno de pruebas · Tour corregido · Fechas con festivos

**🧪 Modo prueba — `sql/patch-modo-prueba-2026-07.sql` ✅ EJECUTADO**
Se podía probar el sistema solo creando pedidos reales. Ahora un usuario con
`app_metadata.role = 'test'` recorre todos los flujos sin pagar:
- Columna `es_prueba` + vista `pedidos_reales` (KPIs y facturación excluyen las pruebas)
- El trigger de estado inicial respeta `pago_estado='pago_confirmado'` **solo** si `es_prueba`;
  si alguien manda `es_prueba=true` sin el rol, se le quita
- `limpiar_pedidos_prueba()` borra todo el rastro — **no se expone a la API** a propósito
- `js/modo-prueba.js`: se activa **solo con sesión real**, nunca con un parámetro de URL o
  localStorage (eso lo encendería cualquiera). Franja fija en pantalla.
- 🔴 **Falta crear el usuario** en Dashboard → Authentication → Users + asignarle el rol.
  💡 Tras asignarlo hay que **cerrar y reabrir sesión**: el rol viaja dentro del JWT.

**🎯 Tour — apuntaba a botones equivocados**
Los selectores eran genéricos: `'[type=submit], .btn-enviar, .btn-primary'`. `querySelector`
devuelve el **primer** match de toda la página, así que "Envía el caso" señalaba el botón
**ACCESO del header**. Y los 4 flujos compartían el mismo guion (`TOURS[f] = TOURS['flujo-diseno.html']`)
pese a tener IDs distintos. Ahora cada flujo tiene su guion con IDs reales, verificados uno a
uno contra su HTML. En fresado/impresión se apunta a `#btn-submit` y no a
`#btn-whatsapp-confirm`, que vive en un modal cerrado y no sería visible.

**📅 Fechas de entrega — `js/fechas-habiles.js` (ambos repos)**
`flujo-diseno` y `flujo-lab` calculaban así: `if (d !== 0 && d !== 6 && h >= 8 && h < 18)`.
Saltaban fin de semana pero **no conocían los festivos** — 18 al año en Colombia, casi todos
lunes — ni el corte de 5 PM que anuncia el propio banner. Un pedido de **viernes 6 PM
prometía entrega el sábado**.
Además los criterios no coincidían: impresión documenta "Lunes a Sábado" y diseño saltaba
también el sábado — el mismo caso daba fechas distintas según por dónde entrara.
- Módulo compartido: festivos (fijos + Ley Emiliani + Pascua por Butcher), días hábiles,
  corte configurable en un solo `CFG`.
- Verificado: 18 festivos en 2026 · viernes 17-jul 6PM → **martes 21** (el 20 es festivo) ·
  16 h hábiles desde jueves 9AM → viernes 3PM.
- Avisa **"(incluye N festivos)"** — mata el reclamo de *"me dijeron 24 horas"*.
- ⚠️ **NO se tocó** `calcularFechaEntrega()` de fresado ni impresión: están INTOCABLE y ya
  calculaban bien con su propia copia de los festivos.

---

### 🔴🔴 HALLAZGO MAYOR — NINGÚN PEDIDO SE ESTABA GUARDANDO (resuelto)

```sql
SELECT negocio, count(*) FROM pedidos GROUP BY negocio;   -- → 0 filas
```

**La tabla `pedidos` estaba VACÍA.** Nunca se guardó un pedido, en ninguno de los dos
proyectos. Todo el negocio ha corrido a punta del mensaje de WhatsApp: la base, los
paneles, los reportes y los KPIs miraban una tabla sin una sola fila.

**Causa** — la única política de INSERT sobre `pedidos` era:
```sql
FOR INSERT TO authenticated WITH CHECK (doctor_uid = auth.uid())
```
Dos bloqueos, cada uno suficiente por sí solo:
1. `TO authenticated` — los 4 flujos públicos se llenan **sin login**. El rol es `anon`,
   que no figuraba en ninguna política de INSERT → rechazo garantizado.
2. `WITH CHECK (doctor_uid = auth.uid())` — el JS **nunca envía `doctor_uid`**. Un
   `WITH CHECK` que no da TRUE deniega, así que ni un doctor con sesión habría pasado.

**Por qué nadie se enteró** — los 4 flujos hacían `if (error) console.warn(...)`. El doctor
veía *"¡Orden registrada!"*, el WhatsApp salía normal, y el pedido nunca existió.
Mismo vicio que el CBCT perdido: **el fallo ocurre pero es MUDO**. Van tres casos del mismo
patrón en dos días — archivos, log de auditoría y ahora el pedido entero.

**Sobre la auditoría anterior:** `patch-mass-assignment-insert-pedidos-2026-07.sql` razonaba
sobre *"un doctor **AUTENTICADO** podía insertar con `pago_estado='pago_confirmado'`"*.
La premisa era falsa — en estos flujos nadie está autenticado. Se auditó un escenario que no
existía mientras el real estaba roto. 💡 Su trigger sigue siendo correcto y **es justamente lo
que hace seguro abrir el INSERT a `anon`**.

**Fix:**
- `sql/patch-pedidos-insert-anon-2026-07.sql` ✅ **EJECUTADO** — política de INSERT para `anon`
  con guardas (no puede atribuirse `doctor_uid`/`user_id`, `negocio` válido, `codigo` y
  `nombre_doctor` obligatorios, techo de monto). `pedidos_insert_owner` reescrita para aceptar
  `doctor_uid` NULL. **No se abre SELECT a `anon`**: escribe y no ve nada.
- `js/pedido-guard.js` (ambos repos) — el fallo deja de ser mudo: aviso en pantalla al doctor
  (su WhatsApp SÍ salió, lo que falló es el registro), copia en `localStorage` y rastro en
  `logs_incidencias`.

**🔴 PENDIENTE — la prueba que valida todo:** crear un caso desde `/flujo-diseno` en ventana
privada (sin sesión) y verificar que aparece en `pedidos` y en `/ficha`. Hasta que eso pase,
nada de esta ronda está confirmado con datos reales.

### ✅ Ficha única de caso — `/ficha` (`app/ficha-caso.html`)
Para responderle a un doctor o validar un caso había que recorrer varios paneles. Ahora una
búsqueda (código, doctor o paciente) muestra en una pantalla: datos y estado, **lo que envió
el doctor** vs. **lo que se entregó** (separado por etapa desde `pedido_archivos`), archivos
de casos viejos leídos de las columnas antiguas, entrega/mensajería e historial de quién hizo
qué. Avisa *"N archivos no llegaron"* y *"este caso no tiene ningún archivo"*.

---

## 2026-07-18

### ⚠️ Ronda 5d — CI en verde en ambos repos (los correos de "Run failed")

**Alejandro fallaba en CADA push desde hacía tiempo** → un correo por cada uno. Con el CI
permanentemente en rojo, un fallo real pasa desapercibido: fue exactamente lo que ocurrió.
- `offline.html` no existía → **creada** y enlazada en `sw.js` (entra al PRECACHE y es el
  fallback sin red). Antes caía en `/404.html`, que dice "no encontrada" — mensaje equivocado
  cuando el problema es que no hay internet. Avisa que los archivos del caso NO se enviaron.
- **24 handlers JS inline** en `index.html`: solo cambios de `border-color` en hover →
  pasados a CSS (`.svc-card` / `.svc-gold` / `.svc-cyan`). Se ve igual, no depende de JS y no
  choca con una CSP que prohíba código en atributos.
- `instalar-app.html` no existe en ese proyecto: la lista de FAQPage se copió de PRODIGY.
  Sacada de la lista con nota.
- Resultado: **89 ✅ 0 ❌**.

**🔴 Deploy de PRODIGY roto por mí (`46aa0b3`)** — escribí `FlujoUploader.registrarEnPedido()`
sin `window.` en `js/flujo-impresion.js`, que está en el lint crítico y usa `window.FlujoUploader`
en el resto. eslint → `no-undef` → deploy caído.
- 💡 **LECCIÓN (segunda vez que pasa):** correr `npm run lint` **antes** de pushear, no solo
  `smoke-tests`. Los tests pasaban; el lint no. Son dos puertas distintas del workflow.

---

### ✅ Ronda 5c — Aprobación → producción · Contabilidad · Registro de archivos

**🔴 La aprobación del doctor no llegaba a producción (resuelto)**
`prodigy_rd_aprobar()` escribe `estado_operativo='DISENO_APROBADO'`, pero el trigger de
avisos evalúa `NEW.estado IN ('APROBADO','APROBADO_CLIENTE')`. **Columnas distintas** y nada
pone jamás `estado` en `'APROBADO'` → esa rama **nunca se ejecutó**. Y `departamento_actual`
solo se escribía en el enrutado manual, así que el caso aprobado no caía en la bandeja de
ninguna área: esperaba a que alguien lo notara a ojo.
- `sql/patch-aprobacion-a-produccion-2026-07.sql` ✅ **EJECUTADO**. Tres ramas:
  fabricación pagada → enruta y avisa al área · sin pago → avisa a admin sin enrutar
  (producir sin cobrar consume material a riesgo) · solo diseño → avisa que hay que liberar.
- 💡 La rama vieja sobre `estado` sigue muerta pero no se elimina: ese mismo trigger maneja
  otros casos que sí funcionan (CAMBIOS_SOLICITADOS, pago, urgente).

**✅ Contabilidad — de solo cifras a ver archivos y personas**
Antes solo leía `pedidos`. Dos tabs nuevos:
- **Productividad:** agrupa `historial_diseno.actor` por persona y clasifica cada acción en
  diseños / revisiones / producción, con última actividad y export CSV. No necesitó parche
  de BD: `auth_historial_all` ya permite SELECT a todo autenticado.
- **Archivos por caso:** busca por código, doctor o paciente; lista diseño, STL y fotos
  firmando la ruta al momento (1h). Trae además el **despacho de mensajería** (estado,
  fechas, novedades) — lo que cierra el ciclo del cobro y contabilidad no veía.
- 🔴 `sql/patch-contabilidad-archivos-2026-07.sql` **PENDIENTE**. Las policies de storage
  listan roles uno por uno y `'contabilidad'` no estaba en ninguna. Se agregan 3 de
  **solo lectura**: verifica, no produce, y así no altera la evidencia que audita.

**✅ Tabla `pedido_archivos` — un registro por archivo**
Los archivos vivían en 4 columnas sin estructura (`stl_url` con URLs pegadas por `' | '`,
`stl_urls`, `stl_ruta`, `fotos_feedback`). No se podía saber cuántos archivos debían llegar,
ni qué pedidos están incompletos, ni cuál imagen es la radiografía y cuál la toma de color.
- 🔴 `sql/patch-pedido-archivos-2026-07.sql` **PENDIENTE**. Etapa + tipo clínico
  (escaneo, cbct, radiografía, foto_clinica, proyecto_cad, librería, diagnóstico, diseño,
  stl_final, comprobante, factura, evidencia) + bucket + **ruta, no URL firmada**.
  Vista `pedidos_archivos_resumen` para ver qué trae y qué le falta a cada caso.
- `js/registro-archivos.js` deduce el tipo por extensión y nombre. El ZIP es ambiguo
  (CBCT o librería): si el nombre sugiere tomografía se marca `cbct`, que es el caso que más
  importa no perder.
- **`registrarFallo()`** deja constancia de lo que NO llegó — antes un archivo descartado no
  dejaba ninguna huella en la base. Esa era la razón de que el CBCT perdido fuera invisible.
- 💡 NO migra ni borra columnas: se llena en paralelo. Migrar de golpe rompería los paneles.

**✅ Paridad Alejandro** — `3624660` (mismo bug del CBCT, crítico ahí porque las guías
quirúrgicas dependen del CBCT) y `a7922c3` (registro de archivos). El SQL corre una sola vez
(Supabase compartido); el código va repo por repo.

### 🔴 PENDIENTE — Alejandro no tiene `revision-diseno.html`
PRODIGY ofrece fabricación al aprobar el diseño (Colombia: fresado/impresión · internacional:
solicitud especial con envío). **Alejandro no tiene esa página**, y siendo el proyecto más
orientado a diseño es justo donde más ingreso se deja sobre la mesa: el cliente aprueba y
nadie le ofrece fabricar.

---

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
