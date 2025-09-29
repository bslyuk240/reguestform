// Safe service worker: cache shell only, NEVER intercept Supabase traffic
const CACHE = 'jm-requests-v4'; // Changed version to force update
const ASSETS = [
  '/', '/index.html', '/staff.html', '/admin.html',
  '/logo.png', '/manifest.webmanifest'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting()) // Force immediate activation
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))
    ).then(() => self.clients.claim()) // Take control immediately
  );
});

// Network-first for shell; ignore any requests to supabase.co or CDN
self.addEventListener('fetch', evt => {
  const url = evt.request.url;
  
  // Don't intercept non-GET requests
  if (evt.request.method !== 'GET') return;
  
  // Don't intercept Supabase or CDN requests
  if (url.includes('supabase.co') || 
      url.includes('cdn.jsdelivr.net') || 
      url.includes('cdnjs.cloudflare.com')) {
    return;
  }

  evt.respondWith(
    fetch(evt.request)
      .then(res => {
        // Only cache successful responses
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(evt.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(evt.request))
  );
});
