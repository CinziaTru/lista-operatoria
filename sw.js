// Memoria offline dell'app (solo il codice: i dati restano nella memoria del dispositivo, mai qui)
const CACHE = "lista-operatoria-v31";
const FILE = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILE.map((f) => new Request(f, { cache: "reload" }))))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x))))); self.clients.claim(); });
// Prima la rete (per ricevere gli aggiornamenti), se non c'è rete la copia salvata
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then((r) => { // chiede sempre al sito se la pagina è cambiata (niente copia vecchia della cache del browser)
    if (r.ok) { const c = r.clone(); caches.open(CACHE).then((x) => x.put(e.request, c)); return r; }
    return caches.match(e.request).then((v) => v || r); // sito in errore (pagina mancante, guasto di GitHub): meglio la copia salvata
  }).catch(() => caches.match(e.request).then((r) => r || caches.match("index.html"))));
});
