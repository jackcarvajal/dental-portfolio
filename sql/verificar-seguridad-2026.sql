-- ================================================================
-- VERIFICACIÓN DE SEGURIDAD (solo LECTURA — no cambia nada). Auditoría 24-sep-2026.
-- Copiar TODO → Supabase SQL Editor → Run. Resultado: una tabla con OK / REVISAR por cada punto.
-- Sirve para PRODIGY y Alejandro CAD/CAM (mismo proyecto Supabase).
-- ================================================================
WITH chk AS (
  -- 1) Alineadores: ninguna política deja entrar al rol 'diseno'
  SELECT 1 AS n, 'Alineadores: ninguna política menciona el rol diseno' AS punto,
         NOT EXISTS (SELECT 1 FROM pg_policies
                     WHERE tablename IN ('alineadores_casos','alineadores_cargos','alineadores_clientes','alineadores_entregas')
                       AND (coalesce(qual,'') || coalesce(with_check,'')) LIKE '%diseno%') AS ok
  UNION ALL
  SELECT 2, 'Archivos de alineadores: la lectura no incluye diseno',
         NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND policyname='aln_archivos_staff_read'
                       AND coalesce(qual,'') LIKE '%diseno%')
  UNION ALL
  -- 2) Crear / borrar casos: solo políticas de admin (+ el cliente crea el suyo)
  SELECT 3, 'Casos: ya no existe la política FOR ALL (staff_all_aln_casos)',
         NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='alineadores_casos' AND policyname='staff_all_aln_casos')
  UNION ALL
  SELECT 4, 'Casos: INSERT solo admin/operator/contabilidad o el cliente para sí mismo',
         NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='alineadores_casos' AND cmd IN ('INSERT','ALL')
                       AND policyname NOT IN ('aln_casos_crea_admin','cliente_crea_su_caso'))
  UNION ALL
  SELECT 5, 'Casos: DELETE solo admin/operator/contabilidad',
         NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='alineadores_casos' AND cmd IN ('DELETE','ALL')
                       AND policyname <> 'aln_casos_borra_admin')
  UNION ALL
  -- 3) Funciones con el arreglo del NULL
  SELECT 6, 'aln_vincular_cliente compara el rol con COALESCE (cuenta sin rol no pasa)',
         EXISTS (SELECT 1 FROM pg_proc WHERE proname='aln_vincular_cliente' AND prosrc LIKE '%COALESCE(auth.jwt() -> ''app_metadata'' ->> ''role'','''')%')
  UNION ALL
  SELECT 7, 'aln_completar_caso compara el rol con COALESCE',
         EXISTS (SELECT 1 FROM pg_proc WHERE proname='aln_completar_caso' AND prosrc LIKE '%COALESCE(auth.jwt() -> ''app_metadata'' ->> ''role'','''')%')
  UNION ALL
  SELECT 8, 'Ninguna función del esquema public usa "role'') NOT IN" sin COALESCE',
         NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace s ON s.oid=p.pronamespace
                     WHERE s.nspname='public' AND p.prosrc ~ '->>\s*''role''\)\s*NOT IN')
  UNION ALL
  SELECT 9, 'Anónimo NO puede ejecutar aln_vincular_cliente ni aln_completar_caso',
         NOT has_function_privilege('anon','public.aln_vincular_cliente(text,uuid)','EXECUTE')
         AND NOT has_function_privilege('anon','public.aln_completar_caso(uuid)','EXECUTE')
  UNION ALL
  -- 4) Buckets privados y límites
  SELECT 10, 'Bucket alineadores-archivos privado y con límite de 50 MB',
         EXISTS (SELECT 1 FROM storage.buckets WHERE id='alineadores-archivos' AND public=false AND file_size_limit=52428800)
  UNION ALL
  SELECT 11, 'Buckets de comprobantes, capturas y escáneres son privados',
         NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id IN ('alineadores-comprobantes','reportes-capturas','scanner-uploads') AND public=true)
  UNION ALL
  -- 5) Reportes de la web
  SELECT 12, 'reportes_web: RLS activa y sin política de INSERT (solo entra por la función)',
         (SELECT relrowsecurity FROM pg_class WHERE oid='public.reportes_web'::regclass)
         AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reportes_web' AND cmd='INSERT')
  UNION ALL
  SELECT 13, 'reportes_web: el equipo de PRODIGY solo ve negocio prodigy (separación por negocio)',
         EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reportes_web' AND policyname='equipo_gestiona_reportes' AND qual LIKE '%negocio = ''prodigy''%')
  UNION ALL
  -- 6) Tablas nuevas con RLS encendida
  SELECT 14, 'RLS activa en todas las tablas de alineadores y reportes',
         NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace s ON s.oid=c.relnamespace
                     WHERE s.nspname='public' AND c.relkind='r' AND c.relrowsecurity=false
                       AND c.relname IN ('alineadores_casos','alineadores_cargos','alineadores_pagos','alineadores_clientes','alineadores_entregas','reportes_web'))
  UNION ALL
  -- 7) Cuentas
  SELECT 15, 'Cuentas sospechosas eliminadas (sec-prober / skyhack1627)',
         NOT EXISTS (SELECT 1 FROM auth.users WHERE email IN ('sec-prober@example.com','skyhack1627@gmail.com'))
  UNION ALL
  SELECT 16, 'Nadie fuera de los 4 correos admin tiene app_metadata.role = admin',
         NOT EXISTS (SELECT 1 FROM auth.users WHERE raw_app_meta_data->>'role'='admin'
                       AND lower(email) NOT IN ('jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'))
)
SELECT n AS "#", punto, CASE WHEN ok THEN 'OK' ELSE 'REVISAR' END AS resultado FROM chk ORDER BY n;

-- ── Para revisar a ojo: quién tiene acceso de equipo (roles de app_metadata) ──
-- (Ejecuta esta segunda consulta por separado si quieres ver la lista.)
-- SELECT email, raw_app_meta_data->>'role' AS rol_bd, raw_app_meta_data->'roles' AS roles,
--        coalesce(raw_app_meta_data->>'active','true') AS activa, last_sign_in_at
-- FROM auth.users
-- WHERE raw_app_meta_data ? 'role' OR raw_app_meta_data ? 'roles'
-- ORDER BY last_sign_in_at DESC NULLS LAST;
