import { AIProvider, OpenAIModel, AnthropicModel } from '../types/chat';

interface ModelSelectorProps {
  provider: AIProvider;
  model: OpenAIModel | AnthropicModel;
  onProviderChange: (provider: AIProvider) => void;
  onModelChange: (model: OpenAIModel | AnthropicModel) => void;
}

const OPENAI_MODELS: { value: OpenAIModel; label: string }[] = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];

const ANTHROPIC_MODELS: { value: AnthropicModel; label: string }[] = [
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
];

export function ModelSelector({
  provider,
  model,
  onProviderChange,
  onModelChange,
}: ModelSelectorProps) {
  const models = provider === 'openai' ? OPENAI_MODELS : ANTHROPIC_MODELS;

  // Check if current model is valid for current provider
  const isModelValid = models.some(m => m.value === model);
  const displayModel = isModelValid ? model : models[0].value;

  return (
    <div className="flex gap-2 items-center">
      {/* Provider Selector */}
      <select
        value={provider}
        onChange={(e) => onProviderChange(e.target.value as AIProvider)}
        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      >
        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic (Claude)</option>
      </select>

      {/* Model Selector */}
      <select
        value={displayModel}
        onChange={(e) => onModelChange(e.target.value as OpenAIModel | AnthropicModel)}
        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      >
        {models.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
