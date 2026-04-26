import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'info' | 'error' | 'success'
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const bgColor = type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6'

  return (
    <div className="toast-container">
      <div className="toast" style={{ background: bgColor }}>
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  )
}
