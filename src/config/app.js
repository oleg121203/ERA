export default {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  jwtSecret: process.env.JWT_SECRET,
  // Добавляем настройки для Mistral
  mistralApiKey: process.env.CODESTRAL_API_KEY,
  mistralApiBase: process.env.CODESTRAL_API_BASE || 'https://codestral.mistral.ai/v1',
  reports: {
    enabled: true,
    outputPath: process.env.REPORT_OUTPUT_PATH || './reports',
    format: process.env.REPORT_FORMAT || 'text',
  },
};
