import { OpenAIBaseProvider } from './base-provider.js';

/* global process, console */

const MODELS = {
  DEFAULT: 'codestral-latest',
};

const MISTRAL_PROMPTS = {
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
            content: this.getPrompt('CODE_ANALYSIS', { fix: content.includes('--fix') }),
          },
          { role: 'user', content: content.replace('--fix', '').trim() },
        ],
        model: this.defaultModel,
        ...config,
      });

      const suggestions = analysis.choices[0].message.content;

      if (suggestions.includes('No issues found')) {
        this.logInfo('Анализ завершен: изменения не требуются');
        return suggestions;
      }

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
            content: this.getPrompt('AUTOFIX'),
          },
          { role: 'user', content: fix },
        ],
        model: this.defaultModel,
        temperature: 0.1,
        max_tokens: 1024,
      });

      return verification.choices[0].message.content;
    } catch (error) {
      this.logWarning(`Пропуск изменения из-за ошибки верификации: ${fix}`);
      return 'SKIP';
    }
  }
}
