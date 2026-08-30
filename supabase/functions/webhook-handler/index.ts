/**
 * PRODIGY — Edge Function: Webhook Handler v2.1
 * Maneja webhooks de Wompi para actualizar estado de pedidos.
 *
 * Deploy:
 *   supabase functions deploy webhook-handler
 *
 * Secrets requeridos:
 *   supabase secrets set WOMPI_INTEGRITY_SECRET=<del dashboard Wompi>
 *   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
 *
 * Webhook URL a configurar en Wompi Dashboard:
 *   https://zgihrwqfyvgyapbwzkvw.supabase.co/functions/v1/webhook-handler?source=wompi
 */

import { serve }        from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto }       from "https://deno.land/std@0.177.0/crypto/mod.ts";

const SUPABASE_URL = "https://zgihrwqfyvgyapbwzkvw.supabase.co";

// Límite de tamaño del body — un webhook legítimo de Wompi pesa unos pocos KB.
// Sin esto, `req.json()` parsea a memoria un body arbitrariamente grande ANTES
// de cualquier validación (la función es pública), abriendo un DoS de memoria.
const MAX_BODY_BYTES = 64 * 1024; // 64 KB

serve(async (req) => {
  const url    = new URL(req.url);
  const source = url.searchParams.get("source");

  // Rechazar bodies demasiado grandes antes de parsear (defensa DoS pre-auth).
  const clen = Number(req.headers.get("content-length") || 0);
  if (clen > MAX_BODY_BYTES) {
    return new Response("payload demasiado grande", { status: 413 });
  }

  const sb = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    // Leer con tope duro incluso si content-length miente/está ausente.
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return new Response("payload demasiado grande", { status: 413 });
    }
    const body = JSON.parse(raw);
    if (source === "wompi") return await handleWompi(sb, body);
    return new Response("source no reconocido", { status: 400 });
  } catch (e) {
    // Mensaje genérico al cliente — no filtrar detalles internos de parseo/BD.
    console.error("[webhook-handler] error:", e?.message);
    return new Response(JSON.stringify({ error: "solicitud inválida" }), { status: 400 });
  }
});

async function sha256hex(input: string): Promise<string> {
  const enc  = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash))
              .map(b => b.toString(16).padStart(2, "0"))
              .join("");
}

// Comparación en tiempo constante — evita timing attack sobre la firma
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function handleWompi(sb: any, payload: any) {
  const integrity = Deno.env.get("WOMPI_INTEGRITY_SECRET") ?? "";
  const evento    = payload.data?.transaction;

  if (!evento) return new Response("payload inesperado", { status: 400 });

  // ── Verificar firma Wompi (fórmula correcta para eventos webhook) ──
  // SHA256( transaction.id + transaction.status + amount_in_cents + integrity_secret )
  // Referencia: https://docs.wompi.co/docs/colombia/eventos
  const checksum  = evento?.signature?.checksum ?? "";
  const txId      = String(evento?.id ?? "");
  const txStatus  = String(evento?.status ?? "");
  const monto     = Number(evento?.amount_in_cents ?? 0);

  if (!integrity) {
    return new Response("WOMPI_INTEGRITY_SECRET no configurado", { status: 500 });
  }
  const expected = await sha256hex(`${txId}${txStatus}${monto}${integrity}`);
  if (!timingSafeEqual(expected, checksum)) {
    return new Response("firma inválida", { status: 401 });
  }

  const referencia = String(evento?.reference ?? "");
  const moneda     = String(evento?.currency   ?? "COP");

  if (evento?.status === "APPROVED" && referencia) {

    // ── Idempotencia: no procesar si ya está Pagado ──
    const { data: existing } = await sb
      .from("pedidos")
      .select("id, estado")
      .eq("codigo", referencia)
      .maybeSingle();

    if (existing?.estado === "Pagado") {
      return new Response("ya procesado", { status: 200 });
    }

    // ── Actualizar pedido ──
    // pago_estado también se actualiza aquí: los paneles de operario (ej.
    // operario-diseno.html avanzar()) bloquean el inicio de diseño hasta que
    // pago_estado sea 'pago_confirmado'/'pago_subido'/'credito_autorizado' —
    // solo actualizar `estado` dejaba el caso atascado para pagos con
    // pasarela (tarjeta), que no pasan por el flujo de comprobante manual.
    await sb.from("pedidos")
      .update({ estado: "Pagado", pago_estado: "pago_confirmado" })
      .eq("codigo", referencia)
      .neq("estado", "Pagado");   // guard extra contra race condition

    // ── Registrar pago (columnas reales del schema: sql/schema-completo.sql) ──
    // referencia = UNIQUE — usa el txId de Wompi (no el código del pedido, que
    // puede repetirse entre intentos de pago fallidos/reintentados)
    const montoReal = monto / 100;
    const { error: pagoErr } = await sb.from("pagos").insert({
      pedido_id:     existing?.id ?? null,
      pedido_codigo: referencia,
      referencia:    txId,
      pasarela:      "wompi",
      estado_pago:   "aprobado",
      monto_base:    montoReal,
      monto_total:   montoReal,
      moneda,
      payload_raw:   payload,
    });
    if (pagoErr) {
      console.error("[webhook-handler] Error insertando en pagos:", pagoErr.message, "txId:", txId);
    }

    // Aviso al staff (admin/finanzas) por el sistema de notificaciones internas
    // (la campana del panel, ruteada por rol/depto). Best-effort.
    try {
      await sb.from("notificaciones_internas").insert({
        tipo: "pago", prioridad: "alta", destinatario_rol: "admin", destinatario_dept: null,
        titulo: "💰 Pago recibido — " + referencia,
        mensaje: "Pago Wompi confirmado ($" + Math.round(montoReal).toLocaleString("es-CO") +
                 " COP) del pedido " + referencia + ". El caso ya puede entrar a producción.",
        pedido_id: existing?.id ?? null, pedido_codigo: referencia,
        accion_url: "/app/panel-interno-operaciones.html", leida_por: [],
      });
    } catch (_e) { /* no romper la confirmación por un fallo de notificación */ }
  }

  return new Response("ok", { status: 200 });
}
