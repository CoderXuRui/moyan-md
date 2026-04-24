export type AIProvider = 'openai' | 'deepseek' | 'zhipu' | 'siliconflow'

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  baseUrl: string
  model: string
  enabled: boolean
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamChunk {
  content: string
  done: boolean
}

export type OnStreamChunk = (chunk: StreamChunk) => void

export const DEFAULT_CONFIGS: Record<AIProvider, Omit<AIConfig, 'apiKey'>> = {
  openai: {
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    enabled: false,
  },
  deepseek: {
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    enabled: false,
  },
  zhipu: {
    provider: 'zhipu',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    enabled: false,
  },
  siliconflow: {
    provider: 'siliconflow',
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'deepseek-ai/DeepSeek-V3',
    enabled: false,
  },
}

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: 'OpenAI',
  deepseek: 'DeepSeek',
  zhipu: '智谱 GLM',
  siliconflow: '硅基流动',
}

export const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  zhipu: ['glm-4-flash', 'glm-4', 'glm-4-air', 'glm-4-plus'],
  siliconflow: [
    'deepseek-ai/DeepSeek-V3',
    'deepseek-ai/DeepSeek-R1',
    'Qwen/Qwen2.5-72B-Instruct',
    'Qwen/Qwen2.5-7B-Instruct',
    'THUDM/glm-4-9b-chat',
    'meta-llama/Meta-Llama-3.1-70B-Instruct',
  ],
}
