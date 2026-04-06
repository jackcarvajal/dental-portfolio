/**
 * PRODIGY — Edge Function: Webhook Handler v2.0
 * Maneja webhooks de Wompi para actualizar estado de pedidos.
 *
 * Deploy:
 *   supabase functions deploy webhook-handler
 *
 * ⚠️ Secrets requeridos:
 *   supabase secrets set WOMPI_INTEGRITY_SECRET=<del dashboard Wompi>
 *   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
 *
 * Webhook URL:
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
    if (source === "wompi") return await handleWompi(sb, req, body);
    return new Response("source no reconocido", { status: 400 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});

async function handleWompi(sb: any, req: Request, payload: any) {
  // Verificar firma de integridad Wompi
  const integrity  = Deno.env.get("WOMPI_INTEGRITY_SECRET") ?? "";
  const evento     = payload.data?.transaction;
  const referencia = evento?.reference ?? "";
  const monto      = evento?.amount_in_cents ?? 0;
  const moneda     = evento?.currency ?? "COP";
  const checksum   = evento?.signature?.checksum ?? "";

  // SHA256(referencia + monto + moneda + integrity)
  const raw  = `${referencia}${monto}${moneda}${integrity}`;
  const enc  = new TextEncoder().encode(raw);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  const hex  = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,"0")).join("");

  if (integrity && hex !== checksum) {
    return new Response("firma inválida", { status: 401 });
  }

  const status = evento?.status; // APPROVED | DECLINED | VOIDED
  if (status === "APPROVED" && referencia) {
    await sb.from("pedidos")
      .update({ estado: "Pagado" })
      .eq("codigo", referencia);

    await sb.from("pagos").insert({
      pedido_id:      null,           // se puede relacionar por código si se ajusta la query
      pasarela:       "wompi",
      transaction_id: evento?.id ?? referencia,
      monto:          monto / 100,
      moneda,
      estado:         "completado",
      webhook_data:   payload,
    });
  }

  return new Response("ok", { status: 200 });
}
