import { DeepSeekProvider } from './deepseek.js';
import { GeminiProvider } from './gemini.js';
import { MistralProvider } from './mistral.js';
import process from 'process'; // Explicitly import process

export class ProviderFactory {
  static getAvailableProviders() {
    const providers = [];

    if (process.env.GEMINI_API_KEY) {
      providers.push({
        name: 'gemini',
        key: process.env.GEMINI_API_KEY,
        provider: GeminiProvider,
      });
    }

    if (process.env.DEEPSEEK_API_KEY) {
      providers.push({
        name: 'deepseek',
        key: process.env.DEEPSEEK_API_KEY,
        provider: DeepSeekProvider,
      });
    }

    if (process.env.MISTRAL_API_KEY) {
      providers.push({
        name: 'mistral',
        key: process.env.MISTRAL_API_KEY,
        provider: MistralProvider,
      });
    }

    return providers;
  }

  /**
   * Creates a provider instance based on the given name.
   * @param {string} name The name of the provider to create.
   * @returns {any} An instance of the provider.
   * @throws {Error} If the provider is not found or API key is not configured.
   */
  static createProvider(name) {
    const providers = this.getAvailableProviders();
    const providerConfig = providers.find((p) => p.name === name);

    if (!providerConfig) {
      throw new Error(`Provider ${name} not found or API key not configured`);
    }

    return new providerConfig.provider(providerConfig.key);
  }
}
