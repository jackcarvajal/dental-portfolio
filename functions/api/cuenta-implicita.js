/**
 * PRODIGY — Cuenta del doctor creada en el SERVIDOR al enviar una solicitud pública
 * POST /api/cuenta-implicita   Body: { origen, email, codigo, nombre, clinica, whatsapp }
 *   origen 'escaner' | 'alineadores' → solicitudes_scanner (código + ese correo)
 *   origen 'pedido' (flujo-fresado, flujo-impresión) → pedidos (código; el pedido anónimo guarda email vacío)
 *
 * Antes la página creaba la cuenta en el navegador (auth.signUp) con una clave que el navegador conocía: quien
 * escribiera el correo de OTRO doctor quedaba con sesión en una cuenta a nombre de ese correo. Ahora:
 *  · solo se crea si acaba de entrar una solicitud/pedido con ese código (últimos 15 min)
 *  · la clave temporal la genera el servidor y SOLO viaja al correo del doctor (nunca al navegador)
 *  · si el correo ya tiene cuenta, no se toca: el doctor entra con su clave o usa «olvidé mi contraseña»
 * Env: SUPABASE_SERVICE_ROLE_KEY | SUPABASE_SERVICE_KEY · RESEND_API_KEY (vía /api/send-email)
 */
import { cfg, adminH, cors, limite } from './reportar-problema.js';

const J = (o, status, h) => new Response(JSON.stringify(o), { status, headers: h });
const claveTemporal = () => {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const b = crypto.getRandomValues(new Uint8Array(10));
  return 'Prodigy-' + Array.from(b, x => abc[x % abc.length]).join('');
};

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: { ...cors(request.headers.get('Origin') || ''), 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function onRequestPost({ request, env }) {
  const h = cors(request.headers.get('Origin') || '');
  const c = cfg(env);
  if (!c.SERVICE) return J({ error: 'No configurado' }, 503, h);
  if (!(await limite(request.headers.get('CF-Connecting-IP') || 'x', 'cuenta-implicita', 5))) return J({ error: 'Demasiadas solicitudes' }, 429, h);

  let b; try { b = await request.json(); } catch { return J({ error: 'JSON inválido' }, 400, h); }
  const email = String(b.email || '').trim().toLowerCase();
  const codigo = String(b.codigo || '').trim();
  // correo estricto: sin comas, paréntesis ni % (va dentro de un filtro de PostgREST)
  if (!['escaner', 'alineadores', 'pedido'].includes(b.origen) || !/^[a-z0-9._+'-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(email) || email.length > 254 || !codigo) return J({ error: 'Datos incompletos' }, 400, h);

  // Una sola cuenta por código: el mismo pedido/solicitud no sirve para abrir cuentas a varios correos
  const unaVez = new Request('https://rl.internal/cuenta-implicita-cod_' + encodeURIComponent(codigo));
  if (await caches.default.match(unaVez)) return J({ error: 'No autorizado' }, 403, h);

  // La solicitud/pedido tiene que existir, ser de hace menos de 15 minutos y ser de ESE correo. La comparación
  // es exacta aquí y no con ilike en el filtro (en ilike el «_» del correo es comodín).
  const desde = encodeURIComponent(new Date(Date.now() - 15 * 60000).toISOString());
  const cod = encodeURIComponent(codigo);
  const ruta = b.origen === 'pedido'
    ? `pedidos?codigo=eq.${cod}&negocio=eq.prodigy&created_at=gte.${desde}`
    : `solicitudes_scanner?codigo=eq.${cod}&created_at=gte.${desde}`;
  const rs = await fetch(`${c.URL}/rest/v1/${ruta}&select=email&limit=1`, { headers: adminH(c.SERVICE) });
  const fila = rs.ok ? ((await rs.json())[0] || null) : null;
  const correoFila = String(fila?.email || '').trim().toLowerCase();
  // pedido anónimo: guarda el correo vacío → vale el del formulario; escáner/alineadores: tiene que coincidir
  if (!fila || !(correoFila === email || (b.origen === 'pedido' && !correoFila))) return J({ error: 'No autorizado' }, 403, h);
  await caches.default.put(unaVez, new Response('1', { headers: { 'Cache-Control': 'max-age=86400' } }));

  const nombre = String(b.nombre || '').slice(0, 120), clinica = String(b.clinica || '').slice(0, 120), whatsapp = String(b.whatsapp || '').slice(0, 30);
  const clave = claveTemporal();
  const ru = await fetch(`${c.URL}/auth/v1/admin/users`, {
    method: 'POST', headers: adminH(c.SERVICE),
    body: JSON.stringify({ email, password: clave, email_confirm: true,
      user_metadata: { nombre, clinica, whatsapp, rol_solicitado: 'client', primera_vez: true } }),
  });
  const u = await ru.json().catch(() => ({}));
  // El pedido anónimo se guardó sin correo: sin esto NO le aparecía al doctor en su portal (el panel filtra por
  // user_id / email), aunque el correo de bienvenida le dice que ya está ahí (23-nov-2026). Solo filas de ESE
  // código, de prodigy, sin correo todavía; con cuenta nueva también queda el user_id.
  const vincular = (uid) => b.origen !== 'pedido' ? Promise.resolve() : fetch(
    `${c.URL}/rest/v1/pedidos?codigo=eq.${cod}&negocio=eq.prodigy&email=is.null&user_id=is.null`,
    { method: 'PATCH', headers: { ...adminH(c.SERVICE), Prefer: 'return=minimal' },
      body: JSON.stringify(uid ? { email, user_id: uid } : { email }) }).catch(() => {});
  if (!ru.ok) {
    if (ru.status === 422 || /registered|exists/i.test(u.msg || u.message || u.error_code || '')) { await vincular(null); return J({ existe: true }, 200, h); }
    console.error('[cuenta-implicita] crear usuario:', ru.status, u.error_code || u.msg);
    return J({ error: 'No se pudo crear la cuenta' }, 502, h);
  }

  await vincular(u.id);

  // Perfil del doctor (id = auth.users.id)
  await fetch(`${c.URL}/rest/v1/doctores_perfil?on_conflict=id`, {
    method: 'POST', headers: { ...adminH(c.SERVICE), Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify({ id: u.id, nombre, clinica, whatsapp }),
  }).catch(() => {});

  // Bienvenida con la clave temporal: solo al correo (el texto lo arma /api/send-email)
  const re = await fetch(new URL('/api/send-email', request.url), {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(env.CRON_SECRET ? { 'x-cron-secret': env.CRON_SECRET } : {}) },
    body: JSON.stringify({ to: email, tipo: 'bienvenida', temp_pass: clave,
      subject: 'Bienvenido a PRODIGY Lab Dental — Tu portal está listo',
      text: 'Recibimos tu solicitud. Tu portal está listo en prodigylabdental.com/app/client-panel.html' }),
  }).catch(() => null);
  return J({ creada: true, correo: !!(re && re.ok) }, 200, h);
}
