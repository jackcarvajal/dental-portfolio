-- =====================================================================
-- TABLA pedido_archivos — UN REGISTRO POR ARCHIVO
-- 2026-07-18 · proyecto zgihrwqfyvgyapbwzkvw
--
-- ── EL PROBLEMA ──────────────────────────────────────────────────────
-- Hoy los archivos de un caso viven así:
--   pedidos.stl_url     → texto con TODAS las URLs pegadas por ' | '
--   pedidos.stl_urls    → array de URLs firmadas
--   pedidos.stl_ruta    → una ruta suelta
--   pedidos.fotos_feedback → array de rutas
--
-- Consecuencias reales:
--   · No se sabe cuántos archivos DEBÍAN llegar vs. cuántos llegaron.
--     Cuando el CBCT se perdía en silencio, nada en la base lo delataba.
--   · No se puede preguntar "¿qué pedidos están incompletos?" antes de
--     mandarlos a producción.
--   · No hay nombre, peso ni tipo de cada archivo.
--   · Una foto clínica, una radiografía y un informe PDF son indistinguibles:
--     el operario abre el caso y no sabe cuál imagen es la toma de color y
--     cuál la periapical.
--   · Las URLs firmadas se guardan a 5 años: si se rota la clave del
--     proyecto, mueren todas de golpe.
--
-- ── QUÉ HACE ESTE PARCHE ─────────────────────────────────────────────
-- Crea `pedido_archivos`: una fila por archivo, con su ETAPA (quién lo subió
-- y en qué momento), su TIPO CLÍNICO (escaneo, CBCT, foto, radiografía…),
-- su bucket y su RUTA — no la URL firmada, que se genera al abrir.
--
-- NO migra nada ni borra columnas. Las columnas viejas siguen funcionando:
-- esta tabla se llena en paralelo y se va adoptando sin romper lo existente.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.pedido_archivos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id   uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,

  -- Dónde está el archivo. Se guarda RUTA + BUCKET, nunca la URL firmada:
  -- la URL se genera al momento de abrir y así no caduca ni queda expuesta.
  bucket      text NOT NULL,
  ruta        text NOT NULL,

  -- Qué es
  nombre      text NOT NULL,              -- nombre original, para mostrar
  extension   text,                       -- '.stl', '.zip', …
  peso_bytes  bigint,
  mime        text,

  -- Clasificación clínica — resuelve "¿cuál imagen es la periapical?"
  tipo        text NOT NULL DEFAULT 'otro'
              CHECK (tipo IN (
                'escaneo',        -- STL/PLY/OBJ del intraoral
                'cbct',           -- tomografía (ZIP de DICOM)
                'radiografia',    -- periapical / panorámica
                'foto_clinica',   -- color, sonrisa, intraoral
                'proyecto_cad',   -- .3oxz, .constructioninfo, .dxd
                'libreria',       -- librerías de implantes
                'diagnostico',    -- informe, historia, prescripción
                'diseno',         -- HTML export del diseño
                'stl_final',      -- entregable al doctor
                'comprobante',    -- pago
                'factura',        -- proveedor / DIAN
                'evidencia',      -- entrega, firma, empaque, QA
                'otro'
              )),

  -- En qué momento del ciclo entró
  etapa       text NOT NULL DEFAULT 'cliente_caso'
              CHECK (etapa IN (
                'cliente_caso',       -- el doctor abre el caso
                'cliente_revision',   -- el doctor responde una revisión
                'cliente_pago',       -- comprobante
                'operario_diseno',    -- entrega del diseñador
                'operario_produccion',-- fresado / impresión
                'operario_evidencia'  -- calidad, taller, mensajería, inventario
              )),

  -- Estado de la subida — permite detectar lo que NO llegó
  estado      text NOT NULL DEFAULT 'ok'
              CHECK (estado IN ('ok','fallido','purgado')),
  error_msg   text,                       -- por qué falló, si falló

  subido_por  text,                       -- email o identificador del actor
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedarch_pedido ON public.pedido_archivos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedarch_etapa  ON public.pedido_archivos(pedido_id, etapa);
CREATE INDEX IF NOT EXISTS idx_pedarch_tipo   ON public.pedido_archivos(tipo);
-- Un mismo archivo no debe registrarse dos veces por reintentos de subida
CREATE UNIQUE INDEX IF NOT EXISTS idx_pedarch_unico
  ON public.pedido_archivos(pedido_id, bucket, ruta);

ALTER TABLE public.pedido_archivos ENABLE ROW LEVEL SECURITY;

-- GRANT explícito: obligatorio para tablas nuevas desde el 30-oct-2026
GRANT ALL ON TABLE public.pedido_archivos TO anon, authenticated;

-- ── RLS ───────────────────────────────────────────────────────────────

-- Staff: ve y escribe todo. El rol sale de app_metadata (NUNCA user_metadata,
-- que el propio usuario puede editar desde el navegador).
DROP POLICY IF EXISTS "pedarch_staff_all" ON public.pedido_archivos;
CREATE POLICY "pedarch_staff_all" ON public.pedido_archivos
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN
      ('admin','operator','operario','staff','diseno','fresado','impresion',
       'taller','calidad','contabilidad','mensajero','encargado_inventario')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN
      ('admin','operator','operario','staff','diseno','fresado','impresion',
       'taller','calidad','contabilidad','mensajero','encargado_inventario')
  );

-- El doctor ve solo los archivos de SUS casos.
DROP POLICY IF EXISTS "pedarch_cliente_select" ON public.pedido_archivos;
CREATE POLICY "pedarch_cliente_select" ON public.pedido_archivos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pedidos p
      WHERE p.id = pedido_archivos.pedido_id
        AND (p.user_id = auth.uid() OR p.email = auth.email())
    )
  );

-- El doctor registra los archivos que él mismo sube (etapas de cliente).
DROP POLICY IF EXISTS "pedarch_cliente_insert" ON public.pedido_archivos;
CREATE POLICY "pedarch_cliente_insert" ON public.pedido_archivos
  FOR INSERT TO authenticated
  WITH CHECK (
    etapa IN ('cliente_caso','cliente_revision','cliente_pago')
    AND EXISTS (
      SELECT 1 FROM public.pedidos p
      WHERE p.id = pedido_archivos.pedido_id
        AND (p.user_id = auth.uid() OR p.email = auth.email())
    )
  );

-- Flujo sin sesión: el caso se crea antes de que el doctor tenga cuenta.
DROP POLICY IF EXISTS "pedarch_anon_insert" ON public.pedido_archivos;
CREATE POLICY "pedarch_anon_insert" ON public.pedido_archivos
  FOR INSERT TO anon
  WITH CHECK (etapa = 'cliente_caso');

-- ── VISTA: ¿este caso llegó completo? ────────────────────────────────
-- Responde de un vistazo lo que antes no se podía preguntar.
CREATE OR REPLACE VIEW public.pedidos_archivos_resumen AS
SELECT
  p.id                                        AS pedido_id,
  p.codigo,
  COUNT(a.id)                                 AS total_archivos,
  COUNT(*) FILTER (WHERE a.estado = 'fallido')      AS fallidos,
  COUNT(*) FILTER (WHERE a.tipo = 'escaneo')        AS escaneos,
  COUNT(*) FILTER (WHERE a.tipo = 'cbct')           AS cbct,
  COUNT(*) FILTER (WHERE a.tipo = 'foto_clinica')   AS fotos,
  COUNT(*) FILTER (WHERE a.tipo = 'radiografia')    AS radiografias,
  COUNT(*) FILTER (WHERE a.tipo = 'stl_final')      AS entregables,
  MAX(a.created_at)                           AS ultimo_archivo
FROM public.pedidos p
LEFT JOIN public.pedido_archivos a ON a.pedido_id = p.id
GROUP BY p.id, p.codigo;

GRANT SELECT ON public.pedidos_archivos_resumen TO authenticated;

-- ── VERIFICACIÓN ──────────────────────────────────────────────────────
-- 1) La tabla y la vista existen:
--    SELECT count(*) FROM public.pedido_archivos;
--    SELECT * FROM public.pedidos_archivos_resumen LIMIT 5;
--
-- 2) Las políticas:
--    SELECT policyname FROM pg_policies WHERE tablename = 'pedido_archivos';
--    → deben salir 4.
--
-- 3) Casos sin ningún archivo registrado (útil para detectar subidas rotas):
--    SELECT codigo FROM public.pedidos_archivos_resumen WHERE total_archivos = 0;
--
-- ── NOTA DE ADOPCIÓN ─────────────────────────────────────────────────
-- Esta tabla NO reemplaza todavía a stl_url / stl_urls / stl_ruta / fotos_feedback.
-- Se llena en paralelo desde js/registro-archivos.js. Cuando haya suficiente
-- histórico, se migran las columnas viejas y se deprecian. Migrar de golpe
-- rompería los paneles que hoy leen esas columnas.
