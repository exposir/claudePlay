import OpenAI from 'openai';
import { Message } from '../types/chat';

export async function sendMessageStreamOpenAI(
  apiKey: string,
  model: string,
  messages: Message[],
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
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
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }
    }

    onComplete();
  } catch (error) {
    if (error instanceof Error) {
      onError(error.message);
    } else {
      onError('An unknown error occurred');
    }
  }
}
