# 🔴 PENDIENTE — RPCs del panel de métricas rotas (schema drift)

Detectado por `tools/audit-live.mjs` (2026-08). El panel `app/metricas.html` da varios **400**
porque las funciones RPC referencian **columnas/valores que ya no coinciden** con la tabla `pedidos`
desplegada. Cada llamada probada directo contra Supabase con la anon key:

| RPC | Error exacto (Postgres) | Causa | Fix probable |
|---|---|---|---|
| `prodigy_dashboard_semana` | `22P02 invalid input value for enum estado_pedido: "cancelado"` | el enum es **`'Cancelado'`** (mayúscula), la función usa `'cancelado'` | ✅ ya corregido en los .sql del repo — **falta re-ejecutar** |
| `prodigy_tiempos_entrega` | `42703 column "servicio" does not exist` | referencia a columna inexistente en la tabla desplegada | verificar nombre real de la columna de servicio |
| `prodigy_pedidos_por_material` | `42703 column p.servicio does not exist` | idem | idem |
| `prodigy_top_doctores` | `42703 column p.doctor does not exist` | la columna es **`nombre_doctor`** (o `doctor_uid`), no `doctor` | `p.doctor` → `p.nombre_doctor` |
| `prodigy_ingresos_por_canal` | `42703 column p.total does not exist` | la columna es **`monto_total`**, no `total` | `p.total` → `p.monto_total` |

## Ojo — el esquema del repo puede estar desactualizado
`sql/schema-completo.sql` lista `servicio`, `monto_total`, `nombre_doctor` en `pedidos`, pero la RPC
dice que `servicio` **no existe** en producción → el esquema desplegado **difiere del repo**.
No se puede arreglar a ciegas: `pedidos` está protegida por RLS (anon no la ve).

## Cómo cerrarlo
1. En Supabase → Table Editor → `pedidos`, copiar los **nombres reales de las columnas** (o correr
   `SELECT column_name FROM information_schema.columns WHERE table_name='pedidos';`).
2. Con esa lista, corregir las funciones en `sql/prodigy-analytics-rpc.sql`, `sql/rpc-reportes-admin.sql`,
   `sql/patch-canal-origen.sql` (y sus variantes `*-authz-*`) — que son las definiciones vigentes.
3. Re-ejecutar en el SQL Editor de Supabase. El `'cancelado'→'Cancelado'` ya está corregido en el repo.

> El panel de métricas es **interno (admin, tras login)** — no afecta al sitio público.
