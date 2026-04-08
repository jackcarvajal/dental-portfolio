/**
 * PRODIGY — Edge Function: wompi-signature v1.0
 * Genera la firma SHA-256 requerida por el widget de Wompi.
 *
 * El WOMPI_INTEGRITY_SECRET NUNCA sale de esta función.
 *
 * Deploy:
 *   supabase functions deploy wompi-signature
 *
 * Secrets requeridos:
 *   supabase secrets set WOMPI_INTEGRITY_SECRET=prod_integrity_xxxx
 *
 * POST /functions/v1/wompi-signature
 * Body:   { referencia: string, monto_en_centavos: number, moneda?: string }
 * Returns:{ signature: string }
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const CORS = {
    "Access-Control-Allow-Origin":  "https://prodigylabdental.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type":                 "application/json",
};

function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), { status, headers: CORS });
}

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (req.method !== "POST")    return json({ error: "Método no permitido" }, 405);

    const secret = Deno.env.get("WOMPI_INTEGRITY_SECRET");
    if (!secret)  return json({ error: "Integrity secret no configurado" }, 500);

    let body: { referencia?: unknown; monto_en_centavos?: unknown; moneda?: unknown };
    try {
        body = await req.json();
    } catch {
        return json({ error: "JSON inválido" }, 400);
    }

    const referencia       = String(body.referencia       ?? "");
    const monto_en_centavos = Number(body.monto_en_centavos ?? 0);
    const moneda            = String(body.moneda            ?? "COP").toUpperCase();

    if (!referencia || !Number.isFinite(monto_en_centavos) || monto_en_centavos <= 0) {
        return json({ error: "referencia y monto_en_centavos son requeridos" }, 400);
    }

    // SHA-256( referencia + monto_en_centavos + moneda + WOMPI_INTEGRITY_SECRET )
    const raw  = `${referencia}${monto_en_centavos}${moneda}${secret}`;
    const enc  = new TextEncoder().encode(raw);
    const hash = await crypto.subtle.digest("SHA-256", enc);
    const hex  = Array.from(new Uint8Array(hash))
                      .map(b => b.toString(16).padStart(2, "0"))
                      .join("");

    return json({ signature: hex });
});
