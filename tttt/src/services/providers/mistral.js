import { config } from 'dotenv';
import { OpenAI } from 'openai';
import logger from '../../utils/logger.js';
import { OpenAIBaseProvider } from './base-provider';

// Завантажуємо змінні середовища з файлу .env
config();

/* global process */

// const MODELS = {
//   DEFAULT: 'codestral-latest',
// };

const PROMPTS = {
  ANALYSIS: `You are a code analysis expert. Your task is to:
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
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY is not set in environment variables');
    }
    const customConfig = {
      OPENAI: {
        temperature: 0.5,
        max_tokens: 2048,
      },
    };

    super('MISTRAL', apiKey, 'https://codestral.mistral.ai/v1', PROMPTS, customConfig);
    const models = this.getModelConfig('MISTRAL');
    this.defaultModel = process.env.MISTRAL_MODEL || models.DEFAULT;
    this.client = new OpenAI({
      baseURL: 'https://codestral.mistral.ai/v1',
      apiKey: apiKey,
    });
  }

  async analyze(content) {
    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: PROMPTS.ANALYSIS,
          },
          { role: 'user', content },
        ],
        model: process.env.MISTRAL_MODEL || 'mistral-latest',
        temperature: 0.7,
        max_tokens: 2048,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      logger.error('Mistral API error:', error.message);
      throw new Error(`Mistral API error: ${error.message}`);
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
