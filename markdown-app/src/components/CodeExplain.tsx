import { useState, useEffect, useCallback } from 'react'
import type { AIConfig } from '../ai/types'
import { chatStream } from '../ai/service'
import { buildCodeExplainPrompt, CODE_EXPLAIN_SYSTEM } from '../ai/prompts'

interface Props {
  code: string
  language?: string
  config: AIConfig | null
  onClose: () => void
}

export default function CodeExplain({ code, language, config, onClose }: Props) {
  const [explanation, setExplanation] = useState('')
  const [error, setError] = useState('')

  const fetchExplanation = useCallback(async () => {
    if (!config?.enabled || !config.apiKey) {
      setError('请先配置 AI API Key（点击右上角设置图标）')
      return
    }

    let fullText = ''

    try {
      await chatStream(
        config,
        [
          { role: 'system', content: CODE_EXPLAIN_SYSTEM },
          { role: 'user', content: buildCodeExplainPrompt(code, language) },
        ],
        (chunk) => {
          if (!chunk.done) {
            fullText += chunk.content
            setExplanation(fullText)
          }
        }
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败')
    }
  }, [config, code, language])

  useEffect(() => {
    fetchExplanation()
  }, [fetchExplanation])

  return (
    <div className="explain-overlay" onClick={onClose}>
      <div className="explain-panel" onClick={(e) => e.stopPropagation()}>
        <div className="explain-header">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            AI 代码解释
          </h3>
          <button className="explain-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="explain-body">
          {error ? (
            <div className="explain-error">{error}</div>
          ) : (
            <>
              <div className="explain-code-block">
                <pre><code>{code}</code></pre>
              </div>
              <div className="explain-content">
                {explanation || (
                  <div className="explain-loading">
                    <span className="explain-pulse-dot" />
                    <span>正在分析代码...</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
