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

export function generateAnalysisReport(results, suggestions) {
  const { summary, quality, fixes } = results;

  const report = [
    '\n=== Unified Analysis Report ===',
    '\nProject Summary:',
    `- Files analyzed: ${summary.totalFiles}`,
    `- Total lines of code: ${summary.totalLines}`,
    `- Components: ${summary.totalComponents}`,
    `- Services: ${summary.totalServices}`,
    `- Utilities: ${summary.totalUtils}`,
    `- Commands: ${summary.totalCommands}`,
    `- Coverage: ${quality.coverage}`,

    '\nCode Quality:',
    `- Errors: ${quality.errors}`,
    `- Warnings: ${quality.warnings}`,
    `- Fixable issues: ${quality.fixableIssues}`,
    `- Complexity Distribution:`,
    `  - High: ${quality.complexity.high}`,
    `  - Medium: ${quality.complexity.medium}`,
    `  - Low: ${quality.complexity.low}`,

    '\nAI Analysis Results:',
    `- Total suggestions: ${suggestions.length}`,
    `- Suggestions applied: ${fixes.applied}`,
    `- Files changed: ${fixes.filesChanged}`,

    '\nFixes Status:',
    `- Applied: ${fixes.applied}`,
    `- Pending: ${fixes.pending}`,
    `- Failed: ${fixes.failed}`,

    '\nInteractive Suggestions:',
  ];

  suggestions.forEach((suggestion, index) => {
    report.push(
      `${index + 1}. Suggestion ${index + 1}:`,
      `   - Explanation: ${suggestion.explanation}`,
      `   - Old Code: ${suggestion.oldCode}`,
      `   - New Code: ${suggestion.newCode}`,
      `   - Apply this change? (y/N): `
    );
  });

  report.push('\n=== End of Report ===');

  return report.join('\n');
}
