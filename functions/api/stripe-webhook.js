/**
 * Cloudflare Pages Function — Webhook receptor de Stripe
 * POST /api/stripe-webhook
 *
 * Antes de este archivo NO existía ningún receptor de webhook de Stripe
 * en el proyecto — stripe-checkout.js solo creaba la sesión de pago, pero
 * nada confirmaba server-side que el cliente realmente pagó. El success_url
 * (redirección del navegador) no es prueba de pago: cualquiera puede
 * navegar directo a esa URL sin haber pagado.
 *
 * Variables de entorno requeridas (Cloudflare Pages → Settings → Env vars):
 *   STRIPE_SECRET_KEY    = sk_live_... (ya existe, usado por stripe-checkout.js)
 *   STRIPE_WEBHOOK_SECRET = whsec_... (Stripe Dashboard → Developers → Webhooks → tu endpoint → Signing secret)
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY (ya existen)
 *
 * Configurar en Stripe Dashboard → Developers → Webhooks → Add endpoint:
 *   URL:    https://prodigylabdental.com/api/stripe-webhook
 *   Evento: checkout.session.completed
 */

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  return bytes;
}

function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ── Verificación de firma Stripe (algoritmo documentado por Stripe) ──
 * Header Stripe-Signature: "t=<timestamp>,v1=<hmac_hex>"
 * Payload firmado: "<timestamp>.<rawBody>"
 * HMAC-SHA256 con el webhook secret, comparado en tiempo constante.
 * Rechaza timestamps de más de 5 minutos (defensa contra replay). */
async function verificarFirmaStripe(rawBody, sigHeader, secret) {
  const parts = Object.fromEntries(
    sigHeader.split(',').map(p => p.split('=')).map(([k, v]) => [k, v])
  );
  const timestamp = parts.t;
  const v1 = parts.v1;
  if (!timestamp || !v1) return false;

  const ageSec = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (ageSec > 300) return false; // más de 5 min — posible replay

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signed = `${timestamp}.${rawBody}`;
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed));
  const expected = bytesToHex(sigBuf);

  return timingSafeEqual(expected, v1);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.STRIPE_WEBHOOK_SECRET || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return new Response('config falta', { status: 500 });
  }

  const sigHeader = request.headers.get('Stripe-Signature') || '';
  const rawBody = await request.text();

  const firmaOk = await verificarFirmaStripe(rawBody, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!firmaOk) {
    return new Response('firma inválida', { status: 401 });
  }

  let event;
  try { event = JSON.parse(rawBody); } catch { return new Response('JSON inválido', { status: 400 }); }

  if (event.type !== 'checkout.session.completed') {
    return new Response('ok', { status: 200 }); // evento ignorado, no es un error
  }

  const session = event.data?.object;
  if (!session || session.payment_status !== 'paid') {
    return new Response('ok', { status: 200 });
  }

  const pedidoId = session.metadata?.pedido_id;
  if (!pedidoId) {
    return new Response('sin pedido_id en metadata', { status: 200 });
  }

  const sbHeaders = {
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    'apikey': env.SUPABASE_SERVICE_KEY,
    'Content-Type': 'application/json',
  };

  try {
    // ── Idempotencia: no procesar si ya está Pagado ──
    const pedRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${encodeURIComponent(pedidoId)}&select=id,codigo,estado,precio_total`,
      { headers: sbHeaders }
    );
    const pedidos = await pedRes.json();
    const pedido = pedidos?.[0];
    if (!pedido) return new Response('pedido no encontrado', { status: 200 });
    if (pedido.estado === 'Pagado') return new Response('ya procesado', { status: 200 });

    // ── Actualizar pedido ──
    await fetch(`${env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${encodeURIComponent(pedidoId)}&estado=neq.Pagado`, {
      method: 'PATCH',
      headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ estado: 'Pagado' }),
    });

    // ── Registrar pago (mismo schema real que webhook-handler de Wompi) ──
    const montoTotal = (session.amount_total || 0) / 100;
    const pagoRes = await fetch(`${env.SUPABASE_URL}/rest/v1/pagos`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        pedido_id:     pedido.id,
        pedido_codigo: pedido.codigo,
        referencia:    session.id, // UNIQUE — id de la sesión de Stripe
        pasarela:      'stripe',
        estado_pago:   'aprobado',
        monto_base:    montoTotal,
        monto_total:   montoTotal,
        moneda:        (session.currency || 'cop').toUpperCase(),
        payload_raw:   event,
      }),
    });
    if (!pagoRes.ok) {
      const errText = await pagoRes.text();
      console.error('[stripe-webhook] Error insertando en pagos:', errText, 'session:', session.id);
    }

    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error('[stripe-webhook] Error procesando evento:', e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
