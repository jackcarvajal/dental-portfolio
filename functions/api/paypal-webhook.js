/**
 * Cloudflare Pages Function — PayPal Webhook (red de seguridad / reconciliación)
 * POST /api/paypal-webhook
 *
 * La confirmación PRIMARIA del pago es la captura síncrona (/api/paypal-capture).
 * Este webhook es el RESPALDO: si la captura tuvo éxito en PayPal pero falló el
 * write a la BD (corte de red, tab cerrada), PayPal reintenta el evento
 * PAYMENT.CAPTURE.COMPLETED y aquí se marca Pagado. Idempotente con la captura
 * (ambos saltan si el pedido ya está pago_confirmado).
 *
 * Env vars (Cloudflare Pages → Settings → Environment Variables):
 *   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_ENV(=live|sandbox),
 *   PAYPAL_WEBHOOK_ID  (PayPal Dashboard → Webhooks → tu endpoint → Webhook ID),
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY
 *
 * Registrar en PayPal: Developer Dashboard → Webhooks → Add:
 *   URL: https://prodigylabdental.com/api/paypal-webhook
 *   Evento: PAYMENT.CAPTURE.COMPLETED
 */

const RECARGO_PAYPAL = 0.054;
const TASA_COP_USD   = 4200;
const MAX_BODY       = 64 * 1024;
const PP_BASE = (env) => (env.PAYPAL_ENV === 'sandbox') ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

async function ppToken(env) {
  const r = await fetch(`${PP_BASE(env)}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new Error('paypal_oauth');
  return (await r.json()).access_token;
}
const sbH = (env) => ({ Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`, apikey: env.SUPABASE_SERVICE_KEY, 'Content-Type': 'application/json' });

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET || !env.PAYPAL_WEBHOOK_ID || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return new Response('no configurado', { status: 503 });
  }
  // Tope de body antes de parsear (la función es pública)
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return new Response('payload grande', { status: 413 });
  const raw = await request.text();
  if (raw.length > MAX_BODY) return new Response('payload grande', { status: 413 });

  let evt;
  try { evt = JSON.parse(raw); } catch { return new Response('json inválido', { status: 400 }); }

  // ── Verificar la firma del webhook contra PayPal (barrera real) ──
  try {
    const token = await ppToken(env);
    const vr = await fetch(`${PP_BASE(env)}/v1/notifications/verify-webhook-signature`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_algo:         request.headers.get('paypal-auth-algo'),
        cert_url:          request.headers.get('paypal-cert-url'),
        transmission_id:   request.headers.get('paypal-transmission-id'),
        transmission_sig:  request.headers.get('paypal-transmission-sig'),
        transmission_time: request.headers.get('paypal-transmission-time'),
        webhook_id:        env.PAYPAL_WEBHOOK_ID,
        webhook_event:     evt,
      }),
    });
    const v = await vr.json();
    if (v.verification_status !== 'SUCCESS') {
      console.error('[paypal-webhook] firma no verificada:', v.verification_status);
      return new Response('firma inválida', { status: 401 });
    }
  } catch (e) {
    console.error('[paypal-webhook] verify error:', e.message);
    return new Response('error verificación', { status: 502 });
  }

  // Solo capturas completadas
  if (evt.event_type !== 'PAYMENT.CAPTURE.COMPLETED') return new Response('ignorado', { status: 200 });

  const res        = evt.resource || {};
  const referencia = String(res.custom_id || res.invoice_id || '').trim();
  const captureId  = String(res.id || '');
  const pagadoUSD  = Number(res.amount?.value || 0);
  if (!referencia) return new Response('sin referencia', { status: 200 });

  // Pedido autoritativo
  let pedido;
  try {
    const pr = await fetch(`${env.SUPABASE_URL}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(referencia)}&select=id,codigo,precio_total,pago_estado&limit=1`, { headers: sbH(env) });
    pedido = (await pr.json())?.[0];
  } catch { return new Response('error BD', { status: 502 }); }
  if (!pedido?.id) return new Response('pedido no encontrado', { status: 200 });

  // Idempotencia: si ya lo procesó la captura síncrona (o un reintento), salir
  if (pedido.pago_estado === 'pago_confirmado') return new Response('ya procesado', { status: 200 });

  const precioCOP  = Math.round(Number(pedido.precio_total) || 0);
  const montoTotal = Math.round(precioCOP * (1 + RECARGO_PAYPAL));
  const esperadoUSD = montoTotal / TASA_COP_USD;
  if (!(pagadoUSD > 0) || Math.abs(pagadoUSD - esperadoUSD) > 0.5) {
    console.error('[paypal-webhook] monto no coincide: pagado', pagadoUSD, 'esperado', esperadoUSD, 'ref', referencia);
    return new Response('monto no coincide', { status: 200 }); // 200 para que PayPal no reintente infinito
  }

  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${pedido.id}&pago_estado=neq.pago_confirmado`, {
      method: 'PATCH', headers: { ...sbH(env), Prefer: 'return=minimal' },
      body: JSON.stringify({ pago_estado: 'pago_confirmado', estado: 'Pagado', timestamp_pago_confirmado: new Date().toISOString(), pago_confirmado_por: 'paypal-webhook' }),
    });
    await fetch(`${env.SUPABASE_URL}/rest/v1/pagos`, {
      method: 'POST', headers: { ...sbH(env), Prefer: 'return=minimal' },
      body: JSON.stringify({
        pedido_id: pedido.id, pedido_codigo: pedido.codigo, referencia: captureId,
        pasarela: 'paypal', estado_pago: 'aprobado',
        monto_base: precioCOP, monto_total: montoTotal, monto_usd: pagadoUSD, moneda: 'USD', payload_raw: evt,
      }),
    });
  } catch (e) {
    console.error('[paypal-webhook] fallo registrando:', e.message);
    return new Response('error registro', { status: 502 }); // PayPal reintentará
  }

  return new Response('ok', { status: 200 });
}
