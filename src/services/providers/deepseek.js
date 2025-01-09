import { OpenAIBaseProvider } from './base-provider.js';

const DEEPSEEK_PROMPTS = {
  CODE_ANALYSIS: ({
    fix,
  }) => `You are a code analysis expert specialized in JavaScript, TypeScript, and modern web development. Your task is to analyze the provided code and ${
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

export class DeepSeekProvider extends OpenAIBaseProvider {
  constructor(apiKey) {
    const customConfig = {
      OPENAI: {
        temperature: 0.5,
        max_tokens: 2048,
      },
    };

    super('DEEPSEEK', apiKey, 'https://api.deepseek.com', {}, customConfig);
    const models = this.getModelConfig('DEEPSEEK');
    this.defaultModel = process.env.DEEPSEEK_MODEL || models.DEFAULT;
    this.prompts = DEEPSEEK_PROMPTS;
  }

  validateParams(params) {
    const validatedParams = { ...params };
    if (validatedParams.max_tokens > 4096) {
      this.logWarning('max_tokens превышает лимит, установлено 4096');
      validatedParams.max_tokens = 4096;
    }
    return validatedParams;
  }

  async analyze(content, options = {}) {
    try {
      const config = { ...this.getConfig('OPENAI'), stream: options.useStream };
      const analysisPrompt = this.prompts.CODE_ANALYSIS({ fix: options.fix || options.autoFix });

      const params = this.validateParams({
        messages: [
          { role: 'system', content: analysisPrompt },
          { role: 'user', content },
        ],
        model: this.defaultModel,
        ...config,
      });

      if (options.useStream) {
        const stream = await this.client.chat.completions.create(params);
        this.logInfo('Начат потоковый анализ');
        return stream;
      }

      const completion = await this.client.chat.completions.create(params);

      if (completion.choices[0].message.content.includes('No issues found')) {
        this.logInfo('Анализ завершен: изменения не требуются');
        return completion.choices[0].message.content;
      }

      this.logInfo('Анализ успешно завершен');
      return completion.choices[0].message.content;
    } catch (error) {
      await this.handleAPIError(error);
    }
  }

  // Метод для работы с потоковым ответом
  async *streamAnalysis(content) {
    try {
      const stream = await this.analyze(content, { useStream: true });
      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          yield chunk.choices[0].delta.content;
        }
      }
    } catch (error) {
      this.logError('Stream error', error);
      throw error;
    }
  }
}
