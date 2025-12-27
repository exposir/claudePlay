import { Conversation, Message, AIProvider, OpenAIModel, AnthropicModel } from '../types/chat';

const CONVERSATIONS_KEY = 'chatgpt_conversations';
const ACTIVE_CONVERSATION_KEY = 'chatgpt_active_conversation';

export function loadConversations(): Conversation[] {
  const stored = localStorage.getItem(CONVERSATIONS_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    // Migrate old conversations that don't have provider/model fields
    return parsed.map((conv: any) => ({
      ...conv,
      provider: conv.provider || 'openai',
      model: conv.model || 'gpt-3.5-turbo',
    }));
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

export function getActiveConversationId(): string | null {
  return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
}

export function setActiveConversationId(id: string): void {
  localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
}

export function createNewConversation(
  provider: AIProvider = 'openai',
  model: OpenAIModel | AnthropicModel = 'gpt-3.5-turbo'
): Conversation {
  return {
    id: Date.now().toString(),
    title: 'New Chat',
    messages: [],
    provider,
    model,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function updateConversationTitle(conversation: Conversation): string {
  if (conversation.messages.length === 0) {
    return 'New Chat';
  }

  const firstUserMessage = conversation.messages.find(m => m.role === 'user');
  if (!firstUserMessage) {
    return 'New Chat';
  }

  // Use first 50 characters of first message as title
  const title = firstUserMessage.content.slice(0, 50);
  return title.length < firstUserMessage.content.length ? `${title}...` : title;
}

export function deleteConversation(conversationId: string): void {
  const conversations = loadConversations();
  const filtered = conversations.filter(c => c.id !== conversationId);
  saveConversations(filtered);

  if (getActiveConversationId() === conversationId) {
    const newActive = filtered[0];
    if (newActive) {
      setActiveConversationId(newActive.id);
    } else {
      localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    }
  }
}
