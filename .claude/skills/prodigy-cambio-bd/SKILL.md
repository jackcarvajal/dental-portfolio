---
name: prodigy-cambio-bd
description: Flujo obligatorio para cualquier cambio en la base Supabase compartida de PRODIGY y Alejandro CAD/CAM (tablas, columnas, vistas, RLS, GRANT, RPC, triggers, políticas de Storage, datos). Usar antes de escribir un archivo SQL, antes de usar en el front una columna o RPC nueva, al investigar un 400/401/403 de Supabase, y al pedirle a Alejandro que corra SQL.
---

# Cambios en la base (Supabase `zgihrwqfyvgyapbwzkvw`)

La base es compartida y tiene datos vivos de clientes. Un error aquí afecta a los dos negocios.

## 1. Verifica el esquema real (nunca supongas)

- `node tools/audit-schema-live.mjs` — columnas, RPC y valores de enum que el código usa y no existen.
- `node tools/sql-map.mjs` — dónde está definida cada RPC; la canónica es el archivo más reciente que
  señala (`sql/_baseline/README.md`). Edita esa definición; no agregues otro `patch-*.sql` que la redefina.
- Un **400** = columna o RPC que no existe. Un **401/403 con anon** = RLS, GRANT o anon key vieja.

## 2. Escribe el archivo SQL

Nombre: `sql/<modulo>-<tema>-<año>.sql`. Plantilla de referencia: `sql/alineadores-facturacion-2026.sql`.

- Encabezado en español: problema, regla de negocio, "100 % IDEMPOTENTE", "Copiar TODO → SQL Editor → Run".
- Idempotente: `IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP … IF EXISTS` antes de `CREATE TRIGGER/POLICY`.
- Funciones: `SECURITY DEFINER` + `SET search_path = public`; `REVOKE ALL … FROM PUBLIC, anon, authenticated`
  y `GRANT EXECUTE … TO authenticated` solo si el front la llama.
- Tablas nuevas: RLS activo, políticas por `auth.uid()` y por `negocio` si la tabla es compartida, y los
  `GRANT` explícitos que exige Supabase (ver `docs/GUIA-SEGURIDAD.md`).
- Roles: `auth.jwt() -> 'app_metadata'`. Nunca `user_metadata`.
- Nombres en español, sin columnas bilingües, sin tabla paralela a una existente (`ARCHITECTURE.md` §6).
- Cierra con un `SELECT` de verificación que diga qué resultado esperar (p. ej. "TOTAL (debe dar 780)").
- Para índices, tipos, RLS y rendimiento carga la skill `supabase-postgres-best-practices`.

## 3. Entrega a Alejandro (él corre el SQL)

- Dale el **enlace al editor**: https://supabase.com/dashboard/project/zgihrwqfyvgyapbwzkvw/sql/new
- Dale el **enlace al archivo local** (markdown, ruta relativa del repo). **Nunca pegues el SQL en el chat.**
- Dile qué debe ver al correrlo y qué pegarte de vuelta.
- Si el front depende de ese SQL, no lo publiques hasta que confirme que lo corrió, o hazlo tolerante a
  que la columna/RPC aún no exista.
- Anota en `BITACORA.md` el SQL como pendiente de correr, y luego como corrido.

## 4. Paridad

- SQL sobre tablas compartidas: se corre **una vez** y sirve para ambos productos.
- Código que consume el cambio (JS/HTML/Functions): evalúa si se porta al repo de Alejandro.

## Nunca

- `service_role` fuera de `functions/api/` (ni en el chat, ni en el repo público).
- Datos de pacientes o nombres reales en archivos del repo: van en `temporal/` (ignorado).
- Escribir en la base desde un MCP o script sin que Alejandro lo pida explícitamente.
