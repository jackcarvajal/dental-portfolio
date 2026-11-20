/**
 * PayPal para PEDIDOS de PRODIGY Lab Dental — módulo compartido, NO es un endpoint (no exporta onRequest*).
 * Única fuente de verdad del monto que usan:
 *   GET  /api/paypal-create-order?tipo=pedido  → { disponible, client_id, sandbox, recargo_pct } (el botón usa ESE client-id)
 *   POST /api/paypal-create-order  { referencia }            → crea la orden con cobroPedido()
 *   POST /api/paypal-capture       { orderID, referencia }   → revisa la orden ANTES de capturar y la captura DESPUÉS
 *   POST /api/paypal-webhook       (PAYMENT.CAPTURE.COMPLETED de un pedido: respaldo si la captura se perdió)
 * Gemelo de functions/api/paypal-pedidos.js de Alejandro CAD/CAM (20-nov-2026, paridad de seguridad).
 *
 * REGLA DE MONEDA — PRODIGY guarda precio_total en PESOS (todos los flujos: diseño, fresado, impresión, lab):
 *   · Cobro = precio_total (COP) × 1,07 (recargo internacional: PayPal + cambio de moneda, lo asume el pagador)
 *     ÷ TASA_COP_USD, redondeado a centavos de dólar. Misma tasa referencial que js/pagos.js.
 *   · moneda distinta de COP (o vacía) → no se cobra por PayPal (monto 0: el equipo lo revisa).
 *   · La captura vale si es en USD y pagado ≥ cobro − 0,01.
 * Solo pedidos de PRODIGY (negocio = 'prodigy', o vacío en pedidos viejos): la app de PayPal la comparten las dos
 * webs, así que un pedido de Alejandro CAD/CAM ni se cobra ni se reconcilia aquí.
 */
export const NEGOCIO        = 'prodigy';
export const RECARGO_PAYPAL = 0.07;     // 7 % — mismo valor en create, capture y webhook (vienen de aquí)
export const TASA_COP_USD   = 4200;     // misma tasa referencial que js/pagos.js
export const MINIMO_COP     = 1000;     // ningún pedido real vale menos: debajo de eso el monto está mal
export const TOLERANCIA_USD = 0.01;     // un centavo de redondeo

// Lo que se cobra en PayPal: { cop (base), total_cop (con 7 %), total_usd, recargo_pct }.
export function cobroPedido(pedido) {
  const cop    = Math.round(Number(pedido && pedido.precio_total) || 0);
  const moneda = String((pedido && pedido.moneda) || 'COP').trim().toUpperCase();
  const recargo_pct = Math.round(RECARGO_PAYPAL * 100);
  if (moneda !== 'COP' || cop < MINIMO_COP) return { cop, total_cop: 0, total_usd: 0, recargo_pct, moneda };
  const total_cop = Math.round(cop * (1 + RECARGO_PAYPAL));
  const total_usd = Math.round((total_cop / TASA_COP_USD) * 100) / 100;
  return { cop, total_cop, total_usd, recargo_pct, moneda };
}

export const cubreElPedido = (pagado, esperado) => Number(pagado) > 0 && Number(pagado) >= Number(esperado) - TOLERANCIA_USD;
export const descripcionPedido = (codigo) => ('PRODIGY Lab Dental · Pedido ' + codigo).slice(0, 127);
// La orden/captura es de ESTE pedido (custom_id o reference_id = código).
export const esDelPedido = (unidad, codigo) => !!unidad && (unidad.custom_id === codigo || unidad.reference_id === codigo);

const sbH = (env) => ({ Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`, apikey: env.SUPABASE_SERVICE_KEY, 'Content-Type': 'application/json' });

// Pedido autoritativo de PRODIGY por su código (lanza si la base no responde).
export async function leerPedido(env, codigo) {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(codigo)}` +
    `&or=(negocio.eq.${NEGOCIO},negocio.is.null)&select=id,codigo,precio_total,moneda,pago_estado,flujo&limit=1`, { headers: sbH(env) });
  if (!r.ok) throw new Error('bd_pedido_' + r.status);
  return (await r.json())[0] || null;
}

// GET ?tipo=pedido — ¿se puede pagar un pedido con PayPal? El client-id público sale del servidor para que el
// botón siempre use las mismas credenciales con que se crean las órdenes (también en sandbox).
export function configPedidos(env, h) {
  const listo = !!(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET && env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY);
  const body = listo
    ? { disponible: true, client_id: env.PAYPAL_CLIENT_ID, sandbox: env.PAYPAL_ENV === 'sandbox', recargo_pct: Math.round(RECARGO_PAYPAL * 100) }
    : { disponible: false, motivo: 'paypal_no_configurado' };
  return new Response(JSON.stringify(body), { status: 200, headers: h });
}
