import OpenAI from 'openai';

export class ProviderConfiguration {
  static #instance = null;

  constructor() {
    if (ProviderConfiguration.#instance) {
      return ProviderConfiguration.#instance;
    }

    this.config = {
      PROMPTS: {
        DEFAULT: {
          CODE_ANALYSIS: `You are a code analysis expert. Your task is to:
1. Analyze the code for potential issues including:
   - ESLint errors (high priority)
   - Missing imports
   - Undefined variables
   - Unused declarations
2. Always provide fixes for ESLint errors in format:
   OLD: <exact code with error>
   NEW: <fixed code>
3. Each fix must be specific and include all required imports
4. If found ESLint errors, always provide fixes
5. If no issues found, respond with "No issues found"`,

          AUTOFIX: `You are a code fixing expert. Your task is to:
1. Review the proposed change
2. Confirm it's safe and beneficial
3. Return ONLY the new code if approved
4. Return SKIP if the change is risky or unnecessary
5. No explanations needed, just the code or SKIP`,
        },
        // Промпты для каждого провайдера
        MISTRAL: {
          CODE_ANALYSIS: `You are a code analysis expert specialized in JavaScript and TypeScript...`,
        },
        GEMINI: {
          CODE_ANALYSIS: `As a code analysis expert, analyze the following code...`,
        },
        DEEPSEEK: {
          CODE_ANALYSIS: `Expert code analyzer focusing on...`,
        },
      },

      PARAMS: {
        OPENAI: {
          temperature: 0.5,
          max_tokens: 2048,
          stream: false,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        },
        GEMINI: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
      },

      MODELS: {
        MISTRAL: {
          DEFAULT: 'codestral-latest',
        },
        DEEPSEEK: {
          DEFAULT: 'deepseek-chat',
          MAX_TOKENS: 4096,
        },
        GEMINI: {
          EXPERIMENTAL: 'gemini-2.0-flash-exp',
          DEFAULT: 'gemini-pro',
        },
      },
    };

    ProviderConfiguration.#instance = this;
  }

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new ProviderConfiguration();
    }
    return this.#instance;
  }

  getPrompt(provider, type) {
    return this.config.PROMPTS[provider]?.[type] || this.config.PROMPTS.DEFAULT[type];
  }

  getParams(type) {
    return this.config.PARAMS[type];
  }

  getModelConfig(provider) {
    return this.config.MODELS[provider];
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  updateProviderConfig(provider, config) {
    if (!this.config[provider]) {
      this.config[provider] = {};
    }
    this.config[provider] = { ...this.config[provider], ...config };
  }
}

export class BaseProvider {
  constructor(name, customConfig = {}) {
    this.name = name;
    this.configuration = ProviderConfiguration.getInstance();
    if (Object.keys(customConfig).length) {
      this.configuration.updateProviderConfig(name, customConfig);
    }
  }

  getPrompt(type) {
    return this.configuration.getPrompt(this.name, type);
  }

  getConfig(type) {
    return this.configuration.getParams(type);
  }

  getModelConfig(provider) {
    return this.configuration.getModelConfig(provider);
  }

  validateApiKey(apiKey) {
    if (!apiKey) {
      throw new Error(`${this.name}_API_KEY is not set`);
    }
  }

  logInfo(message) {
    console.log(`[${this.name}] ✓ ${message}`);
  }

  logWarning(message) {
    console.warn(`[${this.name}] ⚠ ${message}`);
  }

  logError(message, error) {
    console.error(`[${this.name}] ❌ ${message}:`, error);
  }
}

export class OpenAIBaseProvider extends BaseProvider {
  constructor(name, apiKey, baseURL, customPrompts = {}, customConfig = {}) {
    super(name, customPrompts, customConfig);
    this.validateApiKey(apiKey);
    this.apiKey = apiKey; // Сохраняем apiKey

    this.client = new OpenAI({
      baseURL,
      apiKey,
      defaultHeaders: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async handleAPIError(error) {
    this.logError('API error', error);

    if (error.response?.status === 401) {
      throw new Error(`${this.name}: Invalid API key`);
    }
    if (error.response?.status === 422) {
      throw new Error(`${this.name}: Invalid request parameters`);
    }
    if (error.response?.status === 429) {
      throw new Error(`${this.name}: Rate limit exceeded`);
    }
    throw new Error(`${this.name} API error: ${error.message}`);
  }

  validateParams(params) {
    const validatedParams = { ...params };
    if (!validatedParams.messages || !validatedParams.messages.length) {
      throw new Error('Messages array is required');
    }
    return validatedParams;
  }
}

export class NativeBaseProvider extends BaseProvider {
  constructor(name, apiKey, customPrompts = {}, customConfig = {}) {
    super(name, customPrompts, customConfig);
    this.validateApiKey(apiKey);
  }
}
