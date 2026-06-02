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

  try {
    const resp = await fetch(`${SURL}/rest/v1/rpc/prodigy_expirar_cotizaciones`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });

    const count = await resp.json();

    return new Response(JSON.stringify({
      ok: true,
      expiradas: count,
      ts: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
