-- ════════════════════════════════════════════════════════════════════════════
-- PLANES DE CRÉDITOS — ESCALERA NUEVA (Alejandro CAD/CAM) · 27-nov-2026
-- ════════════════════════════════════════════════════════════════════════════
-- Problema: los planes de la base eran los del 18-nov (Bronce 50 u = USD 500, Plata 100 u = 950,
--   Oro 250 u = 2.250, Platino 500 u = 4.000 oculto) y Bronce decía «Entrega máximo 24 h», que va
--   contra la regla de nunca prometer «máximo 24 h».
-- Regla de negocio (Alejandro, 27-nov-2026): cada plan baja un dólar por unidad.
--   Bronce   50 u  → USD   600  (USD 12 c/u: sin descuento; paga una vez y cada caso arranca sin esperar pago)
--   Plata   100 u  → USD 1.100  (USD 11 c/u)
--   Oro     200 u  → USD 2.000  (USD 10 c/u) · prioridad + urgencias simples sin recargo
--   Platino 500 u  → USD 4.500  (USD  9 c/u) · todo lo de Oro + lo enviado en la tarde se trabaja a primera hora
--   Urgencias simples sin recargo: ahora solo Oro y Platino (antes también Plata).
-- Hoy no hay ningún lote comprado (creditos_lotes vacío, verificado 27-nov), así que el cambio no afecta a nadie.
-- La definición de creditos_cotizar_pedido es la MISMA de sql/creditos-diseno-2026.sql (también corregida ahí).
--
-- 100 % IDEMPOTENTE. Copiar TODO → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1) Planes (precio y beneficios; el panel calcula solo el precio por unidad)
UPDATE public.creditos_planes SET unidades =  50, precio_usd =  600, publico = true, activo = true, orden = 1,
       beneficios = '["Pagas una sola vez y cada caso arranca sin esperar pago"]'::jsonb
 WHERE negocio = 'alejandrocadcam' AND codigo = 'bronce';
UPDATE public.creditos_planes SET unidades = 100, precio_usd = 1100, publico = true, activo = true, orden = 2,
       beneficios = '["Ahorras USD 100 frente a la unidad suelta"]'::jsonb
 WHERE negocio = 'alejandrocadcam' AND codigo = 'plata';
UPDATE public.creditos_planes SET unidades = 200, precio_usd = 2000, publico = true, activo = true, orden = 3,
       beneficios = '["Ahorras USD 400","Prioridad en la cola","Urgencias simples sin recargo"]'::jsonb
 WHERE negocio = 'alejandrocadcam' AND codigo = 'oro';
UPDATE public.creditos_planes SET unidades = 500, precio_usd = 4500, publico = true, activo = true, orden = 4,
       beneficios = '["Ahorras USD 1.500","Todo lo de Oro","Lo que envías en la tarde se trabaja a primera hora (según cupo)"]'::jsonb
 WHERE negocio = 'alejandrocadcam' AND codigo = 'platino';

-- 2) Nota de la regla de urgencia
UPDATE public.creditos_reglas SET nota = 'Urgencia en caso simple (sin recargo en oro/platino)'
 WHERE negocio = 'alejandrocadcam' AND clave = 'factor_urgente';

-- 3) Cuántos créditos cuesta un pedido: la urgencia simple sin recargo pasa a ser solo de Oro y Platino
CREATE OR REPLACE FUNCTION public.creditos_cotizar_pedido(p_pedido uuid)
RETURNS numeric LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ped pedidos%ROWTYPE; v_neg text; v_u numeric; v_tipo text; v_factor numeric := 1; v_plan text; v_cli uuid;
BEGIN
  SELECT * INTO v_ped FROM pedidos WHERE id = p_pedido;
  IF NOT FOUND THEN RETURN NULL; END IF;
  v_neg  := COALESCE(v_ped.negocio, 'alejandrocadcam');
  v_tipo := lower(COALESCE(v_ped.tipo_trabajo, '') || ' ' || COALESCE(v_ped.pieza, '') || ' ' || COALESCE(v_ped.proceso, ''));
  IF v_tipo ~ '(full|all-on|guia|guía|sonrisa|dsd|planific)' THEN RETURN NULL; END IF;
  v_u := COALESCE(NULLIF(v_ped.unidades, 0), NULLIF(v_ped.cantidad, 0), NULLIF(array_length(v_ped.piezas, 1), 0), 1);
  IF v_tipo ~ '(implant|pilar|abutment)' THEN v_factor := COALESCE(creditos_regla(v_neg, 'factor_implante'), 1.5); END IF;
  IF COALESCE(v_ped.slot_express, false) THEN
    v_cli := COALESCE(v_ped.cliente_id, v_ped.doctor_uid, v_ped.user_id);
    SELECT plan_actual INTO v_plan FROM creditos_estado(v_cli, v_neg);
    IF v_factor = 1 AND v_u <= COALESCE(creditos_regla(v_neg, 'max_unidades_simple'), 3) THEN
      IF COALESCE(v_plan, '') NOT IN ('oro','platino') THEN
        v_factor := v_factor * COALESCE(creditos_regla(v_neg, 'factor_urgente'), 1.5);
      END IF;
    ELSE
      v_factor := v_factor * COALESCE(creditos_regla(v_neg, 'factor_urgente_medio'), 2);
    END IF;
  END IF;
  RETURN round(v_u * v_factor, 2);
END $$;

COMMIT;

-- 4) Verificación — debe dar 4 filas:
--    bronce 50 · 600 · 12.00 | plata 100 · 1100 · 11.00 | oro 200 · 2000 · 10.00 | platino 500 · 4500 · 9.00
--    y la última columna «urgencia_solo_oro_platino» = true en todas.
SELECT codigo, unidades, precio_usd, round(precio_usd / unidades, 2) AS usd_por_unidad, publico, beneficios,
       (SELECT position('NOT IN (''oro'',''platino'')' IN p.prosrc) > 0
          FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public' AND p.proname = 'creditos_cotizar_pedido') AS urgencia_solo_oro_platino
  FROM public.creditos_planes
 WHERE negocio = 'alejandrocadcam'
 ORDER BY orden;
