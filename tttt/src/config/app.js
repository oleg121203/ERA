const defaultConfig = {
  port: 3000,
  env: 'development',
  apiVersion: 'v1',
  jwtSecret: undefined,
  mistralApiKey: undefined,
  mistralApiBase: 'https://codestral.mistral.ai/v1',
  reports: {
    enabled: true,
    outputPath: './reports',
    format: 'text',
  },
};

const config = { ...defaultConfig };

if (typeof process !== 'undefined' && process.env) {
    config.port = process.env.PORT || defaultConfig.port;
    config.env = process.env.NODE_ENV || defaultConfig.env;
    config.apiVersion = process.env.API_VERSION || defaultConfig.apiVersion;
    config.jwtSecret = process.env.JWT_SECRET;
    config.mistralApiKey = process.env.CODESTRAL_API_KEY;
    config.mistralApiBase = process.env.CODESTRAL_API_BASE || defaultConfig.mistralApiBase;
    config.reports.outputPath = process.env.REPORT_OUTPUT_PATH || defaultConfig.reports.outputPath;
    config.reports.format = process.env.REPORT_FORMAT || defaultConfig.reports.format;
}


export default config;
