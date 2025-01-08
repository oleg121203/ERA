import { GeminiProvider } from "./gemini.js";
import { DeepSeekProvider } from "./deepseek.js";
import { MistralProvider } from "./mistral.js";

export class ProviderFactory {
  static getAvailableProviders() {
    const providers = [];

    if (process.env.GEMINI_API_KEY) {
      providers.push({
        name: "gemini",
        key: process.env.GEMINI_API_KEY,
        provider: GeminiProvider,
      });
    }

    if (process.env.DEEPSEEK_API_KEY) {
      providers.push({
        name: "deepseek",
        key: process.env.DEEPSEEK_API_KEY,
        provider: DeepSeekProvider,
      });
    }

    if (process.env.MISTRAL_API_KEY) {
      providers.push({
        name: "mistral",
        key: process.env.MISTRAL_API_KEY,
        provider: MistralProvider,
      });
    }

    return providers;
  }

  static createProvider(name) {
    const providers = this.getAvailableProviders();
    const providerConfig = providers.find((p) => p.name === name);

    if (!providerConfig) {
      throw new Error(`Provider ${name} not found or API key not configured`);
    }

    return new providerConfig.provider(providerConfig.key);
  }
}
