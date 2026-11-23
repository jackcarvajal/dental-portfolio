-- ================================================================
-- PRODIGY + Alejandro CAD/CAM — Cerrar funciones internas que cualquiera podía ejecutar
-- Auditoría 18-nov-2026 (asesor de seguridad de Supabase + revisión manual del código).
--
-- Problema: 25 funciones SECURITY DEFINER (corren con permisos de dueño, saltan RLS) se podían
-- llamar desde internet con la llave pública anon (POST /rest/v1/rpc/<función>) y NO revisan
-- quién las llama. Las más graves:
--   · generar_url_firmada(ruta)  → firma CUALQUIER archivo del bucket privado «casos» (STL,
--     comprobantes) por 1 hora. Fuga directa de archivos de pacientes (Habeas Data).
--   · alejandro_dashboard_semana_v2 / prodigy_detectar_churn / prodigy_pagos_pendientes / … →
--     exponen ingresos, clientes y pagos pendientes.
--   · limpiar_pedidos_prueba / prodigy_set_sla / prodigy_purgar_stl_vencidos / … → un anónimo
--     podía borrar o modificar datos.
-- Ninguna la usa el navegador: solo las llaman los cron de functions/api/ (con service_role) u
-- otras funciones SECURITY DEFINER. Verificado con grep en ambos repos y en pg_proc.
--
-- Regla: estas funciones quedan SOLO para service_role (y para las funciones definer que las usan).
-- NO se tocan las públicas a propósito: token/nonce/UUID (revisión de diseño, enlaces de cliente,
-- seguimiento, newsletter, cupón) ni las que ya validan rol por dentro (es_equipo_lab, etc.).
--
-- Parte 2: fija search_path en las funciones que no lo tienen (aviso 0011 del linter).
--
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- 1) Solo service_role puede ejecutar las funciones internas
DO $$
DECLARE
  f regprocedure;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    -- lectura de datos internos
    'public.alejandro_actividad_hoy()',
    'public.alejandro_cotizaciones_por_vencer(integer)',
    'public.alejandro_dashboard_semana_v2()',
    'public.aln_estado_pago_de(uuid)',
    'public.diseno_elegir_tecnico(text, integer, text)',
    'public.diseno_tareas_sin_tomar()',
    'public.generar_codigo_referido(text)',
    'public.generar_url_firmada(text)',
    -- 'public.pedido_existe(text)' NO: la usa la política de Storage da_revision_sube; sin permiso fallan TODAS
    -- las subidas desde la web (corregido en sql/storage-pedido-existe-2026.sql, 23-nov-2026).
    'public.prodigy_cotizaciones_por_vencer(integer)',
    'public.prodigy_detectar_churn(integer, integer)',
    'public.prodigy_get_image_url(text, integer, integer, integer)',
    'public.prodigy_pagos_pendientes(integer)',
    'public.prodigy_pedidos_sla_vencido()',
    -- escritura (cron / mantenimiento)
    'public.alejandro_expirar_cotizaciones()',
    'public.diseno_crear_tareas(uuid)',
    'public.ia_conocimiento_usada(bigint[])',
    'public.limpiar_pedidos_prueba()',
    'public.prodigy_expirar_cotizaciones()',
    'public.prodigy_limpiar_notifs()',
    'public.prodigy_limpiar_notifs_leidas()',
    'public.prodigy_marcar_recordatorio(uuid)',
    'public.prodigy_marcar_sla_alerta(uuid)',
    'public.prodigy_purgar_stl_vencidos()',
    'public.prodigy_set_sla(text, integer)'
  ]::regprocedure[]
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;
END $$;

-- 2) search_path fijo en funciones propias que no lo tienen (no toca funciones de extensiones)
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS firma
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND NOT EXISTS (SELECT 1 FROM unnest(coalesce(p.proconfig, '{}')) c WHERE c LIKE 'search_path=%')
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions', r.firma);
  END LOOP;
END $$;

-- 3) Verificación — las dos cifras deben dar 0
SELECT
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN ('generar_url_firmada','limpiar_pedidos_prueba','alejandro_dashboard_semana_v2',
                         'prodigy_detectar_churn','prodigy_pagos_pendientes','prodigy_set_sla',
                         'prodigy_purgar_stl_vencidos','aln_estado_pago_de','diseno_crear_tareas')
       AND has_function_privilege('anon', p.oid, 'EXECUTE'))            AS internas_abiertas_a_anon_DEBE_SER_0,
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.prokind = 'f'
       AND NOT EXISTS (SELECT 1 FROM unnest(coalesce(p.proconfig, '{}')) c WHERE c LIKE 'search_path=%')
       AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e'))
                                                                        AS funciones_sin_search_path_DEBE_SER_0;
