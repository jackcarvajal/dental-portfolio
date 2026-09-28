-- ================================================================
-- BITÁCORA AUTOMÁTICA POR CASO + ALARMAS (PRODIGY y Alejandro CAD/CAM: tablas compartidas)
--  1) pedido_bitacora: cada cambio importante de un caso queda registrado SOLO (sin que el
--     técnico tenga que acordarse): creado, etapa, estado, pago, diseño subido, cambios pedidos,
--     aprobado, STL cargado, asignado, fecha de entrega. Con quién lo hizo y cuándo.
--  2) Alarma de modificaciones: 2ª modificación → aviso; 3ª o más → aviso urgente (campana admin).
--  3) Alarma de tiempos: se ARREGLA prodigy_pedidos_sla_vencido (estaba rota: error 42804 por el
--     tipo del estado → la alerta de vencidos nunca funcionó) y sus 3 funciones dejan de poder
--     ejecutarse sin sesión (antes: cualquiera sin login podía cambiar SLA o marcar alertas).
-- La bitácora nunca bloquea: si falla el registro, el caso se guarda igual.
-- 100% IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- ── 1) Tabla ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pedido_bitacora (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  tabla       text NOT NULL,          -- pedidos | pedidos_doctor
  pedido_id   uuid NOT NULL,
  codigo      text,
  negocio     text,
  evento      text NOT NULL,          -- creado | etapa | estado | pago | diseno_subido | cambios | aprobado | archivo | asignado | fecha_entrega
  detalle     text,
  actor_id    uuid,
  actor_email text,
  actor_rol   text
);
CREATE INDEX IF NOT EXISTS idx_pedido_bitacora_caso ON public.pedido_bitacora (pedido_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedido_bitacora_fecha ON public.pedido_bitacora (created_at DESC);
ALTER TABLE public.pedido_bitacora ENABLE ROW LEVEL SECURITY;

-- Lectura: equipo interno (no clientes). Sin políticas de escritura: solo la escribe el trigger.
DROP POLICY IF EXISTS "equipo_lee_bitacora" ON public.pedido_bitacora;
CREATE POLICY "equipo_lee_bitacora" ON public.pedido_bitacora
  FOR SELECT TO authenticated USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN
      ('admin','operator','secretaria','calidad','contabilidad','diseno','taller','fresado','impresion','encargado_inventario','mensajero')
    OR COALESCE(auth.jwt() -> 'app_metadata' -> 'roles','[]'::jsonb) ?| ARRAY['operator','secretaria','calidad','contabilidad','diseno','guias','exocad','blender','taller','fresado','impresion','encargado_inventario','mensajero']
    OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com')
  );

-- ── 2) Trigger genérico (lee las columnas como JSON: sirve aunque una tabla no tenga alguna) ──
CREATE OR REPLACE FUNCTION public.bitacora_pedido()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  n jsonb := to_jsonb(NEW);
  o jsonb;
  _cod text := n->>'codigo';
  _neg text := COALESCE(n->>'negocio','prodigy');
  _email text := auth.jwt() ->> 'email';
  _rol text := COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', CASE WHEN auth.uid() IS NULL THEN 'sistema' ELSE 'client' END);
  _ev text[] := '{}';
  _det text[] := '{}';
  r_new int; r_old int; i int;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.pedido_bitacora (tabla, pedido_id, codigo, negocio, evento, detalle, actor_id, actor_email, actor_rol)
    VALUES (TG_TABLE_NAME, (n->>'id')::uuid, _cod, _neg, 'creado',
            'Caso creado' || COALESCE(' · ' || (n->>'tipo_trabajo'), ''), auth.uid(), _email, _rol);
    RETURN NEW;
  END IF;

  o := to_jsonb(OLD);
  IF (n->>'estado_operativo') IS DISTINCT FROM (o->>'estado_operativo') THEN
    _ev := _ev || 'etapa'::text; _det := _det || ('Etapa: ' || COALESCE(o->>'estado_operativo','—') || ' → ' || COALESCE(n->>'estado_operativo','—'));
  END IF;
  IF (n->>'estado') IS DISTINCT FROM (o->>'estado') THEN
    _ev := _ev || 'estado'::text; _det := _det || ('Estado: ' || COALESCE(o->>'estado','—') || ' → ' || COALESCE(n->>'estado','—'));
  END IF;
  IF (n->>'pago_estado') IS DISTINCT FROM (o->>'pago_estado') THEN
    _ev := _ev || 'pago'::text; _det := _det || ('Pago: ' || COALESCE(o->>'pago_estado','—') || ' → ' || COALESCE(n->>'pago_estado','—'));
  END IF;
  IF ((n->>'html_diseno_url') IS DISTINCT FROM (o->>'html_diseno_url') AND n->>'html_diseno_url' IS NOT NULL)
     OR ((n->>'link_diseno') IS DISTINCT FROM (o->>'link_diseno') AND n->>'link_diseno' IS NOT NULL) THEN
    _ev := _ev || 'diseno_subido'::text; _det := _det || 'Diseño subido para que el doctor lo revise'::text;
  END IF;
  r_new := COALESCE(NULLIF(n->>'revisiones_usadas','')::int, 0);
  r_old := COALESCE(NULLIF(o->>'revisiones_usadas','')::int, 0);
  IF r_new > r_old THEN
    _ev := _ev || 'cambios'::text;
    _det := _det || ('El doctor pidió cambios (modificación ' || r_new || ')' || COALESCE(': ' || left(n->>'notas_cambios', 200), ''));
  END IF;
  IF (n->>'diseno_aprobado') = 'true' AND COALESCE(o->>'diseno_aprobado','false') <> 'true' THEN
    _ev := _ev || 'aprobado'::text; _det := _det || 'El doctor aprobó el diseño'::text;
  END IF;
  IF ((n->>'stl_ruta') IS DISTINCT FROM (o->>'stl_ruta') AND n->>'stl_ruta' IS NOT NULL)
     OR (n->'stl_urls') IS DISTINCT FROM (o->'stl_urls') THEN
    _ev := _ev || 'archivo'::text; _det := _det || 'Archivo STL cargado o actualizado'::text;
  END IF;
  IF (n->>'operario_codigo') IS DISTINCT FROM (o->>'operario_codigo') AND n->>'operario_codigo' IS NOT NULL THEN
    _ev := _ev || 'asignado'::text; _det := _det || ('Asignado a ' || (n->>'operario_codigo'));
  END IF;
  IF (n->>'fecha_entrega') IS DISTINCT FROM (o->>'fecha_entrega') THEN
    _ev := _ev || 'fecha_entrega'::text; _det := _det || ('Fecha de entrega: ' || COALESCE(o->>'fecha_entrega','—') || ' → ' || COALESCE(n->>'fecha_entrega','—'));
  END IF;

  IF array_length(_ev, 1) IS NOT NULL THEN
    FOR i IN 1..array_length(_ev, 1) LOOP
      INSERT INTO public.pedido_bitacora (tabla, pedido_id, codigo, negocio, evento, detalle, actor_id, actor_email, actor_rol)
      VALUES (TG_TABLE_NAME, (n->>'id')::uuid, _cod, _neg, _ev[i], _det[i], auth.uid(), _email, _rol);
    END LOOP;
  END IF;

  -- Alarma de modificaciones (campana del admin)
  IF r_new > r_old AND r_new >= 2 THEN
    INSERT INTO public.notificaciones_internas (tipo, prioridad, destinatario_rol, titulo, mensaje, pedido_codigo, accion_url, leida_por)
    VALUES ('urgente', CASE WHEN r_new >= 3 THEN 'alta' ELSE 'media' END, 'admin',
            CASE WHEN r_new >= 3 THEN '🚨 ' ELSE '⚠️ ' END || 'Caso ' || COALESCE(_cod, '') || ': modificación ' || r_new,
            CASE WHEN r_new >= 3 THEN 'Supera las 2 revisiones incluidas: revisar costo adicional y la calidad del diseño.'
                 ELSE 'Es la última revisión incluida: si pide otra, tiene costo.' END,
            _cod, '/app/ficha-caso.html?id=' || (n->>'id'), '{}');
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;   -- la bitácora nunca bloquea la operación del caso
END;$$;

DROP TRIGGER IF EXISTS trg_bitacora_pedidos ON public.pedidos;
CREATE TRIGGER trg_bitacora_pedidos AFTER INSERT OR UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.bitacora_pedido();

DO $do$
BEGIN
  IF to_regclass('public.pedidos_doctor') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_bitacora_pedidos_doctor ON public.pedidos_doctor';
    EXECUTE 'CREATE TRIGGER trg_bitacora_pedidos_doctor AFTER INSERT OR UPDATE ON public.pedidos_doctor FOR EACH ROW EXECUTE FUNCTION public.bitacora_pedido()';
  END IF;
END
$do$;

-- ── 3) Alarma de tiempos: arreglar la consulta de vencidos y cerrar sus permisos ──
CREATE OR REPLACE FUNCTION public.prodigy_pedidos_sla_vencido()
RETURNS TABLE(
  id uuid, codigo text, doctor text, whatsapp text,
  estado text, estado_operativo text,
  horas_transcurridas numeric, sla_horas_objetivo int
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.codigo::text, p.nombre_doctor::text, p.telefono::text,
    p.estado::text, p.estado_operativo::text,
    ROUND(EXTRACT(EPOCH FROM (now() - p.created_at))/3600, 1) AS horas_transcurridas,
    COALESCE(p.sla_horas_objetivo, 48)::int AS sla_horas_objetivo
  FROM public.pedidos p
  WHERE p.negocio = 'prodigy'
    AND p.estado::text NOT IN ('Despachado','Cancelado','cancelado','Entregado','entregado')
    AND COALESCE(p.estado_operativo,'') NOT IN ('ENTREGADO','LISTO_DESPACHAR','POR_DESPACHAR','EN_REPARTO','CANCELADO_DOCTOR','NO_ENTREGADO')
    AND COALESCE(p.sla_alerta_enviada, false) = false
    AND EXTRACT(EPOCH FROM (now() - p.created_at))/3600 > COALESCE(p.sla_horas_objetivo, 48)
  ORDER BY horas_transcurridas DESC
  LIMIT 20;
END;$$;

-- Solo el servidor (la función programada con la clave de servicio) puede usarlas
REVOKE ALL ON FUNCTION public.prodigy_pedidos_sla_vencido() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prodigy_marcar_sla_alerta(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prodigy_set_sla(text, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prodigy_pedidos_sla_vencido() TO service_role;
GRANT EXECUTE ON FUNCTION public.prodigy_marcar_sla_alerta(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.prodigy_set_sla(text, int) TO service_role;

SELECT 'Bitácora automática + alarmas de modificaciones y de tiempos listas' AS status;
