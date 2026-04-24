/**
 * 墨砚 Service Worker
 * 策略：Stale-While-Revalidate（优先本地缓存，后台同步更新）
 */

const CACHE_NAME = 'moyan-cache-v1'
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icons.svg',
]

// 安装：缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      return self.skipWaiting()
    })
  )
})

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// 监听消息：处理 SKIP_WAITING
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// 拦截请求
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 跳过非 GET 请求和 chrome-extension
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }

  // 导航请求（HTML 页面）- Network First，离线回退
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('./index.html')
          })
        })
    )
    return
  }

  // 静态资源 - Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // 后台刷新
        fetch(request)
          .then((response) => {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          })
          .catch(() => {})
        return cached
      }

      return fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => {
          return new Response('Offline', { status: 503 })
        })
    })
  )
})
