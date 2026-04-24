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

serve(async (req) => {
  const url    = new URL(req.url);
  const source = url.searchParams.get("source");
  const sb     = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    const body = await req.json();
    if (source === "wompi") return await handleWompi(sb, body);
    return new Response("source no reconocido", { status: 400 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});

async function sha256hex(input: string): Promise<string> {
  const enc  = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash))
              .map(b => b.toString(16).padStart(2, "0"))
              .join("");
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
  if (expected !== checksum) {
    return new Response("firma inválida", { status: 401 });
  }

  const referencia = String(evento?.reference ?? "");
  const moneda     = String(evento?.currency   ?? "COP");

  if (evento?.status === "APPROVED" && referencia) {

    // ── Idempotencia: no procesar si ya está Pagado ──
    const { data: existing } = await sb
      .from("pedidos")
      .select("estado")
      .eq("codigo", referencia)
      .maybeSingle();

    if (existing?.estado === "Pagado") {
      return new Response("ya procesado", { status: 200 });
    }

    // ── Actualizar pedido ──
    await sb.from("pedidos")
      .update({ estado: "Pagado" })
      .eq("codigo", referencia)
      .neq("estado", "Pagado");   // guard extra contra race condition

    // ── Registrar pago ──
    await sb.from("pagos").insert({
      pasarela:       "wompi",
      transaction_id: txId,
      monto:          monto / 100,
      moneda,
      estado:         "completado",
      webhook_data:   payload,
    });
  }

  return new Response("ok", { status: 200 });
}
