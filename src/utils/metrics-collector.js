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

  recordError(error) {
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

export function generateAnalysisReport(results) {
  const report = {
    // ...existing report object structure...
  };

  // Форматируем отчет с цветным выводом
  return `
${'\x1b[36m'}=== Отчет по анализу кода ERA ===${'\x1b[0m'}

${'\x1b[32m'}📊 Общая статистика:${'\x1b[0m'}
- Всего файлов: ${report.summary.totalFiles}
- Строк кода: ${report.summary.totalLines}
- Компонентов: ${report.summary.totalComponents}
- Сервисов: ${report.summary.totalServices}
- Утилит: ${report.summary.totalUtils}
- Команд: ${report.summary.totalCommands}

${'\x1b[33m'}🔍 Качество кода:${'\x1b[0m'}
- Ошибки: ${report.quality.errors}
- Предупреждения: ${report.quality.warnings}
- Исправимые проблемы: ${report.quality.fixableIssues}
- Покрытие тестами: ${report.quality.coverage}

${'\x1b[31m'}❗️ Критичные проблемы:${'\x1b[0m'}
${report.suggestions.critical.map((s) => `- ${s}`).join('\n')}

${'\x1b[33m'}⚠️ Важные улучшения:${'\x1b[0m'}
${report.suggestions.important.map((s) => `- ${s}`).join('\n')}

${'\x1b[36m'}=== Конец отчета ===${'\x1b[0m'}`;
}
