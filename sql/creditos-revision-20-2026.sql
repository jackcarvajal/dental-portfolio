-- ================================================================
-- CRÉDITOS — Revisión adicional = 20 % (0,2 crédito) desde la tercera
-- Problema: la regla «revision_extra» de Alejandro CAD/CAM estaba en 0,5 crédito (50 % de la unidad),
-- pero la política decidida el 22-nov-2026 es: cada diseño trae 2 revisiones incluidas y, desde la
-- tercera, cada revisión cuesta el 20 % del valor (en planes de créditos: 0,2 crédito por revisión).
-- Los términos, las preguntas frecuentes, la calculadora y el asistente ya dicen 20 %.
-- Solo cambia el VALOR de la regla (una sola fuente de verdad): las funciones creditos_cobrar_revision
-- y creditos_trg_revision ya la leen de creditos_reglas, no hace falta tocarlas.
-- 100 % IDEMPOTENTE. Copiar TODO → Supabase SQL Editor → Run.
-- ================================================================

UPDATE public.creditos_reglas
   SET valor = 0.2,
       nota  = 'Desde la tercera revisión: 20 % del valor de la unidad (22-nov-2026)'
 WHERE negocio = 'alejandrocadcam'
   AND clave   = 'revision_extra'
   AND valor  <> 0.2;

-- Si la regla no existiera (base nueva), se crea con el valor correcto
INSERT INTO public.creditos_reglas (negocio, clave, valor, nota)
VALUES ('alejandrocadcam', 'revision_extra', 0.2, 'Desde la tercera revisión: 20 % del valor de la unidad (22-nov-2026)')
ON CONFLICT (negocio, clave) DO NOTHING;

-- Verificación: debe salir UNA fila con valor = 0.20 y revisiones_incluidas = 2.00
SELECT negocio, clave, valor, nota
  FROM public.creditos_reglas
 WHERE negocio = 'alejandrocadcam'
   AND clave IN ('revision_extra', 'revisiones_incluidas')
 ORDER BY clave;
