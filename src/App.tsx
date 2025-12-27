import { useState, useEffect } from 'react';
import { ApiKeyInput } from './components/ApiKeyInput';
import { ChatInterface } from './components/ChatInterface';
import { ConversationSidebar } from './components/ConversationSidebar';
import { Conversation, AIProvider, OpenAIModel, AnthropicModel } from './types/chat';
import {
  loadConversations,
  saveConversations,
  getActiveConversationId,
  setActiveConversationId,
  createNewConversation,
  updateConversationTitle,
  deleteConversation as deleteConversationUtil,
} from './utils/conversations';

function App() {
  const [openaiKey, setOpenaiKey] = useState<string>(
    localStorage.getItem('openai_api_key') || ''
  );
  const [anthropicKey, setAnthropicKey] = useState<string>(
    localStorage.getItem('anthropic_api_key') || ''
  );
  const [showSettings, setShowSettings] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveId] = useState<string>('');

  const hasApiKeys = openaiKey || anthropicKey;

  useEffect(() => {
    if (hasApiKeys) {
      const loaded = loadConversations();

      if (loaded.length === 0) {
        const defaultProvider: AIProvider = anthropicKey ? 'anthropic' : 'openai';
        const defaultModel = defaultProvider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-3.5-turbo';
        const newConv = createNewConversation(defaultProvider, defaultModel);
        setConversations([newConv]);
        setActiveId(newConv.id);
        setActiveConversationId(newConv.id);
        saveConversations([newConv]);
      } else {
        setConversations(loaded);
        const activeId = getActiveConversationId();
        const active = activeId && loaded.find(c => c.id === activeId);
        if (active) {
          setActiveId(active.id);
        } else {
          setActiveId(loaded[0].id);
          setActiveConversationId(loaded[0].id);
        }
      }
    }
  }, [hasApiKeys]);

  const handleApiKeysSubmit = (openai: string, anthropic: string) => {
    if (openai) {
      localStorage.setItem('openai_api_key', openai);
      setOpenaiKey(openai);
    }
    if (anthropic) {
      localStorage.setItem('anthropic_api_key', anthropic);
      setAnthropicKey(anthropic);
    }
    setShowSettings(false);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleNewConversation = () => {
    const activeConv = conversations.find(c => c.id === activeConversationId);
    const newConv = createNewConversation(
      activeConv?.provider || 'openai',
      activeConv?.model || 'gpt-3.5-turbo'
    );
    const updated = [newConv, ...conversations];
    setConversations(updated);
    setActiveId(newConv.id);
    setActiveConversationId(newConv.id);
    saveConversations(updated);
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
    setActiveConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversationUtil(id);
    const loaded = loadConversations();

    if (loaded.length === 0) {
      const newConv = createNewConversation();
      setConversations([newConv]);
      setActiveId(newConv.id);
      setActiveConversationId(newConv.id);
      saveConversations([newConv]);
    } else {
      setConversations(loaded);
      if (id === activeConversationId) {
        setActiveId(loaded[0].id);
        setActiveConversationId(loaded[0].id);
      }
    }
  };

  const handleMessagesUpdate = (messages: any[]) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversationId) {
        const title = updateConversationTitle({ ...conv, messages });
        return {
          ...conv,
          messages,
          title,
          updatedAt: Date.now(),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    saveConversations(updatedConversations);
  };

  const handleProviderChange = (provider: AIProvider) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversationId) {
        // Set default model for the new provider
        const defaultModel: OpenAIModel | AnthropicModel = provider === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-5-sonnet-20241022';
        return {
          ...conv,
          provider,
          model: defaultModel,
          updatedAt: Date.now(),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    saveConversations(updatedConversations);
  };

  const handleModelChange = (model: OpenAIModel | AnthropicModel) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversationId) {
        return {
          ...conv,
          model,
          updatedAt: Date.now(),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    saveConversations(updatedConversations);
  };

  const handleTogglePin = (id: string) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === id) {
        return {
          ...conv,
          pinned: !conv.pinned,
          updatedAt: Date.now(),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    saveConversations(updatedConversations);
  };

  // Show initial setup or settings page
  if (!hasApiKeys || showSettings) {
    return (
      <ApiKeyInput
        initialOpenaiKey={openaiKey}
        initialAnthropicKey={anthropicKey}
        onApiKeysSubmit={handleApiKeysSubmit}
        onCancel={hasApiKeys ? handleCloseSettings : undefined}
        isSettings={showSettings}
      />
    );
  }

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="flex h-screen">
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onTogglePin={handleTogglePin}
      />
      {activeConversation && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface
            openaiKey={openaiKey}
            anthropicKey={anthropicKey}
            messages={activeConversation.messages}
            provider={activeConversation.provider}
            model={activeConversation.model}
            onMessagesUpdate={handleMessagesUpdate}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
            onLogout={handleOpenSettings}
          />
        </div>
      )}
    </div>
  );
}

export default App;
