// PRODIGY — bloquea archivos internos servidos como estáticos (200) que _redirects no alcanza
// porque Cloudflare Pages prioriza el archivo estático existente sobre las reglas de _redirects.
// Las Pages Functions se evalúan ANTES de los assets estáticos, así que esto sí intercepta.
const BLOCKED = [
  /\.md$/i,
  /^\/sql\//i,
  /^\/supabase\//i,
  /^\/scripts\//i,
  /^\/MAPA_PROYECTO\.json$/i,
  /^\/js\/supabase-mock\.js$/i,
  /^\/package(-lock)?\.json$/i,
];

export async function onRequest(context) {
  const { pathname } = new URL(context.request.url);
  if (BLOCKED.some((re) => re.test(pathname))) {
    return new Response('Not Found', { status: 404 });
  }
  return context.next();
}
