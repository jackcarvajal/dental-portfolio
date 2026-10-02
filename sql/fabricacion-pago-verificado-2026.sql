-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- FABRICACIÓN — que solo el equipo pueda dar un pago por confirmado (auditoría oct-2026)
-- 100 % IDEMPOTENTE · Copiar TODO → SQL Editor → Run
--
-- Hallazgo (revisión de las funciones que la web pública usa sin sesión):
--  1. En la página de revisión, el botón del doctor «ya pagué» (prodigy_rd_confirmar_pago_doctor) dejaba el caso en
--     cotizacion_fab_estado = 'pago_confirmado'. Y el trigger enrutar_diseno_aprobado toma 'pago_confirmado' como
--     PAGADO: si el doctor además aprobaba el diseño, el caso se enrutaba SOLO a producción («Fabricación pagada»)
--     sin que nadie verificara el pago. El panel también lo mostraba como «✅ Pago confirmado».
--  2. prodigy_rd_enviar_comprobante reemplazaba la cotización del laboratorio (cotizacion_fab_monto) por el monto
--     que escribía el doctor.
--  3. Un doctor con sesión podía cambiar directo en su pedido fabricacion_pagada, cotizacion_fab_monto y
--     cotizacion_fab_estado (el trigger de protección no los cuidaba), y al crear el pedido podía mandarlo ya
--     con fabricacion_pagada = true.
--
-- Arreglo (cambios puntuales sobre la definición que está en la base; el resto de cada función queda igual):
--  · «ya pagué» y el comprobante dejan el caso en 'pago_enviado' (= el doctor avisa; el equipo verifica).
--  · El comprobante ya no toca la cotización (el monto declarado queda en el historial y en el aviso).
--  · El trigger de protección impide a un cliente: marcar fabricacion_pagada, cambiar la cotización o poner
--    'pago_confirmado' / 'cotizacion_enviada'. Eso solo lo hace el equipo desde el panel.
--  · Un pedido real nunca nace con la fabricación pagada.
-- El panel (pestaña Fabricación) y la página de revisión ya muestran 'pago_enviado' como «por verificar».
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE f record; def text; nuevo text;
BEGIN
  FOR f IN
    SELECT p.oid, p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN ('prodigy_rd_confirmar_pago_doctor','prodigy_rd_enviar_comprobante',
                         'prodigy_restrict_client_pedido_updates','prodigy_forzar_estado_inicial_pedido')
  LOOP
    def := pg_get_functiondef(f.oid);
    nuevo := def;
    IF f.proname = 'prodigy_rd_confirmar_pago_doctor' THEN
      nuevo := regexp_replace(def, 'cotizacion_fab_estado\s*=\s*''pago_confirmado''', 'cotizacion_fab_estado = ''pago_enviado''', 'g');
    ELSIF f.proname = 'prodigy_rd_enviar_comprobante' THEN
      nuevo := regexp_replace(def, 'cotizacion_fab_monto\s*=\s*p_monto\s*,\s*', '', 'g');
    ELSIF f.proname = 'prodigy_restrict_client_pedido_updates' AND def !~ 'fabricacion_pagada' THEN
      nuevo := regexp_replace(def, '(IF NEW\.user_id IS DISTINCT FROM OLD\.user_id THEN.*?END IF;)', E'\\1\n'
        || E'    -- Fabricación: el pago lo confirma solo el equipo (oct-2026)\n'
        || E'    IF NEW.fabricacion_pagada IS DISTINCT FROM OLD.fabricacion_pagada THEN\n'
        || E'      RAISE EXCEPTION ''PRODIGY_SECURITY: Clientes no pueden marcar la fabricación como pagada''; END IF;\n'
        || E'    IF NEW.cotizacion_fab_monto IS DISTINCT FROM OLD.cotizacion_fab_monto THEN\n'
        || E'      RAISE EXCEPTION ''PRODIGY_SECURITY: Clientes no pueden cambiar la cotización de fabricación''; END IF;\n'
        || E'    IF NEW.cotizacion_fab_estado IS DISTINCT FROM OLD.cotizacion_fab_estado\n'
        || E'       AND NEW.cotizacion_fab_estado IN (''pago_confirmado'',''cotizacion_enviada'') THEN\n'
        || E'      RAISE EXCEPTION ''PRODIGY_SECURITY: Clientes no pueden confirmar el pago de fabricación''; END IF;');
    ELSIF f.proname = 'prodigy_forzar_estado_inicial_pedido' AND def !~ 'fabricacion_pagada' THEN
      nuevo := regexp_replace(def, '(NEW\.timestamp_pago_confirmado\s*:=\s*NULL;)',
        E'\\1\n    NEW.fabricacion_pagada := false;  -- un pedido real nunca nace con la fabricación pagada');
    END IF;
    IF nuevo <> def THEN
      EXECUTE nuevo;
      RAISE NOTICE 'actualizada: %', f.proname;
    END IF;
  END LOOP;
END $$;

-- (No hay que corregir datos: la tabla pedidos aún no tiene casos reales.)

-- ── VERIFICACIÓN ─────────────────────────────────────────────────────────────────────────────────
-- Debe dar las 4 columnas en true
SELECT
  (SELECT prosrc !~ '''pago_confirmado''' FROM pg_proc WHERE proname = 'prodigy_rd_confirmar_pago_doctor')        AS doctor_ya_no_confirma,
  (SELECT prosrc !~ 'cotizacion_fab_monto\s*=\s*p_monto' FROM pg_proc WHERE proname = 'prodigy_rd_enviar_comprobante') AS comprobante_no_toca_cotizacion,
  (SELECT prosrc ~ 'fabricacion_pagada' FROM pg_proc WHERE proname = 'prodigy_restrict_client_pedido_updates')     AS proteccion_fabricacion,
  (SELECT prosrc ~ 'fabricacion_pagada := false' FROM pg_proc WHERE proname = 'prodigy_forzar_estado_inicial_pedido') AS nace_sin_pagar;
