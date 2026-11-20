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
 *   CRON_SECRET (el vigía y los crons ven el detalle con Authorization: Bearer CRON_SECRET)
 *
 * QUÉ VE CADA QUIEN (20-nov-2026): el público (página de soporte) solo recibe el estado general
 * { timestamp, status, summary } y, si se acaba de revisar, la copia de los últimos 2 minutos (no dispara
 * 15 llamadas externas por visita). La lista de servicios —que delata qué proveedores usa el negocio
 * (Factus, Resend, CallMeBot, Stripe…)— solo la ven el equipo admin (sesión) o el vigía (CRON_SECRET).
 */
import { cfg, usuarioDe, ADMIN_EMAILS } from './reportar-problema.js';

const RESUMEN_CACHE = 'https://rl.internal/health-check-resumen';   // último estado público (2 min)

const TIMEOUT_MS = 5000; // 5 segundos máximo por servicio

const SERVICES = [
  {
    name: 'Supabase API',
    url: (env) => `${env.SUPABASE_URL}/rest/v1/`,
    headers: (env) => ({ 'apikey': env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_KEY }),
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
    name: 'Geo propio (/api/geo, reemplaza a ipapi.co)',
    url: () => 'https://prodigylabdental.com/api/geo',
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
    critical: false,          // pide User-Agent identificable (sin él da 403): ver _fetchOnce
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
    expectStatus: [200, 301, 302, 401, 403, 404, 405], // 401/403 = la API responde (pide credenciales)
    critical: false,
  },
  {
    name: 'Resend Email API',
    url: () => 'https://api.resend.com',
    method: 'HEAD',
    expectStatus: [200, 401, 403, 405],
    critical: false,
  },
  {
    name: 'Callmebot WA',
    url: () => 'https://api.callmebot.com',
    method: 'HEAD',
    expectStatus: [200, 301, 302, 400, 403, 405],
    critical: false,
  },
  {
    name: 'PRODIGY Sitemap',
    url: () => 'https://prodigylabdental.com/sitemap.xml',
    method: 'HEAD',
    expectStatus: [200],
    critical: false,
  },
  {
    name: 'Landing Referidos',
    url: () => 'https://prodigylabdental.com/referidos',
    method: 'HEAD',
    expectStatus: [200],
    critical: false,
  },
  {
    name: 'Landing Para Labs',
    url: () => 'https://prodigylabdental.com/para-laboratorios',
    method: 'HEAD',
    expectStatus: [200],
    critical: false,
  },
];

async function _fetchOnce(service, env) {
  const url     = service.url(env);
  const method  = service.method || 'GET';
  const headers = { 'User-Agent': 'PRODIGY-HealthCheck/1.0 (+https://prodigylabdental.com)', ...(service.headers ? service.headers(env) : {}) };
  const allowed = service.expectStatus || [200, 201, 204];
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const res = await fetch(url, { method, headers, signal: controller.signal, redirect: 'follow' });
  clearTimeout(tid);
  const ok = allowed.includes(res.status) || (res.status >= 200 && res.status < 400);
  return { ok, status: res.status };
}

async function checkService(service, env) {
  const start    = Date.now();
  const maxTries = service.critical ? 2 : 1; // críticos: 2 intentos; no-críticos: 1
  let lastErr, lastStatus;
  for (let attempt = 0; attempt < maxTries; attempt++) {
    try {
      const { ok, status } = await _fetchOnce(service, env);
      const ms = Date.now() - start;
      if (ok || attempt === maxTries - 1) {
        return { name: service.name, ok, status, ms, critical: service.critical, attempt };
      }
      lastStatus = status;
      await new Promise(r => setTimeout(r, 800)); // 800ms entre intentos
    } catch(e) {
      lastErr    = e;
      lastStatus = e.name === 'AbortError' ? 'TIMEOUT' : 'ERROR';
      if (attempt < maxTries - 1) await new Promise(r => setTimeout(r, 800));
    }
  }
  return {
    name:     service.name,
    ok:       false,
    status:   lastStatus || 'ERROR',
    error:    lastErr ? (lastStatus === 'TIMEOUT' ? 'timeout' : 'error de red') : undefined,   // sin el texto de la excepción (endpoint público)
    ms:       Date.now() - start,
    critical: service.critical,
    attempt:  maxTries,
  };
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

async function _rlHealthCheck(request) {
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rlKey = new Request('https://rl.internal/health-check_' + ip);
    const hit = await caches.default.match(rlKey);
    const count = hit ? (parseInt(await hit.text(), 10) || 0) : 0;
    if (count >= 5) return false; // máx 5 req/min por IP — evita abuso de las 12 APIs externas
    await caches.default.put(rlKey, new Response(String(count + 1), {
      headers: { 'Cache-Control': 'max-age=60' }
    }));
    return true;
  } catch { return true; }
}

// ¿Quién pide? Vigía/cron con CRON_SECRET o un admin con sesión → detalle. Cualquier otro → solo el resumen.
async function veDetalle(request, env) {
  const key = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim();
  if (!key) return false;
  if (env.CRON_SECRET && key === env.CRON_SECRET) return true;
  const c = cfg(env);
  const yo = c.SERVICE ? await usuarioDe(request, c) : null;
  const roles = [].concat(yo?.app_metadata?.roles || [], yo?.app_metadata?.role || []);
  return !!yo && (ADMIN_EMAILS.includes(String(yo.email || '').toLowerCase()) || roles.includes('admin'));
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const detalle = await veDetalle(request, env);

  // Público: si hay un estado de hace menos de 2 minutos, se devuelve ese (sin llamar a nadie)
  if (!detalle) {
    try {
      const hit = await caches.default.match(new Request(RESUMEN_CACHE));
      if (hit) { const txt = await hit.text(); let crit = false; try { crit = JSON.parse(txt).status === 'CRITICAL'; } catch (_) {} return new Response(txt, { status: crit ? 503 : 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } }); }
    } catch (_) {}
  }

  if (!(await _rlHealthCheck(request))) {
    return new Response(JSON.stringify({ error: 'Demasiadas solicitudes.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const results = await Promise.allSettled(
    SERVICES.map(s => checkService(s, env))
  );

  const checks = results.map(r => r.status === 'fulfilled' ? r.value : { name:'?', ok:false, status:'ERR' });
  const failed   = checks.filter(c => !c.ok);
  const critical = failed.filter(c => c.critical);
  const allOk    = failed.length === 0;

  // Alertas: como máximo UNA por hora en total (la página pública de soporte también llama aquí; sin esto cada
  // visitante disparaba un correo + WhatsApp mientras un servicio estuviera caído)
  let alertar = critical.length > 0;
  if (alertar) {
    try {
      const marca = new Request('https://rl.internal/health-check-alerta');
      if (await caches.default.match(marca)) alertar = false;
      else await caches.default.put(marca, new Response('1', { headers: { 'Cache-Control': 'max-age=3600' } }));
    } catch (_) {}
  }

  // Alerta email si hay fallos críticos y está configurado Resend
  if (alertar && env.RESEND_API_KEY) {
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
  if (alertar) {
    await sendWhatsAppAlert(critical, env);
  }

  const resumen = {
    timestamp: new Date().toISOString(),
    status:    allOk ? 'OK' : (critical.length > 0 ? 'CRITICAL' : 'DEGRADED'),
    summary: {
      total:    checks.length,
      passing:  checks.filter(c => c.ok).length,
      failing:  failed.length,
      critical: critical.length,
    },
  };
  const status = allOk ? 200 : (critical.length > 0 ? 503 : 207);
  try {
    await caches.default.put(new Request(RESUMEN_CACHE), new Response(JSON.stringify(resumen), { status: 200, headers: { 'Cache-Control': 'max-age=120' } }));
  } catch (_) {}

  // Detalle por servicio: solo equipo/vigía, y solo para la misma web (sin CORS abierto)
  if (detalle) {
    return new Response(JSON.stringify({ ...resumen, services: checks }, null, 2), {
      status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  return new Response(JSON.stringify(resumen, null, 2), {
    status,
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
