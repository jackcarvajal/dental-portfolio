/**
 * "¿Algo no funciona?" — /api/reportar-problema
 *   GET                          → "Tus reportes" de quien tiene sesión (con la respuesta del equipo)
 *   POST {origen,tipo,descripcion,pagina,contacto?,contexto?,captura_b64?,asistente?}  → crea el reporte
 *   POST {accion:'cerrar', id, clave, resuelto}  → cierre tras hablar con el asistente IA
 *
 * - Identidad SOLO desde la sesión (Authorization: Bearer), nunca por lo que mande el navegador.
 * - Límite por IP. Captura opcional → bucket privado reportes-capturas/<negocio>/...
 * - Errores automáticos se agrupan por huella (+1 vez, sin spam).
 * - Con asistente IA disponible, el aviso por WhatsApp se RETIENE hasta que la persona diga
 *   "Necesito al equipo" (o cierre sin resolver). Si la IA lo resuelve, no se molesta al equipo.
 * - `clave` = HMAC(id) → permite al asistente/cierre actuar sobre ESE reporte sin sesión.
 * Tabla compartida con Alejandro CAD/CAM (columna negocio). Este archivo es gemelo del de su repo:
 * solo cambia el bloque CONFIG.
 * Env: SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_SERVICE_KEY), STAFF_n_PHONE/STAFF_n_APIKEY, ANTHROPIC_API_KEY.
 */

/* ── CONFIG (único bloque que cambia entre repos) ── */
export const NEGOCIO = 'prodigy';
export const MARCA = 'PRODIGY Lab Dental';
export const SITIO = 'https://prodigylabdental.com';
export const ADMIN_EMAILS = ['jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'];
export const ROLES_EQUIPO = ['admin','operator','secretaria'];          // quién atiende la bandeja
/* ─────────────────────────────────────────────── */

const SUPABASE_URL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
export const TIPOS = { archivos:'Subir archivos', pagos:'Pagos', no_carga:'Algo no carga', datos:'Datos incorrectos', sugerencia:'Sugerencia', otro:'Otro', error_js:'Error automático' };
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function cors(o){ const ok = !o || o === SITIO || o.endsWith('.pages.dev'); return { 'Access-Control-Allow-Origin': ok ? (o || SITIO) : SITIO, 'Content-Type':'application/json' }; }
export const cfg = env => ({ URL: env.SUPABASE_URL || SUPABASE_URL, SERVICE: env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY });
export const adminH = S => ({ apikey:S, Authorization:`Bearer ${S}`, 'Content-Type':'application/json' });
const cut = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, n);
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join('');
async function sha256(t){ return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t))).slice(0,32); }

export async function firmar(secret, id){
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode('reporte:' + NEGOCIO + ':' + id))).slice(0, 40);
}
export async function claveValida(secret, id, clave){
  if (!ID_RE.test(String(id || '')) || typeof clave !== 'string') return false;
  const ok = await firmar(secret, id);
  if (ok.length !== clave.length) return false;
  let d = 0; for (let i = 0; i < ok.length; i++) d |= ok.charCodeAt(i) ^ clave.charCodeAt(i);
  return d === 0;
}
export async function usuarioDe(request, c){
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  try { const r = await fetch(`${c.URL}/auth/v1/user`, { headers:{ apikey:c.SERVICE, Authorization:auth } }); return r.ok ? await r.json() : null; } catch(_) { return null; }
}
export function rolDe(user){
  if (!user) return 'anonimo';
  const email = String(user.email || '').toLowerCase();
  if (ADMIN_EMAILS.includes(email)) return 'admin';
  const am = user.app_metadata || {};
  return Array.isArray(am.roles) && am.roles.length ? am.roles.join(',') : (am.role || 'client');
}
export function esEquipo(user){
  if (!user) return false;
  if (ADMIN_EMAILS.includes(String(user.email || '').toLowerCase())) return true;
  const am = user.app_metadata || {};
  const roles = [].concat(am.roles || [], am.role || []);
  return roles.some(r => ROLES_EQUIPO.includes(r));
}
export async function limite(ip, nombre, max){
  const k = new Request('https://rl.internal/' + nombre + '-' + ip);
  const hit = await caches.default.match(k);
  const n = hit ? (parseInt(await hit.text(), 10) || 0) : 0;
  if (n >= max) return false;
  await caches.default.put(k, new Response(String(n + 1), { headers:{ 'Cache-Control':'max-age=3600' } }));
  return true;
}
export async function leerReporte(c, id){
  if (!ID_RE.test(String(id || ''))) return null;
  const r = await fetch(`${c.URL}/rest/v1/reportes_web?id=eq.${id}&negocio=eq.${NEGOCIO}&select=*&limit=1`, { headers:adminH(c.SERVICE) });
  const a = r.ok ? await r.json() : [];
  return a[0] || null;
}
export async function avisarEquipo(env, fila, extra){
  const staff = [];
  for (let i = 1; i <= 3; i++) { const p = env['STAFF_' + i + '_PHONE'], k = env['STAFF_' + i + '_APIKEY']; if (p && k) staff.push({ p:String(p).replace(/\D/g,''), k }); }
  if (!staff.length) return;
  const quien = fila.email || fila.contacto || 'sin sesión';
  const msg = (fila.origen === 'usuario' ? '🛟 *Reporte de la web*' : '⚠️ *Error automático en la web*') + ` — R-${fila.folio}\n\n`
    + `Tipo: ${TIPOS[fila.tipo] || fila.tipo}\nPágina: ${String(fila.pagina || '').split('?')[0]}\nQuién: ${quien} (${fila.rol})\nEquipo: ${fila.dispositivo || '—'}\n`
    + (fila.descripcion ? `\n"${String(fila.descripcion).slice(0, 280)}"\n` : '')
    + (fila.captura_url ? '\n📎 Con captura de pantalla\n' : '')
    + (extra ? '\n' + extra + '\n' : '')
    + `\nVer: ${SITIO.replace(/^https:\/\//, '')}/app/reportes-web.html#R-${fila.folio}`;
  await Promise.all(staff.map(s => fetch(`https://api.callmebot.com/whatsapp.php?phone=${s.p}&text=${encodeURIComponent(msg)}&apikey=${s.k}`).catch(()=>{})));
}

export async function onRequestOptions({ request }){
  return new Response(null, { status:204, headers:{ ...cors(request.headers.get('Origin') || ''), 'Access-Control-Allow-Methods':'GET,POST,OPTIONS', 'Access-Control-Allow-Headers':'Content-Type,Authorization' } });
}

// "Tus reportes"
export async function onRequestGet({ request, env }){
  const h = cors(request.headers.get('Origin') || '');
  const c = cfg(env);
  if (!c.SERVICE) return new Response('[]', { headers:h });
  const u = await usuarioDe(request, c);
  if (!u || !u.id) return new Response('[]', { headers:h });
  const r = await fetch(`${c.URL}/rest/v1/reportes_web?select=folio,created_at,tipo,estado,respuesta,descripcion,resuelto_por_ia&negocio=eq.${NEGOCIO}&user_id=eq.${u.id}&origen=eq.usuario&order=created_at.desc&limit=8`, { headers:adminH(c.SERVICE) });
  return new Response(r.ok ? await r.text() : '[]', { headers:h });
}

export async function onRequestPost({ request, env }){
  const h = cors(request.headers.get('Origin') || '');
  const J = (o, s = 200) => new Response(JSON.stringify(o), { status:s, headers:h });
  const c = cfg(env);
  if (!c.SERVICE) return J({ error:'Servicio no configurado' }, 503);
  if (Number(request.headers.get('content-length') || 0) > 6_000_000) return J({ error:'El reporte es muy grande (reduce la captura).' }, 413);

  let b; try { b = await request.json(); } catch { return J({ error:'JSON inválido' }, 400); }
  const ip = request.headers.get('CF-Connecting-IP') || 'x';

  /* ── Cierre después del asistente IA ── */
  if (b.accion === 'cerrar') {
    if (!(await limite(ip, 'reporte-cierre', 30))) return J({ error:'Demasiadas solicitudes.' }, 429);
    if (!(await claveValida(c.SERVICE, b.id, b.clave))) return J({ error:'No autorizado' }, 403);
    const fila = await leerReporte(c, b.id);
    if (!fila) return J({ error:'Reporte no encontrado' }, 404);
    const ahora = new Date().toISOString();
    if (b.resuelto === true) {
      const cambios = { aviso_pendiente:false, resuelto_por_ia:true, updated_at:ahora };
      if (fila.estado === 'nuevo') Object.assign(cambios, { estado:'resuelto', resuelto_at:ahora, respuesta: fila.respuesta || 'Resuelto en vivo con el asistente IA.' });
      await fetch(`${c.URL}/rest/v1/reportes_web?id=eq.${fila.id}`, { method:'PATCH', headers:adminH(c.SERVICE), body:JSON.stringify(cambios) });
      return J({ ok:true, resuelto:true });
    }
    if (fila.aviso_pendiente) {
      await fetch(`${c.URL}/rest/v1/reportes_web?id=eq.${fila.id}`, { method:'PATCH', headers:adminH(c.SERVICE), body:JSON.stringify({ aviso_pendiente:false, updated_at:ahora }) });
      const hablo = Array.isArray(fila.chat_ia) && fila.chat_ia.length > 1;
      await avisarEquipo(env, fila, hablo ? '🤖 El asistente IA respondió pero no lo resolvió. Conversación en la bandeja.' : '🤖 La persona pidió ayuda del equipo.');
    }
    return J({ ok:true, resuelto:false });
  }

  /* ── Crear reporte ── */
  const origen = b.origen === 'automatico' ? 'automatico' : 'usuario';
  const tipo = TIPOS[b.tipo] ? b.tipo : (origen === 'automatico' ? 'error_js' : 'otro');
  if (!(await limite(ip, 'reporte-' + origen, origen === 'automatico' ? 40 : 8))) return J({ error:'Demasiados reportes seguidos. Intenta en un rato o escríbenos por WhatsApp.' }, 429);

  const user = await usuarioDe(request, c);
  const email = user && user.email ? String(user.email).toLowerCase() : null;
  const rol = rolDe(user);

  const ctx = (b.contexto && typeof b.contexto === 'object') ? b.contexto : {};
  let ctxStr = JSON.stringify(ctx); if (ctxStr.length > 8000) ctxStr = JSON.stringify({ recortado:true, errores:(ctx.errores || []).slice(0,5) });
  const pagina = cut(b.pagina, 300);
  const descripcion = cut(b.descripcion, 2000);
  if (origen === 'usuario' && descripcion.trim().length < 3 && !b.captura_b64) return J({ error:'Cuéntanos brevemente qué pasó.' }, 400);

  const H = adminH(c.SERVICE);

  // Errores automáticos repetidos → sumar en vez de duplicar
  let huella = null;
  if (origen === 'automatico') {
    const primero = (ctx.errores && ctx.errores[0] && ctx.errores[0].msg) || descripcion;
    huella = await sha256(NEGOCIO + '|' + pagina.split('?')[0] + '|' + String(primero).slice(0, 200));
    try {
      const r = await fetch(`${c.URL}/rest/v1/reportes_web?select=id,veces&negocio=eq.${NEGOCIO}&huella=eq.${huella}&estado=in.(nuevo,en_revision)&limit=1`, { headers:H });
      const ex = r.ok ? await r.json() : [];
      if (ex.length) {
        await fetch(`${c.URL}/rest/v1/reportes_web?id=eq.${ex[0].id}`, { method:'PATCH', headers:H, body:JSON.stringify({ veces:(ex[0].veces || 1) + 1, updated_at:new Date().toISOString() }) });
        return J({ ok:true, agrupado:true });
      }
    } catch(_) {}
  }

  // Captura de pantalla (opcional)
  let captura_url = null;
  const m = typeof b.captura_b64 === 'string' && b.captura_b64.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (m) {
    try {
      const bytes = Uint8Array.from(atob(m[2]), ch => ch.charCodeAt(0));
      if (bytes.length <= 4_500_000) {
        const now = new Date(); const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
        const path = `${NEGOCIO}/${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}/${crypto.randomUUID()}.${ext}`;
        const up = await fetch(`${c.URL}/storage/v1/object/reportes-capturas/${path}`, { method:'POST', headers:{ apikey:c.SERVICE, Authorization:`Bearer ${c.SERVICE}`, 'Content-Type':'image/' + m[1] }, body:bytes });
        if (up.ok) captura_url = path;
      }
    } catch(_) {}
  }

  // ¿Se retiene el aviso para que el asistente IA intente primero?
  const ia = origen === 'usuario' && b.asistente === true && !!env.ANTHROPIC_API_KEY;

  const ua = request.headers.get('User-Agent') || '';
  const fila = {
    negocio: NEGOCIO, origen, tipo, descripcion: descripcion || null, pagina,
    user_id: user ? user.id : null, email, rol,
    contacto: cut(b.contacto, 120) || null,
    navegador: cut(ctx.navegador || ua, 200),
    dispositivo: /Mobi|Android|iPhone/i.test(ua) ? 'celular' : 'computador',
    pantalla: cut(ctx.pantalla, 40),
    contexto: JSON.parse(ctxStr), captura_url, huella,
    aviso_pendiente: ia
  };
  const ins = await fetch(`${c.URL}/rest/v1/reportes_web?select=id,folio`, { method:'POST', headers:{ ...H, Prefer:'return=representation' }, body:JSON.stringify(fila) });
  if (!ins.ok) { const t = await ins.text(); return J({ error:'No se pudo guardar el reporte', detalle:t.slice(0,200) }, 500); }
  const [row] = await ins.json();
  fila.folio = row.folio;

  if (!ia) { try { await avisarEquipo(env, fila); } catch(_) {} }

  return J({ ok:true, folio:row.folio, id:row.id, clave: await firmar(c.SERVICE, row.id), ia });
}
