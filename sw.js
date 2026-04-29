// Prodigy Lab Dental — Service Worker v3.1 (SWR + Push Notifications)
const CACHE = 'prodigy-v11';

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
  '/guia-tecnica',
  '/calidad',
  '/diseno-remoto',
  '/en/global-design',
  '/soporte-tecnico',
  '/alejandro',
  '/manifest.json',
  '/assets/prodigy-preview.jpg',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

// Rutas que NUNCA cacheamos (siempre network-only)
const NEVER_CACHE = [
  '/',                     // Homepage: tiene bypass, debe ser siempre fresco
  '/app/',
  '/sql/',
  '/supabase/',
  '/mantenimiento',
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

// --- FETCH: Stale-While-Revalidate para HTML, Cache-first+SWR para assets ---
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = request.url;

  // Skip non-GET y rutas privadas
  if (request.method !== 'GET' || shouldSkip(url)) return;

  const isHTML = request.headers.get('accept') && request.headers.get('accept').includes('text/html');

  if (isHTML) {
    // Estrategia HTML: Stale-While-Revalidate
    // → Sirve desde caché inmediatamente (TTI < 0.8s)
    // → Actualiza caché en background silenciosamente
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(request).then(cached => {
          const networkFetch = fetch(request).then(res => {
            if (res && res.status === 200) {
              cache.put(request, res.clone());
            }
            return res;
          }).catch(() => null);

          // Si hay caché: devolver inmediatamente + revalidar en fondo
          // Si no hay caché: esperar red (primera visita)
          return cached || networkFetch.then(res => res || cache.match('/index.html'));
        })
      )
    );
    return;
  }

  // Estrategia assets (JS/CSS/fonts/imágenes): Cache-first + revalidación silenciosa
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(request).then(cached => {
        const networkFetch = fetch(request).then(res => {
          if (res && res.status === 200 && res.type !== 'opaque') {
            cache.put(request, res.clone());
          }
          return res;
        }).catch(() => null);

        return cached || networkFetch;
      })
    )
  );
});

// --- PUSH: mostrar notificación cuando el servidor la dispara ---
self.addEventListener('push', e => {
  let data = { title: '🦷 PRODIGY Lab', body: 'Tu caso está listo.', tag: 'caso', url: '/seguimiento-caso' };
  try { data = Object.assign(data, e.data.json()); } catch(_) {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    '/assets/icons/icon-192.png',
      badge:   '/assets/icons/icon-192.png',
      tag:     data.tag || 'caso',
      data:    { url: data.url || '/seguimiento-caso' },
      vibrate: [200, 100, 200],
      actions: [
        { action: 'ver', title: '📦 Ver seguimiento' },
        { action: 'cerrar', title: 'Cerrar' }
      ]
    })
  );
});

// --- NOTIFICATIONCLICK: abrir seguimiento-caso ---
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'cerrar') return;
  const url = (e.notification.data && e.notification.data.url) || '/seguimiento-caso';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      const match = cs.find(c => c.url.includes('seguimiento-caso') || c.url.includes(url));
      return match ? match.focus() : clients.openWindow(url);
    })
  );
});
