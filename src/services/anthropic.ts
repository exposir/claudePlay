import Anthropic from '@anthropic-ai/sdk';
import { Message } from '../types/chat';

// 代理服务地址，如果为空则使用官方 API
const ANTHROPIC_BASE_URL = localStorage.getItem('anthropic_base_url') || '';

function parseDataUri(dataUri: string) {
  const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) return null;
  return { mediaType: matches[1], data: matches[2] };
}

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

    const formattedMessages = messages
      .filter((msg) => msg.role !== 'system')
      .map((msg) => {
        if (msg.images && msg.images.length > 0) {
          const content: any[] = [];
          
          // Add images first (Anthropic recommendation? Or text first? Usually doesn't matter, but text usually explains image)
          // Actually, standard is images then text or text then images. Let's append images then text.
          
          msg.images.forEach(img => {
            const parsed = parseDataUri(img);
            if (parsed) {
              content.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: parsed.mediaType,
                  data: parsed.data,
                }
              });
            }
          });

          if (msg.content) {
            content.push({
              type: 'text',
              text: msg.content
            });
          }

          return {
            role: msg.role as 'user' | 'assistant',
            content: content
          };
        }

        return {
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        };
      });

    const stream = await anthropic.messages.stream({
      model,
      max_tokens: 4096,
      messages: formattedMessages,
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