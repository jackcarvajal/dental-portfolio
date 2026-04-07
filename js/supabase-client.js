/**
 * PRODIGY — Supabase Client v2.0
 * ─────────────────────────────────────────────────────────────
 * URL:      https://zgihrwqfyvgyapbwzkvw.supabase.co
 * ANON KEY: pública, safe para frontend
 *
 * ⚠️ SERVICE_ROLE KEY: NUNCA aquí — solo supabase/functions/
 * ─────────────────────────────────────────────────────────────
 */

const SUPABASE_URL  = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhyd3FmeXZneWFwYnd6a3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzczNDksImV4cCI6MjA5MDg1MzM0OX0.9CzmFDQYeQKcbtAZoT1_n_OuJ1qPVJu3jImd938T634';

/* ── Singleton del cliente Supabase ── */
let _sb = null;
function getSupabase() {
    if (_sb) return _sb;
    if (window.supabase && window.supabase.createClient) {
        _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    }
    return _sb;
}

/* ═══════════════════════════════════════
   AUTH
═══════════════════════════════════════ */

async function checkAuthSupabase(destino) {
    // Fallback sessionStorage (funcional sin Supabase SDK)
    const role = sessionStorage.getItem('prodigy_role');
    const user = sessionStorage.getItem('prodigy_user');
    if (role && user) { window.location.href = destino; return; }

    const sb = getSupabase();
    if (sb) {
        try {
            const { data: { session } } = await sb.auth.getSession();
            if (session) {
                sessionStorage.setItem('prodigy_role', session.user.user_metadata?.role || 'client');
                sessionStorage.setItem('prodigy_user', session.user.email);
                window.location.href = destino;
                return;
            }
        } catch (e) { console.warn('Supabase auth error:', e.message); }
    }
    const dest = encodeURIComponent(destino);
    window.location.href = `app/login.html?msg=cotizar&next=${dest}`;
}

async function loginSupabase(email, password) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase SDK no cargado');
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    sessionStorage.setItem('prodigy_role', data.user.user_metadata?.role || 'client');
    sessionStorage.setItem('prodigy_user', data.user.email);
    return data;
}

async function registrarCliente(email, password, meta = {}) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase SDK no cargado');
    const { data, error } = await sb.auth.signUp({
        email, password,
        options: { data: { role: 'client', ...meta } }
    });
    if (error) throw error;
    return data;
}

async function logoutSupabase() {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    sessionStorage.removeItem('prodigy_role');
    sessionStorage.removeItem('prodigy_user');
    window.location.href = '/index.html';
}

/* ═══════════════════════════════════════
   STORAGE — Bucket: dental-cases
═══════════════════════════════════════ */

async function subirSTL(file) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase no disponible');

    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error('Sesión requerida para subir archivos');

    const userId   = session.user.id;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path     = `${userId}/${Date.now()}_${safeName}`;

    const { data, error } = await sb.storage
        .from('dental-cases')
        .upload(path, file, { cacheControl: '3600', upsert: false, contentType: 'application/octet-stream' });

    if (error) throw error;

    // URL pública del archivo subido
    const { data: { publicUrl } } = sb.storage.from('dental-cases').getPublicUrl(path);
    return { path: data.path, url: publicUrl };
}

async function subirComprobante(file, pedidoId) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase no disponible');

    const path = `comprobantes/${pedidoId}/${Date.now()}_${file.name}`;
    const { data, error } = await sb.storage
        .from('dental-cases')
        .upload(path, file, { contentType: file.type });

    if (error) throw error;
    const { data: { publicUrl } } = sb.storage.from('dental-cases').getPublicUrl(path);
    return publicUrl;
}

/* ═══════════════════════════════════════
   PEDIDOS
═══════════════════════════════════════ */

async function crearPedido(datos) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase no disponible');

    const { data, error } = await sb
        .from('pedidos')
        .insert([datos])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function obtenerHistorial() {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase no disponible');

    const { data, error } = await sb.from('pedidos').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return data;
}

async function actualizarEstadoPedido(pedidoId, nuevoEstado) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase no disponible');

    const { data, error } = await sb
        .from('pedidos')
        .update({ estado: nuevoEstado })
        .eq('id', pedidoId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/* ═══════════════════════════════════════
   PAGOS
═══════════════════════════════════════ */

async function registrarPago(datos) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase no disponible');

    const { data, error } = await sb
        .from('pagos')
        .insert([datos])
        .select()
        .single();

    if (error) throw error;
    return data;
}

/* ── Exportar (CommonJS / módulo) ── */
if (typeof module !== 'undefined') {
    module.exports = {
        SUPABASE_URL, SUPABASE_ANON, getSupabase,
        checkAuthSupabase, loginSupabase, registrarCliente, logoutSupabase,
        subirSTL, subirComprobante,
        crearPedido, obtenerHistorial, actualizarEstadoPedido,
        registrarPago
    };
}
