// PRODIGY — bloquea archivos internos servidos como estáticos (200) que _redirects no alcanza
// porque Cloudflare Pages prioriza el archivo estático existente sobre las reglas de _redirects.
// Las Pages Functions se evalúan ANTES de los assets estáticos, así que esto sí intercepta.
const BLOCKED = [
  /\.ps1$/i,                // scripts internos de auditoría (_auditoria.ps1)
  /^\/\.eslintrc/i,
  /\.md$/i,
  /^\/sql\//i,
  /^\/docs\//i,             // documentación interna
  /^\/supabase\//i,
  /^\/scripts\//i,
  /^\/MAPA_PROYECTO\.json$/i,
  /^\/js\/supabase-mock\.js$/i,
  /^\/package(-lock)?\.json$/i,
  /^\/\.(claude|agents)\//i,
  /^\/skills-lock\.json$/i,
];

export async function onRequest(context) {
  const { pathname, hostname } = new URL(context.request.url);
  if (BLOCKED.some((re) => re.test(pathname))) {
    return new Response('Not Found', { status: 404 });
  }
  const res = await context.next();
  // *.pages.dev: las páginas que arma una Function (/article) no reciben el X-Robots-Tag de _headers → se pone aquí.
  // /api/* no se toca (crons y streaming del asistente siguen igual).
  if (/^([a-z0-9-]+\.)?dental-portfolio-em6\.pages\.dev$/i.test(hostname) && !pathname.startsWith('/api/')) {
    const r = new Response(res.body, res);
    r.headers.set('X-Robots-Tag', 'noindex');
    return r;
  }
  return res;
}
