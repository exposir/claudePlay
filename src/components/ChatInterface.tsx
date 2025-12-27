import { useState, useRef, useEffect } from 'react';
import { Message, AIProvider, OpenAIModel, AnthropicModel } from '../types/chat';
import { ChatMessage } from './ChatMessage';
import { ModelSelector } from './ModelSelector';
import { TypingIndicator } from './TypingIndicator';
import { BlockEditor } from './BlockEditor';
import { sendMessageStream } from '../services/ai';
import { Button } from '@/components/ui/button';
import { Send, Square, Settings } from 'lucide-react';

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
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Convert BlockNote JSON to markdown (preserving formatting)
  const convertBlocksToText = (jsonContent: string): string => {
    try {
      const blocks = JSON.parse(jsonContent);
      return blocks.map((block: any) => blockToMarkdown(block)).filter((text: string) => text).join('\n');
    } catch {
      return '';
    }
  };

  const blockToMarkdown = (block: any): string => {
    if (!block) return '';

    const contentText = extractContentWithStyles(block.content);

    switch (block.type) {
      case 'heading':
        const level = block.props?.level || 1;
        return '#'.repeat(level) + ' ' + contentText;
      case 'bulletListItem':
        return '- ' + contentText;
      case 'numberedListItem':
        return '1. ' + contentText;
      case 'codeBlock':
        const language = block.props?.language || '';
        return '```' + language + '\n' + contentText + '\n```';
      case 'paragraph':
      default:
        return contentText;
    }
  };

  const extractContentWithStyles = (content: any): string => {
    if (!content) return '';
    if (!Array.isArray(content)) return '';

    return content.map((item: any) => {
      if (typeof item === 'string') return item;

      const text = item.text || '';
      const styles = item.styles || {};

      // Apply markdown formatting based on styles
      let formatted = text;
      if (styles.bold) formatted = '**' + formatted + '**';
      if (styles.italic) formatted = '*' + formatted + '*';
      if (styles.code) formatted = '`' + formatted + '`';
      if (styles.strike) formatted = '~~' + formatted + '~~';

      return formatted;
    }).join('');
  };

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

  const handleSendMessage = async (customInput?: string, customMessages?: Message[]) => {
    const messageContent = customInput?.trim() || convertBlocksToText(editorContent).trim();
    if (!messageContent || isLoading) return;

    // Check if API key exists for selected provider
    const apiKey = provider === 'openai' ? openaiKey : anthropicKey;
    if (!apiKey) {
      setError(`Please set your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key in settings`);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
    };

    const baseMessages = customMessages || messages;
    setMessages([...baseMessages, userMessage]);
    setEditorContent('');
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

    // Create abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    await sendMessageStream(
      provider,
      apiKey,
      model,
      [...baseMessages, userMessage],
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
        abortControllerRef.current = null;
      },
      (errorMsg) => {
        setError(errorMsg);
        setIsLoading(false);
        abortControllerRef.current = null;
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
      },
      abortController.signal
    );
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleRegenerate = (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    // Remove the assistant message and any messages after it
    const messagesBeforeAssistant = messages.slice(0, messageIndex);

    // Get the last user message
    const lastUserMessage = messagesBeforeAssistant[messagesBeforeAssistant.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== 'user') return;

    // Remove the last user message and regenerate
    const baseMessages = messagesBeforeAssistant.slice(0, -1);
    handleSendMessage(lastUserMessage.content, baseMessages);
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Remove this message and all messages after it
    const messagesBeforeEdit = messages.slice(0, messageIndex);

    // Resend with new content
    handleSendMessage(newContent, messagesBeforeEdit);
  };


  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-full relative dreamy-bg">
      {/* Header */}
      <div className="glass border-b border-white/10 px-6 py-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
            ✨ Dream Chat
          </h1>
          <ModelSelector
            provider={provider}
            model={model}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="gap-2 text-white/90 hover:text-white hover:bg-white/10 border border-white/20"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Messages Container */}
      <div className="overflow-y-auto px-4 py-6 relative z-10">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center glass p-12 rounded-3xl max-w-md mx-auto">
              <div className="relative">
                <svg
                  className="mx-auto h-20 w-20 mb-6 text-purple-300 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <div className="absolute inset-0 blur-xl opacity-50 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent mb-2">
                Begin Your Journey
              </p>
              <p className="text-sm text-white/60">
                Using {provider === 'openai' ? 'OpenAI' : 'Anthropic'} - {model}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onRegenerate={message.role === 'assistant' ? () => handleRegenerate(message.id) : undefined}
                onEdit={message.role === 'user' ? (newContent) => handleEditMessage(message.id, newContent) : undefined}
              />
            ))}
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 relative z-10">
          <p className="text-sm text-destructive text-center">Error: {error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="glass border-t border-white/10 px-6 py-5 relative z-10">
        <div className="max-w-3xl mx-auto flex gap-4 items-end">
          <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] border border-white/50 overflow-hidden">
            <BlockEditor
              content={editorContent}
              onChange={setEditorContent}
              onSubmit={() => handleSendMessage()}
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={isLoading ? handleStopGeneration : () => handleSendMessage()}
            disabled={!isLoading && !convertBlocksToText(editorContent).trim()}
            size="lg"
            variant={isLoading ? "destructive" : "default"}
            className={`gap-2 px-8 py-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
              isLoading
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_40px_rgba(239,68,68,0.8)] hover:scale-110'
                : 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:shadow-[0_0_50px_rgba(168,85,247,1)] hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            }`}
          >
            {isLoading ? (
              <>
                <Square className="h-6 w-6 animate-spin" />
                Stop
              </>
            ) : (
              <>
                <Send className="h-6 w-6" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
