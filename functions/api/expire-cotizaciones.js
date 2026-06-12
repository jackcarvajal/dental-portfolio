/**
 * PRODIGY — Expirar cotizaciones vencidas
 * GET /api/expire-cotizaciones?key=CRON_SECRET
 *
 * Llamar diariamente desde Cloudflare Workers Cron o pg_cron.
 * Env vars: SUPABASE_SERVICE_KEY, CRON_SECRET
 */

const SURL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';

export async function onRequestGet({ request, env }) {
  // Verificar clave de cron
  const key = new URL(request.url).searchParams.get('key');
  if (!env.CRON_SECRET || key !== env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (!env.SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_KEY no configurada' }), { status: 503 });
  }

  const h = { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' };
  const baseUrl = new URL(request.url);

  try {
    // 1. Expirar las vencidas
    const r1 = await fetch(`${SURL}/rest/v1/rpc/prodigy_expirar_cotizaciones`, { method: 'POST', headers: h, body: '{}' });
    const expiradas = await r1.json();

    // 2. Obtener las que vencen en 2 días para WA recordatorio
    const r2 = await fetch(`${SURL}/rest/v1/rpc/prodigy_cotizaciones_por_vencer`, {
      method: 'POST', headers: h, body: JSON.stringify({ p_dias: 2 }),
    });
    const porVencer = await r2.json();

    // 3. Enviar WA a cada doctor
    let waEnviados = 0;
    if (Array.isArray(porVencer) && env.CALLMEBOT_APIKEY) {
      const waBase = `${baseUrl.origin}/api/wa-cotizacion`;
      await Promise.allSettled(porVencer.map(async c => {
        if (!c.whatsapp) return;
        await fetch(waBase, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '127.0.0.1' },
          body: JSON.stringify({ whatsapp: c.whatsapp, nombre: c.doctor, total: `$${Number(c.total||0).toLocaleString('es-CO')} COP`, codigo: c.codigo, dias: c.dias_restantes }),
        });
        waEnviados++;
      }));
    }

    return new Response(JSON.stringify({
      ok: true,
      expiradas,
      wa_enviados: waEnviados,
      ts: new Date().toISOString(),
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[expire-cotizaciones]', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
}
