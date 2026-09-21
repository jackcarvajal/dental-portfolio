-- ================================================================
-- LIMPIAR incidencias CSP viejas (dejan de aparecer en "Incidencias Abiertas")
-- Son históricas (~65 días) de cuando hubo un CSP Report-Only de prueba.
-- El CSP actual (_headers) ya permite esos recursos → no rompen nada.
-- Esto solo las marca como resueltas; NO borra el registro.
-- IDEMPOTENTE. Copiar → Supabase SQL Editor → Run.
-- ================================================================

-- Ver cuántas se van a cerrar antes de hacerlo:
SELECT count(*) AS csp_abiertas_a_cerrar
FROM public.logs_incidencias
WHERE tipo = 'CSP_VIOLATION' AND resuelta = false;

-- Marcar como resueltas todas las CSP abiertas de más de 7 días
UPDATE public.logs_incidencias
SET resuelta = true
WHERE tipo = 'CSP_VIOLATION'
  AND resuelta = false
  AND created_at < now() - interval '7 days';

SELECT 'Incidencias CSP viejas marcadas como resueltas' AS status;
