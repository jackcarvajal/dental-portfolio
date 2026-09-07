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

## Etapa 2 — ✅ SQL LISTO: `sql/fix-bloat-pedidos-etapa2.sql` (falta ejecutar)
Verificada la cadena de dependencias (código 0 usos; solo 2 vistas dependían; `clientes` no se toca).
El SQL hace todo **transaccional** (BEGIN/COMMIT, ROLLBACK seguro si algo aún depende):
1. `DROP VIEW historial_doctor` (legado, apunta al modelo viejo `clientes`).
2. Recrea `pedidos_reales` **sin** `cliente_id`/`pieza` (DROP+CREATE; CREATE OR REPLACE no quita columnas).
3. `ALTER TABLE pedidos DROP COLUMN cliente_id, pieza` (falla y hace rollback si quedó dependencia).
4. Paso 0 opcional: backup de los datos viejos antes de borrar.
⚠️ IRREVERSIBLE (borra los datos de esas columnas — son legado). Tras correrlo, regenerar `sql/_baseline/views.sql`.
