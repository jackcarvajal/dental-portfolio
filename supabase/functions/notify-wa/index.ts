/**
 * PRODIGY — Edge Function: notify-wa v1.0
 * Envía mensajes WhatsApp Business via Meta Graph API.
 *
 * Variables de entorno requeridas (Supabase Dashboard → Settings → Secrets):
 *   META_ACCESS_TOKEN  — Token permanente de la Graph API (System User token)
 *   WA_PHONE_ID        — ID del número de WhatsApp Business (ej: 123456789012345)
 *   META_APP_ID        — ID de la App de Meta (solo para logs)
 *
 * Deploy:
 *   supabase functions deploy notify-wa
 *
 * POST /functions/v1/notify-wa
 * Body: { tipo, telefono, nombre, caseId, moneda?, monto?, url_seguimiento? }
 * tipos: 'pago_confirmado' | 'diseno_listo' | 'recordatorio' | 'alerta_alejandro'
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const CORS = {
    "Access-Control-Allow-Origin":  "https://prodigylabdental.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type":                 "application/json",
};

function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), { status, headers: CORS });
}

/* ── Plantillas de mensajes ── */
function buildmensaje(tipo: string, ctx: Record<string, string>): string {
    switch (tipo) {
        case 'pago_confirmado':
            return `💰 ¡Pago confirmado! Hola ${ctx.nombre}, tu pedido #${ctx.caseId} ha entrado a la cola de diseño. Recibirás un aviso cuando esté listo para tu revisión 3D.`;

        case 'diseno_listo':
            return `✨ ¡Tu diseño está listo, ${ctx.nombre}! Entra aquí para verlo en 3D en tiempo real: ${ctx.url_seguimiento}\n\nTienes 2 ajustes incluidos.`;

        case 'recordatorio':
            return `⏳ ${ctx.nombre}, tu diseño #${ctx.caseId} está esperando tu visto bueno para entrar al ciclo de producción/descarga hoy. ¿Alguna duda?`;

        case 'alerta_alejandro':
            return `🔔 [PRODIGY] Venta cerrada — Caso #${ctx.caseId} aprobado por ${ctx.nombre}. Monto: ${ctx.moneda || 'COP'} ${ctx.monto || 'N/A'}. Tipo: ${ctx.tipo_trabajo || 'Diseño CAD'}.`;

        default:
            return `PRODIGY: Actualización en tu pedido #${ctx.caseId}.`;
    }
}

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (req.method !== "POST")    return json({ error: "Método no permitido" }, 405);

    const ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
    const PHONE_ID     = Deno.env.get("WA_PHONE_ID");

    if (!ACCESS_TOKEN || !PHONE_ID) {
        return json({
            error: "Faltan variables de entorno: META_ACCESS_TOKEN y/o WA_PHONE_ID"
        }, 500);
    }

    let body: Record<string, string>;
    try { body = await req.json(); }
    catch { return json({ error: "JSON inválido" }, 400); }

    const { tipo, telefono, nombre, caseId, moneda, monto, url_seguimiento, tipo_trabajo } = body;

    if (!tipo || !telefono || !nombre || !caseId) {
        return json({ error: "Campos requeridos: tipo, telefono, nombre, caseId" }, 400);
    }

    // Normalizar teléfono: eliminar +, espacios, guiones
    const tel = telefono.replace(/[^0-9]/g, "");
    const texto = buildmensaje(tipo, { nombre, caseId, moneda, monto, url_seguimiento, tipo_trabajo });

    const payload = {
        messaging_product: "whatsapp",
        recipient_type:    "individual",
        to:                tel,
        type:              "text",
        text:              { preview_url: !!url_seguimiento, body: texto }
    };

    const resp = await fetch(
        `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`,
        {
            method:  "POST",
            headers: {
                "Authorization": `Bearer ${ACCESS_TOKEN}`,
                "Content-Type":  "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    const result = await resp.json();

    if (!resp.ok) {
        console.error("Meta API error:", JSON.stringify(result));
        return json({ error: "Error Meta API", detail: result }, resp.status);
    }

    return json({ ok: true, wa_message_id: result.messages?.[0]?.id, tipo });
});
