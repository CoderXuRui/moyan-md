import type { AIConfig, AIProvider } from './types'
import { DEFAULT_CONFIGS } from './types'

/**
 * Built-in AI configuration from environment variables.
 *
 * As the app developer, you provide the API key at build time
 * so end users don't need to configure anything.
 *
 * Set these in a .env.local file (never commit it):
 *   VITE_AI_PROVIDER=deepseek
 *   VITE_AI_API_KEY=sk-...
 *   VITE_AI_BASE_URL=https://api.deepseek.com/v1   (optional)
 *   VITE_AI_MODEL=deepseek-chat                    (optional)
 *   VITE_AI_ENABLED=true                           (optional, default: true if key present)
 */

function getEnvProvider(): AIProvider {
  const p = import.meta.env.VITE_AI_PROVIDER
  if (p === 'openai' || p === 'deepseek' || p === 'zhipu' || p === 'siliconflow') return p
  return 'deepseek'
}

export function getBuiltInAIConfig(): AIConfig | null {
  const apiKey = import.meta.env.VITE_AI_API_KEY
  if (!apiKey) return null

  const provider = getEnvProvider()
  const defaults = DEFAULT_CONFIGS[provider]

  return {
    provider,
    apiKey: String(apiKey),
    baseUrl: String(import.meta.env.VITE_AI_BASE_URL || defaults.baseUrl),
    model: String(import.meta.env.VITE_AI_MODEL || defaults.model),
    enabled: import.meta.env.VITE_AI_ENABLED !== 'false',
  }
}

/**
 * Check if the app has a built-in (developer-provided) AI config.
 */
export function hasBuiltInAIConfig(): boolean {
  return !!import.meta.env.VITE_AI_API_KEY
}
