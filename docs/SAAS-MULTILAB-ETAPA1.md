# Varios laboratorios en el mismo sistema — Etapa 1 (propuesta para revisar)

> Oct-2026. Sale de la comparación con Soluciones FE (https://claude.ai/artifact/N7dLhoAnDcvEYiKebHQz1A) y de
> `SAAS-ROADMAP.md`. **Nada de esto está corrido.** Cambia el modelo de acceso, así que se revisa antes de escribir SQL.

## Hoy

- Cada fila compartida se separa con la columna `negocio` (`prodigy`, `alejandrocadcam`, `bss`).
- Los roles del personal viven en `app_metadata.role(s)` y los administradores son 4 correos fijos en `auth-guard.js`,
  en las funciones de `functions/api/` y en `es_admin_lab()`. Para PRODIGY esto es correcto y **no se toca**.
- Para vender el sistema, cada laboratorio cliente necesita: sus datos aislados, sus propios administradores, su
  configuración (marca, WhatsApp, catálogo, estados) y su plan.

## Regla que propongo (y que reemplaza a «admins solo por correo» únicamente para los laboratorios clientes)

| Quién | Dónde se define | Puede |
|---|---|---|
| Súper administrador de la plataforma | Correos fijos en el código (como hoy) | Todo, en todos los laboratorios |
| Administrador de un laboratorio | Tabla `laboratorio_miembros` (rol `admin`) | Todo dentro de SU laboratorio |
| Personal de un laboratorio | `laboratorio_miembros` (rol `operator`, `diseno`, …) | Lo de su rol, en SU laboratorio |
| Doctor (cliente del laboratorio) | Igual que hoy (`user_id` del pedido) | Sus pedidos |

`user_metadata` sigue sin usarse para nada de permisos.

## Etapa 1 — solo agregar, sin cambiar lo que funciona

1. Tabla `laboratorios` (registro de cada laboratorio). Su `slug` es el mismo valor que hoy va en `negocio`:
   `prodigy`, `alejandrocadcam`, `bss`. Así los datos existentes ya quedan «de un laboratorio» sin migrarlos.
   Campos: `slug` (PK), `nombre`, `whatsapp`, `dominio`, `plan`, `activo`, `creado_at`, `config` (jsonb: marca y textos).
2. Tabla `laboratorio_miembros` (`laboratorio` → `laboratorios.slug`, `user_id`, `rol`, `activo`), con RLS: cada quien
   ve solo las filas de sus laboratorios; el súper administrador ve todo.
3. Función `es_miembro(lab text, roles text[])` (SECURITY DEFINER, `search_path = public`) para usar en las políticas.
4. **Nada más cambia en la etapa 1**: las políticas actuales por `negocio` y `app_metadata` siguen igual.

## Etapa 2 — empezar a usarla (por módulo, verificando cada uno)

- Políticas nuevas en paralelo: «`negocio` = un laboratorio donde soy miembro» **además** de las actuales.
- Primer módulo: `pedidos` (lectura), luego escritura, luego el resto según `ARCHITECTURE.md` §3.
- Configuración por laboratorio: el WhatsApp, la marca y los textos salen de `laboratorios.config` en vez del código.

## Etapa 3 — producto

- Registro propio del laboratorio + prueba de 14 días con datos de demostración.
- Cobro recurrente (Wompi / PayPal) y bloqueo suave al vencer (datos guardados 30 días).
- El sistema en su propia dirección (p. ej. `sistema.prodigylabdental.com`) separado de la web pública.

## Riesgos y cómo se controlan

- **Fuga entre laboratorios**: cada política nueva se prueba con dos usuarios de laboratorios distintos antes de
  activarla (script en `tools/` que intenta leer lo ajeno y debe recibir 0 filas).
- **Romper PRODIGY**: en las etapas 1 y 2 las políticas actuales no se borran; las nuevas se suman.
- **Deriva entre los repos**: la configuración por laboratorio es justo lo que permite tener un solo sistema en vez de
  dos copias (PRODIGY y Alejandro).

## Lo que necesito de Alejandro para empezar

1. Confirmar la regla de la tabla de arriba (administradores de laboratorios clientes en la base).
2. Elegir el nombre del producto y su dirección (para la etapa 3).
3. Con eso escribo `sql/laboratorios-etapa1-2026.sql` (idempotente, solo agrega) para que lo corra.
