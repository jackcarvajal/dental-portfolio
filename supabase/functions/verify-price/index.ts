/**
 * PRODIGY — Edge Function: verify-price v1.0
 * Agente 2: Finanzas — Recalcula precio en servidor antes del checkout.
 *
 * Nunca confiar en el precio del frontend — este endpoint es la fuente
 * de verdad del total a cobrar.
 *
 * Deploy:
 *   supabase functions deploy verify-price
 *
 * POST /functions/v1/verify-price
 * Body: { precio_base: number, pasarela: string, pais?: string }
 * Response: { precio_base, recargo_pct, recargo_amt, total, moneda, referencia_pre }
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type":                 "application/json",
};

// Límites de sanidad en COP
const PRECIO_MIN =       5_000;   //    $5.000 COP
const PRECIO_MAX = 5_000_000;     // $5.000.000 COP

// Tasa referencial COP → USD (actualizar mensualmente o usar API)
const TASA_COP_USD = 4_200;

// Recargas por pasarela
const RECARGAS: Record<string, { pct: number; moneda: "COP" | "USD" | "EUR" }> = {
    wompi:         { pct: 0.03,  moneda: "COP" }, // PSE / tarjeta Colombia
    transferencia: { pct: 0,     moneda: "COP" }, // Sin comisión
    paypal:        { pct: 0.054, moneda: "USD" }, // Internacional retail
    paddle:        { pct: 0.07,  moneda: "USD" }, // Merchant of Record — 7%
};

function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

serve(async (req) => {
    // CORS preflight
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
    if (req.method !== "POST")    return json({ error: "Método no permitido" }, 405);

    let body: { precio_base?: unknown; pasarela?: unknown; pais?: unknown };
    try {
        body = await req.json();
    } catch {
        return json({ error: "JSON inválido" }, 400);
    }

    const precio_base = Number(body.precio_base);
    const pasarela    = String(body.pasarela  ?? "wompi").toLowerCase();
    const pais        = String(body.pais       ?? "CO").toUpperCase();

    // Validar precio base
    if (!Number.isFinite(precio_base) || precio_base < PRECIO_MIN || precio_base > PRECIO_MAX) {
        return json({
            error: `precio_base fuera de rango. Acepto: ${PRECIO_MIN}–${PRECIO_MAX} COP`
        }, 400);
    }

    const cfg = RECARGAS[pasarela] ?? RECARGAS.wompi;
    const recargo_amt  = Math.round(precio_base * cfg.pct);
    const total_cop    = precio_base + recargo_amt;
    const total_usd    = cfg.moneda === "USD"
        ? parseFloat((total_cop / TASA_COP_USD).toFixed(2))
        : null;

    // Referencia pre-generada (el frontend la usa como sufijo; en producción
    // generar desde la tabla pedidos para garantizar unicidad)
    const referencia_pre =
        "PRD-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random().toString(36).substr(2, 4).toUpperCase();

    return json({
        precio_base,
        recargo_pct:  cfg.pct,
        recargo_pct_display: `${(cfg.pct * 100).toFixed(1)}%`,
        recargo_amt,
        total:        cfg.moneda === "USD" ? total_usd : total_cop,
        total_cop,
        total_usd,
        moneda:       cfg.moneda,
        pais,
        pasarela,
        referencia_pre,
        ts:           new Date().toISOString(),
    });
});
