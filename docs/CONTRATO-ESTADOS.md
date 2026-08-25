# CONTRATO DE ESTADOS — `pedidos` (PRODIGY)

> Fuente única de verdad para el ciclo de vida de un pedido. Leer antes de tocar cualquier
> filtro/lectura/escritura de `estado` o `estado_operativo`. Nace de la auditoría ago-2026 que
> encontró múltiples `22P02` por filtrar el enum con valores que no existen.

## TL;DR
- **`estado_operativo` (TEXTO) = la máquina de estados real.** Toda la lógica operativa se rige por esta.
- **`estado` (enum `estado_pedido`) = flag grueso legado.** Solo tiene **4 valores** y el código apenas lo
  escribe (`Pendiente` al crear, `Pagado` al pagar). **Nunca** lo filtres por valores fuera del enum.

## `estado` — enum `estado_pedido` (SOLO estos 4 valores existen)
```
Pendiente · Pagado · En Producción · Despachado
```
⚠️ **NO existen** en el enum: `cancelado`, `CANCELADO`, `Entregado`, `Enviado`, `Listo`, `en_diseno`, etc.
Filtrar por ellos (`.eq/.in/.not('estado', … 'cancelado')`) da **22P02 → 400** y **rompe el `SELECT` entero**.
- Escritura real por el código: `Pendiente` (flujos, al crear) · `Pagado` (al confirmar pago).
- `En Producción` / `Despachado`: coarse; si se usan, van por camino de pago/despacho, no por los flujos.

## `estado_operativo` — TEXTO (la máquina real)
Flujo feliz (aprox.):
```
VALIDACION_PENDIENTE → EN_DISENO → DISENO_FINALIZADO
      → (REVISION_CLIENTE / CAMBIOS_SOLICITADOS) → DISENO_APROBADO
      → FRESADO_INICIADO | EN_IMPRESION | EN_PRODUCCION
      → QA_APROBADO → LISTO_DESPACHAR | POR_DESPACHAR
      → EN_REPARTO → ENTREGADO
```
Terminales / excepción: `CANCELADO_DOCTOR` · `NO_ENTREGADO` · `ERROR_STL` · `INCIDENCIA_CLIENTE` · `PAGO_NO_CONFIRMADO`
Fabricación: `FAB_COTIZACION` · `FAB_CONFIRMADA`

- Un pedido recién creado tiene `estado_operativo` vacío/NULL → el código lo trata como `VALIDACION_PENDIENTE`.
- Los operarios avanzan **`estado_operativo`**, no `estado`.
- **Cancelación del doctor** = `estado_operativo='CANCELADO_DOCTOR'` (el enum `estado` no tiene 'cancelado').

## Reglas (para no volver a romper)
1. **Lógica operativa (tableros, kanban, "activos", "cancelado", "entregado") → SIEMPRE por `estado_operativo`.**
2. Si filtras `estado` (enum), usa **solo** `Pendiente | Pagado | En Producción | Despachado`.
3. Para "excluir cancelados" **no** filtres `estado` — los cancelados viven en `estado_operativo='CANCELADO_DOCTOR'`
   (y los tableros ya los ocultan por su lista de estados).
4. Antes de comparar el enum en SQL/RPC, castea a texto: `estado::text NOT IN (...)` evita el 22P02.
5. `tools/audit-schema-live.mjs` valida los **valores** de filtro de `estado` contra el enum real en cada push.

## Etapa 2 (pendiente, requiere visto bueno) — convergencia
Objetivo: que `estado` deje de ser una fuente de bugs. Opción recomendada: **`estado_operativo` = verdad**, y
`estado` pasa a ser un **flag derivado** (grueso) que se sincroniza solo desde `estado_operativo` (por trigger o
en los mismos code-paths). Así ningún consumidor legado se rompe y desaparece el drift. Alternativas: ampliar el
enum a los estados operativos (duplica) o deprecar `estado` del todo (mayor alcance). No se toca data viva sin plan.
