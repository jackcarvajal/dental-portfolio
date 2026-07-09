/**
 * PRODIGY — Email de bienvenida para doctor referido
 * POST /api/bienvenida-referido
 *
 * Llamado desde panel-interno-operaciones.html (staff) al confirmar un
 * referido. Envía email de bienvenida al nuevo doctor con el 5% de
 * descuento confirmado. Requiere JWT de sesión staff (admin/operator).
 *
 * Env vars: RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

const CORS = {
  'Access-Control-Allow-Origin':  'https://prodigylabdental.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type':                 'application/json',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

async function esStaff(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return false;
  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': env.SUPABASE_SERVICE_KEY }
    });
    if (!res.ok) return false;
    const user = await res.json();
    const ADMIN_EMAILS = ['jackalejandroc@gmail.com', 'labdentalprodigy@gmail.com'];
    return ADMIN_EMAILS.includes(user.email) || ['admin','operator'].includes(user.app_metadata?.role);
  } catch { return false; }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Auth — solo staff real (JWT de sesión), esta función envía un email
  // de marca a una dirección arbitraria y no debe ser pública.
  if (!(await esStaff(request, env))) {
    return new Response(JSON.stringify({ ok: false, reason: 'no_autorizado' }), { status: 401, headers: CORS });
  }

  // Rate limit: 20 req / 10 min por IP
  const ip  = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlK = new Request('https://rl.internal/bienvenida-ref_' + ip);
  const hit = await caches.default.match(rlK);
  if (hit) {
    const n = parseInt(await hit.text(), 10) || 0;
    if (n >= 20) return new Response(JSON.stringify({ ok: false, reason: 'rate-limit' }), { status: 429, headers: CORS });
    await caches.default.put(rlK, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=600' } }));
  } else {
    await caches.default.put(rlK, new Response('1', { headers: { 'Cache-Control': 'max-age=600' } }));
  }

  let body;
  try { body = await request.json(); } catch { body = {}; }

  const { email, nombre, codigo_referido, pedido_codigo } = body;
  if (!email) return new Response(JSON.stringify({ ok: false, reason: 'email_required' }), { status: 400, headers: CORS });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ ok: false, reason: 'email_invalido' }), { status: 400, headers: CORS });
  }

  if (!env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ ok: false, reason: 'no_resend_key' }), { headers: CORS });
  }

  const escH = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const nombreSafe = escH(nombre || 'Doctor/a');
  const codigoSafe = escH(codigo_referido || '');
  const pedidoSafe = escH(pedido_codigo || '');

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#050505;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;margin:0;padding:0;">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;">
  <div style="text-align:center;margin-bottom:32px;">
    <div style="font-size:2.5rem;margin-bottom:8px;">💎</div>
    <div style="font-size:1.4rem;font-weight:900;letter-spacing:3px;color:#D4AF37;">PRODIGY</div>
    <div style="font-size:.75rem;letter-spacing:4px;color:#94a3b8;text-transform:uppercase;">Lab Dental</div>
  </div>

  <div style="background:#0d1520;border:1px solid rgba(0,255,65,.2);border-radius:16px;padding:28px 24px;margin-bottom:20px;">
    <div style="font-size:.7rem;font-weight:900;text-transform:uppercase;letter-spacing:.8px;color:#00FF41;margin-bottom:12px;">🎁 ¡Bienvenida!</div>
    <h1 style="font-size:1.3rem;font-weight:900;color:#fff;margin:0 0 12px;">Hola Dr. ${nombreSafe},</h1>
    <p style="color:#94a3b8;line-height:1.7;margin:0 0 16px;">Tu colega te recomendó PRODIGY Lab Dental y tu <strong style="color:#00FF41;">5% de descuento</strong> ha sido aplicado al pedido <strong style="color:#D4AF37;">${pedidoSafe}</strong>.</p>
    ${codigoSafe ? `<div style="background:rgba(0,255,65,.08);border:1px solid rgba(0,255,65,.25);border-radius:10px;padding:14px 18px;text-align:center;">
      <div style="font-size:.65rem;font-weight:900;text-transform:uppercase;letter-spacing:.5px;color:#00FF41;margin-bottom:6px;">Código de referido usado</div>
      <div style="font-size:1.3rem;font-weight:900;color:#fff;letter-spacing:4px;">${codigoSafe}</div>
    </div>` : ''}
  </div>

  <div style="background:#0d1520;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:24px;margin-bottom:20px;">
    <h2 style="font-size:.9rem;font-weight:800;color:#D4AF37;margin:0 0 14px;">¿Qué sigue?</h2>
    <ol style="color:#94a3b8;line-height:1.9;padding-left:18px;margin:0;">
      <li>Revisaremos tu caso en menos de <strong style="color:#e2e8f0;">2 horas</strong></li>
      <li>Te notificamos por WhatsApp cuando inicie producción</li>
      <li>Seguimiento en vivo en <a href="https://prodigylabdental.com/seguimiento-caso" style="color:#00d2ff;">prodigylabdental.com</a></li>
    </ol>
  </div>

  <div style="text-align:center;">
    <a href="https://prodigylabdental.com/seguimiento-caso?id=${pedidoSafe}" style="display:inline-block;background:linear-gradient(135deg,#D946A6,#9333ea);color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:800;font-size:.9rem;">Ver seguimiento de mi caso →</a>
  </div>

  <p style="text-align:center;color:#334155;font-size:.72rem;margin-top:32px;">
    PRODIGY Lab Dental · Bogotá, Colombia · <a href="https://wa.me/573212816716" style="color:#475569;">+57 321 281 6716</a><br>
    <a href="https://prodigylabdental.com/terminos-y-legal#privacidad" style="color:#475569;">Política de privacidad</a>
  </p>
</div>
</body>
</html>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'PRODIGY Lab Dental <bienvenida@prodigylabdental.com>',
        to:   [email],
        subject: `¡Bienvenido a PRODIGY! Tu 5% de descuento fue aplicado 🎁`,
        html,
      }),
    });
    const ok = r.ok;
    return new Response(JSON.stringify({ ok, status: r.status }), { headers: CORS });
  } catch(e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { headers: CORS });
  }
}
