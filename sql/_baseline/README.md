# Baseline SQL — la fuente única de verdad

El `sql/` son ~158 parches acumulados **sin fuente de verdad**: la misma RPC está definida en
4–5 archivos y no se sabe cuál está desplegada. `tools/sql-map.mjs` lo confirma: **36 RPC duplicadas**.

Este directorio es el plan para ordenarlo, sin romper nada.

## Proceso (una vez)

1. **Exportar lo desplegado** → corre `EXPORTAR-BASELINE.sql` en el SQL Editor de Supabase y guarda cada salida:
   - bloque 1 → `functions.sql` (definición REAL de cada función)
   - bloque 2 → `enums.txt`
   - bloque 3 → `schema.csv` (formato `table,"col,col"` — lo consume `tools/audit-schema.mjs --schema-all`)
   - bloque 4 → `views.sql`
2. **Reconciliar**: con `functions.sql` (lo real) comparamos contra las copias del repo que lista
   `node tools/sql-map.mjs`. Para cada RPC dejamos **UNA** definición canónica (la que coincide con lo
   desplegado) y archivamos las demás.
3. **De aquí en más**: migraciones ordenadas (timestamp, append-only). "repo = desplegado" deja de ser opcional.

## Herramientas
- `tools/sql-map.mjs` — código ↔ repo: RPC llamadas, dónde están definidas, duplicadas, opacas, sin uso.
- `tools/audit-schema-live.mjs` — código ↔ base REAL: columnas/RPCs/valores de enum inexistentes (corre en pre-push).
- `EXPORTAR-BASELINE.sql` — vuelca lo desplegado a este directorio.

## Conclusión práctica (ago-2026)
Comparando lo desplegado (bloque 1) contra el repo se confirmó que **el archivo más reciente que señala
`sql-map.mjs` para cada RPC coincide con lo desplegado**. Entonces:

> **Canónico = el archivo "más reciente" que reporta `node tools/sql-map.mjs`** para esa función.
> No hace falta pegar el baseline gigante de funciones por chat (excede límites); si alguna vez se quiere
> el snapshot completo, guardar el resultado de `EXPORTAR-FUNCIONES.sql` **directo a `functions.sql`**
> (copiar la celda / descargar), no pegarlo.

Verificado además que los fixes de esta ronda están desplegados (forecast, cotizaciones-por-vencer,
dashboard_semana con `estado::text`). Y detectada 1 función desplegada rota + muerta: `corte_mensual`
(ver `OPCIONAL-limpiar-rpc-muertas.sql`).

## Regla
No agregar más `patch-*.sql` sueltos que redefinan RPCs ya existentes. Editar la definición canónica
(el archivo más reciente, el que sql-map marca) y versionarla como migración.
