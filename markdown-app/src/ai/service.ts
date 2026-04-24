import type { AIConfig, ChatMessage, OnStreamChunk } from './types';
import { getBuiltInAIConfig } from './env-config';

/**
 * Get the active AI configuration.
 *
 * Configuration is read from environment variables at build time.
 * Users cannot configure AI settings — this is developer-controlled.
 */
export function getAIConfig(): AIConfig | null {
  return getBuiltInAIConfig();
}

function buildRequestBody(config: AIConfig, messages: ChatMessage[], stream: boolean) {
  const body: Record<string, unknown> = {
    model: config.model,
    messages,
    stream,
    temperature: 0.7,
    max_tokens: 512,
  };

  // Zhipu uses top_p instead of temperature in some cases
  if (config.provider === 'zhipu') {
    delete body.temperature;
    body.top_p = 0.7;
  }

  return body;
}

/**
 * Send a streaming chat request to the LLM API
 */
export async function chatStream(
  config: AIConfig,
  messages: ChatMessage[],
  onChunk: OnStreamChunk
): Promise<void> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(buildRequestBody(config, messages, true)),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error (${response.status}): ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const data = JSON.parse(trimmed.slice(6));
        const content = data.choices?.[0]?.delta?.content || '';
        onChunk({ content, done: false });
      } catch {
        // Skip malformed lines
      }
    }
  }

  onChunk({ content: '', done: true });
}

/**
 * Send a non-streaming chat request
 */
export async function chat(config: AIConfig, messages: ChatMessage[]): Promise<string> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(buildRequestBody(config, messages, false)),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
