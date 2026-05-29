# PRODIGY — Política de Seguridad

## Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, repórtala directamente a:
- **Email**: gerencia@prodigylabdental.com
- **WhatsApp**: +57 321 281 6716

No reportes vulnerabilidades en issues públicos de GitHub.

---

## Medidas implementadas (2026-05-29)

### Autenticación y sesiones
- Auth via Supabase con JWT — solo `app_metadata` para roles de staff
- Admin hardcodeado por email en `auth-guard.js` (no desde DB)
- **Session timeout automático**: 30 min de inactividad → aviso + cierre
- Roles: `admin | operator | diseno | fresado | impresion | taller | calidad | contabilidad | mensajero | encargado_inventario | client`

### Base de datos (RLS)
- Row Level Security habilitado en todas las tablas críticas
- `pedidos`: clientes solo ven/modifican sus propios pedidos
- Trigger `prodigy_restrict_client_pedido_updates()` bloquea modificación de columnas sensibles (estado, precio, pago_estado=confirmado) para clientes
- `bibliotecas_cliente`: usuario solo accede a sus propios STL
- `diseno_revisiones`: cliente solo lee sus revisiones; staff inserta
- Ver SQL en `sql/` para detalle completo

### Uploads de archivos
- Validación de extensión client-side (upload-guard.js)
- Validación de magic bytes (primeros 8 bytes) — detecta ejecutables renombrados
- Lista de tipos MIME permitidos por contexto (imágenes, STL, PDF)
- Ejecutado en: admin-panel, client-panel, calidad, operario, operario-diseno, operator-panel, mensajero, inventario, taller

### XSS
- Función `escH()` en cada archivo que usa `innerHTML` con datos de Supabase
- CSP activo (ver `_headers`)
- `unsafe-inline` requerido por scripts inline — objetivo a migrar

### CORS
- Edge functions validan `Origin` contra allowlist (`prodigylabdental.com`, `*.pages.dev`)
- Sin echo ciego del origin

### Rate limiting (edge functions)
- `gemini.js`: 5 req/min por IP
- `notify-wa.js`: 20 req/5min por IP
- `send-email.js`: 5 req/10min por IP
- `send-push.js`: 10 req/10min por IP
- `factura.js`: 10 req/hora por IP

### Audit log
Acciones sensibles registradas en `logs_incidencias` con `tipo='ADMIN_ACTION'`:
- `DELETE_CASO_PORTAFOLIO`
- `PUBLICAR_CASO_PORTAFOLIO` / `OCULTAR_CASO_PORTAFOLIO`
- `CAMBIAR_ESTADO`
- `CONFIRMAR_PAGO_FABRICACION`
- `CONFIRMAR_PAGO` (en contabilidad)

### Headers de seguridad
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()...
Strict-Transport-Security: max-age=63072000
Content-Security-Policy: ... upgrade-insecure-requests; object-src 'none'; base-uri 'self'
```

### Accesibilidad (WCAG 2.1 AA)
- `type="button"` en el 100% de los botones
- `aria-live` en todos los toasts y áreas de contenido dinámico
- Modal Manager global: `role=dialog + aria-modal + focus trap` automático
- Skip links en todas las páginas públicas

---

## SQL pendientes de ejecutar

| Archivo | Descripción |
|---------|-------------|
| `sql/patch-rls-client-column-protection.sql` | Trigger de protección de columnas para clientes |
| `sql/patch-rls-bibliotecas-diseno-revisiones.sql` | RLS en bibliotecas_cliente y diseno_revisiones |

---

## Privacidad (Ley 1581/2012 Colombia)
- Habeas Data en todos los formularios públicos
- Separación transaccional / promocional
- Cookie consent con opción de rechazo
- Sin analytics si el usuario rechaza
