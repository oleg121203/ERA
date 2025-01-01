const { ANALYSIS_TYPES } = require('./constants');

class CodeAnalyzer {
  constructor(chat) {
    this.chat = chat;
  }

  async analyze(code, options) {
    const results = [];
    
    for (const { type, metrics } of options.types) {
      const analysis = await this.analyzeByType(code, type, metrics);
      results.push(analysis);
    }

    return results;
  }

  async analyzeByType(code, type, metrics) {
    const typeConfig = ANALYSIS_TYPES[type];
    const prompt = this.buildPrompt(code, typeConfig, metrics);
    const result = await this.chat.sendMessage(prompt);
    return this.parseResult(result, type);
  }

  buildPrompt(code, typeConfig, metrics) {
    return `
      Проанализируй следующий код и предоставь отчет по следующим аспектам:
      ${typeConfig.name}
      Метрики:
      - Уверенность: ${metrics.confidence || typeConfig.metrics.confidence.CERTAIN}
      - Воздействие: ${metrics.impact || typeConfig.metrics.impact.CRITICAL}
      - Приоритет: ${metrics.priority || typeConfig.metrics.priority.IMMEDIATE}

      Код:
      ${code}

      Формат ответа:
      1. Краткое описание
      2. Найденные проблемы
      3. Рекомендации
    `;
  }

  parseResult(result, type) {
    return {
      type,
      analysis: result.response.text(),
      confidence: ANALYSIS_TYPES[type].metrics.confidence.CERTAIN,
      impact: ANALYSIS_TYPES[type].metrics.impact.CRITICAL,
      priority: ANALYSIS_TYPES[type].metrics.priority.IMMEDIATE
    };
  }
}

module.exports = CodeAnalyzer;
