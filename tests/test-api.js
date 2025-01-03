const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../src/config/gemini.config");
const path = require('path');
const fs = require('fs');
const logger = require('../src/utils/logger'); // Внутренний импорт
const axios = require('axios'); // Внешний импорт

// Функция для проверки импортов
function analyzeImports() {
    const imports = [
        { module: 'path', type: 'external' },
        { module: 'fs', type: 'external' },
        { module: '../src/utils/logger', type: 'internal' },
        { module: 'axios', type: 'external' }
    ];

    imports.forEach(importItem => {
        if (importItem.type === 'external') {
            try {
                require.resolve(importItem.module);
                logger.log(`Зависимость ${importItem.module} установлена.`);
            } catch (e) {
                logger.error(`Зависимость ${importItem.module} не установлена.`);
            }
        } else {
            const importPath = path.resolve(__dirname, importItem.module);
            if (fs.existsSync(importPath + '.js')) {
                logger.log(`Внутренний импорт ${importItem.module} соответствует файловой структуре.`);
            } else {
                logger.error(`Внутренний импорт ${importItem.module} не соответствует файловой структуре.`);
            }
        }
    });
}

async function testGeminiAPI() {
  try {
    config.validate();

    console.log(
      "Проверка API ключа:",
      config.apiKey ? "***" + "*****".slice(-5) : "отсутствует",
    );

    const genAI = new GoogleGenerativeAI(config.apiKey);
    const model = genAI.getGenerativeModel({ model: config.modelName });

    const result = await model.generateContent("тест");
    const response = await result.response;

    console.log("Ответ API получен:", response ? "успешно" : "ошибка");
    return true;
  } catch (error) {
    console.error("Ошибка при тестировании API:", error.message);
    if (config.debug) {
      console.error("Детали ошибки:", error);
    }
    return false;
  }
}

analyzeImports();

module.exports = { testGeminiAPI };
