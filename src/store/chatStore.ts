import { create } from 'zustand';
import { Conversation, AIProvider, OpenAIModel, AnthropicModel, Message } from '../types/chat';
import { storageService } from '../services/storage';
import { createNewConversation, updateConversationTitle } from '../utils/conversations';

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
  isLoading: boolean;
  
  // Actions
  init: () => Promise<void>;
  createConversation: (provider?: AIProvider, model?: OpenAIModel | AnthropicModel) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  selectConversation: (id: string) => void;
  updateMessages: (id: string, messages: Message[]) => Promise<void>;
  updateConversationSettings: (id: string, updates: Partial<Conversation>) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  
  // API Keys
  apiKeys: {
    openai: string;
    anthropic: string;
  };
  setApiKey: (provider: AIProvider, key: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeId: null,
  isLoading: true,
  apiKeys: {
    openai: localStorage.getItem('openai_api_key') || '',
    anthropic: localStorage.getItem('anthropic_api_key') || ''
  },

  init: async () => {
    try {
      // 1. Try migration
      await storageService.migrateFromLocalStorage();
      
      // 2. Load data
      const conversations = await storageService.getConversations();
      const activeId = storageService.getActiveConversationId();
      
      set({ conversations, isLoading: false });

      // 3. Set active conversation logic
      if (conversations.length === 0) {
        await get().createConversation();
      } else if (activeId && conversations.find(c => c.id === activeId)) {
        set({ activeId });
      } else {
        const first = conversations[0];
        set({ activeId: first.id });
        storageService.setActiveConversationId(first.id);
      }
    } catch (error) {
      console.error('Failed to initialize chat store:', error);
      set({ isLoading: false });
    }
  },

  setApiKey: (provider, key) => {
    localStorage.setItem(`${provider}_api_key`, key);
    set(state => ({
      apiKeys: {
        ...state.apiKeys,
        [provider]: key
      }
    }));
  },

  createConversation: async (provider, model) => {
    // Inherit from current active conversation if not specified
    if (!provider || !model) {
      const activeId = get().activeId;
      const activeConv = get().conversations.find(c => c.id === activeId);
      if (activeConv) {
        provider = provider || activeConv.provider;
        model = model || activeConv.model;
      }
    }

    const newConv = createNewConversation(provider, model);
    const updatedConversations = [newConv, ...get().conversations]; // Prepend new conversation
    
    set({ 
      conversations: updatedConversations,
      activeId: newConv.id 
    });
    
    storageService.setActiveConversationId(newConv.id);
    await storageService.saveConversation(newConv);
  },

  deleteConversation: async (id) => {
    const { conversations, activeId } = get();
    const newConversations = conversations.filter(c => c.id !== id);
    
    set({ conversations: newConversations });
    await storageService.deleteConversation(id);

    // If we deleted the active conversation, switch to another one
    if (activeId === id) {
      const nextConv = newConversations[0];
      if (nextConv) {
        set({ activeId: nextConv.id });
        storageService.setActiveConversationId(nextConv.id);
      } else {
        // If no conversations left, create a new one
        await get().createConversation();
      }
    }
  },

  selectConversation: (id) => {
    set({ activeId: id });
    storageService.setActiveConversationId(id);
  },

  updateMessages: async (id, messages) => {
    const { conversations } = get();
    const index = conversations.findIndex(c => c.id === id);
    if (index === -1) return;

    const conv = conversations[index];
    // Update title based on messages
    const title = updateConversationTitle({ ...conv, messages });
    
    const updatedConv = {
      ...conv,
      messages,
      title,
      updatedAt: Date.now()
    };

    const newConversations = [...conversations];
    newConversations[index] = updatedConv;
    
    // Sort by updatedAt desc (optional, but good for UI)
    // For now, let's keep the order or move to top? 
    // Usually chatting moves conversation to top.
    const reordered = [
        updatedConv, 
        ...newConversations.filter(c => c.id !== id)
    ];

    set({ conversations: reordered });
    await storageService.saveConversation(updatedConv);
  },

  updateConversationSettings: async (id, updates) => {
    const { conversations } = get();
    const index = conversations.findIndex(c => c.id === id);
    if (index === -1) return;

    const updatedConv = {
      ...conversations[index],
      ...updates,
      updatedAt: Date.now()
    };

    const newConversations = [...conversations];
    newConversations[index] = updatedConv;

    set({ conversations: newConversations });
    await storageService.saveConversation(updatedConv);
  },
  
  togglePin: async (id) => {
      const { conversations } = get();
      const index = conversations.findIndex(c => c.id === id);
      if (index === -1) return;
      
      const conv = conversations[index];
      const updatedConv = {
          ...conv,
          pinned: !conv.pinned,
          updatedAt: Date.now()
      };
      
      const newConversations = [...conversations];
      newConversations[index] = updatedConv;
      
      set({ conversations: newConversations });
      await storageService.saveConversation(updatedConv);
  }
}));
