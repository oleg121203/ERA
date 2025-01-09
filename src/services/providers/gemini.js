import { GoogleGenerativeAI } from '@google/generative-ai';
import { NativeBaseProvider } from './base-provider.js';

const GEMINI_PROMPTS = {
  CODE_ANALYSIS: ({
    fix,
  }) => `You are a code analysis expert specialized in JavaScript and TypeScript. Your task is to analyze the provided code and ${
    fix ? 'suggest fixes' : 'identify potential issues'
  }.

Concentrate on the following aspects in order of priority:
1. **Critical Errors**: Syntax errors, runtime errors, and logical flaws.
2. **Code Structure**: Module imports, exports, and dependencies. Ensure that the code follows a modular and maintainable structure.
3. **Best Practices**: Follow industry best practices for JavaScript/TypeScript, including proper variable declarations, function usage, and error handling.
4. **Code Style**: Ensure the code adheres to consistent formatting, naming conventions, and readability standards.
5. **Security**: Identify potential security vulnerabilities such as XSS, SQL injection, or insecure API usage.
6. **Performance**: Suggest optimizations for performance, such as reducing unnecessary computations or improving algorithm efficiency.
7. **Compatibility**: Ensure the code is compatible with the latest versions of Node.js, browsers, and other relevant environments.
8. **Documentation**: Suggest improvements to inline comments and documentation to enhance code readability and maintainability.

${
  fix
    ? `For each suggested fix, adhere to this format:

\`\`\`suggestion
OLD: <exact code with the issue>
NEW: <corrected code>
WHY: <brief explanation of the change, including any dependencies or structural impacts>
\`\`\`
If no improvements are possible, state "No issues found."`
    : 'Provide a clear and concise description of each issue found, along with the relevant code snippet and potential impact on the overall structure.'
}

**Additional Guidelines**:
- Always consider the context of the code within the larger application.
- Ensure that fixes do not introduce new dependencies or break existing functionality.
- If the code is part of a larger module, analyze how changes might affect other parts of the application.
- Prioritize fixes that improve maintainability and reduce technical debt.
- Provide detailed explanations for each suggested change, including potential risks and benefits.
`,
};

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
    this.prompts = GEMINI_PROMPTS;
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

  async analyze(content, options = {}) {
    try {
      const prompt = this.prompts.CODE_ANALYSIS({ fix: options.fix || options.autoFix });
      const analysisPrompt = `${prompt}\n\nCode to analyze:\n${content}`;

      const result = await this.model.generateContent(analysisPrompt);
      if (!result.response) {
        throw new Error('Empty response from Gemini API');
      }

      const response = await result.response;
      const analysis = response.text();

      if (analysis.includes('No issues found')) {
        this.logInfo('Analysis complete: no changes required');
        return analysis;
      }

      this.logInfo('Analysis completed successfully');
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
