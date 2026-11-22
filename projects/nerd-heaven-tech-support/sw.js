'use strict';
/* Nerd Heaven service worker: caches the course shell so the installed
   app works offline. It only ever handles this app's own files. */
const VERSION = 'nerd-heaven-v18';
const SHELL = [
  './',
  './index.html',
  './START-HERE.html',
  './discovery.html',
  './style.css',
  './app.js',
  './course.js',
  './Tech-Bench-Header.jpg',
  './gates-pattern.jpg',
  './Nerd-Heaven-Workbook.pdf',
  './mentor-guide.txt',
  './ticket-template.txt',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(request).catch(() => {
        if (request.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});
