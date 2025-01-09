import { OpenAIBaseProvider } from './base-provider.js';

/* global process, console */

const MODELS = {
  DEFAULT: 'codestral-latest',
};

// Кастомные промпты для Mistral
const MISTRAL_PROMPTS = {
  CODE_ANALYSIS: `You are a code analysis expert specialized in JavaScript and TypeScript. Your task is to:
1. Focus on critical ESLint errors first
2. Check imports and module structure
3. Verify variable declarations and usage
4. Suggest type improvements
5. Format response as:
   OLD: <exact code with issue>
   NEW: <fixed code>
   WHY: <brief explanation>`,
};

export class MistralProvider extends OpenAIBaseProvider {
  constructor(apiKey) {
    const customConfig = {
      OPENAI: {
        temperature: 0.5,
        max_tokens: 2048,
      },
    };

    super('MISTRAL', apiKey, 'https://codestral.mistral.ai/v1', MISTRAL_PROMPTS, customConfig);
    const models = this.getModelConfig('MISTRAL');
    this.defaultModel = process.env.MISTRAL_MODEL || models.DEFAULT;
  }

  async analyze(content) {
    try {
      const config = this.getConfig('OPENAI');
      const analysis = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: this.getPrompt('CODE_ANALYSIS'),
          },
          { role: 'user', content },
        ],
        model: this.defaultModel,
        ...config,
      });

      const suggestions = analysis.choices[0].message.content;

      // Если нет предложений по улучшению, завершаем
      if (suggestions.includes('No issues found')) {
        this.logInfo('Анализ завершен: изменения не требуются');
        return suggestions;
      }

      // Если есть autofix флаг, проверяем каждое изменение
      if (content.includes('--fix')) {
        const fixes = this.parseSuggestions(suggestions);
        const verifiedFixes = await Promise.all(fixes.map((fix) => this.verifyFix(fix)));

        return verifiedFixes.filter((fix) => fix !== 'SKIP').join('\n\n');
      }

      this.logInfo('Анализ успешно завершен');
      return suggestions;
    } catch (error) {
      await this.handleAPIError(error);
    }
  }

  parseSuggestions(suggestions) {
    return suggestions
      .split('\n\n')
      .filter((s) => s.includes('OLD:') && s.includes('NEW:'))
      .map((s) => s.trim());
  }

  async verifyFix(fix) {
    try {
      const verification = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: PROMPTS.AUTOFIX,
          },
          { role: 'user', content: fix },
        ],
        model: this.defaultModel,
        temperature: 0.1, // Очень консервативно для проверки
        max_tokens: 1024,
      });

      return verification.choices[0].message.content;
    } catch (error) {
      this.logWarning(`Пропуск изменения из-за ошибки верификации: ${fix}`);
      return 'SKIP';
    }
  }
}
