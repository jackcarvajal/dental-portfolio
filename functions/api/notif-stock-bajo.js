/**
 * PRODIGY — Alerta de stock bajo en inventario
 * GET /api/notif-stock-bajo?key=CRON_SECRET
 *
 * Llamar diariamente (junto a expire-cotizaciones).
 * Env vars: SUPABASE_SERVICE_KEY, CRON_SECRET, CALLMEBOT_APIKEY, WA_ADMIN
 */

const SURL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';

export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get('key');
  if (!env.CRON_SECRET || key !== env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!env.SUPABASE_SERVICE_KEY) return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_KEY falta' }), { status: 503 });

  const h = { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' };

  try {
    // Llamar RPC de alertas de inventario
    const r = await fetch(`${SURL}/rest/v1/rpc/prodigy_inventario_alertas`, { method: 'POST', headers: h, body: '{}' });
    const alertas = await r.json();

    if (!Array.isArray(alertas) || alertas.length === 0) {
      return new Response(JSON.stringify({ ok: true, alertas: 0 }), { status: 200 });
    }

    // Enviar WA al admin si hay materiales bajo mínimo
    if (env.CALLMEBOT_APIKEY && env.WA_ADMIN) {
      const agotados = alertas.filter(a => Number(a.stock_actual) <= 0);
      const bajos = alertas.filter(a => Number(a.stock_actual) > 0 && Number(a.stock_actual) <= Number(a.stock_minimo));

      let msg = `⚠️ *PRODIGY — Alerta de Inventario*\n\n`;
      if (agotados.length) {
        msg += `🔴 *Agotados (${agotados.length}):*\n`;
        agotados.forEach(m => { msg += `• ${m.nombre} — Stock: 0\n`; });
        msg += '\n';
      }
      if (bajos.length) {
        msg += `🟡 *Stock bajo (${bajos.length}):*\n`;
        bajos.forEach(m => { msg += `• ${m.nombre} — Stock: ${m.stock_actual} (mín: ${m.stock_minimo})\n`; });
      }
      msg += `\n🔗 https://prodigylabdental.com/app/inventario.html`;

      const waNum = String(env.WA_ADMIN).replace(/\D/g, '');
      await fetch(`https://api.callmebot.com/whatsapp.php?phone=${waNum}&text=${encodeURIComponent(msg)}&apikey=${env.CALLMEBOT_APIKEY}`);
    }

    return new Response(JSON.stringify({ ok: true, alertas: alertas.length, agotados: alertas.filter(a=>Number(a.stock_actual)<=0).length }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
