# PRODIGY — PENDIENTES MAESTRO
> Solo tareas activas. Última revisión: 2026-07-10 (sesión autónoma continua)
> Completadas → eliminar. Nuevas → agregar arriba de su bloque.

---

## 🔴 Ejecutar SQL — mass assignment/IDOR en 4 tablas más (barrido sistemático tras el hallazgo de pedidos)

Tras confirmar el bug de `pedidos`, se auditaron todas las demás tablas con INSERT abierto a `anon`/`authenticated`. 4 hallazgos:

1. **`newsletter_subscribers` — el más grave.** La policy `unsubscribe_self` permitía a CUALQUIERA (sin autenticar, sin token) desactivar la suscripción de **cualquier email de la tabla** con un simple PATCH — no validaba ownership. Un competidor podía dar de baja toda la lista de marketing en un loop. Ya existe la RPC segura `newsletter_unsubscribe(p_token)` que sí valida por token — la policy insegura era redundante y peligrosa.
2. **`cotizaciones`** — INSERT sin restricción permitía crear una cotización ya con `estado='aceptada'` y vincularla a un `pedido_id` ajeno (sin validar ownership del pedido).
3. **`solicitudes_scanner`** — INSERT sin restricción permitía marcar la propia solicitud como `estado='cerrado'`/`contactado=true` desde el origen, ocultándola de la cola de gestión de leads del staff.
4. **`waitlist_labs`** — mismo patrón, `estado` podía llegar ya en `'convertido'`, contaminando métricas de conversión.

**Ejecutar `sql/patch-mass-assignment-otras-tablas-2026-07.sql`** en Supabase Dashboard → SQL Editor. Quita la policy insegura de newsletter y fuerza los valores iniciales seguros en el `WITH CHECK` de las otras 3 — verificado que ningún flujo legítimo del navegador se ve afectado (todos ya envían `estado='borrador'`/default explícito, ninguno envía `pedido_id`).

**Confirmado limpio en la misma auditoría:** `referidos` (ya protegida, fuerza valores de fábrica), `casos_portafolio` (ya corregida esta sesión a solo-staff), `bibliotecas_cliente` y `comentarios_portafolio` (ambas exigen ownership correctamente, sin campos de aprobación explotables).

---

## ✅ SQL ejecutado (2026-07-10) — mass assignment crítico en INSERT de pedidos (auditoría estilo pentest)

Confirmado. `sql/patch-mass-assignment-insert-pedidos-2026-07.sql` aplicado: trigger `BEFORE INSERT` que fuerza `pago_estado='pendiente'`, `estado_operativo='VALIDACION_PENDIENTE'` y recalcula `factura_estado` server-side en cada INSERT — antes, un doctor autenticado podía crear un pedido directo por API ya marcado como pagado/entregado sin pagar nunca.

**Confirmado limpio en la misma ronda (sin hallazgos, probado con curl real contra producción):** rate-limit de Cloudflare no falsificable (todos los endpoints usan `CF-Connecting-IP`, ninguno confía en `X-Forwarded-For`); mensajes de error de login no revelan si un email existe; enumeración de UUID en `revision_tokens`/`pedidos` indistinguible (RLS bloquea `anon` por completo, responde `[]` igual con o sin filtro).

**Pendiente de verificación externa (no es código):** confirmar en Supabase Dashboard → Auth → Rate Limits que el límite nativo de intentos de login no esté relajado (el proyecto no tiene ninguna capa propia de rate-limit sobre el login, depende 100% de esa config).

---

## ✅ Fix de código (2026-07-09) — SRI en scripts de CDN + higiene de GitHub Actions (frentes nunca auditados)

Todo commiteado/pusheado, sin SQL pendiente.

**Subresource Integrity (SRI) — hallazgo real: ~63 scripts de CDN en ambos repos se cargaban sin `integrity`, y el SDK de Supabase además sin versión fijada (`@2` resolvía siempre a la última `2.x.x` de jsDelivr).** Si el CDN fuera comprometido, el sitio ejecutaría JS malicioso en login/checkout/subida de archivos de pacientes sin ninguna barrera — la CSP actual (`script-src ... https: 'unsafe-inline'`) no lo habría bloqueado. Corregido:
- `@supabase/supabase-js` fijado a `2.110.2` (versión que estaba resolviendo `@2` en el momento del fix) + `integrity`/`crossorigin` en los 47 archivos de PRODIGY y 16 de Alejandro que lo cargan. Hash verificado descargando el archivo real y comparando contra lo que sirve la URL fijada — coincide exactamente.
- `html5-qrcode@2.3.8` (`mensajero.html`, `inventario.html`, `taller.html`) y `signature_pad@4.1.7` (`mensajero.html`) — ya tenían versión fijada, se agregó `integrity`.
- **Pendiente (menor, no crítico):** Font Awesome se inyecta dinámicamente vía `js/header.js` (no un `<script>` estático) — agregar SRI ahí requiere tocar el JS de inyección, no un simple atributo HTML. `three.js` (visor STL) usa `importmap`, cuyo soporte de `integrity` es inconsistente entre navegadores — no se tocó.
- **Recordatorio operativo:** si en el futuro se actualiza la versión de `@supabase/supabase-js` (o cualquier otra lib con SRI), hay que recalcular el hash y actualizarlo en TODOS los archivos a la vez — un hash desactualizado rompe la carga del script en vez de solo perder la protección.

**GitHub Actions — 2 mejoras de higiene (sin vulnerabilidad crítica encontrada):**
- `deploy.yml` y `purga-stl-semanal.yml` interpolaban secrets (`${{ secrets.X }}`) directo dentro de un bloque `run:` de shell en vez de pasarlos por `env:` — GitHub enmascara el valor en logs automáticamente así que no había fuga confirmada, pero es el patrón recomendado. Corregido en ambos.
- `purga-stl-semanal.yml` y `supabase-keepalive.yml` no declaraban `permissions:` explícito → agregado `contents: read` (mínimo necesario, ninguno de los dos escribe al repo).
- Confirmado limpio: ningún workflow de ninguno de los dos repos se dispara por `pull_request`/`pull_request_target`/`issue_comment` (sin superficie de script-injection vía PR/issue externo), y todas las `uses:` son acciones oficiales `actions/*` en versión fija.

**Confirmado limpio (sin hallazgos):** clickjacking (`X-Frame-Options: SAMEORIGIN` activo y verificado en producción en ambos dominios), cookies propias (solo un flag de "vio el preview" en PRODIGY, no es sesión, no aplica session fixation — Alejandro no tiene cookies propias en absoluto), Service Worker (excluye `/app/` y `*.supabase.co` del caché — ningún dato sensible se cachea, ni siquiera el shell HTML de los paneles).

---

## ✅ SQL ejecutado (2026-07-09) — límite de longitud en RPCs anon

Confirmado. `sql/patch-limite-texto-rpc-anon-2026-07.sql` aplicado: `prodigy_rd_solicitar_cambio()` y `prodigy_rd_enviar_comprobante()` (callable por `anon` sin sesión) ahora truncan el texto libre en vez de aceptarlo sin límite.

---

## ✅ SQL ejecutado (2026-07-09) — CHECK de formato en billing_email

Confirmado. `sql/patch-check-billing-email-2026-07.sql` aplicado: CHECK constraint permisivo en `pedidos.billing_email`. `factura.js` ya rechazaba NIT/email/razón inválidos antes de facturar (fix de código previo).

**Riesgo residual documentado, sin corregir (bajo impacto, no crítico):** `pedidos.telefono`/`email` sin CHECK de formato (fallos silenciosos en cron de WA/recordatorios).

---

## ✅ SQL ejecutado (2026-07-09) — anti-abuso de referidos por WhatsApp

Confirmado ("Success. No rows returned"). `sql/patch-referidos-antiabuso-whatsapp-2026-07.sql` aplicado: el trigger `prodigy_detectar_primer_pedido_referido()` ahora también bloquea el auto-referido si el teléfono del pedido "referido" coincide con el WhatsApp real del doctor referidor (vía `doctores_perfil`), no solo por email idéntico.

**Nota pendiente (verificación manual, no código):** el registro de doctor (`signUp`) no tiene rate limiting propio en el repo — si "Confirm email" estuviera desactivado en Supabase Dashboard → Auth → Settings, facilitaría emails desechables masivos. Pendiente que confirmes ese ajuste en el Dashboard.

---

## ✅ Fix de código (2026-07-09) — sesión/logout + relay WA abierto (Alejandro) + npm audit

Todo commiteado/pusheado.

- **`js/header.js` (ambos repos)** — el logout del mini-login del header (`_phdrLogoutPG`/`_phdrLogout`, usado en el topbar de páginas públicas) solo borraba el token de `localStorage`, **nunca revocaba el refresh token server-side**. Un JWT copiado antes de "cerrar sesión" seguía siendo válido hasta su expiración natural (~1h). El logout de los paneles internos (`auth-guard.js`) sí llamaba `supabase.auth.signOut()` correctamente — la inconsistencia era solo en el header. Corregido: ahora llama `POST /auth/v1/logout` antes de limpiar el storage local.
- **Alejandro `functions/api/wa-auto.js`** — a diferencia de PRODIGY, no validaba el contenido del mensaje: cualquier visitante podía usarlo como relay de WhatsApp arbitrario (cualquier texto, a cualquier número, dentro del rate-limit) usando la cuota CallMeBot del negocio. Corregido con el mismo patrón de PRODIGY: exige que el mensaje incluya la marca y limita a 700 caracteres.
- **PRODIGY `npm audit fix`** — 2 vulnerabilidades moderadas en `devDependencies` (`js-yaml`, `tar` transitiva de `supabase` CLI, ninguna se despliega a producción) corregidas, 0 vulnerabilidades restantes.

**Confirmado limpio (sin hallazgos):** inyección de headers en emails (JSON transport, no vulnerable), SQL injection en RPCs (ninguna función pública construye SQL dinámico con parámetros de usuario), JWT en URL (ninguno), `autoRefreshToken`/`persistSession` (default correcto en todos los `createClient()`), rate limiting con doble control IP+destino en la mayoría de endpoints con destinatario externo.

**Riesgo residual documentado, sin corregir (dependencia de CDN, no de código propio):** `@supabase/supabase-js@2` se carga desde jsdelivr sin pin de versión exacta (`@2`, resuelve siempre a la última `2.x.x`) — no reproducible, un compromiso del paquete en el registro se propagaría sin aviso. `three.js@0.165.0` (visor STL) no está en la última versión pero no es crítico. Pin de versión exacta queda como mejora futura si se quiere.

---

## ✅ SQL ejecutado (2026-07-09) — alerta de precio sospechoso

Confirmado por Alejandro. `sql/patch-alerta-precio-sospechoso-2026-07.sql` aplicado: trigger `AFTER INSERT` (no bloqueante) en `pedidos` que compara `precio_total` contra el precio base real de `catalogo` — si está por debajo del 40% del esperado, genera alerta CRÍTICA en `logs_incidencias` (visible en panel, tab Incidencias/Torre de Control). Cubre ambos negocios.

---

## ✅ Fix de código (2026-07-09) — auditoría dinero + archivos

Todo commiteado/pusheado.

**Dinero:**
- `app/mensajero.html` — el mensajero podía marcar un pedido como "pago confirmado" (saldo contraentrega) subiendo CUALQUIER imagen/PDF como comprobante, sin declarar ni validar el monto realmente cobrado. Ahora exige un campo numérico "monto cobrado" que debe coincidir (±$1.000 COP) con el saldo pendiente antes de permitir confirmar, y deja rastro en `logs_incidencias`.
- Cupones/descuentos, wallet/créditos, reembolsos: sin hallazgos nuevos — ya están bien controlados server-side o no existe la funcionalidad (reembolsos no están implementados en ningún panel).

**Archivos:**
- `app/client-panel.html` (ambos repos) — subida a "bibliotecas" usaba `file.name` crudo en la ruta de Storage (los otros 2 puntos de subida del mismo archivo sí sanitizaban) → agregado el mismo `.replace(/[^a-zA-Z0-9._-]/g,'_')`.
- `envia-tu-scanner.html` (ambos repos) — la extensión del archivo (`file.name.split('.').pop()`) se usaba sin sanitizar en la ruta de Storage → ahora se limpia a solo alfanumérico.
- `seguimiento-caso.html` (ambos repos) — el iframe que carga el HTML de Exocad no tenía atributo `sandbox`, permitiendo que un HTML malicioso navegara la ventana superior o abriera popups → agregado `sandbox="allow-scripts allow-same-origin"`. (`revision-diseno.html` ya lo tenía correctamente.)
- Path traversal por ID/código adivinable, `upsert` sobre rutas predecibles: sin hallazgos nuevos — todos los puntos revisados usan UUIDs no secuenciales + sesión de staff requerida.

**Riesgo residual documentado, sin corregir (requiere decisión sobre UX):** `revision-express.html` abre el HTML de Exocad con `window.open()` directo (no en iframe sandboxeado) — si un HTML malicioso lograra subirse (requiere cuenta de staff comprometida, no explotable por atacante externo anónimo), se ejecutaría con control total de la pestaña. Cambiarlo a descarga forzada en vez de apertura directa rompería la UX actual de "ver el diseño en el navegador" — queda para una sesión dedicada si se quiere endurecer.

---

## ✅ SQL ejecutado (2026-07-09) — audit log roto + casos_portafolio sobre-permisiva

Confirmado por Alejandro ("Success. No rows returned"). `sql/patch-audit-log-y-portafolio-rls-2026-07.sql` aplicado: quitados los 2 CHECK de `logs_incidencias` (tenían solo 7 valores fijos, el código real usa >20 tipos distintos en todo el proyecto — cada INSERT fallaba en silencio, incluido el audit log de acciones admin); `casos_portafolio` restringida a `app_metadata.role IN ('admin','operario','staff')` en vez de cualquier autenticado.

**Ya corregido en código:** `_auditLog()` ahora envía `emisor_id`; se agregó `_auditLog()` a las 9 funciones sensibles que no dejaban rastro (`cambiarRol`, `cambiarEstadoDoc`, `eliminarWaitlist`, `cambiarEstadoRef`, `eliminarRef`, `toggleStaffActivo`, `toggleDept`, `toggleActivo`, `guardarEdicion` del portafolio). Trail de auditoría del panel admin completo.

---

## ✅ Fix de código (2026-07-09) — auditoría flujo carga/entrega diseño↔fabricación + realtime cross-negocio

Todo commiteado/pusheado.

**Realtime sin filtro por negocio (leak de datos entre PRODIGY/Alejandro):** `operario.html`, `operario-diseno.html` y `operator-panel.html` se suscribían a `postgres_changes` de `pedidos` sin filtro — el navegador de un operario de PRODIGY recibía el payload completo (nombre, teléfono, precio) de pedidos de Alejandro CAD/CAM y viceversa, aunque la UI no lo mostrara. Corregido agregando `filter: 'negocio=eq.prodigy'` a los 3 canales (Supabase Realtime solo soporta un filtro por canal — en `operator-panel.html` se sacrificó el filtro por `flujo` server-side porque ya se re-verifica client-side en el callback).

**Confirmado limpio en esta ronda:** URLs firmadas en paneles de fabricación, exports CSV (ningún export expone `hash_seguridad`/`qr_code`/tokens/pagos), RLS de `logs_incidencias` UPDATE/DELETE (solo admin puede editar, nadie puede borrar), `staff_departamentos` RLS (admin-only, correcto), no existe ruta de auto-escalamiento de rol vía el panel.

**Hallazgo de diseño documentado (no es bug, confirmar si es intencional):** ninguna policy RLS sobre `pedidos`/`referidos`/`waitlist_labs` filtra por `negocio` — un admin/operario de PRODIGY con sesión válida técnicamente puede tocar filas de Alejandro CAD/CAM vía RLS y viceversa (ambos comparten los mismos roles). Consistente con "mismo equipo interno gestiona ambos negocios" (CLAUDE.md Ley 1b), pero vale la pena confirmarlo explícitamente si en algún momento los equipos se separan.

**5 gaps de magic-bytes corregidos** (ronda anterior el mismo día): `panel-interno-operaciones.html` (7 subidas), `calidad.html`, `mensajero.html`, `operario-diseno.html`.

---

## ✅ Fix de código (2026-07-09) — auditoría flujo carga/entrega diseño↔fabricación

Todo commiteado/pusheado. Auditados: RLS de Storage, purga STL, magic-bytes en subidas internas, URLs firmadas y exposición de datos en paneles de fabricación.

**5 puntos de subida sin validar magic-bytes, corregidos:**
- `app/panel-interno-operaciones.html` — 7 subidas (portada, galería, exocad HTML, video, PDF, + 2 en modo edición) cargaban `upload-guard.js` pero nunca llamaban `validateMagicBytes()`. El más grave: el HTML de Exocad subido aquí se sirve públicamente en el portafolio.
- `app/calidad.html` — comprobante de pago subía sin validar (el resto de fotos/video de empaque sí validaba).
- `app/mensajero.html` — foto de entrega subía sin validar (el comprobante de saldo sí validaba).
- `app/operario-diseno.html` — subida masiva solo validaba `.stl`, dejaba `.obj`/`.html` sin chequeo de magic-bytes.

**Confirmado limpio:** `operator-panel.html`, `taller.html`, `inventario.html`, `agregar-caso.html` ya validaban correctamente. URLs firmadas correctas en los 4 paneles de fabricación (sin `getPublicUrl()` residual). Purga STL sin condición de carrera (solo actúa sobre `estado_operativo=ENTREGADO`, no interfiere con producción activa).

**Hallazgo de arquitectura (no es bug, es una decisión de diseño a revisar si algún día importa):** no existe separación real a nivel de RLS/Storage entre operario de "diseño" y de "fabricación" — ambos comparten `app_metadata.role='operario'`. `departamento_actual`/`departamento` en `staff_departamentos` solo filtran la UI (qué casos ve cada quien), pero cualquier operario autenticado puede leer vía Storage los buckets de cualquier departamento (`diseno-archivos`, `dental-cases`, etc.) y consultar cualquier fila de `pedidos`. Es un riesgo solo interno (staff ya autenticado), no explotable por atacante externo — se documenta por si en el futuro se quiere aplicar least-privilege real entre departamentos.

---

## ✅ Fix de código (2026-07-09) — ronda 3: secretos en query string + auditoría final de paridad

Todo commiteado/pusheado, sin SQL pendiente:
- 5 funciones cron (`expire-cotizaciones.js`, `alerta-sla.js`, `recordatorio-pago.js`, `resumen-mensual.js`, `notif-stock-bajo.js`) aceptaban `CRON_SECRET` solo por `?key=` en la URL (expuesto en logs de acceso de Cloudflare) → ahora prefieren header `Authorization: Bearer`, con el query string como fallback para no romper ningún caller existente que no se pudo confirmar.
- `bienvenida-referido.js` — comentario de cabecera desactualizado corregido (decía que lo llamaba `flujo-diseno.html` y mencionaba `CRON_SECRET`; en realidad solo lo llama `panel-interno-operaciones.html` con JWT de sesión staff).

**Auditoría completa cerrada esta ronda (los 12 frentes pedidos):** columnas fantasma en tablas compartidas y en TODOS los paneles de staff (incluyendo `panel-interno-operaciones.html`, el dashboard real de login, nunca antes auditado) — 6 bugs reales corregidos; Cloudflare Functions completas en ambos repos (CORS, rate limit, open redirect, validación de montos) — 2 hallazgos corregidos (`factura.js`, `social-copy.js`) + 6 de secretos en query string; validación de protocolo en iframes/galerías — 2 hallazgos corregidos; `sw.js` — limpio en ambos repos; XSS — 2 hallazgos reales corregidos (`caso.html`, `envia-tu-scanner.html` en ambos repos); Habeas Data — limpio, todos los formularios públicos ya lo tienen; `auth-guard.js`+`noindex` — 100% de páginas `/app/*` correctas en ambos repos; GRANT explícitos de Supabase — confirmado ejecutado; paridad RLS entre PRODIGY/Alejandro — confirmado sin exclusiones silenciosas por `negocio`.

**Único pendiente real que queda de toda esta auditoría:** la prueba en vivo de creación de pedido end-to-end (documentada arriba, patch 24 ya ejecutado, solo falta que alguien confirme creando un pedido real).

---

## ✅ Fix de código (2026-07-08) — ronda 2 de auditoría: columnas fantasma en paneles de staff + hardening de Cloudflare Functions

Todo ya commiteado/pusheado, sin SQL pendiente (solo fixes de código):

- `app/inventario.html` — exportar CSV usaba tabla `inventario` (no existe) y columnas `cantidad_actual`/`cantidad_minima`/`unidad` (no existen) → corregido a `inventario_items` con `stock_actual`/`stock_minimo`/`unidad_medida`. Botón "Exportar CSV" estaba roto en producción.
- `app/operario.html` — realtime de "mi departamento" usaba `p.departamento` (fantasma) → corregido a `departamento_actual`; el filtro quedaba anulado (notificaba de todos los departamentos). También `updates.observaciones` (fantasma) → `notas_cambios`: el guardado de notas al aprobar/rechazar diseño fallaba por completo (error de Postgres en el UPDATE).
- `app/operario-diseno.html` — guard `caso?.whatsapp` (fantasma, real `telefono`) siempre `undefined` → la notificación WA automática al doctor en revisión/aprobación de diseño **nunca se ejecutaba**. Corregido.
- `app/contabilidad.html` — `p.servicio` (fantasma, real `tipo_trabajo`) en 7 sitios (tablas de comprobantes/saldos/facturas, modal factura manual, export CSV) quedaba vacío siempre; línea que envía `servicio` a `/api/factura` también corregida. `p.whatsapp`/`pCheck?.whatsapp` (fantasma, real `telefono`) en 2 sitios rompía el aviso WA de factura internacional.
- `app/panel-interno-operaciones.html` — `getWAPedido()` usaba `p.doctor_whatsapp||p.whatsapp` (ambas fantasma) → corregido a `p.telefono`. Rompía los 3 botones de notificación WA (Pago/Diseño/Entrega) sobre el panel de pedidos (este es el dashboard real de login admin, nunca auditado hasta ahora).
- `app/operator-panel.html` — filtro "Urgentes" apuntaba a `p.urgente` (columna nunca persistida, dead code) → corregido a `p.slot_express` (columna real del schema, agregada también al SELECT). **Nota:** ningún flujo de creación de pedido escribe `slot_express` todavía, así que el filtro hoy no traerá resultados hasta que se implemente esa escritura — queda documentado como mejora futura, no se inventó ninguna función nueva.
- `functions/api/factura.js` — ahora valida `precio_total` del body contra el valor real del pedido en BD antes de emitir factura DIAN (antes confiaba ciegamente en el monto recibido).
- `functions/api/social-copy.js` — agregado rate limit (10/hora/IP) que faltaba pese a exigir secreto (protege cuota de Gemini).
- `functions/api/send-push.js` — CORS unificado al patrón dinámico con allowlist (`.pages.dev` + dominio propio) que ya usaba el mismo archivo en Alejandro.
- `patient.html` — filtro de protocolo (`https?://` o ruta relativa) agregado a `gallery` antes de renderizar imágenes (venía de Supabase sin filtrar, a diferencia de `caso.html`).
- `app/calidad.html` — mismo filtro agregado a `fotos_empaque` en 2 puntos.
- **Alejandro** — `functions/api/resumen-semanal.js`: secreto movido de query string (`?key=`) a header `Authorization: Bearer` (quedaba en logs de acceso de Cloudflare).

**Confirmado limpio (sin cambios necesarios):** schemas reales de `creditos_cliente`, `logs_incidencias`, `notificaciones_internas`, `revision_tokens`, `catalogo`, `config_precios`, `despachos`, `waitlist_labs`, `newsletter_subscribers` — todo el código que las usa ya referencia las columnas correctas. `billeteras` confirmada como tabla legacy que nunca se creó (el wallet real vive en `creditos_cliente`). `_middleware.js` (bloqueo de `.md`/`/sql/`/`/scripts/`) ya existe y funciona en ambos repos (verificado con curl en producción, 404 real). Open redirect: solo `stripe-checkout.js` maneja URLs de redirect en ambos repos, y ya valida contra dominio propio — Wompi no recibe redirects del cliente.

**XSS — 2 hallazgos reales corregidos (dato controlado por atacante externo anónimo):**
- `caso.html:539` — el `id` de la URL (`?id=...`) se insertaba sin escapar en el mensaje de error "caso no encontrado", compartible por link → corregido con `escHtml()` (la función ya existía en el archivo, solo faltaba aplicarla aquí).
- `envia-tu-scanner.html` (PRODIGY y Alejandro) — nombre del doctor y WhatsApp (campos de formulario público, sin sesión) se insertaban sin escapar en el mensaje de éxito → agregada función de escape local y aplicada a ambos campos, en ambos repos.

---

## ✅ SQL ejecutado (2026-07-06) — buscar_pedido_publico() (patch 26/26)

Confirmado, "Patch 26 aplicado". La RPC pública de seguimiento (`nonce`→`hash_seguridad`, `p.servicio`→`tipo_trabajo`) ya funciona. También corregido `recibo-caso.html` (`precio_usd`→`total_usd`). Verificados sin hallazgos: `stripe-webhook.js`, webhook de Wompi, `functions/api/factura.js`.

## ✅ Fix de código (2026-07-06) — envia-tu-scanner.html usaba tabla "doctores" inexistente

Al registrar un doctor vía el formulario de escáner, se hacía `upsert` en tabla `doctores` (no existe) con columnas `user_id`/`email` (tampoco existen en la tabla real `doctores_perfil`, cuya llave primaria es `id = auth.users.id` directamente). El perfil del doctor nunca se creaba tras el registro. Ya corregido y pusheado.

Verificados a fondo y **limpios**: `flujo-fresado.html`, `flujo-lab.html`, `js/flujo-impresion.js`, `js/flujo-uploader.js` (línea por línea, no solo el INSERT ya conocido) — todos usan columnas reales y `createSignedUrl` correctamente.

**Con esto se cierra el barrido completo de columnas fantasma por código en ambos proyectos.** Solo queda pendiente la prueba en vivo (crear un pedido real de principio a fin) para validar todo de punta a punta.

---

## 🟡 PRUEBA EN VIVO PENDIENTE — pedidos nunca ha guardado un solo registro (patch 24/24 YA EJECUTADO)

**El hallazgo más grave de toda la auditoría.** Se confirmó con `SELECT count(*) FROM pedidos;` → 0 filas, nunca ha habido ninguna. Causa: los 4 flujos donde un doctor crea un pedido insertaban con columnas que nunca existieron (`doctor`, `whatsapp`, `servicio`, `total`, `link_stl`, `nonce`, `flujo`, `fuente_pago`, `software_diseno`) — el cliente veía "éxito" sin que el pedido se guardara jamás.

**Ya corregido en código y SQL ejecutado** (patch 24 confirmado por Alejandro — agregó `flujo`, `nombre_cliente`, `nota_calidad`, `direccion`). Corregidos: los 4 flujos de creación + ~10 paneles de staff que referenciaban las mismas columnas fantasma.

**FALTA LA PRUEBA REAL** — Alejandro no pudo hacerla en esta sesión (sin tiempo). **Antes de dar esto por cerrado**: crear un pedido de prueba real desde `flujo-diseno.html` (o cualquiera de los 4 flujos) hasta el final, y confirmar con `SELECT * FROM pedidos ORDER BY created_at DESC LIMIT 1;` que se guardó. Si falla, revisar la consola del navegador (F12) al enviar — el mensaje empieza con `[PRODIGY] Pedido diseño no guardado:` y da el error exacto.

---

## ✅ SQL ejecutado (2026-07-05) — trigger de referidos que rompía la confirmación de pago (patch 25/25)

Confirmado por Alejandro, "Patch 25 aplicado". `prodigy_detectar_primer_pedido_referido()` usaba `NEW.doctor` (columna inexistente) — confirmar el pago de cualquier pedido con código de referido fallaba por completo. Corregido a `NEW.nombre_doctor`.

---

## ✅ Fix de código (2026-07-05) — panel de cotizaciones nunca pudo cargar ni guardar

`app/cotizaciones.html` usaba `doctor`/`email`/`whatsapp`/`codigo` en su SELECT y al guardar — ninguna existe en la tabla real `cotizaciones` (columnas reales: `doctor_nombre`, `doctor_email`, `doctor_tel`; `codigo` no existe en absoluto). Ya corregido y pusheado — los fallbacks que ya estaban en el código (`c.doctor||c.doctor_nombre`) ahora sí encuentran datos.

---

## ✅ Auditoría de STL/roles (2026-07-05) — sin hallazgos críticos adicionales

Se auditó el flujo completo de subida de STL (los 4 flujos + `client-panel.html`/`operario.html`/`operario-diseno.html`) y el sistema de roles (`js/auth-guard.js`, `DEST_MAP`). Todo correcto: sin más columnas fantasma, `createSignedUrl()` usado consistentemente, autorización siempre vía `app_metadata.role`. 2 hallazgos menores ya corregidos: comentario desactualizado en `flujo-uploader.js` (decía que el bucket era público) y `DEST_MAP` duplicado en `panel-interno-operaciones.html` desincronizado del de `auth-guard.js` (le faltaba el rol `client` y usaba rutas relativas).

**Verificar cuando puedas** (no bloqueante): `sql/migrate-storage-pedidos-archivos.sql` (migración antigua) deja el bucket `pedidos-archivos` como público — solo es correcto si `patch-storage-buckets-privados-2026.sql` se ejecutó *después* en producción (que debería ser el caso). Confirmar con `SELECT public FROM storage.buckets WHERE id='pedidos-archivos';` → debe dar `false`.

---

## ✅ SQL MAESTRO 2026-07-04 — 15/15 patches aplicados en producción

`sql/MAESTRO-EJECUTAR-TODO-2026-07-04.sql` — confirmado por Alejandro (screenshots), ejecución completa sin errores hasta "Patch 15/15 aplicado". Cubrió: escalamiento de privilegios, fraude de cupones, RLS de precios/catálogo, 8 RPCs de reportes/dashboard/tokens sin verificar rol, tokens de revisión enumerables, wallet suplantable, buckets de Storage públicos, índices de rendimiento, funnel/conversión expuesto sin login, notificaciones internas (rol falsificable + insert/update abiertos a cualquier autenticado), y newsletter (UPDATE anónimo sin filtro permitía desactivar todos los suscriptores).

Nota técnica: el patch 3 (billeteras) tuvo que corregirse a mitad de sesión — esa tabla nunca se creó en producción (el wallet real es `creditos_cliente`) y abortaba todo el script al fallar; se envolvió en un `DO` block condicional (`to_regclass`).

---

## ✅ Fix de código (2026-07-05) — 4 endpoints sin autenticación real (spam/relay + métricas falsas)

Ya commiteado y pusheado. Cubre:
- `bienvenida-referido.js` — decía estar protegido por `CRON_SECRET` pero nunca se verificaba. Ahora exige JWT real de staff (mismo patrón que `factura.js`). El único llamador (`panel-interno-operaciones.html`) ya está actualizado para enviar su `access_token` real.
- `wa-auto.js` — sigue siendo público (necesario para el registro de clientes antes de login), pero ahora tiene límite adicional de 5 mensajes/hora por **número destino** (no solo por IP) para frenar acoso dirigido.
- `lead-magnet.js` — mismo límite por destino (3/día), defensa adicional de bajo costo.
- `supabase/functions/meta-capi/index.ts` — sin ningún llamador real en el código; se agregó verificación opcional de secreto (`META_CAPI_SECRET`).

**Pendiente de tu parte**: 1) agregar `META_CAPI_SECRET` como env var en Supabase (Settings → Edge Functions → Secrets) si quieres activar la protección — mientras no exista, la función sigue abierta sin romper nada. 2) **Redesplegar la Edge Function manualmente** — a diferencia de Cloudflare Pages Functions, los cambios en `supabase/functions/*` no se despliegan solos con `git push`; requiere `supabase functions deploy meta-capi` (o desde el Dashboard si tienes esa opción).

---

## ✅ SQL ejecutado (2026-07-05) — 5 patches de RLS "admin" que no verificaba rol (patches 19-23)

Confirmado por Alejandro, "Patches 19-23 aplicados". Encontrados por auditoría sistemática de archivos `sql/` no revisados a fondo aún. Todos con el mismo patrón: política nombrada "admin_*" pero `USING(true)`/sin chequeo de `app_metadata.role`.

- **Patch 19** — `obtener_mi_codigo_referido()` confiaba en el email enviado por el cliente.
- **Patch 20** — `mensajeros`/`despachos` abiertos a cualquier doctor.
- **Patch 21** — `citas_escaneo`: abierta a **anon sin sesión**.
- **Patch 22** — `clientes` (PII) y `portfolio` (defacement).
- **Patch 23** — `citas_domicilio`, `solicitudes_scanner`, `config_plataformas` (comisiones de pago).

**Nota**: el mismo agente reportó otros 4 hallazgos que resultaron ser falsos positivos (ya corregidos antes en esta sesión, el agente no tenía el contexto completo): `creditos_cliente`, `perfiles`, `inventario_items/lotes_material/inventario_movimientos` (los 3 vía `patch-privesc-user-metadata-2026.sql`), y las RPCs `prodigy_pagos_pendientes`/`prodigy_pedidos_sla_vencido` (ya revocadas vía `patch-revoke-rpcs-lectura-2026.sql`).

---

## ✅ Fix de código (2026-07-05) — getPublicUrl() roto tras privatizar buckets

`calidad.html`, `inventario.html`, `operario.html` y `js/supabase-client.js` seguían usando `getPublicUrl()` en `evidencias-entrega`, `diseno-archivos` y `dental-cases` — buckets ya privatizados por `patch-storage-buckets-privados-2026.sql`. Efecto real: fotos de evidencia de entrega, facturas de inventario y archivos de diseño se veían rotos (403) desde que se ejecutó ese patch. Corregido a `createSignedUrl()` (5 años), mismo patrón que `client-panel.html`/`admin-panel.html`. Ya commiteado y pusheado — no requiere acción de Alejandro.

Sin tocar (bajo riesgo, no aplica): `pruebas-carga.html` (herramienta interna de QA, solo texto informativo) y `js/supabase-mock.js` (mock de desarrollo).

---

## ✅ SQL ejecutado (2026-07-05) — revision-diseno.html lectura + escritura por RPC (patches 17 y 18)

`sql/patch-revision-diseno-idor-2026.sql` y `sql/patch-revision-diseno-escritura-rpc-2026.sql` — ambos confirmados por Alejandro ("aplicado"). Lectura y escritura de pedidos/historial ahora exigen el UUID exacto vía 10 RPCs, ya no hay SELECT/UPDATE abierto de anon.

---

## ✅ VERIFICADO EN VIVO (2026-07-05) — revision-diseno.html funciona de punta a punta

Se probó con un pedido de prueba real (`TEST-AUDIT-001`, ya borrado) el flujo completo: cargar el link, solicitar cambio, aprobar diseño. En el camino se encontraron y corrigieron **3 bugs preexistentes** (no relacionados con seguridad, existían desde antes de esta sesión, solo salieron a la luz al probar en vivo por primera vez):

1. `sql/patch-revision-diseno-hotfix-columnas-2026.sql` — `prodigy_revision_diseno_get()`/`prodigy_rd_solicitar_cambio()` usaban `servicio`/`flujo`/`observaciones`, columnas que no existen (reales: `tipo_trabajo`, ninguna para flujo, `notas_cambios`).
2. `sql/patch-notif-pedido-hotfix-columnas-2026.sql` — el trigger `prodigy_notif_pedido()` (se ejecuta en CADA insert/update de `pedidos`, no solo en revisión de diseño) usaba `departamento`/`servicio`/`urgente`, ninguna existe (reales: `departamento_actual`, `tipo_trabajo`; `urgente` nunca se persistió). **Esto bloqueaba la creación de CUALQUIER pedido nuevo en todo el sistema** hasta que se corrigió.
3. `sql/patch-trigger-restrict-vs-rpc-hotfix-2026.sql` — el trigger `prodigy_restrict_client_pedido_updates()` bloqueaba `estado_operativo` incluso para las RPCs seguras (SECURITY DEFINER no cambia el JWT que ve el trigger); se agregó una excepción puntual vía `set_config` local a la transacción. De paso se corrigió otra columna inexistente (`precio_saldo` → `saldo_pendiente_monto`) en el mismo trigger.

Los 3 hotfixes ya están **ejecutados y confirmados en producción** (Alejandro los aplicó y probó en vivo — `prodigy_rd_aprobar()` devolvió `{"ok":true,...}`).

---

## ✅ SQL ejecutado (2026-07-05) — newsletter_subscribers: constraint unificada PRODIGY/Alejandro

`sql/patch-newsletter-negocio-unificado-2026.sql` (patch 16) — confirmado por Alejandro, "Patch 16 aplicado". Constraint unificada a `UNIQUE(email,negocio)`, `newsletter_subscribe()` de PRODIGY ahora filtra por negocio.

---

## ✅ RESUELTO (via MAESTRO) — reportes financieros, wallet IDOR, RPCs internas, escalamiento de privilegios, admin-precios, fraude de cupones, revision-express

Los siguientes hallazgos de la auditoría 2026-07-03 quedaron **todos ejecutados** como parte de `sql/MAESTRO-EJECUTAR-TODO-2026-07-04.sql` (confirmado, "Patch 15/15" y sucesivos hasta 26/26) — se dejan aquí solo como referencia histórica, no requieren ninguna acción:
- Reportes "ADMIN" visibles a cualquier doctor (`patch-reportes-admin-authz-2026.sql`)
- Wallet/crédito suplantable por nombre (`patch-wallet-idor-2026.sql`)
- `prodigy_pagos_pendientes`/`prodigy_pedidos_sla_vencido` sin revocar (`patch-revoke-rpcs-lectura-2026.sql`)
- Escalamiento de privilegios vía `user_metadata.role` (`patch-privesc-user-metadata-2026.sql`) — el hallazgo más grave de esa ronda
- `admin-precios.html` con `auth.jwt()->>'role'` en vez de `app_metadata.role` (`patch-rls-catalogo-precios-role-2026.sql`)
- Fraude de cupones de referidos (`patch-fraude-cupones-referidos-2026.sql`)
- Enlaces de aprobación de `revision-express.html` enumerables (`patch-revision-express-rpc-seguro-2026.sql`)
- **`revision-diseno.html`** (residual documentado en una ronda anterior) — completamente resuelto y **probado en vivo** el 2026-07-05 (patches 17/18 + 3 hotfixes de columnas), ver sección más abajo.

---

## 🟡 Riesgo residual documentado — send-email.js acepta `tipo`/`text` sin auth (bajo, no urgente)

**Contexto:** a diferencia de Alejandro (que sí tenía el hueco grave de `html` arbitrario, ya corregido), `functions/api/send-email.js` de PRODIGY genera el HTML siempre server-side desde plantillas (`buildTemplate()`), y escapa `text`/`subject` — no permite inyectar HTML/links arbitrarios. Pero **no exige ninguna autenticación**, y tiene 3 llamadores legítimos anónimos reales (`envia-tu-scanner.html`, `operario.html`, `js/emailnotif.js`), así que no se le puede agregar un gate de auth sin romper ese flujo público.

**Riesgo real:** alguien podría enviar emails con contenido de texto libre (aunque sin HTML/links propios) usando la marca y el dominio de PRODIGY, a cualquier destinatario, dentro del límite de rate-limit (10/hora por IP + 5/hora por destinatario, ya activo). Impacto limitado por esos límites y por el escape de contenido — no es un relay de phishing completo, pero sí permite spam de texto simple.

**No se corrigió esta sesión** para evitar romper el flujo público de `envia-tu-scanner.html` sin poder probarlo en vivo. Si en el futuro quieres cerrarlo del todo, la opción sería restringir qué valores de `tipo` puede disparar cada llamador específico (allowlist por origen/contexto) en vez de un gate binario de autenticación.

---

## 🔴 URGENTE — Activar webhook de Stripe (auditoría pagos 2026-07-03)

**Hallazgo grave:** no existía NINGÚN receptor de webhook de Stripe en el proyecto. `stripe-checkout.js` solo creaba la sesión de pago — nada confirmaba del lado del servidor que el cliente realmente pagó. La página `app/success.html` intentaba marcar el pedido como pagado desde el navegador (`estado: 'Pagado_LS'`), pero el trigger de seguridad `trg_restrict_client_pedido_updates` (ya activo en producción) bloquea que un cliente cambie `estado` — esa actualización **fallaba silenciosamente todos los intentos**, sin ningún error visible. En la práctica: los pagos con Stripe (clientes internacionales) nunca quedaban confirmados en el sistema salvo que alguien revisara el Dashboard de Stripe manualmente.

**Ya corregido en código (este commit):**
- Nueva función `functions/api/stripe-webhook.js` — verifica la firma de Stripe (HMAC-SHA256, tiempo constante, rechaza timestamps >5min), procesa `checkout.session.completed`, marca el pedido como Pagado e inserta el registro en `pagos` con las columnas reales del schema
- `stripe-checkout.js`: ahora valida que el monto recibido del navegador coincida con `precio_total` real del pedido en BD (antes se confiaba ciegamente en lo que mandaba el frontend); agregado `Idempotency-Key` para evitar sesiones duplicadas por reintento/doble clic
- `app/success.html`: eliminado el intento de actualización client-side que siempre fallaba
- `supabase/functions/webhook-handler/index.ts` (Wompi): las columnas del insert a `pagos` no coincidían con el schema real (`transaction_id`/`monto`/`estado`/`webhook_data` vs `referencia`/`monto_total`/`estado_pago`/`payload_raw`) — el insert fallaba silencioso, sin auditoría de pagos. Corregido. También se cambió la comparación de firma a tiempo constante.

**Pasos que faltan:**

1. **Esperar deploy de Cloudflare Pages** de este commit
2. **Stripe Dashboard → Developers → Webhooks → Add endpoint**
   - URL: `https://prodigylabdental.com/api/stripe-webhook`
   - Evento a escuchar: `checkout.session.completed`
   - Copiar el "Signing secret" que te muestra Stripe (empieza con `whsec_`)
3. **Agregar `STRIPE_WEBHOOK_SECRET`** en Cloudflare Pages → Settings → Environment Variables (Production, y también en Preview con la clave de test si pruebas ahí)
4. **Probar:** Stripe Dashboard → tu webhook → "Send test webhook" con evento `checkout.session.completed` → debe responder 200

---

## 🔴 URGENTE — Ejecutar 2 SQL + configurar 1 secret (auditoría Storage/Rendimiento 2026-07-03)

**Hallazgo Storage:** los buckets `diseno-archivos`, `evidencias-entrega`, `prodigy-files`, `dental-cases` y `pedidos-archivos` son **públicos** — cualquiera con la ruta del archivo (predecible) puede descargar escaneos STL, fotos de evidencia y documentos de clientes sin login. Además, el cron de purga de STL a 30 días (`trigger-purga-stl-30dias.sql`) solo limpiaba columnas en `pedidos`, **nunca borraba el archivo real en Storage**.

**Hallazgo Rendimiento:** columnas muy consultadas en `pedidos` (`email`, `hash_seguridad`, `created_at`) sin índice — fuerza sequential scan en paneles admin/cliente. Subidas de STL grandes (hasta 500MB) sin reintento automático — en red móvil inestable, un corte a mitad de subida perdía el archivo silenciosamente.

**Ya corregido en código (este commit):**
- 11 llamadas `getPublicUrl()` → `createSignedUrl()` (5 años, ya que reemplazan URLs que se guardan permanentemente en BD) en `operario-diseno.html`, `operator-panel.html`, `revision-diseno.html`, `taller.html`, `mensajero.html`, `client-panel.html`, `js/flujo-uploader.js`
- `envia-tu-scanner.html`: usuario anónimo ya no intenta firmar URL de un bucket que no puede leer — ahora guarda solo la ruta (el futuro panel admin la firma al mostrarla)
- Reintento automático (3 intentos, backoff 1s/2s) en `js/flujo-uploader.js`, `envia-tu-scanner.html`, `operator-panel.html` (bulk upload)
- `portafolio.html`: SDK de Supabase (~100KB) ya no bloquea el `<head>` — movido justo antes de donde se usa
- Nueva Cloudflare Function `functions/api/purgar-stl-storage.js` — borra el archivo real en Storage antes de limpiar la BD
- Nuevo GitHub Action `.github/workflows/purga-stl-semanal.yml` — dispara la purga cada domingo

**Pasos que faltan (en orden):**

1. **Esperar a que este commit se despliegue en Cloudflare Pages** (para que los paneles ya generen URLs firmadas antes de cerrar los buckets)

2. **Ejecutar `sql/patch-storage-buckets-privados-2026.sql`** en Supabase Dashboard → SQL Editor → link directo: `https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw/sql/new`
   - Privatiza los 5 buckets, agrega políticas RLS (staff vía `app_metadata.role`, y anon-insert-only para `pedidos-archivos` que recibe uploads sin login), y desactiva el cron SQL incompleto

3. **Ejecutar `sql/patch-indices-pedidos-2026.sql`** en el mismo SQL Editor — sin riesgo, no bloquea nada, solo agrega 3 índices (`email`, `hash_seguridad`, `created_at`)

4. **Agregar 2 variables de entorno en Cloudflare Pages** (Settings → Environment Variables, ambos entornos Production+Preview):
   - `SUPABASE_SERVICE_KEY` = tu `service_role` key (Supabase Dashboard → Settings → API) — puede que ya exista si `factura.js` la usa, en ese caso no la dupliques
   - `CRON_SECRET` = un string aleatorio largo que tú inventes (ej. generado con `openssl rand -hex 32`) — solo debe coincidir con el mismo valor en el paso 5

5. **Agregar el mismo `CRON_SECRET` como GitHub Secret** en el repo `dental-portfolio` → Settings → Secrets and variables → Actions → New repository secret → nombre `CRON_SECRET`, mismo valor del paso 4

6. **Probar manualmente:** GitHub → Actions → "Purga STL Storage Semanal" → Run workflow (botón manual) → revisar que el resumen del job no dé error

---

## ✅ RESUELTO — Fuga de información: archivos internos servidos en producción

**Hallazgo (auditoría 2026-06-12):** `.md`, `sql/*`, `scripts/*` etc. respondían `200` en producción pese a reglas en `_redirects` (Cloudflare Pages no aplica `_redirects` cuando existe un archivo estático real en esa ruta).

**Fix aplicado (2026-07-02):** `functions/_middleware.js` — intercepta toda request antes del static serving y devuelve 404 si el path matchea `\.md$`, `^/sql/`, `^/supabase/`, `^/scripts/`, `^/package(-lock)?\.json$`.

**Verificado en producción:**
```
curl -I https://prodigylabdental.com/MAP.md                              → 404
curl -I https://prodigylabdental.com/PENDIENTES.md                       → 404
curl -I https://prodigylabdental.com/PRODIGY_LOG.md                      → 404
curl -I https://prodigylabdental.com/sql/patch-revoke-rpcs-internas.sql  → 404
curl -I https://prodigylabdental.com/scripts/auto-journal.js             → 404
```

---

## ✅ RESUELTO — SQL históricos (referidos, revision-tokens, analytics RPCs, churn, waitlist, cotizaciones, RLS bibliotecas, purga STL, RLS client-column-protection, send-push/notify-wa deploy, HSTS, claves Google Drive expuestas)

Todos ejecutados/desplegados entre 2026-05-29 y 2026-06-17, confirmados en su momento — se colapsa aquí solo como referencia histórica, ninguna acción pendiente.

---

## 🔴 Pendiente (acción externa, requiere dashboard) — DMARC + verificar dominio Resend

`_dmarc.prodigylabdental.com` no existe (sin anti-spoofing/reporting). `resend._domainkey.prodigylabdental.com` y `send.prodigylabdental.com` tampoco → Resend probablemente no está verificado, los correos desde `noreply@/bienvenida@/alertas@/sistema@prodigylabdental.com` pueden caer en spam. Guía paso a paso en `PENDIENTES-DNS-EMAIL.md`: (1) Resend Dashboard → Domains → agregar dominio, copiar DKIM/SPF a Cloudflare DNS; (2) confirmar "Verified"; (3) agregar TXT `_dmarc` con `v=DMARC1; p=quarantine; rua=mailto:gerencia@prodigylabdental.com; pct=100`.

---

## 🔴 URGENTE — Bloquean funcionalidades activas

| # | Acción | Dónde | Detalle |
|---|--------|-------|---------|
| ~~1~~ | ~~`GEMINI_API_KEY` en Cloudflare Pages — **PRODIGY**~~ | ✅ **Corregido 2026-06-14** — chatbot responde 200 con gemini-2.5-flash |
| ~~2~~ | ~~`GEMINI_API_KEY` en Cloudflare Pages — **Alejandro**~~ | ✅ **Corregido 2026-06-13** — chatbot responde 200 con gemini-2.5-flash |
| ~~3~~ | ~~`GEMINI_API_KEY` en GitHub Secrets — **repo Alejandro**~~ | ✅ **Corregido 2026-06-13** (`gh secret set`) |
| ~~3b~~ | ~~`GEMINI_API_KEY` en GitHub Secrets — **repo PRODIGY**~~ | ✅ **Corregido 2026-06-13** (`gh secret set`) |
| 4 | `WOMPI_INTEGRITY_SECRET` en Supabase Secrets | Dashboard → Edge Functions → Secrets | Webhook de pago falla |
| ~~5~~ | ~~**Redesplegar ambos sitios** en Cloudflare tras agregar env vars~~ | ✅ **Hecho 2026-06-14** — ambos confirmados funcionando |
| 6 | **Subir casos al portafolio** | `/app/panel-interno-operaciones.html` | Mínimo 5 casos con portada + galería |
| ~~7~~ | ~~**Ejecutar `patch-supabase-public-grants-2026.sql`**~~ | ~~Supabase Dashboard → SQL Editor~~ | ✅ **Ejecutado 2026-05-28** |

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
| **PayPal** | Whitelist `https://prodigylabdental.com` en Return URLs | ⏳ |

---

## 🟡 SEO / GOOGLE

| # | Acción | Estado |
|---|--------|--------|
| 1 | Search Console → re-enviar `sitemap.xml` (ambos sitios) | ⏳ |
| 2 | Google My Business → subir 10-15 fotos del lab | ⏳ |
| 3 | GA4 Real Time → verificar que llegan hits | ⏳ |
| 4 | Google Ads ID → reemplazar `AW-XXXXXXXXX` en `js/conversions.js` línea 22 | ⏳ |
| 5 | DNS Cloudflare → SPF + DKIM + DMARC (ver `PENDIENTES-DNS-EMAIL.md`) | ⏳ |
| ~~6~~ | ~~**OG images Alejandro** → capturar JPG desde HTML: `assets/og-home.html`, `og-calculadora-diseno.html`, `og-diseno-remoto.html` → guardar como `.jpg` 1200×630~~ | ✅ Hecho 2026-06-14 — generadas con Chrome headless, commit 31769c7 |
| ~~7~~ | ~~**OG images PRODIGY** → 19 páginas usan `prodigy-preview.jpg` compartido. Crear imágenes dedicadas por servicio (CAD, fresado, calculadoras) para mejor CTR en redes~~ | ✅ Hecho 2026-06-14 — 26 imágenes generadas, commit 1b8ecd9 |

---

## 🎨 CONTENIDO VISUAL — TUYO

| # | Contenido | Dónde | Impacto |
|---|-----------|-------|---------|
| 1 | 5-10 capturas Exocad reales | Portafolio, diseno-remoto, diseno-cad | 🔴 |
| 2 | Video 30-60 seg OBS: STL → diseño | diseno-remoto hero | 🔴 |
| 3 | Foto tuya en PC con Exocad | nosotros.html, diseno-cad | 🟡 |
| 4 | Antes/después: STL crudo vs. diseño | diseno-remoto, diseno-cad | 🟡 |
| 5 | Foto del laboratorio/taller | nosotros.html | 🟢 |

---

## 📱 TIKTOK @prodigylabdental

| # | Acción |
|---|--------|
| 1 | Completar perfil: bio + link `/diseno-remoto` + foto |
| 2 | Cambiar a Cuenta Creador: Settings → Manage account |
| 3 | Grabar video #1: "¿Cómo envías tu STL?" — 30 seg OBS |
| 4 | Grabar video #2: time-lapse diseño Exocad — 45 seg |
| 5 | Grabar video #3: "¿Cuánto cuesta diseño CAD?" — muestra calculadora |

---

## ✅ COMPLETADO (sesión continuación 2026-05-30 — ronda 4 — plan semanal)
- **Migración CSS completa**: 43 handlers `onmouseover/onmouseout` eliminados en 9 páginas públicas. 170/170 smoke tests.
- **Sistema cotizaciones**: `sql/cotizaciones-table.sql` (RLS + RPC) + botón "Guardar cotización" en calculadora + sección "Mis Cotizaciones" en client-panel
- **BI Dashboard**: `app/metricas.html` — KPIs, pipeline operativo, top servicios, ingresos por semana, tiempos de entrega, forecast, auto-refresh 5min
- **Social Copy Generator**: `functions/api/social-copy.js` (Gemini 2.0 Flash) + UI en admin-panel tab Radar de Ventas con copiar al portapapeles
- **SW v25**: PRECACHE ampliado con /cotizaciones y /revision-express
- **Suite de tests**: extendida de 136 a 170 (34 tests nuevos cubren todas las features de esta sesión)
- **ARCHITECTURE.md**: documentación completa del stack, modelo de datos, seguridad y flujos de trabajo

## ✅ COMPLETADO (sesión continuación 2026-05-30 — ronda 3)
- **CSP + strict-dynamic**: _headers PRODIGY+Alejandro — mejor protección XSS sin romper inline
- **CSP monitoring endpoint**: functions/api/csp-report.js — registra violaciones en logs_incidencias para análisis
- **107 smoke tests**: ampliados con tests de AR viewer, analytics, offline sync, CSP, export CSV
- **Export CSV admin-panel Alejandro**: botón con window._acPedidos
- **VERIFICAR.md**: sección smoke tests con comando y expectativa
- **health-check dual-channel**: email Resend + WA Callmebot para APIs caídas

## ✅ COMPLETADO (sesión continuación 2026-05-30 — ronda 2)
- **MI CLÍNICA ANALYTICS**: Tab en client-panel con KPIs, gráfica barras CSS, top servicios, ahorro vs método tradicional, IntersectionObserver para carga lazy
- **BACKGROUND SYNC offline mensajero**: SW + IndexedDB + badge visual — evidencias se suben automáticamente al recuperar señal en Bogotá
- **EXPORT CSV panel-interno**: Botón en header, exporta todos los pedidos con campos completos, BOM UTF-8 Excel
- **BIOMECÁNICA EN FLUJO-LAB**: generarOrden() interceptada, bloqueos impiden envío, advertencias piden confirmación
- **AR VIEWER WebXR**: js/ar-viewer.js — Android WebXR hit-test real, iOS QuickLook fallback, visor 3D para desktop. Botón "AR" en revision-diseno y caso

## ✅ COMPLETADO (sesión continuación 2026-05-30)
- **SW v24**: cache invalidado para que usuarios vean los cambios de seguridad/UX
- **90 Smoke Tests**: suite automatizada en CI/CD que valida 15 bloques antes del deploy
- **Export CSV contabilidad**: botón "📊 Exportar CSV" con historial completo + BOM UTF-8 Excel
- **label[for] en client-panel y admin-panel**: pd-uds, pd-dientes, pd-link, pd-notas, img-input, p-titulo, gallery-input
- **bugfix biomecanica-rules.js**: template literal con opts → string literal (error en Node.js vm)
- **MAP.md sync**: SW_VERSION actualizado v23 → v24

## ✅ COMPLETADO (sesión continuación 2026-05-29 — ronda 13)
- **fix(CRÍTICO) Alejandro**: nombres de objetos JS con espacios → ACConversions, ACUTM, ACGeo, ACViewer, ACAnalytics. El tracking de UTM/conversiones/geo nunca había funcionado. 6 archivos corregidos.
- **security**: 0 window.open sin noopener en TODA la codebase PRODIGY + Alejandro (HTML + JS + paneles app/)
- **biomecanica-rules.js Alejandro**: copiado de PRODIGY + integrado en calculadora-diseno.selSrv()
- **biomecanica flujo-impresion**: selectMaterial() integrado + cargado en flujo-impresion.html
- **bulk upload operator-panel**: modal drag & drop completo con regex ID + magic bytes + auto-asocia kanban
- **nesting pre-calculado**: inventario — barra de vida de discos con alerta <20%
- **churn-alert integrado**: resumen-semanal ejecuta churn detection cada lunes automáticamente

## ✅ COMPLETADO (sesión continuación 2026-05-29 — ronda 12)
- **Bulk Upload STL**: operator-panel — drag & drop masivo, regex extrae ID, magic bytes paralelo, auto-asocia a kanban
- **Nesting Pre-calculado**: inventario — barra de vida de discos, alerta <20% espacio
- **Onboarding post-pago**: success.html — card 3 pasos visible solo primera vez (localStorage)
- **Reglas Biomecánicas**: biomecanica-rules.js con 7 reglas + integrado en calculadora-fresado, calculadora-diseno, flujo-diseno, flujo-fresado
- **Churn Prevention**: churn-alert.js Edge Function + SQL VIEW doctors_inactivos
- **AI Failover**: auto-journal → Gemini (2 reintentos) → Claude Haiku como backup
- **Health Check**: functions/api/health-check.js verifica 12 APIs + alerta WA si fallan
- **STL Purge trigger**: sql/trigger-purga-stl-30dias.sql — purga automática a 30 días

## ✅ COMPLETADO (sesión continuación 2026-05-29 — ronda 11)
- **perf**: defer en jsPDF+QRCode (admin-panel) + content-guard/callmebot (client-panel)
- **security audit log ampliado**: CONFIRMAR_PAGO_FABRICACION + PUBLICAR/OCULTAR_CASO_PORTAFOLIO + CONFIRMAR_PAGO contabilidad + DELETE gestionar-casos
- **security validateMagicBytes 100%**: calidad, operario-diseno, mensajero, operator-panel, inventario, taller, client-panel, operario, admin-panel (PRODIGY) + admin-panel, client-panel (Alejandro)
- **security SECURITY.md**: documentación formal de medidas de seguridad implementadas
- **a11y aria-current**: mis-casos + client-panel Alejandro; aria-current en nav de todos los paneles completado

## ✅ COMPLETADO (sesión continuación 2026-05-29 — ronda 10)
- **security Modal Manager global**: header.js (PRODIGY+Alejandro) — role=dialog + aria-modal + focus trap automático vía MutationObserver en TODOS los modales de app/
- **security session timeout**: auth-guard.js (PRODIGY+Alejandro) — 30 min inactividad, aviso 1 min antes, cierre automático
- **security audit log**: panel-interno-operaciones — _auditLog() registra DELETE_CASO_PORTAFOLIO + CAMBIAR_ESTADO en logs_incidencias
- **security upload-guard**: validateMagicBytes disponible en 9 paneles con file uploads; integrado en admin-panel subirCaso()
- **security RLS SQL**: bibliotecas_cliente + diseno_revisiones — políticas de aislamiento por usuario (0c pendiente de ejecutar)
- **security rate limiting**: factura.js edge function — 10/hora por IP
- **a11y aria-current**: 8 paneles de PRODIGY con nav sidebar activo
- **a11y upload-guard.js**: cargado en todos los paneles que suben archivos

## ✅ COMPLETADO (sesión continuación 2026-05-29 — ronda 9)
- **a11y aria-live toast COMPLETO**: role=status + aria-live en TODOS los toasts de paneles app (PRODIGY 9 paneles, Alejandro 4 paneles incluye toast dinámico en JS)
- **a11y**: successPanel aria-live + fix label[for] caseDesc→caseDescription en agregar-caso (mismatch for/id)
- **a11y label[for]**: reset-password (new-pass, confirm-pass) ambos proyectos
- **a11y main landmark**: app/success.html
- **a11y+ux type=search**: enterkeyhint=search + aria-label en 5 inputs de búsqueda de paneles PRODIGY + mis-casos Alejandro
- **a11y aria-live login**: successPanel + mensajero upload-progress + admin-panel busq-pedidos
- **perf**: eliminar og-guias-quirurgicas.png (408KB, huérfano — solo existía el .jpg de 94KB)

## ✅ COMPLETADO (sesión continuación 2026-05-29 — ronda 8)
- **a11y login**: role=alert + aria-live=assertive en mensajes de error del login (PRODIGY + Alejandro)
- **a11y reset-password**: aria-live=polite en msg-box (PRODIGY + Alejandro)
- **a11y onboarding**: aria-live en msg-box + label[for] en ob-nombre/wa/clinica/ciudad
- **a11y gestionar-casos**: label[for] en editName/editCode/editDate/editDesc
- **a11y prefers-reduced-motion**: admin-precios.html
- **ux Escape handlers**: operator-panel (modal-panico+qa), flujo-impresion (global), flujo-fresado (global), flujo-diseno (PRODIGY+Alejandro), flujo-lab
- **perf**: manifest.json cache 1 día en _headers (PRODIGY + Alejandro)
- **a11y aria-live**: matGrid catalogo.html + total-badge flujo-lab.html
- **docs Alejandro PENDIENTES**: ítem 0 urgente SQL RLS agregado

## ✅ COMPLETADO (sesión continuación 2026-05-29 — ronda 7)
- **a11y aria-live**: matGrid catalogo.html + total-badge flujo-lab.html → role=status + aria-live=polite
- **a11y label[for]**: flujo-diseno PRODIGY — indicativo, especialidad, origen, envio
- **a11y aria-pressed**: caso.html (ambos) — selReaction() sincroniza botones de reacción
- **ux Escape**: panel-interno-operaciones — cerrarModalCotizar agregado al keydown handler
- **perf cache**: manifest.json → Cache-Control 1 día en _headers (ambos)
- **seo redirects**: /cotizador, /blog, /diseno-dental, /laboratorio, /pedir PRODIGY; /cotizador, /guia-quirurgica, /pedido Alejandro
- **seo titles**: calidad (74→67), calculadora-impresion (75→65), flujo-impresion (73→72), terminos (73→60)
- **auditoría 0 errores**: PRODIGY 25 warnings intencionales, Alejandro 11 warnings intencionales

## ✅ COMPLETADO (sesión continuación 2026-05-29 — ronda 6)
- **fix(css) crítico**: Alejandro — css/global-nav.min.css + css/styles.css no existían en repo (404 silenciosos en 4 páginas: envia-tu-scanner, portafolio, seguimiento-caso, terminos)
- **a11y label[for]**: flujo-diseno PRODIGY + Alejandro — selects indicativo, especialidad, origen, envio sin label
- **a11y aria-pressed**: caso.html (PRODIGY + Alejandro) — selReaction() sincroniza botones de reacción
- **a11y type=button 100%**: header.js (23 PRODIGY, 26 Alejandro) + footer.js (3 PRODIGY, 2 Alejandro) + 18 JS files adicionales PRODIGY + 8 Alejandro
- **ux**: Escape handler panel-interno — cerrarModalCotizar agregado
- **auditoría**: 0 errores en ambos proyectos (25 PRODIGY warnings, 11 Alejandro warnings — todos intencionales o falsos positivos)

## ✅ COMPLETADO (sesión continuación 2026-05-29 — ronda 5)
- **security RLS 0a**: trigger ejecutado en Supabase PRODIGY — protege estado/precio/pago de clientes ✓
- **security SQL**: `sql/patch-rls-client-column-protection.sql` creado para PRODIGY + Alejandro (0b pendiente de ejecutar)
- **security**: noopener,noreferrer en todos los window.open _blank — 8 archivos PRODIGY + 11 Alejandro
- **a11y type=button 100% HTML+JS**: footer.js (3), header.js (23), flujo-impresion.js (6), geo-detect.js (1), navbar.js (2), qr-generator.js (1), stl-multi-viewer.js (5), webpush.js (1), patient.html (1), seguimiento-caso.html (2) PRODIGY — mismo para Alejandro
- **seo sitemap**: lastmod 2026-05-29 en 14 páginas PRODIGY + 7 Alejandro
- **seo titles**: calidad (74→67), calculadora-impresion (75→65), flujo-impresion (73→72), terminos (73→60)
- **seo redirects**: /cotizador, /blog, /diseno-dental, /laboratorio, /pedir, /dentista (PRODIGY) + /cotizador, /blog-cad, /guia-quirurgica, /pedido (Alejandro)
- **audit paneles**: 0 riesgos en operario/calidad/taller — solo el trigger SQL faltaba para clientes

## ✅ COMPLETADO (sesión continuación 2026-05-29 — ronda 4)
- **a11y type=button COMPLETO**: 0 buttons sin type= en páginas públicas de PRODIGY ni Alejandro
  - PRODIGY: flujo-diseno, flujo-fresado, flujo-impresion, flujo-lab, caso, revision-diseno, index, soporte, terminos, mantenimiento, calculadoras x3, portafolio, seguimiento-caso, patient, recibo-caso (100+ botones)
  - Alejandro: caso, flujo-diseno, portafolio, recibo-caso, seguimiento-caso, calculadora-diseno, guias-quirurgicas, terminos, recibo-demo
- **a11y type=button en app/**: admin-panel PRODIGY, client-panel PRODIGY, panel-interno, gestionar-casos, contabilidad, operario, mis-casos Alejandro, admin-panel Alejandro
- **a11y .sr-only CSS global**: styles.css PRODIGY — clase utilitaria para screen readers

## ✅ COMPLETADO (sesión continuación 2026-05-29 — ronda 3)
- **a11y label[for] paneles**: admin-panel PRODIGY (met-periodo, p-tipo/material/software/categoria/destacado); client-panel PRODIGY (pd-tipo, pd-material, bib-tipo); contabilidad (fechas + aria-label selects); gestionar-casos (editType); inventario (fil-cat, ent-venc)
- **a11y label[for] paneles Alejandro**: client-panel (bib-tipo); mis-casos (fil-estado, av-nuevo)
- **a11y type=button + aria-pressed**: catálogo filtros + instalar-app dev-btn + guia-tecnica banner + guias-quirurgicas toggle-btn + terminos-y-legal btn-top + recibo-demo btn-pdf
- **a11y paginación**: portafolio (PRODIGY + Alejandro) → type=button + aria-label + aria-current=page en botones de página
- **a11y aria-live toasts**: 8 PRODIGY (envia-tu-scanner, escaner-domicilio, nosotros, 3 calculadoras, calculadora, journal) + 3 Alejandro (blog, calculadora-diseno, envia-tu-scanner)
- **a11y aria-hidden FA**: header.js global → aria-hidden automático en ~700+ íconos decorativos FA
- **a11y type=button**: seguimiento-caso (ambos) → botón buscar + aria-hidden en ícono
- **a11y .sr-only**: styles.css global PRODIGY — clase utilitaria para screen readers
- **a11y label en dates**: contabilidad.html — label[for] en todos los inputs de fecha

## ✅ COMPLETADO (sesión continuación 2026-05-29 — ronda 2)
- **a11y label[for]**: flujo-diseno (software, pago_metodo, billing_tipo_d), flujo-fresado (origen, envio, pago_metodo, billing_tipo), flujo-impresion (origen, envio, pago_metodo, billing_tipo) — ambos proyectos
- **a11y label[for]**: admin-panel PRODIGY modal portafolio (p-tipo, p-material, p-software, p-descripcion, p-categoria, p-destacado)
- **a11y aria-live**: res-card en 3 calculadoras PRODIGY + calculadora-diseno Alejandro → role=status + aria-live=polite + aria-atomic
- **a11y aria-current**: admin-panel Alejandro sidebar → showTab() sincroniza aria-current=page
- **a11y journal**: filter-tags → role=group + aria-label + aria-pressed en todos los tag-btn; filterArticles() sincroniza

## ✅ COMPLETADO (sesión continuación 2026-05-29)
- **a11y gallery**: caso.html (PRODIGY + Alejandro) + revision-diseno.html — gallery-item div→button con aria-label + CSS reset (display:block;padding:0)
- **a11y portafolio/journal/blog**: aria-pressed en filtros + role=group + sincronización en filtrar()/filterArticles()
- **a11y skip link**: mapa-sitio.html — único pendiente público; skip link + main id="main-content"
- **a11y landmarks**: recibo-caso.html + offline.html (ambos proyectos) — main landmark + button[type=button] para Reintentar/Retry
- **a11y nav**: panel-interno-operaciones.html — aria-current=page en switchTab() + item inicial
- **a11y autocomplete**: flujo-diseno (nombre/tel/ciudad), flujo-fresado/impresion (billing_email) — ambos proyectos
- **security noopener**: todos los target=_blank en app/ — admin-panel, client-panel, operario, operario-diseno, panel-interno, mis-casos, configuracion (PRODIGY + Alejandro)
- **a11y prefers-reduced-motion**: portafolio.html + instalar-app.html (PRODIGY) + portafolio.html (Alejandro)
- **seo desc**: caso.html PRODIGY 119→144 chars; caso.html Alejandro 85→136 chars

## ✅ COMPLETADO (sesión continuación 2026-05-28 — ronda 11)
- **Fix dominio**: callmebot.js (6 refs), webpush.js (7 refs), emailnotif.js (3 refs), client-panel.html (1 ref) — prodigydentallab→prodigylabdental
- **Fix schema**: BreadcrumbList duplicado eliminado en diseno-cad.html + diseno-remoto.html
- **Security(sw)**: notificationclick data.url validado contra dominio propio en ambos sw.js
- **Security(sw)**: webpush.js URL fallback correcto (prodigydentallab→prodigylabdental.com)
- **SEO**: hreflang es/en/x-default en article.html Alejandro (faltaba)
- **Audits**: utm-tracker.js, geo-detect.js, content-protection.js, content-guard.js, prodigy-analytics.js — todos limpios ✓
- **Scan masivo flujo-diseno.html Alejandro**: limpio ✓ (2 matches = ya corregidos)

## ✅ COMPLETADO (sesión continuación 2026-05-28 — ronda 10+)
- **Fix bug**: stl-multi-viewer.js (ambos) — _pgToast indefinida → fallback fdToast/alert; escH(f.name)
- **Fix XSS toast**: fdToast/frsToast/impToast — escH en ${msg} de innerHTML (flujo-diseno/fresado/impresion PRODIGY + flujo-diseno Alejandro)
- **Fix XSS badge**: badgeEstado + badgePago escH fallback — admin-panel.html Alejandro
- **Fix XSS badge**: pagoEstadoBadge escH fallback — recibo-caso.html (ambos)
- **Fix XSS**: taller.html PRODIGY — inline replace → escH(error.message)
- **Fix XSS**: admin-precios.html PRODIGY — escH(error.message)
- **Cache fix**: eliminar regla articles.js max-age=86400 duplicada (sobrescribía must-revalidate) en _headers PRODIGY
- **Cache fix**: eliminar regla sw.js no-cache duplicada (la no-store ya existía y ganaba) en _headers PRODIGY
- **Perf**: Inter font asíncrona en index.html PRODIGY + preconnect Google Fonts
- **SQL**: patch-supabase-public-grants-2026.sql marcado como ejecutado ✓
- **Scan masivo**: 17 matches innerHTML analizados — solo 2 reales (admin-precios, taller), resto hardcoded/pre-escaped/blob
- **Scan masivo**: toast functions → todas usan textContent (no innerHTML) en ambos proyectos ✓
- **Scan masivo**: geo.region, keywords, viewport, canonical, noindex app/, og:type — 100% completo ambos proyectos ✓

## ✅ COMPLETADO (sesión continuación 2026-05-28 — rondas 18-20 FINALES)
- **a11y header.js (ambos)**: aria-expanded+aria-controls+label dinámico en hamburguesa; role=navigation+aria-label en nav desktop; role=navigation+aria-label en menú móvil; aria-expanded+aria-controls en botón chatbot IA; role=dialog+aria-label en ventana chatbot; aria-label en textarea chatbot
- **a11y formularios**: aria-describedby en fecha_cita (escaner-domicilio) + fileInput (envia-tu-scanner ambos); aria-invalid en validaciones flujo-lab.html
- **seo últimas**: og:locale:alternate en 28 PRODIGY + 13/13 Alejandro — 100% bilingüe; schema url field calculadora-diseno Alejandro; Person schema duplicado eliminado sobre-mi Alejandro
- **perf**: version params 100% en todos los scripts JS — cobertura total
- **AUDIT FINAL**: 27/27 PRODIGY + 13/13 Alejandro con todos los elementos SEO/a11y ✓
- **Código autónomo**: AGOTADO — las mejoras restantes son ~0.1% impacto y requieren acción del usuario

## ✅ COMPLETADO (sesión continuación 2026-05-28 — ronda 17)
- **a11y aria-live**: seguimiento-caso (ambos) + portafolio PRODIGY + articlesTrack journal/blog
- **a11y role=feed**: journal.html PRODIGY + blog.html Alejandro
- **perf LCP**: article.html (ambos) — cover image lazy→eager + fetchPriority=high
- **seo**: og:locale:alternate completado — 28 PRODIGY + 13/13 Alejandro (100% cobertura)
- **seo**: redirects adicionales /guias, /scanner, /pedido en PRODIGY
- **seo**: títulos flujo-fresado + flujo-impresion mejorados (35/30 → 63/65 chars)
- **schema**: url field en calculadora-diseno.html Alejandro
- **a11y**: aria-label en lang buttons — guias-quirurgicas.html Alejandro
- **Audits OK**: DOM clobbering limpio ✓; format-detection no crítico ✓; conversions.js eventos OK ✓; checkout flujo-diseno validado ✓

## ✅ COMPLETADO (sesión continuación 2026-05-28 — ronda 16)
- **perf version params 100%**: PRODIGY y Alejandro — todos los scripts JS locales tienen ?v=20260528 (header.js, footer.js, auth-guard.js, articles.js, i18n.js, emailnotif.js, stl-multi-viewer, upload-guard, webpush, callmebot, flujo-uploader, etc.)
- **seo og:locale:alternate**: 28 páginas PRODIGY + 13/13 Alejandro con og:locale:alternate=en_US en páginas con hreflang EN
- **seo títulos**: flujo-fresado (35→63 chars) + flujo-impresion (30→65 chars) PRODIGY
- **fix schema url**: calculadora-diseno.html Alejandro — campo url agregado al Service schema
- **a11y**: aria-label en botones de idioma ES/EN — guias-quirurgicas.html Alejandro
- **seo sitemap**: lastmod 2026-05-28 para 4 páginas Alejandro con cambios de contenido
- **Audit 100%**: PRODIGY 27/27, Alejandro 13/13 — cobertura total de elementos SEO/a11y

## ✅ COMPLETADO (sesión continuación 2026-05-28 — ronda 15)
- **a11y**: type='button' en botones ux-btn + lang-btn — 24 páginas PRODIGY + 9 Alejandro + blog Alejandro
- **seo**: redirects 301 en PRODIGY — /terminos, /privacidad, /seguimiento, /guias, /scanner, /pedido
- **seo**: redirects 301 en Alejandro — /privacidad, /seguimiento (completando faltantes)
- **seo**: robots.txt Disallow /api/ en ambos proyectos
- **seo**: WebSite schema + SearchAction en index.html Alejandro
- **fix(csp)**: upload.wikimedia.org en img-src Alejandro — imágenes del auto-journal
- **perf**: preconnect googletagmanager.com en flujos PRODIGY + páginas Alejandro
- **perf**: footer.js?v=20260528 en 33+12 páginas; header.js en 22+7; auth-guard.js en 16+4
- **perf**: scripts lazy footer.js con versión 20260528 (utm-tracker, conversions, geo-detect, content-protection)
- **security(csp)**: upgrade-insecure-requests en ambos CSPs
- **Audits OK**: noopener en todos los links WA ✓; Pragma no-cache en app ✓; X-Content-Type-Options nosniff ✓; X-Frame-Options ✓; Gemini API NO en CSP (proxy) ✓; SW version sin cambio (PRECACHE sin cambios) ✓

## ✅ COMPLETADO (sesión continuación 2026-05-28 — ronda 14)
- **Cache-busters**: footer.js?v=20260528 en 33 PRODIGY + 12 Alejandro
- **Cache-busters**: header.js?v=20260528 en 22 PRODIGY + 7 Alejandro
- **Cache-busters**: auth-guard.js?v=20260528 en 16 app/ PRODIGY + 4 Alejandro
- **Cache-busters**: scripts lazy footer.js (utm-tracker/conversions/geo-detect) → v=20260528
- **CSP**: upgrade-insecure-requests en ambos _headers — previene mixed-content
- **CSP**: upload.wikimedia.org en img-src Alejandro — imágenes del auto-journal
- **SEO**: WebSite schema + SearchAction en index.html Alejandro
- **SEO**: robots.txt Disallow /api/ en ambos proyectos
- **SEO**: robots.txt bloquear Applebot-Extended + Diffbot (nuevos bots 2025-2026)
- **Perf**: preconnect googletagmanager.com en 5 PRODIGY + 5 Alejandro
- **MAP.md**: FOOTER_VER actualizado a v=20260528

## ✅ COMPLETADO (sesión continuación 2026-05-28 — ronda 13)
- **a11y**: prefers-reduced-motion global en 19+1 páginas PRODIGY + 16+1 Alejandro — cubre todas las animaciones infinitas
- **a11y**: aria-current='page' en link activo de navegación — header.js (ambos)
- **ux**: noscript fallback con WA en calculadora-diseno + revision-diseno PRODIGY
- **ux**: maxlength=2000/1000/254 en textareas/emails de formularios (nosotros, envia-tu-scanner, escaner-domicilio, flujo-lab, ambos proyectos)
- **fix links**: 4 links internos rotos en Alejandro corregidos (/calidad→/sobre-mi, /diseno-cad→/diseno-remoto, /guia-tecnica→WA, /privacidad→/terminos-y-legal#privacidad)
- **a11y scope**: <th scope='col'> en 5 tablas PRODIGY + 2 Alejandro
- **Audits OK**: window.onload solo en DentalWebGL (aceptable) ✓; novalidate intencional ✓; SRI complejo sin hash ✓; LocalBusiness openingHoursSpecification correcto ✓

## ✅ COMPLETADO (sesión continuación 2026-05-28 — ronda 12+)
- **Fix copy (usuario)**: 'Archivo escáner' → 'Archivos de escaneo' en label de envia-tu-scanner (ambos)
- **Fix copy**: 6 textos en PRODIGY que confundían 'escáner' (dispositivo) con 'escaneo' (archivos): i18n.js, diseno-cad.html, fresado-cam.html, mantenimiento.html
- **Fix copy Alejandro**: sobre-mi.html + envia-tu-scanner.html noscript
- **a11y**: scope='col' en <th> de 5 tablas PRODIGY (guias-quirurgicas, guia-tecnica, calidad, article, revision-diseno) + 2 Alejandro (guias-quirurgicas, article)
- **a11y**: label[for] en flujo-lab (8 inputs) + escaner-domicilio (10) + envia-tu-scanner PRODIGY (9) + Alejandro (6)
- **a11y**: role=search + label[for=searchOrden] en seguimiento-caso (ambos)
- **ux**: alert() → toast no bloqueante en caso.html (ambos), flujo-lab, revision-diseno
- **ux**: enterkeyhint=search en seguimiento-caso, enterkeyhint=send en nosotros textarea
- **perf**: meta color-scheme=dark en 56 PRODIGY + 25 Alejandro (previene flash blanco)
- **Alerta añadida**: auto-journal PRODIGY sin correr desde 2026-04-29 — necesita GEMINI_API_KEY en GitHub Secrets PRODIGY repo

## ✅ COMPLETADO (sesión continuación 2026-05-28 — ronda 9)
- **Cache**: sw.js → no-cache en _headers PRODIGY (estaba bajo /js/* immutable — SW nunca se actualizaría); articles.js → must-revalidate (se actualiza martes+jueves)
- **A11y lightbox**: img.alt dinámico en openLB/moveLB/openLBPool — caso.html (ambos) + revision-diseno.html PRODIGY
- **SEO desc**: article.html PRODIGY 127→156; article.html Alejandro 115→154; mapa-sitio.html 113→158; flujo-diseno.html 132→151; flujo-fresado.html 132→155; en/global-design.html 161→150 (reducir 1 sobre límite)
- **SEO local**: geo.region+placename+position+ICBM en article.html (ambos) + calculadora.html PRODIGY; sitemap lastmod calculadora → 2026-05-28
- **SEO social**: og:image:width=1200 + og:image:height=630 en 15 páginas Alejandro (imagen conocida = 1200×630)
- **Schema fix**: article.html PRODIGY — author Organization→PRODIGY Lab Dental (no "Alejandro Carvajal")
- **Audits OK**: todas las app/ con noindex ✓; target="_blank" con noopener ✓; console.log sin datos sensibles ✓; API keys no hardcodeadas ✓; auto-journal manejo errores ✓; workflows GHA seguro y mínimo permisos ✓; manifests PWA completos ✓; sitemap.xml 1h cache ✓; FAQPage en todos los <details> ✓; títulos ≤72 y desc ≥140 en todas las páginas indexadas ✓

## ✅ COMPLETADO (sesión continuación 2026-05-28 — ronda 8)
- **Security edge functions**: stripe-checkout ambos proyectos — open redirect en success_url/cancel_url → validado contra dominio propio; amount_cop coercionado + cap 50M; description truncada 250 chars
- **Security edge functions**: send-email Alejandro — rate limit 5/10min + regex email validation
- **Security edge functions**: send-push Alejandro — rate limit 10/10min + URL domain validation + try/catch + length caps
- **Security edge functions**: notify-wa PRODIGY — rate limit 20/5min + recibo_url validado contra dominio propio
- **Security edge functions**: factura PRODIGY — verificarAdmin() aplicado también al GET endpoint
- **Security app pages**: contabilidad.html PRODIGY — 3 hrefs con datos DB → ^https?:// (comprobante_pago_url viewer, comprobante_saldo_url, factura_pdf_url); onclick img usa dataset.url (evita JS string injection)
- **Security app pages**: operario.html PRODIGY — link_diseno href → ^https?://
- **Security app pages**: client-panel PRODIGY — verRevisionPD() protocol check https: antes de iframe.src
- **Security app pages**: client-panel Alejandro — verRevision() protocol check https: antes de iframe.src
- **Security app pages**: operario-diseno PRODIGY — previsualizarDiseno() protocol check https:
- **Security app pages**: admin-panel Alejandro — preview-iframe.src protocol check https:
- **Security public pages**: seguimiento-caso.html (ambos) — exocad_link → https: check antes de iframe.src
- **Security gallery**: caso.html (ambos) — gallery + gal2 filtradas con /^https?:\/\// antes del lightbox
- **Security gallery**: revision-diseno.html PRODIGY — fotos_diseno_urls filtradas
- **Security patients/**: noindex,nofollow en patient-001/exocad.html + patient-002/caso.html
- **SEO a11y**: og:image:alt + twitter:image:alt en 31 páginas PRODIGY + 16 páginas Alejandro (batch)
- **SEO feat**: article.html ambos — og:image:alt y twitter:image:alt actualizados dinámicamente con titulo del artículo; tw-image sincronizado con cover
- **CSP**: media-src 'self' blob: *.supabase.co drive.google.com en _headers ambos proyectos
- **Audits OK**: resumen-semanal.js ✓; 404.html (ambos) con todos los requisitos ✓; _redirects (ambos) completos ✓; postMessage solo en libs ✓; document.write: ninguno ✓; eval solo en DentalWebGL ✓; localStorage en innerHTML: ninguno ✓; URLSearchParams en innerHTML: ninguno ✓; Habeas Data: todos los formularios públicos cumplidos ✓

## ✅ COMPLETADO (sesión continuación 2026-05-28 — ronda 7)
- **SEO PRODIGY**: desc mejoradas en 8 páginas indexadas (123-140 → 146-156 chars): envia-tu-scanner, fresado-cam, diseno-cad, guias-quirurgicas, nosotros, portafolio, catalogo, diseno-remoto
- **SEO Alejandro**: desc mejoradas en 4 páginas (128-136 → 148-159 chars): diseno-remoto, guias-quirurgicas, soporte, envia-tu-scanner
- **Security**: `_safeUrl()` en `caso.html` PRODIGY — valida https:// en video y pdf_url iframe; Alejandro video src
- **Security**: `patient.html` PRODIGY — `toEmbedUrl()` solo https://; exocadFile validado
- **Security**: admin-panel Alejandro — 3 hrefs con datos DB → `^https?://` check
- **Security**: `mis-casos.html` Alejandro — `link_diseno` en href validado con `^https?://`
- **MAP.md**: caso.html líneas actualizadas + fecha 2026-05-28
- **Audit completo**: workflows GHA ✓; scripts auto-journal temperatura 0.15 + DOI ✓; robots.txt ✓; _redirects ✓; _headers ✓; skip links 50/57 ✓; app mis-casos/client-panel/configuracion Alejandro limpios

## ✅ COMPLETADO (sesión continuación 2026-05-28 — ronda 6)
- **Security**: `_safeUrl()` en `caso.html` PRODIGY — valida `https://` en video src y pdf_url iframe
- **Security**: `_safeUrl()` en `caso.html` Alejandro — valida `https://` en video src de drive_link
- **Security**: `patient.html` PRODIGY — `toEmbedUrl()` devuelve null si URL no es `https://`; exocadFile validado antes de `iframe.src`
- **Security**: `app/admin-panel.html` Alejandro — 3 `href` con datos DB sin validar → `^https?://` check en comprobante_url (×2) y link_html
- **Audit completo app PRODIGY**: operario.html (cfg local ✓); operator-panel.html (blob URL ✓); client-panel.html (escH + https check ✓); configuracion.html (IDs staff ✓); agregar-caso.html (sin data ✓); inventario.html (escH ✓); success.html (textContent ✓)
- **Audit completo JS**: header.js ambos — escape HTML antes de markdown en chat ✓; qr-generator.js _qrEscH ✓; geo-detect.js country_code solo en comparaciones ✓; callmebot.js key PENDIENTE ✓
- **Audit edge functions**: notify-wa.js CORS allowlist ✓; factura.js CORS ✓; send-email.js CORS ✓; send-push.js CORS ✓; stripe-checkout (pendiente audit)
- **Audit flujos**: flujo-diseno.html file.name escapado en ambos proyectos ✓
- **Audit recibos**: recibo-caso.html ambos proyectos escH ✓; buildTimeline() Alejandro escH ✓
- **Audit catálogo**: catalogo.html renderiza config local (sin Supabase) ✓

## ✅ COMPLETADO (sesión continuación 2026-05-27 — ronda 5)
- **OG images Alejandro completo**: `og-home.jpg`, `og-calculadora-diseno.jpg`, `og-diseno-remoto.jpg` — inexistentes. Reemplazadas por `og-guias-quirurgicas.jpg` (placeholder) en **13 archivos** (index, calculadora-diseno, diseno-remoto, flujo-diseno, article, en/remote-design, terminos-y-legal, sobre-mi, portafolio, envia-tu-scanner, soporte, blog, cursos, seguimiento-caso)
- **flujo-diseno.html Alejandro**: desc 92→149 chars + fix OG image
- **Security audit final**: caso.html Alejandro usa escHtml() en todos los campos Supabase ✓; seguimiento-caso PRODIGY usa _escH() en numero_guia ✓; gestionar-casos PRODIGY usa escH() ✓; contabilidad PRODIGY usa escH() ✓; upload-guard.js magic bytes + allowlist ✓
- **JSON.stringify scan final**: limpio en ambos proyectos (admin-panel PRODIGY comment line, exocad.html archivo generado inmenso — skipeado)
- **Edge functions**: notify-wa.js CORS allowlist ✓; factura.js CORS allowlist ✓; Alejandro send-email/send-push/stripe-checkout — pendiente audit
- **auth-guard.js Alejandro**: usa email hardcodeado (ADMIN_EMAILS) — correcto per CLAUDE.md ✓
- **_headers**: ambos proyectos tienen todos clean URLs + security headers ✓
- **Schema audit final**: todos los `<details>` FAQ tienen FAQPage ✓; cursos.html tiene Service+BreadcrumbList ✓; soporte.html ContactPage+BreadcrumbList ✓

## ✅ COMPLETADO (sesión continuación 2026-05-27 — ronda 4)
- **SEO**: desc >160 en Alejandro terminos-y-legal (163→148); title 73 + desc 232 en en/remote-design → dentro de límites
- **Security**: `renderContent()` en article.html ambos proyectos — sanitiza img.src (bloquea javascript:), escapa alt/caption/cite/title con _artEscAttr()
- **Audit completo final**: article.html Alejandro _bEscH ✓; blog.html _bEscH ✓; caso.html Alejandro escHtml ✓; agregar-caso.html sin datos DB ✓; admin-precios.html escH ✓; calidad.html app/ escH ✓; flujo-diseno.html fdToast literales ✓; flujo-lab.html escH file.name ✓; revision-diseno.html esc() ✓; patient.html escapeHtml ✓
- **Title/Desc audit batch**: todos los HTML PRODIGY y Alejandro dentro de ≤72/≤160 ✓
- **Canonicals audit**: solo recibo-caso y revision-diseno sin canonical — ambas noindex ✓
- **robots.txt**: ambos proyectos bloquean /app/ /sql/ /supabase/ .git ✓; ClaudeBot/CCBot/SemrushBot/AhrefsBot bloqueados; GPTBot/Perplexity/Google-Extended permitidos ✓
- **edge functions Gemini**: CORS allowlist + rate limit + temperatura 0.15 verificados en ambos ✓
- **auth-guard.js**: usa app_metadata en ambos ✓; onboarding.html app_metadata.role ✓
- **Sitemap lastmod**: fechas correctas; articles usan fecha de creación del artículo (correcto)
- **_redirects**: /sql/ /supabase/ → 404 en ambos ✓
- **robots.txt hardcoded secrets scan**: sin API keys expuestas (GEMINI solo en Cloudflare/GitHub) ✓

## ✅ COMPLETADO (sesión continuación 2026-05-27 — ronda 3)
- **SW PRODIGY v23**: flujo-diseno/fresado/impresion/lab agregados al PRECACHE; MAP.md actualizado
- **SW Alejandro v12**: /en/remote-design agregado al PRECACHE
- **Security audit completo**: contabilidad/inventario/taller/mensajero/mis-casos Alejandro/configuracion — todos usan escH() correctamente; patient.html usa escapeHtml(); revision-diseno.html usa esc(); seguimiento-caso PRODIGY usa _escH()
- **JSON.stringify en onclick audit**: solo admin-panel PRODIGY tenía uno residual (_admEviMap aplicado); Alejandro limpio (_pMap ya existía)
- **FAQPage audit**: todos los `<details>` en ambos proyectos tienen FAQPage schema ✓
- **Canonicals**: solo recibo-caso/revision-diseno sin canonical, ambas noindex ✓
- **_redirects**: /sql/ y /supabase/ bloqueados con 404 en ambos proyectos ✓
- **Edge functions Gemini**: CORS allowlist + rate limit 5 req/min en ambos ✓; temperatura 0.15 en auto-journal ambos ✓
- **auth-guard.js**: usa app_metadata (no user_metadata) en ambos ✓; onboarding.html correcto
- **Preconnects**: todas las páginas de flujo/calculadoras tienen CDN hints correctos; catalogo.html solo usa CDNs que ya tiene preconnect

## ✅ COMPLETADO (sesión continuación 2026-05-27 — ronda 2)
- **Security**: JSON.stringify(p) en onclick → _pioMap en panel-interno-operaciones (3 botones WA + cierre map)
- **Security**: JSON.stringify(d) en onclick → _admEviMap en admin-panel PRODIGY (botón verEvidencia logística)
- **XSS audit completo app/**: flujo-impresion.js sin riesgo (showProdigyAlert literales; colores hardcoded); gestionar-casos ya escH correcto; seguimiento-caso Alejandro ya _escH correcto
- **Schema**: Person schema agregado a sobre-mi.html Alejandro (BreadcrumbList ya existía)
- **Verificado**: journal.html PRODIGY tiene BreadcrumbList ✓; index.html Alejandro tiene Person+Service+BreadcrumbList ✓; admin-panel Alejandro JSON.stringify limpio (_pMap ya existía) ✓

## ✅ COMPLETADO (sesión continuación 2026-05-27)
- **SEO descs/titles lote k**: desc ≤160 en 4 PRODIGY (soporte-tecnico, index, calculadora-fresado, terminos-y-legal) + 2 Alejandro (index, portafolio); title ≤72 calculadora-fresado PRODIGY; desc ≤160 en/global-design (254→163)
- **Security lote k**: XSS escH revision_num en PRODIGY client-panel + operario-diseno; XSS escH revision_num + lead_source + p.estado en Alejandro admin/client-panel; escH p.codigo en operator-panel onclick; esc(lbl/d) en operario servicios_pagados; app_metadata.role en supabase-client.js loginSupabase (era user_metadata)
- **SW**: /mapa-sitio agregado al precache PRODIGY
- **Schemas**: BreadcrumbList en contacto.html PRODIGY (skip — página redirect noindex); nosotros/terminos/portafolio/catalogo verificados — todos tienen schemas correctos
- **Audit completo**: gestionar-casos, contabilidad, inventario, taller, mensajero, operario, operator-panel, revision-diseno, seguimiento-caso, flujo-diseno ambos proyectos — XSS limpio (excepto fixes aplicados arriba)

## ✅ COMPLETADO (2026-05-24)
- Bot IA PRODIGY y Alejandro: manejo 4 casos de error + system prompt precios USD
- SEO: noindex→index,follow en 9 páginas públicas (7 PRODIGY + 2 Alejandro)
- robots.txt ambos: bots IA (ChatGPT/Perplexity/Gemini permitidos, CCBot/ClaudeBot bloqueados)
- articles.js: pool 28 temas unificados + pick aleatorio sin repetición reciente
- WCAG: `<main id="main-content">` verificado en todas las páginas públicas de ambos proyectos
- MAP.md: versiones actualizadas (SW v22, footer v20260522, líneas articles.js reales)
- CLAUDE.md PRODIGY: sección bot IA + sección artículos científicos con journals
- CLAUDE.md Alejandro: creado desde cero con todas las reglas
- hreflang EN agregado a portafolio.html
- temperature auto-journal PRODIGY: 0.2→0.15
- nosotros.html PRODIGY: secciones Fundador + Arsenal técnico + Trayectoria 2014–2026 agregadas
- nosotros.html: Lighthouse SEO score actualizado 63→95 (fix noindex ya aplicado)
- diseno-cad.html + catalogo.html + fresado-cam.html: robots index,follow agregado
- sitemap.xml PRODIGY: nosotros lastmod → 2026-05-24
- **SEO autónomo lote 1**: escaner-domicilio robots + hreflang EN en guias-quirurgicas + calculadora-diseno
- **SEO autónomo lote 2**: hreflang EN + author en calidad, guia-tecnica, instalar-app, soporte, nosotros, portafolio, calculadora-fresado, calculadora-impresion
- **SEO autónomo lote 3**: hreflang EN en flujo-lab, flujo-fresado, flujo-impresion, article
- **sitemap.xml PRODIGY**: flujo-lab, flujo-fresado, flujo-impresion agregados
- **Alejandro**: hreflang EN en soporte, envia-tu-scanner, cursos, flujo-diseno; robots+author en portafolio
- **sitemap.xml Alejandro**: flujo-diseno agregado
- **Panel admin PRODIGY**: fix analytics tab, toggle visible/oculto portafolio, WA clientes, busqueda pedidos, links torre control, colspan clientes
- **operario-diseno.html**: kanban drag & drop + touch implementado (4 columnas)
- **MAP.md PRODIGY**: entradas admin-panel.html y operario-diseno.html agregadas
- **SEO autónomo lote 4**: author en index, article, calculadora, soporte-tecnico, en/global-design PRODIGY; hreflang EN catalogo + soporte-tecnico
- **Alejandro SEO lote 2**: author en index, article, cursos, envia-tu-scanner, flujo-diseno, soporte; hreflang EN sobre-mi
- **SW registration**: todas las páginas .html de ambos proyectos (incl. app/ panels, public pages, en/)
- **Escape key handlers**: todos los modales en operator-panel, calidad, inventario, operario-diseno, operario, gestionar-casos, taller, client-panel, admin-panel, mensajero, contabilidad, taller; Alejandro: admin-panel, client-panel
- **Realtime Supabase**: admin-panel (pedidos + logs_incidencias), gestionar-casos (casos_portafolio); Alejandro: admin-panel (solicitudes_scanner)
- **auth-guard.js PRODIGY**: 6 roles faltantes añadidos (calidad, contabilidad, diseno, taller, fresado, impresion) en getRole() y DEST_MAP
- **taller.html**: auth ampliado a ['admin','taller'] para que operarios accedan
- **mensajero.html**: fix redirect — ya no redirige siempre a login.html sino al panel correcto según rol
- **factura.js**: JWT admin verification añadida + Auth header en contabilidad.html
- **CORS fix**: send-email.js y send-push.js Alejandro: wildcard '*' → dominio propio
- **auto-journal PRODIGY**: updateSitemap() añadida + git add sitemap.xml en journal-cron.yml
- **_headers PRODIGY**: Cache-Control para sitemap.xml añadido
- **Security lote 2026-05-26**: panel-interno-operaciones (app_metadata fix), onboarding (user_metadata fix), stripe-checkout JWT auth, caso.html XSS fix (ambos), flujo-lab Habeas Data, gemini.js CORS, sitemap noindex cleanup
- **Security lote 2026-05-27**: index.html XSS (coverImage/name/type/desc), article.html escaping (lectura/vistas/fecha), journal.html vistas, blog.html vistas (Alejandro); CORS OPTIONS handlers (notify-wa, factura, stripe-checkout); preconnect cdnjs en 8 páginas PRODIGY + 2 Alejandro; _headers PRODIGY clean URLs + dedup nosotros
- **Perf/Security lote 2026-05-27b**: preconnect cdn.jsdelivr.net en 14 páginas PRODIGY + 8 paneles app + 5 páginas Alejandro; CORS OPTIONS stripe-checkout Alejandro (allowlist); XSS pagos.js country_code ipapi.co (ambos proyectos); XSS qr-generator.js Supabase fields; CSP Alejandro: youtube frame-src + cdn.jsdelivr connect-src; seguimiento-caso cache no-store Alejandro; preconnect Supabase en index/journal/portafolio PRODIGY + 7 páginas Alejandro; preconnect unpkg dns-prefetch (inventario/mensajero/taller); FA 6.5.1 normalizado en 7 páginas PRODIGY + 1 Alejandro; mensajero.html FA preload lazy
- **Security/Compliance lote 2026-05-27c**: XSS error.message inventario.html (escaping inline); Habeas Data Ley 1581/2012 en flujo-impresion + flujo-fresado (texto checkbox actualizado); XSS file.name flujo-diseno.html Alejandro; robots.txt PRODIGY: Disallow /patients/ (datos Exocad); _headers PRODIGY: clean URLs /mapa-sitio + /contacto; edge functions audit completo (factura, gemini, notify-wa, stripe-checkout, send-email, send-push, resumen-semanal) — todos con allowlist CORS; auth-guard.js audit — sin open redirect, app_metadata correcto; revision-diseno buildHistorial() audit — esc() correcto en todos los campos
- **SEO lote 2026-05-27d**: hreflang ES+EN+x-default en fresado-cam, diseno-remoto (+es faltante), guias-quirurgicas, nosotros, calidad, envia-tu-scanner, escaner-domicilio (PRODIGY); hreflang en guias-quirurgicas + envia-tu-scanner (Alejandro); sitemap lastmod 2026-05-27 para 7 páginas PRODIGY + 2 Alejandro; FA 6.5.0→6.5.1 en header.js ambos proyectos; patient.html/recibo-caso.html/caso.html audit XSS — escapeHtml() correcto en todos
- **Schemas + Security + Perf 2026-05-27e**: Service+BreadcrumbList en 4 flujos PRODIGY (flujo-lab/fresado/impresion/diseno) + flujo-diseno Alejandro; XSS completar escaping `>` en admin-precios+taller.html; /nosotros clean URL _headers PRODIGY; `functions/api/gemini.js` creado para Alejandro (chatbot era 502 sin este archivo); preconnect Supabase en 5 páginas PRODIGY (diseno-cad, calidad, fresado-cam, guias-quirurgicas, flujo-diseno); auto-journal Alejandro: scripts/gen-articulo-ac.js + .github/workflows/journal-cron-ac.yml (lunes+miércoles 9AM, 13 tópicos CAD dental)
- **Audit lote 2026-05-27f**: XSS audit final — onclick + innerHTML — LIMPIOS en ambos proyectos; _headers PRODIGY: dedup /nosotros; journal-cron.yml PRODIGY + journal-cron-ac.yml Alejandro: fix grep titulo (JS single-quote format); MAP.md PRODIGY: lastmod + 12 categorías journal; filtros blog.html + journal.html corregidos; sw.js + blog.html + caso.html XSS (ambos) commiteados
- **SEO lote 2026-05-27g**: geo.region+placename+position+ICBM en 18 páginas PRODIGY + 11 páginas Alejandro (local SEO Bogotá CO-DC); sitemap lastmod 2026-05-27 en 13 páginas PRODIGY + 8 páginas Alejandro; 13 artículos faltantes agregados a sitemap.xml PRODIGY; 9 artículos fantasma eliminados de sitemap Alejandro (soft 404 — no existen en articles-ac.js); OG/Twitter/keywords completados en flujo-diseno/flujo-lab/mapa-sitio PRODIGY
- **SEO lote 2026-05-27h**: twitter:title+description en 5 páginas PRODIGY (calculadora-fresado/diseno/impresion, calidad, guia-tecnica) + 4 Alejandro (calculadora-diseno, cursos, index, soporte); títulos >75chars → ≤72 en 5 PRODIGY + 4 Alejandro; descriptions >165chars → ≤160 en 6 PRODIGY + 6 Alejandro; schema WebSite en mapa-sitio.html PRODIGY; keywords en terminos-y-legal (ambos proyectos); audit completo: hreflang ✓, BreadcrumbList ✓, FAQPage ✓, SW ✓, CORS ✓, auth-guard ✓, robots.txt ✓, manifest.json ✓
- **SEO/Fix lote 2026-05-27i**: max-snippet:-1+max-image-preview:large en 10 páginas PRODIGY (calidad, flujos, mapa-sitio, guia-tecnica, envia-tu-scanner, escaner-domicilio, terminos) + 4 Alejandro (flujo-diseno, article, soporte, terminos); **hreflang dedup**: eliminados duplicados en 6 páginas PRODIGY (envia-tu-scanner, escaner-domicilio, fresado-cam, guias-quirurgicas, nosotros, calidad) + 2 Alejandro (guias-quirurgicas, envia-tu-scanner); **MAP.md Alejandro**: líneas header.js actualizadas (topbar 296, navHtml 344, _SURL 529, _pgHistory 642, _pgSystemPrompt 644, _pgAddMsg 682, fetch gemini 706, errores 717-730); **auto-journal pool**: +7 temas PRODIGY (34 total) + +12 temas Alejandro (25 total); mapa-sitio.html: hreflang es/x-default agregado; hreflang+max-snippet en mapa-sitio.html PRODIGY
- **Schemas+Security lote 2026-05-27j**: Service+BreadcrumbList en 6 páginas servicio PRODIGY (diseno-cad, diseno-remoto, fresado-cam, guias-quirurgicas, escaner-domicilio, envia-tu-scanner); XSS fix r.revision_num en recibo-caso.html (ambos); XSS fix n.reaction en caso.html (ambos); TOPIC_POOL Alejandro: tema faltante flujo-digital-ortopedico agregado (25 total confirmado)
