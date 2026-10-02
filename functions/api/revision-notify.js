/**
 * PRODIGY — Notificación cuando doctor aprueba/solicita cambios en revision-express
 * POST /api/revision-notify
 *
 * Llamado desde revision-express.html tras aprobación o solicitud de cambios.
 * Envía WA al operario + email al equipo con los detalles.
 *
 * Env vars: RESEND_API_KEY, CALLMEBOT_APIKEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
 *
 * Seguridad (oct-2026): antes cualquiera podía llamarlo y mandar correo a gerencia + WhatsApp al lab con el
 * doctor/caso/notas que quisiera. Ahora exige el `token` de revisión que el doctor acaba de usar (usado en los
 * últimos 15 min, de ESE pedido), toma código, doctor y notas de la BD y avisa una sola vez por token.
 */
import { cfg, adminH } from './reportar-problema.js';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CORS = {
  'Access-Control-Allow-Origin':  'https://prodigylabdental.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type':                 'application/json',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Rate limit: 10 req / 5 min por IP
  const ip  = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlK = new Request('https://rl.internal/revision-notify_' + ip);
  const hit = await caches.default.match(rlK);
  if (hit) {
    const n = parseInt(await hit.text(), 10) || 0;
    if (n >= 10) return new Response(JSON.stringify({ ok: false }), { status: 429, headers: CORS });
    await caches.default.put(rlK, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=300' } }));
  } else {
    await caches.default.put(rlK, new Response('1', { headers: { 'Cache-Control': 'max-age=300' } }));
  }

  let body;
  try { body = await request.json(); } catch { body = {}; }

  const { tipo, pedido_id, token } = body;
  // tipo: 'aprobacion' | 'cambios'
  if (!['aprobacion', 'cambios'].includes(tipo) || !UUID.test(String(pedido_id || '')) || !token) {
    return new Response(JSON.stringify({ ok: false, error: 'Datos incompletos' }), { status: 400, headers: CORS });
  }
  const c = cfg(env);
  if (!c.SERVICE) return new Response(JSON.stringify({ ok: false }), { status: 503, headers: CORS });
  // El token tiene que ser de ESE pedido y haberse usado hace menos de 15 min (lo marca la RPC de aprobar/cambios)
  const desde = encodeURIComponent(new Date(Date.now() - 15 * 60000).toISOString());
  const rt = await fetch(`${c.URL}/rest/v1/revision_tokens?token=eq.${encodeURIComponent(token)}&pedido_id=eq.${pedido_id}&usado=is.true&usado_at=gte.${desde}&select=id&limit=1`, { headers: adminH(c.SERVICE) }).catch(() => null);
  if (!rt || !rt.ok || !(await rt.json()).length) return new Response(JSON.stringify({ ok: false, error: 'No autorizado' }), { status: 403, headers: CORS });
  const una = new Request('https://rl.internal/revision-notify-token_' + encodeURIComponent(token));
  if (await caches.default.match(una)) return new Response(JSON.stringify({ ok: true, repetido: true }), { headers: CORS });
  await caches.default.put(una, new Response('1', { headers: { 'Cache-Control': 'max-age=86400' } }));
  // Datos del caso desde la BD (no del navegador)
  const rp = await fetch(`${c.URL}/rest/v1/pedidos?id=eq.${pedido_id}&select=codigo,nombre_doctor,notas_cambios,revisiones_usadas&limit=1`, { headers: adminH(c.SERVICE) }).catch(() => null);
  const ped = (rp && rp.ok ? (await rp.json())[0] : null) || {};
  const codigo = ped.codigo || '', doctor_nombre = ped.nombre_doctor || '', notas = ped.notas_cambios || '', revision_num = ped.revisiones_usadas || '';

  const esAprobacion = tipo === 'aprobacion';
  const results = {};

  // 1. WA al operario via Callmebot
  if (env.CALLMEBOT_APIKEY && env.CALLMEBOT_APIKEY !== 'PENDIENTE') {
    try {
      const msg = esAprobacion
        ? `✅ *Diseño aprobado por email*\n\nDr. ${doctor_nombre||'—'} aprobó el diseño del caso *${codigo||pedido_id.slice(0,12)}*.\n\nIniciar producción inmediatamente. Panel: prodigylabdental.com/app/operario-diseno`
        : `✏️ *Cambios solicitados por email*\n\nDr. ${doctor_nombre||'—'} solicita cambios en caso *${codigo||pedido_id.slice(0,12)}* (revisión ${revision_num||'?'}/2).\n\nNotas: ${(notas||'—').slice(0,100)}\n\nPanel: prodigylabdental.com/app/operario-diseno`;
      const url = `https://api.callmebot.com/whatsapp.php?phone=573212816716&text=${encodeURIComponent(msg)}&apikey=${env.CALLMEBOT_APIKEY}`;
      const r = await fetch(url);
      const rTxt = await r.text();
      // CallMeBot responde HTTP 200 incluso en fallos — r.ok solo no basta.
      const waOk = r.ok && /message queued/i.test(rTxt);
      results.wa = waOk ? 'ok' : `error: ${rTxt.slice(0, 150)}`;
      if (!waOk && env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
        await fetch(`${env.SUPABASE_URL}/rest/v1/logs_incidencias`, {
          method: 'POST',
          headers: { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'REVISION_NOTIFY_WA_ERROR', severidad: 'WARN', descripcion: `[revision-notify] Falló WA operario (${codigo||pedido_id}): ${rTxt.slice(0, 300)}`, resuelta: false }),
        }).catch(() => {});
      }
    } catch(e) { results.wa = 'exception: ' + e.message; }
  }

  // 2. Email al equipo via Resend
  if (env.RESEND_API_KEY) {
    try {
      const escH = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const subject = esAprobacion
        ? `✅ Diseño aprobado — Caso ${escH(codigo||'')} | Dr. ${escH(doctor_nombre||'—')}`
        : `✏️ Cambios solicitados — Caso ${escH(codigo||'')} | Revisión ${revision_num||'?'}/2`;
      const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head>
<body style="background:#050505;color:#e2e8f0;font-family:sans-serif;margin:0;padding:0;">
<div style="max-width:560px;margin:0 auto;padding:32px 24px;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="font-size:2rem;margin-bottom:8px;">${esAprobacion?'✅':'✏️'}</div>
    <div style="font-size:1.2rem;font-weight:900;letter-spacing:2px;color:#D4AF37;">PRODIGY Lab</div>
  </div>
  <div style="background:#0d1520;border:1px solid ${esAprobacion?'rgba(0,255,65,.2)':'rgba(212,175,55,.2)'};border-radius:16px;padding:24px;">
    <h2 style="font-size:1rem;font-weight:900;color:${esAprobacion?'#00FF41':'#D4AF37'};margin:0 0 16px;">
      ${esAprobacion?'Diseño aprobado por email':'Cambios solicitados por email'}
    </h2>
    <table style="font-size:.85rem;color:#94a3b8;width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;font-weight:700;color:#e2e8f0;width:120px;">Caso:</td><td>${escH(codigo||pedido_id.slice(0,12))}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;color:#e2e8f0;">Doctor:</td><td>${escH(doctor_nombre||'—')}</td></tr>
      ${!esAprobacion?`<tr><td style="padding:6px 0;font-weight:700;color:#e2e8f0;">Revisión:</td><td>${revision_num||'?'}/2</td></tr><tr><td style="padding:6px 0;font-weight:700;color:#e2e8f0;">Notas:</td><td>${escH((notas||'Sin notas').slice(0,200))}</td></tr>`:''}
    </table>
    ${esAprobacion?'<p style="color:#94a3b8;font-size:.82rem;margin-top:16px;">El caso está aprobado. Iniciar producción según protocolo.</p>':'<p style="color:#94a3b8;font-size:.82rem;margin-top:16px;">Atender los cambios antes del próximo envío al doctor.</p>'}
  </div>
  <div style="text-align:center;margin-top:20px;">
    <a href="https://prodigylabdental.com/app/operario-diseno" style="display:inline-block;background:linear-gradient(135deg,#D946A6,#9333ea);color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:800;font-size:.88rem;">Ver en Panel →</a>
  </div>
</div>
</body></html>`;
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'PRODIGY Sistema <sistema@prodigylabdental.com>',
          to:   ['gerencia@prodigylabdental.com'],
          subject,
          html,
        }),
      });
      results.email = r.ok ? 'ok' : `error ${r.status}`;
    } catch(e) { results.email = 'exception: ' + e.message; }
  }

  return new Response(JSON.stringify({ ok: true, results }), { headers: CORS });
}
