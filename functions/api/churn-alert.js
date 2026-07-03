/**
 * PRODIGY — Churn Prevention: Alerta Doctor Inactivo
 * Cloudflare Pages Function — POST /api/churn-alert
 *
 * Detecta doctores que solían enviar 3+ STL/mes y llevan
 * 20+ días sin pedidos. Envía mensaje WA personalizado al doctor.
 *
 * Llamar desde resumen-semanal (pg_cron los lunes 9 AM) o manualmente.
 *
 * Env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY
 *   CALLMEBOT_APIKEY (para WA del doctor vía Callmebot)
 *   CRON_SECRET (para autenticar llamadas automáticas)
 */

const CORS = {
  'Access-Control-Allow-Origin':  'https://prodigylabdental.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type':                  'application/json',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Auth
  const secret = request.headers.get('x-cron-secret');
  if (secret !== env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401, headers: CORS });
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Config incompleta' }), { status: 503, headers: CORS });
  }

  // 1. Obtener doctors inactivos desde Supabase
  const rpcRes = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/prodigy_detectar_churn`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey':       env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ dias_umbral: 20, limite: 10 }),
  });

  if (!rpcRes.ok) {
    const err = await rpcRes.text();
    return new Response(JSON.stringify({ error: 'RPC error: ' + err }), { status: 502, headers: CORS });
  }

  const doctors = await rpcRes.json();
  if (!doctors || !doctors.length) {
    return new Response(JSON.stringify({ ok: true, message: 'Sin doctors inactivos', sent: 0 }), { headers: CORS });
  }

  // 2. Enviar WA a cada doctor inactivo (máx 5 por ejecución)
  const resultados = [];
  const CALLMEBOT_KEY = env.CALLMEBOT_APIKEY;

  for (const doctor of doctors.slice(0, 5)) {
    const nombre = doctor.nombre?.split(' ')[0] || 'Doctor';
    const wa     = (doctor.whatsapp || '').replace(/\D/g, '');
    if (!wa || !CALLMEBOT_KEY || CALLMEBOT_KEY === 'PENDIENTE') {
      resultados.push({ email: doctor.email, status: 'SKIP_NO_WA' });
      continue;
    }

    const dias = doctor.dias_inactivo;
    const msg = `Hola Dr. ${nombre}, 👋 notamos que llevan ${dias} días sin enviar casos a PRODIGY.\n\n¿Tienes algún caso en el escáner al que podamos ayudarte hoy? 🦷\n\nEscríbenos y lo agendamos de inmediato.\n\nEquipo PRODIGY Lab Dental`;

    try {
      const waUrl = `https://api.callmebot.com/whatsapp.php?phone=${wa}&text=${encodeURIComponent(msg)}&apikey=${CALLMEBOT_KEY}`;
      let waOk = false;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const waRes = await fetch(waUrl);
          const waTxt = await waRes.text();
          // CallMeBot responde HTTP 200 incluso en fallos — "Message queued"
          // es la única confirmación real de envío. waRes.ok/status 200 solo
          // decían si Cloudflare pudo contactar la API, no si el WA se envió.
          waOk = waRes.ok && /message queued/i.test(waTxt);
          if (waOk) break;
        } catch(_) {}
        if (attempt === 0) await new Promise(r => setTimeout(r, 1000));
      }

      // Registrar en logs_incidencias
      await fetch(`${env.SUPABASE_URL}/rest/v1/logs_incidencias`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({
          tipo:        'CHURN_ALERT',
          severidad:   'INFO',
          descripcion: `[CHURN] WA enviado a ${doctor.email} (${dias} días inactivo, ${doctor.pedidos_90d} pedidos/90d) — OK: ${waOk}`,
          resuelta:    true,
        }),
      });

      resultados.push({ email: doctor.email, wa_sent: waOk, dias });
    } catch(e) {
      resultados.push({ email: doctor.email, error: e.message });
    }
  }

  return new Response(JSON.stringify({
    ok: true,
    doctors_inactivos: doctors.length,
    mensajes_enviados: resultados.filter(r => r.wa_sent).length,
    detalle: resultados,
  }), { headers: CORS });
}
