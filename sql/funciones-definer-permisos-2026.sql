-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- FUNCIONES SECURITY DEFINER — guardias rotas y permisos de más (auditoría oct-2026)
-- 100 % IDEMPOTENTE · Copiar TODO → SQL Editor → Run
--
-- El asesor de seguridad de Supabase marca 80 funciones SECURITY DEFINER que un anónimo puede ejecutar.
-- Revisadas una por una (código + prueba como anónimo en producción):
--
--  🔴 generar_url_firmada(ruta): cualquiera sin sesión sacaba un enlace firmado de 1 h a CUALQUIER archivo del
--     bucket privado `casos`. Nadie la usa en la web.
--  🔴 prodigy_crear_revision_token: guardia rota (ver abajo) → un anónimo podía crear el token de revisión de
--     cualquier pedido y con él APROBAR el diseño (manda el caso a producción).
--  🔴 prodigy_clv_doctores: SIN guardia → correo, nombre e ingresos de cada doctor para cualquiera.
--  🔴 limpiar_pedidos_prueba / prodigy_purgar_stl_vencidos / *_expirar_cotizaciones / prodigy_limpiar_notifs*:
--     un anónimo podía BORRAR pedidos de prueba, purgar STL, vencer cotizaciones o limpiar la campana.
--  🟡 alejandro_dashboard(_semana), alejandro_ingresos_semanas, alejandro_top_servicios, prodigy_funnel,
--     prodigy_ingresos_por_canal/_por_dia, prodigy_top_doctores, prodigy_pedidos_por_material,
--     prodigy_conversion_por_flujo, prodigy_analytics_conversion, prodigy_inventario_alertas: métricas e
--     ingresos legibles sin sesión (comprobado: el anónimo recibe el dashboard de Alejandro y el embudo).
--
-- GUARDIA ROTA: `IF NOT (rol IN (...) OR email IN (...)) THEN RAISE` — sin sesión (o un cliente sin rol) las
-- comparaciones dan NULL, NOT NULL = NULL y el IF no bloquea. Igual que la de sql/fix-guardia-metricas-2026.sql.
--
-- Qué hace (sin tocar el resto del cuerpo de ninguna función):
--  A. Reescribe esa guardia a prueba de NULL en TODAS las funciones que la tienen (mismos roles y correos de
--     antes + es_admin_lab()).
--  B. Pone guardia a las 4 que no tenían: admin para las de dinero/doctores, equipo para inventario.
--  C. Quita el EXECUTE al anónimo en las de paneles (las sigue llamando el equipo con sesión) y al anónimo y a
--     los usuarios en las que solo usa el servidor (functions/api con service_role) o nadie.
-- NO toca las que la web pública sí necesita sin sesión: revisión del diseño (prodigy_rd_*, *_via_token,
-- prodigy_revision_diseno_*), seguimiento (buscar_pedido_publico, pedido_para_fabricar), cupones, newsletter,
-- waitlist_labs_count, y las funciones auxiliares que usan las políticas RLS (es_admin, es_dueno_pedido…).
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

-- A + B: guardias
DO $$
DECLARE
  f record; def text; nuevo text;
  rota CONSTANT text := 'IF NOT \(\s*\(auth\.jwt\(\) -> ''app_metadata'' ->> ''role''\) IN \(([^)]*)\)\s*OR \(auth\.jwt\(\) ->> ''email''\) IN \(([^)]*)\)\s*\) THEN';
  sana  CONSTANT text := 'IF NOT (public.es_admin_lab() OR COALESCE((auth.jwt() -> ''app_metadata'' ->> ''role'') IN (\1), false) OR COALESCE(auth.jwt() -> ''app_metadata'' -> ''roles'', ''[]''::jsonb) ?| array[\1] OR COALESCE(lower(auth.jwt() ->> ''email'') IN (\2), false)) THEN';
BEGIN
  FOR f IN
    SELECT p.oid, p.proname, p.prosrc FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    def := pg_get_functiondef(f.oid);
    nuevo := def;
    IF f.prosrc ~ rota THEN
      nuevo := regexp_replace(def, rota, sana, 'g');
    ELSIF f.proname IN ('alejandro_dashboard_semana','alejandro_ingresos_semanas','prodigy_clv_doctores')
          AND f.prosrc !~ 'es_admin_lab\(\)' THEN
      nuevo := regexp_replace(def, '\mBEGIN\M', E'BEGIN\n    IF NOT public.es_admin_lab() THEN RAISE EXCEPTION ''No autorizado'' USING ERRCODE = ''42501''; END IF;', 'i');
    ELSIF f.proname = 'prodigy_inventario_alertas' AND f.prosrc !~ 'es_equipo_lab\(\)' THEN
      -- también la llama el cron de stock bajo (functions/api/notif-stock-bajo.js) con service_role
      nuevo := regexp_replace(def, '\mBEGIN\M', E'BEGIN\n    IF NOT (public.es_equipo_lab() OR COALESCE(auth.jwt() ->> ''role'', '''') = ''service_role'') THEN RAISE EXCEPTION ''No autorizado'' USING ERRCODE = ''42501''; END IF;', 'i');
    END IF;
    IF nuevo <> def THEN
      EXECUTE nuevo;
      RAISE NOTICE 'guardia arreglada: %', f.proname;
    END IF;
  END LOOP;
END $$;

-- C1: paneles del equipo → sin anónimo (con sesión las decide la guardia)
DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS firma FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname IN (
       'alejandro_dashboard','alejandro_dashboard_semana','alejandro_ingresos_semanas','alejandro_top_servicios',
       'prodigy_clv_doctores','prodigy_inventario_alertas','prodigy_ingresos_por_canal','prodigy_ingresos_por_dia',
       'prodigy_top_doctores','prodigy_funnel','prodigy_pedidos_por_material','prodigy_conversion_por_flujo',
       'prodigy_analytics_conversion','prodigy_crear_revision_token','prodigy_mi_wallet')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', f.firma);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', f.firma);
  END LOOP;
END $$;

-- C2: solo el servidor (service_role) o nadie
DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS firma FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname IN (
       'generar_url_firmada','prodigy_get_image_url','limpiar_pedidos_prueba','prodigy_purgar_stl_vencidos',
       'prodigy_expirar_cotizaciones','alejandro_expirar_cotizaciones','prodigy_limpiar_notifs','prodigy_limpiar_notifs_leidas',
       'prodigy_marcar_recordatorio','prodigy_cotizaciones_por_vencer','alejandro_cotizaciones_por_vencer',
       'prodigy_detectar_churn','prodigy_pagos_pendientes','alejandro_actividad_hoy','alejandro_dashboard_semana_v2',
       'generar_codigo_referido')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.firma);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.firma);
  END LOOP;
END $$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────────────────────────────────────
-- Debe dar: guardias_rotas = 0 · sin_guardia = 0 · anon_en_paneles = 0 · abiertas_en_servidor = 0
SELECT
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
      AND p.prosrc ~ 'IF NOT \(\s*\(auth\.jwt\(\) -> ''app_metadata'' ->> ''role''\) IN \([^)]*\)\s*OR \(auth\.jwt\(\) ->> ''email''\) IN') AS guardias_rotas,
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('alejandro_dashboard_semana','alejandro_ingresos_semanas','prodigy_clv_doctores','prodigy_inventario_alertas')
      AND p.prosrc !~ 'es_(admin|equipo)_lab\(\)')                                                          AS sin_guardia,
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('alejandro_dashboard','alejandro_dashboard_semana','alejandro_ingresos_semanas',
      'alejandro_top_servicios','prodigy_clv_doctores','prodigy_inventario_alertas','prodigy_ingresos_por_canal','prodigy_ingresos_por_dia',
      'prodigy_top_doctores','prodigy_funnel','prodigy_pedidos_por_material','prodigy_conversion_por_flujo','prodigy_analytics_conversion',
      'prodigy_crear_revision_token','prodigy_mi_wallet')
      AND has_function_privilege('anon', p.oid, 'execute'))                                                  AS anon_en_paneles,
  (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('generar_url_firmada','prodigy_get_image_url','limpiar_pedidos_prueba',
      'prodigy_purgar_stl_vencidos','prodigy_expirar_cotizaciones','alejandro_expirar_cotizaciones','prodigy_limpiar_notifs',
      'prodigy_limpiar_notifs_leidas','prodigy_marcar_recordatorio','prodigy_cotizaciones_por_vencer','alejandro_cotizaciones_por_vencer',
      'prodigy_detectar_churn','prodigy_pagos_pendientes','alejandro_actividad_hoy','alejandro_dashboard_semana_v2','generar_codigo_referido')
      AND (has_function_privilege('anon', p.oid, 'execute') OR has_function_privilege('authenticated', p.oid, 'execute'))) AS abiertas_en_servidor;
