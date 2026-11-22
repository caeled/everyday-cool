/* Flynn's Arcade service worker — assembled package, cache-first for the room itself. */
var CACHE = 'flynns-arcade-v1';
var PRECACHE = [
 "./",
 "index.html",
 "manifest.webmanifest",
 "assets/arcade-banner.webp",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/icon-maskable-512.png",
 "games/asteroids.html",
 "games/tron.html",
 "games/invaders.html",
 "games/defender.html",
 "games/paper-airplane.html",
 "games/primordial-soup.html",
 "games/robot-daemon-scroller.html",
 "games/pinball.html",
 "games/assets/cosmic.webp",
 "games/assets/deepsea.webp",
 "games/assets/haunted.webp",
 "games/assets/western.webp",
 "games/breakout.html",
 "games/tempest.html",
 "games/frogger.html",
 "games/ai-karts.html",
 "games/solitaire.html",
 "games/tarot.html",
 "games/bulletin-board.html",
 "games/assets/arcade-banner.webp",
 "games/crossroads.html",
 "games/assets/crossroads-station.webp",
 "games/assets/media-generation-crossroads-station-1795316756.json",
 "games/infinity-complex.html",
 "games/assets/complex.webp",
 "games/wandering-hub.html",
 "games/assets/hub-valley.webp",
 "games/assets/media-generation-wandering-hub-valley-1795317071.json",
 "games/gravity-golf.html"
];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(PRECACHE); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(function(hit){
    if(hit) return hit;
    return fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return res;
    });
  }));
});
