-- ═══════════════════════════════════════════════════════════════
-- Casos portafolio — Alejandro Carvajal CAD/CAM
-- Ejecutar en Supabase SQL Editor (requiere permisos admin)
-- NOTA: columna "negocio" no existe — tabla compartida
-- Reemplaza cover_image con capturas reales de Exocad cuando tengas
-- ═══════════════════════════════════════════════════════════════

INSERT INTO casos_portafolio (name, type, material, date, description, cover_image, gallery_count, visible, sort_order)
VALUES
  ('Guía Quirúrgica — Implante Unitario Diente 46',
   'implantes', 'CoDiagnostiX · Neodent GM', 'Mayo 2026',
   'Guía restrictiva dentosoportada para implante unitario. CBCT con resolución 150μ, cortes 0.5mm. Flapless surgery. Entrega STL en 6h.',
   'https://prodigylabdental.com/assets/og-guias-quirurgicas.jpg', 4, true, 1),

  ('Guía Híbrida All-on-4 — Maxilar Superior',
   'implantes', 'Exoplan · Straumann BLX', 'Abril 2026',
   'Planificación All-on-4 con guía híbrida de 4 implantes. Protocolo doble CBCT mucosoportada. Reducción ósea guiada. STL en 24h.',
   'https://prodigylabdental.com/assets/og-guias-quirurgicas.jpg', 6, true, 2),

  ('Guía Sobredentadura — Edéntulo Total Inferior',
   'implantes', 'BlueSkyPlan · Nobel Active', 'Marzo 2026',
   'Dos implantes con guía mucosoportada. Biomarcadores vestibular y palatino. Protocolo doble tomografía. Entrega STL en 18h.',
   'https://prodigylabdental.com/assets/og-guias-quirurgicas.jpg', 5, true, 3),

  ('Planificación 3 Implantes — Sector Posterior',
   'implantes', 'RealGuide · Zimmer Biomet', 'Febrero 2026',
   'Tres implantes posteriores inferiores. Análisis distancia nervio dentario. Densidad ósea D2-D3. STL en 12h.',
   'https://prodigylabdental.com/assets/og-guias-quirurgicas.jpg', 4, true, 4),

  ('Guía Quirúrgica + Provisional PMMA — Carga Inmediata',
   'implantes', 'CoDiagnostiX · Osstem', 'Enero 2026',
   'Implante unitario con provisional PMMA para carga inmediata. Diseño sincronizado guía + provisional en el mismo flujo. Entrega combo en 8h.',
   'https://prodigylabdental.com/assets/og-guias-quirurgicas.jpg', 7, true, 5);

-- Verificar
SELECT id, name, type, visible, sort_order FROM casos_portafolio ORDER BY sort_order DESC LIMIT 10;
