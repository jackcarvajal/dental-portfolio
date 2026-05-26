/**
 * Cloudflare Pages Function — Proxy de Facturación Electrónica DIAN via Alegra
 * POST /api/factura  → emite la factura electrónica y devuelve número + CUFE + PDF
 * GET  /api/factura?id=<alegra_invoice_id> → obtiene estado actual y PDF
 *
 * Variables de entorno requeridas (Cloudflare Pages → Settings → Environment Variables):
 *   ALEGRA_EMAIL  = correo@empresa.com    (usuario de Alegra)
 *   ALEGRA_TOKEN  = tu_api_token_de_alegra
 *   SUPABASE_URL  = https://xxx.supabase.co
 *   SUPABASE_SERVICE_KEY = service_role_key (para actualizar pedidos sin RLS)
 *
 * Nota IVA: Prótesis y dispositivos dentales están exentos de IVA en Colombia
 * (Art. 476 ET). Si tu servicio tiene IVA, agrega el id del impuesto en ALEGRA_TAX_ID.
 */

const ALEGRA_BASE = 'https://app.alegra.com/api/r1';

function corsHeaders(origin) {
  const allowed = ['https://prodigylabdental.com', 'https://www.prodigylabdental.com'];
  const ok = allowed.includes(origin) || origin.includes('.pages.dev');
  return {
    'Access-Control-Allow-Origin':  ok ? origin : 'https://prodigylabdental.com',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

function alegraAuth(email, token) {
  return 'Basic ' + btoa(`${email}:${token}`);
}

/* ── GET: estado de una factura ya emitida ─────────────────────────── */
export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const cors   = corsHeaders(origin);

  if (!env.ALEGRA_EMAIL || !env.ALEGRA_TOKEN) {
    return new Response(JSON.stringify({ error: 'Facturación no configurada' }), { status: 503, headers: cors });
  }

  const url     = new URL(request.url);
  const invoiceId = url.searchParams.get('id');
  if (!invoiceId) {
    return new Response(JSON.stringify({ error: 'Falta id de factura' }), { status: 400, headers: cors });
  }

  const res = await fetch(`${ALEGRA_BASE}/invoices/${invoiceId}`, {
    headers: { Authorization: alegraAuth(env.ALEGRA_EMAIL, env.ALEGRA_TOKEN) },
  });
  const data = await res.json();

  return new Response(JSON.stringify({
    numero:  data.numberTemplate?.number || data.number || null,
    cufe:    data.stamp?.cufe || data.stamp?.cude || null,
    pdf:     data.pdf || null,
    status:  data.status || null,
  }), { status: res.ok ? 200 : 502, headers: cors });
}

/* ── POST: emitir factura nueva ────────────────────────────────────── */
export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const cors   = corsHeaders(origin);

  if (!env.ALEGRA_EMAIL || !env.ALEGRA_TOKEN) {
    return new Response(JSON.stringify({ error: 'Facturación no configurada. Agrega ALEGRA_EMAIL y ALEGRA_TOKEN en Cloudflare.' }), { status: 503, headers: cors });
  }

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: cors });
  }

  const {
    pedido_id,
    codigo,
    servicio,
    precio_total,
    billing_tipo,
    billing_nit,
    billing_razon,
    billing_email,
  } = body;

  // Validación mínima
  if (!pedido_id || !precio_total || !billing_nit || !billing_razon || !billing_email) {
    return new Response(JSON.stringify({ error: 'Faltan campos obligatorios: pedido_id, precio_total, billing_nit, billing_razon, billing_email' }), { status: 400, headers: cors });
  }

  // Construir número de documento para Alegra
  const nitLimpio = billing_nit.replace(/\D/g, '');
  const dvMatch   = billing_nit.match(/[-\s](\d)$/);
  const dv        = dvMatch ? dvMatch[1] : null;

  // Tipo de id DIAN: NIT → 31, CC → 13, CE → 22, Pasaporte → 41
  const TIPO_MAP = { NIT: '31', CC: '13', CE: '22', PA: '41' };
  const idType   = TIPO_MAP[billing_tipo] || '31';

  const today = new Date().toISOString().slice(0, 10);

  const invoicePayload = {
    date:    today,
    dueDate: today,
    client: {
      name:           billing_razon,
      identification: nitLimpio,
      identificationObject: {
        type: idType,
        ...(dv !== null ? { dv } : {}),
      },
      email: billing_email,
    },
    items: [
      {
        name:        `Servicio PRODIGY Lab Dental`,
        description: `Caso #${codigo || pedido_id.slice(0, 8)} — ${servicio || 'Servicio dental'}`,
        quantity:    1,
        price:       Number(precio_total),
        tax:         [], // Exento IVA Art. 476 ET — ajustar si aplica
      },
    ],
    currency:      { code: 'COP', exchangeRate: 1 },
    paymentMethod: 'cash',
    anotation:     `PRODIGY Lab Dental · Caso #${codigo || pedido_id.slice(0, 8)}`,
  };

  // Emitir en Alegra
  const alegraRes = await fetch(`${ALEGRA_BASE}/invoices`, {
    method:  'POST',
    headers: {
      Authorization:  alegraAuth(env.ALEGRA_EMAIL, env.ALEGRA_TOKEN),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoicePayload),
  });

  const invoice = await alegraRes.json();

  if (!alegraRes.ok) {
    const errMsg = invoice?.message || invoice?.error || JSON.stringify(invoice).slice(0, 200);
    // Actualizar Supabase con el error
    await patchPedido(env, pedido_id, {
      factura_estado: 'error',
      factura_error:  errMsg,
    });
    return new Response(JSON.stringify({ error: 'Error Alegra: ' + errMsg }), { status: 502, headers: cors });
  }

  const numero  = invoice.numberTemplate?.number || invoice.number || null;
  const cufe    = invoice.stamp?.cufe || invoice.stamp?.cude || null;
  const pdfUrl  = invoice.pdf || null;
  const alegraId = String(invoice.id || '');

  // Actualizar Supabase con los datos de la factura emitida
  await patchPedido(env, pedido_id, {
    factura_estado:     'emitida',
    factura_alegra_id:  alegraId,
    factura_numero:     numero,
    factura_cufe:       cufe,
    factura_pdf_url:    pdfUrl,
    factura_emitida_at: new Date().toISOString(),
    factura_error:      null,
  });

  return new Response(JSON.stringify({
    ok:       true,
    alegra_id: alegraId,
    numero,
    cufe,
    pdf: pdfUrl,
  }), { status: 200, headers: cors });
}

/* ── Patch Supabase via REST API (service role, sin RLS) ───────────── */
async function patchPedido(env, pedidoId, fields) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return;
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${pedidoId}`, {
      method:  'PATCH',
      headers: {
        apikey:        env.SUPABASE_SERVICE_KEY,
        Authorization: 'Bearer ' + env.SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        Prefer:        'return=minimal',
      },
      body: JSON.stringify(fields),
    });
  } catch { /* silencioso — el front actualiza el estado igualmente */ }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin') || '';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  origin,
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
