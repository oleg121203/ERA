import prometheus from 'prom-client';

export class MetricsCollector {
  constructor() {
    // Регистрируем метрики
    this.agentOperations = new prometheus.Counter({
      name: 'era_agent_operations_total',
      help: 'Total number of agent operations',
      labelNames: ['agent', 'operation'],
    });

    this.analysisResults = new prometheus.Gauge({
      name: 'era_analysis_results',
      help: 'Analysis results metrics',
      labelNames: ['type', 'metric'],
    });

    this.providerRetries = new prometheus.Counter({
      name: 'era_provider_retries_total',
      help: 'Total number of retries for providers',
      labelNames: ['provider'],
    });

    this.providerErrors = new prometheus.Gauge({
      name: 'era_provider_errors',
      help: 'Number of errors per provider',
      labelNames: ['provider'],
    });

    this.reportMetrics = new prometheus.Gauge({
      name: 'era_report_metrics',
      help: 'Report analysis metrics',
      labelNames: ['category', 'metric'],
    });
  }

  incrementAgentOperations(agent, operation) {
    this.agentOperations.inc({ agent, operation });
  }

  recordAnalysis(results) {
    Object.entries(results).forEach(([type, value]) => {
      this.analysisResults.set({ type, metric: 'value' }, value);
    });
  }

  recordError() {
    this.analysisResults.set({ type: 'error', metric: 'count' }, 1);
  }

  incrementProviderRetries(provider) {
    this.providerRetries.inc({ provider });
  }

  setProviderErrors(provider, count) {
    this.providerErrors.set({ provider }, count);
  }

  recordReportMetrics(report) {
    Object.entries(report.summary).forEach(([key, value]) => {
      this.reportMetrics.set({ category: 'summary', metric: key }, value);
    });

    Object.entries(report.quality).forEach(([key, value]) => {
      if (typeof value === 'number') {
        this.reportMetrics.set({ category: 'quality', metric: key }, value);
      }
    });
  }
}

/**
 * Generates a formatted analysis report.
 * @param {object} results - An object containing analysis results with 'summary', 'quality', 'suggestions', and 'fixes' properties.
 * @throws {Error} If the results object does not contain a 'summary' property.
 */
export function generateAnalysisReport(results) {
  if (!results?.summary) {
    throw new Error('Invalid analysis results structure');
  }

  const { summary, quality, suggestions, fixes } = results;

  return `
${'\x1b[36m'}=== Отчет по анализу кода ERA ===${'\x1b[0m'}

${'\x1b[32m'}📊 Общая статистика:${'\x1b[0m'}
- Всего файлов: ${summary.totalFiles}
- Строк кода: ${summary.totalLines}
- Компонентов: ${summary.totalComponents}
- Сервисов: ${summary.totalServices}
- Утилит: ${summary.totalUtils}
- Команд: ${summary.totalCommands}

${'\x1b[33m'}🔍 Качество кода:${'\x1b[0m'}
- Ошибки: ${quality.errors}
- Предупреждения: ${quality.warnings}
- Исправимые проблемы: ${quality.fixableIssues}
- Покрытие тестами: ${quality.coverage}

${'\x1b[33m'}Сложность:${'\x1b[0m'}
- Высокая: ${quality.complexity.high} файлов
- Средняя: ${quality.complexity.medium} файлов
- Низкая: ${quality.complexity.low} файлов

${'\x1b[31m'}❗️ Критичные проблемы:${'\x1b[0m'}
${(suggestions.critical || []).map((s) => `- ${s}`).join('\n')}

${'\x1b[33m'}⚠️ Важные улучшения:${'\x1b[0m'}
${(suggestions.important || []).map((s) => `- ${s}`).join('\n')}

${'\x1b[33m'}📝 Незначительные замечания:${'\x1b[0m'}
${(suggestions.minor || []).map((s) => `- ${s}`).join('\n')}

${'\x1b[33m'}🔧 Статус исправлений:${'\x1b[0m'}
- Применено: ${fixes.applied}
- Ожидает: ${fixes.pending}
- Не удалось: ${fixes.failed}

${'\x1b[36m'}=== Конец отчета ===${'\x1b[0m'}`;
}
