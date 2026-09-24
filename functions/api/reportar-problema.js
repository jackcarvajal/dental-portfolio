/**
 * PRODIGY — "¿Algo no funciona?"  POST /api/reportar-problema
 * Body: { origen:'usuario'|'automatico', tipo, descripcion, pagina, contacto?, contexto?, captura_b64? }
 *
 * - Identifica al usuario DESDE SU SESIÓN (Authorization: Bearer <token>), nunca por lo que envíe el navegador.
 * - Límite por IP (usuario 8/h, automático 40/h).
 * - Captura de pantalla opcional (data:image/...;base64) → bucket privado reportes-capturas.
 * - Errores automáticos se AGRUPAN por huella (misma página + mismo error = +1 vez, sin spam).
 * - Aviso por WhatsApp al equipo (STAFF_1..3 de CallMeBot, igual que notify-staff).
 * Env: SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_SERVICE_KEY), STAFF_n_PHONE / STAFF_n_APIKEY.
 */
const SUPABASE_URL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
const ADMIN_EMAILS = ['jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'];
const TIPOS = { archivos:'Subir archivos', pagos:'Pagos', no_carga:'Algo no carga', datos:'Datos incorrectos', sugerencia:'Sugerencia', otro:'Otro', error_js:'Error automático' };
const CORS_OK = ['https://prodigylabdental.com'];

function cors(o){ const ok=CORS_OK.includes(o)||(o||'').includes('.pages.dev')||!o; return {'Access-Control-Allow-Origin':ok?(o||'*'):CORS_OK[0],'Content-Type':'application/json'}; }
export async function onRequestOptions({request}){ return new Response(null,{status:204,headers:{...cors(request.headers.get('Origin')||''),'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization'}}); }

// GET → "Mis reportes": los últimos reportes de quien tiene sesión, con la respuesta del equipo.
export async function onRequestGet({ request, env }){
  const h = cors(request.headers.get('Origin')||'');
  const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  const URL = env.SUPABASE_URL || SUPABASE_URL;
  const auth = request.headers.get('Authorization') || '';
  if (!SERVICE || !auth.startsWith('Bearer ')) return new Response('[]', { headers:h });
  const u = await fetch(`${URL}/auth/v1/user`, { headers:{ apikey:SERVICE, Authorization:auth } });
  if (!u.ok) return new Response('[]', { headers:h });
  const { id } = await u.json();
  const r = await fetch(`${URL}/rest/v1/reportes_web?select=folio,created_at,tipo,estado,respuesta,descripcion&user_id=eq.${id}&origen=eq.usuario&order=created_at.desc&limit=8`,
    { headers:{ apikey:SERVICE, Authorization:`Bearer ${SERVICE}` } });
  return new Response(r.ok ? await r.text() : '[]', { headers:h });
}

const cut = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, n);
async function sha256(t){ const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,32); }

export async function onRequestPost({ request, env }){
  const h = cors(request.headers.get('Origin')||'');
  const J = (o, s=200) => new Response(JSON.stringify(o), { status:s, headers:h });
  const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  const URL = env.SUPABASE_URL || SUPABASE_URL;
  if (!SERVICE) return J({ error:'Servicio no configurado' }, 503);
  if (Number(request.headers.get('content-length')||0) > 6_000_000) return J({ error:'El reporte es muy grande (reduce la captura).' }, 413);

  let b; try { b = await request.json(); } catch { return J({ error:'JSON inválido' }, 400); }
  const origen = b.origen === 'automatico' ? 'automatico' : 'usuario';
  const tipo = TIPOS[b.tipo] ? b.tipo : (origen === 'automatico' ? 'error_js' : 'otro');

  // Límite por IP
  const ip = request.headers.get('CF-Connecting-IP') || 'x';
  const rlKey = new Request('https://rl.internal/reporte-' + origen + '-' + ip);
  const hit = await caches.default.match(rlKey);
  const n = hit ? (parseInt(await hit.text(), 10) || 0) : 0;
  if (n >= (origen === 'automatico' ? 40 : 8)) return J({ error:'Demasiados reportes seguidos. Intenta en un rato o escríbenos por WhatsApp.' }, 429);
  await caches.default.put(rlKey, new Response(String(n + 1), { headers:{ 'Cache-Control':'max-age=3600' } }));

  // ¿Quién reporta? (solo desde la sesión real)
  let user = null;
  const auth = request.headers.get('Authorization') || '';
  if (auth.startsWith('Bearer ')) {
    try { const r = await fetch(`${URL}/auth/v1/user`, { headers:{ apikey:SERVICE, Authorization:auth } }); if (r.ok) user = await r.json(); } catch(_) {}
  }
  const email = user && user.email ? String(user.email).toLowerCase() : null;
  const am = (user && user.app_metadata) || {};
  const rol = !user ? 'anonimo' : ADMIN_EMAILS.includes(email) ? 'admin'
    : (Array.isArray(am.roles) && am.roles.length ? am.roles.join(',') : (am.role || 'client'));

  const ctx = (b.contexto && typeof b.contexto === 'object') ? b.contexto : {};
  let ctxStr = JSON.stringify(ctx); if (ctxStr.length > 8000) ctxStr = JSON.stringify({ recortado:true, errores:(ctx.errores||[]).slice(0,5) });
  const pagina = cut(b.pagina, 300);
  const descripcion = cut(b.descripcion, 2000);
  if (origen === 'usuario' && descripcion.trim().length < 3 && !b.captura_b64) return J({ error:'Cuéntanos brevemente qué pasó.' }, 400);

  const admH = { apikey:SERVICE, Authorization:`Bearer ${SERVICE}`, 'Content-Type':'application/json' };

  // Errores automáticos repetidos → sumar en vez de duplicar
  let huella = null;
  if (origen === 'automatico') {
    const primero = (ctx.errores && ctx.errores[0] && ctx.errores[0].msg) || descripcion;
    huella = await sha256(pagina.split('?')[0] + '|' + String(primero).slice(0, 200));
    try {
      const r = await fetch(`${URL}/rest/v1/reportes_web?select=id,veces&huella=eq.${huella}&estado=in.(nuevo,en_revision)&limit=1`, { headers:admH });
      const ex = r.ok ? await r.json() : [];
      if (ex.length) {
        await fetch(`${URL}/rest/v1/reportes_web?id=eq.${ex[0].id}`, { method:'PATCH', headers:admH, body:JSON.stringify({ veces:(ex[0].veces||1)+1, updated_at:new Date().toISOString() }) });
        return J({ ok:true, agrupado:true });
      }
    } catch(_) {}
  }

  // Captura de pantalla (opcional)
  let captura_url = null;
  const m = typeof b.captura_b64 === 'string' && b.captura_b64.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (m) {
    try {
      const bytes = Uint8Array.from(atob(m[2]), c => c.charCodeAt(0));
      if (bytes.length <= 4_500_000) {
        const now = new Date(); const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
        const path = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}/${crypto.randomUUID()}.${ext}`;
        const up = await fetch(`${URL}/storage/v1/object/reportes-capturas/${path}`, { method:'POST', headers:{ apikey:SERVICE, Authorization:`Bearer ${SERVICE}`, 'Content-Type':'image/'+m[1] }, body:bytes });
        if (up.ok) captura_url = path;
      }
    } catch(_) {}
  }

  const ua = request.headers.get('User-Agent') || '';
  const fila = {
    origen, tipo, descripcion: descripcion || null, pagina,
    user_id: user ? user.id : null, email, rol,
    contacto: cut(b.contacto, 120) || null,
    navegador: cut(ctx.navegador || ua, 200),
    dispositivo: /Mobi|Android|iPhone/i.test(ua) ? 'celular' : 'computador',
    pantalla: cut(ctx.pantalla, 40),
    contexto: JSON.parse(ctxStr), captura_url, huella
  };
  const ins = await fetch(`${URL}/rest/v1/reportes_web?select=id,folio`, { method:'POST', headers:{ ...admH, Prefer:'return=representation' }, body:JSON.stringify(fila) });
  if (!ins.ok) { const t = await ins.text(); return J({ error:'No se pudo guardar el reporte', detalle:t.slice(0,200) }, 500); }
  const [row] = await ins.json();

  // Aviso por WhatsApp al equipo (reportes de personas y la PRIMERA vez de un error automático)
  try {
    const staff = [];
    for (let i = 1; i <= 3; i++) { const p = env['STAFF_' + i + '_PHONE'], k = env['STAFF_' + i + '_APIKEY']; if (p && k) staff.push({ p:String(p).replace(/\D/g,''), k }); }
    if (staff.length) {
      const quien = email || fila.contacto || 'sin sesión';
      const msg = (origen === 'usuario' ? '🛟 *Reporte de la web*' : '⚠️ *Error automático en la web*') + ` — R-${row.folio}\n\n`
        + `Tipo: ${TIPOS[tipo]}\nPágina: ${pagina.split('?')[0]}\nQuién: ${quien} (${rol})\nEquipo: ${fila.dispositivo}\n`
        + (descripcion ? `\n"${descripcion.slice(0, 280)}"\n` : '')
        + (captura_url ? '\n📎 Con captura de pantalla\n' : '')
        + `\nVer: prodigylabdental.com/app/reportes-web.html`;
      await Promise.all(staff.map(s => fetch(`https://api.callmebot.com/whatsapp.php?phone=${s.p}&text=${encodeURIComponent(msg)}&apikey=${s.k}`).catch(()=>{})));
    }
  } catch(_) {}

  return J({ ok:true, folio: row.folio });
}
