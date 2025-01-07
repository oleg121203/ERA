import OpenAI from "openai";

export class MistralProvider {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("MISTRAL_API_KEY is not set in environment variables");
    }
    
    this.client = new OpenAI({
      baseURL: process.env.CODESTRAL_API_BASE || "https://codestral.mistral.ai/v1",
      apiKey: apiKey,
      maxRetries: 3,
      timeout: 30000
    });
  }

  async analyze(content) {
    try {
      const requestData = {
        messages: [
          {
            role: "system",
            content: "You are a code analysis expert specialized in identifying code patterns, best practices, and potential improvements."
          },
          { 
            role: "user", 
            content: `Please analyze this code and provide detailed feedback:\n\n${content}`
          }
        ],
        model: "codestral-latest", // Изменено с mistral-tiny
        temperature: 0.7,
        max_tokens: 2048
      };

      console.debug("Отправляемые данные для анализа:", JSON.stringify(requestData, null, 2));

      const completion = await this.client.chat.completions.create(requestData);

      return completion.choices[0].message.content;
      
    } catch (error) {
      const errorDetails = error.response?.data || error.message;
      console.error("Mistral API error details:", error.response?.data || "No response body");
      throw new Error(`Mistral API error: ${errorDetails}`);
    }
  }
}
