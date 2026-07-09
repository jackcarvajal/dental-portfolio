/**
 * PRODIGY — Reporte mensual por email al admin
 * GET /api/resumen-mensual?key=CRON_SECRET
 *
 * Llamar el 1 de cada mes (Cloudflare Workers Cron).
 * Env vars: SUPABASE_SERVICE_KEY, CRON_SECRET, RESEND_API_KEY, ADMIN_EMAIL
 */

const SURL = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';

export async function onRequestGet({ request, env }) {
  const key = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim() || new URL(request.url).searchParams.get('key');
  if (!env.CRON_SECRET || key !== env.CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  if (!env.SUPABASE_SERVICE_KEY) return new Response(JSON.stringify({ error: 'SUPABASE_SERVICE_KEY falta' }), { status: 503 });
  if (!env.RESEND_API_KEY) return new Response(JSON.stringify({ error: 'RESEND_API_KEY falta' }), { status: 503 });

  const h = { 'apikey': env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' };
  const now = new Date();
  const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const finMes = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const desde = mesAnterior.toISOString().slice(0, 10);
  const hasta = finMes.toISOString().slice(0, 10);
  const mesNombre = mesAnterior.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

  try {
    // 1. Pedidos del mes
    const rPed = await fetch(`${SURL}/rest/v1/pedidos?negocio=eq.prodigy&created_at=gte.${desde}T00:00:00&created_at=lte.${hasta}T23:59:59&select=id,estado,total,flujo,created_at`, { headers: h });
    const pedidos = await rPed.json();

    // 2. Cotizaciones del mes
    const rCot = await fetch(`${SURL}/rest/v1/cotizaciones?negocio=eq.prodigy&created_at=gte.${desde}T00:00:00&created_at=lte.${hasta}T23:59:59&select=id,estado,total`, { headers: h });
    const cotizaciones = await rCot.json();

    // 3. Suscriptores newsletter
    const rNl = await fetch(`${SURL}/rest/v1/newsletter_subscribers?negocio=eq.prodigy&activo=eq.true&select=id`, { headers: h });
    const nlSubs = await rNl.json();

    // Calcular KPIs
    const totalPedidos = Array.isArray(pedidos) ? pedidos.length : 0;
    const ingresosBrutos = Array.isArray(pedidos) ? pedidos.reduce((s, p) => s + Number(p.total || 0), 0) : 0;
    const entregados = Array.isArray(pedidos) ? pedidos.filter(p => ['ENTREGADO', 'LISTO_DESPACHAR'].includes(p.estado_operativo || p.estado)).length : 0;
    const totalCotiz = Array.isArray(cotizaciones) ? cotizaciones.length : 0;
    const cotizAceptadas = Array.isArray(cotizaciones) ? cotizaciones.filter(c => c.estado === 'aceptada').length : 0;
    const conversionCotiz = totalCotiz > 0 ? Math.round(cotizAceptadas / totalCotiz * 100) : 0;
    const totalSubs = Array.isArray(nlSubs) ? nlSubs.length : 0;
    const fmtCOP = n => '$' + Math.round(n).toLocaleString('es-CO');

    // Desglose por flujo
    const flujos = {};
    if (Array.isArray(pedidos)) pedidos.forEach(p => { const f = p.flujo || 'otro'; flujos[f] = (flujos[f] || 0) + 1; });
    const flujosHtml = Object.entries(flujos).map(([f, n]) => `<li>${f}: <strong>${n}</strong></li>`).join('');

    // Email HTML
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<style>body{margin:0;padding:0;background:#050505;font-family:-apple-system,sans-serif;color:#e2e8f0;}
.wrap{max-width:600px;margin:0 auto;padding:32px 24px;}
.logo{font-size:1.3rem;font-weight:900;letter-spacing:3px;color:#D4AF37;margin-bottom:8px;}
.subtitle{font-size:.8rem;color:#94a3b8;margin-bottom:28px;}
.card{background:#0d1520;border:1px solid rgba(212,175,55,.2);border-radius:16px;padding:24px;margin-bottom:20px;}
.kpi-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.kpi{text-align:center;padding:16px;background:rgba(255,255,255,.03);border-radius:10px;}
.kpi-val{font-size:1.8rem;font-weight:900;margin-bottom:4px;}
.kpi-lbl{font-size:.7rem;color:#94a3b8;text-transform:uppercase;}
h2{font-size:1rem;font-weight:800;color:#D4AF37;margin:0 0 14px;}
p,li{font-size:.85rem;color:#94a3b8;line-height:1.7;}
ul{padding-left:16px;}
.footer{font-size:.7rem;color:#334155;margin-top:24px;text-align:center;}
a{color:#D946A6;}
</style></head><body>
<div class="wrap">
  <div class="logo">💎 PRODIGY</div>
  <div class="subtitle">Reporte mensual — ${mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)}</div>
  <div class="card">
    <h2>📊 KPIs del Mes</h2>
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-val" style="color:#D4AF37;">${totalPedidos}</div><div class="kpi-lbl">Pedidos</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#00FF41;">${fmtCOP(ingresosBrutos)}</div><div class="kpi-lbl">Ingresos brutos</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#00d2ff;">${totalCotiz}</div><div class="kpi-lbl">Cotizaciones</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#D946A6;">${conversionCotiz}%</div><div class="kpi-lbl">Conversión cot.</div></div>
    </div>
  </div>
  <div class="card">
    <h2>📋 Pedidos por Flujo</h2>
    <ul>${flujosHtml || '<li>Sin pedidos en el período</li>'}</ul>
  </div>
  <div class="card">
    <h2>📧 Newsletter</h2>
    <p>Suscriptores activos: <strong style="color:#D4AF37;">${totalSubs}</strong></p>
  </div>
  <div class="card">
    <h2>📅 Período</h2>
    <p>Del <strong>${desde}</strong> al <strong>${hasta}</strong></p>
    <p style="margin-top:8px;"><a href="https://prodigylabdental.com/app/metricas.html">Ver BI Dashboard completo →</a></p>
  </div>
  <div class="footer">PRODIGY Lab Dental · Generado automáticamente el ${now.toLocaleDateString('es-CO')}</div>
</div></body></html>`;

    // Enviar email
    const adminEmail = env.ADMIN_EMAIL || 'gerencia@prodigylabdental.com';
    const emailResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'PRODIGY Lab Dental <noreply@prodigylabdental.com>',
        to: [adminEmail],
        subject: `📊 Reporte Mensual PRODIGY — ${mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)}`,
        html,
        text: `Pedidos: ${totalPedidos} | Ingresos: ${fmtCOP(ingresosBrutos)} | Cotizaciones: ${totalCotiz} | Conversión: ${conversionCotiz}%`,
      }),
    });

    const emailData = await emailResp.json();

    return new Response(JSON.stringify({
      ok: true,
      mes: mesNombre,
      kpis: { pedidos: totalPedidos, ingresos: ingresosBrutos, cotizaciones: totalCotiz, conversion: conversionCotiz },
      email: emailData.id || 'sent',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('[resumen-mensual]', err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
}
