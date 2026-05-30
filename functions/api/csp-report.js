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
    const body   = await request.json();
    const report = body['csp-report'] || body;

    // Solo loggear violaciones reales (no las del browser testing)
    const violation = {
      blocked_uri:   report['blocked-uri']   || report.blockedURI    || '',
      violated_dir:  report['violated-directive'] || report.violatedDirective || '',
      source_file:   report['source-file']   || report.sourceFile    || '',
      document_uri:  report['document-uri']  || report.documentURI   || '',
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
