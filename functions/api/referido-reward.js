/**
 * PRODIGY — Recompensa automática de referidos
 * POST /api/referido-reward
 *
 * Se llama cuando un pedido con codigo_referido pasa a pago_confirmado.
 * Genera el cupón CRED- para el referidor y envía notificación WA.
 *
 * Body: { pedido_id, codigo_referido }
 * Env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, CALLMEBOT_APIKEY
 */

const CORS_ALLOWED = ['https://prodigylabdental.com','https://www.prodigylabdental.com'];

function cors(origin) {
  const ok = CORS_ALLOWED.includes(origin) || origin.includes('.pages.dev');
  return {
    'Access-Control-Allow-Origin': ok ? origin : CORS_ALLOWED[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: cors(request.headers.get('Origin') || '') });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '';
  const h = cors(origin);

  // Rate limit: 10 rewards/hora por IP
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = new Request('https://rl.internal/referido-reward_' + ip);
  const rlHit = await caches.default.match(rlKey);
  if (rlHit) {
    const count = parseInt(await rlHit.text(), 10) || 0;
    if (count >= 10) return new Response(JSON.stringify({ error: 'Rate limit' }), { status: 429, headers: h });
    await caches.default.put(rlKey, new Response(String(count + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));
  } else {
    await caches.default.put(rlKey, new Response('1', { headers: { 'Cache-Control': 'max-age=3600' } }));
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Supabase no configurado' }), { status: 503, headers: h });
  }

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: h });
  }

  const { pedido_id, codigo_referido } = body;
  if (!pedido_id || !codigo_referido) {
    return new Response(JSON.stringify({ error: 'Faltan pedido_id y codigo_referido' }), { status: 400, headers: h });
  }

  const sbHeaders = {
    'apikey': env.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    // 0. Verificar que el pedido sea real, tenga ese codigo_referido y ya esté pagado
    //    (evita que cualquiera con un codigo_referido ajeno genere un cupon falso)
    const pedResp = await fetch(
      `${env.SUPABASE_URL}/rest/v1/pedidos?id=eq.${encodeURIComponent(pedido_id)}&codigo_referido=eq.${encodeURIComponent(codigo_referido)}&pago_estado=eq.pago_confirmado&select=id`,
      { headers: { ...sbHeaders, 'Accept': 'application/json' } }
    );
    const peds = await pedResp.json();
    if (!Array.isArray(peds) || !peds.length) {
      return new Response(JSON.stringify({ ok: false, reason: 'pedido_no_elegible' }), { status: 200, headers: h });
    }

    // 1. Buscar el referido en la tabla referidos
    const refResp = await fetch(
      `${env.SUPABASE_URL}/rest/v1/referidos?codigo=eq.${encodeURIComponent(codigo_referido)}&select=*`,
      { headers: { ...sbHeaders, 'Accept': 'application/json' } }
    );
    const refs = await refResp.json();
    if (!refs || !refs.length) {
      return new Response(JSON.stringify({ ok: false, reason: 'codigo_referido no encontrado' }), { status: 200, headers: h });
    }
    const ref = refs[0];

    // 2. Verificar que no se ha procesado ya
    if (ref.cupon_credito) {
      return new Response(JSON.stringify({ ok: false, reason: 'ya_procesado', cupon: ref.cupon_credito }), { status: 200, headers: h });
    }

    // 3. Generar cupón CRED-XXXXXXXX
    const cupon = 'CRED-' + Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    // 4. Actualizar referido con cupón
    await fetch(
      `${env.SUPABASE_URL}/rest/v1/referidos?codigo=eq.${encodeURIComponent(codigo_referido)}`,
      {
        method: 'PATCH',
        headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          cupon_credito: cupon,
          estado: 'recompensado',
          cupon_at: new Date().toISOString(),
        }),
      }
    );

    // 5. Insertar log en notificaciones
    await fetch(`${env.SUPABASE_URL}/rest/v1/notificaciones_internas`, {
      method: 'POST',
      headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        tipo: 'pago',
        prioridad: 'media',
        titulo: `🎁 Cupón generado para referidor`,
        mensaje: `Código ${codigo_referido} → cupón ${cupon} ($30.000 COP) generado automáticamente.`,
        destinatario_rol: 'admin',
        leida_por: [],
        accion_url: '/app/panel-interno-operaciones.html',
      }),
    }).catch(() => {});

    // 6. Enviar WA al referidor si tiene whatsapp registrado
    if (ref.referidor_tel && env.CALLMEBOT_APIKEY) {
      const wa = ref.referidor_tel.replace(/\D/g, '');
      const msg = `🎁 *PRODIGY Lab Dental*\n\n¡Tu colega hizo su primer pedido!\n\nTu cupón de crédito: *${cupon}*\nValor: *$30.000 COP*\n\nÚsalo en tu próximo pedido escribiendo el código en el flujo de pedido. Sin vencimiento.\n\nGracias por recomendar PRODIGY 🦷`;
      await fetch(`https://api.callmebot.com/whatsapp.php?phone=${wa}&text=${encodeURIComponent(msg)}&apikey=${env.CALLMEBOT_APIKEY}`)
        .catch(() => {});
    }

    return new Response(JSON.stringify({ ok: true, cupon, codigo_referido }), { status: 200, headers: h });

  } catch (err) {
    console.error('[referido-reward]', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500, headers: h });
  }
}
