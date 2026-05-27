/**
 * Cloudflare Pages Function — Proxy Facturación Electrónica DIAN via Factus
 * (Factus es gratuito hasta 50 facturas/mes — factus.com.co)
 *
 * POST /api/factura  → emite factura electrónica, devuelve número + CUFE + PDF
 * GET  /api/factura?id=<factus_bill_id> → consulta estado y PDF
 *
 * Variables de entorno requeridas (Cloudflare Pages → Settings → Environment Variables):
 *   FACTUS_CLIENT_ID      = tu_client_id_de_factus
 *   FACTUS_CLIENT_SECRET  = tu_client_secret_de_factus
 *   FACTUS_NUMBERING_ID   = id del rango de numeración configurado en Factus (número entero)
 *   SUPABASE_URL          = https://xxx.supabase.co
 *   SUPABASE_SERVICE_KEY  = service_role_key
 *
 * Cómo obtener credenciales Factus:
 *   1. Crear cuenta en factus.com.co
 *   2. Configurar empresa (NIT, actividad económica, resolución DIAN)
 *   3. Ir a Configuración → API → Generar credenciales
 *   4. Ir a Configuración → Numeración → copiar el ID del rango activo
 *
 * IVA: prótesis y dispositivos dentales exentos (Art. 476 ET).
 * Tribute ID 22 = Exento IVA en Factus.
 */

const FACTUS_BASE = 'https://api.factus.com.co';

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

/* ── OAuth2: obtener access_token de Factus ────────────────────────── */
async function getFactusToken(clientId, clientSecret) {
  const res = await fetch(`${FACTUS_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error('Factus auth failed: ' + err.slice(0, 200));
  }
  const data = await res.json();
  return data.access_token;
}

/* ── GET: estado / PDF de una factura ya emitida ───────────────────── */
export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const cors   = corsHeaders(origin);

  if (!env.FACTUS_CLIENT_ID || !env.FACTUS_CLIENT_SECRET) {
    return new Response(JSON.stringify({ error: 'Facturación no configurada' }), { status: 503, headers: cors });
  }

  const billId = new URL(request.url).searchParams.get('id');
  if (!billId) {
    return new Response(JSON.stringify({ error: 'Falta id' }), { status: 400, headers: cors });
  }

  try {
    const token = await getFactusToken(env.FACTUS_CLIENT_ID, env.FACTUS_CLIENT_SECRET);
    const res   = await fetch(`${FACTUS_BASE}/v1/bills/${billId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const bill = data.data || data;

    return new Response(JSON.stringify({
      numero: bill.number || bill.bill_number || null,
      cufe:   bill.cufe   || bill.cude        || null,
      pdf:    bill.pdf_url || bill.download_url || null,
      status: bill.status || null,
    }), { status: res.ok ? 200 : 502, headers: cors });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 502, headers: cors });
  }
}

/* ── Verificar que el llamador es admin via JWT de Supabase ──────────── */
async function verificarAdmin(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return false;
  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': env.SUPABASE_SERVICE_KEY }
    });
    if (!res.ok) return false;
    const user = await res.json();
    const ADMIN_EMAILS = ['jackalejandroc@gmail.com', 'prodigylab@gmail.com'];
    return ADMIN_EMAILS.includes(user.email) || user.app_metadata?.role === 'admin';
  } catch { return false; }
}

/* ── POST: emitir factura nueva ────────────────────────────────────── */
export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const cors   = corsHeaders(origin);

  if (!(await verificarAdmin(request, env))) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 403, headers: cors });
  }

  if (!env.FACTUS_CLIENT_ID || !env.FACTUS_CLIENT_SECRET) {
    return new Response(JSON.stringify({
      error: 'Facturación no configurada. Agrega FACTUS_CLIENT_ID y FACTUS_CLIENT_SECRET en Cloudflare.'
    }), { status: 503, headers: cors });
  }

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: cors });
  }

  const { pedido_id, codigo, servicio, precio_total, billing_tipo, billing_nit, billing_razon, billing_email, iva_rate } = body;

  if (!pedido_id || !precio_total || !billing_nit || !billing_razon || !billing_email) {
    return new Response(JSON.stringify({
      error: 'Faltan campos: pedido_id, precio_total, billing_nit, billing_razon, billing_email'
    }), { status: 400, headers: cors });
  }

  // Limpiar NIT y extraer dígito verificador
  const nitBase  = billing_nit.replace(/[^0-9]/g, '').slice(0, 15);
  const dvMatch  = billing_nit.match(/[-\s]?(\d)$/);
  const dv       = dvMatch ? dvMatch[1] : calcularDV(nitBase);

  // Tipo de documento DIAN: NIT=31, CC=13, CE=22
  const TIPO_DIAN = { NIT: '31', CC: '13', CE: '22' };
  const tipoDoc   = TIPO_DIAN[billing_tipo] || '31';

  // Organización legal: 1=Persona Natural, 2=Persona Jurídica
  const esJuridica = billing_tipo === 'NIT';

  // iva_rate: 0 = exento (Art. 476 ET), 19 = gravado
  const ivaRate     = Number(iva_rate ?? 0);
  const esExento    = ivaRate === 0;
  const taxRate     = esExento ? '0.00' : '19.00';
  const isExcluded  = esExento ? 1 : 0;
  // tribute_id ítem: 22 = Exento, 1 = IVA gravado
  const tributeItem = esExento ? 22 : 1;
  // Precio base: si es gravado, el total incluye IVA → base = total / 1.19
  const precioBase  = esExento ? Number(precio_total) : Math.round(Number(precio_total) / 1.19);

  // Tribute ID cliente: 21=Responsable IVA, 22=No responsable IVA
  const tributeCliente = esJuridica ? '21' : '22';

  const today = new Date().toISOString().slice(0, 10);

  const invoicePayload = {
    numbering_range_id: Number(env.FACTUS_NUMBERING_ID || 1),
    reference_code:     `PRODIGY-${codigo || pedido_id.slice(0, 8)}`,
    observation:        `Caso #${codigo || pedido_id.slice(0, 8)} — PRODIGY Lab Dental`,
    payment_method_code: '10', // 10=Efectivo/transferencia, 49=Otro
    due_date:           today,
    customer: {
      identification:       nitBase,
      dv:                   dv,
      company:              esJuridica ? billing_razon : null,
      trade_name:           billing_razon,
      names:                esJuridica ? null : billing_razon.split(' ')[0] || billing_razon,
      surnames:             esJuridica ? null : billing_razon.split(' ').slice(1).join(' ') || null,
      address:              'Colombia',
      email:                billing_email,
      phone:                '',
      legal_organization_id: esJuridica ? '2' : '1',
      tribute_id:           tributeCliente,
      identification_document_id: tipoDoc,
    },
    items: [
      {
        code_reference:   `SRV-${(codigo || pedido_id.slice(0, 8)).replace(/[^A-Z0-9]/gi, '')}`,
        name:             `${servicio || 'Servicio dental'} — PRODIGY Lab Dental`,
        quantity:         1,
        discount_rate:    0,
        price:            precioBase,
        tax_rate:         taxRate,        // '0.00' exento | '19.00' gravado
        unit_measure_id:  70,             // 70 = Unidad de servicio DIAN
        standard_code_id: 1,              // 1 = Estándar UNSPSC
        is_excluded:      isExcluded,     // 1 = Exento Art.476 ET | 0 = Gravado
        tribute_id:       tributeItem,    // 22 = Exento | 1 = IVA
        withholding_taxes: [],
      },
    ],
  };

  try {
    const token = await getFactusToken(env.FACTUS_CLIENT_ID, env.FACTUS_CLIENT_SECRET);

    const factusRes = await fetch(`${FACTUS_BASE}/v1/bills/validate`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept:         'application/json',
      },
      body: JSON.stringify(invoicePayload),
    });

    const result = await factusRes.json();

    if (!factusRes.ok) {
      const errMsg = result?.message || result?.error || JSON.stringify(result).slice(0, 300);
      await patchPedido(env, pedido_id, { factura_estado: 'error', factura_error: errMsg });
      return new Response(JSON.stringify({ error: 'Error Factus: ' + errMsg }), { status: 502, headers: cors });
    }

    const bill    = result.data || result;
    const numero  = bill.number  || bill.bill_number || null;
    const cufe    = bill.cufe    || bill.cude        || null;
    const pdfUrl  = bill.pdf_url || bill.download_url || null;
    const factusId = String(bill.id || '');

    await patchPedido(env, pedido_id, {
      factura_estado:     'emitida',
      factura_alegra_id:  factusId, // columna reutilizada para id del proveedor
      factura_numero:     numero,
      factura_cufe:       cufe,
      factura_pdf_url:    pdfUrl,
      factura_emitida_at: new Date().toISOString(),
      factura_error:      null,
    });

    return new Response(JSON.stringify({ ok: true, alegra_id: factusId, numero, cufe, pdf: pdfUrl }), {
      status: 200,
      headers: cors,
    });

  } catch (e) {
    await patchPedido(env, pedido_id, { factura_estado: 'error', factura_error: e.message });
    return new Response(JSON.stringify({ error: e.message }), { status: 502, headers: cors });
  }
}

/* ── Patch Supabase ────────────────────────────────────────────────── */
async function patchPedido(env, pedidoId, fields) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return;
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${pedidoId}`, {
      method:  'PATCH',
      headers: {
        apikey:         env.SUPABASE_SERVICE_KEY,
        Authorization:  'Bearer ' + env.SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        Prefer:         'return=minimal',
      },
      body: JSON.stringify(fields),
    });
  } catch { /* silencioso */ }
}

/* ── DV calculator DIAN ────────────────────────────────────────────── */
function calcularDV(nit) {
  const primos  = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  const digits  = String(nit).replace(/\D/g, '').split('').reverse();
  let sum = 0;
  for (let i = 0; i < digits.length && i < primos.length; i++) sum += parseInt(digits[i]) * primos[i];
  const rem = sum % 11;
  return String(rem <= 1 ? rem : 11 - rem);
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
