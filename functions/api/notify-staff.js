/**
 * PRODIGY Lab Dental — Aviso al staff por WhatsApp cuando entra un lead
 * POST /api/notify-staff
 * Body: { doctor, servicio, whatsapp, pais }
 *
 * Destinatarios NO vienen del request (anti-abuso): salen de env vars.
 * Cada número debe registrarse en CallMeBot y tener su propia apikey.
 *
 * Env vars (Cloudflare Pages):
 *   STAFF_1_PHONE / STAFF_1_APIKEY   → PRODIGY (573212816716)
 *   STAFF_2_PHONE / STAFF_2_APIKEY   → Alejandro (573219581949)
 *   STAFF_3_PHONE / STAFF_3_APIKEY   → (opcional)
 *   RESEND_API_KEY                   → respaldo por correo si algún WhatsApp no sale
 *   LEADS_EMAIL                      → (opcional) destino del respaldo; por defecto gerencia@
 *
 * CallMeBot es gratis pero frágil (cambia de número y a veces se llena). Si un aviso no queda en cola,
 * el mismo aviso sale por correo para no perder el lead.
 */

const CORS_OK = ['https://prodigylabdental.com'];

function cors(origin) {
  const ok = CORS_OK.includes(origin) || /^https:\/\/([a-z0-9-]+\.)?dental-portfolio-em6\.pages\.dev$/.test(origin || '') || !origin;
  return { 'Access-Control-Allow-Origin': ok ? origin || '*' : CORS_OK[0], 'Content-Type': 'application/json' };
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: { ...cors(request.headers.get('Origin') || ''), 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function onRequestPost({ request, env }) {
  const h = cors(request.headers.get('Origin') || '');

  const staff = [];
  for (let i = 1; i <= 3; i++) {
    const phone = env['STAFF_' + i + '_PHONE'];
    const key   = env['STAFF_' + i + '_APIKEY'];
    if (phone && key) staff.push({ phone: String(phone).replace(/\D/g, ''), key });
  }
  if (!staff.length && !env.RESEND_API_KEY) return new Response(JSON.stringify({ error: 'Sin staff configurado' }), { status: 503, headers: h });

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = new Request('https://rl.internal/notify-staff-pg_' + ip);
  const hit = await caches.default.match(rlKey);
  const n = hit ? (parseInt(await hit.text(), 10) || 0) : 0;
  if (n >= 20) return new Response(JSON.stringify({ error: 'Rate limit' }), { status: 429, headers: h });
  await caches.default.put(rlKey, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));

  // Tope GLOBAL (no solo por IP): una botnet con muchas IP no puede inundar el WhatsApp/correo del equipo.
  // Ventana fija de 1 h (la hora va en la clave) para que el contador no se acumule con tráfico normal.
  // caches.default vive en cada centro de datos de Cloudflare: el tope es por colo.
  const glKey = new Request('https://rl.internal/notify-staff-pg-global_' + Math.floor(Date.now() / 3600000));
  const gl = await caches.default.match(glKey);
  const g = gl ? (parseInt(await gl.text(), 10) || 0) : 0;
  if (g >= 60) return new Response(JSON.stringify({ error: 'Rate limit' }), { status: 429, headers: h });
  await caches.default.put(glKey, new Response(String(g + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));

  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: h }); }

  const esc  = s => String(s || '').replace(/[<>]/g, '').slice(0, 80);
  const escL = s => String(s || '').replace(/[<>]/g, '').slice(0, 240);
  const doctor   = esc(body.doctor) || 'Sin nombre';
  const servicio = esc(body.servicio) || 'trabajo';
  const waLead   = esc(body.whatsapp) || 's/n';
  const pais     = esc(body.pais) || '';
  const codigo   = esc(body.codigo) || '';
  const tipo     = esc(body.tipo) || 'Nuevo caso';
  // Sin nombre, WhatsApp ni código no hay nada que avisar: un POST vacío mandaba «Sin nombre / s/n» al equipo (19-nov-2026).
  if (!esc(body.doctor) && !esc(body.whatsapp) && !esc(body.codigo)) {
    return new Response(JSON.stringify({ ok: false, error: 'Faltan datos del caso' }), { status: 400, headers: h });
  }
  const contexto = escL(body.contexto) || '';

  const mensaje =
    `🔔 *${tipo} — PRODIGY Lab Dental*\n\n` +
    (codigo ? `Nº caso: *${codigo}*\n` : '') +
    `Servicio: ${servicio}\n` +
    `Dr(a): ${doctor}\n` +
    `WhatsApp: ${waLead}${pais ? `\nPaís: ${pais}` : ''}\n` +
    (contexto ? `\n${contexto}\n` : '') +
    `\nResponde rápido 👉 wa.me/${waLead.replace(/\D/g, '')}\n` +
    `Panel: prodigylabdental.com/app/bandeja-solicitudes.html`;

  const resultados = await Promise.all(staff.map(async ({ phone, key }) => {
    try {
      const r = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(mensaje)}&apikey=${key}`);
      const txt = await r.text();
      return { phone, ok: r.ok && /message queued/i.test(txt) };
    } catch (e) {
      return { phone, ok: false };
    }
  }));

  let correo = false;
  if ((!resultados.length || resultados.some(r => !r.ok)) && env.RESEND_API_KEY) {
    correo = await respaldoCorreo(env, { tipo, codigo, servicio, doctor, waLead, pais, contexto });
  }

  // Solo el conteo: antes devolvía los teléfonos del equipo a cualquiera que llamara
  return new Response(JSON.stringify({ ok: true, enviados: resultados.filter(r => r.ok).length, correo }), { status: 200, headers: h });
}

const escH = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function respaldoCorreo(env, d) {
  const wa = d.waLead.replace(/\D/g, '');
  const fuente = 'font-family:Arial,Helvetica,sans-serif;';
  const filas = [['Servicio', d.servicio], ['Dr(a)', d.doctor], ['WhatsApp', d.waLead], ['País', d.pais], ['Nº caso', d.codigo]]
    .filter(f => f[1] && f[1] !== 's/n')
    .map(([k, v]) => `<tr><td style="${fuente}padding:4px 14px 4px 0;color:#666;font-size:14px">${k}</td><td style="${fuente}padding:4px 0;font-size:14px"><b>${escH(v)}</b></td></tr>`)
    .join('');
  const html =
    `<p style="${fuente}font-size:15px;margin:0 0 10px"><b>${escH(d.tipo)}</b></p>` +
    `<table style="border-collapse:collapse">${filas}</table>` +
    (d.contexto ? `<p style="${fuente}font-size:14px">${escH(d.contexto)}</p>` : '') +
    (wa ? `<p style="${fuente}font-size:14px"><a href="https://wa.me/${wa}">Responder por WhatsApp</a></p>` : '') +
    `<p style="${fuente}font-size:13px;color:#666">El aviso por WhatsApp no salió, por eso llega por correo. ` +
    `<a href="https://prodigylabdental.com/app/bandeja-solicitudes.html">Abrir la bandeja de solicitudes</a></p>`;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'PRODIGY Alertas <alertas@prodigylabdental.com>',
        to: [env.LEADS_EMAIL || 'gerencia@prodigylabdental.com'],
        subject: `${d.tipo}: ${d.servicio} · ${d.doctor}`.replace(/[\r\n]+/g, ' ').slice(0, 140),
        html
      })
    });
    return r.ok;
  } catch (e) {
    return false;
  }
}
