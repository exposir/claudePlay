import Anthropic from '@anthropic-ai/sdk';
import { Message } from '../types/chat';

// 代理服务地址，如果为空则使用官方 API
const ANTHROPIC_BASE_URL = localStorage.getItem('anthropic_base_url') || '';

export async function sendMessageStreamAnthropic(
  apiKey: string,
  model: string,
  messages: Message[],
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
) {
  try {
    const anthropic = new Anthropic({
      apiKey,
      baseURL: ANTHROPIC_BASE_URL || undefined,
      dangerouslyAllowBrowser: true,
    });

    const stream = await anthropic.messages.stream({
      model,
      max_tokens: 4096,
      messages: messages
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
    }, {
      signal,
    });

    for await (const event of stream) {
      if (signal?.aborted) {
        break;
      }
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        onChunk(event.delta.text);
      }
    }

    if (signal?.aborted) {
      onError('Generation stopped by user');
    } else {
      onComplete();
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        onError('Generation stopped by user');
      } else {
        onError(error.message);
      }
    } else {
      onError('An unknown error occurred');
    }
  }
}
