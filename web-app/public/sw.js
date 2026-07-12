const CACHE = 'decidiary-shell-v2'
const MAX_ENTRIES = 40
const APP_SHELL = ['/', '/manifest.webmanifest', '/app-icon.svg']

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) caches.open(CACHE).then(async cache => {
          await cache.put(request, response.clone())
          const keys = await cache.keys()
          const shellUrls = new Set(APP_SHELL.map(path => new URL(path, self.location.origin).href))
          const removable = keys.filter(key => !shellUrls.has(key.url))
          await Promise.all(removable.slice(0, Math.max(0, removable.length - MAX_ENTRIES)).map(key => cache.delete(key)))
        })
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        return cached || (request.mode === 'navigate' ? caches.match('/') : Response.error())
      })
  )
})
