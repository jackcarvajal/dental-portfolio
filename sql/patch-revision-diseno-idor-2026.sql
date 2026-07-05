-- ============================================================
-- PRODIGY — revision-diseno.html: dump completo de pedidos/historial vía anon
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Hallazgo (auditoría 2026-07-04/05, riesgo residual documentado y ahora
-- corregido en su parte de LECTURA):
--
-- Las políticas "anon_diseno_review_select" (pedidos) y
-- "anon_historial_select" (historial_diseno) solo verifican el ESTADO
-- de la fila (html_diseno_url IS NOT NULL), NO un identificador que el
-- cliente deba suplir. RLS no puede exigir "debes filtrar por id=X" —
-- solo restringe qué filas son visibles cuando SÍ hay una condición.
-- Efecto real: cualquiera con la anon key pública (embebida en
-- cualquier página del sitio) podía hacer, sin sesión:
--   GET /rest/v1/pedidos?select=*&html_diseno_url=not.is.null
-- y volcar TODOS los pedidos con diseño listo — nombre del paciente,
-- servicio, cotizaciones, estado de fabricación, notas — no solo el
-- que corresponde a su propio link. Igual para historial_diseno
-- (notas y descripciones de TODOS los casos).
--
-- Fix (lectura): mover el acceso a 2 RPCs SECURITY DEFINER que exigen
-- el UUID exacto del pedido como parámetro — mismo patrón ya usado en
-- buscar_pedido_publico() (migrate-seguimiento-rpc-v2.sql). Se
-- eliminan las políticas SELECT abiertas de anon en ambas tablas
-- (el UUID de 128 bits sigue siendo la "contraseña" del link, como
-- ya lo era, pero ahora es la ÚNICA vía de acceso, no una capa
-- adicional sobre un SELECT ya abierto).
--
-- NOTA: la escritura (7 UPDATE directos en revision-diseno.html) NO
-- se toca en este patch — requiere refactor más grande y pruebas en
-- vivo por cada acción (aprobar, solicitar cambio, notas, pagos). Se
-- documenta aparte en PENDIENTES.md como riesgo residual.
-- ============================================================

CREATE OR REPLACE FUNCTION public.prodigy_revision_diseno_get(p_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result json;
BEGIN
  SELECT json_build_object(
    'id', p.id, 'codigo', p.codigo, 'nombre_paciente', p.nombre_paciente,
    'servicio', p.servicio, 'material', p.material, 'color_vita', p.color_vita,
    'flujo', p.flujo, 'estado_operativo', p.estado_operativo,
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

-- Eliminar los SELECT abiertos de anon — el acceso de lectura ahora
-- pasa solo por las 2 RPCs de arriba.
DROP POLICY IF EXISTS "anon_diseno_review_select" ON pedidos;
DROP POLICY IF EXISTS "anon_historial_select" ON historial_diseno;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Sin id (anon key): SELECT * FROM pedidos WHERE html_diseno_url IS NOT NULL;
--   → debe devolver 0 filas (política eliminada).
-- Con id real: SELECT prodigy_revision_diseno_get('<uuid-real>');
--   → debe devolver el JSON del pedido, igual que antes.
-- ============================================================

SELECT 'patch-revision-diseno-idor-2026 aplicado' AS status;
