const CACHE = "litho-v3";
const ASSETS = ["/", "/index.html", "/styles.css", "/app.js", "/i18n.js", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// network-first so app updates appear immediately when online; cache is offline fallback
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let cross-origin (fonts, ads) pass through
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(fetch(req).catch(() => new Response(JSON.stringify({ error: "אין חיבור לרשת" }), { status: 503, headers: { "Content-Type": "application/json" } })));
    return;
  }
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((m) => m || caches.match("/")))
  );
});

self.addEventListener("push", (e) => {
  let data = { title: "יומן הידרציה", body: "זמן לשתות מים 💧" };
  try { if (e.data) data = e.data.json(); } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      lang: "he",
      dir: "rtl",
      tag: "hydration-reminder",
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((list) => {
      for (const c of list) if ("focus" in c) return c.focus();
      return self.clients.openWindow("/");
    })
  );
});
