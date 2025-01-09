import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Provides an interface to interact with the Google Gemini API.
 */
export class GeminiProvider {
  /**
   * Creates a new GeminiProvider instance.
   * @param {string} apiKey - The API key for Google Gemini.
   * @param {string} [model='gemini-pro'] - The Gemini model to use.
   * @throws {Error} If the API key is not provided.
   */
  constructor(apiKey, model = 'gemini-pro') {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model });
  }

  /**
   * Analyzes the given content using the Gemini API.
   * @param {string} content - The content to analyze.
   * @returns {Promise<string>} The analyzed text response.
   * @throws {Error} If there is an error during the API call.
   */
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
