export type AIProvider = 'openai' | 'anthropic';

export type OpenAIModel = 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
export type AnthropicModel = 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022' | 'claude-3-opus-20240229';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[]; // Array of base64 data URIs
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  provider: AIProvider;
  model: OpenAIModel | AnthropicModel;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface AIConfig {
  provider: AIProvider;
  model: OpenAIModel | AnthropicModel;
  apiKey: string;
}
