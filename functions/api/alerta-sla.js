/**
 * PRODIGY — Alerta de tiempos de entrega (casos que superaron su SLA)
 * GET /api/alerta-sla   (Authorization: Bearer CRON_SECRET  ·  o ?key=CRON_SECRET)
 *
 * La llama .github/workflows/alerta-sla.yml cada 4 horas. Por cada caso vencido (una sola vez):
 *  - aviso en la campana del admin (notificaciones_internas)
 *  - WhatsApp al equipo (STAFF_n de CallMeBot, los mismos de notify-staff; o CALLMEBOT_APIKEY + WA_ADMIN)
 * Env: SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_SERVICE_KEY), CRON_SECRET, STAFF_n_PHONE/STAFF_n_APIKEY.
 */

import { revisar } from './vigia.js';

const SURL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';

export async function onRequestGet({ request, env }) {
  const key = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim() || new URL(request.url).searchParams.get('key');
  if (!env.CRON_SECRET || key !== env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  if (!SERVICE) return new Response(JSON.stringify({ error: 'Falta la clave de servicio de Supabase' }), { status: 503 });
  const h = { 'apikey': SERVICE, 'Authorization': `Bearer ${SERVICE}`, 'Content-Type': 'application/json' };

  // Casos atrasados en su etapa (más del doble de lo normal): un solo resumen al día en la campana del admin
  let atrasados = 0;
  try {
    const dia = new Date(Date.now() - 5 * 3600000).toISOString().slice(0, 10);          // día de Bogotá
    const marca = new Request('https://rl.internal/atrasados-etapa_' + dia);
    if (!(await caches.default.match(marca))) {
      const ra = await fetch(`${SURL}/rest/v1/rpc/casos_atrasados`, { method: 'POST', headers: h, body: JSON.stringify({ p_factor: 2 }) });
      const filas = ra.ok ? await ra.json() : [];
      if (Array.isArray(filas) && filas.length) {
        atrasados = filas.length;
        const lista = filas.slice(0, 6).map(f => `${f.codigo} (${f.etapa}: ${f.horas_en_etapa} h, lo normal ${f.horas_mediana} h)`).join(' · ');
        await fetch(`${SURL}/rest/v1/notificaciones_internas`, {
          method: 'POST', headers: { ...h, Prefer: 'return=minimal' },
          body: JSON.stringify({ tipo: 'urgente', prioridad: 'alta', destinatario_rol: 'admin',
            titulo: `⏱️ ${filas.length} caso${filas.length > 1 ? 's' : ''} atrasado${filas.length > 1 ? 's' : ''} en producción`,
            mensaje: lista, accion_url: '/app/metricas.html', leida_por: [] }),
        }).catch(() => {});
      }
      await caches.default.put(marca, new Response('1', { headers: { 'Cache-Control': 'max-age=72000' } }));
    }
  } catch (_) { /* si la función aún no existe, sigue con el SLA */ }

  // Vigía de seguridad (una vez al día): si un visitante sin sesión puede leer algo privado o falla un servicio
  // externo, aviso en la campana del admin (functions/api/vigia.js; solo lee)
  let vigia = null;
  try {
    const diaV = new Date(Date.now() - 5 * 3600000).toISOString().slice(0, 10);
    const marcaV = new Request('https://rl.internal/vigia_' + diaV);
    if (!(await caches.default.match(marcaV))) {
      vigia = await revisar(env, request.url);
      if (!vigia.ok) {
        await fetch(`${SURL}/rest/v1/notificaciones_internas`, {
          method: 'POST', headers: { ...h, Prefer: 'return=minimal' },
          body: JSON.stringify({ tipo: 'urgente', prioridad: 'alta', destinatario_rol: 'admin',
            titulo: `🛡️ Vigía: ${vigia.problemas.length} problema${vigia.problemas.length > 1 ? 's' : ''} de seguridad o servicios`,
            mensaje: vigia.problemas.slice(0, 5).join(' · '), accion_url: '/app/pruebas-carga.html', leida_por: [] }),
        }).catch(() => {});
      }
      await caches.default.put(marcaV, new Response('1', { headers: { 'Cache-Control': 'max-age=72000' } }));
    }
  } catch (_) { /* el vigía nunca frena el aviso de SLA */ }
  const resumenVigia = vigia ? { ok: vigia.ok, problemas: vigia.problemas.length } : 'ya corrió hoy';

  try {
    const r = await fetch(`${SURL}/rest/v1/rpc/prodigy_pedidos_sla_vencido`, { method: 'POST', headers: h, body: '{}' });
    const pedidos = await r.json();
    if (!r.ok) return new Response(JSON.stringify({ error: 'La consulta de vencidos falló', detalle: pedidos }), { status: 502 });
    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      return new Response(JSON.stringify({ ok: true, alertas: 0, atrasados, vigia: resumenVigia }), { status: 200 });
    }

    // 1) Campana del admin: un aviso por caso
    await fetch(`${SURL}/rest/v1/notificaciones_internas`, {
      method: 'POST', headers: { ...h, Prefer: 'return=minimal' },
      body: JSON.stringify(pedidos.map(p => ({
        tipo: 'urgente', prioridad: 'alta', destinatario_rol: 'admin',
        titulo: `⏰ Caso ${p.codigo || ''} fuera de tiempo`,
        mensaje: `${p.doctor || 'Doctor'} · lleva ${p.horas_transcurridas} h (objetivo ${p.sla_horas_objetivo} h) · etapa ${p.estado_operativo || '—'}`,
        pedido_codigo: p.codigo || null, accion_url: `/app/ficha-caso.html?id=${p.id}`, leida_por: []
      })))
    }).catch(() => {});

    // 2) WhatsApp al equipo
    const destinos = [];
    for (let i = 1; i <= 3; i++) { const ph = env['STAFF_' + i + '_PHONE'], k = env['STAFF_' + i + '_APIKEY']; if (ph && k) destinos.push({ ph: String(ph).replace(/\D/g, ''), k }); }
    if (!destinos.length && env.CALLMEBOT_APIKEY && env.WA_ADMIN) destinos.push({ ph: String(env.WA_ADMIN).replace(/\D/g, ''), k: env.CALLMEBOT_APIKEY });
    if (destinos.length) {
      const lista = pedidos.slice(0, 5).map(p => `• *${p.codigo}* — ${p.doctor || '?'} (${p.horas_transcurridas}h / objetivo ${p.sla_horas_objetivo}h)`).join('\n');
      const msg = `⏰ *PRODIGY — casos fuera de tiempo*\n\n${pedidos.length} caso(s) superaron su tiempo de entrega:\n\n${lista}${pedidos.length > 5 ? `\n… y ${pedidos.length - 5} más` : ''}\n\nVer: prodigylabdental.com/app/panel-interno-operaciones.html`;
      const res = await Promise.all(destinos.map(d =>
        fetch(`https://api.callmebot.com/whatsapp.php?phone=${d.ph}&text=${encodeURIComponent(msg)}&apikey=${d.k}`).then(x => x.text()).catch(e => 'error ' + e.message)));
      if (!res.some(t => /queued|sent/i.test(t))) {
        // Si el WhatsApp falla, queda registrado (la campana ya avisó)
        await fetch(`${SURL}/rest/v1/logs_incidencias`, {
          method: 'POST', headers: h,
          body: JSON.stringify({ tipo: 'ALERTA_SLA_WA_ERROR', severidad: 'WARN', descripcion: `[alerta-sla] Falló WhatsApp: ${String(res[0]).slice(0, 300)}`, resuelta: false }),
        }).catch(() => {});
      }
    }

    // 3) No volver a avisar del mismo caso
    await Promise.allSettled(pedidos.map(p =>
      fetch(`${SURL}/rest/v1/rpc/prodigy_marcar_sla_alerta`, { method: 'POST', headers: h, body: JSON.stringify({ p_id: p.id }) })
    ));

    return new Response(JSON.stringify({ ok: true, alertas: pedidos.length, atrasados, vigia: resumenVigia }), { status: 200 });
  } catch (err) {
    console.error('[alerta-sla]', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
}
