export default {
  apiKeys: {
    gemini: process.env.GEMINI_API_KEY,
    mistral: process.env.MISTRAL_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
  },
  paths: {
    src: 'src/**/*.{js,json,md,py,css,html,sh,ts,tsx}',
  },
  providers: {
    default: 'mistral',
    supported: ['gemini', 'mistral', 'deepseek'],
  },
};
