-- ════════════════════════════════════════════════════════════════════════════════
-- PORTAFOLIO: corrección de títulos y descripciones (24-nov-2026)
-- ════════════════════════════════════════════════════════════════════════════════
-- Problema: varios casos del portafolio (los ven PRODIGY y Alejandro, negocio = 'ambos') tienen errores
-- de texto que restan credibilidad: «Cronas», «All for X», «protipo par aluego», «Rehailitaion»,
-- «zironia», «Carilla inferiores», minúsculas y dobles espacios. Uno de alineadores no tiene tipo.
-- Regla: solo texto (name, description) y el tipo vacío; no toca fotos, archivos ni el orden.
-- Aprobado por Alejandro el 24-nov-2026 (mejora 5 del informe visual).
--
-- 100 % IDEMPOTENTE: se puede correr varias veces, deja siempre el mismo resultado.
-- Copiar TODO → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════════════════════

BEGIN;

UPDATE public.casos_portafolio SET description = 'Carillas superior e inferior: fotos del paciente y solicitud de diseño.'
 WHERE id = 'caso-1777610165861';

UPDATE public.casos_portafolio SET description = 'Coronas anteriores superiores y carillas superior e inferior.'
 WHERE id = 'caso-1784746420922';

UPDATE public.casos_portafolio SET name = 'Rehabilitación completa'
 WHERE id = 'caso-1784764158747';

UPDATE public.casos_portafolio SET name = 'Carillas inferiores', description = 'Carillas inferiores.'
 WHERE id = 'caso-1784764745596';

UPDATE public.casos_portafolio SET name = 'Carillas inferiores', description = 'Carillas inferiores en e.max.'
 WHERE id = 'caso-1784764934142';

UPDATE public.casos_portafolio SET description = 'Carillas superior e inferior en zirconia.'
 WHERE id = 'caso-1784765186703';

UPDATE public.casos_portafolio SET name = 'Coronas sobre implantes e iBar', description = 'Coronas superiores fijas sobre implantes e iBar.'
 WHERE id = 'caso-1784766305902';

UPDATE public.casos_portafolio SET name = 'Carillas', description = 'Carillas superior e inferior.'
 WHERE id = 'caso-1784770215299';

UPDATE public.casos_portafolio SET description = 'Carillas en e.max.'
 WHERE id = 'caso-1784770877222';

UPDATE public.casos_portafolio SET name = 'All-on-X',
       description = 'Prótesis superior e inferior sobre implantes con encía: prototipo y luego barra de titanio con zirconia maquillada.'
 WHERE id = 'caso-1784774716081';

UPDATE public.casos_portafolio SET name = 'Plan de tratamiento: 8 alineadores superiores'
 WHERE id = 'caso-1784823192836';

UPDATE public.casos_portafolio SET name = 'Plan de tratamiento: 13 alineadores superiores y 12 inferiores', type = 'alineadores'
 WHERE id = 'caso-1784823513121';

UPDATE public.casos_portafolio SET name = 'Plan de tratamiento: 10 alineadores inferiores'
 WHERE id = 'caso-1784827436676';

COMMIT;

-- ── VERIFICACIÓN ─────────────────────────────────────────────────────────────
-- Debe dar 0 en «errores_restantes» y 13 en «corregidos».
SELECT
  count(*) FILTER (WHERE name ~* '(cronas|all for x|rehailitaion|carilla inferiores|  )'
                      OR description ~* '(cronas|protipo|aluego|zironia|carilla inferiores)'
                      OR (type = '' AND name ILIKE 'plan de tratamiento%')) AS errores_restantes,
  count(*) FILTER (WHERE id IN ('caso-1777610165861','caso-1784746420922','caso-1784764158747','caso-1784764745596',
                                'caso-1784764934142','caso-1784765186703','caso-1784766305902','caso-1784770215299',
                                'caso-1784770877222','caso-1784774716081','caso-1784823192836','caso-1784823513121',
                                'caso-1784827436676')) AS corregidos
FROM public.casos_portafolio;
