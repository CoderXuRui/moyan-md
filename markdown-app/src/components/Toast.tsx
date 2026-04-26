import { useEffect, useState } from 'react'

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

      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3000;
          animation: toastIn 0.3s ease;
        }

        .toast {
          padding: 12px 20px;
          border-radius: 8px;
          color: white;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .toast-message {
          font-size: 14px;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          opacity: 0.8;
        }

        .toast-close:hover {
          opacity: 1;
        }

        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
