import { AIProvider, Message } from '../types/chat';
import { sendMessageStreamOpenAI } from './openai';
import { sendMessageStreamAnthropic } from './anthropic';

export async function sendMessageStream(
  provider: AIProvider,
  apiKey: string,
  model: string,
  messages: Message[],
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void,
  signal?: AbortSignal
) {
  if (provider === 'openai') {
    return sendMessageStreamOpenAI(apiKey, model, messages, onChunk, onComplete, onError, signal);
  } else if (provider === 'anthropic') {
    return sendMessageStreamAnthropic(apiKey, model, messages, onChunk, onComplete, onError, signal);
  } else {
    onError('Unknown AI provider');
  }
}
