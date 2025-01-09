import { GoogleGenerativeAI } from '@google/generative-ai';
import { NativeBaseProvider } from './base-provider.js';

export class GeminiProvider extends NativeBaseProvider {
  constructor(apiKey) {
    const customConfig = {
      GEMINI: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    };

    super('GEMINI', apiKey, {}, customConfig);
    const models = this.getModelConfig('GEMINI');
    this.defaultModel = process.env.GEMINI_MODEL || models.EXPERIMENTAL;
    this.fallbackModel = models.DEFAULT;

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.initializeModel();
  }

  async initializeModel() {
    try {
      const config = this.getConfig('GEMINI');
      this.model = this.genAI.getGenerativeModel({
        model: this.defaultModel,
        generationConfig: config,
      });

      // Проверяем доступность
      const testResult = await this.model.generateContent('test');
      if (testResult.response) {
        this.logInfo(`✓ Инициализирована экспериментальная модель: ${this.defaultModel}`);
        return;
      }
    } catch (error) {
      this.logWarning(
        `Экспериментальная модель ${this.defaultModel} недоступна, переключаемся на ${this.fallbackModel}`
      );
    }

    // Фоллбэк на стабильную версию
    this.defaultModel = this.fallbackModel;
    this.model = this.genAI.getGenerativeModel({
      model: this.defaultModel,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    });
    this.logInfo(`✓ Используется стабильная модель: ${this.defaultModel}`);
  }

  async analyze(content) {
    try {
      // Используем getPrompt вместо прямого доступа к ANALYSIS_PROMPTS
      const prompt = `${this.getPrompt('CODE_ANALYSIS')}\n\nCode to analyze:\n${content}`;

      const result = await this.model.generateContent(prompt);
      if (!result.response) {
        throw new Error('Empty response from Gemini API');
      }

      const response = await result.response;
      const analysis = response.text();

      if (analysis.includes('No issues found')) {
        this.logInfo('Анализ завершен: изменения не требуются');
        return analysis;
      }

      this.logInfo('Анализ успешно завершен');
      return analysis;
    } catch (error) {
      this.logError('API error', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  // Добавляем метод верификации изменений
  async verifyFix(fix) {
    try {
      // Используем getPrompt для получения промпта автофикса
      const prompt = `${this.getPrompt('AUTOFIX')}\n\nProposed change:\n${fix}`;
      const result = await this.model.generateContent(prompt);

      if (!result.response) return 'SKIP';

      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logWarning(`Пропуск изменения из-за ошибки верификации: ${fix}`);
      return 'SKIP';
    }
  }
}
