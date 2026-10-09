/**
 * PRODIGY — País del visitante
 * Cloudflare Pages Function — GET /api/geo
 *
 * Reemplaza a ipapi.co (oct-2026): Cloudflare ya sabe el país de cada visita (request.cf), así que la IP del
 * visitante no sale a un tercero, no hay tope de 1000 consultas/día y responde desde el mismo dominio.
 * Devuelve la misma forma que usaba ipapi.co ({ country_code, city, currency }) para no tocar a quien la llama.
 * Sin país conocido (local, «XX») → country_code null: cada llamador conserva su respaldo (normalmente 'CO').
 */

const MONEDA = {
  CO: 'COP', MX: 'MXN', CL: 'CLP', PE: 'PEN', AR: 'ARS', BR: 'BRL', UY: 'UYU', BO: 'BOB', PY: 'PYG', GT: 'GTQ',
  HN: 'HNL', NI: 'NIO', CR: 'CRC', DO: 'DOP', VE: 'VES', GB: 'GBP', CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK',
  PL: 'PLN', CZ: 'CZK', HU: 'HUF', CA: 'CAD', AU: 'AUD', JP: 'JPY',
};
const EURO = ['ES', 'PT', 'DE', 'IT', 'FR', 'NL', 'BE', 'AT', 'FI', 'IE', 'GR', 'SK', 'SI', 'LT', 'LV', 'EE', 'LU', 'MT', 'CY', 'HR'];

export function onRequestGet({ request }) {
  const cf = request.cf || {};
  let pais = String(cf.country || request.headers.get('CF-IPCountry') || '').toUpperCase();
  if (!/^[A-Z][A-Z0-9]$/.test(pais) || pais === 'XX') pais = null;
  const cuerpo = {
    country_code: pais,
    city: cf.city || '',
    currency: pais ? (MONEDA[pais] || (EURO.includes(pais) ? 'EUR' : 'USD')) : null,
  };
  return new Response(JSON.stringify(cuerpo), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store' },
  });
}
