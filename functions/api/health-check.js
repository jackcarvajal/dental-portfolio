/**
 * PRODIGY — Health Check de APIs externas
 * Cloudflare Pages Function — GET /api/health-check
 *
 * Verifica el estado de las 12+ integraciones externas.
 * Si alguna falla → envía alerta a WhatsApp del admin.
 *
 * Cron sugerido: configurar en Cloudflare Workers Cron Triggers
 *   schedule: "0 * * * *"  → cada hora
 *
 * Env vars requeridas:
 *   SUPABASE_URL, SUPABASE_ANON_KEY
 *   CALLMEBOT_PHONE, CALLMEBOT_APIKEY (para alertas WA)
 *   GEMINI_API_KEY
 */

const TIMEOUT_MS = 5000; // 5 segundos máximo por servicio

const SERVICES = [
  {
    name: 'Supabase API',
    url: (env) => `${env.SUPABASE_URL}/rest/v1/`,
    headers: (env) => ({ 'apikey': env.SUPABASE_ANON_KEY }),
    critical: true,
  },
  {
    name: 'Gemini AI',
    url: () => 'https://generativelanguage.googleapis.com/v1beta/models?key=test',
    method: 'GET',
    expectStatus: [200, 400], // 400 = key inválida pero API funciona
    critical: true,
  },
  {
    name: 'Cloudflare CDN (cdnjs)',
    url: () => 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    method: 'HEAD',
    critical: false,
  },
  {
    name: 'Supabase JS (cdn.jsdelivr.net)',
    url: () => 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/package.json',
    method: 'HEAD',
    critical: false,
  },
  {
    name: 'Google Fonts',
    url: () => 'https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap',
    method: 'HEAD',
    critical: false,
  },
  {
    name: 'Google Analytics',
    url: () => 'https://www.googletagmanager.com/gtag/js?id=test',
    method: 'HEAD',
    expectStatus: [200, 400, 404],
    critical: false,
  },
  {
    name: 'ipapi.co (geo-detect)',
    url: () => 'https://ipapi.co/json/',
    critical: false,
  },
  {
    name: 'QR Server API',
    url: () => 'https://api.qrserver.com/v1/create-qr-code/?size=10x10&data=test',
    method: 'HEAD',
    critical: false,
  },
  {
    name: 'Wikipedia REST API (artículos)',
    url: () => 'https://en.wikipedia.org/api/rest_v1/',
    critical: false,
  },
  {
    name: 'Wompi (pasarela CO)',
    url: () => 'https://checkout.wompi.co/',
    method: 'HEAD',
    critical: true,
  },
  {
    name: 'Stripe',
    url: () => 'https://js.stripe.com/v3/',
    method: 'HEAD',
    critical: false,
  },
  {
    name: 'Factus DIAN',
    url: () => 'https://api.factus.com.co',
    method: 'HEAD',
    expectStatus: [200, 301, 302, 404],
    critical: false,
  },
];

async function checkService(service, env) {
  const start = Date.now();
  try {
    const url     = service.url(env);
    const method  = service.method || 'GET';
    const headers = service.headers ? service.headers(env) : {};
    const allowed = service.expectStatus || [200, 201, 204];

    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      method,
      headers,
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(tid);

    const ms = Date.now() - start;
    const ok = allowed.includes(res.status) || (res.status >= 200 && res.status < 400);
    return { name: service.name, ok, status: res.status, ms, critical: service.critical };
  } catch(e) {
    const ms = Date.now() - start;
    const timedOut = e.name === 'AbortError';
    return {
      name:     service.name,
      ok:       false,
      status:   timedOut ? 'TIMEOUT' : 'ERROR',
      error:    e.message,
      ms,
      critical: service.critical,
    };
  }
}

async function sendWhatsAppAlert(failedServices, env) {
  if (!env.CALLMEBOT_PHONE || !env.CALLMEBOT_APIKEY ||
      env.CALLMEBOT_APIKEY === 'PENDIENTE') return;

  const lines = failedServices.map(s =>
    `❌ ${s.name}: ${s.status} (${s.ms}ms)${s.critical ? ' 🚨CRÍTICO' : ''}`
  );
  const msg = `⚠️ PRODIGY Health Check ALERTA\n${lines.join('\n')}\n${new Date().toLocaleString('es-CO')}`;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${env.CALLMEBOT_PHONE}&text=${encodeURIComponent(msg)}&apikey=${env.CALLMEBOT_APIKEY}`;
  await fetch(url).catch(() => {}); // silent fail si WA no funciona
}

export async function onRequestGet(context) {
  const { env } = context;

  const results = await Promise.allSettled(
    SERVICES.map(s => checkService(s, env))
  );

  const checks = results.map(r => r.status === 'fulfilled' ? r.value : { name:'?', ok:false, status:'ERR' });
  const failed   = checks.filter(c => !c.ok);
  const critical = failed.filter(c => c.critical);
  const allOk    = failed.length === 0;

  // Alerta email si hay fallos críticos y está configurado Resend
  if (critical.length > 0 && env.RESEND_API_KEY) {
    const emailBody = critical.map(s => `❌ ${s.name}: ${s.status} (${s.ms}ms)`).join('\n');
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'PRODIGY Alertas <alertas@prodigylabdental.com>',
        to:   ['gerencia@prodigylabdental.com'],
        subject: `🚨 PRODIGY Health Check — ${critical.length} API(s) caídas`,
        text: `PRODIGY Health Check ALERTA\n\n${emailBody}\n\n${new Date().toLocaleString('es-CO')}`,
      }),
    }).catch(() => {});
  }

  // Alerta WA solo si hay fallos críticos
  if (critical.length > 0) {
    await sendWhatsAppAlert(critical, env);
  }

  const body = {
    timestamp: new Date().toISOString(),
    status:    allOk ? 'OK' : (critical.length > 0 ? 'CRITICAL' : 'DEGRADED'),
    summary: {
      total:    checks.length,
      passing:  checks.filter(c => c.ok).length,
      failing:  failed.length,
      critical: critical.length,
    },
    services: checks,
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: allOk ? 200 : (critical.length > 0 ? 503 : 207),
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Manejador para Cron Triggers de Cloudflare
export async function onRequest(context) {
  return onRequestGet(context);
}
