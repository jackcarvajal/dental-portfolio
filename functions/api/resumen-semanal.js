/**
 * PRODIGY — Resumen Semanal Automático por WhatsApp
 * Cloudflare Pages Function — llamado por Supabase pg_cron cada sábado 10am
 *
 * Env vars requeridas en Cloudflare:
 *   SUPABASE_URL        → tu URL de Supabase
 *   SUPABASE_SERVICE_KEY → service_role key (Settings → API)
 *   CALLMEBOT_APIKEY    → tu apikey de Callmebot
 *   WA_RESUMEN_PHONE    → número destino (573212816716)
 *   CRON_SECRET         → string secreto para autenticar la llamada de pg_cron
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  // Seguridad: verificar secret header
  const secret = request.headers.get('x-cron-secret');
  if (secret !== env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const stats = await _getWeeklyStats(env);
    const msg   = _buildMessage(stats);
    await _sendWA(msg, env);
    return new Response(JSON.stringify({ ok: true, msg }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500, headers: { 'content-type': 'application/json' }
    });
  }
}

/* ── Consulta Supabase ──────────────────────────────────────────── */
async function _getWeeklyStats(env) {
  const base = env.SUPABASE_URL + '/rest/v1';
  const h = {
    'apikey': env.SUPABASE_SERVICE_KEY,
    'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_KEY,
    'Content-Type': 'application/json'
  };

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [pedidos, escaners, leads] = await Promise.all([
    fetch(`${base}/pedidos?created_at=gte.${since}&select=id,estado,servicio`, { headers: h })
      .then(r => r.json()).catch(() => []),
    fetch(`${base}/solicitudes_scanner?created_at=gte.${since}&select=id,servicio,whatsapp`, { headers: h })
      .then(r => r.json()).catch(() => []),
    fetch(`${base}/lead_sources?ts=gte.${since}&select=source,medium,campaign`, { headers: h })
      .then(r => r.json()).catch(() => [])
  ]);

  // Pedidos por estado
  const porEstado = {};
  (Array.isArray(pedidos) ? pedidos : []).forEach(p => {
    porEstado[p.estado] = (porEstado[p.estado] || 0) + 1;
  });

  // Top fuente de leads
  const porFuente = {};
  (Array.isArray(leads) ? leads : []).forEach(l => {
    const k = l.source || 'directo';
    porFuente[k] = (porFuente[k] || 0) + 1;
  });
  const topFuente = Object.entries(porFuente).sort((a,b) => b[1]-a[1])[0] || ['directo', 0];

  return {
    pedidos_total:     Array.isArray(pedidos) ? pedidos.length : 0,
    pedidos_pendiente: porEstado['pendiente'] || 0,
    pedidos_produccion: (porEstado['en_produccion'] || 0) + (porEstado['en producción'] || 0),
    pedidos_completado: porEstado['completado'] || 0,
    escaners_total:    Array.isArray(escaners) ? escaners.length : 0,
    leads_total:       Array.isArray(leads) ? leads.length : 0,
    top_fuente:        topFuente[0] + ' (' + topFuente[1] + ')',
    fecha_desde:       new Date(since).toLocaleDateString('es-CO', { day:'2-digit', month:'short' }),
    fecha_hasta:       new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'short' })
  };
}

/* ── Construye el mensaje ───────────────────────────────────────── */
function _buildMessage(s) {
  const semana = s.fecha_desde + ' - ' + s.fecha_hasta;
  return [
    '🦷 *PRODIGY — Resumen Semanal*',
    '_' + semana + '_',
    '',
    '📦 *Pedidos nuevos:* ' + s.pedidos_total,
    '  ⏳ Pendientes: ' + s.pedidos_pendiente,
    '  ⚙️ En producción: ' + s.pedidos_produccion,
    '  ✅ Completados: ' + s.pedidos_completado,
    '',
    '📤 *STL recibidos (sin login):* ' + s.escaners_total,
    '📊 *Leads registrados:* ' + s.leads_total,
    '🏆 *Top fuente:* ' + s.top_fuente,
    '',
    '🔗 Panel: prodigylabdental.com/app/admin-panel'
  ].join('\n');
}

/* ── Envía por Callmebot ────────────────────────────────────────── */
async function _sendWA(msg, env) {
  const phone  = env.WA_RESUMEN_PHONE  || '573212816716';
  const apikey = env.CALLMEBOT_APIKEY;
  if (!apikey || apikey === 'PENDIENTE') throw new Error('CALLMEBOT_APIKEY no configurado');
  const url = 'https://api.callmebot.com/whatsapp.php?phone=' + phone
            + '&text=' + encodeURIComponent(msg)
            + '&apikey=' + apikey;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Callmebot error: ' + r.status);
}
