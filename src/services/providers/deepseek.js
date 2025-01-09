import { OpenAIBaseProvider } from './base-provider.js';

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
  }

  validateParams(params) {
    const validatedParams = { ...params };
    if (validatedParams.max_tokens > 4096) {
      this.logWarning('max_tokens превышает лимит, установлено 4096');
      validatedParams.max_tokens = 4096;
    }
    return validatedParams;
  }

  async analyze(content, useStream = false) {
    try {
      const config = { ...this.getConfig('OPENAI'), stream: useStream };
      const params = this.validateParams({
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

      if (useStream) {
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
      const stream = await this.analyze(content, true);
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
