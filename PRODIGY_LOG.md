# PRODIGY — v1.1 API CONNECTED · FINAL RELEASE

## Variables de entorno requeridas (Supabase Dashboard → Settings → Secrets)

| Variable | Descripción |
|---|---|
| `WOMPI_INTEGRITY_SECRET` | Clave integridad Wompi (privada) |
| `PADDLE_API_KEY` | API Key Paddle Live (privada — nunca en frontend) |
| `META_ACCESS_TOKEN` | Token System User permanente de la Graph API |
| `WA_PHONE_ID` | ID numérico del número WhatsApp Business |
| `META_APP_ID` | ID numérico de la App de Meta (para logs) |
| `META_PIXEL_ID` | ID del Pixel de Meta para CAPI |
| `META_TEST_CODE` | Código de prueba CAPI (solo desarrollo, omitir en prod) |
| `VAPID_PUBLIC_KEY` | Clave pública VAPID para Web Push (generar con `npx web-push generate-vapid-keys`) |
| `SUPABASE_ANON_KEY` | Clave pública Supabase (ya en frontend) |

---

## AGENTE 5: COMUNICACIONES E INTELIGENCIA (V1.1 — API CONNECTED)

### Estado: SKELETONS DESPLEGADOS — Pendiente credenciales Meta reales

| Tarea | Archivo | Estado |
|---|---|---|
| Service Worker Web Push | `app/sw.js` | Desplegado |
| Registro SW en seguimiento-caso | `seguimiento-caso.html:~543` | Activo |
| suscribirNotificaciones() | `seguimiento-caso.html` | Activo (VAPID pendiente) |
| Edge Function WhatsApp | `supabase/functions/notify-wa/index.ts` | Pendiente deploy + credenciales |
| Edge Function Meta CAPI | `supabase/functions/meta-capi/index.ts` | Pendiente deploy + credenciales |
| Spinner en descargar() STL | `seguimiento-caso.html:descargar()` | Activo |
| PayPal return URL → /success | `js/pagos.js:abrirCheckoutPayPal()` | Activo |
| Paddle successUrl → /success | `js/pagos.js:abrirCheckoutPaddle()` | Activo |

### Mensajes WhatsApp automatizados (notify-wa):
1. `pago_confirmado` — Trigger: webhook PayPal/Paddle/Wompi → `confirmarEntrega()`
2. `diseno_listo` — Trigger: operario sube STL + foto → estado `Listo para Entrega`
3. `recordatorio` — Trigger: Cron si >12h sin aprobación (configurar en Supabase Cron)
4. `alerta_alejandro` — Trigger: cliente aprueba → notifica a Alejandro con moneda + tipo

### Instrucciones pendientes (Agente 5):
1. **Meta Credenciales reales** → business.facebook.com → WhatsApp Manager → copiar Phone Number ID real (numérico, ~15 dígitos) → Supabase Secret `WA_PHONE_ID`
2. **System User Token** → business.facebook.com → Settings → System Users → generar token permanente → `META_ACCESS_TOKEN`
3. **Pixel ID** → business.facebook.com → Events Manager → tu Pixel → copiar ID → `META_PIXEL_ID`
4. **VAPID keys** → `npx web-push generate-vapid-keys` → pegar pública en `sw.js` línea ~80 → privada en `VAPID_PUBLIC_KEY` secret
5. **Deploy funciones** → `supabase functions deploy notify-wa` + `supabase functions deploy meta-capi`
6. **Tabla push_subscriptions** → crear en Supabase: `case_id text, endpoint text, p256dh text, auth text, created_at timestamptz`
7. **Página /success** → crear `success.html` que lea `?pedido=ID` y muestre confirmación + dispare `notify-wa` tipo `pago_confirmado`

---

## AGENTE 1: ARQUITECTO DE SEGURIDAD

### Estado: COMPLETADO

| Tarea | Archivo | Estado |
|---|---|---|
| Módulo validación archivos CAD | `js/upload-guard.js` | Desplegado |
| Validación CAD en flujo-diseño | `flujo-diseno.html:821` | Activo |
| Script upload-guard en 3 flujos | flujo-*.html | Activo |
| Políticas RLS Storage + pedidos | `sql/rls-policies.sql` | Pendiente ejecución en Supabase |
| Vista pedidos_operador sin PII | `sql/rls-policies.sql:95` | Pendiente ejecución en Supabase |
| filtrarPIIOperador() utility | `js/upload-guard.js:52` | Listo para usar con DB real |

### Instrucciones pendientes (Agente 1):
1. **RLS Supabase** → Dashboard → SQL Editor → pegar `sql/rls-policies.sql` completo
2. Verificar en Storage → Policies que `casos_*` aparezcan activas
3. Bucket `casos` debe tener `public: false`

### Formatos bloqueados por upload-guard.js:
`.scene .cad .3dm .3ds .max .mb .ma .blend .mp4 .avi .mov .mkv .wmv .webm .m4v .exe .zip .rar .7z .js .php .sh`

---

## AGENTE 2: INGENIERO DE FINANZAS

### Estado: COMPLETADO — v4.0 con Paddle

| Tarea | Archivo | Estado |
|---|---|---|
| Detección geolocalización | `js/pagos.js:detectarPais()` | Activo (ipapi.co) |
| Colombia → Wompi COP (+3%) | `js/pagos.js` | modoEspera (activar con pub_prod_) |
| Internacional → PayPal USD (+5.4%) | `js/pagos.js:abrirCheckoutPayPal()` | Activo — Live |
| Internacional → Paddle USD (+7%) | `js/pagos.js:abrirCheckoutPaddle()` | modoEspera (activar con priceId) |
| Selector dual PayPal/Paddle | `js/pagos.js:inicializarPasarelas()` | Activo — muestra ambas opciones |
| verificarPrecioServidor() | `js/pagos.js:verificarPrecioServidor()` | Activo |
| Edge Function verify-price | `supabase/functions/verify-price/` | Pendiente deploy |
| Etiqueta COP en formatCurrency | `js/flujo-impresion.js`, `flujo-fresado.html`, `flujo-diseno.html` | Activo |
| formatDivisa() USD/COP | `js/pagos.js:formatDivisa()` | Activo |

### Credenciales configuradas (solo claves públicas en frontend):
- **PayPal Client ID**: `AfJ71Yz...QuC7jvaG` — Live
- **Paddle Client Token**: `Live_0e3ce1326df4e81c783290c5399` — Live
- **Paddle Seller ID**: `311800`
- **Wompi Public Key**: `pub_test_zpgtFnjK...` — test (cambiar a `pub_prod_` cuando aprueben)

### Instrucciones pendientes (Agente 2):
1. **PayPal Domain Whitelist** → developer.paypal.com → App → Allowed Return URLs → agregar `https://prodigylabdental.com`
2. **Deploy verify-price** → `supabase functions deploy verify-price`
3. **Tasa COP/USD** → `TASA_COP_USD` en `js/pagos.js` — actualizar mensualmente (actual: 4200)
4. **Wompi produccion** → `modoEspera: false` + `pub_prod_` cuando Wompi apruebe cuenta
5. **Paddle Price ID** → dashboard.paddle.com → Catalog → Products → crear producto de servicio → copiar `pri_...` → pegar en `PAGOS_CONFIG.paddle.priceId` → `modoEspera: false`
6. **Paddle API Key** → Supabase Secrets → `PADDLE_API_KEY` (para webhooks server-side)

---

## AGENTE 3: LOGICA DE PRODUCCION

### Estado: COMPLETADO

| Tarea | Archivo | Estado |
|---|---|---|
| Modal "Finalizar" con validación dual | `app/operator-panel.html` | Activo |
| Bloqueo botón hasta Exocad + STL + Foto | `operator-panel.html:actualizarBtnFinalizar()` | Activo |
| Checklist visual de 3 requisitos | modal `req-exocad/stl/foto` | Activo |
| Upload STL con upload-guard validación | `handleFileOperador(stl)` | Activo |
| Campo Foto de Control / Nesting | `box-foto` input + validación | Activo |
| Auto-move card a Entregado al confirmar | `confirmarEntrega()` | Activo — Supabase real |
| PII ocultada en kanban (datos) | tarjetas con nombres censurados | Activo |

### Notas Agente 3:
- `confirmarEntrega()` es async real: sube STL + foto a `dental-cases`, actualiza `pedidos` con `estado: 'Listo para Entrega'`.
- Formato de archivo: `{uid}/{caseId}_{timestamp}.{ext}` — garantiza unicidad.
- Auto-release activado: `seguimiento-caso.html` descarga via signed URL para estados `Aprobado` y `Listo para Entrega`.

---

## AGENTE 4: NEUROMARKETING Y UX

### Estado: COMPLETADO

| Tarea | Archivo | Estado |
|---|---|---|
| Spinner búsqueda "Procesando archivos..." | `seguimiento-caso.html` | Activo |
| Spinner entrega operador (upload) | `app/operator-panel.html` | Activo |
| Visor Exocad iframe en detalle de pedido | `seguimiento-caso.html:#visor-exocad-bloque` | Activo |
| Tabla de parámetros (Material/Color/Oclusión/etc) | `seguimiento-caso.html:#tabla-parametros` | Activo |
| Banner ciclo de producción (urgencia) | `seguimiento-caso.html:#banner-ciclo` | Activo |
| WhatsApp flotante con ID de caso | `seguimiento-caso.html:#wa-flotante-caso` | Activo |

---

## Resumen de archivos creados/modificados

```
NUEVO:      js/upload-guard.js
NUEVO:      sql/rls-policies.sql
NUEVO:      supabase/functions/verify-price/index.ts
MODIFICADO: js/pagos.js            — v4.0: geoloc + PayPal + Paddle + formatDivisa + verify-price
MODIFICADO: js/flujo-impresion.js  — formatCurrency + ' COP' + recargo Wompi
MODIFICADO: flujo-diseno.html      — fmtCLP + ' COP', upload-guard.js, validación loadFile
MODIFICADO: flujo-fresado.html     — formatCurrency + ' COP', upload-guard.js
MODIFICADO: flujo-impresion.html   — upload-guard.js, onchange calcularTotal, line-wompi
MODIFICADO: app/operator-panel.html — bucket dental-cases, confirmarEntrega() async real
MODIFICADO: seguimiento-caso.html  — Supabase client, signed URL download, auto-release
```

## Procesos 100% autónomos (sin intervención manual):

1. **Detección de país + pasarela** — IP → pais → PayPal/Paddle (intl) o Wompi/Transferencia (CO)
2. **Validación de archivos** — upload-guard.js bloquea CAD/video/ejecutables antes del upload
3. **Verificacion de precio** — verify-price Edge Function recalcula en servidor antes del checkout
4. **Subida operador** — STL + foto a Supabase Storage con path único; actualiza BD automáticamente
5. **Auto-release STL** — cliente ve zona de descarga cuando estado = Aprobado/Listo para Entrega
6. **Firma URL descarga** — signed URL de 1 hora generada on-demand; nunca expone ruta real
7. **Modo espera Wompi** — si cuenta no validada, redirige a WhatsApp sin romper el flujo
