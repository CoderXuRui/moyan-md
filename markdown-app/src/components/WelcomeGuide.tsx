import { useState } from 'react'

interface WelcomeGuideProps {
  onClose: () => void
}

export default function WelcomeGuide({ onClose }: WelcomeGuideProps) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: '欢迎使用墨砚笔记',
      content: '这是一个简洁优雅的Markdown笔记应用，让你专注于写作。',
      icon: '📝'
    },
    {
      title: '创建笔记',
      content: '点击右上角的「新建」按钮，或者使用快捷键 Cmd+N（Mac）/ Ctrl+N（Windows）来创建新笔记。',
      icon: '✨'
    },
    {
      title: '分类管理',
      content: '在左侧边栏可以创建分类，将笔记整理到不同分类中，方便管理和查找。',
      icon: '📁'
    },
    {
      title: 'AI智能助手',
      content: '使用「AI总结」快速概括内容，用「AI标题」自动生成标题，可以选中部分文本单独总结哦！',
      icon: '🤖'
    },
    {
      title: 'Markdown写作',
      content: '支持完整的Markdown语法，左边编辑，右边实时预览。我们还为你准备了一篇教程笔记！',
      icon: '🎨'
    },
    {
      title: '开始写作',
      content: '现在就开始你的创作之旅吧！点击「完成」关闭引导。',
      icon: '🚀'
    }
  ]

  const currentStep = steps[step]

  return (
    <div className="welcome-guide-overlay" onClick={onClose}>
      <div className="welcome-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-guide-icon">{currentStep.icon}</div>
        <h2 className="welcome-guide-title">{currentStep.title}</h2>
        <p className="welcome-guide-content">{currentStep.content}</p>

        <div className="welcome-guide-dots">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`welcome-guide-dot ${i === step ? 'active' : ''}`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        <div className="welcome-guide-buttons">
          {step > 0 && (
            <button
              className="welcome-guide-btn secondary"
              onClick={() => setStep(step - 1)}
            >
              上一步
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              className="welcome-guide-btn primary"
              onClick={() => setStep(step + 1)}
            >
              下一步
            </button>
          ) : (
            <button
              className="welcome-guide-btn primary"
              onClick={onClose}
            >
              完成
            </button>
          )}
        </div>

        <button className="welcome-guide-skip" onClick={onClose}>
          跳过引导
        </button>
      </div>

      <style jsx>{`
        .welcome-guide-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease;
        }

        .welcome-guide-modal {
          background: var(--bg-primary);
          border-radius: 16px;
          padding: 40px;
          max-width: 420px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease;
        }

        .welcome-guide-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .welcome-guide-title {
          font-family: 'Noto Serif SC', serif;
          font-size: 22px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .welcome-guide-content {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 28px;
        }

        .welcome-guide-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .welcome-guide-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--border);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .welcome-guide-dot:hover {
          background: var(--text-tertiary);
        }

        .welcome-guide-dot.active {
          background: var(--accent);
          width: 20px;
          border-radius: 4px;
        }

        .welcome-guide-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .welcome-guide-btn {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .welcome-guide-btn.primary {
          background: var(--accent);
          color: white;
        }

        .welcome-guide-btn.primary:hover {
          background: var(--accent-hover);
        }

        .welcome-guide-btn.secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .welcome-guide-btn.secondary:hover {
          background: var(--bg-tertiary);
        }

        .welcome-guide-skip {
          margin-top: 16px;
          background: none;
          border: none;
          color: var(--text-tertiary);
          font-size: 13px;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .welcome-guide-skip:hover {
          color: var(--text-secondary);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
