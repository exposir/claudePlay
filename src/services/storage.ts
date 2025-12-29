import { db } from '../db';
import { Conversation } from '../types/chat';

const CONVERSATIONS_KEY = 'chatgpt_conversations';
const ACTIVE_CONVERSATION_KEY = 'chatgpt_active_conversation';

export const storageService = {
  async getConversations(): Promise<Conversation[]> {
    return await db.conversations.orderBy('updatedAt').reverse().toArray();
  },

  async getConversation(id: string): Promise<Conversation | undefined> {
    return await db.conversations.get(id);
  },

  async saveConversation(conversation: Conversation): Promise<void> {
    await db.conversations.put(conversation);
  },

  async saveConversations(conversations: Conversation[]): Promise<void> {
    await db.conversations.bulkPut(conversations);
  },

  async deleteConversation(id: string): Promise<void> {
    await db.conversations.delete(id);
  },

  getActiveConversationId(): string | null {
    // Active ID is small and UI-critical state, fine to keep in LocalStorage for now
    // or we can move it to store/url later. Keeping it here preserves current behavior.
    return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
  },

  setActiveConversationId(id: string): void {
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
  },

  async migrateFromLocalStorage(): Promise<void> {
    const stored = localStorage.getItem(CONVERSATIONS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const conversations = parsed.map((conv: any) => ({
            ...conv,
            provider: conv.provider || 'openai',
            model: conv.model || 'gpt-3.5-turbo',
          }));
          
          await db.conversations.bulkPut(conversations);
          console.log(`Migrated ${conversations.length} conversations to IndexedDB`);
          
          // Clear old data after successful migration
          localStorage.removeItem(CONVERSATIONS_KEY);
        }
      } catch (error) {
        console.error('Migration failed:', error);
      }
    }
  }
};
