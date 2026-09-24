/**
 * PRODIGY — Crear operario/staff con su rol (solo admin)
 * POST /api/crear-operario
 * Body: { email, password, nombre, whatsapp, role }
 *
 * Seguridad:
 *  - Requiere Authorization: Bearer <access_token> de un ADMIN (lista hardcodeada).
 *  - Crea el usuario con la service_role (server-side) y le fija app_metadata.role.
 *  - role validado contra una whitelist — nunca 'admin' (los admin van por email).
 *
 * Env vars (Cloudflare Pages):
 *   SUPABASE_URL                (o se usa el hardcode)
 *   SUPABASE_SERVICE_ROLE_KEY   ← OBLIGATORIA (secreta, NO exponer en el front)
 */

const SUPABASE_URL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
const ADMIN_EMAILS = ['jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'];
const ROLES_OK = ['operator','mensajero','encargado_inventario','calidad','contabilidad','diseno','taller','fresado','impresion','secretaria'];
const CORS_OK = ['https://prodigylabdental.com'];

function cors(origin){
  const ok = CORS_OK.includes(origin) || (origin||'').includes('.pages.dev') || !origin;
  return { 'Access-Control-Allow-Origin': ok ? (origin||'*') : CORS_OK[0], 'Content-Type':'application/json' };
}
export async function onRequestOptions({ request }){
  return new Response(null,{ status:204, headers:{ ...cors(request.headers.get('Origin')||''), 'Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization' } });
}

export async function onRequestPost({ request, env }){
  const h = cors(request.headers.get('Origin')||'');
  const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  const URL = env.SUPABASE_URL || SUPABASE_URL;
  if(!SERVICE) return new Response(JSON.stringify({ error:'Falta SUPABASE_SERVICE_ROLE_KEY en el entorno' }),{ status:503, headers:h });

  // 1) Verificar que quien llama es ADMIN
  const auth = request.headers.get('Authorization')||'';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if(!token) return new Response(JSON.stringify({ error:'No autenticado' }),{ status:401, headers:h });
  let caller;
  try{
    const r = await fetch(`${URL}/auth/v1/user`,{ headers:{ apikey:SERVICE, Authorization:`Bearer ${token}` } });
    caller = await r.json();
  }catch(_){ caller = null; }
  const callerEmail = (caller && caller.email || '').toLowerCase();
  if(!callerEmail || !ADMIN_EMAILS.includes(callerEmail))
    return new Response(JSON.stringify({ error:'Solo un administrador puede crear operarios' }),{ status:403, headers:h });

  // 2) Validar entrada
  let body; try{ body = await request.json(); }catch{ return new Response(JSON.stringify({ error:'JSON inválido' }),{ status:400, headers:h }); }
  const email = String(body.email||'').trim().toLowerCase();
  const password = String(body.password||'');
  const nombre = String(body.nombre||'').trim().slice(0,120);
  const whatsapp = String(body.whatsapp||'').trim().slice(0,30);
  const role = String(body.role||'').trim();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return new Response(JSON.stringify({ error:'Email inválido' }),{ status:400, headers:h });
  if(password.length < 8) return new Response(JSON.stringify({ error:'La contraseña debe tener al menos 8 caracteres' }),{ status:400, headers:h });
  if(!ROLES_OK.includes(role)) return new Response(JSON.stringify({ error:'Rol no permitido' }),{ status:400, headers:h });

  // 3) Crear usuario con la service_role + su rol en app_metadata
  const r = await fetch(`${URL}/auth/v1/admin/users`,{
    method:'POST',
    headers:{ apikey:SERVICE, Authorization:`Bearer ${SERVICE}`, 'Content-Type':'application/json' },
    body: JSON.stringify({
      email, password, email_confirm:true,
      app_metadata:{ role },
      user_metadata:{ nombre, whatsapp, es_staff:true }
    })
  });
  const data = await r.json();
  if(!r.ok) return new Response(JSON.stringify({ error: data.msg || data.error_description || data.error || 'No se pudo crear el usuario', detalle:data }),{ status:r.status, headers:h });

  return new Response(JSON.stringify({ ok:true, id:data.id, email:data.email, role }),{ status:200, headers:h });
}
