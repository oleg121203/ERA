import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider {
  constructor(apiKey, model = 'gemini-pro') {  // изменена модель на gemini-pro
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model });
  }

  async analyze(content) {
    try {
      const result = await this.model.generateContent(content);
      return result.response.text();
    } catch (error) {
      const errorMessage = error.response?.error?.message || error.message;
      throw new Error(`Gemini API error: ${errorMessage}`);
    }
  }
}
