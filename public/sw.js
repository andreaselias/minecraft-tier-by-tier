const CACHE_NAME = 'tier-by-tier-shell-v1';
const BASE = new URL('./', self.registration.scope);
const SHELL = [BASE.href, new URL('index.html', BASE).href, new URL('manifest.webmanifest', BASE).href, new URL('icons/icon-192.png', BASE).href, new URL('icons/icon-512.png', BASE).href];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL);
    // Vite injeta nomes de arquivos com hash; salvamos os recursos do HTML para a primeira visita offline.
    const html = await (await caches.match(new URL('index.html', BASE).href)).text();
    const resources = Array.from(html.matchAll(/(?:src|href)="([^"]+)"/g))
      .map((match) => new URL(match[1], BASE).href)
      .filter((url) => url.startsWith(BASE.href) && /\.(?:js|css)(?:\?|$)/.test(url));
    await cache.addAll(resources);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(BASE.href, copy)); }
      return res;
    }).catch(() => caches.match(BASE.href)));
    return;
  }
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copy)); }
    return res;
  })));
});
