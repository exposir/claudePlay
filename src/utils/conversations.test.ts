import { describe, expect, it } from 'vitest';
import { createNewConversation, updateConversationTitle } from './conversations';

describe('conversations utilities', () => {
  it('creates a new conversation with defaults', () => {
    const conversation = createNewConversation();

    expect(conversation.title).toBe('New Chat');
    expect(conversation.provider).toBe('openai');
    expect(conversation.model).toBe('gpt-3.5-turbo');
    expect(typeof conversation.id).toBe('string');
  });

  it('derives a title from the first user message', () => {
    const conversation = {
      id: '1',
      title: 'New Chat',
      provider: 'openai' as const,
      model: 'gpt-3.5-turbo' as const,
      messages: [
        { role: 'system', content: 'system', timestamp: 0 },
        { role: 'user', content: 'Hello there, this is a test message', timestamp: 1 }
      ],
      createdAt: 0,
      updatedAt: 0
    };

    expect(updateConversationTitle(conversation)).toBe('Hello there, this is a test message');
  });
});
