import { useState } from 'react'
import { CloseIcon } from './Icons'

interface SummaryDialogProps {
  summary: string
  originalContent: string
  hasExistingSummary: boolean
  onConfirm: (content: string, replaceExisting: boolean) => void
  onCancel: () => void
}

export default function SummaryDialog({ summary, originalContent, hasExistingSummary, onConfirm, onCancel }: SummaryDialogProps) {
  const [insertPosition, setInsertPosition] = useState<'start' | 'end'>('start')
  const [replaceExisting, setReplaceExisting] = useState(hasExistingSummary)

  const handleConfirm = () => {
    let cleanedContent = originalContent

    if (replaceExisting) {
      // 删除旧的AI总结
      const aiSummaryRegex = /^> 🤖 \*\*AI 总结\*\*[\s\S]*?\n---\s*/gm
      cleanedContent = cleanedContent.replace(aiSummaryRegex, '')
    }

    const summaryBlock = `> 🤖 **AI 总结**\n> \n> ${summary.replace(/\n/g, '\n> ')}\n\n---\n\n`
    let newContent: string
    if (insertPosition === 'start') {
      newContent = summaryBlock + cleanedContent
    } else {
      newContent = cleanedContent + '\n\n' + summaryBlock
    }
    onConfirm(newContent, replaceExisting)
  }

  return (
    <div className="summary-dialog-overlay" onClick={onCancel}>
      <div className="summary-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="summary-dialog-header">
          <h3>AI 总结完成</h3>
          <button className="summary-dialog-close" onClick={onCancel}>
            <CloseIcon />
          </button>
        </div>

        <div className="summary-dialog-content">
          <div className="summary-preview">
            {summary}
          </div>

          {hasExistingSummary && (
            <div className="summary-warning">
              <label className="summary-option summary-option-check">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                />
                <span>替换已有的AI总结</span>
              </label>
            </div>
          )}

          <div className="summary-options">
            <label className="summary-option">
              <input
                type="radio"
                value="start"
                checked={insertPosition === 'start'}
                onChange={() => setInsertPosition('start')}
              />
              <span>插入到开头</span>
            </label>
            <label className="summary-option">
              <input
                type="radio"
                value="end"
                checked={insertPosition === 'end'}
                onChange={() => setInsertPosition('end')}
              />
              <span>插入到结尾</span>
            </label>
          </div>
        </div>

        <div className="summary-dialog-actions">
          <button className="summary-btn summary-btn-cancel" onClick={onCancel}>
            取消
          </button>
          <button className="summary-btn summary-btn-confirm" onClick={handleConfirm}>
            插入总结
          </button>
        </div>
      </div>

      <style jsx>{`
        .summary-dialog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease;
        }

        .summary-dialog {
          background: var(--bg-primary);
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease;
        }

        .summary-dialog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .summary-dialog-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .summary-dialog-close {
          padding: 6px;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .summary-dialog-close:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .summary-dialog-content {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }

        .summary-preview {
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: 8px;
          color: var(--text-primary);
          line-height: 1.7;
          white-space: pre-wrap;
          margin-bottom: 16px;
        }

        .summary-warning {
          padding: 12px;
          background: rgba(234, 179, 8, 0.1);
          border: 1px solid rgba(234, 179, 8, 0.3);
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .summary-options {
          display: flex;
          gap: 16px;
        }

        .summary-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .summary-option-check {
          color: var(--text-primary);
        }

        .summary-option input {
          cursor: pointer;
        }

        .summary-dialog-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding: 16px 20px;
          border-top: 1px solid var(--border);
        }

        .summary-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .summary-btn-cancel {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .summary-btn-cancel:hover {
          background: var(--bg-tertiary);
        }

        .summary-btn-confirm {
          background: var(--accent);
          color: white;
        }

        .summary-btn-confirm:hover {
          opacity: 0.9;
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
