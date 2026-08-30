/**
 * Cloudflare Pages Function — PayPal: capturar y confirmar (server-side)
 * POST /api/paypal-capture   Body: { orderID, referencia }   → { ok }
 *
 * SEGURIDAD: captura la orden contra la API de PayPal con el CLIENT_SECRET,
 * confirma status=COMPLETED, verifica que la referencia y el monto coincidan
 * con el pedido real en la BD, y recién ahí marca Pagado (service-role) e
 * inserta en `pagos`. Nada de esto ocurre en el navegador.
 *
 * Env vars: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_ENV(=live|sandbox),
 *           SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

const RECARGO_PAYPAL = 0.054;
const TASA_COP_USD   = 4200;
const PP_BASE = (env) => (env.PAYPAL_ENV === 'sandbox')
  ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

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
    headers: { Authorization: 'Basic ' + btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!r.ok) throw new Error('paypal_oauth');
  return (await r.json()).access_token;
}
const sbHeaders = (env) => ({ Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`, apikey: env.SUPABASE_SERVICE_KEY, 'Content-Type': 'application/json' });

// Avisa al staff (admin/finanzas) por el sistema de notificaciones internas (la campana del
// panel, ruteada por rol/depto). Best-effort: nunca rompe el pago si falla.
function _deptDePedido(flujo) {
  const f = String(flujo || '').replace('_internacional', '');
  return ['diseno', 'fresado', 'impresion'].indexOf(f) >= 0 ? f : 'diseno';
}
async function notificarStaffPago(env, pedido, detalle) {
  const dept = _deptDePedido(pedido.flujo);
  const base = {
    tipo: 'pago', prioridad: 'alta', pedido_id: pedido.id, pedido_codigo: pedido.codigo,
    accion_url: '/app/panel-interno-operaciones.html', leida_por: [],
  };
  const notifs = [
    // 1) Admin / finanzas — entró un pago
    { ...base, destinatario_rol: 'admin', destinatario_dept: null,
      titulo: '💰 Pago recibido — ' + pedido.codigo,
      mensaje: 'Pago confirmado (' + detalle + ') del pedido ' + pedido.codigo + '.' },
    // 2) Área de producción según el flujo — ya pagado, pueden empezar
    { ...base, destinatario_rol: null, destinatario_dept: dept,
      titulo: '✅ Pedido pagado — ' + pedido.codigo,
      mensaje: 'El pedido ' + pedido.codigo + ' ya está pagado (' + detalle + '). Puede entrar a producción (' + dept + ').' },
  ];
  for (const n of notifs) {
    try {
      await fetch(`${env.SUPABASE_URL}/rest/v1/notificaciones_internas`, {
        method: 'POST', headers: { ...sbHeaders(env), Prefer: 'return=minimal' }, body: JSON.stringify(n),
      });
    } catch (_e) { /* best-effort: no bloquear el pago por un fallo de notificación */ }
  }
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: cors(context.request.headers.get('Origin') || '') });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const h = cors(request.headers.get('Origin') || '');

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = new Request('https://rl.internal/pp-capture_' + ip);
  const hit = await caches.default.match(rlKey);
  const n = hit ? (parseInt(await hit.text(), 10) || 0) : 0;
  if (n >= 10) return new Response(JSON.stringify({ error: 'Demasiadas solicitudes.' }), { status: 429, headers: h });
  await caches.default.put(rlKey, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=300' } }));

  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'PayPal no configurado' }), { status: 503, headers: h });
  }

  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: h }); }
  const orderID    = String(body.orderID || '').trim().slice(0, 60);
  const referencia = String(body.referencia || '').trim().slice(0, 60);
  if (!orderID || !referencia) return new Response(JSON.stringify({ error: 'Faltan datos del pago' }), { status: 400, headers: h });

  // Pedido autoritativo
  let pedido;
  try {
    const pr = await fetch(`${env.SUPABASE_URL}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(referencia)}&select=id,codigo,precio_total,pago_estado,flujo&limit=1`, { headers: sbHeaders(env) });
    pedido = (await pr.json())?.[0];
  } catch { return new Response(JSON.stringify({ error: 'No se pudo validar el pedido' }), { status: 502, headers: h }); }
  if (!pedido?.id) return new Response(JSON.stringify({ error: 'Pedido no encontrado' }), { status: 400, headers: h });

  const precioCOP  = Math.round(Number(pedido.precio_total) || 0);
  const montoTotal = Math.round(precioCOP * (1 + RECARGO_PAYPAL));      // COP con recargo
  const esperadoUSD = montoTotal / TASA_COP_USD;

  // Idempotencia: si ya está confirmado, no recobrar ni re-insertar
  if (pedido.pago_estado === 'pago_confirmado') {
    return new Response(JSON.stringify({ ok: true, ya_confirmado: true }), { status: 200, headers: h });
  }

  // Capturar en PayPal
  let cap;
  try {
    const token = await ppToken(env);
    const r = await fetch(`${PP_BASE(env)}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    cap = await r.json();
    if (!r.ok || cap.status !== 'COMPLETED') {
      console.error('[paypal-capture] no completada:', JSON.stringify(cap).slice(0, 300));
      return new Response(JSON.stringify({ error: 'El pago no se completó en PayPal' }), { status: 402, headers: h });
    }
  } catch (e) {
    console.error('[paypal-capture]', e.message);
    return new Response(JSON.stringify({ error: 'Error capturando el pago' }), { status: 502, headers: h });
  }

  // Verificar referencia y monto contra el pedido (anti-swap / anti-manipulación)
  const pu  = (cap.purchase_units || [])[0] || {};
  const ref = pu.reference_id || pu.custom_id;
  const capt = (pu.payments?.captures || [])[0] || {};
  const pagadoUSD = Number(capt.amount?.value || 0);
  if (ref !== referencia) {
    console.error('[paypal-capture] referencia no coincide:', ref, '!=', referencia);
    return new Response(JSON.stringify({ error: 'La referencia del pago no coincide' }), { status: 400, headers: h });
  }
  if (!(pagadoUSD > 0) || Math.abs(pagadoUSD - esperadoUSD) > 0.5) {
    console.error('[paypal-capture] monto no coincide: pagado', pagadoUSD, 'esperado', esperadoUSD);
    return new Response(JSON.stringify({ error: 'El monto pagado no coincide con el pedido' }), { status: 400, headers: h });
  }

  // Marcar Pagado + registrar en pagos (service-role)
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${pedido.id}`, {
      method: 'PATCH', headers: { ...sbHeaders(env), Prefer: 'return=minimal' },
      body: JSON.stringify({
        pago_estado: 'pago_confirmado', estado: 'Pagado',
        timestamp_pago_confirmado: new Date().toISOString(), pago_confirmado_por: 'paypal',
      }),
    });
    await fetch(`${env.SUPABASE_URL}/rest/v1/pagos`, {
      method: 'POST', headers: { ...sbHeaders(env), Prefer: 'return=minimal' },
      body: JSON.stringify({
        pedido_id: pedido.id, pedido_codigo: pedido.codigo, referencia: capt.id || orderID,
        pasarela: 'paypal', estado_pago: 'aprobado',
        monto_base: precioCOP, monto_total: montoTotal, monto_usd: pagadoUSD,
        moneda: 'USD', payload_raw: cap,
      }),
    });
    // Aviso al staff (finanzas/admin) por el sistema de notificaciones internas
    await notificarStaffPago(env, pedido, 'PayPal · US$' + pagadoUSD);
  } catch (e) {
    // El pago SÍ se capturó en PayPal; si falla el registro, se loguea pero no se le
    // dice al cliente que falló (su dinero salió). Un reintento/webhook lo reconcilia.
    console.error('[paypal-capture] pago capturado pero fallo el registro en BD:', e.message);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: h });
}
