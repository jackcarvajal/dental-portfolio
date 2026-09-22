# ROADMAP — Sistema de Gestión de Laboratorio (PRODIGY)

> Consolidado 21-sep-2026. Fuente de verdad de lo pedido, lo hecho, los límites técnicos
> y el plan por fases. No se sirve en la web (build borra `.md`). Interno.

## ✅ YA HECHO Y DESPLEGADO (sep-2026)
- **Bandeja de Solicitudes** (PRODIGY + Alejandro): gestiona leads de escáner/domicilio (cotizar, cobrar por WA, descargar STL, cambiar estado).
- **Nº de caso rastreable** + **alertas WhatsApp al staff** en todos los formularios (con contexto: "carril rápido sin pago/datos").
- **Registro del Dr** tras enviar (botón "Crear cuenta y seguir el caso").
- **Rastreo físico**: etiqueta QR 50×30mm + `mover.html` (área/técnico/componentes/estado/foto) + tablero `rastreo.html`.
- **Cadena de custodia**: `pedido_movimientos` (quién/qué/porqué/cuándo + fotos, bucket `caso-fotos`).
- **Privacidad**: ubicación interna en `pedido_seguimiento` (solo-staff). El Dr NUNCA ve operaciones internas.
- **Roles**: `rastreo`/`mover` abiertos a todo el staff (sin datos sensibles). Dinero/contacto siguen restringidos.

## 🎭 ROLES (ya existen 11) y qué ve cada uno (CONFIRMADO por el usuario)
| Dato | admin | contabilidad | operator | secretaria* | calidad | inventario | técnicos prod. | mensajero |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Precio/factura/saldo/pago 🔒 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Contacto del Dr (WA/email) 🔒 | ✅ | ✅ | ❌** | ✅ | ❌ | ❌ | ❌ | ✅ (entrega) |
| Costo del material 🔒 | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Tablero rastreo (área/técnico) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (todos) | ✅ |
| Custodia (componentes/fotos) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Material consumido por caso (sin costo) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| STL/protocolo técnico | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |

*secretaria = rol nuevo a crear (hoy no existe; usar `operator` o crear `secretaria`).
**Confirmado: operator NO ve dinero. Contacto del Dr: solo admin/contabilidad/secretaria/mensajero.

## ⚠️ LÍMITE TÉCNICO IMPORTANTE — WhatsApp automático AL DR
**No se puede** mandar WhatsApp automático a un doctor cualquiera con CallMeBot (solo funciona con números REGISTRADOS = tu staff). Opciones reales:
1. **Email automático al Dr** (funciona hoy vía Resend) — cuando diseño/área le envía algo.
2. **Aviso WhatsApp a la SECRETARIA** (staff, sí funciona por CallMeBot) → ella contacta al Dr con un botón `wa.me` de 1 clic. ← **la vía práctica hoy.**
3. **WhatsApp Business API** (Meta Cloud API / Twilio / 360dialog) — ÚNICA forma de automatizar WA directo al Dr. Requiere cuenta + plantillas aprobadas (costo/setup). Fase futura.

## 📋 PENDIENTE — Plan por fases (orden recomendado)
> **PROGRESO (22-sep):** ✅ Fase 1 (código DR-#### + panel clientes) · ✅ Fase 2 (material por caso en rastreo) · ✅ Fase 4 (incidencias visibles/internas) · ✅ QR unificado (caso-qr.html rutea por rol). Pendientes: Fase 3 (RBAC RLS) y Fase 5 (notificaciones).

### Fase 1 — Código de cliente del Dr (CRM) 🟢 pequeño, alto valor
- Al registrarse el Dr → generar código secuencial (ej. `PRD-DR-0001`). Guardar en `doctores_perfil`.
- Panel para la **secretaria**: lista de doctores con su código, contacto, nº de casos. "Manejo" de clientes.

### Fase 2 — Trazabilidad de material por caso 🟡
- Ligar `inventario_movimientos` a `pedido_id` + `registrado_por` + motivo. "Técnico X sacó 1 disco zirconia lote 123 para caso PRD-…". Costo solo admin/contabilidad/inventario.

### Fase 3 — RBAC real (RLS por rol) 🔴 delicado, el más grande
- Separar dinero/contacto a zona restringida + políticas RLS por rol. Verificar que nadie pierda acceso. Por etapas, sobre datos vivos.

### Fase 4 — Incidencias del caso + seguimiento del Dr
- Registrar incidencias por caso con bandera `visible_cliente` (interna vs visible al Dr). El Dr las ve en su portal/seguimiento; las internas (pérdida, reproceso) NO.

### Fase 5 — Notificaciones + QR unificado
- Auto-email al Dr + aviso WA a secretaria cuando el caso pasa a REVISION_CLIENTE / se despacha.
- **QR unificado**: un solo QR rutea por rol → staff=interno, mensajero=despacho/entrega con foto, público=seguimiento seguro.

### Fase 6 (futuro) — WhatsApp Business API
- Automatizar WA directo al Dr (requiere inversión/setup).

## 💡 MEJORAS PROACTIVAS SUGERIDAS (validar)
- **Prueba de entrega**: el mensajero, al marcar "Entregado" en `mover.html`, deja foto + firma/nombre de quien recibe → cierra la cadena de custodia hasta el cliente.
- **Alertas de caso estancado**: si un caso lleva +48h en la misma área, avisar al operator (ya se marca ⚠️ en el tablero; falta el WhatsApp).
- **Reimpresión de etiqueta** con 1 clic desde el panel de cada caso.
- **Dashboard por área**: cuántos casos hay en cada estación (carga de trabajo) — datos ya disponibles en `pedido_seguimiento`.
