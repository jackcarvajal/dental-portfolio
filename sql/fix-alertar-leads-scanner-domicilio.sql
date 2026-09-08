-- ═══════════════════════════════════════════════════════════════
-- FIX — alertar al staff de leads que hoy caen en un pozo negro
--
-- Problema (audit 2026-09-07): `envia-tu-scanner.html` y `escaner-domicilio.html`
-- guardan el lead en `solicitudes_scanner` / `citas_domicilio`, pero NINGÚN panel
-- lee esas tablas y el único aviso previsto (fetch a la Edge notify-wa) daba 401 →
-- los leads quedaban capturados pero INVISIBLES para el lab.
--
-- Solución: trigger AFTER INSERT que crea una notificación interna (campanita del
-- panel, `notificaciones_internas`) con los datos del lead en el mensaje. Server-side,
-- confiable, independiente del navegador. SECURITY DEFINER → no lo frena la RLS.
--
-- BD compartida → 1 run cubre ambos negocios (el admin es la misma persona).
-- Pegar en Supabase SQL Editor → Run.
-- ═══════════════════════════════════════════════════════════════

-- ── 1) Solicitudes de scanner ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notif_nueva_solicitud_scanner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notificaciones_internas
    (tipo, prioridad, destinatario_rol, destinatario_dept, titulo, mensaje, leida_por, accion_url)
  VALUES
    ('lead', 'media', 'admin', NULL,
     '🖨️ Nueva solicitud de scanner',
     COALESCE(NEW.doctor,'(doctor?)') || ' — ' || COALESCE(NEW.clinica,'sin clínica')
       || ' · ' || COALESCE(NEW.servicio,'?') || ' · WA ' || COALESCE(NEW.whatsapp,'—'),
     '{}', '/app/panel-interno-operaciones.html');
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notif_solicitud_scanner ON public.solicitudes_scanner;
CREATE TRIGGER trg_notif_solicitud_scanner
  AFTER INSERT ON public.solicitudes_scanner
  FOR EACH ROW EXECUTE FUNCTION public.notif_nueva_solicitud_scanner();

-- ── 2) Citas a domicilio ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notif_nueva_cita_domicilio()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notificaciones_internas
    (tipo, prioridad, destinatario_rol, destinatario_dept, titulo, mensaje, leida_por, accion_url)
  VALUES
    ('lead', 'alta', 'admin', NULL,
     '🏠 Nueva cita a domicilio',
     COALESCE(NEW.nombre,'(nombre?)') || ' — ' || COALESCE(NEW.servicio,'?')
       || ' en ' || COALESCE(NEW.zona,'?') || ' el ' || COALESCE(NEW.fecha_cita::text,'?')
       || ' (' || COALESCE(NEW.franja_horaria,'?') || ') · WA ' || COALESCE(NEW.whatsapp,'—'),
     '{}', '/app/panel-interno-operaciones.html');
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notif_cita_domicilio ON public.citas_domicilio;
CREATE TRIGGER trg_notif_cita_domicilio
  AFTER INSERT ON public.citas_domicilio
  FOR EACH ROW EXECUTE FUNCTION public.notif_nueva_cita_domicilio();

-- ── Verificar (opcional) — inserta una fila de prueba y mira la campanita ──
-- INSERT INTO public.solicitudes_scanner(doctor,clinica,whatsapp,servicio)
--   VALUES('TEST Dr','Clínica Test','573000000000','Escaneo prueba');
--   (luego borra la fila de prueba y su notificación)
