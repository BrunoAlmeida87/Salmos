/* Service worker: guarda o site no aparelho para funcionar sem internet.
 * Ao publicar mudanças, aumente o número da VERSAO para os aparelhos baixarem a nova versão.
 */
const VERSAO = "salmo-do-dia-v2";
const ARQUIVOS = [
  "./", "index.html", "salmos.html", "calendario.html", "manifest.webmanifest",
  "css/style.css",
  "js/salmos.js", "js/paroquia.js", "js/liturgia.js", "js/conteudo.js", "js/comum.js", "js/cartao.js",
  "js/app.js", "js/salmos-pagina.js", "js/calendario.js",
  "icons/icone.svg", "icons/icone-180.png", "icons/icone-192.png", "icons/icone-512.png", "icons/icone-maskable-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
// Rede primeiro (para pegar atualizações), cache como reserva quando estiver sem internet.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) { const copia = r.clone(); caches.open(VERSAO).then((c) => c.put(e.request, copia)); }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
  );
});
