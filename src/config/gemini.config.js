const path = require('path');
const dotenv = require('dotenv');

// Загружаем .env файл из корня проекта
const result = dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (result.error) {
  console.error('Ошибка загрузки .env файла:', result.error.message);
}

const config = {
  apiKey: process.env.GEMINI_API_KEY,
  modelName: 'gemini-pro',
  endpoint: 'https://generativelanguage.googleapis.com/v1beta',
  debug: process.env.DEBUG === 'true',
  
  validate() {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY не установлен');
    }
    return true;
  },

  getApiUrl(model = 'gemini-pro') {
    return `${this.endpoint}/models/${model}:generateContent?key=${this.apiKey}`;
  }
};

module.exports = config;
