/**
 * Cloudflare Pages Function — PayPal: crear orden (server-side, precio autoritativo)
 * POST /api/paypal-create-order   Body: { referencia }   → { id, monto_usd, recargo_pct }
 * GET  /api/paypal-create-order?tipo=pedido → { disponible, client_id, sandbox, recargo_pct }
 *
 * SEGURIDAD: el monto NUNCA viene del cliente. Se lee `precio_total` (COP) del pedido de PRODIGY
 * en la BD por su `codigo` (=referencia) y se calcula con cobroPedido() de ./paypal-pedidos.js
 * (+7 % de recargo internacional que asume el pagador, convertido a USD). PayPal crea la orden con
 * ESE monto. La captura se verifica en /api/paypal-capture. 20-nov-2026: solo pedidos de PRODIGY
 * (la app de PayPal es compartida con Alejandro CAD/CAM), no se crea orden para un pedido ya pagado
 * y el client-id público lo entrega el servidor (GET), igual que en el gemelo.
 *
 * Env vars (Cloudflare Pages → Settings → Environment Variables):
 *   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET   (Live)
 *   PAYPAL_ENV = live | sandbox              (default: live)
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import { cobroPedido, configPedidos, descripcionPedido, leerPedido } from './paypal-pedidos.js';

const PP_BASE = (env) => (env.PAYPAL_ENV === 'sandbox')
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

function cors(origin) {
  const ok = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'].includes(origin)
    || /^https:\/\/([a-z0-9-]+\.)?dental-portfolio-em6\.pages\.dev$/.test(origin || '');
  return {
    'Access-Control-Allow-Origin':  ok ? origin : 'https://prodigylabdental.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

// GET ?tipo=pedido → { disponible, client_id, recargo_pct } (js/pagos.js decide si pinta el botón de PayPal)
export async function onRequestGet(context) {
  const { request, env } = context;
  const h = cors(request.headers.get('Origin') || '');
  if (new URL(request.url).searchParams.get('tipo') !== 'pedido') return new Response(JSON.stringify({ error: 'Usa POST' }), { status: 405, headers: h });
  return configPedidos(env, h);
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

  // Precio AUTORITATIVO desde la BD (por codigo + negocio), nunca del cliente
  let pedido;
  try { pedido = await leerPedido(env, referencia); }
  catch { return new Response(JSON.stringify({ error: 'No se pudo validar el pedido' }), { status: 502, headers: h }); }
  if (pedido && pedido.pago_estado === 'pago_confirmado') {
    return new Response(JSON.stringify({ error: 'Este pedido ya está pagado: no se cobró nada.' }), { status: 409, headers: h });
  }
  const cobro = pedido ? cobroPedido(pedido) : null;
  if (!pedido || !(cobro.total_usd > 0)) {
    return new Response(JSON.stringify({ error: 'Pedido no encontrado o sin monto válido' }), { status: 400, headers: h });
  }

  const montoUSD = cobro.total_usd.toFixed(2);

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
          description: descripcionPedido(referencia),
          amount: { currency_code: 'USD', value: montoUSD },
        }],
        application_context: { brand_name: 'PRODIGY Lab Dental', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW' },
      }),
    });
    const order = await r.json();
    if (!r.ok || !order.id) {
      console.error('[paypal-create-order]', JSON.stringify(order).slice(0, 300));
      return new Response(JSON.stringify({ error: 'No se pudo crear la orden de PayPal' }), { status: 502, headers: h });
    }
    return new Response(JSON.stringify({ id: order.id, monto_usd: montoUSD, recargo_pct: cobro.recargo_pct }), { status: 200, headers: h });
  } catch (e) {
    console.error('[paypal-create-order]', e.message);
    return new Response(JSON.stringify({ error: 'Error conectando con PayPal' }), { status: 502, headers: h });
  }
}
