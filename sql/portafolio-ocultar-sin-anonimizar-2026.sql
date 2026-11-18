-- ════════════════════════════════════════════════════════════════════════════
-- PORTAFOLIO · Ocultar 3 casos cuya portada muestra la cara del paciente sin anonimizar
-- ════════════════════════════════════════════════════════════════════════════
-- Problema: estas 3 portadas salen en la web pública (negocio 'ambos' → PRODIGY y Alejandro,
-- incluida la galería de alejandrocadcam.com/links) con la cara completa del paciente, sin las
-- gafas de marca. Riesgo Habeas Data si no hay autorización escrita del paciente.
--   · caso-1777609389459  «Boca Completa»
--   · caso-1777610165861  «Carillas»
--   · caso-1784746420922  «Rehabilitación Estética»
--
-- Regla: solo se OCULTAN (visible = false). No se borra nada: fotos, datos y orden quedan igual.
-- Para volver a mostrarlos (por ejemplo después de pasarlos por app/anonimizar.html y resubir
-- la portada), se activan otra vez desde el panel: Contenido web → Portafolio → «Publicar».
--
-- 100 % IDEMPOTENTE · Copiar TODO → SQL Editor → Run
-- ════════════════════════════════════════════════════════════════════════════

UPDATE public.casos_portafolio
   SET visible = false
 WHERE id IN ('caso-1777609389459', 'caso-1777610165861', 'caso-1784746420922')
   AND visible IS DISTINCT FROM false;

-- VERIFICACIÓN: deben salir 3 filas, todas con visible = false
SELECT id, name, negocio, visible
  FROM public.casos_portafolio
 WHERE id IN ('caso-1777609389459', 'caso-1777610165861', 'caso-1784746420922')
 ORDER BY id;
