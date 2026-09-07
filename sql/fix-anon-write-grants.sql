-- ═══════════════════════════════════════════════════════════════
-- FIX — quitar a `anon` privilegios de escritura peligrosos (BD COMPARTIDA)
--
-- Contexto (auditoría 2026-09-07): el rol `anon` (anon key PÚBLICA del frontend)
-- tenía GRANT de DELETE y UPDATE en tablas que jamás debe poder escribir. Verificado
-- en vivo por PostgREST: DELETE/PATCH → 204 en pedidos, pagos, clientes,
-- casos_portafolio, perfiles, reviews, cotizaciones. Riesgo: borrado/alteración
-- masiva por un anónimo (la anon key va en el bundle JS, es pública por diseño).
--
-- 🔒 Es la Ley de Oro: tabla compartida PRODIGY ↔ Alejandro → correr UNA vez cubre ambos.
-- ✅ NO afecta a usuarios autenticados (rol `authenticated`) ni al service_role.
-- ✅ Preserva las escrituras anón LEGÍTIMAS del front público (ver más abajo).
-- Correr DESPUÉS de audit-anon-grants.sql (para ver el alcance). Transaccional.
-- Pegar en Supabase SQL Editor → Run.
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ── 1) DELETE: anon NO debe poder borrar NADA ──────────────────────────
--    Verificado en ambos repos: ninguna página pública hace .delete() como anon;
--    los "borrados" del front son soft-delete vía UPDATE (deleted=true).
REVOKE DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE DELETE, TRUNCATE ON TABLES FROM anon;

-- ── 2) UPDATE: quitar sólo en las tablas SENSIBLES (no en las del flujo público) ──
--    Estas 7 se confirmaron con UPDATE-grant indebido y no las escribe ningún
--    flujo anónimo legítimo:
REVOKE UPDATE ON public.pedidos          FROM anon;
REVOKE UPDATE ON public.pagos            FROM anon;
REVOKE UPDATE ON public.clientes         FROM anon;
REVOKE UPDATE ON public.casos_portafolio FROM anon;
REVOKE UPDATE ON public.perfiles         FROM anon;
REVOKE UPDATE ON public.reviews          FROM anon;
REVOKE UPDATE ON public.cotizaciones     FROM anon;  -- anon INSERTa cotizaciones (calculadoras), pero NO debe UPDATE

-- ⚠️ Si el paso 1 de audit-anon-grants.sql lista OTRAS tablas con UPDATE de anon
--    que no estén en la lista blanca de abajo, añádelas aquí con la misma línea.

-- ── LISTA BLANCA — NO tocar (el front público las escribe como anon) ──────
--    feedback_casos   (caso.html: pin/soft-delete de notas)
--    referidos        (flujo-*: registrar referido)
--    leads            (seguimiento-caso: upsert)  — Alejandro
--    push_subscriptions (seguimiento-caso: upsert) — Alejandro
--    doctores_perfil  (envia-tu-scanner: upsert)   — PRODIGY
--    cotizaciones/leads_doctores/solicitudes_scanner/citas_domicilio → sólo INSERT (intacto)

COMMIT;

-- ── Verificar (debe devolver 0 filas para DELETE, y sólo la lista blanca para UPDATE) ──
-- SELECT table_name, privilege_type FROM information_schema.role_table_grants
--   WHERE grantee='anon' AND table_schema='public'
--     AND privilege_type IN ('UPDATE','DELETE') ORDER BY table_name, privilege_type;
