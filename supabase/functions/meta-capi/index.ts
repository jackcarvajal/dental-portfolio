/**
 * PRODIGY — Edge Function: meta-capi v1.0
 * Envía eventos de conversión a Meta Conversions API (server-side).
 * Bypasa bloqueadores de anuncios para medición 100% precisa.
 *
 * Variables de entorno requeridas (Supabase Dashboard → Settings → Secrets):
 *   META_ACCESS_TOKEN  — Token de acceso del Pixel (permanente)
 *   META_PIXEL_ID      — ID del Pixel de Meta (ej: 1234567890123456)
 *   META_TEST_CODE     — Código de prueba (solo en desarrollo, omitir en producción)
 *
 * Deploy:
 *   supabase functions deploy meta-capi
 *
 * POST /functions/v1/meta-capi
 * Body: { evento, referencia, valor, moneda, pais, email?, telefono?, nombre?, ip?, ua? }
 * eventos: 'Purchase' | 'InitiateCheckout' | 'Lead'
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const CORS = {
    "Access-Control-Allow-Origin":  "https://prodigylabdental.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type":                 "application/json",
};

function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), { status, headers: CORS });
}

/** SHA-256 hash normalizado para PII (Meta requiere hash) */
async function hashPII(value: string): Promise<string> {
    const encoded = new TextEncoder().encode(value.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (req.method !== "POST")    return json({ error: "Método no permitido" }, 405);

    const ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
    const PIXEL_ID     = Deno.env.get("META_PIXEL_ID");
    const TEST_CODE    = Deno.env.get("META_TEST_CODE"); // undefined en producción

    if (!ACCESS_TOKEN || !PIXEL_ID) {
        return json({ error: "Faltan variables de entorno: META_ACCESS_TOKEN y/o META_PIXEL_ID" }, 500);
    }

    let body: Record<string, string>;
    try { body = await req.json(); }
    catch { return json({ error: "JSON inválido" }, 400); }

    const {
        evento     = "Purchase",
        referencia,
        valor,
        moneda     = "COP",
        pais       = "CO",
        email,
        telefono,
        nombre,
        ip,
        ua,
    } = body;

    if (!referencia || !valor) {
        return json({ error: "Campos requeridos: referencia, valor" }, 400);
    }

    // Construir user_data con PII hasheada
    const userData: Record<string, unknown> = {
        client_ip_address: ip || req.headers.get("x-forwarded-for") || "0.0.0.0",
        client_user_agent: ua || req.headers.get("user-agent") || "unknown",
        country:           [await hashPII(pais.toLowerCase())],
    };
    if (email)    userData.em  = [await hashPII(email)];
    if (telefono) userData.ph  = [await hashPII(telefono.replace(/[^0-9]/g, ""))];
    if (nombre) {
        const parts = nombre.trim().split(" ");
        userData.fn = [await hashPII(parts[0] || "")];
        if (parts[1]) userData.ln = [await hashPII(parts.slice(1).join(" "))];
    }

    const eventData: Record<string, unknown> = {
        event_name:       evento,
        event_time:       Math.floor(Date.now() / 1000),
        action_source:    "website",
        event_id:         referencia,  // deduplicación con pixel del navegador
        user_data:        userData,
        custom_data: {
            value:    parseFloat(valor),
            currency: moneda.toUpperCase(),
            order_id: referencia,
            // Segmentación nacional vs internacional para algoritmo Meta
            content_category: moneda === "COP" ? "nacional" : "internacional",
        },
    };

    const capiPayload: Record<string, unknown> = {
        data: [eventData],
    };
    if (TEST_CODE) capiPayload.test_event_code = TEST_CODE;

    const resp = await fetch(
        `https://graph.facebook.com/v20.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
        {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(capiPayload),
        }
    );

    const result = await resp.json();

    if (!resp.ok) {
        console.error("Meta CAPI error:", JSON.stringify(result));
        return json({ error: "Error Meta CAPI", detail: result }, resp.status);
    }

    return json({
        ok:             true,
        events_received: result.events_received,
        evento,
        referencia,
        moneda,
        categoria:      moneda === "COP" ? "nacional" : "internacional",
    });
});
