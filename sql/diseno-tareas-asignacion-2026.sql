-- ================================================================
-- PRODIGY — Diseño: TAREAS POR ESPECIALIDAD + REPARTO ENTRE TÉCNICOS (armado, APAGADO por defecto)
-- Hoy Alejandro diseña todo: nada cambia mientras diseno_ajustes.tareas_activas = false.
-- Al activarlo (cuando entre el primer técnico):
--   · Cada pedido de diseño se divide en tareas por especialidad (guías / exocad / blender).
--     Ej.: «Guía quirúrgica + Corona» → 2 tareas; el cliente sigue viendo un solo pedido.
--   · Reparto (diseno_ajustes.asignacion):
--       'bolsa'      → la tarea queda libre y el técnico de esa especialidad la «toma».
--       'automatica' → el sistema elige: 1) nómina con cupo (ya se les paga salario) · 2) mismo cliente que antes
--                      · 3) el que tenga menos tareas abiertas; solo técnicos disponibles y con nivel suficiente.
--       'manual'     → la asigna el admin o la secretaria.
--   · Si nadie puede (no hay técnico de esa especialidad), la tarea queda libre para el admin.
--   · Al entregar, la tarea guarda su valor según la tarifa del técnico si es PRESTADOR (nómina = 0).
-- Perfil del técnico (app_metadata, lo pone el admin en «Gestionar usuarios»): roles, vinculacion, nivel (1-3), disponible.
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

-- 1) Ajustes del reparto (una sola fila)
CREATE TABLE IF NOT EXISTS public.diseno_ajustes (
  id             int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  tareas_activas boolean NOT NULL DEFAULT false,
  asignacion     text NOT NULL DEFAULT 'bolsa' CHECK (asignacion IN ('bolsa','automatica','manual')),
  max_abiertas   int NOT NULL DEFAULT 5,     -- cupo por técnico de nómina antes de pasar a prestadores
  horas_alerta   int NOT NULL DEFAULT 2,     -- horas hábiles sin que nadie la tome → alerta al admin
  updated_at     timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.diseno_ajustes (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 2) Tarifas por técnico prestador: por especialidad y complejidad (1 simple · 2 media · 3 compleja), en COP por unidad
CREATE TABLE IF NOT EXISTS public.operarios_tarifas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL,
  especialidad text NOT NULL CHECK (especialidad IN ('guias','exocad','blender')),
  complejidad  int  NOT NULL CHECK (complejidad BETWEEN 1 AND 3),
  valor_cop    numeric(12,2) NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, especialidad, complejidad)
);

-- 3) Tareas de diseño
CREATE TABLE IF NOT EXISTS public.diseno_tareas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio      text NOT NULL DEFAULT 'prodigy',
  pedido_id    uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  especialidad text NOT NULL CHECK (especialidad IN ('guias','exocad','blender')),
  descripcion  text,
  complejidad  int  NOT NULL DEFAULT 1 CHECK (complejidad BETWEEN 1 AND 3),
  unidades     int  NOT NULL DEFAULT 1,
  cliente      text,                                   -- para «mismo cliente, mismo técnico»
  operario_id  uuid,
  estado       text NOT NULL DEFAULT 'libre' CHECK (estado IN ('libre','asignada','entregada','cancelada')),
  valor_cop    numeric(12,2),                          -- se fija al entregar (tarifa del prestador; nómina = 0)
  historial    text,
  asignada_at  timestamptz,
  entregada_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pedido_id, especialidad)
);
CREATE INDEX IF NOT EXISTS idx_diseno_tareas_estado ON public.diseno_tareas (especialidad, estado);
CREATE INDEX IF NOT EXISTS idx_diseno_tareas_operario ON public.diseno_tareas (operario_id, estado);

-- 4) RLS
ALTER TABLE public.diseno_ajustes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operarios_tarifas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseno_tareas     ENABLE ROW LEVEL SECURITY;
-- GRANT explícito (Supabase oct-2026); la seguridad real son las políticas RLS de abajo
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diseno_ajustes, public.operarios_tarifas, public.diseno_tareas TO authenticated;

DROP POLICY IF EXISTS "admin_ajustes_diseno" ON public.diseno_ajustes;
CREATE POLICY "admin_ajustes_diseno" ON public.diseno_ajustes FOR ALL TO authenticated
  USING (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator')
         OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'))
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator')
         OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'));

DROP POLICY IF EXISTS "admin_tarifas" ON public.operarios_tarifas;
CREATE POLICY "admin_tarifas" ON public.operarios_tarifas FOR ALL TO authenticated
  USING (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad')
         OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'))
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','contabilidad')
         OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'));
DROP POLICY IF EXISTS "tecnico_lee_sus_tarifas" ON public.operarios_tarifas;
CREATE POLICY "tecnico_lee_sus_tarifas" ON public.operarios_tarifas FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_tareas_diseno" ON public.diseno_tareas;
CREATE POLICY "admin_tareas_diseno" ON public.diseno_tareas FOR ALL TO authenticated
  USING (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','secretaria')
         OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'))
  WITH CHECK (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','secretaria')
         OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'));
-- El técnico ve sus tareas y las libres de SU especialidad (tomar / entregar / devolver van por las funciones de abajo)
DROP POLICY IF EXISTS "tecnico_ve_tareas" ON public.diseno_tareas;
CREATE POLICY "tecnico_ve_tareas" ON public.diseno_tareas FOR SELECT TO authenticated
  USING (operario_id = auth.uid()
         OR (estado = 'libre' AND COALESCE(auth.jwt() -> 'app_metadata' -> 'roles','[]'::jsonb) ? especialidad));

-- 5) Reglas: qué especialidades y qué complejidad tiene un trabajo (mismas palabras que el panel de diseño)
CREATE OR REPLACE FUNCTION public.diseno_especialidades(t text)
RETURNS text[] LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE r text[] := '{}';
BEGIN
  IF t ~* '(gu[ií]a|planeaci[oó]n preliminar|planificaci[oó]n quir[uú]rgica|implantolog)' THEN r := r || 'guias'::text; END IF;
  IF t ~* '(sonrisa|mock ?up|encerado)' THEN r := r || 'blender'::text; END IF;
  IF t ~* '(corona|puente|carilla|incrustaci|inlay|onlay|pilar|barra|h[ií]brid|full ?arch|f[eé]rula|placa|pr[oó]tesis|implante|provisional|cofia)'
     OR cardinality(r) = 0 THEN r := r || 'exocad'::text; END IF;
  RETURN r;
END;$$;

CREATE OR REPLACE FUNCTION public.diseno_complejidad(t text)
RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN t ~* '(full ?arch|all.?on|barra|h[ií]brid|sobredentadura|arco completo|rehabilitaci)' THEN 3
    WHEN t ~* '(puente|implante|carilla|sonrisa|gu[ií]a|incrustaci|inlay|onlay|pilar)' THEN 2
    ELSE 1 END;
$$;

-- 6) Elegir técnico (regla automática). NULL = no hay nadie disponible → queda libre para el admin
CREATE OR REPLACE FUNCTION public.diseno_elegir_tecnico(p_especialidad text, p_complejidad int, p_cliente text)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
  WITH aj AS (SELECT max_abiertas FROM public.diseno_ajustes WHERE id = 1),
  cand AS (
    SELECT u.id,
           COALESCE(u.raw_app_meta_data ->> 'vinculacion','') AS vinc,
           (SELECT count(*) FROM public.diseno_tareas t WHERE t.operario_id = u.id AND t.estado = 'asignada') AS carga,
           EXISTS (SELECT 1 FROM public.diseno_tareas t WHERE t.operario_id = u.id AND p_cliente IS NOT NULL AND t.cliente = p_cliente) AS afin
      FROM auth.users u
     WHERE COALESCE(u.raw_app_meta_data -> 'roles','[]'::jsonb) ? p_especialidad
       AND COALESCE((u.raw_app_meta_data ->> 'active')::boolean, true)
       AND COALESCE((u.raw_app_meta_data ->> 'disponible')::boolean, true)
       AND COALESCE((u.raw_app_meta_data ->> 'nivel')::int, 1) >= p_complejidad
  )
  SELECT c.id FROM cand c, aj
   ORDER BY (c.vinc = 'nomina' AND c.carga < aj.max_abiertas) DESC, c.afin DESC, c.carga ASC, random()
   LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.diseno_elegir_tecnico(text,int,text) FROM PUBLIC, anon, authenticated;

-- 7) Crear las tareas de un pedido (idempotente) y asignarlas según el modo
CREATE OR REPLACE FUNCTION public.diseno_crear_tareas(p_pedido uuid)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p record; e text; _modo text; _n int := 0; _tec uuid; _id uuid;
BEGIN
  SELECT id, tipo_trabajo, COALESCE(nombre_doctor, email) AS cliente INTO p FROM public.pedidos WHERE id = p_pedido;
  IF p.id IS NULL THEN RETURN 0; END IF;
  SELECT asignacion INTO _modo FROM public.diseno_ajustes WHERE id = 1;
  FOREACH e IN ARRAY public.diseno_especialidades(COALESCE(p.tipo_trabajo,'')) LOOP
    INSERT INTO public.diseno_tareas (pedido_id, especialidad, descripcion, complejidad, cliente)
    VALUES (p.id, e, p.tipo_trabajo, public.diseno_complejidad(COALESCE(p.tipo_trabajo,'')), p.cliente)
    ON CONFLICT (pedido_id, especialidad) DO NOTHING
    RETURNING id INTO _id;
    IF _id IS NOT NULL THEN
      _n := _n + 1;
      IF _modo = 'automatica' THEN
        _tec := public.diseno_elegir_tecnico(e, public.diseno_complejidad(COALESCE(p.tipo_trabajo,'')), p.cliente);
        IF _tec IS NOT NULL THEN
          UPDATE public.diseno_tareas SET operario_id = _tec, estado = 'asignada', asignada_at = now() WHERE id = _id;
        END IF;
      END IF;
    END IF;
    _id := NULL;
  END LOOP;
  RETURN _n;
END;$$;
REVOKE ALL ON FUNCTION public.diseno_crear_tareas(uuid) FROM PUBLIC, anon, authenticated;

-- 8) Al entrar un pedido de diseño: SOLO si está activado. Nunca bloquea la creación del pedido.
CREATE OR REPLACE FUNCTION public.diseno_pedido_tareas()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.flujo = 'diseno' AND COALESCE(NEW.negocio,'prodigy') = 'prodigy'
     AND (SELECT tareas_activas FROM public.diseno_ajustes WHERE id = 1) THEN
    PERFORM public.diseno_crear_tareas(NEW.id);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'diseno_pedido_tareas: %', SQLERRM;
  RETURN NEW;
END;$$;
DROP TRIGGER IF EXISTS trg_diseno_pedido_tareas ON public.pedidos;
CREATE TRIGGER trg_diseno_pedido_tareas AFTER INSERT ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.diseno_pedido_tareas();

-- 9) Acciones del técnico y del admin
CREATE OR REPLACE FUNCTION public.diseno_es_admin()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT COALESCE(auth.jwt() -> 'app_metadata' ->> 'role','') IN ('admin','operator','secretaria')
      OR COALESCE(auth.jwt() ->> 'email','') IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com');
$$;

-- Tomar una tarea libre de mi especialidad (modo bolsa)
CREATE OR REPLACE FUNCTION public.diseno_tomar_tarea(p_tarea uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record;
BEGIN
  SELECT * INTO t FROM public.diseno_tareas WHERE id = p_tarea FOR UPDATE;
  IF t.id IS NULL THEN RETURN json_build_object('ok',false,'error','La tarea no existe'); END IF;
  IF t.estado <> 'libre' THEN RETURN json_build_object('ok',false,'error','Otra persona ya la tomó'); END IF;
  IF NOT (COALESCE(auth.jwt() -> 'app_metadata' -> 'roles','[]'::jsonb) ? t.especialidad) THEN
    RETURN json_build_object('ok',false,'error','No es de tu especialidad'); END IF;
  IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'nivel')::int, 1) < t.complejidad THEN
    RETURN json_build_object('ok',false,'error','Esta tarea requiere un nivel mayor'); END IF;
  UPDATE public.diseno_tareas SET operario_id = auth.uid(), estado = 'asignada', asignada_at = now() WHERE id = p_tarea;
  RETURN json_build_object('ok',true);
END;$$;

-- Devolver una tarea (con motivo): vuelve a la bolsa y se avisa al admin
CREATE OR REPLACE FUNCTION public.diseno_devolver_tarea(p_tarea uuid, p_motivo text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record;
BEGIN
  SELECT * INTO t FROM public.diseno_tareas WHERE id = p_tarea FOR UPDATE;
  IF t.id IS NULL OR (t.operario_id IS DISTINCT FROM auth.uid() AND NOT public.diseno_es_admin()) THEN
    RETURN json_build_object('ok',false,'error','No autorizado'); END IF;
  IF COALESCE(trim(p_motivo),'') = '' THEN RETURN json_build_object('ok',false,'error','Escribe el motivo'); END IF;
  UPDATE public.diseno_tareas
     SET operario_id = NULL, estado = 'libre', asignada_at = NULL,
         historial = COALESCE(historial || E'\n','') || to_char(now() AT TIME ZONE 'America/Bogota','DD/MM HH24:MI') || ' devuelta: ' || left(p_motivo,300)
   WHERE id = p_tarea;
  INSERT INTO public.notificaciones_internas (tipo, prioridad, destinatario_rol, titulo, mensaje, accion_url, leida_por)
  VALUES ('estado_cambio','alta','admin','↩️ Tarea de diseño devuelta', t.descripcion || ' — ' || left(p_motivo,200), '/app/operario-diseno.html', '{}');
  RETURN json_build_object('ok',true);
END;$$;

-- Asignar a mano (admin): p_operario NULL = usar la regla automática
CREATE OR REPLACE FUNCTION public.diseno_asignar_tarea(p_tarea uuid, p_operario uuid DEFAULT NULL)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record; _tec uuid;
BEGIN
  IF NOT public.diseno_es_admin() THEN RETURN json_build_object('ok',false,'error','No autorizado'); END IF;
  SELECT * INTO t FROM public.diseno_tareas WHERE id = p_tarea FOR UPDATE;
  IF t.id IS NULL THEN RETURN json_build_object('ok',false,'error','La tarea no existe'); END IF;
  _tec := COALESCE(p_operario, public.diseno_elegir_tecnico(t.especialidad, t.complejidad, t.cliente));
  IF _tec IS NULL THEN RETURN json_build_object('ok',false,'error','No hay técnicos disponibles para esta tarea'); END IF;
  UPDATE public.diseno_tareas SET operario_id = _tec, estado = 'asignada', asignada_at = now() WHERE id = p_tarea;
  RETURN json_build_object('ok',true,'operario_id',_tec);
END;$$;

-- Entregar: guarda el valor según la tarifa del técnico (prestador); nómina = 0
CREATE OR REPLACE FUNCTION public.diseno_entregar_tarea(p_tarea uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE t record; _vinc text; _tarifa numeric;
BEGIN
  SELECT * INTO t FROM public.diseno_tareas WHERE id = p_tarea FOR UPDATE;
  IF t.id IS NULL OR (t.operario_id IS DISTINCT FROM auth.uid() AND NOT public.diseno_es_admin()) THEN
    RETURN json_build_object('ok',false,'error','No autorizado'); END IF;
  SELECT COALESCE(raw_app_meta_data ->> 'vinculacion','') INTO _vinc FROM auth.users WHERE id = t.operario_id;
  SELECT valor_cop INTO _tarifa FROM public.operarios_tarifas
   WHERE user_id = t.operario_id AND especialidad = t.especialidad AND complejidad = t.complejidad;
  UPDATE public.diseno_tareas
     SET estado = 'entregada', entregada_at = now(),
         valor_cop = CASE WHEN _vinc = 'prestador' THEN COALESCE(_tarifa,0) * t.unidades ELSE 0 END
   WHERE id = p_tarea;
  RETURN json_build_object('ok',true,'valor_cop', CASE WHEN _vinc = 'prestador' THEN COALESCE(_tarifa,0) * t.unidades ELSE 0 END);
END;$$;

REVOKE ALL ON FUNCTION public.diseno_tomar_tarea(uuid), public.diseno_devolver_tarea(uuid,text),
                       public.diseno_asignar_tarea(uuid,uuid), public.diseno_entregar_tarea(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.diseno_tomar_tarea(uuid), public.diseno_devolver_tarea(uuid,text),
                          public.diseno_asignar_tarea(uuid,uuid), public.diseno_entregar_tarea(uuid) TO authenticated;

-- 10) Tareas sin tomar hace más de N horas (para la alerta del admin, cuando se active)
CREATE OR REPLACE FUNCTION public.diseno_tareas_sin_tomar()
RETURNS SETOF public.diseno_tareas LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.* FROM public.diseno_tareas t, public.diseno_ajustes a
   WHERE a.id = 1 AND t.estado = 'libre' AND t.created_at < now() - make_interval(hours => a.horas_alerta);
$$;
REVOKE ALL ON FUNCTION public.diseno_tareas_sin_tomar() FROM PUBLIC, anon, authenticated;

SELECT 'Tareas de diseño y reparto armados (APAGADOS): activar con diseno_ajustes.tareas_activas = true' AS status;
