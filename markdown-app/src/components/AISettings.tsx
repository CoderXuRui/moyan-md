import { useState, useEffect, useCallback } from 'react'
import type { AIConfig, AIProvider } from '../ai/types'
import { DEFAULT_CONFIGS, PROVIDER_LABELS } from '../ai/types'
import { getAIConfig, saveAIConfig } from '../ai/service'

interface Props {
  visible: boolean
  onClose: () => void
}

export default function AISettings({ visible, onClose }: Props) {
  const [config, setConfig] = useState<AIConfig>({
    provider: 'deepseek',
    apiKey: '',
    baseUrl: DEFAULT_CONFIGS.deepseek.baseUrl,
    model: DEFAULT_CONFIGS.deepseek.model,
    enabled: false,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (visible) {
      getAIConfig().then((saved) => {
        if (saved) {
          setConfig(saved)
        }
        setLoading(false)
      })
    }
  }, [visible])

  const handleProviderChange = useCallback((provider: AIProvider) => {
    setConfig((prev) => ({
      ...prev,
      provider,
      baseUrl: DEFAULT_CONFIGS[provider].baseUrl,
      model: DEFAULT_CONFIGS[provider].model,
    }))
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    await saveAIConfig({
      ...config,
      enabled: !!config.apiKey.trim(),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }, [config])

  if (!visible) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>AI 写作助手设置</h3>
          <button className="settings-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="settings-loading">加载中...</div>
        ) : (
          <div className="settings-body">
            <div className="settings-section">
              <label className="settings-label">AI 提供商</label>
              <div className="settings-provider-grid">
                {(Object.keys(PROVIDER_LABELS) as AIProvider[]).map((p) => (
                  <button
                    key={p}
                    className={`settings-provider-btn ${config.provider === p ? 'active' : ''}`}
                    onClick={() => handleProviderChange(p)}
                  >
                    {PROVIDER_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <label className="settings-label">API Key</label>
              <input
                type="password"
                className="settings-input"
                value={config.apiKey}
                onChange={(e) => setConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                placeholder={`请输入 ${PROVIDER_LABELS[config.provider]} API Key`}
              />
              <p className="settings-hint">
                API Key 仅存储在本地浏览器中，不会上传到任何服务器。
              </p>
            </div>

            <div className="settings-section">
              <label className="settings-label">模型</label>
              <input
                type="text"
                className="settings-input"
                value={config.model}
                onChange={(e) => setConfig((prev) => ({ ...prev, model: e.target.value }))}
              />
            </div>

            <div className="settings-section">
              <label className="settings-label">Base URL（可选）</label>
              <input
                type="text"
                className="settings-input"
                value={config.baseUrl}
                onChange={(e) => setConfig((prev) => ({ ...prev, baseUrl: e.target.value }))}
                placeholder={`默认: ${DEFAULT_CONFIGS[config.provider].baseUrl}`}
              />
            </div>

            <div className="settings-actions">
              <button
                className={`settings-save-btn ${saved ? 'saved' : ''}`}
                onClick={handleSave}
                disabled={saving}
              >
                {saved ? '已保存' : saving ? '保存中...' : '保存设置'}
              </button>
            </div>

            <div className="settings-info">
              <h4>功能说明</h4>
              <ul>
                <li><strong>AI 续写</strong>：输入时自动提供续写建议，按 Tab 接受</li>
                <li><strong>语法修正</strong>：一键修正 Markdown 格式错误</li>
                <li><strong>代码解释</strong>：选中代码块，AI 用中文解释</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
