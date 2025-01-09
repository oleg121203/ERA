import OpenAI from 'openai';

export class DeepSeekProvider {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not set in environment variables');
    }
    this.client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey,
    });
  }

  async analyze(content) {
    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are a code analysis expert. Analyze the following code and provide detailed feedback.',
          },
          { role: 'user', content },
        ],
        model: 'deepseek-chat',
        temperature: 0.7,
        max_tokens: 2048,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      // Добавляем обработку специфических ошибок
      if (error.message.includes('402') || error.message.includes('Insufficient Balance')) {
        throw new Error(
          'DeepSeek API error: Недостаточно средств на балансе. Пополните баланс или используйте другого провайдера.'
        );
      }
      throw new Error(`DeepSeek API error: ${error.message}`);
    }
  }
}
