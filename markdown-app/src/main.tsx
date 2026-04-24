import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from './sw-register.ts'

createRoot(document.getElementById('root')!).render(<App />)

// 注册 Service Worker（生产环境生效）
if (import.meta.env.PROD) {
  registerSW()
}
