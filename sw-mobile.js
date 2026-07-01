// Service Worker for Screentime mobile app — v2
// Network-first for the app shell so updates apply automatically;
// cache is only a fallback when offline.
const CACHE = 'screentime-mobile-v2';
const ASSETS = ['./screentime-mobile.html', './icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Never touch Apps Script API calls — always straight to network
  if (e.request.url.includes('script.google.com')) return;
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;

  // Network-first: fetch fresh, update cache, fall back to cache offline
  e.respondWith(
    fetch(e.request).then(resp => {
      const clone = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return resp;
    }).catch(() => caches.match(e.request))
  );
});
