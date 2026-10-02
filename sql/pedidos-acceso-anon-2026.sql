-- ═══════════════════════════════════════════════════════════════════════════════════════════════
-- PEDIDOS — cerrar la lectura anónima de la tabla (oct-2026)
-- 100 % IDEMPOTENTE · Copiar TODO → SQL Editor → Run
--
-- Problema: la política "anon_diseno_review_select" deja que CUALQUIERA sin sesión (la anon key es pública)
-- liste TODOS los pedidos en revisión de diseño con TODAS sus columnas: paciente, correo, teléfono, precio,
-- NIT… Hoy no filtra nada porque `pedidos` está vacía, pero con el primer caso real queda expuesto.
-- (patch-revision-diseno-idor-2026 la había quitado; patch-seguridad-roles-pedidos-2026-07 la volvió a crear
-- "reducida" dejando pendiente la solución completa: esta.)
--
-- Quién la usaba: solo «Fabricar desde el diseño aprobado» (flujo-fresado / flujo-impresión con
-- ?from_diseno=UUID) para precargar código, paciente y cantidad de STL. La revisión del diseño ya usa
-- RPCs (prodigy_revision_diseno_get / prodigy_validar_token_revision), no la tabla.
--
-- Arreglo: una función que devuelve SOLO esos 3 datos de UN pedido (por su UUID, que solo tiene quien
-- recibió el enlace) y únicamente si está en revisión/aprobado; y se elimina la política anónima.
-- ═══════════════════════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.pedido_para_fabricar(p_id uuid)
RETURNS json
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object('codigo', codigo, 'nombre_paciente', nombre_paciente, 'stl_urls', COALESCE(stl_urls, '{}'::text[]))
    FROM public.pedidos
   WHERE id = p_id
     AND html_diseno_url IS NOT NULL
     AND estado_operativo IN ('REVISION_CLIENTE','CAMBIOS_SOLICITADOS','DISENO_APROBADO')
   LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.pedido_para_fabricar(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pedido_para_fabricar(uuid) TO anon, authenticated;

-- Ya nadie necesita leer la tabla sin sesión
DROP POLICY IF EXISTS "anon_diseno_review_select" ON public.pedidos;

-- ── Auditoría de lectura anónima (la usa el Panel de pruebas → Seguridad) ─────────────────────────
-- La prueba "como anónimo" no puede saber si una tabla VACÍA está abierta. Esto revisa las POLÍTICAS:
-- tablas que el anónimo puede leer (GRANT) sin RLS, o con una política SELECT para anon/public que no
-- depende de quién eres (auth.uid/jwt/email ni funciones es_*/is_*). Solo responde a un admin.
CREATE OR REPLACE FUNCTION public.auditoria_acceso_anon()
RETURNS TABLE(tabla text, rls_activo boolean, politica text, condicion text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.relname::text, c.relrowsecurity, p.policyname::text, COALESCE(p.qual, '(sin condición)')
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_policies p ON p.schemaname = 'public' AND p.tablename = c.relname AND p.cmd IN ('SELECT','ALL')
         AND p.roles && ARRAY['anon','public']::name[]
         AND COALESCE(p.qual, '') !~* '(auth\.(uid|jwt|email|role)|es_[a-z_]+\(|is_[a-z_]+\()'
   WHERE public.es_admin_lab()
     AND n.nspname = 'public' AND c.relkind = 'r'
     AND (NOT c.relrowsecurity OR p.policyname IS NOT NULL)
     AND has_table_privilege('anon', c.oid, 'SELECT')
   ORDER BY 1, 3;
$$;

REVOKE ALL ON FUNCTION public.auditoria_acceso_anon() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auditoria_acceso_anon() TO authenticated;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────────────────────────────────────
-- Debe dar: politicas_select_anon = 0  ·  funcion_lista = true  ·  anon_puede_llamarla = true  ·  auditoria_lista = true
SELECT
  (SELECT count(*) = 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'auditoria_acceso_anon')            AS auditoria_lista,
  (SELECT count(*) FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pedidos' AND cmd IN ('SELECT','ALL')
      AND roles && ARRAY['anon']::name[])                                          AS politicas_select_anon,
  (SELECT count(*) = 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'pedido_para_fabricar')             AS funcion_lista,
  has_function_privilege('anon', 'public.pedido_para_fabricar(uuid)', 'execute')  AS anon_puede_llamarla;
