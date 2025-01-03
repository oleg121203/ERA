const { testGeminiAPI } = require('./test-api');
const config = require('../src/config/gemini.config');
const fs = require('fs');
const path = require('path');

async function runTest() {
  try {
    // Проверяем наличие .env файла
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      console.log('Найден .env файл:', envPath);
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log('Содержимое .env:', envContent.replace(/=.*/g, '=***'));
    }

    console.log('Текущая директория:', process.cwd());
    console.log('Переменные окружения:', {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '***' + process.env.GEMINI_API_KEY.slice(-4) : 'отсутствует',
      DEBUG: process.env.DEBUG,
      NODE_ENV: process.env.NODE_ENV
    });
    
    const isValid = await testGeminiAPI();
    console.log('API статус:', isValid ? 'валиден' : 'невалиден');
  } catch (error) {
    console.error('Ошибка при тестировании:', error);
    process.exit(1);
  }
}

runTest().catch(console.error);