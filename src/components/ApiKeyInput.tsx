import { useState, useEffect } from 'react';
import { AIProvider } from '../types/chat';

interface ApiKeyInputProps {
  initialOpenaiKey?: string;
  initialAnthropicKey?: string;
  onApiKeysSubmit: (openaiKey: string, anthropicKey: string) => void;
  onCancel?: () => void;
  isSettings?: boolean;
}

export function ApiKeyInput({
  initialOpenaiKey = '',
  initialAnthropicKey = '',
  onApiKeysSubmit,
  onCancel,
  isSettings = false
}: ApiKeyInputProps) {
  const [openaiKey, setOpenaiKey] = useState(initialOpenaiKey);
  const [anthropicKey, setAnthropicKey] = useState(initialAnthropicKey);
  const [activeTab, setActiveTab] = useState<AIProvider>('openai');

  useEffect(() => {
    setOpenaiKey(initialOpenaiKey);
    setAnthropicKey(initialAnthropicKey);
  }, [initialOpenaiKey, initialAnthropicKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (openaiKey.trim() || anthropicKey.trim()) {
      onApiKeysSubmit(openaiKey.trim(), anthropicKey.trim());
    }
  };

  const hasAtLeastOneKey = openaiKey.trim() || anthropicKey.trim();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isSettings ? 'API Key Settings' : 'Welcome to AI Chat'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isSettings
            ? 'Update your API keys. Leave blank to keep existing key.'
            : 'Enter your API keys to get started. You can use either OpenAI, Anthropic, or both.'}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Tab Selector */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('openai')}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'openai'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              OpenAI {openaiKey ? '✓' : ''}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('anthropic')}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === 'anthropic'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Anthropic {anthropicKey ? '✓' : ''}
            </button>
          </div>

          {/* OpenAI Tab */}
          {activeTab === 'openai' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Get your API key from{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </div>
          )}

          {/* Anthropic Tab */}
          {activeTab === 'anthropic' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anthropic API Key
              </label>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Get your API key from{' '}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Anthropic Console
                </a>
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!hasAtLeastOneKey}
              className={`${onCancel ? 'flex-1' : 'w-full'} bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors`}
            >
              {isSettings ? 'Save' : 'Continue'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600">
            {openaiKey.trim() ? '✓ OpenAI key set' : '✗ OpenAI key not set'}
          </p>
          <p className="text-xs text-gray-600">
            {anthropicKey.trim() ? '✓ Anthropic key set' : '✗ Anthropic key not set'}
          </p>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Your API keys are stored locally and only sent to their respective services.
        </p>
      </div>
    </div>
  );
}
