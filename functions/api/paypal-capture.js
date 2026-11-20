/**
 * Cloudflare Pages Function — PayPal: capturar y confirmar (server-side)
 * POST /api/paypal-capture   Body: { orderID, referencia }   → { ok }
 *
 * SEGURIDAD: ANTES de capturar lee la orden en PayPal (debe ser de este pedido, en USD y cubrir el monto:
 * si no, no se toca el dinero); captura con el CLIENT_SECRET, confirma status=COMPLETED, vuelve a verificar
 * referencia, moneda y monto contra el pedido real de PRODIGY en la BD, y recién ahí marca Pagado
 * (service-role) e inserta en `pagos`. Nada de esto ocurre en el navegador.
 * Monto: cobroPedido() de ./paypal-pedidos.js (COP × 1,07 → USD, misma regla que create-order y el webhook).
 * 20-nov-2026 (paridad con Alejandro CAD/CAM): revisión previa a la captura, solo pedidos de PRODIGY,
 * tolerancia de 1 centavo (antes 0,50 USD), captura en revisión (PENDING) y tarjeta rechazada sin marcar Pagado.
 *
 * Env vars: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_ENV(=live|sandbox),
 *           SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import { cobroPedido, cubreElPedido, esDelPedido, leerPedido } from './paypal-pedidos.js';

const ORDER_RE = /^[A-Z0-9-]{5,40}$/i;
const PP_BASE = (env) => (env.PAYPAL_ENV === 'sandbox')
  ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

function cors(origin) {
  const ok = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'].includes(origin)
    || /^https:\/\/([a-z0-9-]+\.)?dental-portfolio-em6\.pages\.dev$/.test(origin || '');
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
    // 1) Contabilidad/finanzas — entró un pago (el admin también lo ve: el RPC
    //    prodigy_mis_notifs deja ver a admin/superadmin toda notif por rol)
    { ...base, destinatario_rol: 'contabilidad', destinatario_dept: null,
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

// El dinero salió pero la captura no cuadra con el pedido: aviso a finanzas para revisar/devolver. Best-effort.
async function notificarRevision(env, pedido, mensaje) {
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/notificaciones_internas`, {
      method: 'POST', headers: { ...sbHeaders(env), Prefer: 'return=minimal' },
      body: JSON.stringify({ tipo: 'pago', prioridad: 'alta', destinatario_rol: 'contabilidad', destinatario_dept: null,
        pedido_id: pedido.id, pedido_codigo: pedido.codigo, accion_url: '/app/panel-interno-operaciones.html', leida_por: [],
        titulo: '⚠️ Revisar pago PayPal — ' + pedido.codigo, mensaje }),
    });
  } catch (_e) { /* no bloquear la respuesta por un aviso */ }
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
  if (!ORDER_RE.test(orderID) || !referencia) return new Response(JSON.stringify({ error: 'Faltan datos del pago' }), { status: 400, headers: h });

  // Pedido autoritativo (solo de PRODIGY)
  let pedido;
  try { pedido = await leerPedido(env, referencia); }
  catch { return new Response(JSON.stringify({ error: 'No se pudo validar el pedido' }), { status: 502, headers: h }); }
  if (!pedido?.id) return new Response(JSON.stringify({ error: 'Pedido no encontrado' }), { status: 400, headers: h });

  // Idempotencia: si ya está confirmado, no recobrar ni re-insertar
  if (pedido.pago_estado === 'pago_confirmado') {
    return new Response(JSON.stringify({ ok: true, ya_confirmado: true }), { status: 200, headers: h });
  }

  const cobro = cobroPedido(pedido);                 // { cop, total_cop (con 7 %), total_usd }
  const precioCOP   = cobro.cop;
  const montoTotal  = cobro.total_cop;
  const esperadoUSD = cobro.total_usd;
  if (!(esperadoUSD > 0)) return new Response(JSON.stringify({ error: 'El pedido no tiene un monto válido: no se cobró nada.' }), { status: 400, headers: h });
  const json = (obj, status) => new Response(JSON.stringify(obj), { status, headers: h });

  let cap;
  try {
    const token = await ppToken(env);
    // 1) Leer la orden ANTES de capturar: si no es de este pedido, no es USD o no cubre el monto, no se toca el dinero.
    const go = await fetch(`${PP_BASE(env)}/v2/checkout/orders/${encodeURIComponent(orderID)}`, { headers: { Authorization: `Bearer ${token}` } });
    const orden = await go.json();
    if (!go.ok) { console.error('[paypal-capture] leer orden:', JSON.stringify(orden).slice(0, 300)); return json({ error: 'No se encontró la orden de PayPal' }, 400); }
    const u0 = (orden.purchase_units || [])[0] || {};
    if (!esDelPedido(u0, referencia) || u0.amount?.currency_code !== 'USD' || !cubreElPedido(u0.amount?.value, esperadoUSD)) {
      console.error('[paypal-capture] orden no corresponde al pedido', referencia, JSON.stringify(orden.purchase_units || []).slice(0, 300));
      return json({ error: 'La orden de PayPal no corresponde a este pedido: no se cobró nada.' }, 400);
    }
    // 2) Capturar (si ya estaba capturada —respuesta perdida— se usa tal cual).
    if (orden.status === 'APPROVED') {
      const r = await fetch(`${PP_BASE(env)}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': 'ped-cap-' + orderID },
      });
      cap = await r.json();
      if (!r.ok) {
        const issue = ((cap.details || [])[0] || {}).issue || '';
        if (issue === 'INSTRUMENT_DECLINED') return json({ error: 'PayPal rechazó ese medio de pago. Elige otro.', reintentar: true }, 402);
        console.error('[paypal-capture] no completada:', JSON.stringify(cap).slice(0, 300));
        return json({ error: 'El pago no se completó en PayPal' }, 402);
      }
    } else if (orden.status === 'COMPLETED') {
      cap = orden;
    } else {
      return json({ error: 'El pago aún no está aprobado en PayPal' }, 402);
    }
  } catch (e) {
    console.error('[paypal-capture]', e.message);
    return json({ error: 'Error capturando el pago' }, 502);
  }

  // 3) Verificar la captura en sí: referencia, estado, moneda y monto (anti-swap / anti-manipulación)
  const pu  = (cap.purchase_units || [])[0] || {};
  const capt = (pu.payments?.captures || [])[0] || {};
  const pagadoUSD = Number(capt.amount?.value || 0);
  const monedaPagada = String(capt.amount?.currency_code || '');
  if (capt.status === 'PENDING') {
    // PayPal la dejó en revisión: el webhook PAYMENT.CAPTURE.COMPLETED marca Pagado cuando la libere.
    return json({ ok: false, pendiente: true, error: 'PayPal dejó tu pago en revisión. El pedido se marca pagado solo cuando PayPal lo libere; no pagues de nuevo.' }, 202);
  }
  // El número solo vale en dólares: una orden creada en otra moneda (p. ej. JPY) con el mismo valor no paga el pedido.
  if (!esDelPedido(pu, referencia) || capt.status !== 'COMPLETED' || monedaPagada !== 'USD' || !cubreElPedido(pagadoUSD, esperadoUSD)) {
    console.error('[paypal-capture] captura no cuadra', referencia, capt.status, monedaPagada, 'pagado', pagadoUSD, 'esperado', esperadoUSD);
    await notificarRevision(env, pedido, 'La captura de PayPal (' + (capt.id || orderID) + ') no cuadra con el pedido (' + (capt.status || '?') + ', ' + monedaPagada + ' ' + pagadoUSD + ' de US$' + esperadoUSD + '). Revisar en PayPal antes de producir o devolver.');
    return json({ ok: false, capturado: true, error: 'PayPal registró el pago pero no cuadra con el pedido. Ya avisamos al equipo; no pagues de nuevo.' }, 409);
  }

  // Marcar Pagado + registrar en pagos (service-role)
  try {
    // Solo si sigue sin confirmar: si el webhook ganó la carrera, no se duplica el registro en `pagos` ni el aviso.
    const up = await fetch(`${env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${pedido.id}&pago_estado=neq.pago_confirmado&select=id`, {
      method: 'PATCH', headers: { ...sbHeaders(env), Prefer: 'return=representation' },
      body: JSON.stringify({
        pago_estado: 'pago_confirmado', estado: 'Pagado',
        timestamp_pago_confirmado: new Date().toISOString(), pago_confirmado_por: 'paypal',
      }),
    });
    if (up.ok && !((await up.json()) || []).length) return json({ ok: true, ya_confirmado: true }, 200);
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
