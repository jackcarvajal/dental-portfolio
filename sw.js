// Prodigy Lab Dental — Service Worker v2.0
const CACHE = 'prodigy-v8';

// Assets estáticos que siempre cacheamos en install
const PRECACHE = [
  // '/' — NO cachear el home: tiene el bypass de preview que debe ejecutarse siempre
  '/portafolio',
  '/calculadora',
  '/catalogo',
  '/journal',
  '/article',
  '/articles.js',
  '/nosotros',
  '/soporte',
  '/seguimiento-caso',
  '/envia-tu-scanner',
  '/escaner-domicilio',
  '/diseno-cad',
  '/fresado-cam',
  '/terminos-y-legal',
  '/instalar-app',
  '/manifest.json',
  '/assets/prodigy-preview.jpg',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

// Rutas que NUNCA cacheamos (siempre network)
const NEVER_CACHE = [
  '/',                     // Homepage: tiene bypass, debe ser siempre fresco
  '/app/',
  '/sql/',
  '/supabase/',
  '/mantenimiento',        // Nunca cachear la página de mantenimiento
  'supabase.co',
  'googleapis.com',
  'google-analytics.com',
  'whatsapp.com'
];

function shouldSkip(url) {
  return NEVER_CACHE.some(p => url.includes(p));
}

// --- INSTALL: pre-cache shell ---
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// --- ACTIVATE: limpia caches viejos ---
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// --- FETCH: Network-first para HTML, Cache-first para assets ---
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = request.url;

  // Skip non-GET y rutas privadas
  if (request.method !== 'GET' || shouldSkip(url)) return;

  // Estrategia: Network-first para HTML (contenido fresco)
  if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
    e.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/index.html')))
    );
    return;
  }

  // Estrategia: Cache-first para JS/CSS/fonts/imágenes
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(request, clone));
        return res;
      });
    })
  );
});
