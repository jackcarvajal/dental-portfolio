-- ═══════════════════════════════════════════════════════════════
-- Casos portafolio — Alejandro Carvajal CAD/CAM
-- Ejecutar en Supabase SQL Editor
-- IMPORTANTE: reemplaza cover_image con URL real de cada caso
-- ═══════════════════════════════════════════════════════════════

INSERT INTO casos_portafolio (
  id, name, type, material, date, description,
  cover_image, gallery_count, visible, sort_order, negocio
) VALUES
  (
    gen_random_uuid(),
    'Guía Quirúrgica — Implante Unitario Diente 46',
    'implantes',
    'CoDiagnostiX · Neodent GM',
    'Mayo 2026',
    'Guía restrictiva dentosoportada para implante unitario. CBCT con resolución 150μ, cortes 0.5mm. Flapless surgery. Entrega STL en 6h.',
    'https://prodigylabdental.com/assets/og-guias-quirurgicas.jpg',
    4, true, 1, 'alejandro'
  ),
  (
    gen_random_uuid(),
    'Guía Híbrida All-on-4 — Maxilar Superior',
    'implantes',
    'Exoplan · Straumann BLX',
    'Abril 2026',
    'Planificación All-on-4 con guía híbrida de 4 implantes. Protocolo doble CBCT mucosoportada. Reducción ósea guiada. STL en 24h.',
    'https://prodigylabdental.com/assets/og-guias-quirurgicas.jpg',
    6, true, 2, 'alejandro'
  ),
  (
    gen_random_uuid(),
    'Guía Sobredentadura — Edéntulo Total Inferior',
    'implantes',
    'BlueSkyPlan · Nobel Active',
    'Marzo 2026',
    'Dos implantes con guía mucosoportada. Marcadores biomarcadores vestibular y palatino. Protocolo doble tomografía. Entrega STL en 18h.',
    'https://prodigylabdental.com/assets/og-guias-quirurgicas.jpg',
    5, true, 3, 'alejandro'
  ),
  (
    gen_random_uuid(),
    'Planificación 3 Implantes — Sector Posterior',
    'implantes',
    'RealGuide · Zimmer Biomet',
    'Febrero 2026',
    'Tres implantes posteriores inferiores con reducción de distancia a nervio dentario. Análisis densidad ósea D2-D3. STL en 12h.',
    'https://prodigylabdental.com/assets/og-guias-quirurgicas.jpg',
    4, true, 4, 'alejandro'
  ),
  (
    gen_random_uuid(),
    'Guía Quirúrgica + Provisional PMMA — Carga Inmediata',
    'implantes',
    'CoDiagnostiX · Osstem',
    'Enero 2026',
    'Implante unitario con provisional PMMA para carga inmediata. Diseño sincronizado guía + provisional en el mismo flujo. Entrega combo en 8h.',
    'https://prodigylabdental.com/assets/og-guias-quirurgicas.jpg',
    7, true, 5, 'alejandro'
  )
ON CONFLICT DO NOTHING;

-- Verificar inserción
SELECT id, name, type, visible FROM casos_portafolio WHERE negocio = 'alejandro' ORDER BY sort_order;
