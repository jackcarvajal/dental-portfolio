/**
 * PRODIGY — Service Worker v1.0
 * Gestiona notificaciones push para estado de pedidos.
 *
 * Variables de entorno (configuradas en Supabase):
 *   META_APP_ID        — ID de la app de Meta
 *   WA_PHONE_ID        — ID del número de WhatsApp Business
 *   META_ACCESS_TOKEN  — Token permanente de la Graph API
 */

const CACHE_NAME  = 'prodigy-cache-v1';
const PUSH_ICON   = '/favicon.ico';
const PUSH_BADGE  = '/favicon.ico';

/* ── Instalación: pre-cachear assets críticos ── */
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            cache.addAll(['/seguimiento-caso.html'])
        ).catch(() => {})
    );
});

/* ── Activación: limpiar caches viejos ── */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

/* ── Push: mostrar notificación al cliente ── */
self.addEventListener('push', (event) => {
    let payload = { title: 'ProDigy', body: 'Actualización en tu pedido.', data: {} };

    try {
        payload = event.data ? { ...payload, ...event.data.json() } : payload;
    } catch {}

    const options = {
        body:    payload.body,
        icon:    PUSH_ICON,
        badge:   PUSH_BADGE,
        vibrate: [200, 100, 200],
        tag:     payload.tag || 'prodigy-update',
        renotify: true,
        data:    payload.data || {},
        actions: [
            { action: 'ver',     title: 'Ver pedido'  },
            { action: 'ignorar', title: 'Ignorar'     }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

/* ── Click en notificación ── */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'ignorar') return;

    const caseId = event.notification.data?.caseId || '';
    const url    = caseId
        ? `/seguimiento-caso.html?pedido=${caseId}`
        : '/seguimiento-caso.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(winClients => {
            for (const client of winClients) {
                if (client.url.includes('seguimiento-caso') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
