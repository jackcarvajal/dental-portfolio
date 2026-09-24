/**
 * PRODIGY — Gestión de usuarios/roles del equipo (solo admin)
 * POST /api/gestion-usuarios   Body: { action, ... }
 *   action=list                              → lista staff (id,email,roles,active)
 *   action=create  {email,password,nombre,whatsapp,roles[]}
 *   action=set_roles {id, roles[], active}   → asigna varios roles + activa/desactiva
 *   action=delete  {id}                      → borra usuario (nunca un admin)
 *
 * Seguridad: exige Authorization: Bearer <access_token> de un ADMIN (lista hardcodeada).
 * Usa SUPABASE_SERVICE_ROLE_KEY (server-side) contra la API admin de GoTrue.
 */
const SUPABASE_URL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
const ADMIN_EMAILS = ['jackalejandroc@gmail.com','labdentalprodigy@gmail.com','gerencia@prodigylabdental.com','casos@prodigylabdental.com'];
const ROLES_OK = ['operator','mensajero','encargado_inventario','calidad','contabilidad','diseno','alineadores','guias','exocad','blender','taller','fresado','impresion','secretaria'];
const CORS_OK = ['https://prodigylabdental.com'];

function cors(o){ const ok=CORS_OK.includes(o)||(o||'').includes('.pages.dev')||!o; return {'Access-Control-Allow-Origin':ok?(o||'*'):CORS_OK[0],'Content-Type':'application/json'}; }
export async function onRequestOptions({request}){ return new Response(null,{status:204,headers:{...cors(request.headers.get('Origin')||''),'Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization'}}); }

export async function onRequestPost({ request, env }){
  const h = cors(request.headers.get('Origin')||'');
  const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY, URL = env.SUPABASE_URL || SUPABASE_URL;
  if(!SERVICE) return new Response(JSON.stringify({error:'Falta SUPABASE_SERVICE_ROLE_KEY en el entorno'}),{status:503,headers:h});

  // Verificar admin
  const auth = request.headers.get('Authorization')||'';
  const token = auth.startsWith('Bearer ')?auth.slice(7):'';
  if(!token) return new Response(JSON.stringify({error:'No autenticado'}),{status:401,headers:h});
  let caller; try{ caller = await (await fetch(`${URL}/auth/v1/user`,{headers:{apikey:SERVICE,Authorization:`Bearer ${token}`}})).json(); }catch(_){ caller=null; }
  const callerEmail = (caller&&caller.email||'').toLowerCase();
  if(!callerEmail || !ADMIN_EMAILS.includes(callerEmail)) return new Response(JSON.stringify({error:'Solo un administrador'}),{status:403,headers:h});

  let body; try{ body = await request.json(); }catch{ return new Response(JSON.stringify({error:'JSON inválido'}),{status:400,headers:h}); }
  const action = String(body.action||'');
  const admH = { apikey:SERVICE, Authorization:`Bearer ${SERVICE}`, 'Content-Type':'application/json' };

  // RLS lee UN solo rol (app_metadata.role). Elegimos el de mayor privilegio y
  // mapeamos especialidades de diseño (guias/exocad/blender) → 'diseno'.
  const DB_PRIORIDAD = ['operator','contabilidad','secretaria','calidad','encargado_inventario','diseno','alineadores','taller','fresado','impresion','mensajero'];
  const dbRole = roles => {
    const norm = roles.map(r => ['guias','exocad','blender'].includes(r) ? 'diseno' : r);
    return DB_PRIORIDAD.find(r => norm.includes(r)) || null;
  };
  const rolesFrom = am => Array.isArray(am&&am.roles)&&am.roles.length ? am.roles : (am&&am.role ? [am.role] : []);

  try{
    if(action==='list'){
      const r = await fetch(`${URL}/auth/v1/admin/users?per_page=200`,{headers:admH});
      const d = await r.json();
      const users = (d.users||[]).map(u=>{
        const roles = rolesFrom(u.app_metadata);
        const es_admin = ADMIN_EMAILS.includes((u.email||'').toLowerCase());
        return {
          id:u.id, email:u.email, roles,
          active: (u.app_metadata&&u.app_metadata.active)!==false,
          nombre: (u.user_metadata&&(u.user_metadata.nombre||u.user_metadata.full_name||u.user_metadata.clinica))||'',
          es_admin,
          tipo: es_admin ? 'admin' : (roles.length ? 'staff' : 'cliente'),
          ultimo_acceso: u.last_sign_in_at || null,
          created_at:u.created_at
        };
      });
      return new Response(JSON.stringify({ok:true,users,total:users.length}),{status:200,headers:h});
    }

    if(action==='create'){
      const email=String(body.email||'').trim().toLowerCase();
      const password=String(body.password||'');
      const roles=(Array.isArray(body.roles)?body.roles:[]).filter(r=>ROLES_OK.includes(r));
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return new Response(JSON.stringify({error:'Email inválido'}),{status:400,headers:h});
      if(password.length<8) return new Response(JSON.stringify({error:'Contraseña mínimo 8 caracteres'}),{status:400,headers:h});
      if(!roles.length) return new Response(JSON.stringify({error:'Selecciona al menos un rol'}),{status:400,headers:h});
      const r = await fetch(`${URL}/auth/v1/admin/users`,{method:'POST',headers:admH,body:JSON.stringify({
        email,password,email_confirm:true,
        app_metadata:{ roles, role:dbRole(roles), active:true },
        user_metadata:{ nombre:String(body.nombre||'').slice(0,120), whatsapp:String(body.whatsapp||'').slice(0,30), es_staff:true }
      })});
      const d = await r.json();
      if(!r.ok){
        const m=(d.msg||d.error_description||d.error||'').toLowerCase();
        const friendly=(m.includes('registered')||m.includes('already'))
          ? 'Ese email YA está en uso (ya tiene cuenta). Edítalo desde la lista para darle/cambiar roles, o usa otro correo.'
          : (d.msg||d.error_description||d.error||'No se pudo crear');
        return new Response(JSON.stringify({error:friendly,detalle:d}),{status:r.status,headers:h});
      }
      return new Response(JSON.stringify({ok:true,id:d.id,email:d.email,roles}),{status:200,headers:h});
    }

    if(action==='set_roles'){
      const id=String(body.id||'');
      const roles=(Array.isArray(body.roles)?body.roles:[]).filter(r=>ROLES_OK.includes(r));
      const active=body.active!==false;
      if(!id) return new Response(JSON.stringify({error:'Falta id'}),{status:400,headers:h});
      // Las cuentas admin (por correo) no se tocan desde aquí: pisar su app_metadata.role les quitaría permisos en la BD
      const objetivo = await (await fetch(`${URL}/auth/v1/admin/users/${id}`,{headers:admH})).json().catch(()=>({}));
      if(objetivo && ADMIN_EMAILS.includes((objetivo.email||'').toLowerCase()))
        return new Response(JSON.stringify({error:'Las cuentas admin no se editan desde aquí'}),{status:400,headers:h});
      const r = await fetch(`${URL}/auth/v1/admin/users/${id}`,{method:'PUT',headers:admH,body:JSON.stringify({
        app_metadata:{ roles, role:dbRole(roles), active },
        ...(typeof body.nombre==='string' && body.nombre.trim() ? { user_metadata:{ nombre:body.nombre.trim().slice(0,120) } } : {})
      })});
      const d = await r.json();
      if(!r.ok) return new Response(JSON.stringify({error:d.msg||d.error||'No se pudo actualizar',detalle:d}),{status:r.status,headers:h});
      return new Response(JSON.stringify({ok:true,id,roles,active}),{status:200,headers:h});
    }

    if(action==='delete'){
      const id=String(body.id||'');
      if(!id) return new Response(JSON.stringify({error:'Falta id'}),{status:400,headers:h});
      // No permitir borrar un admin
      const uinfo = await (await fetch(`${URL}/auth/v1/admin/users/${id}`,{headers:admH})).json();
      if(uinfo && ADMIN_EMAILS.includes((uinfo.email||'').toLowerCase()))
        return new Response(JSON.stringify({error:'No se puede borrar una cuenta admin'}),{status:400,headers:h});
      const r = await fetch(`${URL}/auth/v1/admin/users/${id}`,{method:'DELETE',headers:admH});
      if(!r.ok){ const d=await r.json().catch(()=>({})); return new Response(JSON.stringify({error:d.msg||'No se pudo borrar',detalle:d}),{status:r.status,headers:h}); }
      return new Response(JSON.stringify({ok:true,id}),{status:200,headers:h});
    }

    return new Response(JSON.stringify({error:'Acción no válida'}),{status:400,headers:h});
  }catch(e){
    return new Response(JSON.stringify({error:'Error: '+e.message}),{status:500,headers:h});
  }
}
