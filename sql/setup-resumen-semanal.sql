-- ============================================================
-- PRODIGY — Resumen Semanal Automático por WhatsApp
-- Ejecutar en Supabase SQL Editor UNA SOLA VEZ
--
-- Requiere extensiones: pg_cron + pg_net (ya incluidas en Supabase)
-- ============================================================

-- 1. Habilitar extensiones (si no están activas)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Programar el cron: cada sábado a las 10:00am (UTC-5 = 15:00 UTC)
--    Formato: minuto hora dia-mes mes dia-semana
--    6 = sábado en pg_cron
SELECT cron.schedule(
  'prodigy-resumen-semanal',   -- nombre del job
  '0 15 * * 6',                -- cada sábado 15:00 UTC (10:00am Colombia)
  $$
  SELECT net.http_post(
    url     := 'https://prodigylabdental.com/api/resumen-semanal',
    headers := jsonb_build_object(
      'Content-Type',    'application/json',
      'x-cron-secret',   current_setting('app.cron_secret', true)
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- 3. Verificar que quedó programado
SELECT jobid, jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'prodigy-resumen-semanal';

-- ============================================================
-- PARA ACTIVAR — pasos manuales de Alejandro:
-- ============================================================
--
-- A) Activar Callmebot (gratis, 1 sola vez):
--    1. En WhatsApp, envía: "I allow callmebot to send me messages"
--       al número: +34 644 59 75 34
--    2. Callmebot responde con tu apikey (ej: 1234567)
--
-- B) Agregar en Cloudflare Pages → Settings → Environment variables:
--    CALLMEBOT_APIKEY   = (el número que te dio Callmebot)
--    WA_RESUMEN_PHONE   = 573212816716
--    CRON_SECRET        = (cualquier string secreto, ej: prodigy2026)
--
-- C) Configurar el secret en Supabase (para que pg_cron lo use):
--    En Supabase → Settings → Database → postgres → ejecutar:
--    ALTER DATABASE postgres SET "app.cron_secret" = 'EL_MISMO_CRON_SECRET';
--
-- D) Para probar manualmente ANTES del sábado:
--    Llama el endpoint desde terminal o Insomnia:
--    POST https://prodigylabdental.com/api/resumen-semanal
--    Header: x-cron-secret: EL_MISMO_CRON_SECRET
--
-- ============================================================
