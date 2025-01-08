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
}
