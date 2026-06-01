/**
 * PRODIGY — Notificación cuando doctor aprueba/solicita cambios en revision-express
 * POST /api/revision-notify
 *
 * Llamado desde revision-express.html tras aprobación o solicitud de cambios.
 * Envía WA al operario + email al equipo con los detalles.
 *
 * Env vars: RESEND_API_KEY, CALLMEBOT_APIKEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

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

  const { tipo, pedido_id, codigo, doctor_nombre, notas, revision_num } = body;
  // tipo: 'aprobacion' | 'cambios'
  if (!tipo || !pedido_id) return new Response(JSON.stringify({ ok: false }), { headers: CORS });

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
      results.wa = r.ok ? 'ok' : `error ${r.status}`;
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
