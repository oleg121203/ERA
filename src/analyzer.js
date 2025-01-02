const { ANALYSIS_TYPES, FORMATTERS } = require('./constants');
const { execSync } = require('child_process');

class CodeAnalyzer {
  constructor(chat) {
    this.chat = chat;
  }

  async analyze(code, options) {
    const results = [];
    const types = this.parseTypes(options.types);
    
    for (const { type, metrics } of types) {
      if (!ANALYSIS_TYPES[type]) {
        console.log(`Skipping unknown type: ${type}`);
        continue;
      }
      const analysis = await this.analyzeByType(code, type, metrics);
      results.push(analysis);
    }
    return results;
  }

  parseTypes(types) {
    if (!types || types.length === 0) {
      return [{ type: '--basic', metrics: {} }];
    }

    const analysisTypes = types.map(typeStr => {
      const [type, metricsStr] = typeStr.split(':');
      return {
        type: type.startsWith('--') ? type : `--${type}`,
        metrics: this.parseMetrics(metricsStr)
      };
    });

    // Проверяем наличие базового или глубокого анализа
    const hasBase = analysisTypes.some(t => 
      t.type === '--basic' || t.type === '--deep'
    );

    if (!hasBase) {
      analysisTypes.unshift({ type: '--basic', metrics: {} });
    }

    return analysisTypes;
  }

  parseMetrics(metricsStr) {
    if (!metricsStr) return {};

    // Используем регулярные выражения для парсинга метрик
    const regex = /(\w+)=(\d+)/g;
    const metrics = {};
    let match;
    while ((match = regex.exec(metricsStr)) !== null) {
      metrics[match[1]] = parseInt(match[2], 10);
    }
    return metrics;
  }

  async analyzeByType(code, type, metrics = {}) {
    const typeConfig = ANALYSIS_TYPES[type];
    
    // Применяем форматирование если есть конфигурация
    if (typeConfig.formatters) {
      for (const formatter of typeConfig.formatters) {
        const config = FORMATTERS[formatter];
        if (config) {
          try {
            execSync(`${config.command} ${config.args.join(' ')} ${this.getFilePath(code)}`);
          } catch (error) {
            console.warn(`Warning: Formatter ${formatter} failed:`, error.message);
          }
        }
      }
    }

    try {
      const prompt = this.buildPrompt(code, typeConfig, metrics);
      const result = await this.chat.sendMessage(prompt);
      return this.parseResult(result, type);
    } catch (error) {
      console.error(`Error in analyzeByType for type ${type}:`, error.message);
      return {
        type,
        analysis: 'Ошибка при анализе кода.',
        confidence: metrics.confidence || typeConfig.metrics.confidence.CERTAIN,
        impact: metrics.impact || typeConfig.metrics.impact.CRITICAL,
        priority: metrics.priority || typeConfig.metrics.priority.IMMEDIATE
      };
    }
  }

  getFilePath(code, specifiedPath) {
    // Позволяем пользователю указывать путь к файлу или определяем его из контекста
    return specifiedPath || 'src/main.js'; // Пример
  }

  buildPrompt(code, typeConfig, metrics = {}) {
    const prompt = [
      'Analyze the following code according to these criteria:',
      `Type: ${typeConfig.name}`,
      `Description: ${typeConfig.desc}`,
      `Analysis Depth: ${typeConfig.depth || 'standard'}`,
      '',
      'Metrics:',
      `- Confidence: ${metrics.confidence || typeConfig.metrics.confidence.CERTAIN}`,
      `- Impact: ${metrics.impact || typeConfig.metrics.impact.CRITICAL}`,
      `- Priority: ${metrics.priority || typeConfig.metrics.priority.IMMEDIATE}`,
      '',
      'Code to analyze:',
      '```javascript',
      code,
      '```',
      '',
      'Please provide analysis in this format:',
      '1. Overall quality score (0-100)',
      '2. List of identified issues',
      '3. Suggested improvements',
      '4. Specific recommendations',
      typeConfig.depth === 'deep' ? '5. Architecture and pattern recommendations' : ''
    ].join('\n');

    return prompt;
  }

  parseResult(result, type) {
    if (!result?.response) {
      throw new Error('Invalid analysis result');
    }

    const typeConfig = ANALYSIS_TYPES[type];
    return {
      type,
      analysis: result.response.text(),
      confidence: typeConfig.metrics.confidence.CERTAIN,
      impact: typeConfig.metrics.impact.CRITICAL,
      priority: typeConfig.metrics.priority.IMMEDIATE
    };
  }
}

module.exports = CodeAnalyzer;