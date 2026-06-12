/**
 * PRODIGY — Email transaccional con Resend
 * POST /api/send-email
 *
 * Usos:
 *  - Bienvenida a nuevo doctor registrado
 *  - Confirmación de pedido
 *  - Notificación de diseño listo
 *  - Newsletter manual
 *
 * Env vars: RESEND_API_KEY, FROM_EMAIL (default: noreply@prodigylabdental.com)
 */

const CORS_ALLOWED = ['https://prodigylabdental.com','https://www.prodigylabdental.com'];

function corsHeaders(origin) {
  const ok = CORS_ALLOWED.includes(origin) || origin.includes('.pages.dev') || origin.includes('localhost');
  return {
    'Access-Control-Allow-Origin': ok ? origin : CORS_ALLOWED[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin') || '') });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const cors = corsHeaders(origin);

  // Rate limit: 10 emails/hora por IP
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = new Request('https://rl.internal/send-email_' + ip);
  const rlHit = await caches.default.match(rlKey);
  if (rlHit) {
    const count = parseInt(await rlHit.text(), 10) || 0;
    if (count >= 10) return new Response(JSON.stringify({ error: 'Límite de emails alcanzado.' }), { status: 429, headers: cors });
    await caches.default.put(rlKey, new Response(String(count + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));
  } else {
    await caches.default.put(rlKey, new Response('1', { headers: { 'Cache-Control': 'max-age=3600' } }));
  }

  if (!env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY no configurada' }), { status: 503, headers: cors });
  }

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: cors });
  }

  const { to, subject, text, tipo, unsubscribe_token } = body;

  if (!to || !subject || !text) {
    return new Response(JSON.stringify({ error: 'Faltan campos: to, subject, text' }), { status: 400, headers: cors });
  }

  // Validar email destino
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return new Response(JSON.stringify({ error: 'Email destino inválido' }), { status: 400, headers: cors });
  }

  const fromEmail = env.FROM_EMAIL || 'PRODIGY Lab Dental <noreply@prodigylabdental.com>';

  // Contenido SIEMPRE generado server-side desde plantillas (no se acepta HTML del cliente — evita relay de phishing)
  const htmlContent = buildTemplate(tipo, { text, to, subject })
    .replace('{{TOKEN}}', unsubscribe_token || '');

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html: htmlContent,
        text: text || subject,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data.message || 'Error Resend', data }), { status: 502, headers: cors });
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), { status: 200, headers: cors });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
}

function escMail(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function buildTemplate(tipo, { text, subject }) {
  text = escMail(text);
  subject = escMail(subject);
  const base = (content) => `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{margin:0;padding:0;background:#050505;font-family:-apple-system,'Segoe UI',sans-serif;color:#e2e8f0;}
  .wrap{max-width:580px;margin:0 auto;padding:32px 24px;}
  .logo{font-size:1.2rem;font-weight:900;letter-spacing:3px;color:#D4AF37;margin-bottom:24px;}
  .card{background:#0d1520;border:1px solid rgba(212,175,55,.2);border-radius:16px;padding:28px;}
  h1{font-size:1.1rem;font-weight:800;color:#fff;margin-bottom:14px;}
  p{font-size:.88rem;color:#94a3b8;line-height:1.7;margin-bottom:12px;}
  .btn{display:inline-block;background:linear-gradient(135deg,#D946A6,#9333ea);color:#fff;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:700;font-size:.85rem;margin:14px 0;}
  .footer{font-size:.72rem;color:#334155;margin-top:24px;text-align:center;}
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">💎 PRODIGY</div>
  <div class="card">
    ${content}
  </div>
  <div class="footer">
    PRODIGY Lab Dental · Bogotá, Colombia · <a href="https://prodigylabdental.com" style="color:#D4AF37;">prodigylabdental.com</a><br>
    <a href="https://prodigylabdental.com/unsubscribe?token={{TOKEN}}" style="color:#475569;">Cancelar suscripción</a>
  </div>
</div>
</body>
</html>`;

  if (tipo === 'bienvenida') return base(`
    <h1>¡Bienvenido a PRODIGY! 🎉</h1>
    <p>Tu cuenta ha sido creada exitosamente. Ya puedes acceder al portal para hacer seguimiento de tus casos en tiempo real.</p>
    <a href="https://prodigylabdental.com/app/client-panel.html" class="btn">Ir a mi portal →</a>
    <p style="font-size:.78rem;color:#475569;">Tu clave temporal es <strong style="color:#fbbf24;">ProdigyTemp2026!</strong> — Cámbiala al ingresar por seguridad.</p>
  `);

  if (tipo === 'pedido_confirmado') return base(`
    <h1>✅ Pedido confirmado</h1>
    <p>${text || 'Tu pedido ha sido recibido y está en proceso. Te notificamos cuando el diseño esté listo.'}</p>
    <a href="https://prodigylabdental.com/seguimiento-caso" class="btn">Ver seguimiento →</a>
  `);

  if (tipo === 'diseno_listo') return base(`
    <h1>🎨 Tu diseño está listo</h1>
    <p>${text || 'El diseño CAD de tu caso está completo y listo para revisar. Apruébalo o solicita ajustes desde el portal.'}</p>
    <a href="https://prodigylabdental.com/app/client-panel.html" class="btn">Revisar diseño →</a>
  `);

  if (tipo === 'cotizacion_enviada') return base(`
    <h1>📋 Tu cotización está lista</h1>
    <p>${text || 'Hemos preparado una cotización para tu caso. Revísala y conviértela en pedido cuando estés listo.'}</p>
    <a href="https://prodigylabdental.com/app/cotizaciones.html" class="btn">Ver cotización →</a>
    <p style="font-size:.78rem;color:#475569;">La cotización tiene una vigencia de 30 días. Si tienes preguntas, responde este correo o escríbenos por WhatsApp.</p>
  `);

  if (tipo === 'pedido_entregado') return base(`
    <h1>🚀 Tu pedido fue entregado</h1>
    <p>${text || 'Tu caso ha sido despachado y está en camino. Revisa el seguimiento en el portal.'}</p>
    <a href="https://prodigylabdental.com/seguimiento-caso" class="btn">Ver seguimiento →</a>
    <p style="font-size:.78rem;color:#475569;">Si tienes algún problema con la entrega, contáctanos de inmediato por WhatsApp +57 321 281 6716.</p>
  `);

  if (tipo === 'stock_bajo') return base(`
    <h1>⚠️ Alerta de inventario</h1>
    <p>${text || 'Uno o más materiales del inventario están por debajo del mínimo establecido.'}</p>
    <a href="https://prodigylabdental.com/app/inventario.html" class="btn">Ver inventario →</a>
  `);

  // Default genérico
  return base(`<h1>${subject}</h1><p>${text || ''}</p>`);
}
