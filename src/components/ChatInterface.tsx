import { useState, useRef, useEffect } from 'react';
import { Message, AIProvider, OpenAIModel, AnthropicModel } from '../types/chat';
import { ChatMessage } from './ChatMessage';
import { ModelSelector } from './ModelSelector';
import { sendMessageStream } from '../services/ai';

interface ChatInterfaceProps {
  openaiKey: string;
  anthropicKey: string;
  messages: Message[];
  provider: AIProvider;
  model: OpenAIModel | AnthropicModel;
  onMessagesUpdate: (messages: Message[]) => void;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: OpenAIModel | AnthropicModel) => void;
  onLogout: () => void;
}

export function ChatInterface({
  openaiKey,
  anthropicKey,
  messages: initialMessages,
  provider,
  model,
  onMessagesUpdate,
  onProviderChange,
  onModelChange,
  onLogout
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    onMessagesUpdate(messages);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check if API key exists for selected provider
    const apiKey = provider === 'openai' ? openaiKey : anthropicKey;
    if (!apiKey) {
      setError(`Please set your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key in settings`);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const assistantMessageId = (Date.now() + 1).toString();
    let assistantContent = '';

    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    await sendMessageStream(
      provider,
      apiKey,
      model,
      [...messages, userMessage],
      (chunk) => {
        assistantContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: assistantContent }
              : msg
          )
        );
      },
      () => {
        setIsLoading(false);
      },
      (errorMsg) => {
        setError(errorMsg);
        setIsLoading(false);
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">AI Chat</h1>
          <ModelSelector
            provider={provider}
            model={model}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          Settings
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <p className="text-lg">Start a conversation</p>
              <p className="text-sm mt-1">
                Using {provider === 'openai' ? 'OpenAI' : 'Anthropic'} - {model}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600 text-center">Error: {error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Send a message..."
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <span>Send</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
