/**
 * MEDNOVA Service Worker — mymednova.com
 */
const CACHE = 'mednova-v1.0';
const ASSETS = [
  '/',
  '/index.html',
  '/portal.html',
  '/evaluacion.html',
  '/suscribirse.html',
  '/app.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached)
    )
  );
});

self.addEventListener('push', e => {
  const d = e.data ? e.data.json() : { title: 'MEDNOVA', body: 'Tienes una notificación' };
  e.waitUntil(self.registration.showNotification(d.title || 'MEDNOVA', {
    body: d.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: { url: d.url || '/portal.html' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/portal.html'));
});
