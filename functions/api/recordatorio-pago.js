/**
 * PRODIGY — Recordatorio de pago pendiente por WA
 * GET /api/recordatorio-pago?key=CRON_SECRET
 *
 * Llamar diariamente. Envía WA a doctores con pago pendiente > 48h.
 * Env vars: SUPABASE_SERVICE_KEY, CRON_SECRET, CALLMEBOT_APIKEY
 */

const SURL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';

export async function onRequestGet({ request, env }) {
  const key = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim() || new URL(request.url).searchParams.get('key');
  if (!env.CRON_SECRET || key !== env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!env.SUPABASE_SERVICE_KEY) return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_KEY falta' }), { status: 503 });

  const h = {
    'apikey': env.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    // Obtener pedidos con pago pendiente > 48h
    const r = await fetch(`${SURL}/rest/v1/rpc/prodigy_pagos_pendientes`, {
      method: 'POST', headers: h, body: JSON.stringify({ p_horas: 48 }),
    });
    const pendientes = await r.json();

    if (!Array.isArray(pendientes) || pendientes.length === 0) {
      return new Response(JSON.stringify({ ok: true, recordatorios: 0 }), { status: 200 });
    }

    let enviados = 0;

    for (const p of pendientes) {
      if (!p.whatsapp || !env.CALLMEBOT_APIKEY) continue;

      const wa = String(p.whatsapp).replace(/\D/g, '');
      if (wa.length < 10) continue;
      const waFull = wa.length === 10 ? '57' + wa : wa;

      const doctor = (p.doctor || 'Doctor').split(' ')[0];
      const total = '$' + Math.round(Number(p.total || 0)).toLocaleString('es-CO') + ' COP';
      const horas = Math.round(Number(p.horas_espera || 48));

      const msg = `💎 *PRODIGY Lab Dental*\n\nHola ${doctor}, tu pedido *${p.codigo}* lleva ${horas}h con pago pendiente.\n\n💰 *Total a pagar:* ${total}\n\n👉 Págalo aquí (PayPal / tarjeta / PSE / transferencia sin comisión):\nhttps://prodigylabdental.com/pagar?ref=${p.codigo}\n\n_Respondenos por WhatsApp si necesitas ayuda con el pago._`;

      const waUrl = `https://api.callmebot.com/whatsapp.php?phone=${waFull}&text=${encodeURIComponent(msg)}&apikey=${env.CALLMEBOT_APIKEY}`;

      try {
        const waRes = await fetch(waUrl);
        const waTxt = await waRes.text();
        const waOk = waRes.ok && /message queued/i.test(waTxt);
        if (waOk) {
          // Solo marcar como enviado si CallMeBot confirmó — antes se marcaba
          // siempre, así que un WA fallido dejaba al doctor sin más
          // recordatorios (el cron nunca lo volvía a intentar).
          await fetch(`${SURL}/rest/v1/rpc/prodigy_marcar_recordatorio`, {
            method: 'POST', headers: h, body: JSON.stringify({ p_id: p.id }),
          });
          enviados++;
        } else {
          await fetch(`${SURL}/rest/v1/logs_incidencias`, {
            method: 'POST', headers: h,
            body: JSON.stringify({ tipo: 'RECORDATORIO_PAGO_WA_ERROR', severidad: 'WARN', descripcion: `[recordatorio-pago] Falló WA a ${waFull} (${p.codigo}): ${waTxt.slice(0, 300)}`, resuelta: false }),
          }).catch(() => {});
        }
      } catch(_) { /* continuar con el siguiente */ }
    }

    return new Response(JSON.stringify({
      ok: true,
      pendientes: pendientes.length,
      recordatorios: enviados,
      ts: new Date().toISOString(),
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[recordatorio-pago]', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
}
