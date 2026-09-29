/**
 * PRODIGY — Correo de RESPALDO + avisos por WhatsApp de alineadores
 * POST /api/respaldo-alineadores  { tipo, id?, codigo? }
 *   tipo 'caso'       → el cliente subió un caso (orden de trabajo)            id = alineadores_casos.id
 *   tipo 'solicitud'  → llegó un caso por la página pública envia-alineadores codigo = ALN-…
 *   tipo 'entrega'    → la técnica envió viabilidad / planificación          id = alineadores_entregas.id
 *   tipo 'respuesta'  → el cliente aprobó o pidió cambios                     id = alineadores_entregas.id
 *   tipo 'pago'       → el cliente reportó un pago                            id = alineadores_pagos.id
 *   tipo 'cancelado'  → el cliente canceló su caso (dentro de la primera hora)  id = alineadores_casos.id
 * WhatsApp (CallMeBot, tabla alineadores_avisos_wa): caso nuevo / respuesta / cancelado → técnica;
 * entrega → el cliente dueño del caso. { sin_email:true } = solo WhatsApp (p. ej. caso creado desde la bandeja).
 * El registro se lee en el SERVIDOR (no se confía en lo que manda el navegador) y se verifica que
 * quien llama sea el dueño o del equipo. Los archivos van como enlaces firmados de 7 días.
 * Env: RESEND_API_KEY, FROM_EMAIL (opcional), RESPALDO_EMAIL (opcional, por defecto el admin),
 *      SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_SERVICE_KEY).
 */
const SURL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
const ADMIN_EMAILS = ['jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'];
const EQUIPO_ALN = ['admin','operator','contabilidad','secretaria','alineadores'];
const SIETE_DIAS = 7 * 24 * 3600;

const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });
const esc = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function onRequestPost({ request, env }) {
  const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  if (!SERVICE || !env.RESEND_API_KEY) return J({ error: 'Correo de respaldo no configurado' }, 503);
  const H = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type': 'application/json' };

  // Límite por IP
  const ip = request.headers.get('CF-Connecting-IP') || 'x';
  const rl = new Request('https://rl.internal/respaldo-aln-' + ip);
  const hit = await caches.default.match(rl);
  const n = hit ? (parseInt(await hit.text(), 10) || 0) : 0;
  if (n >= 30) return J({ error: 'Demasiadas solicitudes' }, 429);
  await caches.default.put(rl, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));

  let b; try { b = await request.json(); } catch { return J({ error: 'JSON inválido' }, 400); }
  const tipo = String(b.tipo || '');
  // Un solo correo por evento (evita que alguien lo dispare muchas veces)
  const unico = new Request('https://rl.internal/respaldo-aln-hecho-' + tipo + '-' + String(b.id || b.codigo || '').slice(0, 60));
  if (await caches.default.match(unico)) return J({ ok: true, repetido: true });

  // Quién llama (sesión real)
  let user = null;
  const auth = request.headers.get('Authorization') || '';
  if (auth.startsWith('Bearer ')) {
    const r = await fetch(`${SURL}/auth/v1/user`, { headers: { apikey: SERVICE, Authorization: auth } }).catch(() => null);
    if (r && r.ok) user = await r.json();
  }
  const email = String(user?.email || '').toLowerCase();
  const am = user?.app_metadata || {};
  const roles = [].concat(am.roles || [], am.role || []);
  const esEquipo = !!user && (ADMIN_EMAILS.includes(email) || roles.some(r => EQUIPO_ALN.includes(r)));

  const get = async (path) => { const r = await fetch(`${SURL}/rest/v1/${path}`, { headers: H }); return r.ok ? r.json() : []; };
  const firmar = async (bucket, path) => {
    const r = await fetch(`${SURL}/storage/v1/object/sign/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`,
      { method: 'POST', headers: H, body: JSON.stringify({ expiresIn: SIETE_DIAS }) }).catch(() => null);
    const j = r && r.ok ? await r.json().catch(() => null) : null;
    return j && (j.signedURL || j.signedUrl) ? `${SURL}/storage/v1${j.signedURL || j.signedUrl}` : null;
  };
  const listaArchivos = async (bucket, rutas) => {
    const out = [];
    for (const ruta of (rutas || []).slice(0, 20)) {
      const url = await firmar(bucket, ruta);
      const nombre = String(ruta).split('/').pop();
      out.push(url ? `<li><a href="${esc(url)}">${esc(nombre)}</a></li>` : `<li>${esc(nombre)} (no se pudo generar el enlace)</li>`);
    }
    return out.length ? `<p><b>Archivos</b> (enlaces válidos 7 días):</p><ul>${out.join('')}</ul>` : '<p>Sin archivos adjuntos.</p>';
  };
  const fila = (k, v) => v == null || v === '' ? '' : `<tr><td style="color:#64748b;padding:4px 12px 4px 0;vertical-align:top">${esc(k)}</td><td style="padding:4px 0">${esc(v).replace(/\n/g, '<br>')}</td></tr>`;

  let asunto = '', cuerpo = '';

  let waTecnica = '', waCliente = '', clienteUid = null;
  if (tipo === 'caso' || tipo === 'entrega' || tipo === 'respuesta' || tipo === 'cancelado') {
    if (!UUID.test(String(b.id || ''))) return J({ error: 'id inválido' }, 400);
    let entrega = null, casoId = b.id;
    if (tipo === 'entrega' || tipo === 'respuesta') {
      [entrega] = await get(`alineadores_entregas?id=eq.${b.id}&select=*`);
      if (!entrega) return J({ error: 'No existe' }, 404);
      casoId = entrega.caso_id;
    }
    const [c] = await get(`alineadores_casos?id=eq.${casoId}&select=*`);
    if (!c) return J({ error: 'No existe' }, 404);
    const dueno = user && c.cliente_user_id === user.id;
    clienteUid = c.cliente_user_id;
    if (tipo === 'entrega' ? !esEquipo : !(dueno || esEquipo)) return J({ error: 'No autorizado' }, 403);

    const cab = `<table style="font-size:14px">${fila('Paciente', c.paciente)}${fila('Cliente', c.cliente)}${fila('Código', c.codigo)}${fila('Estado del caso', c.estado)}</table>`;
    if (tipo === 'cancelado') {
      asunto = `🛑 Caso cancelado por el cliente — ${c.paciente}`;
      cuerpo = `<h2>El cliente canceló el caso (dentro de la primera hora)</h2>${cab}<p>Se borraron los cargos pendientes de valoración.</p>`;
      waTecnica = `🛑 *PRODIGY — Caso cancelado*\n\nPaciente ${c.paciente}${c.cliente ? ' (' + c.cliente + ')' : ''}: el cliente lo canceló. No lo trabajes.`;
    } else if (tipo === 'caso') {
      waTecnica = `😁 *PRODIGY — Caso nuevo de alineadores*\n\nPaciente ${c.paciente}${c.cliente ? ' · ' + c.cliente : ''}.\nRevisa los archivos y envía la viabilidad:\nhttps://prodigylabdental.com/app/alineadores.html`;
      asunto = `😁 Nuevo caso de alineadores — ${c.paciente} (${c.cliente || 'cliente'})`;
      cuerpo = `<h2>Nuevo caso de alineadores</h2>${cab}<table style="font-size:14px;margin-top:8px">
        ${fila('Motivo de consulta', c.motivo_consulta)}${fila('Indicación del cliente', c.indicacion_cliente)}
        ${fila('Requiere IPR', c.requiere_ipr == null ? '' : (c.requiere_ipr ? 'Sí' : 'No'))}
        ${fila('Requiere attachments', c.requiere_attachments == null ? '' : (c.requiere_attachments ? 'Sí' : 'No'))}
        ${fila('Arcada', c.arcada)}${fila('Notas', c.notas)}</table>${await listaArchivos('alineadores-archivos', c.archivos)}`;
    } else if (tipo === 'entrega') {
      const etapa = entrega.etapa === 'viabilidad' ? 'Viabilidad y valoración' : 'Planificación';
      asunto = `✈️ ${etapa}${entrega.revision_num ? ' (revisión ' + entrega.revision_num + ')' : ''} enviada — ${c.paciente}`;
      waCliente = `😁 *PRODIGY — ${etapa} lista*${entrega.revision_num ? ' (revisión ' + entrega.revision_num + ')' : ''}\n\nPaciente ${c.paciente}. Revísala y apruébala o pide cambios:\nhttps://prodigylabdental.com/app/facturacion-alineadores.html#casos`;
      cuerpo = `<h2>${esc(etapa)} enviada al cliente</h2>${cab}<table style="font-size:14px;margin-top:8px">
        ${fila('Enviada por', email)}${fila('Revisión', String(entrega.revision_num || 0))}${fila('Texto para el cliente', entrega.nota_mayra)}${fila('Enlace', entrega.enlace)}</table>
        ${await listaArchivos('alineadores-entregas', entrega.archivos)}`;
    } else {
      const etapa = entrega.etapa === 'viabilidad' ? 'viabilidad' : 'planificación';
      const ok = entrega.estado === 'aprobado';
      asunto = `${ok ? '✅ Aprobó' : '✏️ Pidió cambios en'} la ${etapa} — ${c.paciente}`;
      waTecnica = `${ok ? '✅' : '✏️'} *PRODIGY — ${ok ? 'Aprobada' : 'Cambios pedidos'}: ${etapa}*\n\nPaciente ${c.paciente}.${entrega.observacion_cliente ? '\n\n"' + String(entrega.observacion_cliente).slice(0, 400) + '"' : ''}\n\nhttps://prodigylabdental.com/app/alineadores.html`;
      cuerpo = `<h2>El cliente ${ok ? 'aprobó' : 'pidió cambios en'} la ${esc(etapa)}</h2>${cab}<table style="font-size:14px;margin-top:8px">
        ${fila('Respuesta', ok ? 'Aprobada' : 'Pidió cambios')}${fila('Observaciones', entrega.observacion_cliente)}${fila('Revisión', String(entrega.revision_num || 0))}</table>`;
    }
  } else if (tipo === 'pago') {
    if (!UUID.test(String(b.id || ''))) return J({ error: 'id inválido' }, 400);
    const [p] = await get(`alineadores_pagos?id=eq.${b.id}&select=*`);
    if (!p) return J({ error: 'No existe' }, 404);
    if (!(user && (p.cliente_user_id === user.id || esEquipo))) return J({ error: 'No autorizado' }, 403);
    asunto = `💳 Pago reportado — ${p.monto} ${p.moneda} (${p.metodo || 'sin método'})`;
    cuerpo = `<h2>Pago reportado por el cliente</h2><table style="font-size:14px">${fila('Cliente', email)}${fila('Monto', p.monto + ' ' + p.moneda)}
      ${fila('Método', p.metodo)}${fila('Mes que cubre', p.mes_corte)}${fila('Referencia', p.referencia)}${fila('Nota', p.nota)}</table>
      ${p.comprobante_url ? await listaArchivos('alineadores-comprobantes', [p.comprobante_url]) : '<p>Sin comprobante adjunto.</p>'}
      <p>Verifícalo en https://prodigylabdental.com/app/alineadores.html</p>`;
  } else if (tipo === 'solicitud') {
    const codigo = String(b.codigo || '').slice(0, 40);
    if (!/^ALN-[A-Z0-9-]+$/i.test(codigo)) return J({ error: 'código inválido' }, 400);
    // Sin sesión: solo solicitudes de alineadores creadas hace menos de 15 minutos (evita abuso)
    const desde = new Date(Date.now() - 15 * 60000).toISOString();
    const [s] = await get(`solicitudes_scanner?codigo=eq.${encodeURIComponent(codigo)}&servicio=ilike.Alineadores*&created_at=gte.${encodeURIComponent(desde)}&select=*`);
    if (!s) return J({ error: 'No existe o ya expiró' }, 404);
    const rutas = [...String(s.notas || '').matchAll(/→\s*(alineadores\/[^\s]+)/g)].map(m => m[1]);
    asunto = `😁 Caso de alineadores por la web — ${s.piezas || ''} (${s.doctor || ''})`;
    cuerpo = `<h2>Caso de alineadores recibido por la página pública</h2><table style="font-size:14px">${fila('Código', s.codigo)}${fila('Doctor', s.doctor)}
      ${fila('Clínica', s.clinica)}${fila('WhatsApp', s.whatsapp)}${fila('Email', s.email)}${fila('Paciente', s.piezas)}${fila('Notas', s.notas)}</table>
      ${await listaArchivos('alineadores-archivos', rutas)}<p>También está en la Bandeja: https://prodigylabdental.com/app/bandeja-solicitudes.html</p>`;
  } else {
    return J({ error: 'tipo inválido' }, 400);
  }

  const para = env.RESPALDO_EMAIL || 'jackalejandroc@gmail.com';
  const from = env.FROM_EMAIL || 'PRODIGY Lab Dental <noreply@prodigylabdental.com>';
  const html = `<div style="font-family:Arial,sans-serif;color:#0f172a;max-width:640px">${cuerpo}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:18px 0"><p style="color:#64748b;font-size:12px">Respaldo automático de la web de PRODIGY (alineadores).</p></div>`;
  let emailOk = true, det = '';
  if (!b.sin_email) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [para], subject: asunto.slice(0, 180), html })
    }).catch(() => null);
    if (!r || !r.ok) {
      emailOk = false;
      det = r ? (await r.text().catch(() => '')).slice(0, 300) : 'sin respuesta';
      await fetch(`${SURL}/rest/v1/logs_incidencias`, { method: 'POST', headers: H,
        body: JSON.stringify({ tipo: 'RESPALDO_EMAIL_ERROR', severidad: 'WARN', descripcion: `[respaldo-alineadores] ${tipo}: ${det}`, resuelta: false }) }).catch(() => {});
    }
  }

  // WhatsApp (CallMeBot) a la técnica o al cliente, si tienen el aviso activado
  let wa = 0;
  try {
    const destinos = [];
    if (waTecnica) destinos.push(...(await get('alineadores_avisos_wa?rol=eq.tecnica&activo=eq.true&select=whatsapp,apikey')).map(d => ({ ...d, txt: waTecnica })));
    if (waCliente && clienteUid) destinos.push(...(await get(`alineadores_avisos_wa?rol=eq.cliente&activo=eq.true&user_id=eq.${clienteUid}&select=whatsapp,apikey`)).map(d => ({ ...d, txt: waCliente })));
    const res = await Promise.all(destinos.map(d =>
      fetch(`https://api.callmebot.com/whatsapp.php?phone=${String(d.whatsapp).replace(/\D/g, '')}&text=${encodeURIComponent(d.txt)}&apikey=${encodeURIComponent(d.apikey)}`)
        .then(x => x.text()).catch(() => '')));
    wa = res.filter(t => /queued|sent/i.test(t)).length;
  } catch (_) {}

  await caches.default.put(unico, new Response('1', { headers: { 'Cache-Control': 'max-age=86400' } }));
  if (!emailOk && !wa) return J({ error: 'No se pudo enviar el correo', detalle: det }, 502);
  return J({ ok: true, email: !b.sin_email && emailOk, whatsapp: wa });
}
