import { useState, useRef, useEffect } from 'react';
import { Message, AIProvider, OpenAIModel, AnthropicModel } from '../types/chat';
import { ChatMessage } from './ChatMessage';
import { ModelSelector } from './ModelSelector';
import { TypingIndicator } from './TypingIndicator';
import { BlockEditor } from './BlockEditor';
import { sendMessageStream } from '../services/ai';
import { Button } from '@/components/ui/button';
import { Send, Square, Settings, ImagePlus, X } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

interface ChatInterfaceProps {
  onSettingsClick: () => void;
}

export function ChatInterface({ onSettingsClick }: ChatInterfaceProps) {
  const { 
    conversations, 
    activeId, 
    apiKeys, 
    updateMessages, 
    updateConversationSettings 
  } = useChatStore();

  const activeConversation = conversations.find(c => c.id === activeId);
  const messages = activeConversation?.messages || [];
  const provider = activeConversation?.provider || 'openai';
  const model = activeConversation?.model || 'gpt-3.5-turbo';

  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image upload state
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for streaming response to avoid frequent store updates
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setSelectedImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (customInput?: string, customMessages?: Message[], customImages?: string[]) => {
    if (!activeId) return;

    const messageContent = customInput?.trim() || convertBlocksToText(editorContent).trim();
    const hasImages = customImages ? customImages.length > 0 : selectedImages.length > 0;
    
    if ((!messageContent && !hasImages) || isLoading) return;

    // Check if API key exists for selected provider
    const apiKey = provider === 'openai' ? apiKeys.openai : apiKeys.anthropic;
    if (!apiKey) {
      setError(`Please set your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key in settings`);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      images: hasImages ? (customImages || selectedImages) : undefined,
      timestamp: Date.now(),
    };

    const baseMessages = customMessages || messages;
    // Optimistically update store with user message
    const newMessages = [...baseMessages, userMessage];
    await updateMessages(activeId, newMessages);
    
    setEditorContent('');
    setSelectedImages([]); // Clear images
    setIsLoading(true);
    setError(null);

    const assistantMessageId = (Date.now() + 1).toString();
    setStreamingMessageId(assistantMessageId);
    setStreamingContent('');

    // Create abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let finalContent = '';

    await sendMessageStream(
      provider,
      apiKey,
      model,
      newMessages,
      activeId, // Pass conversation ID
      (chunk) => {
        finalContent += chunk;
        setStreamingContent(finalContent);
      },
      async () => {
        // Stream finished
        setIsLoading(false);
        abortControllerRef.current = null;
        setStreamingMessageId(null);
        setStreamingContent('');
        
        // Save assistant message to store
        const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: finalContent,
            timestamp: Date.now(),
        };
        await updateMessages(activeId, [...newMessages, assistantMessage]);
      },
      (errorMsg) => {
        setError(errorMsg);
        setIsLoading(false);
        abortControllerRef.current = null;
        setStreamingMessageId(null);
        setStreamingContent('');
        // No need to revert user message, just don't add assistant message
      },
      abortController.signal
    );
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      // Save partial content
      if (activeId && streamingMessageId && streamingContent) {
          const assistantMessage: Message = {
            id: streamingMessageId,
            role: 'assistant',
            content: streamingContent,
            timestamp: Date.now(),
        };
        const currentMsgs = conversations.find(c => c.id === activeId)?.messages || [];
        updateMessages(activeId, [...currentMsgs, assistantMessage]);
      }
      setStreamingMessageId(null);
      setStreamingContent('');
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

    // Remove the last user message for the API call context
    const baseMessages = messagesBeforeAssistant.slice(0, -1);
    
    // Pass the content and images of the last user message for regeneration
    handleSendMessage(lastUserMessage.content, baseMessages, lastUserMessage.images);
  };
  
  const handleEditMessage = (messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    const messagesBeforeEdit = messages.slice(0, messageIndex);
    const oldMsg = messages[messageIndex]; // Get the original message to preserve its images
    handleSendMessage(newContent, messagesBeforeEdit, oldMsg.images);
  };

  const onProviderChange = (newProvider: AIProvider) => {
      if (activeId) {
          const defaultModel = newProvider === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-5-sonnet-20241022';
          updateConversationSettings(activeId, { provider: newProvider, model: defaultModel });
      }
  };

  const onModelChange = (newModel: OpenAIModel | AnthropicModel) => {
      if (activeId) {
          updateConversationSettings(activeId, { model: newModel });
      }
  };

  // Construct display messages
  const displayMessages = [...messages];
  if (streamingMessageId && isLoading) {
      displayMessages.push({
          id: streamingMessageId,
          role: 'assistant',
          content: streamingContent,
          timestamp: Date.now()
      });
  }

  if (!activeConversation) {
      return <div className="flex h-full items-center justify-center text-gray-500">Select a conversation</div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative dreamy-bg">
      {/* Header */}
      <div className="shrink-0 glass border-b border-white/10 px-6 py-4 flex justify-between items-center relative z-10">
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
          onClick={onSettingsClick}
          className="gap-2 text-white/90 hover:text-white hover:bg-white/10 border border-white/20"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
        {displayMessages.length === 0 ? (
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
            {displayMessages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onRegenerate={message.role === 'assistant' && !isLoading ? () => handleRegenerate(message.id) : undefined}
                onEdit={message.role === 'user' && !isLoading ? (newContent) => handleEditMessage(message.id, newContent) : undefined}
              />
            ))}
            {isLoading && (
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
      <div className="shrink-0 glass border-t border-white/10 px-6 py-5 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Image Previews */}
          {selectedImages.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto py-2">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative group flex-shrink-0">
                  <img 
                    src={img} 
                    alt="Preview" 
                    className="h-20 w-20 object-cover rounded-lg border border-white/20" 
                  />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-4 items-end">
            <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] border border-white/50 overflow-hidden flex items-end">
               {/* Attachment Button */}
               <div className="pl-3 pb-3">
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleFileSelect} 
                   className="hidden" 
                   accept="image/*" 
                   multiple 
                 />
                 <Button
                   variant="ghost"
                   size="icon"
                   className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                   onClick={() => fileInputRef.current?.click()}
                   title="Upload Images"
                 >
                   <ImagePlus className="h-5 w-5" />
                 </Button>
               </div>
              
              <div className="flex-1">
                <BlockEditor
                  content={editorContent}
                  onChange={setEditorContent}
                  onSubmit={() => handleSendMessage()}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              onClick={isLoading ? handleStopGeneration : () => handleSendMessage()}
              disabled={!isLoading && !convertBlocksToText(editorContent).trim() && selectedImages.length === 0}
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
    </div>
  );
}

