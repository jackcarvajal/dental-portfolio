# 🟡 Columnas fantasma restantes (validación total front↔BD)

`node tools/audit-schema.mjs . --schema-all schema.csv` cruzó las 57 tablas del esquema real contra lo que
usa el código. Abajo lo **verificado** (real vs falso positivo). Todo es **interno (paneles admin/operación)** —
no afecta al sitio público.

## ✅ Ya arreglado (autónomo)
- **leads_doctores** — `panel-interno-operaciones.html` ordenaba `.order('fecha_descarga')` (columna inexistente)
  → **400 en la lista de leads**. Cambiado a `created_at`.

## ❌ Falsos positivos (no tocar)
- **cotizaciones** (`cantidad/material/urgente`): van DENTRO del jsonb `items:[{...}]`, no son columnas top-level. OK.
- **catalogo.precio_base**: bleed del extractor, no hay uso real.

## ✅ 3ª pasada — decididos y arreglados (autónomo, validados con audit-schema)
- **app/calidad** (QA): `fotos_calidad→fotos_empaque`, `timestamp_calidad→timestamp_qa`, quitado `calidad_user_id` (no existe columna). **El QA vuelve a guardar** — validado: los ghosts de `pedidos` desaparecieron.
- **app/operario:621**: consultaba `nombre_doctor` de la vista `pedidos_operacion` (no lo tiene) → cambiado a `from('pedidos')` (sí lo tiene).
- **app/metricas-churn:149**: `valor_total_pagado` (la vista no lo tiene) → alias `valor_total_pagado:ticket_promedio` (muestra ticket promedio; si quieres el total real hay que ampliar la vista).
- **pedidos_doctor.revisiones_usadas**: la tabla no la tenía → `sql/fix-pedidos-doctor-revisiones.sql` (ALTER ADD COLUMN, no-destructivo). **Falta re-ejecutar** → arregla el límite de revisiones del cliente.
- **equipo_mantenimiento**: el código (taller/operator-panel) registraba un LOG de mantenimiento (accion/tecnico/duracion) en una tabla que es un REGISTRO de equipos → 400, logging roto. Creada tabla `mantenimiento_log` (`sql/create-mantenimiento-log.sql`) y **repuntadas las 4 referencias** en el código. **Falta re-ejecutar el SQL** (crea la tabla). Validado: equipo_mantenimiento ya no aparece como ghost.
- Falsos positivos confirmados: `inventario_items` (costo_unitario/proveedor eran bleed), `cotizaciones` (van en jsonb `items`), `catalogo.precio_base`, `doctors_inactivos`/`despachos`/`pedidos_operacion` restantes = vistas (ampliar si se quiere el dato exacto).

## 🔴 CONFIRMADO EN VIVO (ago-2026) — la vista `pedidos_operacion` rompe queries
Probado contra la BD (anon, 42703): el código pide a la vista columnas que **no tiene** → el `SELECT` falla ENTERO (400):
- **operario.html:442** (tablero) → `cotizacion_fab_monto, cotizacion_fab_estado, cotizacion_fab_nota` — **el tablero no carga casos**.
- **operario.html:459/461** (comprobantes fab) → `fabricacion_tipo, cotizacion_fab_*`.
- **calidad.html:396** (panel QA) → `nombre_doctor, pago_estado, fotos_empaque, nota_calidad, timestamp_qa`.
- Todas existen en la tabla base `pedidos`; la vista quedó desfasada.
- **Fix correcto = ampliar la vista** (añadir esas columnas). NO se recrea a ciegas: puede tener un `WHERE` que es su frontera de seguridad. → `sql/DIAGNOSTICO-pedidos-operacion.sql` obtiene la definición real; con eso se genera el `CREATE OR REPLACE VIEW` que solo añade las columnas.
- Fix parcial ya aplicado en código: `operario.html:596` (chequeo de pago) repuntado a `from('pedidos')`.

## 🔧 Requieren TU decisión de esquema (no lo adiviné — es data viva)
| Dónde | Columnas fantasma | Recomendación |
|---|---|---|
| **app/calidad.html** (guardar QA, ~línea 696) | `fotos_calidad`, `timestamp_calidad`, `calidad_user_id` | El UPDATE a `pedidos` falla → **el QA no guarda**. Reales probables: `fotos_calidad→fotos_empaque`, `timestamp_calidad→timestamp_qa`. `calidad_user_id` **no existe** → ¿usar `operador_id` o crear la columna? |
| **pedidos_operacion** (VISTA) — usada por calidad/inventario/operario/taller | `nombre_doctor, pago_estado, fotos_empaque, nota_calidad, timestamp_qa, cotizacion_fab_*, fabricacion_tipo` | Esas columnas están en `pedidos` pero **la VISTA `pedidos_operacion` no las expone**. O se amplía la vista (`CREATE OR REPLACE VIEW ... SELECT ... esas columnas`) o el código consulta `pedidos`. Verificar si el código las nombra en `.select()` (400) o solo hace `.select('*')` (undefined, no rompe). |
| **doctors_inactivos** (VISTA churn) | `valor_total_pagado` | La vista tiene `ticket_promedio`, no `valor_total_pagado`. Ampliar la vista o cambiar el código. |
| **pedidos_doctor** (VISTA) | `revisiones_usadas` | La vista no la expone; está en `pedidos`. Ampliar vista o consultar `pedidos`. |
| **equipo_mantenimiento** | `equipo_id, accion, tecnico, notas, duracion_min` | El código escribe un **log de mantenimiento** con esos campos, pero la tabla tiene otra estructura. ¿Falta tabla `mantenimiento_log` o son columnas nuevas? |
| **inventario_items** | `costo_unitario, proveedor` | Reales: `costo_promedio` (no `costo_unitario`); `proveedor` está en `inventario_materiales`. Verificar si el código apunta a la tabla equivocada. |
| **despachos** | `codigo, nombre_cliente, nombre_doctor, telefono, direccion, precio_total…` | El código espera columnas de un JOIN (pedido+mensajero). ¿Debe consultar una vista `v_despachos` o hacer el join explícito? |

## 🆕 Hallazgos de la 2ª pasada (Alejandro + operario)
- ✅ **Alejandro `envia-tu-scanner`**: insertaba `negocio` inexistente en `solicitudes_scanner` → 400, **se perdían las solicitudes**. Quitado. ARREGLADO.
- ✅ **Alejandro `admin-panel`**: seleccionaba `doctor` de `cotizaciones` (real: `doctor_nombre`) → 400 en la lista. Fix con alias `doctor:doctor_nombre`. ARREGLADO.
- 🟡 **`alejandro_top_servicios`** (RPC): desplegada pero rota (`servicio` inexistente) y NO estaba en el repo → 400 en app/metricas de Alejandro. **Reconstruida corregida en `sql/fix-alejandro-top-servicios.sql` — falta re-ejecutar en Supabase.**
- 🔧 **`app/operario.html` línea 621**: `.select('codigo,tipo_trabajo,nombre_doctor,pais')` sobre la VISTA `pedidos_operacion`, que **no expone `nombre_doctor`** → 400 en el panel operario. Recomendación: **añadir `nombre_doctor` a la vista** `pedidos_operacion` (ya existe en `pedidos`), o quitarlo del select.

## Cómo cerrarlo
Dime por cada fila si prefieres **ampliar la vista** o **cambiar el código**, y lo aplico. Las de vistas
(`pedidos_operacion`, `doctors_inactivos`, `pedidos_doctor`) suelen resolverse mejor **ampliando la vista**
(un `CREATE OR REPLACE VIEW` que incluya las columnas que ya existen en `pedidos`).
