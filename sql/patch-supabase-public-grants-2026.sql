-- ================================================================
-- PRODIGY — Parche: GRANT explícitos schema public
-- Requerido por cambio Supabase (discusión #45329):
--   - 30 mayo 2026:   nuevos proyectos sin exposición default
--   - 30 octubre 2026: tablas nuevas en proyectos existentes
--                      ya no se exponen sin GRANT explícito
--
-- CUÁNDO EJECUTAR:
--   Antes del 30 de octubre de 2026 para garantizar que
--   cualquier tabla nueva funcione sin cambios adicionales.
--
-- INSTRUCCIONES:
--   Dashboard Supabase → SQL Editor → New Query → pegar y ejecutar
-- ================================================================

-- 1. Permisos de uso del schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 2. Todas las tablas actuales del schema public
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- 3. Secuencias (para INSERT con id serial/bigserial)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. Funciones / RPC
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- 5. Privilegios DEFAULT para tablas FUTURAS (clave para el cambio oct 2026)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON ROUTINES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON ROUTINES TO authenticated;

-- ================================================================
-- NOTAS DE SEGURIDAD
-- ================================================================
-- Los GRANTs anteriores NO exponen datos sin control:
--   → La seguridad real sigue siendo RLS (Row Level Security)
--   → GRANT = permiso para intentar acceder
--   → RLS POLICY = qué filas y operaciones son permitidas
--   → Si RLS está habilitado y no hay política → acceso DENEGADO
--
-- Tablas con RLS activo (verificar en Dashboard → Authentication → Policies):
--   pedidos, pagos, clientes, perfiles, push_subscriptions,
--   leads_doctores, casos_portafolio, catalogo, config_precios,
--   comentarios_portafolio, historial_diseno, despachos,
--   inventario_items, inventario_movimientos, lotes_material,
--   staff_departamentos, logs_incidencias, analytics_events,
--   solicitudes_scanner, doctores_perfil, mensajeros, equipo_mantenimiento,
--   billeteras, creditos_cliente, perfiles_fiscales, pedidos_doctor,
--   config_plataformas, citas_domicilio, citas_escaneo, portfolio,
--   lead_sources
--
-- PATRÓN OBLIGATORIO para nuevas tablas (agregar al final de cada migrate-*.sql):
-- ```sql
-- -- Permisos API (RLS controla el acceso real)
-- GRANT ALL ON TABLE public.nombre_tabla TO anon, authenticated;
-- ```
-- ================================================================
