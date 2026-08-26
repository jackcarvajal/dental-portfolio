/**
 * Cloudflare Pages Function — PayPal: crear orden (server-side, precio autoritativo)
 * POST /api/paypal-create-order   Body: { referencia }   → { id, monto_usd }
 *
 * SEGURIDAD: el monto NUNCA viene del cliente. Se lee `precio_total` (COP) del
 * pedido en la BD por su `codigo` (=referencia), se le suma el recargo PayPal
 * (5.4%, que absorbe el cliente) y se convierte a USD. PayPal crea la orden con
 * ESE monto. La captura se verifica en /api/paypal-capture.
 *
 * Env vars (Cloudflare Pages → Settings → Environment Variables):
 *   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET   (Live)
 *   PAYPAL_ENV = live | sandbox              (default: live)
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

const RECARGO_PAYPAL = 0.054;   // 5.4% — lo absorbe el cliente (igual que PAGOS_CONFIG.paypal)
const TASA_COP_USD   = 4200;    // misma tasa referencial que js/pagos.js

const PP_BASE = (env) => (env.PAYPAL_ENV === 'sandbox')
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

function cors(origin) {
  const ok = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'].includes(origin)
    || (origin || '').includes('.pages.dev');
  return {
    'Access-Control-Allow-Origin':  ok ? origin : 'https://prodigylabdental.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

async function ppToken(env) {
  const r = await fetch(`${PP_BASE(env)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new Error('paypal_oauth');
  return (await r.json()).access_token;
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: cors(context.request.headers.get('Origin') || '') });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const h = cors(request.headers.get('Origin') || '');

  // Rate limit: 8/5min por IP
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = new Request('https://rl.internal/pp-create_' + ip);
  const hit = await caches.default.match(rlKey);
  const n = hit ? (parseInt(await hit.text(), 10) || 0) : 0;
  if (n >= 8) return new Response(JSON.stringify({ error: 'Demasiadas solicitudes.' }), { status: 429, headers: h });
  await caches.default.put(rlKey, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=300' } }));

  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'PayPal no configurado' }), { status: 503, headers: h });
  }

  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: h }); }
  const referencia = String(body.referencia || '').trim().slice(0, 60);
  if (!referencia) return new Response(JSON.stringify({ error: 'Falta la referencia del pedido' }), { status: 400, headers: h });

  // Precio AUTORITATIVO desde la BD (por codigo), nunca del cliente
  let precioCOP = 0, pedidoId = null;
  try {
    const pr = await fetch(
      `${env.SUPABASE_URL}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(referencia)}&select=id,precio_total&limit=1`,
      { headers: { Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`, apikey: env.SUPABASE_SERVICE_KEY } }
    );
    const d = await pr.json();
    precioCOP = Math.round(Number(d?.[0]?.precio_total) || 0);
    pedidoId  = d?.[0]?.id || null;
  } catch { return new Response(JSON.stringify({ error: 'No se pudo validar el pedido' }), { status: 502, headers: h }); }

  if (!pedidoId || precioCOP < 1000) {
    return new Response(JSON.stringify({ error: 'Pedido no encontrado o sin monto válido' }), { status: 400, headers: h });
  }

  const montoUSD = (Math.round(precioCOP * (1 + RECARGO_PAYPAL)) / TASA_COP_USD).toFixed(2);

  try {
    const token = await ppToken(env);
    const r = await fetch(`${PP_BASE(env)}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: referencia,
          custom_id: referencia,
          description: `PRODIGY Lab · Pedido ${referencia}`,
          amount: { currency_code: 'USD', value: montoUSD },
        }],
      }),
    });
    const order = await r.json();
    if (!r.ok || !order.id) {
      console.error('[paypal-create-order]', JSON.stringify(order).slice(0, 300));
      return new Response(JSON.stringify({ error: 'No se pudo crear la orden de PayPal' }), { status: 502, headers: h });
    }
    return new Response(JSON.stringify({ id: order.id, monto_usd: montoUSD }), { status: 200, headers: h });
  } catch (e) {
    console.error('[paypal-create-order]', e.message);
    return new Response(JSON.stringify({ error: 'Error conectando con PayPal' }), { status: 502, headers: h });
  }
}
