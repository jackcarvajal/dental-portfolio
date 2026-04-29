/**
 * Cloudflare Pages Function — Stripe Checkout Proxy
 * POST /api/stripe-checkout
 *
 * Crea una Stripe Checkout Session con el monto calculado
 * y devuelve la URL de pago.
 *
 * Variables de entorno requeridas (Cloudflare Pages → Settings → Env vars):
 *   STRIPE_SECRET_KEY  = sk_live_... (Production)
 *   STRIPE_SECRET_KEY  = sk_test_... (Preview)
 *
 * Body esperado:
 *   { amount_cop, description, pedido_id, doctor_email, es_nuevo_cliente, success_url, cancel_url }
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  /* ── CORS ─────────────────────────────────────────── */
  const origin = request.headers.get('Origin') || '';
  const allowed = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'];
  const isAllowed = allowed.includes(origin) || origin.includes('.pages.dev');
  const corsH = {
    'Access-Control-Allow-Origin':  isAllowed ? origin : 'https://prodigylabdental.com',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  const sk = env.STRIPE_SECRET_KEY;
  if (!sk) return new Response(JSON.stringify({ error: 'Stripe no configurado' }), { status: 503, headers: corsH });

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: corsH });
  }

  const { amount_cop, description, pedido_id, doctor_email, es_nuevo_cliente, success_url, cancel_url } = body;

  if (!amount_cop || amount_cop < 1000) {
    return new Response(JSON.stringify({ error: 'Monto inválido' }), { status: 400, headers: corsH });
  }

  // Regla de cobro: cliente nuevo → 100%, cliente existente → 50%
  const cobrar_pct  = es_nuevo_cliente ? 1.0 : 0.5;
  const cobrar_cop  = Math.round(amount_cop * cobrar_pct);
  const cobrar_cents = cobrar_cop * 100; // Stripe usa centavos (COP no tiene decimales)

  const label = es_nuevo_cliente
    ? `${description} — Pago total (cliente nuevo)`
    : `${description} — Abono 50% (${new Intl.NumberFormat('es-CO').format(amount_cop)} COP total)`;

  try {
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + sk,
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'mode':                    'payment',
        'line_items[0][price_data][currency]':            'cop',
        'line_items[0][price_data][unit_amount]':         String(cobrar_cents),
        'line_items[0][price_data][product_data][name]':  label,
        'line_items[0][quantity]':                        '1',
        'customer_email':    doctor_email || '',
        'metadata[pedido_id]':          pedido_id || '',
        'metadata[monto_total_cop]':    String(amount_cop),
        'metadata[cobrado_pct]':        String(cobrar_pct * 100) + '%',
        'metadata[es_nuevo_cliente]':   es_nuevo_cliente ? 'si' : 'no',
        'success_url': success_url || 'https://prodigylabdental.com/app/success.html?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url':  cancel_url  || 'https://prodigylabdental.com/flujo-diseno'
      })
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error('Stripe error:', session);
      return new Response(JSON.stringify({ error: session.error?.message || 'Error de Stripe' }), { status: 502, headers: corsH });
    }

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), { status: 200, headers: corsH });

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Error de conexión' }), { status: 502, headers: corsH });
  }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin') || '';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
