// Safe service worker: cache shell only, NEVER intercept Supabase traffic
const CACHE = 'jm-requests-v3';
const ASSETS = [
  '/', '/index.html', '/staff.html', '/admin.html',
  '/logo.png', '/manifest.webmanifest'
];

self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k))))
  );
});

// Network-first for shell; ignore any requests to supabase.co (auth/db/storage/functions)
self.addEventListener('fetch', evt => {
  const url = evt.request.url;
  if (evt.request.method !== 'GET') return;
  if (url.includes('supabase.co')) return; // <-- important

  evt.respondWith(
    fetch(evt.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(evt.request, copy));
      return res;
    }).catch(() => caches.match(evt.request))
  );
});
