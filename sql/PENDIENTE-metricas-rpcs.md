# ✅ RPCs de métricas/recordatorios — corregidas en repo · FALTA RE-EJECUTAR

Schema drift detectado por `tools/audit-schema.mjs` + validado contra el esquema real de `pedidos`.
Las funciones referenciaban columnas/valores que ya no existen → `42703`/`22P02` → **400** en el panel
de métricas y automatizaciones rotas. **Ya está corregido en los .sql del repo.**

## Qué se corrigió (columna fantasma → real)
| Fantasma (no existe en `pedidos`) | Real | Nota |
|---|---|---|
| `p.total` | `p.precio_total` (fallback `p.monto_total`) | el COALESCE fallaba al parsear la columna inexistente |
| `p.doctor` | `p.nombre_doctor` | |
| `p.servicio` / `servicio` | `p.tipo_trabajo` | |
| `p.whatsapp` | `p.telefono` | resolver WhatsApp del cliente (recordatorios) |
| `precio_usd` | `total_usd` | alejandro_dashboard |
| `'cancelado'` (enum) | `'Cancelado'` | 22P02 |
| `'CANCELADO'` (enum) | `'Cancelado'` | quitado el duplicado inválido |
| `estado='en_diseno'` / `'revision'` | `'En Diseño'` / `'En Revisión'` | valores reales del enum `estado_pedido` |

## 👉 Falta: RE-EJECUTAR en Supabase (SQL Editor)
Correr estos archivos (cada uno es `CREATE OR REPLACE` autocontenido), en este orden:
1. `sql/patch-analytics-rpc-authz-2026.sql` — dashboard_semana, tiempos_entrega, forecast_semana, top_servicios, ingresos_semanas, alejandro_dashboard
2. `sql/patch-reportes-admin-authz-2026.sql` — top_doctores, pedidos_por_material, ingresos_por_dia, conversion_por_flujo
3. `sql/patch-canal-origen-authz-2026.sql` — ingresos_por_canal
4. `sql/patch-pagos-vencidos.sql` — recordatorios de pago vencido
5. `sql/patch-sla-pedidos.sql` — alertas SLA
6. `sql/patch-wallet-idor-2026.sql` — resolver WhatsApp del cliente

Link: https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw/sql/new
Verificar (debe devolver datos, no error):
```sql
SELECT prodigy_dashboard_semana();
SELECT * FROM prodigy_top_doctores();
SELECT * FROM prodigy_ingresos_por_canal();
```

> Nota: `estado_operativo` usa texto MAYÚSCULA (`'EN_DISENO'`, `'ENTREGADO'`) — eso es correcto y NO se tocó.
> Solo el enum `estado` (`estado_pedido`) usa Capitalizado (`'En Diseño'`, `'Cancelado'`).
