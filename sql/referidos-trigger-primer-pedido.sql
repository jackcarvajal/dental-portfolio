-- PRODIGY — Trigger: detectar primer pedido pagado de un referido
-- Ejecutar en Supabase Dashboard → SQL Editor
-- Requiere que la tabla referidos ya exista (referidos-table.sql ejecutado primero)
--
-- Función: cuando un pedido cambia a pago_confirmado,
-- busca si el doctor tiene un código de referido asociado
-- y actualiza el estado a 'primer_pedido' automáticamente.

CREATE OR REPLACE FUNCTION public.prodigy_detectar_primer_pedido_referido()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_email     text;
  v_ref_row   record;
  v_codigo    text;
BEGIN
  -- Solo actuar cuando pago_estado cambia A 'pago_confirmado'
  IF NEW.pago_estado = 'pago_confirmado' AND
     (OLD.pago_estado IS DISTINCT FROM 'pago_confirmado') THEN

    -- Obtener email del doctor del pedido
    v_email := COALESCE(NEW.email, NEW.doctor);

    -- Buscar código de referido en el pedido
    v_codigo := NEW.codigo_referido;

    IF v_codigo IS NOT NULL THEN
      -- Actualizar referido: primer pedido pagado
      UPDATE public.referidos
      SET estado         = 'primer_pedido',
          referido_email = COALESCE(referido_email, v_email),
          referido_at    = COALESCE(referido_at, NOW())
      WHERE codigo = v_codigo
        AND estado IN ('pendiente', 'registrado');

      -- Registrar en logs para auditoría
      INSERT INTO public.logs_incidencias(tipo, severidad, descripcion, resuelta)
      VALUES (
        'REFERIDO_PRIMER_PEDIDO',
        'INFO',
        '[REFERIDOS] Primer pedido pagado detectado — código: ' || v_codigo ||
        ' | pedido: ' || COALESCE(NEW.codigo, NEW.id::text) ||
        ' | doctor: ' || COALESCE(v_email, '—'),
        true
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Crear el trigger en la tabla pedidos
DROP TRIGGER IF EXISTS trg_referidos_primer_pedido ON public.pedidos;
CREATE TRIGGER trg_referidos_primer_pedido
  AFTER UPDATE OF pago_estado ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.prodigy_detectar_primer_pedido_referido();

-- También ejecutar en INSERT (por si el pedido nace ya con pago_confirmado)
DROP TRIGGER IF EXISTS trg_referidos_primer_pedido_insert ON public.pedidos;
CREATE TRIGGER trg_referidos_primer_pedido_insert
  AFTER INSERT ON public.pedidos
  FOR EACH ROW
  WHEN (NEW.pago_estado = 'pago_confirmado' AND NEW.codigo_referido IS NOT NULL)
  EXECUTE FUNCTION public.prodigy_detectar_primer_pedido_referido();

-- Índice para acelerar la búsqueda por codigo_referido en pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_codigo_referido ON public.pedidos(codigo_referido)
  WHERE codigo_referido IS NOT NULL;
