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
    </div>
  )
}
