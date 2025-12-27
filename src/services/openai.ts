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

    const stream = await openai.chat.completions.create({
      model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
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
