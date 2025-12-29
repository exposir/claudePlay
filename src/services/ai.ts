import { AIProvider, Message } from '../types/chat';
import { sendMessageStreamAnthropic } from './anthropic';

const BACKEND_URL = 'http://localhost:8081/api/chat/stream';

export async function sendMessageStream(
  provider: AIProvider,
  apiKey: string,
  model: string,
  messages: Message[],
  conversationId: string, // Added conversationId
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
) {
  if (provider === 'openai') {
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'openai',
          model,
          conversationId, // Pass conversationId to backend
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            images: m.images
          }))
        }),

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error: ${response.status} - ${errorText}`);
      }

      if (!response.body) throw new Error('ReadableStream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('event: message')) continue; // Skip event type lines
          if (line.startsWith('data: ')) {
             const data = line.slice(6);
             if (data) onChunk(data);
          }
        }
      }
      onComplete();

    } catch (error) {
       if (signal?.aborted) {
        onError('Generation stopped by user');
       } else {
        onError(error instanceof Error ? error.message : 'Unknown error');
       }
    }
    return;
  } else if (provider === 'anthropic') {
    return sendMessageStreamAnthropic(apiKey, model, messages, onChunk, onComplete, onError, signal);
  } else {
    onError('Unknown AI provider');
  }
}
