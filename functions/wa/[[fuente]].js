/**
 * Enlaces de WhatsApp rastreados (estilo Beacons) — PRODIGY Lab Dental
 *
 *   /wa                → QR impresos y enlaces viejos (la fuente sale del Referer, o «directo»)
 *   /wa/<origen>       → /wa/google, /wa/instagram, /wa/tarjeta, /wa/vivane… (español)
 *   /wa/en/<origen>    → lo mismo con el mensaje en inglés  (/wa-en también = inglés)
 *
 * Anota el clic en analytics_events (evento 'wa_click', metadata.fuente) y redirige a wa.me con un
 * mensaje que ya dice de dónde viene el cliente («los encontré en Google…»). El número y el texto son
 * fijos: la URL no puede mandar a otro sitio (sin open redirect). Robots y vistas previas de enlaces
 * (WhatsApp, Facebook…) no se cuentan. Nunca falla hacia el cliente: si anotar falla, redirige igual.
 * Las cifras se ven en app/editar-links.html → «Rastreo de enlaces».
 * Gemelo: alejandro-carvajal-site/functions/wa/[[fuente]].js (cambian NEGOCIO, NUMERO, DOMINIO y textos).
 */

const NEGOCIO = 'prodigy';
const NUMERO = '573212816716';
const DOMINIO = 'prodigylabdental.com';
const SURL_DEF = 'https://zgihrwqfyvgyapbwzkvw.supabase.co';

// Sin origen conocido el mensaje es idéntico al de siempre (_redirects /wa y /wa-en).
const TEXTO = {
  es: { saludo: 'Hola PRODIGY 👋', y: 'y', resto: 'quiero cotizar un trabajo de laboratorio dental.' },
  en: { saludo: 'Hi PRODIGY 👋', y: 'and', resto: "I'd like a quote for a dental lab case." },
};

const FRASES = {
  es: {
    google: 'los encontré en Google', instagram: 'los vi en Instagram', facebook: 'los vi en Facebook',
    tiktok: 'los vi en TikTok', youtube: 'los vi en YouTube', linkedin: 'los vi en LinkedIn',
    web: 'vi su página web', tarjeta: 'vi su tarjeta', volante: 'vi su volante', qr: 'escaneé su código QR',
    correo: 'recibí su correo', referido: 'me recomendaron con ustedes', evento: 'los conocí en un evento',
  },
  en: {
    google: 'I found you on Google', instagram: 'I saw you on Instagram', facebook: 'I saw you on Facebook',
    tiktok: 'I saw you on TikTok', youtube: 'I saw you on YouTube', linkedin: 'I saw you on LinkedIn',
    web: 'I saw your website', tarjeta: 'I saw your card', volante: 'I saw your flyer', qr: 'I scanned your QR code',
    correo: 'I got your email', referido: 'I was referred to you', evento: 'we met at an event',
  },
};

const ALIAS = {
  maps: 'google', gbp: 'google', 'google-maps': 'google', ig: 'instagram', fb: 'facebook', yt: 'youtube',
  card: 'tarjeta', flyer: 'volante', email: 'correo', mail: 'correo', recomendado: 'referido',
  referral: 'referido', feria: 'evento', congreso: 'evento', event: 'evento', sitio: 'web', website: 'web',
};

const BOT = /bot\b|bot\/|crawl|spider|slurp|preview|facebookexternalhit|facebookcatalog|whatsapp\/|telegram|discord|skype|embedly|quora|pinterest\/|vkshare|headless|lighthouse|curl\/|wget|python|node-fetch|undici|axios|go-http|java\/|okhttp|monitor|uptime/i;

function limpiar(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

// Para /wa sin origen: deducirlo del sitio desde donde llegó.
function desdeReferer(ref) {
  if (!ref) return 'directo';
  let h = '';
  try { h = new URL(ref).hostname.toLowerCase(); } catch (_) { return 'otro'; }
  if (h === DOMINIO || h.endsWith('.' + DOMINIO)) return 'web';
  if (/instagram/.test(h)) return 'instagram';
  if (/facebook|^fb\.|messenger/.test(h)) return 'facebook';
  if (/tiktok/.test(h)) return 'tiktok';
  if (/(^|\.)google\./.test(h)) return 'google';
  if (/youtube|youtu\.be/.test(h)) return 'youtube';
  if (/linkedin|lnkd\.in/.test(h)) return 'linkedin';
  return limpiar(h.replace(/^www\./, '')) || 'otro';
}

async function hashDiario(ip) {
  // Anónimo y rota cada día: sirve para contar personas distintas, no para seguir a nadie.
  const dia = new Date().toISOString().slice(0, 10);
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + '|' + dia + '|wa-' + NEGOCIO));
  return Array.from(new Uint8Array(buf)).slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function anotar(request, env, datos) {
  const key = env.SUPABASE_SERVICE_KEY;
  if (!key) return;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  // Tope: 10 clics anotados por IP por minuto (el redirect nunca se bloquea).
  const rk = new Request('https://rl.internal/wa-click_' + ip);
  const hit = await caches.default.match(rk);
  const n = hit ? (parseInt(await hit.text(), 10) || 0) : 0;
  if (n >= 10) return;
  await caches.default.put(rk, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=60' } }));
  await fetch(`${env.SUPABASE_URL || SURL_DEF}/rest/v1/analytics_events`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      evento: 'wa_click',
      pagina: datos.pagina,
      negocio: NEGOCIO,
      metadata: datos.metadata,
      ip_hash: await hashDiario(ip),
      user_agent: (request.headers.get('User-Agent') || '').slice(0, 200),
      country: (request.cf && request.cf.country) || request.headers.get('CF-IPCountry') || null,
      created_at: new Date().toISOString(),
    }),
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  let destino = `https://wa.me/${NUMERO}?text=${encodeURIComponent(`${TEXTO.es.saludo} ${TEXTO.es.resto}`)}`;
  let fuente = 'directo';
  try {
    const url = new URL(request.url);
    const p = context.params && context.params.fuente;
    let segs = (Array.isArray(p) ? p : (p ? [p] : [])).map(limpiar).filter(Boolean);
    let lang = url.pathname.toLowerCase().startsWith('/wa-en') ? 'en' : 'es';
    if (segs[0] === 'en' || segs[0] === 'es') { lang = segs[0]; segs = segs.slice(1); }
    const ref = (request.headers.get('Referer') || '').slice(0, 300);
    fuente = limpiar(segs.join('-')) || desdeReferer(ref);
    fuente = ALIAS[fuente] || fuente; // /wa/maps y /wa/google cuentan juntos
    const t = TEXTO[lang];
    const frase = FRASES[lang][fuente];
    const texto = frase ? `${t.saludo} ${frase} ${t.y} ${t.resto}` : `${t.saludo} ${t.resto}`;
    destino = `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`;

    const ua = request.headers.get('User-Agent') || '';
    if (request.method === 'GET' && !BOT.test(ua)) {
      const metadata = { fuente, lang };
      if (ref) metadata.referrer = ref.slice(0, 200);
      const c = limpiar(url.searchParams.get('c') || url.searchParams.get('utm_campaign') || '');
      if (c) metadata.campana = c;
      context.waitUntil(anotar(request, env, { pagina: url.pathname.slice(0, 200), metadata }).catch(() => {}));
    }
  } catch (_) { /* nunca bloquear al cliente: sigue al WhatsApp con el texto base */ }

  return new Response(null, {
    status: 302,
    headers: {
      Location: destino,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Enlace-Rastreado': fuente,
    },
  });
}
