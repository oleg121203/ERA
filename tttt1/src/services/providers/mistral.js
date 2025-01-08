import OpenAI from 'openai';

export class MistralProvider {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('MISTRAL_API_KEY is not set in environment variables');
    }
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
            content:
              'You are a code analysis expert specialized in identifying code patterns, best practices, and potential improvements.',
          },
          { role: 'user', content },
        ],
        model: 'codestral-latest',
        temperature: 0.7,
        max_tokens: 2048,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      throw new Error(`Mistral API error: ${error.message}`);
    }
  }
}
