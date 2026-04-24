/**
 * Service Worker 注册与更新管理
 */

let swRegistration: ServiceWorkerRegistration | null = null

interface SWCallbacks {
  onUpdate?: () => void
  onOffline?: () => void
  onOnline?: () => void
}

export function registerSW(callbacks: SWCallbacks = {}): void {
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .then((registration) => {
        swRegistration = registration

        // 监听更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新版本已安装，等待激活
              callbacks.onUpdate?.()
            }
          })
        })
      })
      .catch((err) => {
        console.warn('SW registration failed:', err)
      })
  })

  // 网络状态监听
  window.addEventListener('online', () => callbacks.onOnline?.())
  window.addEventListener('offline', () => callbacks.onOffline?.())
}

/**
 * 跳过等待，立即激活新版本 SW
 */
export function skipWaitingAndReload(): void {
  const waitingWorker = swRegistration?.waiting

  if (waitingWorker) {
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  } else {
    window.location.reload()
    return
  }

  // 等待新 SW 接管后刷新
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

/**
 * 检查当前是否离线
 */
export function isOffline(): boolean {
  return !navigator.onLine
}
