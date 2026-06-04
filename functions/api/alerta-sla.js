/**
 * PRODIGY — Alerta SLA pedidos vencidos
 * GET /api/alerta-sla?key=CRON_SECRET
 *
 * Llamar cada 4 horas. Envía WA al admin cuando un pedido supera su SLA.
 * Env vars: SUPABASE_SERVICE_KEY, CRON_SECRET, CALLMEBOT_APIKEY, WA_ADMIN
 */

const SURL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';

export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get('key');
  if (!env.CRON_SECRET || key !== env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const h = { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' };

  try {
    const r = await fetch(`${SURL}/rest/v1/rpc/prodigy_pedidos_sla_vencido`, { method: 'POST', headers: h, body: '{}' });
    const pedidos = await r.json();

    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      return new Response(JSON.stringify({ ok: true, alertas: 0 }), { status: 200 });
    }

    if (env.CALLMEBOT_APIKEY && env.WA_ADMIN) {
      const wa = String(env.WA_ADMIN).replace(/\D/g, '');
      const lista = pedidos.slice(0, 5).map(p =>
        `• *${p.codigo}* — ${p.doctor || '?'} (${p.horas_transcurridas}h / SLA ${p.sla_horas_objetivo}h)`
      ).join('\n');
      const msg = `⚠️ *PRODIGY — SLA Vencido*\n\n${pedidos.length} pedido(s) superaron su tiempo objetivo:\n\n${lista}\n\n🔗 Ver todos: https://prodigylabdental.com/app/taller.html`;
      await fetch(`https://api.callmebot.com/whatsapp.php?phone=${wa}&text=${encodeURIComponent(msg)}&apikey=${env.CALLMEBOT_APIKEY}`);
    }

    // Marcar alertas como enviadas
    await Promise.allSettled(pedidos.map(p =>
      fetch(`${SURL}/rest/v1/rpc/prodigy_marcar_sla_alerta`, { method: 'POST', headers: h, body: JSON.stringify({ p_id: p.id }) })
    ));

    return new Response(JSON.stringify({ ok: true, alertas: pedidos.length }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
