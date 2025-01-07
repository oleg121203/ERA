import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider {
  constructor(apiKey, model = 'gemini-1.0-pro') {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model });
  }

  async analyze(content) {
    try {
      // Настраиваем параметры генерации
      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 2048,
      };

      // Создаем промпт для анализа
      const parts = [{ text: content }];
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig,
      });

      const response = await result.response;
      return response.text();
    } catch (error) {
      const errorMessage = error.response?.error?.message || error.message;
      throw new Error(`Gemini API error: ${errorMessage}`);
    }
  }
}
