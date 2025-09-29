// Safe service worker: cache shell, never touch Supabase traffic
const CACHE = 'jm-requests-v2';
const ASSETS = ['/', '/index.html', '/staff.html', '/admin.html', '/logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k))))
  );
});

// Network-first for shell; completely ignore Supabase requests
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Never intercept Supabase (auth, db, storage, functions)
  if (url.includes('supabase.co')) return;

  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then(res => {
      // cache a copy of successful GETs
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
