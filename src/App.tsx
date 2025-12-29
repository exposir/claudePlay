import { useState, useEffect } from 'react';
import { ApiKeyInput } from './components/ApiKeyInput';
import { ChatInterface } from './components/ChatInterface';
import { ConversationSidebar } from './components/ConversationSidebar';
import { useChatStore } from './store/chatStore';

function App() {
  const { 
    init, 
    isLoading, 
    apiKeys, 
    setApiKey 
  } = useChatStore();
  
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const hasApiKeys = apiKeys.openai || apiKeys.anthropic;

  const handleApiKeysSubmit = (openai: string, anthropic: string) => {
    if (openai) setApiKey('openai', openai);
    if (anthropic) setApiKey('anthropic', anthropic);
    setShowSettings(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading your space...</p>
        </div>
      </div>
    );
  }

  // Show initial setup or settings page
  if (!hasApiKeys || showSettings) {
    return (
      <ApiKeyInput
        initialOpenaiKey={apiKeys.openai}
        initialAnthropicKey={apiKeys.anthropic}
        onApiKeysSubmit={handleApiKeysSubmit}
        onCancel={hasApiKeys ? () => setShowSettings(false) : undefined}
        isSettings={showSettings}
      />
    );
  }

  return (
    <div className="fixed inset-0 flex bg-gray-900">
      <ConversationSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatInterface onSettingsClick={() => setShowSettings(true)} />
      </div>
    </div>
  );
}

export default App;