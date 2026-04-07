# PRODIGY — Log de Agentes v5.0

## AGENTE 1: ARQUITECTO DE SEGURIDAD

### Estado: COMPLETADO ✅

| Tarea | Archivo | Estado |
|---|---|---|
| Módulo validación archivos CAD | `js/upload-guard.js` | ✅ Desplegado |
| Validación CAD en flujo-diseño | `flujo-diseno.html:821` | ✅ Activo |
| Script upload-guard en 3 flujos | flujo-*.html | ✅ Activo |
| Políticas RLS Storage + pedidos | `sql/rls-policies.sql` | ⏳ Pendiente ejecución en Supabase |
| Vista pedidos_operador sin PII | `sql/rls-policies.sql:95` | ⏳ Pendiente ejecución en Supabase |
| filtrarPIIOperador() utility | `js/upload-guard.js:52` | ✅ Listo para usar con DB real |

### Instrucciones pendientes (Agente 1):
1. **RLS Supabase** → Dashboard → SQL Editor → pegar `sql/rls-policies.sql` completo
2. Verificar en Storage → Policies que `casos_*` aparezcan activas
3. Bucket `casos` debe tener `public: false`

### Formatos bloqueados por upload-guard.js:
`.scene .cad .3dm .3ds .max .mb .ma .blend .mp4 .avi .mov .mkv .wmv .webm .m4v .exe .zip .rar .7z .js .php .sh`

---

## AGENTE 2: INGENIERO DE FINANZAS

### Estado: COMPLETADO ✅

| Tarea | Archivo | Estado |
|---|---|---|
| Detección geolocalización | `js/pagos.js:detectarPais()` | ✅ Activo (ipapi.co) |
| Colombia → Wompi COP (+3%) | `js/pagos.js` | ✅ Sin cambios |
| Internacional → PayPal USD (+5.4%) | `js/pagos.js:abrirCheckoutPayPal()` | ✅ Implementado |
| inicializarPasarelas() auto-detect | `js/pagos.js:inicializarPasarelas()` | ✅ Implementado |
| verificarPrecioServidor() | `js/pagos.js:verificarPrecioServidor()` | ✅ Implementado |
| Edge Function verify-price | `supabase/functions/verify-price/` | ⏳ Pendiente deploy |
| Etiqueta COP en formatCurrency | `js/flujo-impresion.js`, `flujo-fresado.html`, `flujo-diseno.html` | ✅ Activo |
| formatDivisa() USD/COP | `js/pagos.js:formatDivisa()` | ✅ Implementado |

### Instrucciones pendientes (Agente 2):
1. **PayPal Client ID** → ✅ Inyectado (`AfJ71Yz...QuC7jvaG`) — entorno Live
2. **PayPal Domain Whitelist** → developer.paypal.com → tu app → Allowed Return URLs → agregar `https://prodigylabdental.com`
3. **Deploy verify-price** → `supabase functions deploy verify-price`
4. **Tasa COP/USD** → `TASA_COP_USD` en `js/pagos.js` actualizar mensualmente (actual: 4200)
5. **Wompi producción** → `modoEspera: true` → cambiar a `false` + `pub_prod_` cuando Wompi apruebe cuenta

---

## AGENTE 3: LÓGICA DE PRODUCCIÓN

### Estado: COMPLETADO ✅

| Tarea | Archivo | Estado |
|---|---|---|
| Modal "Finalizar" con validación dual | `app/operator-panel.html` | ✅ Activo |
| Bloqueo botón hasta Exocad + STL + Foto | `operator-panel.html:actualizarBtnFinalizar()` | ✅ Activo |
| Checklist visual de 3 requisitos | modal `req-exocad/stl/foto` | ✅ Activo |
| Upload STL con upload-guard validación | `handleFileOperador(stl)` | ✅ Activo |
| Campo Foto de Control / Nesting | `box-foto` input + validación | ✅ Activo |
| Auto-move card a Entregado al confirmar | `confirmarEntrega()` | ✅ Activo (simulado) |
| Stub Supabase update en confirmarEntrega | comentario en código | ⏳ Activar con BD real |
| PII ocultada en kanban (datos •••) | tarjetas con nombres censurados | ✅ Activo |

### Notas Agente 3:
- `confirmarEntrega()` ahora es **async real**: sube STL + foto a `dental-cases`, actualiza `pedidos` con `estado: 'Listo para Entrega'`.
- Formato de archivo: `{uid}/{caseId}_{timestamp}.{ext}` — garantiza unicidad sin colisiones.
- Auto-release activado: `seguimiento-caso.html` muestra zona de descarga para estados `Aprobado` y `Listo para Entrega`.
- El trigger de auto-release ya está preparado en `webhook-handler/index.ts` — al recibir `APPROVED`, actualiza `estado: 'Listo para Entrega'` en tabla `pedidos`.

---

## AGENTE 4: NEUROMARKETING Y UX

### Estado: COMPLETADO ✅

| Tarea | Archivo | Estado |
|---|---|---|
| Spinner búsqueda "Procesando archivos..." | `seguimiento-caso.html` | ✅ Activo |
| Spinner entrega operador (upload) | `app/operator-panel.html` | ✅ Activo |
| Visor Exocad iframe en detalle de pedido | `seguimiento-caso.html:#visor-exocad-bloque` | ✅ Activo |
| Tabla de parámetros (Material/Color/Oclusión/etc) | `seguimiento-caso.html:#tabla-parametros` | ✅ Activo |
| Banner ciclo de producción (urgencia) | `seguimiento-caso.html:#banner-ciclo` | ✅ Activo |
| WhatsApp flotante con ID de caso | `seguimiento-caso.html:#wa-flotante-caso` | ✅ Activo |

---

## Resumen de archivos creados/modificados (Agentes 1 y 2)

```
NUEVO:      js/upload-guard.js
NUEVO:      sql/rls-policies.sql
NUEVO:      supabase/functions/verify-price/index.ts
MODIFICADO: js/pagos.js         — geoloc + PayPal + formatDivisa + verify-price
MODIFICADO: js/flujo-impresion.js — formatCurrency + ' COP'
MODIFICADO: flujo-diseno.html   — fmtCLP + ' COP', upload-guard.js, validación loadFile
MODIFICADO: flujo-fresado.html  — formatCurrency + ' COP', upload-guard.js
MODIFICADO: flujo-impresion.html — upload-guard.js
```
