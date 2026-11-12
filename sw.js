// Liftbook offline support. Bump CACHE when you upload a new version.
const CACHE = "liftbook-v1";
const CORE = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  const save = res => { if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
  if (url.origin === location.origin) {
    // The app itself: try the network so updates arrive, fall back to the saved copy in the gym.
    e.respondWith(fetch(req).then(save).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match("index.html"))));
  } else {
    // Fonts and the drag-and-drop library: use the saved copy when there is one.
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(save)));
  }
});
