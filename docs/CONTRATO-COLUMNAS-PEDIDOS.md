# CONTRATO DE COLUMNAS — `pedidos` (grupos solapados)

> La tabla `pedidos` (~130 columnas) arrastra columnas redundantes de distintas épocas. Esta es la
> fuente de verdad de **cuál usar** y **qué queda como legado**. Nace del mapeo por uso real (ago-2026).
> Complementa `docs/CONTRATO-ESTADOS.md` (que cubre `estado` vs `estado_operativo`).

## Regla general
Usa la **canónica** de cada grupo. NO escribas en las de legado. No se dropean todavía: varias las
referencian vistas legado (`historial_doctor`, `pedidos_reales`) y algunas RPC → es refactor por etapas.

## Grupos

### Dueño del pedido
- **`user_id`** ✅ canónico en front/RLS (14 usos). Es el `auth.uid()` del doctor.
- `doctor_uid` — vivo pero solo a nivel **RPC** (p. ej. `prodigy_mi_wallet`, `prodigy_detectar_primer_pedido_referido`). No lo uses desde el front; para RLS/front usa `user_id`.
- `cliente_id` — 🔴 **legado** (0 usos en código). Del modelo viejo de tabla `clientes`. Referenciado por la vista `historial_doctor` (que aún apunta a `clientes`) y `pedidos_reales`, y por `panel-interno-operaciones.html`. No escribir.

### Cantidad
- **`cantidad`** ✅ canónica (86 usos).
- `piezas` (17) y `unidades` (9) — usadas en contextos específicos (nº de piezas/unidades del caso). Verificar la intención antes de consolidar; NO son claramente redundantes con `cantidad`.
- `pieza` (singular) — 🔴 **legado** (0 usos en código; referenciada solo por vistas legado). No escribir.

### Total / precio
- **`precio_total`** ✅ canónico (74 usos). Total en COP.
- `total_usd` — legítimo para pedidos internacionales (USD).
- `monto_total`, `monto_base`, `precio_base` — secundarios (algunos analytics hacen `COALESCE(precio_total, monto_total)`). No introducir lógica nueva sobre ellos; preferir `precio_total`.

### Nombres — NO son redundantes
`nombre_doctor`, `nombre_cliente`, `nombre_paciente` son **roles distintos** (el doctor que pide, el
cliente/lab, el paciente final). No consolidar.

## Etapa 2 (pendiente, requiere decisión) — plan de limpieza
Cadena de dependencias a resolver ANTES de dropear `cliente_id`/`pieza`:
1. Migrar/retirar la vista **`historial_doctor`** (no usada por código; apunta a `clientes` + `cliente_id`).
2. Quitar `cliente_id`/`pieza` de **`pedidos_reales`** (vista no usada) — o retirar la vista.
3. Revisar la tabla **`clientes`** (modelo viejo) y su uso en `panel-interno-operaciones.html`.
4. Recién ahí `ALTER TABLE pedidos DROP COLUMN cliente_id, DROP COLUMN pieza` (por etapas, con backup).
No se toca data viva sin este orden. Verificar con `tools/sql-map.mjs` y `tools/audit-schema-live.mjs`.
