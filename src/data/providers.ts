export interface ProviderOption {
  id: string;
  name: string;
  description: string;
  baseUrlHint?: string;
  modelExamples: string[];
  local?: boolean;
  requiresApiKey?: boolean;
}

export const providerOptions: ProviderOption[] = [
  {
    id: 'ollama',
    name: 'Ollama Local',
    description: 'Built-in local model provider through Ollama on this machine. No cloud key required.',
    baseUrlHint: 'http://127.0.0.1:11434',
    modelExamples: ['llama3.1', 'qwen2.5-coder', 'mistral', 'gemma2'],
    local: true,
    requiresApiKey: false,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI cloud models using an API key.',
    modelExamples: ['gpt-4.1', 'gpt-4.1-mini'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models using an Anthropic API key.',
    modelExamples: ['claude-sonnet', 'claude-haiku'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini models using a Google AI API key.',
    modelExamples: ['gemini-pro', 'gemini-flash'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'One key for many model providers.',
    baseUrlHint: 'https://openrouter.ai/api/v1',
    modelExamples: ['openai/gpt', 'anthropic/claude', 'google/gemini'],
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Fast hosted inference for supported models.',
    modelExamples: ['llama', 'mixtral'],
  },
  {
    id: 'mistral',
    name: 'Mistral',
    description: 'Mistral hosted models.',
    modelExamples: ['mistral-large', 'mistral-small'],
  },
  {
    id: 'together',
    name: 'Together AI',
    description: 'Hosted open model access.',
    modelExamples: ['meta-llama', 'qwen'],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'Cloud models with optional online answer modes.',
    modelExamples: ['sonar', 'sonar-pro'],
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    description: 'Any OpenAI-compatible cloud endpoint.',
    baseUrlHint: 'https://api.example.com/v1',
    modelExamples: ['custom-model-name'],
  },
];
