/**
 * PRODIGY — CSP Violation Report Endpoint
 * Cloudflare Pages Function — POST /api/csp-report
 *
 * Recibe violaciones de la Content-Security-Policy y las registra
 * en Supabase para análisis. Permite migrar hacia CSP más estricta
 * monitoreando qué scripts reales fallarían.
 *
 * Para activar: Content-Security-Policy-Report-Only: ... report-uri /api/csp-report
 */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Content-Type':                  'application/json',
};

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Rate limit: 5 req/min por IP (evita flood de logs_incidencias)
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rlKey = new Request('https://rl.internal/csp-report_' + ip);
    const hit = await caches.default.match(rlKey);
    if (hit) {
      const count = parseInt(await hit.text(), 10) || 0;
      if (count >= 5) return new Response(JSON.stringify({ ok: false, error: 'Demasiadas solicitudes.' }), { status: 429, headers: CORS });
      await caches.default.put(rlKey, new Response(String(count + 1), { headers: { 'Cache-Control': 'max-age=60' } }));
    } else {
      await caches.default.put(rlKey, new Response('1', { headers: { 'Cache-Control': 'max-age=60' } }));
    }

    const body   = await request.json();
    const report = body['csp-report'] || body;
    const _trunc = (s, n) => String(s || '').slice(0, n);

    // Solo loggear violaciones reales (no las del browser testing)
    const violation = {
      blocked_uri:   _trunc(report['blocked-uri']   || report.blockedURI,    300),
      violated_dir:  _trunc(report['violated-directive'] || report.violatedDirective, 150),
      source_file:   _trunc(report['source-file']   || report.sourceFile,    300),
      document_uri:  _trunc(report['document-uri']  || report.documentURI,   300),
      ts:            new Date().toISOString(),
      ua:            request.headers.get('User-Agent')?.slice(0,120) || '',
    };

    // Ignorar recursos de extensiones de Chrome o DevTools
    if (violation.blocked_uri.startsWith('chrome-extension:') ||
        violation.blocked_uri.startsWith('moz-extension:') ||
        violation.blocked_uri === 'eval') {
      return new Response(JSON.stringify({ ok: true, skip: 'extension/eval' }), { headers: CORS });
    }

    // Registrar en Supabase si está configurado
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      await fetch(`${env.SUPABASE_URL}/rest/v1/logs_incidencias`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({
          tipo:        'CSP_VIOLATION',
          severidad:   'WARN',
          descripcion: `[CSP] ${violation.violated_dir} → ${violation.blocked_uri} | ${violation.source_file} | ${violation.document_uri}`,
          resuelta:    false,
        }),
      }).catch(() => {}); // silent fail
    }

    console.log('[CSP Report]', JSON.stringify(violation));
    return new Response(JSON.stringify({ ok: true }), { status: 204, headers: CORS });

  } catch(e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 400, headers: CORS });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
