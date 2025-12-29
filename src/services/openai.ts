import OpenAI from 'openai';
import { Message } from '../types/chat';

export async function sendMessageStreamOpenAI(
  apiKey: string,
  model: string,
  messages: Message[],
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
) {
  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Note: For production, use a backend proxy
    });

    const formattedMessages = messages.map((msg) => {
      if (msg.images && msg.images.length > 0) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            ...msg.images.map(img => ({
              type: 'image_url' as const,
              image_url: { url: img }
            }))
          ]
        };
      }
      return {
        role: msg.role,
        content: msg.content,
      };
    });

    const stream = await openai.chat.completions.create({
      model,
      messages: formattedMessages as any, // Type assertion needed due to complex union types
      stream: true,
    }, {
      signal,
    });

    for await (const chunk of stream) {
      if (signal?.aborted) {
        break;
      }
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
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