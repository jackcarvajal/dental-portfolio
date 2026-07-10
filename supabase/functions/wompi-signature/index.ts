/**
 * PRODIGY — Edge Function: wompi-signature v2.0
 * Genera la firma SHA-256 requerida por el widget de Wompi.
 *
 * El WOMPI_INTEGRITY_SECRET NUNCA sale de esta función.
 *
 * SEGURIDAD (fix 2026-07-10): el monto NO se toma del cliente. Antes esta
 * función firmaba `monto_en_centavos` tal como venía en el body — un atacante
 * podía pedir una firma válida para $1.000 sobre un pedido de $500.000 (la firma
 * era criptográficamente correcta porque la generaba el servidor) y Wompi lo
 * aceptaba → pago de menos. Ahora la función busca el pedido por `referencia`
 * (= pedidos.codigo), lee `precio_total` autoritativo de la BD, firma ESE monto
 * y lo devuelve para que el cliente lo use en amount-in-cents. El monto que
 * mande el cliente se ignora por completo.
 *
 * Deploy:
 *   supabase functions deploy wompi-signature
 *
 * Secrets requeridos:
 *   supabase secrets set WOMPI_INTEGRITY_SECRET=prod_integrity_xxxx
 *   (SUPABASE_SERVICE_ROLE_KEY ya existe — la usa webhook-handler)
 *
 * POST /functions/v1/wompi-signature
 * Body:   { referencia: string, moneda?: string }
 * Returns:{ signature: string, monto_en_centavos: number }
 */

import { serve }  from "https://deno.land/std@0.177.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const SUPABASE_URL = "https://zgihrwqfyvgyapbwzkvw.supabase.co";

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

    const secret      = Deno.env.get("WOMPI_INTEGRITY_SECRET");
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!secret)     return json({ error: "Integrity secret no configurado" }, 500);
    if (!serviceKey) return json({ error: "Service key no configurada" }, 500);

    let body: { referencia?: unknown; moneda?: unknown };
    try {
        body = await req.json();
    } catch {
        return json({ error: "JSON inválido" }, 400);
    }

    const referencia = String(body.referencia ?? "");
    const moneda     = String(body.moneda ?? "COP").toUpperCase();

    if (!referencia) {
        return json({ error: "referencia requerida" }, 400);
    }

    // ── Leer el monto AUTORITATIVO del pedido en la BD (nunca del cliente) ──
    let precioReal: number | null = null;
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/pedidos?codigo=eq.${encodeURIComponent(referencia)}&select=precio_total&limit=1`,
            { headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` } }
        );
        const rows = await res.json();
        precioReal = Array.isArray(rows) && rows[0] ? Number(rows[0].precio_total) : null;
    } catch {
        return json({ error: "No se pudo verificar el pedido" }, 502);
    }

    if (precioReal === null || !Number.isFinite(precioReal) || precioReal <= 0) {
        return json({ error: "Pedido no encontrado o sin monto válido" }, 400);
    }

    const monto_en_centavos = Math.round(precioReal * 100);

    // SHA-256( referencia + monto_en_centavos + moneda + WOMPI_INTEGRITY_SECRET )
    const raw  = `${referencia}${monto_en_centavos}${moneda}${secret}`;
    const enc  = new TextEncoder().encode(raw);
    const hash = await crypto.subtle.digest("SHA-256", enc);
    const hex  = Array.from(new Uint8Array(hash))
                      .map(b => b.toString(16).padStart(2, "0"))
                      .join("");

    // Devuelve también el monto real para que el cliente lo use en amount-in-cents
    return json({ signature: hex, monto_en_centavos });
});
