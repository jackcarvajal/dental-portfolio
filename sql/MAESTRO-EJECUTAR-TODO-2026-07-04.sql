-- ================================================================
-- PRODIGY — SQL MAESTRO CONSOLIDADO — Ejecutar TODO de una sola vez
-- Generado 2026-07-04 — reune los 12 patches de seguridad de esta sesion
-- en el orden correcto. Copiar y pegar completo en Supabase SQL Editor.
-- ================================================================

-- ############################################################
-- # 1/12 — ESCALAMIENTO DE PRIVILEGIOS (EL MAS GRAVE)
-- ############################################################
-- ============================================================
-- PRODIGY — CRÍTICO: eliminar escalamiento de privilegios vía user_metadata
-- Ejecutar en: Supabase Dashboard → SQL Editor — CON PRIORIDAD MÁXIMA
--
-- Hallazgo (auditoría 2026-07-03): múltiples políticas RLS usan
-- `auth.jwt() -> 'user_metadata' ->> 'role'` (o su equivalente
-- `raw_user_meta_data`) como condición de autorización, casi siempre
-- como fallback con OR junto al chequeo correcto de app_metadata.
--
-- user_metadata es un campo que EL PROPIO USUARIO puede editar desde
-- el navegador, sin ningún control de servidor:
--
--   await supabase.auth.updateUser({ data: { role: 'admin' } })
--
-- Cualquier doctor/cliente autenticado podía ejecutar esa línea desde
-- la consola del navegador y, en su siguiente sesión/refresh de JWT,
-- obtener acceso de:
--   - admin total a `creditos_cliente` (saldo a favor de TODOS los
--     doctores — podía leer y modificar cualquier saldo)
--   - lectura de TODOS los reportes internos en `logs_incidencias`
--   - UPDATE de `estado_operativo` en CUALQUIER pedido (rol 'operator')
--   - admin total a `doctores_perfil` (perfiles de todos los doctores)
--   - admin total a `pedidos_doctor` (todos los pedidos, rol admin/operator)
--   - admin total a `perfiles` (tabla de equipo interno — podía incluso
--     verse a sí mismo con rol admin ahí también)
--   - escritura en `inventario_items`/`lotes_material`/`inventario_movimientos`
--     (rol 'encargado_inventario')
--
-- Este es el hallazgo MÁS GRAVE de toda la auditoría: no requiere
-- ningún exploit sofisticado, solo una línea de JavaScript en la
-- consola del navegador estando logueado como cualquier doctor.
-- ============================================================

-- ── 1. creditos_cliente — admin total (migrate-fix-rls-roles.sql) ──
DROP POLICY IF EXISTS "creditos_admin_all" ON creditos_cliente;
CREATE POLICY "creditos_admin_all" ON creditos_cliente
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- ── 2. logs_incidencias — lectura staff (migrate-fix-rls-roles.sql) ──
DROP POLICY IF EXISTS "inc_read_staff" ON logs_incidencias;
CREATE POLICY "inc_read_staff" ON logs_incidencias
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

-- ── 3. pedidos — UPDATE operator (migrate-fix-rls-roles.sql) ──
DROP POLICY IF EXISTS "pedidos_update_operator" ON pedidos;
CREATE POLICY "pedidos_update_operator" ON pedidos
    FOR UPDATE TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'operator');

-- ── 4. doctores_perfil — admin (migrate-doctores.sql) ──
DROP POLICY IF EXISTS "admin_all_profiles" ON doctores_perfil;
CREATE POLICY "admin_all_profiles" ON doctores_perfil
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- ── 5. pedidos_doctor — admin/operator (migrate-doctores.sql) ──
DROP POLICY IF EXISTS "admin_all_pedidos" ON pedidos_doctor;
CREATE POLICY "admin_all_pedidos" ON pedidos_doctor
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

-- ── 6. perfiles (equipo interno) — admin (migrate-equipo.sql) ──
DROP POLICY IF EXISTS "perfiles_admin_all" ON perfiles;
CREATE POLICY "perfiles_admin_all" ON perfiles
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- ── 7. inventario_items / lotes_material / inventario_movimientos ──
-- (migrate-inventario.sql)
DROP POLICY IF EXISTS "inv_write_admin" ON inventario_items;
CREATE POLICY "inv_write_admin" ON inventario_items
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'encargado_inventario'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'encargado_inventario'
    );

DROP POLICY IF EXISTS "lotes_write_admin" ON lotes_material;
CREATE POLICY "lotes_write_admin" ON lotes_material
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'encargado_inventario'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'encargado_inventario'
    );

DROP POLICY IF EXISTS "mov_write_admin" ON inventario_movimientos;
CREATE POLICY "mov_write_admin" ON inventario_movimientos
    FOR ALL USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'encargado_inventario'
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'encargado_inventario'
    );

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Ejecutar como cualquier usuario autenticado NO-admin (ej. una cuenta
-- de prueba de doctor) tras correr:
--   await supabase.auth.updateUser({ data: { role: 'admin' } })
-- y luego intentar:
--   await supabase.from('creditos_cliente').select('*')
-- Debe devolver 0 filas o error de permisos — NO debe mostrar los
-- creditos de otros doctores.
--
-- SELECT policyname, qual FROM pg_policies
-- WHERE tablename IN ('creditos_cliente','logs_incidencias','pedidos',
--   'doctores_perfil','pedidos_doctor','perfiles','inventario_items',
--   'lotes_material','inventario_movimientos')
--   AND (qual LIKE '%user_metadata%' OR qual LIKE '%raw_user_meta_data%');
-- → debe devolver 0 filas (ninguna policy activa debe mencionar
--   user_metadata/raw_user_meta_data en su condición)
-- ============================================================

-- ############################################################
-- # 2/12 — FRAUDE EN CUPONES DE REFERIDOS
-- ############################################################
-- ============================================================
-- PRODIGY — Cerrar fraude en sistema de referidos/cupones
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-03):
-- La política "ref_anon_insert" (sql/referidos-table.sql) permite
-- INSERT con WITH CHECK(true) — cualquier usuario anónimo puede
-- insertar una fila en `referidos` fijando DIRECTAMENTE columnas que
-- deberían ser exclusivas del trigger de pago confirmado:
--   cupon_credito, cupon_usado, estado, recompensa_cop
--
-- Ejemplo de explotación (antes de este patch):
--   POST /rest/v1/referidos
--   { "referidor_email":"atacante@x.com", "codigo":"FAKE1",
--     "cupon_credito":"CRED-FALSO1", "cupon_usado":false,
--     "estado":"primer_pedido", "recompensa_cop":999999999 }
--   → luego RPC prodigy_usar_cupon_credito('CRED-FALSO1') devuelve
--     ok:true con un monto de crédito completamente inventado.
--
-- Además: no había verificación de auto-referido (un doctor podía
-- usar su propio código para "referirse a sí mismo" y generar cupón).
-- ============================================================

-- ── 1. Restringir el INSERT a solo los valores "seguros" de fábrica ──
-- Un cliente solo puede crear una fila NUEVA sin cupón, sin usar, en
-- estado inicial. cupon_credito/cupon_usado/recompensa/descuento SOLO
-- los toca el trigger (SECURITY DEFINER, corre con permisos de owner,
-- no pasa por esta policy).
DROP POLICY IF EXISTS "ref_anon_insert" ON public.referidos;
CREATE POLICY "ref_anon_insert" ON public.referidos
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    cupon_credito IS NULL
    AND cupon_usado = false
    AND cupon_at IS NULL
    AND estado IN ('pendiente', 'registrado')
    AND recompensa_cop = 30000
    AND descuento_pct = 5
    AND referido_email IS NULL   -- se completa solo vía trigger al confirmar pago
  );

-- ── 2. Prevenir que un cliente modifique su propia fila directamente ──
-- No existía ninguna policy UPDATE para authenticated no-staff, lo cual
-- ya bloqueaba UPDATE por RLS (implícito) — se agrega explícita y
-- restrictiva por claridad, en caso de que alguna GRANT futura la abra.
DROP POLICY IF EXISTS "ref_client_no_update" ON public.referidos;
CREATE POLICY "ref_client_no_update" ON public.referidos
  FOR UPDATE TO authenticated
  USING (false);

-- ── 3. Prevenir auto-referido en el trigger de primer pedido ──
CREATE OR REPLACE FUNCTION public.prodigy_detectar_primer_pedido_referido()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email       text;
  v_codigo      text;
  v_cupon       text;
  v_ref_id      uuid;
  v_referidor_email text;
BEGIN
  IF NEW.pago_estado = 'pago_confirmado' AND
     (OLD.pago_estado IS DISTINCT FROM 'pago_confirmado') AND
     NEW.codigo_referido IS NOT NULL THEN

    v_codigo := NEW.codigo_referido;
    v_email  := lower(trim(COALESCE(NEW.email, NEW.doctor, '')));

    SELECT id, lower(trim(referidor_email)) INTO v_ref_id, v_referidor_email
    FROM public.referidos
    WHERE codigo = v_codigo AND estado IN ('pendiente','registrado')
    LIMIT 1;

    -- Auto-referido: el email del pedido referido es el mismo que el
    -- del referidor original — bloquear, no generar cupón ni recompensa.
    IF v_ref_id IS NOT NULL AND v_referidor_email = v_email AND v_email <> '' THEN
      INSERT INTO public.logs_incidencias(tipo, severidad, descripcion, resuelta)
      VALUES (
        'REFERIDO_AUTO_BLOQUEADO', 'WARN',
        '[REFERIDOS] Intento de auto-referido bloqueado — código: ' || v_codigo ||
        ' | email: ' || v_email || ' | pedido: ' || COALESCE(NEW.codigo, NEW.id::text),
        true
      );
      RETURN NEW;
    END IF;

    IF v_ref_id IS NOT NULL THEN
      v_cupon := public._generar_cupon_credito();

      UPDATE public.referidos SET
        estado         = 'primer_pedido',
        referido_email = COALESCE(referido_email, v_email),
        referido_at    = COALESCE(referido_at, NOW()),
        cupon_credito  = v_cupon,
        cupon_at       = NOW()
      WHERE id = v_ref_id;

      INSERT INTO public.logs_incidencias(tipo, severidad, descripcion, resuelta)
      VALUES (
        'REFERIDO_PRIMER_PEDIDO', 'INFO',
        '[REFERIDOS] Primer pedido confirmado — código: ' || v_codigo ||
        ' | cupón generado: ' || v_cupon ||
        ' | pedido: ' || COALESCE(NEW.codigo, NEW.id::text),
        true
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Intentar (debe FALLAR con violación de policy):
-- INSERT INTO referidos (referidor_email, codigo, estado, cupon_credito, recompensa_cop)
-- VALUES ('test@test.com', 'TEST123', 'primer_pedido', 'CRED-FAKE', 999999999);
--
-- Confirmar que un INSERT "legítimo" sigue funcionando:
-- INSERT INTO referidos (referidor_email, codigo) VALUES ('doctor@test.com', 'TESTOK1');
-- ============================================================

-- ############################################################
-- # 3/12 — RLS CATALOGO/PRECIOS/BILLETERAS (claim JWT incorrecto)
-- ############################################################
-- ============================================================
-- PRODIGY — Corregir RLS de catalogo/config_precios/billeteras
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-03): las políticas de escritura de
-- estas 3 tablas (sql/migrate-catalogo-completo.sql) usan:
--
--   auth.jwt() ->> 'role' = 'admin'
--
-- Pero `role` a nivel raíz del JWT de Supabase Auth es el ROL DE
-- POSTGRES (siempre 'authenticated' para cualquier usuario logueado,
-- admin o no) — NUNCA el rol de negocio. El rol de negocio real vive
-- en `app_metadata.role`, como se usa correctamente en todas las
-- demás policies del proyecto.
--
-- Efecto práctico: esta condición NUNCA es verdadera para ningún
-- usuario real → los 3 UPDATE/INSERT/DELETE en catalogo,
-- config_precios y billeteras están bloqueados por RLS para TODOS,
-- incluido el admin real. app/admin-precios.html:451 no revisa el
-- caso de error (`if (!error) {...}` sin rama else) — el admin no
-- ve ningún mensaje de fallo, el precio simplemente no se actualiza
-- en la base de datos aunque el toast de "guardado" no aparezca.
-- ============================================================

DROP POLICY IF EXISTS "admin_write_catalogo" ON catalogo;
CREATE POLICY "admin_write_catalogo" ON catalogo FOR ALL TO authenticated USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
) WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
);

DROP POLICY IF EXISTS "admin_write_config" ON config_precios;
CREATE POLICY "admin_write_config" ON config_precios FOR ALL TO authenticated USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
) WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
);

-- billeteras: tabla legacy, nunca llegó a crearse en producción (el
-- wallet real vive en creditos_cliente) — se aplica solo si existe.
DO $$
BEGIN
  IF to_regclass('public.billeteras') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "admin_billeteras" ON billeteras';
    EXECUTE $q$CREATE POLICY "admin_billeteras" ON billeteras FOR ALL TO authenticated USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
    ) WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
    )$q$;
  END IF;
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como admin logueado en app/admin-precios.html, cambiar un precio
-- y guardar — debe aparecer el toast "Precio actualizado" Y el
-- cambio debe persistir tras recargar la página (antes del patch,
-- el toast podía no aparecer o el valor volvía al original al
-- recargar, indicando que el UPDATE nunca se aplicó).
-- ============================================================

-- ############################################################
-- # 4/12 — RPCs REPORTES ADMIN EXPUESTAS
-- ############################################################
-- ============================================================
-- PRODIGY — Restringir RPCs de reportes admin a staff real
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-03): las 4 funciones de
-- sql/rpc-reportes-admin.sql (nombradas explícitamente "reportes ADMIN")
-- estaban otorgadas a `authenticated` sin ninguna verificación de rol.
-- Cualquier doctor con sesión podía llamar:
--   - prodigy_top_doctores(): ranking de TODOS los doctores por volumen
--     de pedidos e INGRESOS — inteligencia de negocio competitiva real
--     (qué clínicas son las más grandes, cuánto gastan, cuándo compraron
--     por última vez).
--   - prodigy_ingresos_por_dia(): ingresos totales diarios de PRODIGY.
--   - prodigy_pedidos_por_material() / prodigy_conversion_por_flujo():
--     desglose financiero y operativo completo del negocio.
--
-- Se agrega verificación de rol admin/staff DENTRO de cada función
-- (SECURITY DEFINER ya bypassa RLS de `pedidos`, así que la única
-- protección real es esta verificación interna).
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_pedidos_por_material(p_dias int DEFAULT 30)
RETURNS TABLE(material text, total bigint, ingresos numeric, pct_total numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _total bigint;
BEGIN
  IF NOT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT COUNT(*) INTO _total FROM public.pedidos
  WHERE negocio='prodigy' AND created_at > now() - (p_dias||' days')::interval;
  RETURN QUERY
  SELECT
    COALESCE(p.material, p.servicio, 'otro') AS material,
    COUNT(*) AS total,
    SUM(COALESCE(p.total::numeric, p.precio_total::numeric, 0)) AS ingresos,
    CASE WHEN _total > 0 THEN ROUND(COUNT(*)::numeric/_total*100,1) ELSE 0 END AS pct_total
  FROM public.pedidos p
  WHERE p.negocio='prodigy'
    AND p.created_at > now() - (p_dias||' days')::interval
  GROUP BY COALESCE(p.material, p.servicio, 'otro')
  ORDER BY total DESC LIMIT 15;
END;
$$;

CREATE OR REPLACE FUNCTION public.prodigy_ingresos_por_dia(p_dias int DEFAULT 30)
RETURNS TABLE(fecha date, pedidos bigint, ingresos numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN QUERY
  SELECT
    DATE(p.created_at) AS fecha,
    COUNT(*) AS pedidos,
    SUM(COALESCE(p.total::numeric, p.precio_total::numeric, 0)) AS ingresos
  FROM public.pedidos p
  WHERE p.negocio='prodigy'
    AND p.created_at > now() - (p_dias||' days')::interval
  GROUP BY DATE(p.created_at)
  ORDER BY fecha DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.prodigy_conversion_por_flujo(p_dias int DEFAULT 30)
RETURNS TABLE(flujo text, pedidos bigint, entregados bigint, tasa_entrega numeric, ingreso_promedio numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(p.flujo,'otro') AS flujo,
    COUNT(*) AS pedidos,
    COUNT(*) FILTER (WHERE p.estado_operativo IN ('ENTREGADO','LISTO_DESPACHAR')) AS entregados,
    CASE WHEN COUNT(*)>0 THEN ROUND(COUNT(*) FILTER (WHERE p.estado_operativo IN ('ENTREGADO','LISTO_DESPACHAR'))::numeric/COUNT(*)*100,1) ELSE 0 END AS tasa_entrega,
    ROUND(AVG(COALESCE(p.total::numeric, p.precio_total::numeric, 0)),0) AS ingreso_promedio
  FROM public.pedidos p
  WHERE p.negocio='prodigy'
    AND p.created_at > now() - (p_dias||' days')::interval
  GROUP BY COALESCE(p.flujo,'otro')
  ORDER BY pedidos DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.prodigy_top_doctores(p_dias int DEFAULT 90, p_limit int DEFAULT 10)
RETURNS TABLE(doctor text, pedidos bigint, ingresos numeric, ultimo_pedido date)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(p.doctor, p.nombre_doctor, 'Anónimo') AS doctor,
    COUNT(*) AS pedidos,
    SUM(COALESCE(p.total::numeric, p.precio_total::numeric, 0)) AS ingresos,
    MAX(DATE(p.created_at)) AS ultimo_pedido
  FROM public.pedidos p
  WHERE p.negocio='prodigy'
    AND p.created_at > now() - (p_dias||' days')::interval
  GROUP BY COALESCE(p.doctor, p.nombre_doctor, 'Anónimo')
  ORDER BY ingresos DESC LIMIT p_limit;
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como doctor logueado (no admin), esto debe fallar con "No autorizado":
--   SELECT * FROM prodigy_top_doctores();
-- Como admin, debe seguir funcionando normal (usado en panel-interno-operaciones.html).
-- ============================================================

-- ############################################################
-- # 5/12 — RPCs DASHBOARD FINANCIERO EXPUESTAS
-- ############################################################
-- ============================================================
-- PRODIGY — Restringir RPCs de analytics/dashboard a staff real
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-04): las 6 funciones de
-- sql/prodigy-analytics-rpc.sql estaban otorgadas a `authenticated`
-- SIN ninguna verificación de rol dentro de la función:
--
--   prodigy_dashboard_semana() — pedidos/ingresos semana y mes, saldos
--     pendientes, tasa de aprobación — dashboard ejecutivo completo.
--   prodigy_top_servicios(), prodigy_ingresos_semanas(),
--     prodigy_tiempos_entrega(), prodigy_forecast_semana() —
--     desglose financiero y operativo del negocio.
--   alejandro_dashboard() — el equivalente para el negocio de
--     Alejandro, con las mismas cifras (incluye ingresos_mes_usd).
--
-- Cualquier doctor con sesión (de CUALQUIERA de los 2 negocios, ya que
-- comparten el mismo proyecto Supabase) podía llamar cualquiera de
-- estas 6 funciones vía /rest/v1/rpc/... y ver el dashboard financiero
-- completo de ambos negocios.
-- ============================================================

CREATE OR REPLACE FUNCTION prodigy_dashboard_semana()
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    resultado JSON;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    SELECT json_build_object(
        'pedidos_semana',    (SELECT COUNT(*) FROM pedidos WHERE created_at >= NOW() - INTERVAL '7 days'),
        'pedidos_mes',       (SELECT COUNT(*) FROM pedidos WHERE created_at >= NOW() - INTERVAL '30 days'),
        'pedidos_total',     (SELECT COUNT(*) FROM pedidos),
        'ingresos_semana',   (SELECT COALESCE(SUM(precio_total),0) FROM pedidos WHERE pago_estado = 'pago_confirmado' AND created_at >= NOW() - INTERVAL '7 days'),
        'ingresos_mes',      (SELECT COALESCE(SUM(precio_total),0) FROM pedidos WHERE pago_estado = 'pago_confirmado' AND created_at >= NOW() - INTERVAL '30 days'),
        'por_validar',       (SELECT COUNT(*) FROM pedidos WHERE estado_operativo IN ('VALIDACION_PENDIENTE','INCIDENCIA_CLIENTE')),
        'en_produccion',     (SELECT COUNT(*) FROM pedidos WHERE estado_operativo IN ('EN_DISENO','FRESADO_INICIADO','EN_PRODUCCION')),
        'en_revision',       (SELECT COUNT(*) FROM pedidos WHERE estado_operativo = 'REVISION_CLIENTE'),
        'listos_despacho',   (SELECT COUNT(*) FROM pedidos WHERE estado_operativo IN ('QA_APROBADO','LISTO_DESPACHAR')),
        'pagos_pendientes',  (SELECT COUNT(*) FROM pedidos WHERE pago_estado IN ('pendiente','pago_subido') AND estado NOT IN ('cancelado','CANCELADO')),
        'saldos_pendientes', (SELECT COALESCE(SUM(saldo_pendiente_monto),0) FROM pedidos WHERE modalidad_cobro='50_50' AND pago_estado='pago_confirmado'),
        'tasa_aprobacion_1a', (SELECT ROUND(100.0 * COUNT(*) FILTER(WHERE revisiones_usadas = 0 AND diseno_aprobado = true) / NULLIF(COUNT(*) FILTER(WHERE diseno_aprobado = true),0), 1) FROM pedidos_doctor WHERE created_at >= NOW() - INTERVAL '30 days'),
        'calculado_en',      NOW()
    ) INTO resultado;

    RETURN resultado;
END;
$$;

CREATE OR REPLACE FUNCTION prodigy_top_servicios(limite INT DEFAULT 5)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE resultado JSON;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    SELECT json_agg(row_to_json(t)) INTO resultado FROM (
        SELECT
            SPLIT_PART(servicio, '(', 1) AS servicio,
            COUNT(*) AS total,
            ROUND(AVG(precio_total)) AS ticket_promedio
        FROM pedidos
        WHERE created_at >= NOW() - INTERVAL '30 days'
          AND servicio IS NOT NULL
        GROUP BY 1
        ORDER BY total DESC
        LIMIT limite
    ) t;
    RETURN COALESCE(resultado, '[]'::JSON);
END;
$$;

CREATE OR REPLACE FUNCTION prodigy_ingresos_semanas(n_semanas INT DEFAULT 6)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE resultado JSON;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    SELECT json_agg(row_to_json(t)) INTO resultado FROM (
        SELECT
            DATE_TRUNC('week', created_at)::date AS semana,
            COUNT(*) AS pedidos,
            COALESCE(SUM(precio_total) FILTER(WHERE pago_estado='pago_confirmado'), 0) AS ingresos
        FROM pedidos
        WHERE created_at >= NOW() - (n_semanas || ' weeks')::INTERVAL
        GROUP BY 1
        ORDER BY 1 ASC
    ) t;
    RETURN COALESCE(resultado, '[]'::JSON);
END;
$$;

CREATE OR REPLACE FUNCTION prodigy_tiempos_entrega()
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE resultado JSON;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    SELECT json_agg(row_to_json(t)) INTO resultado FROM (
        SELECT
            SPLIT_PART(servicio, '(', 1) AS servicio,
            ROUND(AVG(EXTRACT(EPOCH FROM (timestamp_qa - created_at))/3600)) AS horas_promedio,
            COUNT(*) AS total
        FROM pedidos
        WHERE timestamp_qa IS NOT NULL
          AND created_at >= NOW() - INTERVAL '90 days'
          AND servicio IS NOT NULL
        GROUP BY 1
        HAVING COUNT(*) >= 3
        ORDER BY horas_promedio ASC
        LIMIT 8
    ) t;
    RETURN COALESCE(resultado, '[]'::JSON);
END;
$$;

CREATE OR REPLACE FUNCTION prodigy_forecast_semana()
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE resultado JSON;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    SELECT json_agg(row_to_json(t)) INTO resultado FROM (
        SELECT
            EXTRACT(DOW FROM created_at)::int AS dia_semana,
            TO_CHAR(created_at, 'Day') AS nombre_dia,
            ROUND(AVG(cnt)) AS pedidos_esperados
        FROM (
            SELECT DATE_TRUNC('day', created_at) AS dia, COUNT(*) AS cnt,
                   EXTRACT(DOW FROM created_at) AS dow
            FROM pedidos
            WHERE created_at >= NOW() - INTERVAL '28 days'
            GROUP BY 1, 3
        ) daily
        GROUP BY dia_semana, nombre_dia
        ORDER BY dia_semana
    ) t;
    RETURN COALESCE(resultado, '[]'::JSON);
END;
$$;

CREATE OR REPLACE FUNCTION alejandro_dashboard()
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE resultado JSON;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    SELECT json_build_object(
        'pedidos_semana',     (SELECT COUNT(*) FROM pedidos WHERE negocio='alejandrocadcam' AND created_at >= NOW() - INTERVAL '7 days'),
        'pedidos_mes',        (SELECT COUNT(*) FROM pedidos WHERE negocio='alejandrocadcam' AND created_at >= NOW() - INTERVAL '30 days'),
        'ingresos_mes_usd',   (SELECT COALESCE(SUM(precio_usd),0) FROM pedidos WHERE negocio='alejandrocadcam' AND pago_estado='pago_confirmado' AND created_at >= NOW() - INTERVAL '30 days'),
        'en_diseno',          (SELECT COUNT(*) FROM pedidos WHERE negocio='alejandrocadcam' AND estado='en_diseno'),
        'en_revision',        (SELECT COUNT(*) FROM pedidos WHERE negocio='alejandrocadcam' AND estado='revision'),
        'tasa_aprobacion_1a', (SELECT ROUND(100.0 * COUNT(*) FILTER(WHERE revisiones_usadas=0 AND diseno_aprobado=true) / NULLIF(COUNT(*) FILTER(WHERE diseno_aprobado=true),0),1) FROM pedidos WHERE negocio='alejandrocadcam' AND created_at >= NOW() - INTERVAL '30 days'),
        'calculado_en',       NOW()
    ) INTO resultado;
    RETURN resultado;
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como doctor logueado (no admin), esto debe fallar con "No autorizado":
--   SELECT prodigy_dashboard_semana();
--   SELECT alejandro_dashboard();
-- Como admin, debe seguir devolviendo los datos normalmente.
-- ============================================================

-- ############################################################
-- # 6/12 — RPC INGRESOS POR CANAL EXPUESTA
-- ############################################################
-- ============================================================
-- PRODIGY — Restringir RPC de ingresos por canal a staff real
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Mismo hallazgo que patch-analytics-rpc-authz-2026.sql y
-- patch-reportes-admin-authz-2026.sql: prodigy_ingresos_por_canal()
-- (sql/patch-canal-origen.sql) estaba otorgada a `authenticated` sin
-- verificación de rol — cualquier doctor podía ver el desglose de
-- ingresos por canal de marketing (SEO, WhatsApp, Google Ads, etc.)
-- de todo el negocio.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_ingresos_por_canal(p_dias int DEFAULT 90)
RETURNS TABLE(canal text, pedidos bigint, ingresos numeric, pct_pedidos numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _total bigint;
BEGIN
  IF NOT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator','staff')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT COUNT(*) INTO _total FROM public.pedidos
  WHERE negocio='prodigy' AND created_at > now() - (p_dias||' days')::interval;
  RETURN QUERY
  SELECT
    COALESCE(p.canal_origen,'directo') AS canal,
    COUNT(*) AS pedidos,
    SUM(COALESCE(p.total::numeric, p.precio_total::numeric, 0)) AS ingresos,
    CASE WHEN _total>0 THEN ROUND(COUNT(*)::numeric/_total*100,1) ELSE 0 END AS pct_pedidos
  FROM public.pedidos p
  WHERE p.negocio='prodigy'
    AND p.created_at > now() - (p_dias||' days')::interval
  GROUP BY COALESCE(p.canal_origen,'directo')
  ORDER BY pedidos DESC LIMIT 10;
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como doctor logueado (no admin): SELECT * FROM prodigy_ingresos_por_canal();
-- debe fallar con "No autorizado".
-- ============================================================

-- ############################################################
-- # 7/12 — CREAR TOKEN DE REVISION SIN AUTH (grave)
-- ############################################################
-- ============================================================
-- PRODIGY — Restringir creación de tokens de revisión a staff
-- Ejecutar en: Supabase Dashboard → SQL Editor — URGENTE
--
-- Hallazgo (auditoría 2026-07-04): prodigy_crear_revision_token(uuid)
-- estaba otorgada a CUALQUIER usuario `authenticated`, sin verificar
-- que quien la llama sea staff. Esta función:
--   1) INVALIDA el token vigente de un pedido (UPDATE ... usado=true
--      WHERE pedido_id = p_pedido_id AND NOT usado) — es decir,
--      cualquier doctor podía invalidar el enlace de aprobación real
--      que ya se le envió por email a OTRO doctor.
--   2) Genera un NUEVO token para ESE pedido y lo devuelve al llamador.
--
-- Combinado con prodigy_aprobar_via_token (ya corregida en
-- patch-revision-express-rpc-seguro-2026.sql), esto permitía que
-- cualquier persona con sesión (doctor, o incluso un cliente cualquiera)
-- generara su propio token para el pedido de OTRO doctor y aprobara la
-- fabricación de un diseño que el verdadero doctor nunca revisó.
--
-- Esta función solo debe usarla el operario al subir un diseño nuevo
-- (según su propio comentario de uso en revision-tokens-table.sql).
-- ============================================================

CREATE OR REPLACE FUNCTION prodigy_crear_revision_token(p_pedido_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    nuevo_token text;
BEGIN
    IF NOT (
        (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operario','operator','staff')
        OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
    ) THEN
        RAISE EXCEPTION 'No autorizado';
    END IF;

    -- Invalidar tokens anteriores para este pedido
    UPDATE revision_tokens SET usado = true WHERE pedido_id = p_pedido_id AND NOT usado;

    -- Crear nuevo token (UUID v4 como token seguro)
    nuevo_token := gen_random_uuid()::text || '-' || encode(gen_random_bytes(16), 'hex');

    INSERT INTO revision_tokens (token, pedido_id, expires_at)
    VALUES (nuevo_token, p_pedido_id, NOW() + INTERVAL '7 days');

    RETURN nuevo_token;
END;
$$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como doctor logueado (no operario/admin), esto debe fallar:
--   SELECT prodigy_crear_revision_token('<uuid-de-cualquier-pedido>');
-- Como operario/admin, debe seguir funcionando igual que antes.
-- ============================================================

-- ############################################################
-- # 8/12 — REVOCAR RPCs DE LECTURA (pagos/SLA pendientes)
-- ############################################################
-- ============================================================
-- PRODIGY — Revocar RPCs de lectura interna que exponían datos a cualquier doctor
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría IDOR 2026-07-03): sql/patch-revoke-rpcs-internas.sql
-- (ejecutado 2026-06-12) ya revocó las funciones de ESCRITURA
-- (prodigy_marcar_recordatorio, prodigy_marcar_sla_alerta, prodigy_set_sla)
-- para `authenticated`, pero dejó pasar las 2 funciones de LECTURA
-- equivalentes, que seguían otorgadas a `authenticated`:
--
--   prodigy_pagos_pendientes(p_horas)  — sql/patch-pagos-vencidos.sql
--   prodigy_pedidos_sla_vencido()      — sql/patch-sla-pedidos.sql
--
-- Cualquier doctor con sesión podía llamar estas RPCs vía
-- /rest/v1/rpc/... y obtener el LISTADO COMPLETO de:
--   - todos los pedidos con pago pendiente de TODOS los doctores
--     (nombre, WhatsApp, monto, tiempo de espera)
--   - todos los pedidos con SLA vencido de TODO el negocio
--
-- Ambas son llamadas únicamente desde functions/api/recordatorio-pago.js
-- y functions/api/alerta-sla.js usando SUPABASE_SERVICE_KEY (service_role),
-- que no requiere el GRANT a `authenticated`.
-- ============================================================

DO $$
BEGIN
  IF to_regprocedure('public.prodigy_pagos_pendientes(int)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.prodigy_pagos_pendientes(int) FROM authenticated';
  END IF;
  IF to_regprocedure('public.prodigy_pedidos_sla_vencido()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.prodigy_pedidos_sla_vencido() FROM authenticated';
  END IF;
END $$;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como doctor logueado (no admin), esto debe fallar con "permission denied":
--   SELECT * FROM prodigy_pagos_pendientes(48);
--   SELECT * FROM prodigy_pedidos_sla_vencido();
-- ============================================================

-- ############################################################
-- # 9/12 — REVISION-EXPRESS: TOKENS ENUMERABLES
-- ############################################################
-- ============================================================
-- PRODIGY — Convertir revision-express a RPCs seguras (RLS insuficiente)
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-03):
-- 1) Las políticas RLS de `revision_tokens` (tokens_select_anon,
--    tokens_update_used) solo verifican el ESTADO de la fila (no usado,
--    no vencido) — NO exigen que el cliente conozca el valor exacto del
--    token. Cualquiera sin sesión puede hacer:
--      GET /rest/v1/revision_tokens?select=*
--    y obtener TODOS los tokens válidos + pedido_id de TODOS los casos
--    pendientes de aprobación, sin haber recibido el email. Postgres RLS
--    no puede "exigir" que el cliente incluya un filtro — solo evalúa
--    fila por fila, así que la única forma correcta de proteger un
--    "enlace mágico" es NO exponer la tabla directamente.
-- 2) No existe NINGUNA política que permita al rol `anon` hacer UPDATE
--    en `pedidos_doctor` — es decir, cuando un doctor SIN sesión iniciada
--    hace clic en el enlace de aprobación del email (el caso de uso
--    principal de esta función), el UPDATE en revision-express.html
--    probablemente fallaba silenciosamente con error de RLS.
--
-- Este patch reemplaza el acceso directo a las tablas por 3 funciones
-- SECURITY DEFINER que reciben el token como parámetro obligatorio y
-- hacen toda la operación (validar + marcar usado + actualizar pedido +
-- historial + log) en una sola transacción atómica — sin exponer las
-- tablas a SELECT/UPDATE directo desde anon.
-- ============================================================

-- ── 1. Endurecer RLS de revision_tokens — quitar acceso directo anon ──
DROP POLICY IF EXISTS "tokens_select_anon" ON revision_tokens;
DROP POLICY IF EXISTS "tokens_update_used" ON revision_tokens;
-- tokens_admin_all se mantiene (admin sigue pudiendo auditar la tabla)

-- ── 2. RPC: validar token (solo lectura, para mostrar la página) ──
CREATE OR REPLACE FUNCTION public.prodigy_validar_token_revision(
    p_token text,
    p_pedido_id uuid
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_tok record;
    v_ped record;
BEGIN
    SELECT * INTO v_tok FROM revision_tokens
    WHERE token = p_token AND pedido_id = p_pedido_id
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN json_build_object('ok', false, 'error', 'invalido');
    END IF;
    IF v_tok.usado THEN
        RETURN json_build_object('ok', false, 'error', 'usado');
    END IF;
    IF v_tok.expires_at < NOW() THEN
        RETURN json_build_object('ok', false, 'error', 'expirado');
    END IF;

    SELECT id, codigo, nombre_paciente, servicio, revisiones_usadas, html_diseno_url
    INTO v_ped FROM pedidos_doctor WHERE id = p_pedido_id;

    IF NOT FOUND THEN
        RETURN json_build_object('ok', false, 'error', 'pedido_no_encontrado');
    END IF;

    RETURN json_build_object(
        'ok', true,
        'pedido', json_build_object(
            'id', v_ped.id, 'codigo', v_ped.codigo,
            'nombre_paciente', v_ped.nombre_paciente, 'servicio', v_ped.servicio,
            'revisiones_usadas', v_ped.revisiones_usadas, 'html_diseno_url', v_ped.html_diseno_url
        )
    );
END;
$$;
GRANT EXECUTE ON FUNCTION public.prodigy_validar_token_revision(text, uuid) TO anon, authenticated;

-- ── 3. RPC: aprobar diseño (atómico: valida + marca usado + aprueba) ──
CREATE OR REPLACE FUNCTION public.prodigy_aprobar_via_token(
    p_token text,
    p_pedido_id uuid
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_tok record;
BEGIN
    -- Bloquea la fila para evitar doble-submit concurrente (TOCTOU)
    SELECT * INTO v_tok FROM revision_tokens
    WHERE token = p_token AND pedido_id = p_pedido_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('ok', false, 'error', 'invalido');
    END IF;
    IF v_tok.usado THEN
        RETURN json_build_object('ok', false, 'error', 'usado');
    END IF;
    IF v_tok.expires_at < NOW() THEN
        RETURN json_build_object('ok', false, 'error', 'expirado');
    END IF;

    UPDATE revision_tokens SET usado = true, usado_at = NOW() WHERE id = v_tok.id;

    UPDATE pedidos_doctor SET
        diseno_aprobado    = true,
        estado             = 'aprobado',
        diseno_aprobado_at = NOW()
    WHERE id = p_pedido_id;

    INSERT INTO historial_diseno (pedido_id, tipo, actor, descripcion)
    VALUES (p_pedido_id, 'APROBACION_EXPRESS', 'doctor_email',
            'Diseño aprobado vía enlace de email (revision-express)');

    INSERT INTO logs_incidencias (tipo, severidad, descripcion, resuelta)
    VALUES ('REVISION_EXPRESS_APROBADA', 'INFO',
            format('[REVISION-EXPRESS] Diseño aprobado — pedido: %s', p_pedido_id),
            true);

    RETURN json_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.prodigy_aprobar_via_token(text, uuid) TO anon, authenticated;

-- ── 4. RPC: solicitar cambios (atómico: valida + marca usado + registra) ──
CREATE OR REPLACE FUNCTION public.prodigy_solicitar_cambios_via_token(
    p_token text,
    p_pedido_id uuid,
    p_notas text
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_tok record;
    v_rev int;
    v_notas text;
BEGIN
    SELECT * INTO v_tok FROM revision_tokens
    WHERE token = p_token AND pedido_id = p_pedido_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('ok', false, 'error', 'invalido');
    END IF;
    IF v_tok.usado THEN
        RETURN json_build_object('ok', false, 'error', 'usado');
    END IF;
    IF v_tok.expires_at < NOW() THEN
        RETURN json_build_object('ok', false, 'error', 'expirado');
    END IF;

    v_notas := left(trim(COALESCE(p_notas, '')), 500);
    IF v_notas = '' THEN
        RETURN json_build_object('ok', false, 'error', 'notas_vacias');
    END IF;

    UPDATE revision_tokens SET usado = true, usado_at = NOW() WHERE id = v_tok.id;

    SELECT COALESCE(revisiones_usadas, 0) + 1 INTO v_rev FROM pedidos_doctor WHERE id = p_pedido_id;

    UPDATE pedidos_doctor SET
        estado            = 'revision',
        notas_cambios     = v_notas,
        revisiones_usadas = v_rev
    WHERE id = p_pedido_id;

    INSERT INTO historial_diseno (pedido_id, tipo, actor, descripcion)
    VALUES (p_pedido_id, 'CAMBIOS_EXPRESS', 'doctor_email',
            format('Cambios solicitados vía email: %s', left(v_notas, 100)));

    INSERT INTO logs_incidencias (tipo, severidad, descripcion, resuelta)
    VALUES ('REVISION_EXPRESS_CAMBIOS', 'INFO',
            format('[REVISION-EXPRESS] Cambios solicitados — pedido: %s | rev: %s/2', p_pedido_id, v_rev),
            true);

    RETURN json_build_object('ok', true, 'revisiones_usadas', v_rev);
END;
$$;
GRANT EXECUTE ON FUNCTION public.prodigy_solicitar_cambios_via_token(text, uuid, text) TO anon, authenticated;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Sin sesión (anon key), esto ya NO debe devolver filas:
--   SELECT * FROM revision_tokens; -- vía REST: GET /rest/v1/revision_tokens?select=*
-- Debe devolver 0 filas o error de permisos.
--
-- El flujo normal debe seguir funcionando end-to-end tras actualizar
-- revision-express.html (ver commit de código adjunto a este patch).
-- ============================================================

-- ############################################################
-- # 10/12 — WALLET/CREDITO BUSCADO POR NOMBRE SUPLANTABLE
-- ############################################################
-- ============================================================
-- PRODIGY — Corregir IDOR en consulta de billetera/créditos del cliente
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-03): app/client-panel.html:1167-1169 busca
-- el saldo de crédito del doctor logueado así:
--
--   sb.from('creditos_cliente').select('*')
--     .or(`nombre_doctor.eq.${_nombreDoctor}`)
--
-- donde `_nombreDoctor = user.user_metadata?.nombre || ...`. Dos
-- problemas:
--   1) user_metadata lo edita el propio usuario desde el navegador —
--      cualquiera puede poner su nombre igual al de otro doctor y ver
--      SU saldo/crédito/puntos.
--   2) Aunque nadie lo explote a propósito, nombre_doctor no es único
--      (dos doctores pueden compartir nombre) — riesgo real de mostrar
--      el saldo de la persona equivocada por coincidencia.
--
-- Se agrega una RPC que resuelve la identidad del usuario SOLO a partir
-- de sus propios pedidos ya creados (pedidos.doctor_uid = auth.uid(),
-- protegido por RLS existente) — nunca confía en datos que el cliente
-- pueda editar.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_mi_wallet()
RETURNS TABLE (saldo_cop int, puntos int, nivel text, total_gastado int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_whatsapp text;
BEGIN
    -- Resuelve el whatsapp real del usuario a partir de SUS PROPIOS
    -- pedidos (doctor_uid = auth.uid(), no editable por el cliente)
    SELECT p.whatsapp INTO v_whatsapp
    FROM public.pedidos p
    WHERE p.doctor_uid = auth.uid() AND p.whatsapp IS NOT NULL
    ORDER BY p.created_at DESC
    LIMIT 1;

    IF v_whatsapp IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT c.saldo_cop, c.puntos, c.nivel, c.total_gastado
    FROM public.creditos_cliente c
    WHERE c.whatsapp = v_whatsapp
    LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.prodigy_mi_wallet() TO authenticated;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Como doctor A logueado, cambiar user_metadata.nombre para que
-- coincida con el de otro doctor B (con saldo) y confirmar que
-- prodigy_mi_wallet() sigue devolviendo el saldo de A (o vacío si A
-- no tiene wallet), NUNCA el de B.
-- ============================================================

-- ############################################################
-- # 11/12 — BUCKETS DE STORAGE PUBLICOS + PURGA INCOMPLETA
-- ############################################################
-- ============================================================
-- PRODIGY — Privatizar buckets clínicos + desactivar purga incompleta
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Contexto (auditoría 2026-07-02 / 2026-07-03):
-- 1) Los buckets 'diseno-archivos', 'evidencias-entrega',
--    'prodigy-files', 'dental-cases' y 'pedidos-archivos' son
--    PÚBLICOS. Las URLs se generan con getPublicUrl() en varios
--    paneles → cualquiera con la ruta (predecible por convención de
--    nombre/UUID) puede descargar escaneos STL, fotos de evidencia y
--    documentos de clientes SIN autenticación.
-- 2) El cron 'prodigy-purga-stl-semanal' (trigger-purga-stl-30dias.sql)
--    solo limpia columnas en la tabla `pedidos` — NUNCA borra el
--    archivo real en Storage (SQL no puede llamar la API de Storage
--    directamente). Se reemplaza por una Cloudflare Function +
--    GitHub Action que sí borra el archivo real antes de limpiar BD.
-- ============================================================

-- ── 1. Desactivar el cron incompleto (evita doble limpieza/carrera) ──
--    La purga real ahora la hace functions/api/purgar-stl-storage.js
--    vía GitHub Action semanal (ver .github/workflows/purga-stl-semanal.yml)
SELECT cron.unschedule('prodigy-purga-stl-semanal')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'prodigy-purga-stl-semanal');

-- ── 2. Privatizar bucket 'diseno-archivos' (STL de trabajo, más sensible) ──
UPDATE storage.buckets SET public = false WHERE id = 'diseno-archivos';

DROP POLICY IF EXISTS "diseno_archivos_staff_read"   ON storage.objects;
DROP POLICY IF EXISTS "diseno_archivos_staff_write"  ON storage.objects;
DROP POLICY IF EXISTS "diseno_archivos_staff_delete" ON storage.objects;

-- Lectura: staff (admin/operario) vía app_metadata.role — NUNCA user_metadata
CREATE POLICY "diseno_archivos_staff_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'diseno-archivos'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

CREATE POLICY "diseno_archivos_staff_write" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'diseno-archivos'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

CREATE POLICY "diseno_archivos_staff_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'diseno-archivos'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

-- ── 3. Privatizar bucket 'evidencias-entrega' (firmas/fotos de entrega) ──
UPDATE storage.buckets SET public = false WHERE id = 'evidencias-entrega';

DROP POLICY IF EXISTS "evidencias_staff_read"   ON storage.objects;
DROP POLICY IF EXISTS "evidencias_staff_write"  ON storage.objects;

CREATE POLICY "evidencias_staff_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'evidencias-entrega'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff', 'mensajero')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

CREATE POLICY "evidencias_staff_write" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'evidencias-entrega'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff', 'mensajero')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

-- ── 4. Privatizar bucket 'prodigy-files' (archivos de clientes/doctores) ──
UPDATE storage.buckets SET public = false WHERE id = 'prodigy-files';

DROP POLICY IF EXISTS "prodigy_files_staff_read"  ON storage.objects;
DROP POLICY IF EXISTS "prodigy_files_owner_read"  ON storage.objects;
DROP POLICY IF EXISTS "prodigy_files_write"       ON storage.objects;

-- Lectura: staff siempre, o el propio doctor autenticado si la ruta
-- del archivo empieza con su propio user_id (convención: {user_id}/...)
CREATE POLICY "prodigy_files_staff_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'prodigy-files'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
            OR (storage.foldername(name))[1] = auth.uid()::text
        )
    );

CREATE POLICY "prodigy_files_write" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'prodigy-files'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
            OR (storage.foldername(name))[1] = auth.uid()::text
        )
    );

-- ── 5. Privatizar bucket 'dental-cases' (subida masiva operario-diseno) ──
UPDATE storage.buckets SET public = false WHERE id = 'dental-cases';

DROP POLICY IF EXISTS "dental_cases_staff_read"  ON storage.objects;
DROP POLICY IF EXISTS "dental_cases_staff_write" ON storage.objects;

CREATE POLICY "dental_cases_staff_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'dental-cases'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

CREATE POLICY "dental_cases_staff_write" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'dental-cases'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

-- ── 6. Privatizar bucket 'pedidos-archivos' (flujo-diseno.html — subida de doctores) ──
-- ⚠️ A diferencia de los demás, este bucket recibe uploads de doctores/clientes
--    SIN LOGIN OBLIGATORIO (js/flujo-uploader.js usa uid='anon' si no hay sesión).
--    Se replica el patrón de scanner-uploads: INSERT público restringido por
--    extensión, lectura/borrado solo para staff. No se puede exigir
--    app_metadata.role en el INSERT porque el usuario puede ser anon.
UPDATE storage.buckets SET public = false WHERE id = 'pedidos-archivos';

DROP POLICY IF EXISTS "pedidos_archivos_public_upload" ON storage.objects;
DROP POLICY IF EXISTS "pedidos_archivos_staff_read"     ON storage.objects;
DROP POLICY IF EXISTS "pedidos_archivos_staff_delete"   ON storage.objects;

CREATE POLICY "pedidos_archivos_public_upload" ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (
        bucket_id = 'pedidos-archivos'
        AND name ~* '\.(stl|ply|obj|dcm|zip|jpg|jpeg|png|pdf|3oxz|constructionfile)$'
    );

CREATE POLICY "pedidos_archivos_staff_read" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'pedidos-archivos'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
            OR (storage.foldername(name))[1] = auth.uid()::text
        )
    );

-- js/flujo-uploader.js usa uid='anon' si el doctor no inició sesión (self-service).
-- El propio uploader necesita firmar su URL inmediatamente después de subir
-- (para incluirla en el mensaje de WhatsApp que arma el flujo). Se limita el
-- acceso anon SOLO a la carpeta compartida 'anon/' — las carpetas de usuarios
-- con sesión ({uid}/...) quedan protegidas por la policy anterior, que exige
-- authenticated. Antes de este patch TODO el bucket era público, así que esto
-- sigue siendo una mejora neta (superficie reducida a una sola carpeta).
DROP POLICY IF EXISTS "pedidos_archivos_anon_read" ON storage.objects;
CREATE POLICY "pedidos_archivos_anon_read" ON storage.objects
    FOR SELECT TO anon
    USING (
        bucket_id = 'pedidos-archivos'
        AND (storage.foldername(name))[1] = 'anon'
    );

CREATE POLICY "pedidos_archivos_staff_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'pedidos-archivos'
        AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'operario', 'staff')
            OR auth.email() IN ('jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com')
        )
    );

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT id, public FROM storage.buckets WHERE id IN ('diseno-archivos','evidencias-entrega','prodigy-files','dental-cases','pedidos-archivos','scanner-uploads');
--   → todos deben mostrar public = false
-- SELECT * FROM cron.job WHERE jobname = 'prodigy-purga-stl-semanal';
--   → debe devolver 0 filas (ya desactivado)

-- ============================================================
-- ⚠️ IMPORTANTE — orden de despliegue:
-- Este SQL debe ejecutarse DESPUÉS de desplegar el código que
-- reemplaza getPublicUrl() por createSignedUrl() en los paneles
-- (operario-diseno.html, operator-panel.html, revision-diseno.html,
-- taller.html, mensajero.html, client-panel.html). Si se ejecuta
-- antes, esos paneles mostrarán enlaces rotos hasta el siguiente
-- deploy de Cloudflare Pages.
-- ============================================================

-- ############################################################
-- # 12/12 — INDICES FALTANTES EN PEDIDOS (rendimiento)
-- ############################################################
-- ============================================================
-- PRODIGY — Índices faltantes en `pedidos`
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría rendimiento 2026-07-03): 3 columnas muy
-- consultadas en paneles activos no tienen índice de soporte,
-- forzando sequential scan en una tabla que crece con cada pedido:
--
-- 1) pedidos.email — client-panel.html:1151
--    .eq('email', email).order('created_at', ...)
-- 2) pedidos.hash_seguridad — client-panel.html:1121
--    .eq('hash_seguridad', token)  (login por link mágico)
-- 3) pedidos.created_at — panel-interno-operaciones.html:1607,3760
--    .order('created_at', ...) / .gte('created_at', desde) SIN filtro
--    (el único índice existente que toca created_at es un compuesto
--    canal_origen+negocio+created_at, insuficiente para ORDER BY solo)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_pedidos_email
    ON public.pedidos (email);

CREATE INDEX IF NOT EXISTS idx_pedidos_hash_seguridad
    ON public.pedidos (hash_seguridad)
    WHERE hash_seguridad IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_created_at
    ON public.pedidos (created_at DESC);

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- SELECT indexname FROM pg_indexes WHERE tablename = 'pedidos' AND indexname LIKE 'idx_pedidos_%';
--   → debe incluir idx_pedidos_email, idx_pedidos_hash_seguridad, idx_pedidos_created_at
-- EXPLAIN ANALYZE SELECT * FROM pedidos WHERE email = 'test@test.com' ORDER BY created_at DESC;
--   → debe mostrar "Index Scan" en vez de "Seq Scan"

-- ================================================================
-- FIN DEL SQL MAESTRO — 12/12 patches aplicados
-- ================================================================
SELECT 'SQL MAESTRO 2026-07-04 aplicado completo' AS status;

-- ############################################################
-- # 13/13 (agregado) — FUNNEL/CONVERSION EXPUESTO SIN LOGIN
-- ############################################################
-- ============================================================
-- PRODIGY — Restringir RPCs de funnel/conversión a staff real
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-04): prodigy_funnel() y
-- prodigy_analytics_conversion() (patch-analytics-fix-columns.sql /
-- patch-analytics-grants.sql) estaban otorgadas a `authenticated, anon`
-- — cualquier visitante sin sesión podía ver el embudo de conversión
-- del sitio (visitas → uso de calculadora → pedidos iniciados/completados)
-- y el desglose de eventos de analítica. Menor severidad que los
-- hallazgos financieros de esta sesión (no expone ingresos ni nombres),
-- pero sigue siendo información de negocio sin razón para ser pública.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_funnel(p_negocio text DEFAULT 'prodigy', p_dias int DEFAULT 30)
RETURNS TABLE(etapa text, total bigint, tasa_conversion numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _visitas bigint; _calculadora bigint; _flujo bigint; _pedido bigint;
BEGIN
  IF NOT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operario','operator','staff')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  SELECT COUNT(*) INTO _visitas     FROM public.analytics_events WHERE negocio=p_negocio AND evento='page_view'          AND created_at > now() - (p_dias||' days')::interval;
  SELECT COUNT(*) INTO _calculadora FROM public.analytics_events WHERE negocio=p_negocio AND evento='calculator_use'     AND created_at > now() - (p_dias||' days')::interval;
  SELECT COUNT(*) INTO _flujo       FROM public.analytics_events WHERE negocio=p_negocio AND evento='pedido_creado'      AND created_at > now() - (p_dias||' days')::interval;
  SELECT COUNT(*) INTO _pedido      FROM public.analytics_events WHERE negocio=p_negocio AND evento='pedido_completado'  AND created_at > now() - (p_dias||' days')::interval;
  RETURN QUERY VALUES
    ('Visitas'::text,        _visitas,      100::numeric),
    ('Calculadora'::text,    _calculadora,  CASE WHEN _visitas>0    THEN ROUND(_calculadora::numeric/_visitas*100,1) ELSE 0 END),
    ('Inicia pedido'::text,  _flujo,        CASE WHEN _visitas>0    THEN ROUND(_flujo::numeric/_visitas*100,1)       ELSE 0 END),
    ('Completa pedido'::text,_pedido,       CASE WHEN _flujo>0      THEN ROUND(_pedido::numeric/_flujo*100,1)        ELSE 0 END);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.prodigy_funnel(text,int) FROM anon;

CREATE OR REPLACE FUNCTION public.prodigy_analytics_conversion(p_negocio text DEFAULT 'prodigy', p_dias int DEFAULT 30)
RETURNS TABLE(evento text, total bigint, por_dia numeric, top_pagina text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operario','operator','staff')
    OR (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN QUERY
  SELECT ae.evento, COUNT(*) AS total,
    ROUND(COUNT(*)::numeric / p_dias, 1) AS por_dia,
    MODE() WITHIN GROUP (ORDER BY ae.pagina) AS top_pagina
  FROM public.analytics_events ae
  WHERE ae.negocio = p_negocio AND ae.created_at > now() - (p_dias||' days')::interval
  GROUP BY ae.evento ORDER BY total DESC LIMIT 20;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.prodigy_analytics_conversion(text,int) FROM anon;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Sin sesión (anon key): SELECT * FROM prodigy_funnel();
-- debe fallar con "permission denied" (revocado).
-- ============================================================

SELECT 'Patch 13/13 (funnel) aplicado' AS status;

-- ############################################################
-- # 14/14 (agregado) — NOTIFICACIONES INTERNAS: p_rol del cliente + INSERT/UPDATE abiertos
-- ############################################################
-- ============================================================
-- PRODIGY — Corregir autorización en notificaciones_internas
--
-- Hallazgos (auditoría 2026-07-04):
-- 1. prodigy_mis_notifs(p_dept,p_rol,p_limit) confiaba en el p_rol
--    ENVIADO POR EL CLIENTE para decidir si ve notificaciones admin
--    (incluye tipo 'pago' con monto y doctor). Cualquier autenticado
--    podía llamar rpc('prodigy_mis_notifs',{p_rol:'admin'}) y verlas.
--    Fix: el rol ahora se toma siempre de auth.jwt()->app_metadata.
-- 2. Política "sistema_inserta_notifs" (WITH CHECK true) permitía a
--    CUALQUIER autenticado insertar notificaciones falsas. El trigger
--    real es SECURITY DEFINER y no depende de esta política.
--    Fix: restringir INSERT a roles de staff.
-- 3. Política "staff_marca_leida" (USING true, WITH CHECK true)
--    permitía a cualquier autenticado modificar CUALQUIER columna de
--    CUALQUIER notificación. El único caso de uso real (marcar
--    leída) ya pasa por la RPC prodigy_marcar_notifs_leidas (segura,
--    usa auth.uid()). Fix: eliminar la política de UPDATE directo.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_mis_notifs(
  p_dept text DEFAULT NULL,
  p_rol  text DEFAULT NULL,
  p_limit int DEFAULT 15
)
RETURNS TABLE (
  id uuid, created_at timestamptz, tipo text, prioridad text,
  titulo text, mensaje text, pedido_codigo text, accion_url text,
  es_nueva boolean
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _rol_real text := auth.jwt() -> 'app_metadata' ->> 'role';
BEGIN
  IF _uid IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    n.id, n.created_at, n.tipo, n.prioridad,
    n.titulo, n.mensaje, n.pedido_codigo, n.accion_url,
    NOT (_uid = ANY(n.leida_por)) AS es_nueva
  FROM public.notificaciones_internas n
  WHERE
    (n.destinatario_dept IS NULL OR n.destinatario_dept = p_dept)
    AND (n.destinatario_rol IS NULL OR n.destinatario_rol = _rol_real OR _rol_real IN ('admin','superadmin'))
    AND n.created_at > now() - interval '7 days'
  ORDER BY n.prioridad DESC, n.created_at DESC
  LIMIT p_limit;
END;
$$;

DROP POLICY IF EXISTS "sistema_inserta_notifs" ON public.notificaciones_internas;
CREATE POLICY "staff_inserta_notifs" ON public.notificaciones_internas
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin','superadmin','operario','operator','staff')
  );

DROP POLICY IF EXISTS "staff_marca_leida" ON public.notificaciones_internas;

SELECT 'Patch 14/15 (notificaciones_internas) aplicado' AS status;

-- ############################################################
-- # 15/15 (agregado) — NEWSLETTER: UPDATE anonimo sin filtro (mass-unsubscribe)
-- ############################################################
-- Hallazgo (auditoría 2026-07-04): "unsubscribe_self" (FOR UPDATE TO
-- anon USING(true) WITH CHECK(activo=false)) no filtra por email ni
-- token — cualquier visitante podía desactivar TODOS los suscriptores
-- en una sola llamada. Ya existe newsletter_unsubscribe(p_token)
-- (SECURITY DEFINER, filtra por token real) que cubre el caso legítimo.

DROP POLICY IF EXISTS "unsubscribe_self" ON public.newsletter_subscribers;

SELECT 'Patch 15/16 (newsletter unsubscribe) aplicado' AS status;

-- ############################################################
-- # 16/16 (agregado 2026-07-05) — newsletter_subscribers: constraint inconsistente PRODIGY/Alejandro
-- ############################################################
-- Hallazgo: la tabla compartida newsletter_subscribers tiene una sola
-- constraint real en producción, pero PRODIGY la define como
-- UNIQUE(email) y Alejandro como UNIQUE(email,negocio) en sus
-- respectivos .sql. Efecto: alejandro_newsletter_subscribe() hace
-- ON CONFLICT (email,negocio) — si la constraint real es solo
-- UNIQUE(email), Postgres lanza error en cada suscripción de
-- Alejandro (tragado en silencio por su EXCEPTION WHEN OTHERS THEN
-- NULL). Ademas, newsletter_subscribe() de PRODIGY buscaba por email
-- SIN filtrar negocio, asi que un doctor ya suscrito en PRODIGY nunca
-- quedaba registrado en la lista de Alejandro.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.newsletter_subscribers'::regclass
      AND contype = 'u'
      AND conkey = (SELECT array_agg(attnum) FROM pg_attribute
                    WHERE attrelid = 'public.newsletter_subscribers'::regclass
                      AND attname = 'email')
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE public.newsletter_subscribers DROP CONSTRAINT ' || quote_ident(conname)
      FROM pg_constraint
      WHERE conrelid = 'public.newsletter_subscribers'::regclass
        AND contype = 'u'
        AND conkey = (SELECT array_agg(attnum) FROM pg_attribute
                      WHERE attrelid = 'public.newsletter_subscribers'::regclass
                        AND attname = 'email')
      LIMIT 1
    );
  END IF;
END;
$$;

ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_email_negocio_key UNIQUE (email, negocio);

CREATE OR REPLACE FUNCTION public.newsletter_subscribe(
  p_email      text,
  p_nombre     text DEFAULT NULL,
  p_negocio    text DEFAULT 'prodigy',
  p_fuente     text DEFAULT 'web',
  p_tags       text[] DEFAULT '{}'::text[]
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _existing public.newsletter_subscribers;
BEGIN
  IF p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RETURN json_build_object('ok',false,'error','Email inválido');
  END IF;

  SELECT * INTO _existing FROM public.newsletter_subscribers
    WHERE email = lower(p_email) AND negocio = p_negocio;

  IF FOUND THEN
    IF NOT _existing.activo THEN
      UPDATE public.newsletter_subscribers SET activo=true WHERE email=lower(p_email) AND negocio=p_negocio;
    END IF;
    RETURN json_build_object('ok',true,'status','existing');
  END IF;

  INSERT INTO public.newsletter_subscribers(email,nombre,negocio,fuente,tags)
  VALUES(lower(p_email),p_nombre,p_negocio,p_fuente,p_tags);

  RETURN json_build_object('ok',true,'status','new');
END;
$$;

SELECT 'Patch 16/17 (newsletter negocio unificado) aplicado' AS status;

-- ############################################################
-- # 17/17 (agregado 2026-07-05) — revision-diseno.html: dump completo via anon
-- ############################################################
-- Hallazgo: "anon_diseno_review_select" (pedidos) y "anon_historial_select"
-- (historial_diseno) solo verifican estado de fila, no un id que el cliente
-- deba suplir — cualquiera con la anon key podia volcar TODOS los pedidos
-- con diseno listo (nombre paciente, cotizaciones, notas) sin conocer
-- ningun link especifico. Fix: mover lectura a 2 RPCs SECURITY DEFINER que
-- exigen el UUID exacto (mismo patron que buscar_pedido_publico()), y
-- eliminar los SELECT abiertos de anon. La escritura (7 UPDATE directos en
-- revision-diseno.html) queda documentada como pendiente aparte.

CREATE OR REPLACE FUNCTION public.prodigy_revision_diseno_get(p_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result json;
BEGIN
  SELECT json_build_object(
    'id', p.id, 'codigo', p.codigo, 'nombre_paciente', p.nombre_paciente,
    'material', p.material, 'color_vita', p.color_vita,
    'estado_operativo', p.estado_operativo,
    'html_diseno_url', p.html_diseno_url, 'stl_urls', p.stl_urls,
    'construinfo_url', p.construinfo_url, 'fotos_diseno_urls', p.fotos_diseno_urls,
    'cambios_count', p.cambios_count, 'diseno_aprobado_at', p.diseno_aprobado_at,
    'diseno_disclaimer', p.diseno_disclaimer, 'fabricacion_solicitada', p.fabricacion_solicitada,
    'fabricacion_pagada', p.fabricacion_pagada, 'fabricacion_tipo', p.fabricacion_tipo,
    'servicios_pagados', p.servicios_pagados, 'departamento_actual', p.departamento_actual,
    'pais', p.pais, 'cotizacion_fab_monto', p.cotizacion_fab_monto,
    'cotizacion_fab_estado', p.cotizacion_fab_estado, 'cotizacion_fab_nota', p.cotizacion_fab_nota
  ) INTO result
  FROM public.pedidos p
  WHERE p.id = p_id AND p.html_diseno_url IS NOT NULL;

  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.prodigy_revision_diseno_get(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prodigy_revision_diseno_get(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.prodigy_revision_diseno_historial(p_id uuid)
RETURNS SETOF historial_diseno LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.pedidos WHERE id = p_id AND html_diseno_url IS NOT NULL) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT * FROM public.historial_diseno WHERE pedido_id = p_id ORDER BY created_at ASC;
END;
$$;
REVOKE ALL ON FUNCTION public.prodigy_revision_diseno_historial(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prodigy_revision_diseno_historial(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "anon_diseno_review_select" ON pedidos;
DROP POLICY IF EXISTS "anon_historial_select" ON historial_diseno;

SELECT 'Patch 17/18 (revision-diseno lectura por RPC) aplicado' AS status;

-- ############################################################
-- # 18/18 (agregado 2026-07-05) — revision-diseno.html: escritura anon sin filtro por pedido
-- ############################################################
-- Cierre del riesgo residual de escritura: "anon_diseno_review_update" y
-- "anon_diseno_postaprobacion_update" solo validaban el ESTADO de la fila,
-- no el id — cualquiera con la anon key podia modificar TODOS los pedidos
-- en revision de un golpe (aprobar diseños ajenos, marcar pagos como
-- confirmados). Fix: 8 RPCs que exigen el UUID exacto, revision-diseno.html
-- ya actualizado para llamarlas en vez de UPDATE/INSERT directo.

CREATE OR REPLACE FUNCTION public.prodigy_rd_set_pais(p_id uuid, p_pais text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.pedidos SET pais = p_pais
  WHERE id = p_id AND html_diseno_url IS NOT NULL AND pais IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.prodigy_rd_solicitar_cambio(p_id uuid, p_texto text, p_fotos text[] DEFAULT '{}')
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _cc int;
BEGIN
  SELECT COALESCE(cambios_count,0)+1 INTO _cc FROM public.pedidos
    WHERE id = p_id AND html_diseno_url IS NOT NULL AND estado_operativo = 'REVISION_CLIENTE';
  IF _cc IS NULL THEN RETURN json_build_object('ok',false,'error','Estado inválido'); END IF;

  UPDATE public.pedidos SET estado_operativo='CAMBIOS_SOLICITADOS', cambios_count=_cc, notas_cambios=p_texto
  WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,fotos_urls,metadata)
  VALUES (p_id,'CAMBIO_SOLICITADO','doctor',p_texto,p_fotos,json_build_object('num',_cc,'paga_extra',_cc>2));

  RETURN json_build_object('ok',true,'cambios_count',_cc);
END;
$$;

CREATE OR REPLACE FUNCTION public.prodigy_rd_aprobar(p_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _ts timestamptz := now();
BEGIN
  UPDATE public.pedidos
  SET estado_operativo='DISENO_APROBADO', diseno_disclaimer=true, diseno_aprobado_at=_ts, diseno_aprobado_por='doctor'
  WHERE id = p_id AND html_diseno_url IS NOT NULL AND estado_operativo = 'REVISION_CLIENTE';
  IF NOT FOUND THEN RETURN json_build_object('ok',false,'error','Estado inválido'); END IF;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,metadata)
  VALUES (p_id,'APROBACION','doctor','Diseño aprobado. Cliente autoriza fabricación y acepta condiciones.',json_build_object('aprobado_at',_ts));

  RETURN json_build_object('ok',true,'aprobado_at',_ts);
END;
$$;

CREATE OR REPLACE FUNCTION public.prodigy_rd_confirmar_pago_doctor(p_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _monto numeric; _codigo text;
BEGIN
  SELECT cotizacion_fab_monto, codigo INTO _monto, _codigo FROM public.pedidos
    WHERE id = p_id AND html_diseno_url IS NOT NULL;
  IF NOT FOUND THEN RETURN json_build_object('ok',false,'error','Pedido no encontrado'); END IF;

  UPDATE public.pedidos SET cotizacion_fab_estado = 'pago_confirmado' WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,metadata)
  VALUES (p_id,'FAB_PAGO_DOCTOR','doctor',
    'Doctor indica haber realizado el pago de fabricación. Monto declarado: '||COALESCE(_monto,0)::text,
    json_build_object('monto',_monto));

  INSERT INTO public.logs_incidencias(pedido_id,tipo,severidad,descripcion,resuelta)
  VALUES (p_id,'INFO','INFO','💰 Doctor confirma pago de fabricación — Caso '||COALESCE(_codigo,'')||' — Verificar y enrutar a producción', false);

  RETURN json_build_object('ok',true);
END;
$$;

CREATE OR REPLACE FUNCTION public.prodigy_rd_solicitar_fab_internacional(p_id uuid, p_tipo text, p_pais text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _codigo text;
BEGIN
  SELECT codigo INTO _codigo FROM public.pedidos WHERE id = p_id AND html_diseno_url IS NOT NULL;
  IF NOT FOUND THEN RETURN json_build_object('ok',false,'error','Pedido no encontrado'); END IF;

  UPDATE public.pedidos SET fabricacion_solicitada = true, fabricacion_tipo = p_tipo || '_internacional' WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,metadata)
  VALUES (p_id,'FAB_SOLICITADA','doctor','Solicitud especial de fabricación internacional: '||p_tipo||' — País: '||COALESCE(p_pais,''),
    json_build_object('tipo',p_tipo,'pais',p_pais,'es_internacional',true));

  INSERT INTO public.logs_incidencias(pedido_id,tipo,severidad,descripcion,resuelta)
  VALUES (p_id,'INFO','INFO','🌎 SOLICITUD INTERNACIONAL: Doctor solicita '||p_tipo||' con envío a '||COALESCE(p_pais,'')||' — Caso '||COALESCE(_codigo,'')||'. Requiere cotización y coordinación de envío.', false);

  RETURN json_build_object('ok',true);
END;
$$;

CREATE OR REPLACE FUNCTION public.prodigy_rd_enviar_comprobante(p_id uuid, p_tipo text, p_monto numeric, p_nota text, p_comp_url text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _codigo text;
BEGIN
  SELECT codigo INTO _codigo FROM public.pedidos WHERE id = p_id AND html_diseno_url IS NOT NULL;
  IF NOT FOUND THEN RETURN json_build_object('ok',false,'error','Pedido no encontrado'); END IF;

  UPDATE public.pedidos SET
    fabricacion_solicitada = true, fabricacion_tipo = p_tipo,
    cotizacion_fab_monto = p_monto, cotizacion_fab_estado = 'pago_enviado', cotizacion_fab_nota = p_nota
  WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,fotos_urls,metadata)
  VALUES (p_id,'FAB_PAGO_DOCTOR','doctor', p_nota||' — '||COALESCE(p_monto,0)::text||' — Comprobante adjunto',
    CASE WHEN p_comp_url IS NOT NULL THEN ARRAY[p_comp_url] ELSE '{}'::text[] END,
    json_build_object('tipo',p_tipo,'monto',p_monto,'svc',p_nota));

  INSERT INTO public.logs_incidencias(pedido_id,tipo,severidad,descripcion,resuelta)
  VALUES (p_id,'INFO','INFO','💰 VERIFICAR PAGO: '||p_nota||' '||COALESCE(p_monto,0)::text||' — Caso '||COALESCE(_codigo,'')||' — Ver comprobante: '||COALESCE(p_comp_url,''), false);

  RETURN json_build_object('ok',true);
END;
$$;

CREATE OR REPLACE FUNCTION public.prodigy_rd_confirmar_pago_fab(p_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _codigo text;
BEGIN
  SELECT codigo INTO _codigo FROM public.pedidos WHERE id = p_id AND html_diseno_url IS NOT NULL;
  IF NOT FOUND THEN RETURN json_build_object('ok',false,'error','Pedido no encontrado'); END IF;

  UPDATE public.pedidos SET fabricacion_solicitada = true WHERE id = p_id;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion)
  VALUES (p_id,'FAB_SOLICITADA','doctor','Cliente indica haber realizado pago de fabricación. Pendiente verificación.');

  INSERT INTO public.logs_incidencias(pedido_id,tipo,severidad,descripcion,resuelta)
  VALUES (p_id,'INFO','INFO','Doctor confirma pago de fabricación — Verificar — Caso '||COALESCE(_codigo,''), false);

  RETURN json_build_object('ok',true);
END;
$$;

CREATE OR REPLACE FUNCTION public.prodigy_rd_log(p_id uuid, p_tipo text, p_desc text, p_fotos text[] DEFAULT '{}')
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _actor text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.pedidos WHERE id = p_id AND html_diseno_url IS NOT NULL) THEN
    RETURN json_build_object('ok',false,'error','Pedido no encontrado');
  END IF;
  IF p_tipo NOT IN ('NOTA_DOCTOR','DESCARGA','DESCARGA_DISPONIBLE') THEN
    RETURN json_build_object('ok',false,'error','Tipo no permitido');
  END IF;
  _actor := CASE WHEN p_tipo = 'DESCARGA_DISPONIBLE' THEN 'sistema' ELSE 'doctor' END;

  INSERT INTO public.historial_diseno(pedido_id,tipo,actor,descripcion,fotos_urls)
  VALUES (p_id, p_tipo, _actor, p_desc, p_fotos);

  IF p_tipo = 'DESCARGA' THEN
    INSERT INTO public.logs_incidencias(pedido_id,tipo,severidad,descripcion,resuelta)
    SELECT p_id,'INFO','INFO','Doctor descargó archivos: '||p_desc||' — Caso '||COALESCE(codigo,''), true
    FROM public.pedidos WHERE id = p_id;
  END IF;

  RETURN json_build_object('ok',true);
END;
$$;

REVOKE ALL ON FUNCTION public.prodigy_rd_set_pais(uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_solicitar_cambio(uuid,text,text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_aprobar(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_confirmar_pago_doctor(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_solicitar_fab_internacional(uuid,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_enviar_comprobante(uuid,text,numeric,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_confirmar_pago_fab(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prodigy_rd_log(uuid,text,text,text[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.prodigy_rd_set_pais(uuid,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_solicitar_cambio(uuid,text,text[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_aprobar(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_confirmar_pago_doctor(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_solicitar_fab_internacional(uuid,text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_enviar_comprobante(uuid,text,numeric,text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_confirmar_pago_fab(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_rd_log(uuid,text,text,text[]) TO anon, authenticated;

DROP POLICY IF EXISTS "anon_diseno_review_update" ON pedidos;
DROP POLICY IF EXISTS "anon_diseno_postaprobacion_update" ON pedidos;
DROP POLICY IF EXISTS "anon_historial_insert" ON historial_diseno;

SELECT 'Patch 18/19 (revision-diseno escritura por RPC) aplicado' AS status;

-- ############################################################
-- # 19/19 (agregado 2026-07-05) — obtener_mi_codigo_referido: email suplantable
-- ############################################################
-- Hallazgo: la RPC confiaba en el p_email enviado por el cliente sin
-- validar contra la sesion real -- permitia enumerar/crear codigos de
-- referido a nombre de otros doctores. Los 4 llamadores reales siempre
-- pasan el email de su propia sesion, asi que exigirlo server-side no
-- rompe nada.

CREATE OR REPLACE FUNCTION public.obtener_mi_codigo_referido(p_email text, p_nombre text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_codigo text;
  v_email_real text;
BEGIN
  v_email_real := lower(trim(auth.jwt() ->> 'email'));
  IF v_email_real IS NULL OR v_email_real = '' THEN
    RETURN NULL;
  END IF;

  SELECT codigo INTO v_codigo FROM public.referidos
  WHERE lower(trim(referidor_email)) = v_email_real LIMIT 1;
  IF v_codigo IS NULL THEN
    v_codigo := public.generar_codigo_referido(v_email_real);
    INSERT INTO public.referidos(referidor_email, referidor_nombre, codigo)
    VALUES(v_email_real, p_nombre, v_codigo);
  END IF;
  RETURN v_codigo;
END;
$$;

SELECT 'Patch 19/20 (referidos email suplantable) aplicado' AS status;

-- ############################################################
-- # 20/20 (agregado 2026-07-05) — mensajeros/despachos abiertos a cualquier autenticado
-- ############################################################
-- "admin_all_mensajeros"/"admin_all_despachos" eran USING(true)/CHECK(true)
-- pese al nombre "admin" -- cualquier doctor logueado podia leer/modificar
-- telefono y placa de TODOS los mensajeros, y direcciones/tracking de
-- TODOS los despachos de cualquier pedido.

DROP POLICY IF EXISTS "admin_all_mensajeros" ON mensajeros;
CREATE POLICY "admin_all_mensajeros" ON mensajeros
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

DROP POLICY IF EXISTS "admin_all_despachos" ON despachos;
CREATE POLICY "admin_all_despachos" ON despachos
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

DROP POLICY IF EXISTS "mensajero_own_despachos" ON despachos;
CREATE POLICY "mensajero_own_despachos" ON despachos
    FOR SELECT TO authenticated
    USING (mensajero_id IN (SELECT id FROM mensajeros WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "mensajero_update_own_despachos" ON despachos;
CREATE POLICY "mensajero_update_own_despachos" ON despachos
    FOR UPDATE TO authenticated
    USING (mensajero_id IN (SELECT id FROM mensajeros WHERE user_id = auth.uid()))
    WITH CHECK (mensajero_id IN (SELECT id FROM mensajeros WHERE user_id = auth.uid()));

SELECT 'Patch 20/23 (mensajeros/despachos RLS) aplicado' AS status;

-- ############################################################
-- # 21/23 (agregado 2026-07-05) — citas_escaneo abierta a anon sin sesion
-- ############################################################
DROP POLICY IF EXISTS "anon_upsert_citas" ON citas_escaneo;
CREATE POLICY "admin_all_citas_escaneo" ON citas_escaneo
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

SELECT 'Patch 21/23 (citas_escaneo RLS) aplicado' AS status;

-- ############################################################
-- # 22/23 (agregado 2026-07-05) — clientes/portfolio abiertos a cualquier autenticado
-- ############################################################
DROP POLICY IF EXISTS "admin_all_clientes" ON clientes;
CREATE POLICY "admin_all_clientes" ON clientes
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

DROP POLICY IF EXISTS "admin_write_portfolio" ON portfolio;
CREATE POLICY "admin_write_portfolio" ON portfolio
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

SELECT 'Patch 22/23 (clientes/portfolio RLS) aplicado' AS status;

-- ############################################################
-- # 23/23 (agregado 2026-07-05) — citas_domicilio/solicitudes_scanner/config_plataformas
-- ############################################################
DROP POLICY IF EXISTS "admin_all_citas" ON citas_domicilio;
CREATE POLICY "admin_all_citas" ON citas_domicilio
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

DROP POLICY IF EXISTS "admin_all_scanner" ON solicitudes_scanner;
CREATE POLICY "admin_all_scanner" ON solicitudes_scanner
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

DROP POLICY IF EXISTS "admin_all_config_plataformas" ON config_plataformas;
CREATE POLICY "admin_all_config_plataformas" ON config_plataformas
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    )
    WITH CHECK (
        (auth.jwt() ->> 'email') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com')
        OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','operator')
    );

SELECT 'Patch 23/24 (domicilio/scanner/config RLS) aplicado' AS status;

-- ############################################################
-- # 24/24 (agregado 2026-07-05) — CRITICO: pedidos.flujo/nombre_cliente/nota_calidad/direccion faltantes
-- ############################################################
-- Confirmado en vivo: SELECT count(*) FROM pedidos = 0 filas, nunca ha
-- habido ninguna. Los 4 flujos de creacion de pedidos (diseno, fresado,
-- impresion, lab) y multiples paneles de staff referencian columnas que
-- nunca existieron. La mayoria ya tenian equivalente real (nombre_doctor,
-- telefono, tipo_trabajo, precio_total, stl_url, hash_seguridad) y se
-- corrigieron en el codigo. Estas 4 no tenian equivalente y se agregan
-- como columnas reales porque ya se usan extensamente en codigo existente.

ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS flujo text;
CREATE INDEX IF NOT EXISTS idx_pedidos_flujo ON public.pedidos(flujo);

ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS nombre_cliente text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS nota_calidad text;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS direccion text;

SELECT 'Patch 24/25 (pedidos columnas faltantes) aplicado' AS status;

-- ############################################################
-- # 25/25 (agregado 2026-07-05) — CRITICO: trigger de referidos usaba NEW.doctor (no existe)
-- ############################################################
-- prodigy_detectar_primer_pedido_referido() (se dispara en CADA UPDATE
-- de pago_estado a 'pago_confirmado' Y en cada INSERT con
-- codigo_referido) referenciaba NEW.doctor, columna inexistente (real:
-- nombre_doctor). Confirmar el pago de CUALQUIER pedido con codigo_referido
-- fallaba con "record new has no field doctor" -- la actualizacion de
-- pago_estado se revertia por completo.

CREATE OR REPLACE FUNCTION public.prodigy_detectar_primer_pedido_referido()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email       text;
  v_codigo      text;
  v_cupon       text;
  v_ref_id      uuid;
  v_referidor_email text;
BEGIN
  IF NEW.pago_estado = 'pago_confirmado' AND
     (OLD.pago_estado IS DISTINCT FROM 'pago_confirmado') AND
     NEW.codigo_referido IS NOT NULL THEN

    v_codigo := NEW.codigo_referido;
    v_email  := lower(trim(COALESCE(NEW.email, NEW.nombre_doctor, '')));

    SELECT id, lower(trim(referidor_email)) INTO v_ref_id, v_referidor_email
    FROM public.referidos
    WHERE codigo = v_codigo AND estado IN ('pendiente','registrado')
    LIMIT 1;

    IF v_ref_id IS NOT NULL AND v_referidor_email = v_email AND v_email <> '' THEN
      INSERT INTO public.logs_incidencias(tipo, severidad, descripcion, resuelta)
      VALUES (
        'REFERIDO_AUTO_BLOQUEADO', 'WARN',
        '[REFERIDOS] Intento de auto-referido bloqueado — código: ' || v_codigo ||
        ' | email: ' || v_email || ' | pedido: ' || COALESCE(NEW.codigo, NEW.id::text),
        true
      );
      RETURN NEW;
    END IF;

    IF v_ref_id IS NOT NULL THEN
      v_cupon := public._generar_cupon_credito();

      UPDATE public.referidos SET
        estado         = 'primer_pedido',
        referido_email = COALESCE(referido_email, v_email),
        referido_at    = COALESCE(referido_at, NOW()),
        cupon_credito  = v_cupon,
        cupon_at       = NOW()
      WHERE id = v_ref_id;

      INSERT INTO public.logs_incidencias(tipo, severidad, descripcion, resuelta)
      VALUES (
        'REFERIDO_PRIMER_PEDIDO', 'INFO',
        '[REFERIDOS] Primer pedido confirmado — código: ' || v_codigo ||
        ' | cupón generado: ' || v_cupon ||
        ' | pedido: ' || COALESCE(NEW.codigo, NEW.id::text),
        true
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

SELECT 'Patch 25/26 (referidos trigger columna fantasma) aplicado' AS status;

-- ############################################################
-- # 26/26 (agregado 2026-07-06) — CRITICO: buscar_pedido_publico() usa nonce/servicio (no existen)
-- ############################################################
-- La RPC publica que usa seguimiento-caso.html para que cualquier
-- cliente (sin login) consulte el estado de su pedido por codigo
-- referencia 2 columnas inexistentes ("nonce" bare y "p.servicio").
-- La pagina publica de seguimiento nunca ha podido mostrar un pedido
-- real -- fallaba con "column does not exist" en cada llamada.

CREATE OR REPLACE FUNCTION public.buscar_pedido_publico(
    p_codigo TEXT,
    p_nonce  TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
    v_nonce TEXT;
BEGIN
    SELECT hash_seguridad INTO v_nonce
    FROM pedidos
    WHERE upper(trim(codigo)) = upper(trim(p_codigo))
    LIMIT 1;

    IF v_nonce IS NOT NULL AND p_nonce IS NULL THEN
        RETURN NULL;
    END IF;

    IF v_nonce IS NOT NULL AND p_nonce IS NOT NULL AND v_nonce <> p_nonce THEN
        RETURN NULL;
    END IF;

    SELECT json_build_object(
        'codigo',        p.codigo,
        'servicio',      p.tipo_trabajo,
        'material',      p.material,
        'submaterial',   p.submaterial,
        'color_vita',    p.color_vita,
        'cantidad',      p.cantidad,
        'estado',        p.estado::text,
        'fecha_entrega', p.fecha_entrega,
        'flujo',         p.flujo,
        'created_at',    p.created_at
    )
    INTO result
    FROM pedidos p
    WHERE upper(trim(p.codigo)) = upper(trim(p_codigo))
    LIMIT 1;

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.buscar_pedido_publico(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.buscar_pedido_publico(TEXT, TEXT) TO authenticated;

SELECT 'Patch 26/26 (buscar_pedido_publico columnas) aplicado' AS status;
