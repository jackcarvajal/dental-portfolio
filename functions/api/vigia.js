/**
 * PRODIGY — Vigía de seguridad: lo que ve un visitante SIN sesión (oct-2026)
 * GET /api/vigia   (Authorization: Bearer CRON_SECRET, o sesión de admin)  → { ok, problemas[], revisados, sin_datos[] }
 *
 * Repite en el servidor la prueba «Seguridad (como anónimo)» del panel de pruebas para detectar regresiones (como
 * la política anónima de `pedidos` que un SQL viejo volvió a crear): tablas, vistas, funciones y carpetas privadas
 * leídas con la anon key pública; más la salud de los servicios externos. Solo LEE: nunca llama funciones que
 * escriben ni manda correos.
 * Lo corre una vez al día alerta-sla.js (cron de GitHub) y avisa en la campana del admin si algo falla.
 * Env: SUPABASE_SERVICE_ROLE_KEY | SUPABASE_SERVICE_KEY (para saber si una tabla tiene filas), CRON_SECRET.
 */
import { cfg, adminH, usuarioDe, ADMIN_EMAILS } from './reportar-problema.js';

// La anon key es pública (va en todas las páginas); aquí sirve para mirar como un visitante
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhyd3FmeXZneWFwYnd6a3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzczNDksImV4cCI6MjA5MDg1MzM0OX0.9CzmFDQYeQKcbtAZoT1_n_OuJ1qPVJu3jImd938T634';
const TABLAS = ['pedidos', 'pedidos_doctor', 'solicitudes_scanner', 'clientes', 'doctores_perfil', 'cotizaciones', 'referidos', 'despachos',
  'pagos', 'avisos_whatsapp', 'pedido_bitacora', 'notificaciones_internas', 'reportes_web', 'logs_incidencias', 'revision_tokens',
  'leads_doctores', 'historial_diseno', 'veneer_leads', 'push_subscriptions'];
const VISTAS = ['pedidos_reales', 'doctors_inactivos', 'historial_doctor', 'v_pedidos_urgentes', 'pedidos_operacion', 'pedidos_archivos_resumen'];
// Solo funciones que LEEN (las que escriben no se llaman nunca desde aquí)
const FUNCIONES = [['prodigy_dashboard_semana', {}], ['prodigy_ingresos_semanas', { n_semanas: 4 }], ['prodigy_top_servicios', {}],
  ['prodigy_forecast_semana', {}], ['prodigy_tiempos_entrega', {}], ['casos_atrasados', {}], ['tiempos_por_etapa', {}],
  ['envios_transportadora_recientes', {}], ['alejandro_dashboard', {}], ['alejandro_dashboard_semana', {}], ['alejandro_ingresos_semanas', {}],
  ['alejandro_top_servicios', {}], ['prodigy_clv_doctores', {}], ['prodigy_inventario_alertas', {}], ['prodigy_funnel', {}],
  ['prodigy_top_doctores', {}], ['prodigy_ingresos_por_canal', {}], ['prodigy_pedidos_por_material', {}], ['prodigy_conversion_por_flujo', {}]];
const CARPETAS = ['pedidos-archivos', 'scanner-uploads', 'diseno-archivos', 'evidencias-entrega', 'casos', 'caso-fotos', 'alineadores-archivos', 'reportes-capturas'];

const conDatos = j => Array.isArray(j) ? j.length > 0 : (j && typeof j === 'object' && !j.code && !j.message && Object.keys(j).length > 0);

export async function revisar(env, base) {
  const c = cfg(env);
  const HA = { apikey: ANON, Authorization: 'Bearer ' + ANON, 'Content-Type': 'application/json' };
  const problemas = [], sin_datos = []; let revisados = 0;
  const leer = async (ruta, init) => { try { const r = await fetch(`${c.URL}${ruta}`, init); return { st: r.status, j: await r.json().catch(() => null) }; } catch (e) { return { st: 0, j: null }; } };

  for (const t of TABLAS.concat(VISTAS)) {
    revisados++;
    const a = await leer(`/rest/v1/${t}?select=*&limit=1`, { headers: HA });
    if (conDatos(a.j)) { problemas.push(`Un visitante sin sesión lee «${t}»`); continue; }
    if (c.SERVICE && TABLAS.includes(t)) {        // ¿tenía filas? si está vacía no se puede saber si está abierta
      const s = await fetch(`${c.URL}/rest/v1/${t}?select=*&limit=1`, { headers: { ...adminH(c.SERVICE), Prefer: 'count=exact', Range: '0-0' } }).catch(() => null);
      const total = s ? parseInt((s.headers.get('content-range') || '').split('/')[1] || '0', 10) : 0;
      if (!total) sin_datos.push(t);
    }
  }
  for (const [fn, p] of FUNCIONES) {
    revisados++;
    const a = await leer(`/rest/v1/rpc/${fn}`, { method: 'POST', headers: HA, body: JSON.stringify(p) });
    if (a.st === 200 && conDatos(a.j)) problemas.push(`Un visitante sin sesión obtiene datos de la función «${fn}»`);
  }
  for (const b of CARPETAS) {
    revisados++;
    const a = await leer(`/storage/v1/object/list/${b}`, { method: 'POST', headers: HA, body: JSON.stringify({ prefix: '', limit: 1 }) });
    if (Array.isArray(a.j) && a.j.length) problemas.push(`Un visitante sin sesión lista archivos de la carpeta «${b}»`);
  }
  // Salud de los servicios externos (Supabase, Wompi, Resend…)
  try {
    const r = await fetch(new URL('/api/health-check', base), { cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    revisados++;
    if (j.status && j.status !== 'OK') problemas.push(`Servicios externos: ${j.status} — ${(j.services || []).filter(s => !s.ok).map(s => s.name).join(', ')}`);
  } catch (_) { /* si health-check no responde, el resto del informe sigue */ }

  return { ok: problemas.length === 0, problemas, revisados, sin_datos, fecha: new Date().toISOString() };
}

export async function onRequestGet({ request, env }) {
  const h = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  const key = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  let ok = !!env.CRON_SECRET && key === env.CRON_SECRET;
  if (!ok) {
    const c = cfg(env);
    const yo = c.SERVICE ? await usuarioDe(request, c) : null;
    const roles = [].concat(yo?.app_metadata?.roles || [], yo?.app_metadata?.role || []);
    ok = !!yo && (ADMIN_EMAILS.includes(String(yo.email || '').toLowerCase()) || roles.includes('admin'));
  }
  if (!ok) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: h });
  return new Response(JSON.stringify(await revisar(env, request.url)), { status: 200, headers: h });
}
